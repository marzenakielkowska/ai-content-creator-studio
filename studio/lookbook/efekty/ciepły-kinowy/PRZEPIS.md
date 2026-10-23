# Efekt: Ciepły kinowy

**Co robi:** nakłada ciepły grade z winietą i grain na całe nagranie przez FFmpeg. Nie wymaga HyperFrames — to filtr na wideo.

**Wynik:** nowy plik wideo z gradingiem, gotowy do dalszego montażu lub bezpośredniej publikacji.

---

## Parametry grade

| Parametr | Wartość |
|---|---|
| Temperatura (eq hue) | +10 (cieplejszy) |
| Odcień | +8 |
| Ekspozycja | −6% (brightness=0.94) |
| Kontrast | +20% (contrast=1.20) |
| Nasycenie | −14% (saturation=0.86) |
| Winieta | vignette=PI/5, lekka |
| Grain | noise=5–8 (zależnie od klimatu) |

---

## Polecenie FFmpeg

```bash
ffmpeg -i wideo.mp4 \
  -vf "
    colorchannelmixer=rr=1.04:gg=0.99:bb=0.94,
    eq=brightness=-0.06:contrast=1.20:saturation=0.86,
    vignette=PI/5,
    noise=alls=6:allf=t
  " \
  -c:v libx264 -preset slow -crf 18 \
  -c:a copy \
  wideo-kinowy.mp4
```

**Alternatywna wersja (bez noise, gdy nie chcesz grain):**
```bash
ffmpeg -i wideo.mp4 \
  -vf "
    colorchannelmixer=rr=1.04:gg=0.99:bb=0.94,
    eq=brightness=-0.06:contrast=1.20:saturation=0.86,
    vignette=PI/5
  " \
  -c:v libx264 -preset slow -crf 18 \
  -c:a copy \
  wideo-kinowy-clean.mp4
```

---

## Workflow

```
1. Sprawdź że wideo jest 1080×1920 (lub skaluj przez scale=1080:1920)
2. Uruchom polecenie FFmpeg powyżej
3. Obejrzyj wynik — jeśli za ciemny, zmień brightness=-0.03; jeśli za szary, contrast=1.30
4. Gotowe — wynik wrzuć do projektu HyperFrames jako assets/wideo.mp4
```

---

## Personalizacja

| Chcesz | Zmień |
|---|---|
| Cieplejszy (bardziej pomarańczowy) | `rr=1.07:gg=0.98:bb=0.90` |
| Chłodniejszy (bardziej niebieski) | `rr=0.96:gg=0.99:bb=1.06` |
| Mocniejszy kontrast | `contrast=1.35` |
| Bez winieta | usuń linię `vignette` |
| Mocniejszy grain | `alls=12` |

---

## Kiedy ten grade działa najlepiej

- Dobre oświetlenie naturalne lub studyjne (zbyt ciemny materiał będzie za bardzo przyciemniony)
- Stylizacja, lifestyle, edukacja — klimat "drogi kontent"
- Unikaj gdy masz bardzo kolorowe tło lub jaskrawe stroje — grade może wyprać kolory
