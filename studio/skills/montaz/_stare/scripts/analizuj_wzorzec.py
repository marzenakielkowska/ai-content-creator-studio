#!/usr/bin/env python3
"""
analizuj-wzorzec: mierzy parametry rolki wzorcowej i buduje arkusze klatek.

Użycie: python3 analizuj_wzorzec.py <wideo> <folder-wyjscia>

Wyniki w folderze:
  arkusz_01.jpg, arkusz_02.jpg ...  — siatki klatek co 0.5s (4 kolumny × 5 wierszy)
  ciecia.jpg                         — klatki przy każdym cięciu montażowym
  ruch_01.jpg, ruch_02.jpg ...       — pasy klatek wokół nagłych zmian (wejścia grafik)
  pomiary.json                       — zmierzone liczby: fps, długość, cięcia, ruch, głośność

Format pomiary.json:
  szerokosc_px, wysokosc_px, fps, dlugosc_s
  ciecia_s          — lista timestampów cięć (sekundy)
  sredni_odstep_s   — średni czas między cięciami
  momenty_ruchu_s   — nagłe zmiany klatki (wejścia napisów / grafik)
  srednia_glosnosc_db, szczyt_glosnosc_db
  szczyty_dzwieku_s — nagłe wzrosty głośności ≥10 dB (uderzenia, akcenty)
"""

import array
import json
import math
import os
import shutil
import subprocess
import sys
import time

# ---------- Pillow — sprawdź folder Studio, potem ścieżki systemowe ----------

_dom_studio = os.environ.get('AI_STUDIO_HOME', os.path.expanduser('~/.ai-content-studio'))
for _p in [
    os.path.join(_dom_studio, 'python-packages'),
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
    from PIL import Image, ImageDraw, ImageFont
except ImportError:
    print("STATUS blad Pillow nie jest zainstalowany — uruchom /studio:start", flush=True)
    sys.exit(1)

# ---------- argumenty ----------

if len(sys.argv) < 3:
    print("STATUS blad uzycie: analizuj_wzorzec.py <wideo> <folder-wyjscia>", flush=True)
    sys.exit(1)

WIDEO = sys.argv[1]
FOLDER = sys.argv[2]

JEST_URL = WIDEO.startswith('http://') or WIDEO.startswith('https://')

if not JEST_URL and not os.path.isfile(WIDEO):
    print(f"STATUS blad plik wideo nie istnieje: {WIDEO}", flush=True)
    sys.exit(1)

os.makedirs(FOLDER, exist_ok=True)

# ---------- ffmpeg ----------

def _znajdz_narzedziowe(nazwa):
    dom = os.path.expanduser('~/.ai-content-studio')
    kandydaci = [
        os.path.join(dom, 'ffmpeg', nazwa),
        f'/opt/homebrew/bin/{nazwa}',
        f'/usr/local/bin/{nazwa}',
        nazwa,
    ]
    for k in kandydaci:
        try:
            r = subprocess.run([k, '-version'], capture_output=True, timeout=10)
            if r.returncode == 0:
                return k
        except (FileNotFoundError, subprocess.TimeoutExpired):
            continue
    return None

FFMPEG = _znajdz_narzedziowe('ffmpeg')
if not FFMPEG:
    print("STATUS blad ffmpeg nie znaleziony — uruchom /studio:start", flush=True)
    sys.exit(1)

# ffprobe obok ffmpeg lub osobno
_katalog_ff = os.path.dirname(FFMPEG) if os.path.dirname(FFMPEG) else ''
FFPROBE = (os.path.join(_katalog_ff, 'ffprobe')
           if _katalog_ff and os.path.isfile(os.path.join(_katalog_ff, 'ffprobe'))
           else _znajdz_narzedziowe('ffprobe') or 'ffprobe')

NULL = 'NUL' if os.name == 'nt' else '/dev/null'


def uruchom(args, timeout=60, stdin=None):
    """Uruchamia polecenie. Zwraca (ok, stdout_bytes, stderr_bytes)."""
    try:
        r = subprocess.run(args, capture_output=True, timeout=timeout, input=stdin)
        return r.returncode == 0, r.stdout, r.stderr
    except FileNotFoundError:
        return False, b'', b'nie znaleziono polecenia'
    except subprocess.TimeoutExpired:
        return False, b'', b'timeout'


# ---------- parametry wideo ----------

def zbadaj_wideo(sciezka):
    ok, out, _ = uruchom(
        [FFPROBE, '-v', 'quiet', '-print_format', 'json',
         '-show_streams', '-show_format', sciezka],
        timeout=30,
    )
    if not ok:
        return None
    try:
        dane = json.loads(out.decode('utf-8', errors='replace'))
    except Exception:
        return None

    wynik = {}
    for s in dane.get('streams', []):
        if s.get('codec_type') == 'video':
            wynik['szerokosc'] = int(s.get('width', 0))
            wynik['wysokosc'] = int(s.get('height', 0))
            fps_str = s.get('r_frame_rate', '30/1')
            try:
                a, b = fps_str.split('/')
                wynik['fps'] = round(int(a) / max(int(b), 1), 3)
            except Exception:
                wynik['fps'] = 30.0
            break

    fmt = dane.get('format', {})
    wynik['dlugosc_s'] = float(fmt.get('duration', 0))
    return wynik if wynik.get('szerokosc') else None


# ---------- arkusze klatek ----------

KOLS = 4
MINI_W = 270
MINI_H = 480


def _czcionka(rozmiar):
    sciezki = [
        '/System/Library/Fonts/Helvetica.ttc',
        '/System/Library/Fonts/Supplemental/Arial.ttf',
        '/System/Library/Fonts/SFNSMono.ttf',
        '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',
    ]
    for sc in sciezki:
        if os.path.isfile(sc):
            try:
                return ImageFont.truetype(sc, rozmiar)
            except Exception:
                continue
    return ImageFont.load_default()


def _ts(sekundy):
    m = int(sekundy // 60)
    s = sekundy - m * 60
    return f"{m}:{s:04.1f}"


def zbuduj_arkusze(klatki_lista, folder, prefix='arkusz'):
    """
    klatki_lista: [(timestamp_s, sciezka_jpg), ...]
    Buduje arkusze 4×5 = 20 miniatur, zapisuje do folderu.
    """
    WIERSZE = 5
    NA_STRONE = KOLS * WIERSZE
    czcionka = _czcionka(18)
    czcionka_mala = _czcionka(15)
    nagl_h = 38
    ark_w = KOLS * MINI_W
    ark_h = nagl_h + WIERSZE * (MINI_H + 24)

    arkusze = []
    for nr, start in enumerate(range(0, len(klatki_lista), NA_STRONE), 1):
        plasterek = klatki_lista[start:start + NA_STRONE]
        if not plasterek:
            break
        ark = Image.new('RGB', (ark_w, ark_h), (15, 15, 18))
        d = ImageDraw.Draw(ark)

        t_od = _ts(plasterek[0][0])
        t_do = _ts(plasterek[-1][0])
        naz = os.path.basename(WIDEO)
        d.text((8, 9), f"{naz}   str. {nr}   {t_od} – {t_do}", font=czcionka, fill=(170, 170, 175))

        for i, (ts, sc) in enumerate(plasterek):
            row = i // KOLS
            col = i % KOLS
            x = col * MINI_W
            y = nagl_h + row * (MINI_H + 24)
            try:
                img = Image.open(sc).resize((MINI_W, MINI_H), Image.LANCZOS)
                ark.paste(img, (x, y))
            except Exception:
                d.rectangle([x, y, x + MINI_W, y + MINI_H], fill=(35, 35, 40))
            d.text((x + 5, y + MINI_H + 4), _ts(ts), font=czcionka_mala, fill=(100, 200, 120))

        sc_ark = os.path.join(folder, f"{prefix}_{nr:02d}.jpg")
        ark.save(sc_ark, quality=85)
        arkusze.append(sc_ark)

    return arkusze


# ---------- wykrywanie cięć ----------

def wykryj_ciecia(wideo, prog=0.32):
    """
    Używa ffmpeg scene filter do lokalizacji cięć montażowych.
    Zwraca listę timestampów (float sekund).
    """
    ok, _, err = uruchom(
        [FFMPEG, '-i', wideo,
         '-vf', f"select='gt(scene,{prog})',metadata=print",
         '-vsync', 'vfr', '-an', '-f', 'null', NULL],
        timeout=300,
    )
    tekst = err.decode('utf-8', errors='replace')
    ciecia = []
    for linia in tekst.split('\n'):
        if 'pts_time:' in linia:
            try:
                idx = linia.index('pts_time:')
                val = linia[idx + 9:].split()[0]
                ciecia.append(round(float(val), 3))
            except (ValueError, IndexError):
                continue
    return sorted(set(ciecia))


def klatki_przy_cieciach(wideo, ciecia, folder):
    """Buduje ciecia.jpg — jedna klatka przy każdym cięciu."""
    if not ciecia:
        return None
    temp = []
    for i, ts in enumerate(ciecia[:24]):
        sc = os.path.join(folder, f"_c_{i:03d}.jpg")
        ok, _, _ = uruchom(
            [FFMPEG, '-y', '-ss', str(ts), '-i', wideo,
             '-frames:v', '1', '-q:v', '3',
             '-vf', f'scale={MINI_W}:{MINI_H}:force_original_aspect_ratio=increase,crop={MINI_W}:{MINI_H}',
             sc],
            timeout=20,
        )
        if ok and os.path.isfile(sc):
            temp.append((ts, sc))

    if not temp:
        return None

    wynik = zbuduj_arkusze(temp, folder, prefix='ciecia')
    for _, sc in temp:
        try:
            os.remove(sc)
        except OSError:
            pass
    return wynik[0] if wynik else None


# ---------- wykrywanie ruchu / wejść grafik ----------

def wykryj_ruch(wideo, min_odst_s=0.5):
    """
    Pobiera klatki w 5fps (skala 128×72), liczy zmiany średniej jasności.
    Próg adaptacyjny: mediana_zmian × 3.0 (min. 8 jednostek).
    Zwraca listę timestampów nagłych zmian (float sekund).
    """
    ok, out, _ = uruchom(
        [FFMPEG, '-i', wideo,
         '-vf', 'fps=5,scale=128:72:force_original_aspect_ratio=decrease,pad=128:72:0:0',
         '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'],
        timeout=180,
    )
    if not ok or len(out) < 128 * 72 * 3:
        return []

    BAJTY = 128 * 72 * 3
    KROK_S = 0.2  # 1/5fps

    def jasnosc(klatka):
        # Subsampling co 6 bajtów (co 2 piksele) — szybki przybliżony luma
        suma = 0
        for i in range(0, len(klatka) - 2, 6):
            suma += (klatka[i] * 77 + klatka[i + 1] * 150 + klatka[i + 2] * 29) >> 8
        n = len(klatka) // 6
        return suma / n if n else 0.0

    jasnosci = []
    offset = 0
    while offset + BAJTY <= len(out):
        jasnosci.append(jasnosc(out[offset:offset + BAJTY]))
        offset += BAJTY

    if len(jasnosci) < 3:
        return []

    roznice = [abs(jasnosci[i] - jasnosci[i - 1]) for i in range(1, len(jasnosci))]
    posortowane = sorted(roznice)
    mediana = posortowane[len(posortowane) // 2]
    prog = max(8.0, mediana * 3.0)

    momenty = []
    ostatni = -999.0
    for i, diff in enumerate(roznice):
        ts = round((i + 1) * KROK_S, 2)
        if diff >= prog and (ts - ostatni) >= min_odst_s:
            momenty.append(ts)
            ostatni = ts

    return momenty


def arkusze_ruchu(wideo, momenty, folder, max_grup=8):
    """Buduje ruch_NN.jpg — 8 klatek ±0.35s wokół każdego momentu."""
    wyniki = []
    offsets = [-0.35, -0.25, -0.15, -0.05, 0.05, 0.15, 0.25, 0.40]
    for nr, ts in enumerate(momenty[:max_grup], 1):
        temp = []
        for j, off in enumerate(offsets):
            t2 = max(0.0, round(ts + off, 3))
            sc = os.path.join(folder, f"_r{nr:02d}_{j}.jpg")
            ok, _, _ = uruchom(
                [FFMPEG, '-y', '-ss', str(t2), '-i', wideo,
                 '-frames:v', '1', '-q:v', '3',
                 '-vf', f'scale={MINI_W}:{MINI_H}:force_original_aspect_ratio=increase,crop={MINI_W}:{MINI_H}',
                 sc],
                timeout=15,
            )
            if ok and os.path.isfile(sc):
                temp.append((t2, sc))

        if len(temp) >= 4:
            wyniki.extend(zbuduj_arkusze(temp, folder, prefix=f'ruch_{nr:02d}'))
        for _, sc in temp:
            try:
                os.remove(sc)
            except OSError:
                pass
    return wyniki


# ---------- pomiar głośności ----------

def zmierz_glosnosc(wideo, okno_s=0.1, czest=8000):
    """
    Wyciąga PCM mono s16le, oblicza RMS dB w oknach co okno_s sekund.
    Zwraca (lista_db, srednia_db, szczyt_db, lista_skokow_s).
    Skok: wzrost o ≥10 dB względem poprzedniego okna.
    """
    ok, out, _ = uruchom(
        [FFMPEG, '-i', wideo,
         '-f', 's16le', '-ac', '1', '-ar', str(czest), '-'],
        timeout=180,
    )
    if not ok or len(out) < 200:
        return [], -60.0, -60.0, []

    probki_na_okno = int(czest * okno_s)
    bajty_na_okno = probki_na_okno * 2  # s16le = 2 bajty na próbkę
    n_okien = len(out) // bajty_na_okno

    lista_db = []
    for i in range(n_okien):
        seg = out[i * bajty_na_okno:(i + 1) * bajty_na_okno]
        arr = array.array('h')
        arr.frombytes(seg[:len(seg) - (len(seg) % 2)])
        if not arr:
            lista_db.append(-80.0)
            continue
        suma_kw = sum(v * v for v in arr)
        rms = math.sqrt(suma_kw / len(arr))
        db = 20.0 * math.log10(rms / 32768.0) if rms > 0 else -80.0
        lista_db.append(round(db, 1))

    if not lista_db:
        return [], -60.0, -60.0, []

    srednia = round(sum(lista_db) / len(lista_db), 1)
    szczyt = round(max(lista_db), 1)

    skoki = []
    for i in range(1, len(lista_db)):
        if lista_db[i] - lista_db[i - 1] >= 10.0:
            skoki.append(round(i * okno_s, 2))

    return lista_db, srednia, szczyt, skoki


# ---------- główna pętla ----------

t0 = time.time()

# Jeśli podano URL — pobierz raz do pliku tymczasowego, potem usuń
_PLIK_TMP = None
if JEST_URL:
    _PLIK_TMP = os.path.join(FOLDER, '_wideo_tmp.mp4')
    print(f"KROK pobieranie-wideo start ({WIDEO[:60]}...)", flush=True)
    ok_dl, _, err_dl = uruchom(
        [FFMPEG, '-y', '-i', WIDEO, '-c', 'copy', _PLIK_TMP],
        timeout=300,
    )
    if not ok_dl or not os.path.isfile(_PLIK_TMP) or os.path.getsize(_PLIK_TMP) < 1000:
        print("STATUS blad nie udalo sie pobrac wideo — sprawdz czy URL jest bezposrednim linkiem do MP4", flush=True)
        sys.exit(1)
    WIDEO = _PLIK_TMP
    print("KROK pobieranie-wideo gotowe", flush=True)

print(f"KROK start badanie: {os.path.basename(WIDEO)}", flush=True)

info = zbadaj_wideo(WIDEO)
if not info:
    print("STATUS blad nie mozna odczytac parametrow wideo", flush=True)
    sys.exit(1)

W = info['szerokosc']
H = info['wysokosc']
FPS = info['fps']
DLUGOSC = info['dlugosc_s']
print(f"KROK wideo {W}x{H} fps={FPS} dlugosc={DLUGOSC:.1f}s", flush=True)

# 1. Arkusze klatek co 0.5s
print("KROK arkusze-klatek start", flush=True)
_tmp = os.path.join(FOLDER, '_tmp_klatki')
os.makedirs(_tmp, exist_ok=True)

uruchom(
    [FFMPEG, '-y', '-i', WIDEO,
     '-vf', f'fps=2,scale={MINI_W}:{MINI_H}:force_original_aspect_ratio=increase,crop={MINI_W}:{MINI_H}',
     '-q:v', '4',
     os.path.join(_tmp, 'k_%05d.jpg')],
    timeout=300,
)

nazwy = sorted(f for f in os.listdir(_tmp) if f.endswith('.jpg'))
klatki_lista = [(i * 0.5, os.path.join(_tmp, f)) for i, f in enumerate(nazwy)]
ark_gl = zbuduj_arkusze(klatki_lista, FOLDER, prefix='arkusz')
shutil.rmtree(_tmp, ignore_errors=True)
print(f"KROK arkusze-klatek gotowe ({len(ark_gl)} ark.)", flush=True)

# 2. Cięcia montażowe
print("KROK wykrywanie-ciec start", flush=True)
ciecia = wykryj_ciecia(WIDEO)
klatki_przy_cieciach(WIDEO, ciecia, FOLDER)
odstep = round((DLUGOSC / (len(ciecia) + 1)), 2) if ciecia else round(DLUGOSC, 2)
print(f"KROK wykrywanie-ciec gotowe znaleziono={len(ciecia)}", flush=True)

# 3. Momenty ruchu / wejścia grafik
print("KROK momenty-ruchu start", flush=True)
momenty = wykryj_ruch(WIDEO)
arkusze_ruchu(WIDEO, momenty, FOLDER)
print(f"KROK momenty-ruchu gotowe znaleziono={len(momenty)}", flush=True)

# 4. Głośność
print("KROK glosnosc start", flush=True)
lista_db, srednia_db, szczyt_db, skoki = zmierz_glosnosc(WIDEO)
print(f"KROK glosnosc gotowe srednia={srednia_db}dB szczyt={szczyt_db}dB", flush=True)

# 5. Zapis pomiary.json
pomiary = {
    "szerokosc_px":       W,
    "wysokosc_px":        H,
    "fps":                FPS,
    "dlugosc_s":          round(DLUGOSC, 2),
    "ciecia_s":           ciecia,
    "sredni_odstep_s":    odstep,
    "momenty_ruchu_s":    momenty,
    "glosnosc_db":        lista_db,
    "srednia_glosnosc_db":srednia_db,
    "szczyt_glosnosc_db": szczyt_db,
    "szczyty_dzwieku_s":  skoki,
}

plik_pom = os.path.join(FOLDER, 'pomiary.json')
with open(plik_pom, 'w', encoding='utf-8') as f:
    json.dump(pomiary, f, ensure_ascii=False, indent=2)

czas_s = int(time.time() - t0)
print(f"KROK zapis-pomiary gotowe plik={plik_pom}", flush=True)

# Usuń plik tymczasowy jeśli był pobrany z URL
if _PLIK_TMP and os.path.isfile(_PLIK_TMP):
    try:
        os.remove(_PLIK_TMP)
        print("KROK plik-tymczasowy usunieto", flush=True)
    except OSError:
        pass

print(
    f"STATUS analizuj-wzorzec OK folder={FOLDER} "
    f"arkuszy={len(ark_gl)} ciec={len(ciecia)} ruch={len(momenty)} czas={czas_s}s",
    flush=True,
)
