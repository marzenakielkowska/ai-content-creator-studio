#!/usr/bin/env python3
"""
overlay-image: nakłada zdjęcia/screenshoty na wideo z animacją pop-in.

Użycie: python3 overlay_image.py <wideo_wej> <config.json> <wyjście.mp4>

Format config.json:
{
  "fps": 30,                         (opcjonalnie, domyślnie 30)
  "overlays": [
    {
      "image":      "/ścieżka/do/zdjecia.jpg",
      "appear_t":   0.35,            sekundy od początku wideo
      "cx":         540,             środek X w kadrze (piksele)
      "cy":         900,             środek Y w kadrze (piksele) — NIGDY na twarzy
      "width":      780,             szerokość po skalowaniu (px)
      "angle":      -3,              obrót w stopniach (opcjonalnie, domyślnie 0)
      "anim_dur":   0.15,            czas animacji pop-in (opcjonalnie, domyślnie 0.15)
      "red_circle": {                (opcjonalnie) czerwone kółko markera
        "cx": 155, "cy": 115,        pozycja w obrazku (po skalowaniu, bez paddingu)
        "rx": 135, "ry": 55          półosie elipsy
      },
      "red_delay":  0.30             opóźnienie kółka po wejściu screena (opcjonalnie, domyślnie 0.30)
    }
  ],
  "snap_sound":  true                (opcjonalnie, domyślnie true) — dźwięk kliknięcia
}
"""
import json, subprocess, sys, time, os

# Wczytaj Pillow — sprawdzaj folder Studio (instalowany przez /studio:start) i ścieżki użytkownika
_studio_home = os.environ.get('AI_STUDIO_HOME', os.path.expanduser('~/.ai-content-studio'))
for _p in [
    os.path.join(_studio_home, 'python-packages'),   # zainstalowany przez /studio:start
    os.path.expanduser('~/Library/Python/3.9/lib/python/site-packages'),
    os.path.expanduser('~/Library/Python/3.10/lib/python/site-packages'),
    os.path.expanduser('~/Library/Python/3.11/lib/python/site-packages'),
    os.path.expanduser('~/Library/Python/3.12/lib/python/site-packages'),
    os.path.expanduser('~/.local/lib/python3.9/site-packages'),
    os.path.expanduser('~/.local/lib/python3.10/site-packages'),
    os.path.expanduser('~/.local/lib/python3.11/site-packages'),
    os.path.expanduser('~/.local/lib/python3.12/site-packages'),
]:
    if os.path.isdir(_p) and _p not in sys.path:
        sys.path.insert(0, _p)

try:
    from PIL import Image, ImageDraw
except ImportError:
    print("STATUS blad Pillow nie jest zainstalowany - uruchom /studio:start", flush=True)
    sys.exit(1)

# ---------- argumenty ----------

if len(sys.argv) < 4:
    print("STATUS blad uzycie: overlay_image.py <wideo_wej> <config.json> <wyjscie.mp4>", flush=True)
    sys.exit(1)

WIDEO_WEJ = sys.argv[1]
CONFIG_PLIK = sys.argv[2]
WYJSCIE = sys.argv[3]

if not os.path.isfile(WIDEO_WEJ):
    print(f"STATUS blad plik wideo nie istnieje: {WIDEO_WEJ}", flush=True)
    sys.exit(1)
if not os.path.isfile(CONFIG_PLIK):
    print(f"STATUS blad plik config nie istnieje: {CONFIG_PLIK}", flush=True)
    sys.exit(1)

try:
    cfg = json.loads(open(CONFIG_PLIK, encoding='utf-8').read())
except Exception as e:
    print(f"STATUS blad nie mozna odczytac config.json: {e}", flush=True)
    sys.exit(1)

FPS = int(cfg.get('fps', 30))
SNAP = cfg.get('snap_sound', True)
overlays_raw = cfg.get('overlays', [])

if not overlays_raw:
    print("STATUS blad config.json nie zawiera overlays[]", flush=True)
    sys.exit(1)

# ---------- wykryj ffmpeg ----------

def znajdz_ffmpeg():
    dom = os.path.expanduser('~/.ai-content-studio')
    kandydaci = [
        os.path.join(dom, 'ffmpeg', 'ffmpeg'),
        '/opt/homebrew/bin/ffmpeg',
        '/usr/local/bin/ffmpeg',
        'ffmpeg',
    ]
    for k in kandydaci:
        r = subprocess.run([k, '-version'], capture_output=True, timeout=10)
        if r.returncode == 0:
            return k
    return None

FFMPEG = znajdz_ffmpeg()
if not FFMPEG:
    print("STATUS blad ffmpeg nie znaleziony - uruchom /studio:start", flush=True)
    sys.exit(1)

# ---------- wymiary wideo ----------

def wymiary_wideo(sciezka):
    r = subprocess.run(
        [FFMPEG.replace('ffmpeg', 'ffprobe') if 'ffprobe' not in FFMPEG else FFMPEG,
         '-v', 'quiet', '-print_format', 'json', '-show_streams', sciezka],
        capture_output=True, text=True, timeout=30
    )
    # fallback: ffprobe obok ffmpeg
    if r.returncode != 0:
        ffprobe = FFMPEG.replace('/ffmpeg', '/ffprobe')
        r = subprocess.run(
            [ffprobe, '-v', 'quiet', '-print_format', 'json', '-show_streams', sciezka],
            capture_output=True, text=True, timeout=30
        )
    if r.returncode != 0:
        return None, None
    import json as _j
    data = _j.loads(r.stdout)
    for s in data.get('streams', []):
        if s.get('codec_type') == 'video':
            return int(s['width']), int(s['height'])
    return None, None

W, H = wymiary_wideo(WIDEO_WEJ)
if not W:
    print("STATUS blad nie udalo sie odczytac wymiarow wideo", flush=True)
    sys.exit(1)

FRAME_BYTES = W * H * 3
print(f"KROK start wideo={W}x{H} fps={FPS} overlays={len(overlays_raw)}", flush=True)

# ---------- animacja ----------

def ease_out_back(t):
    c3 = 2.70158
    return 1 + c3 * (t - 1)**3 + 1.70158 * (t - 1)**2


# ---------- przygotowanie obrazków ----------

def prepare_overlay(ov):
    path_img = ov['image']
    if not os.path.isfile(path_img):
        print(f"STATUS blad obrazek nie istnieje: {path_img}", flush=True)
        sys.exit(1)

    target_w = int(ov.get('width', 600))
    img = Image.open(path_img).convert('RGB')
    scale = target_w / img.width
    new_h = int(img.height * scale)
    img = img.resize((target_w, new_h), Image.LANCZOS)

    # Zaokrąglone narożniki
    mask = Image.new('L', (target_w, new_h), 0)
    ImageDraw.Draw(mask).rounded_rectangle([0, 0, target_w, new_h], radius=22, fill=255)
    img_rgba = img.convert('RGBA')
    img_rgba.putalpha(mask)

    # Padding na cień
    PAD = 14
    result_w = target_w + PAD * 2
    result_h = new_h + PAD * 2
    result = Image.new('RGBA', (result_w, result_h), (0, 0, 0, 0))
    ImageDraw.Draw(result).rounded_rectangle(
        [PAD + 5, PAD + 5, PAD + target_w + 5, PAD + new_h + 5],
        radius=22, fill=(0, 0, 0, 55)
    )
    result.paste(img_rgba, (PAD, PAD), img_rgba)

    # Czerwone kółko markera
    rc = ov.get('red_circle')
    result_circle = result.copy()
    if rc:
        ecx = PAD + int(rc['cx'])
        ecy = PAD + int(rc['cy'])
        erx = int(rc['rx'])
        ery = int(rc['ry'])
        d = ImageDraw.Draw(result_circle)
        offsets = [(0, 0), (5, -3), (-3, 5), (4, 4), (-5, -3)]
        for i, (dx, dy) in enumerate(offsets):
            alpha = int(180 - i * 10)
            d.ellipse([ecx-erx+dx, ecy-ery+dy, ecx+erx+dx, ecy+ery+dy],
                      outline=(210, 28, 28, alpha), width=10)
        d.ellipse([ecx-erx+2, ecy-ery+2, ecx+erx+2, ecy+ery+2],
                  outline=(210, 28, 28, 95), width=4)

    angle = float(ov.get('angle', 0))
    if angle != 0:
        result        = result.rotate(angle, expand=True, resample=Image.BICUBIC)
        result_circle = result_circle.rotate(angle, expand=True, resample=Image.BICUBIC)

    return {
        'appear_t':   float(ov.get('appear_t', 0)),
        'cx':         int(ov['cx']),
        'cy':         int(ov['cy']),
        'anim_dur':   float(ov.get('anim_dur', 0.15)),
        'red_delay':  float(ov.get('red_delay', 0.30)),
        'no_circle':  result,
        'circle':     result_circle,
        'has_circle': rc is not None,
    }


print("KROK przygotowanie-obrazkow start", flush=True)
prepped = [prepare_overlay(ov) for ov in overlays_raw]
print("KROK przygotowanie-obrazkow gotowe", flush=True)


# ---------- paste ze skalowaniem ----------

def paste_scaled(canvas, img, cx, cy, scale, alpha):
    if scale < 0.02 or alpha < 0.02:
        return
    nw = max(1, int(img.width * scale))
    nh = max(1, int(img.height * scale))
    sc = img.resize((nw, nh), Image.BICUBIC)
    if alpha < 0.999:
        r, g, b, a = sc.split()
        a2 = a.point(lambda x: int(x * alpha))
        sc = Image.merge('RGBA', (r, g, b, a2))
    canvas.paste(sc, (cx - nw // 2, cy - nh // 2), sc)


# ---------- render wideo (bez audio) ----------

TEMP_V = WYJSCIE + '.tmp_noaudio.mp4'

print("KROK render-wideo start", flush=True)
t0 = time.time()

reader = subprocess.Popen(
    [FFMPEG, '-i', WIDEO_WEJ, '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'],
    stdout=subprocess.PIPE, stderr=subprocess.DEVNULL
)
writer = subprocess.Popen(
    [FFMPEG, '-y',
     '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-',
     '-i', WIDEO_WEJ,
     '-map', '0:v', '-map', '1:a',
     '-c:v', 'libx264', '-preset', 'fast', '-crf', '18',
     '-c:a', 'aac', '-b:a', '192k',
     '-pix_fmt', 'yuv420p', '-movflags', '+faststart', TEMP_V],
    stdin=subprocess.PIPE, stderr=subprocess.DEVNULL
)

fn = 0
while True:
    raw = reader.stdout.read(FRAME_BYTES)
    if len(raw) < FRAME_BYTES:
        break
    t = fn / FPS
    canvas = Image.frombytes('RGB', (W, H), raw).convert('RGBA')

    for p in prepped:
        at = p['appear_t']
        dt = t - at
        if dt < 0:
            continue
        if dt < p['anim_dur']:
            raw_t = dt / p['anim_dur']
            scale = max(0.0, min(1.15, ease_out_back(raw_t)))
            alpha = raw_t
        else:
            scale, alpha = 1.0, 1.0

        img = p['circle'] if (p['has_circle'] and t >= at + p['red_delay']) else p['no_circle']
        paste_scaled(canvas, img, p['cx'], p['cy'], scale, alpha)

    try:
        writer.stdin.write(canvas.convert('RGB').tobytes())
    except BrokenPipeError:
        break
    fn += 1

reader.stdout.close(); reader.wait()
writer.stdin.close(); writer.wait()
print(f"KROK render-wideo gotowe ({fn} klatek)", flush=True)


# ---------- dodaj dźwięki snap ----------

if SNAP and prepped:
    print("KROK snap-dzwieki start", flush=True)
    audio_in, labels = [], []
    for i, p in enumerate(prepped):
        ms = int(p['appear_t'] * 1000)
        freq = 880 + i * 100
        expr = f"sin(2*PI*{freq}*t)*0.32*exp(-22*t)"
        audio_in += ['-f', 'lavfi', '-i',
                     f"aevalsrc='{expr}:c=stereo:s=44100:d=0.18',adelay={ms}|{ms}"]
        labels.append(f"[{i+1}:a]")

    filt = "[0:a]" + "".join(labels) + f"amix=inputs={len(prepped)+1}:duration=first:normalize=0[aout]"
    cmd = [FFMPEG, '-y', '-i', TEMP_V] + audio_in + [
        '-filter_complex', filt,
        '-map', '0:v', '-map', '[aout]',
        '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k',
        '-movflags', '+faststart', WYJSCIE
    ]
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode == 0 and os.path.isfile(WYJSCIE):
        print("KROK snap-dzwieki gotowe", flush=True)
    else:
        import shutil
        shutil.copy(TEMP_V, WYJSCIE)
        print("KROK snap-dzwieki blad dzwiek-niedostepny-uzywam-wideo-bez-dzwieku", flush=True)
else:
    import shutil
    shutil.copy(TEMP_V, WYJSCIE)

try:
    os.remove(TEMP_V)
except Exception:
    pass

rozmiar_mb = os.path.getsize(WYJSCIE) / 1024 / 1024 if os.path.isfile(WYJSCIE) else 0
czas_s = int(time.time() - t0)
print(f"STATUS overlay-image OK plik={WYJSCIE} rozmiar={rozmiar_mb:.0f}MB czas={czas_s}s", flush=True)
