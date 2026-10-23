#!/usr/bin/env python3
"""
Efekt: Przed i po — wersja Marzeny (v8)
Użycie: python3 build.py <wideo.mp4> [tekst_po] [tekst_przed] [output.mp4]

Domyślne napisy:
  po:    "Coś angażującego."
  przed: "Zamień nudne wideo na..."
"""

import sys, os, subprocess, tempfile
import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFont

# ── Argumenty ─────────────────────────────────────────────────────────────────
INPUT_VIDEO = sys.argv[1] if len(sys.argv) > 1 else None
CAP_PO      = sys.argv[2] if len(sys.argv) > 2 else "Coś angażującego."
CAP_PRZED   = sys.argv[3] if len(sys.argv) > 3 else "Zamień nudne wideo na..."
OUTPUT      = sys.argv[4] if len(sys.argv) > 4 else os.path.expanduser("~/Desktop/efekt-przed-i-po.mp4")

if not INPUT_VIDEO:
    print("Użycie: python3 build.py <wideo.mp4> [tekst_po] [tekst_przed] [output.mp4]")
    sys.exit(1)

# ── Stałe ─────────────────────────────────────────────────────────────────────
W, H, FPS   = 1080, 1920, 30
MAX_FRAMES  = 7 * FPS       # kończymy na 7 sekundzie

SPT = 3.0   # linia wchodzi
SPE = 4.2   # linia dochodzi do centrum
HE  = 5.5   # hold koniec
EE  = 6.7   # linia wychodzi

POP_DELAY_MS  = 1000
BADGE_Y       = 220
CAPTION_Y     = 350
FONT_SIZE     = 62
CAPTION_MAX_W = 510
HANDLE_Y_FRAC = 0.60

AFTER_BRIGHTNESS = -0.12
AFTER_SATURATION = 0.6
AFTER_CONTRAST   = 0.82

FONT_BADGE  = '/System/Library/Fonts/HelveticaNeue.ttc'
FONT_CAP    = '/System/Library/Fonts/Avenir Next.ttc'
BOLD_IDX    = 1
HEAVY_IDX   = 8

SKILL_DIR = os.path.dirname(os.path.abspath(__file__))
SOUNDS_DIR = os.path.join(SKILL_DIR, "..", "..", "..", "dzwieki", "pliki")

TMPDIR = tempfile.mkdtemp(prefix="przed-i-po-")

# ── Font helpers ───────────────────────────────────────────────────────────────
def f_badge(size):
    return ImageFont.truetype(FONT_BADGE, size, index=BOLD_IDX)

def f_cap(size):
    return ImageFont.truetype(FONT_CAP, size, index=HEAVY_IDX)

def text_size(txt, fnt):
    d = ImageDraw.Draw(Image.new('RGBA', (1,1)))
    bb = d.textbbox((0,0), txt, font=fnt)
    return bb[2]-bb[0], bb[3]-bb[1], bb

# ── Badge z cieniem i obramówką ────────────────────────────────────────────────
def make_pill(text, fg, bg, border=(255,255,255,200), font_size=36, pad_x=30, h=72):
    fnt = f_badge(font_size)
    tw, th, bb = text_size(text, fnt)
    w = tw + pad_x*2
    pad = 8
    canvas = Image.new('RGBA', (w + pad*2, h + pad*2), (0,0,0,0))
    d = ImageDraw.Draw(canvas)
    d.rounded_rectangle([(pad+4, pad+4), (pad+4+w-1, pad+4+h-1)], radius=h//2, fill=(0,0,0,140))
    d.rounded_rectangle([(pad, pad), (pad+w-1, pad+h-1)], radius=h//2, fill=bg)
    if border:
        d.rounded_rectangle([(pad, pad), (pad+w-1, pad+h-1)], radius=h//2, outline=border, width=3)
    d.text((pad + pad_x - bb[0], pad + (h-th)//2 - bb[1]), text, fill=fg, font=fnt)
    return np.array(canvas)

# ── Duży napis jak u Tena (Avenir Heavy, tylko cień) ──────────────────────────
def make_caption(text, max_w, font_size=62):
    fnt = f_cap(font_size)
    d0  = ImageDraw.Draw(Image.new('RGBA', (1,1)))
    words, lines, line = text.split(), [], []
    for w in words:
        test = ' '.join(line + [w])
        bb = d0.textbbox((0,0), test, font=fnt)
        if bb[2]-bb[0] > max_w - 20 and line:
            lines.append(' '.join(line)); line = [w]
        else:
            line.append(w)
    if line: lines.append(' '.join(line))
    lh = font_size + 14
    total_h = lh * len(lines) + 12
    PAD = 6
    actual_w = max(max_w, max(text_size(ln, fnt)[0] for ln in lines))
    img = Image.new('RGBA', (actual_w + PAD*2, total_h + PAD*2), (0,0,0,0))
    d   = ImageDraw.Draw(img)
    for i, ln in enumerate(lines):
        tw, th, bb = text_size(ln, fnt)
        x = PAD + (actual_w - tw) // 2
        y = PAD + i * lh - bb[1]
        d.text((x+3, y+3), ln, fill=(0,0,0,170), font=fnt)
        d.text((x, y),     ln, fill=(255,255,255,255), font=fnt)
    return np.array(img)

# ── Koło uchwytu ───────────────────────────────────────────────────────────────
def make_handle(r=58):
    s = r*2
    img = Image.new('RGBA', (s,s), (0,0,0,0))
    d = ImageDraw.Draw(img)
    d.ellipse([(2,2),(s-3,s-3)], fill=(255,255,255,240))
    fnt = f_badge(30)
    txt = "< >"
    tw, th, bb = text_size(txt, fnt)
    d.text(((s-tw)//2 - bb[0], (s-th)//2 - bb[1]), txt, fill=(25,25,25,255), font=fnt)
    return np.array(img)

# ── Alpha compositing ──────────────────────────────────────────────────────────
def overlay(base, img_rgba, x, y, x_min=0, x_max=W):
    ih, iw = img_rgba.shape[:2]
    x1, y1 = max(x_min, max(0,x)), max(0,y)
    x2, y2 = min(x_max, min(W, x+iw)), min(H, y+ih)
    if x1>=x2 or y1>=y2: return
    ox1, oy1 = x1-x, y1-y
    ox2, oy2 = ox1+(x2-x1), oy1+(y2-y1)
    a   = img_rgba[oy1:oy2, ox1:ox2, 3:4].astype(np.float32)/255.
    rgb = img_rgba[oy1:oy2, ox1:ox2, :3][:,:,::-1]
    base[y1:y2, x1:x2] = (base[y1:y2, x1:x2]*(1-a) + rgb*a).astype(np.uint8)

# ── Przygotowanie wersji ───────────────────────────────────────────────────────
norm_mp4 = os.path.join(TMPDIR, "norm.mp4")
bef_mp4  = os.path.join(TMPDIR, "bef.mp4")
raw_mp4  = os.path.join(TMPDIR, "raw.mp4")

print("1/3 Normalizacja wideo…")
subprocess.run([
    "ffmpeg", "-y", "-i", INPUT_VIDEO,
    "-vf", f"scale={W}:{H},setsar=1",
    "-r", str(FPS), "-c:v", "libx264", "-crf", "18", "-preset", "fast", "-c:a", "aac",
    norm_mp4
], capture_output=True, check=True)

print("2/3 Wersja 'przed' (przyciemniona)…")
subprocess.run([
    "ffmpeg", "-y", "-i", norm_mp4,
    "-vf", f"eq=brightness={AFTER_BRIGHTNESS}:saturation={AFTER_SATURATION}:contrast={AFTER_CONTRAST}",
    "-c:v", "libx264", "-crf", "18", "-preset", "fast",
    bef_mp4
], capture_output=True, check=True)

# ── Assety graficzne ───────────────────────────────────────────────────────────
badge_przed = make_pill('przed', (255,255,255,255), (22,22,22,215))
badge_po    = make_pill('po',    (20,20,20,255),    (245,240,50,215))
handle      = make_handle(58)
cap_po      = make_caption(CAP_PO,    CAPTION_MAX_W, FONT_SIZE)
cap_przed   = make_caption(CAP_PRZED, CAPTION_MAX_W, FONT_SIZE)

bpw = badge_przed.shape[1]; bph = badge_przed.shape[0]
bpow = badge_po.shape[1];   bpoh = badge_po.shape[0]
hr = handle.shape[0] // 2
HANDLE_Y = int(H * HANDLE_Y_FRAC)

def divx(t):
    if t < SPT:  return 0
    if t < SPE:  return int((t-SPT)/(SPE-SPT)*(W//2))
    if t < HE:   return W//2
    if t < EE:   return int(W//2 + (t-HE)/(EE-HE)*(W//2))
    return W

# ── Render klatek ──────────────────────────────────────────────────────────────
print("3/3 Renderowanie klatek…")
cap_n = cv2.VideoCapture(norm_mp4)
cap_b = cv2.VideoCapture(bef_mp4)
total = int(cap_n.get(cv2.CAP_PROP_FRAME_COUNT))
frames_to_render = min(total, MAX_FRAMES)
print(f"  {frames_to_render} klatek ({frames_to_render/FPS:.1f}s)")

fourcc = cv2.VideoWriter_fourcc(*"mp4v")
wr = cv2.VideoWriter(raw_mp4, fourcc, FPS, (W, H))

for fi in range(frames_to_render):
    r1, fn = cap_n.read(); r2, fb = cap_b.read()
    if not r1 or not r2: break
    t = fi / FPS; dx = divx(t)
    frame = fn.copy()
    if dx < W: frame[:, dx:] = fb[:, dx:]
    if SPT <= t < EE and 0 < dx < W:
        cv2.line(frame, (dx,0), (dx,H), (255,255,255), 3)
    if SPT <= t < EE and 10 < dx < W-10:
        overlay(frame, handle, dx-hr, HANDLE_Y-hr)
    if t < EE:
        bx = (W-bpw)//2 if t < SPT else (dx+W)//2 - bpw//2
        overlay(frame, badge_przed, bx, BADGE_Y)
    if t >= SPT:
        bx = (W-bpow)//2 if t >= EE else dx//2 - bpow//2
        overlay(frame, badge_po, bx, BADGE_Y)
    if SPT <= t < EE:
        overlay(frame, cap_po,    dx//2 - cap_po.shape[1]//2,     CAPTION_Y, x_min=0,  x_max=dx)
        overlay(frame, cap_przed, (dx+W)//2 - cap_przed.shape[1]//2, CAPTION_Y, x_min=dx, x_max=W)
    wr.write(frame)
    if fi % 30 == 0: print(f"  {fi}/{frames_to_render} ({100*fi/frames_to_render:.0f}%)", flush=True)

cap_n.release(); cap_b.release(); wr.release()

# ── Audio ──────────────────────────────────────────────────────────────────────
whoosh = os.path.join(SOUNDS_DIR, "whoosh.mp3")
pop    = os.path.join(SOUNDS_DIR, "pop.mp3")

result = subprocess.run([
    "ffmpeg", "-y",
    "-i", raw_mp4, "-i", norm_mp4,
    "-i", whoosh, "-i", pop,
    "-filter_complex",
    f"[1:a]atrim=0:{MAX_FRAMES/FPS},volume=1.0[orig];"
    f"[2:a]adelay=3000|3000,volume=1.2[whoosh];"
    f"[3:a]adelay={POP_DELAY_MS}|{POP_DELAY_MS},volume=1.8[pop];"
    "[orig][whoosh][pop]amix=inputs=3:duration=first:dropout_transition=0[outa]",
    "-map", "0:v", "-map", "[outa]",
    "-c:v", "copy", "-c:a", "aac", "-t", str(MAX_FRAMES//FPS),
    OUTPUT
], capture_output=True, text=True)

if result.returncode != 0:
    print("BŁĄD FFmpeg:", result.stderr[-300:])
else:
    print(f"Gotowe → {OUTPUT}")
