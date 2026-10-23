#!/usr/bin/env python3
"""
Efekt przed i po — builder HyperFrames.
Generuje hf/index.html i assets, potem uruchamia npx hyperframes lint.

Użycie:
  1. python3 measure.py <wideo>   ← sprawdź klip, odczytaj STATUS
  2. Uzupełnij blok CLIP poniżej
  3. python3 build.py             ← generuje HTML + przetwarza wideo + lint
  4. npx hyperframes render --output wynik.mp4 --quality looks   (w folderze hf/)
"""

import os
import subprocess
import sys
import textwrap
from pathlib import Path

# ══════════════════════════════════════════════════════════════════════════════
# CLIP — uzupełnij dla tej kursantki, potem uruchom: python3 build.py
# ══════════════════════════════════════════════════════════════════════════════

WIDEO       = ""                          # ścieżka do nagrania kursantki (9:16, ≥7s)
WIDEO_PRZED = ""                          # opcjonalne: drugie nagranie jako "przed"
                                          # puste = filtr ciemności nakładany automatycznie
                                          # podane = prawdziwe "przed" (makijaż, metamorfoza itp.)

NAPIS_PO    = "Coś angażującego."         # napis na lewej stronie (jasna, "po")
NAPIS_PRZED = "Zamień nudne wideo na..."  # napis na prawej stronie (ciemna, "przed")

LABEL_PO    = "po"                        # tekst badge na lewej stronie
LABEL_PRZED = "przed"                     # tekst badge na prawej stronie

KOLOR_PO    = "rgba(245, 240, 50, 0.84)" # kolor tła badge "po" (żółty)
                                          # ciemna wersja dla badge "przed":
KOLOR_PRZED = "rgba(22, 22, 22, 0.84)"  # domyślnie ciemny

REST_X      = "auto"    # gdzie linia czeka: "auto" = 540 (środek)
                        # lub liczba px (np. 400 gdy twarz jest po prawej stronie)

SPT         = 3.0       # kiedy linia wchodzi (sekundy); minimum 2.5, max 4.0
TRIM_FROM   = 0.0       # od której sekundy klipu zaczynamy (0 = od początku)

# ══════════════════════════════════════════════════════════════════════════════

SCRIPT_DIR = Path(__file__).parent
HF_DIR     = SCRIPT_DIR / "hf"
ASSETS_DIR = HF_DIR / "assets"

# Parametry przyciemnienia strony "przed"
BEF_BRIGHTNESS = -0.12
BEF_SATURATION = 0.6
BEF_CONTRAST   = 0.82


def run(*args, check=True, capture=True):
    r = subprocess.run(list(args), capture_output=capture, text=True)
    if check and r.returncode != 0:
        print(f"BŁĄD: {' '.join(str(a) for a in args[:3])}")
        print(r.stderr[-500:] if r.stderr else "(brak komunikatu)")
        sys.exit(1)
    return r


def compute_timing(spt, rest_x):
    spe = round(spt + 1.2, 2)   # linia dochodzi do REST_X
    he  = round(spe + 1.3, 2)   # hold end
    ee  = round(he  + 1.2, 2)   # linia wychodzi
    dur = round(ee  + 0.3, 2)   # całkowity czas kompozycji

    rx  = 540 if rest_x == "auto" else int(rest_x)
    right_pct = round((1080 - rx) / 1080 * 100, 1)  # clip-path inset right %

    # Badge "przed": startuje na środku (left=460), przesuwa się do prawej połowy
    badge_przed_init = 460
    badge_przed_rest = max(badge_przed_init, (rx + 1080) // 2 - 80)
    badge_przed_dx   = badge_przed_rest - badge_przed_init

    # Badge "po": startuje z lewej krawędzi, wjeżdża do lewej połowy
    badge_po_left     = max(15, rx // 2 - 80)
    badge_po_slide_dx = -badge_po_left

    cap_fade = round(spt + 0.2, 2)

    return {
        "spt": spt, "spe": spe, "he": he, "ee": ee, "dur": dur,
        "rx": rx, "right_pct": right_pct,
        "badge_przed_init": badge_przed_init,
        "badge_przed_dx": badge_przed_dx,
        "badge_po_left": badge_po_left,
        "badge_po_slide_dx": badge_po_slide_dx,
        "cap_fade": cap_fade,
    }


def prepare_assets(wideo_path, wideo_przed_path, trim_from):
    """Generuje norm.mp4 i bef.mp4 w hf/assets/ przez FFmpeg.

    Tryby:
      wideo_przed_path=None  → bef.mp4 powstaje przez przyciemnienie norm.mp4
      wideo_przed_path=Path  → bef.mp4 to znormalizowane drugie nagranie (bez filtra)
    """
    ASSETS_DIR.mkdir(parents=True, exist_ok=True)

    norm = ASSETS_DIR / "norm.mp4"
    bef  = ASSETS_DIR / "bef.mp4"

    trim_args = ["-ss", str(trim_from)] if trim_from > 0 else []

    # Normalizacja nagrania "po": 1080×1920, 30fps, pierwsze 7s
    print("  FFmpeg: normalizacja → norm.mp4")
    run("ffmpeg", "-y",
        *trim_args,
        "-i", str(wideo_path),
        "-vf", "scale=1080:1920:force_original_aspect_ratio=decrease,"
               "pad=1080:1920:(ow-iw)/2:(oh-ih)/2:black",
        "-t", "7", "-r", "30",
        "-c:v", "libx264", "-crf", "18", "-preset", "fast",
        "-c:a", "aac", "-ar", "44100",
        str(norm))

    if wideo_przed_path:
        # Drugie nagranie: normalizacja bez filtra
        print("  FFmpeg: normalizacja nagrania 'przed' → bef.mp4")
        run("ffmpeg", "-y",
            "-i", str(wideo_przed_path),
            "-vf", "scale=1080:1920:force_original_aspect_ratio=decrease,"
                   "pad=1080:1920:(ow-iw)/2:(oh-ih)/2:black",
            "-t", "7", "-r", "30",
            "-c:v", "libx264", "-crf", "18", "-preset", "fast",
            "-an",
            str(bef))
    else:
        # Filtr automatyczny: przyciemnienie norm.mp4
        print("  FFmpeg: przyciemnianie → bef.mp4")
        run("ffmpeg", "-y", "-i", str(norm),
            "-vf", f"eq=brightness={BEF_BRIGHTNESS}:"
                   f"saturation={BEF_SATURATION}:"
                   f"contrast={BEF_CONTRAST}",
            "-c:v", "libx264", "-crf", "18", "-preset", "fast",
            "-an",
            str(bef))

    print(f"  ✓ assets: {norm.name} ({norm.stat().st_size // 1024}KB), "
          f"{bef.name} ({bef.stat().st_size // 1024}KB)")


def generate_html(t, napis_po, napis_przed, label_po, label_przed,
                  kolor_po, kolor_przed):
    """Generuje hf/index.html z obliczonymi wartościami."""

    html = textwrap.dedent(f"""\
        <!doctype html>
        <html lang="pl" data-resolution="portrait">
          <head>
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=1080, height=1920" />
            <script src="https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/gsap.min.js"></script>
            <style>
              @font-face {{
                font-family: "CaptionFont";
                src: local("Avenir Next Heavy");
                font-weight: 900;
              }}

              * {{ margin: 0; padding: 0; box-sizing: border-box; }}

              html, body {{
                width: 1080px;
                height: 1920px;
                overflow: hidden;
                background: #000;
              }}

              #root {{ position: relative; width: 100%; height: 100%; }}

              .vid-fill {{
                position: absolute; left: 0; top: 0;
                width: 100%; height: 100%; object-fit: cover;
              }}

              #vid-po-wrap {{
                position: absolute; inset: 0; z-index: 2;
                clip-path: inset(0 100% 0 0);
              }}

              #divider {{
                position: absolute; left: 0; top: 0;
                width: 3px; height: 100%;
                background: #fff; z-index: 10;
              }}

              #handle {{
                position: absolute;
                left: -58px;
                top: calc(60% - 58px);
                width: 116px; height: 116px;
                border-radius: 50%;
                background: rgba(255,255,255,0.94);
                box-shadow: 0 2px 8px rgba(0,0,0,0.4);
                display: flex; align-items: center; justify-content: center;
                z-index: 11;
              }}

              #handle-txt {{
                font-family: Montserrat, sans-serif;
                font-size: 28px; font-weight: 700;
                color: #191919; letter-spacing: 2px;
              }}

              .badge {{
                position: absolute;
                top: 220px; height: 72px;
                border-radius: 36px; padding: 0 30px;
                display: flex; align-items: center;
                font-family: Montserrat, sans-serif;
                font-size: 36px; font-weight: 700;
                white-space: nowrap; z-index: 20;
                box-shadow: 4px 4px 0 rgba(0,0,0,0.45);
              }}

              #badge-przed {{
                left: {t['badge_przed_init']}px;
                background: {kolor_przed};
                border: 3px solid rgba(255,255,255,0.78);
                color: #fff;
              }}

              #badge-po {{
                left: {t['badge_po_left']}px;
                background: {kolor_po};
                border: 3px solid rgba(255,255,255,0.78);
                color: #141414;
              }}

              .caption {{
                position: absolute; top: 350px; width: 510px;
                font-family: "CaptionFont", Montserrat, sans-serif;
                font-weight: 900; font-size: 62px; line-height: 1.2;
                color: #fff; text-align: center;
                text-shadow:
                  0 0 12px rgba(0,0,0,0.95),
                  3px 3px 0 rgba(0,0,0,0.85),
                  -2px -2px 6px rgba(0,0,0,0.85),
                  2px -2px 6px rgba(0,0,0,0.85),
                  -2px 2px 6px rgba(0,0,0,0.85);
                z-index: 20;
              }}

              #cap-po    {{ left: 15px; }}
              #cap-przed {{ left: 555px; }}
            </style>
          </head>
          <body>
            <div id="root"
              data-composition-id="main"
              data-start="0"
              data-duration="{t['dur']}"
              data-width="1080"
              data-height="1920"
            >
              <!-- przed: przyciemnione, pełny kadr -->
              <video id="vid-przed" class="clip vid-fill"
                src="assets/bef.mp4" muted playsinline
                data-start="0" data-duration="{t['dur']}"
                data-track-index="0" style="z-index:1">
              </video>

              <!-- po: normalne, clip-path animowany -->
              <div id="vid-po-wrap"
                data-layout-allow-overflow
                style="position:absolute;inset:0;z-index:2;clip-path:inset(0 100% 0 0)">
                <video id="vid-po" class="clip vid-fill"
                  src="assets/norm.mp4" muted playsinline
                  data-start="0" data-duration="{t['dur']}"
                  data-track-index="1">
                </video>
              </div>

              <!-- Audio: głos kursantki -->
              <audio id="audio-orig" class="clip"
                src="assets/norm.mp4"
                data-start="0" data-duration="{t['dur']}" data-volume="1">
              </audio>

              <!-- Whoosh przy wejściu linii -->
              <audio id="audio-whoosh" class="clip"
                src="assets/whoosh.mp3"
                data-start="{t['spt']}" data-duration="0.78" data-volume="1.2">
              </audio>

              <!-- Pop sekundę przed linią -->
              <audio id="audio-pop" class="clip"
                src="assets/pop.mp3"
                data-start="{round(t['spt'] - 1, 2)}" data-duration="0.48" data-volume="1.8">
              </audio>

              <!-- Linia pionowa -->
              <div id="divider" class="clip"
                data-start="{t['spt']}" data-duration="{round(t['ee'] - t['spt'], 2)}"
                data-track-index="2">
              </div>

              <!-- Koło uchwytu -->
              <div id="handle" class="clip"
                data-start="{t['spt']}" data-duration="{round(t['ee'] - t['spt'], 2)}"
                data-track-index="3" data-layout-allow-overflow>
                <span id="handle-txt">&lt; &gt;</span>
              </div>

              <!-- Badge "przed" -->
              <div id="badge-przed" class="clip badge"
                data-start="0" data-duration="{t['ee']}"
                data-track-index="4">{label_przed}</div>

              <!-- Badge "po" -->
              <div id="badge-po" class="clip badge"
                data-start="{t['spt']}" data-duration="{round(t['dur'] - t['spt'], 2)}"
                data-track-index="5">{label_po}</div>

              <!-- Napis lewa strona -->
              <div id="cap-po" class="clip caption"
                data-start="{t['cap_fade']}" data-duration="{round(t['ee'] - t['cap_fade'], 2)}"
                data-track-index="6" data-layout-allow-overflow>{napis_po}</div>

              <!-- Napis prawa strona -->
              <div id="cap-przed" class="clip caption"
                data-start="{t['cap_fade']}" data-duration="{round(t['ee'] - t['cap_fade'], 2)}"
                data-track-index="7" data-layout-allow-overflow>{napis_przed}</div>
            </div>

            <script>
              // Timing: SPT={t['spt']} SPE={t['spe']} HE={t['he']} EE={t['ee']} REST_X={t['rx']}
              const tl = gsap.timeline({{ paused: true }});

              // Clip-path: odsłania lewą stronę
              tl.fromTo("#vid-po-wrap",
                {{ clipPath: "inset(0 100% 0 0)" }},
                {{ clipPath: "inset(0 {t['right_pct']}% 0 0)", duration: 1.2, ease: "power2.inOut" }},
                {t['spt']})
              .to("#vid-po-wrap",
                {{ clipPath: "inset(0 0% 0 0)", duration: 1.2, ease: "power2.inOut" }},
                {t['he']});

              // Linia: lewy brzeg → REST_X → prawy brzeg
              tl.fromTo("#divider",
                {{ x: 0 }},
                {{ x: {t['rx']}, duration: 1.2, ease: "power2.inOut" }},
                {t['spt']})
              .to("#divider",
                {{ x: 1077, duration: 1.2, ease: "power2.inOut" }},
                {t['he']});

              // Uchwyt: center = GSAP x (bo CSS left=-58px)
              tl.fromTo("#handle",
                {{ x: 0 }},
                {{ x: {t['rx']}, duration: 1.2, ease: "power2.inOut" }},
                {t['spt']})
              .to("#handle",
                {{ x: 1077, duration: 1.2, ease: "power2.inOut" }},
                {t['he']});

              // Badge "przed": przesuwa się do prawej połowy
              tl.fromTo("#badge-przed",
                {{ x: 0 }},
                {{ x: {t['badge_przed_dx']}, duration: 1.2, ease: "power2.inOut" }},
                {t['spt']});

              // Badge "po": wjeżdża z lewej
              tl.fromTo("#badge-po",
                {{ x: {t['badge_po_slide_dx']} }},
                {{ x: 0, duration: 1.2, ease: "power2.inOut" }},
                {t['spt']});

              // Napisy: fade in
              tl.fromTo("#cap-po",
                {{ opacity: 0 }}, {{ opacity: 1, duration: 0.4, ease: "power2.out" }},
                {t['cap_fade']});
              tl.fromTo("#cap-przed",
                {{ opacity: 0 }}, {{ opacity: 1, duration: 0.4, ease: "power2.out" }},
                {t['cap_fade']});

              window.__timelines["main"] = tl;
              tl.seek(0);
            </script>
          </body>
        </html>
    """)
    return html


def main():
    # ── Walidacja CLIP ──────────────────────────────────────────────────────────
    if not WIDEO:
        print("BŁĄD: uzupełnij WIDEO = \"<ścieżka do pliku>\" w bloku CLIP")
        sys.exit(1)

    wideo = Path(WIDEO).resolve()
    if not wideo.exists():
        print(f"BŁĄD: plik nie istnieje: {WIDEO}")
        sys.exit(1)

    rest_x = REST_X
    if rest_x != "auto":
        try:
            rx_val = int(rest_x)
            if not (100 <= rx_val <= 980):
                print(f"BŁĄD: REST_X={rx_val} poza zakresem (100–980)")
                sys.exit(1)
        except ValueError:
            print(f"BŁĄD: REST_X musi być \"auto\" lub liczbą (np. 400), nie: {rest_x}")
            sys.exit(1)

    # ── Oblicz timing ───────────────────────────────────────────────────────────
    t = compute_timing(SPT, rest_x)

    print(f"Budowanie efektu przed-i-po")
    print(f"  REST_X={t['rx']}px  SPT={t['spt']}s → EE={t['ee']}s  CZAS={t['dur']}s")
    print()

    # ── Walidacja WIDEO_PRZED (opcjonalne) ─────────────────────────────────────
    wideo_przed = None
    if WIDEO_PRZED:
        wideo_przed = Path(WIDEO_PRZED).resolve()
        if not wideo_przed.exists():
            print(f"BŁĄD: plik WIDEO_PRZED nie istnieje: {WIDEO_PRZED}")
            sys.exit(1)

    # ── Assets: norm.mp4 + bef.mp4 ─────────────────────────────────────────────
    if wideo_przed:
        print("Krok 1/3: przygotowanie wideo (tryb dwóch nagrań)…")
    else:
        print("Krok 1/3: przygotowanie wideo (tryb filtra)…")
    prepare_assets(wideo, wideo_przed, TRIM_FROM)
    print()

    # ── Generuj index.html ──────────────────────────────────────────────────────
    print("Krok 2/3: generowanie index.html…")
    html = generate_html(t, NAPIS_PO, NAPIS_PRZED, LABEL_PO, LABEL_PRZED,
                         KOLOR_PO, KOLOR_PRZED)
    index_path = HF_DIR / "index.html"
    index_path.write_text(html, encoding="utf-8")
    print(f"  ✓ {index_path}")
    print()

    # ── Lint ────────────────────────────────────────────────────────────────────
    print("Krok 3/3: npx hyperframes lint…")
    r = subprocess.run(["npx", "hyperframes", "lint"], cwd=str(HF_DIR),
                       capture_output=False)
    if r.returncode != 0:
        print("\nLint znalazł błędy — popraw je przed renderem.")
        sys.exit(1)
    print()

    print("── Gotowe ─────────────────────────────────────────────────────────────")
    print(f"Teraz uruchom w folderze hf/:")
    print(f"  npx hyperframes snapshot --at 1,3.5,4.5,5.5,6.5")
    print(f"  npx hyperframes render --output wynik.mp4 --quality looks")
    print(f"────────────────────────────────────────────────────────────────────────")


if __name__ == "__main__":
    main()
