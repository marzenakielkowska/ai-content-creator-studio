#!/usr/bin/env python3
"""
Efekt przed i po — pomiar klipu.
Uruchom PRZED uzupełnieniem bloku CLIP w build.py.

Użycie:  python3 measure.py <plik-wideo>
Wynik:   STATUS lines + podgląd klatki measure_frame.jpg

Claude czyta STATUS lines i uzupełnia CLIP w build.py.
"""

import json
import os
import subprocess
import sys
from pathlib import Path


def run(*args):
    return subprocess.run(list(args), capture_output=True, text=True)


def main():
    if len(sys.argv) < 2:
        print("STATUS blad   podaj ścieżkę do wideo: python3 measure.py <plik>")
        sys.exit(1)

    wideo = Path(sys.argv[1]).resolve()
    if not wideo.exists():
        print(f"STATUS blad   plik nie istnieje: {wideo}")
        sys.exit(1)

    # ── Metadane przez ffprobe ──────────────────────────────────────────────────
    r = run("ffprobe", "-v", "quiet", "-print_format", "json",
            "-show_streams", "-show_format", str(wideo))
    if r.returncode != 0:
        print("STATUS blad   ffprobe nie działa — uruchom /studio:start")
        sys.exit(1)

    info = json.loads(r.stdout)
    vs = next((s for s in info["streams"] if s["codec_type"] == "video"), None)
    if not vs:
        print("STATUS blad   brak strumienia wideo w pliku")
        sys.exit(1)

    w = int(vs.get("width", 0))
    h = int(vs.get("height", 0))
    dur = float(info["format"].get("duration", 0))
    fps_raw = vs.get("r_frame_rate", "30/1")
    n, d = map(int, fps_raw.split("/"))
    fps = round(n / d, 2)

    has_audio = any(s["codec_type"] == "audio" for s in info["streams"])

    # ── Sprawdzenia ─────────────────────────────────────────────────────────────
    print(f"STATUS klip   czas={dur:.1f}s  rozdzielczosc={w}x{h}  fps={fps}  dzwiek={'tak' if has_audio else 'brak'}")

    if dur < 7.0:
        print(f"STATUS blad   klip za krótki ({dur:.1f}s — minimum to 7s)")
        sys.exit(1)

    ratio = w / h if h > 0 else 0
    if abs(ratio - (9 / 16)) > 0.06:
        print(f"STATUS uwaga  kadr nie jest 9:16 (ratio={ratio:.2f}) — ffmpeg doda czarne pasy")
    else:
        print(f"STATUS format OK  proporcje 9:16")

    if not has_audio:
        print("STATUS uwaga  brak audio — efekt będzie cichy (bez głosu kursantki)")

    # ── Klatka podglądu ─────────────────────────────────────────────────────────
    out_frame = wideo.parent / "measure_frame.jpg"
    r2 = run("ffmpeg", "-y", "-ss", "3.5", "-i", str(wideo),
             "-frames:v", "1", "-q:v", "2", str(out_frame))
    if r2.returncode == 0 and out_frame.exists():
        print(f"STATUS podglad  {out_frame}")
        print("  ↳ Obejrzyj klatkę. Jeśli twarz jest bardzo z boku, ustaw REST_X na X")
        print("    (domyślnie 'auto' = środek = 540px). Twarz po lewej → REST_X=380,")
        print("    po prawej → REST_X=700.")
    else:
        print("STATUS uwaga  nie udało się wyciągnąć klatki podglądu")

    # ── Wskazówka do CLIP ───────────────────────────────────────────────────────
    print()
    print("─── Uzupełnij blok CLIP w build.py ───────────────────────────────────")
    print(f'WIDEO       = "{wideo}"')
    print(f'REST_X      = "auto"   # zmień jeśli twarz jest mocno z boku (patrz podgląd)')
    print(f'SPT         = 3.0      # kiedy linia wchodzi; minimum 2.5, maximum 4.0')
    if dur < 10:
        cutoff = dur - 7
        print(f'# Uwaga: klip ma {dur:.1f}s → użyje się pierwszych 7s')
        if cutoff > 0.5:
            print(f'#        Możesz ustawić TRIM_FROM={cutoff:.1f} żeby zacząć od lepszego momentu')
    print("──────────────────────────────────────────────────────────────────────")


if __name__ == "__main__":
    main()
