# Efekt: Przed i po

**Co robi:** pionowa biała linia wjeżdża od lewej krawędzi (t=3s) do środka kadru, zatrzymuje się przez chwilę przy kole uchwytu `< >`, potem wyjeżdża w prawo — odsłaniając jasną (po) i przyciemnioną (przed) wersję tego samego nagrania. Dwa badge, napisy nad głową, dźwięk whoosh przy wejściu linii, dźwięk pop o sekundę wcześniej.

**Zastosowanie:** transformacje, tutoriale stylizacji, porównania efektów makijażu/edycji/fryzury/stroju.

**Długość:** 7 sekund. Pierwsze 3s to sama wersja "przed" (buduje napięcie). Od t=3s do t=6.7s efekt linii.

---

## Czego potrzeba

### Wideo od kursantki
- Jedno nagranie 9:16, kamera **nieruchoma** (statyw lub oparte o coś)
- Ta sama scena, ta sama osoba — różniące się "przed" i "po" to kwestia edycji/stylizacji
- Minimalna długość: 7 sekund
- Najlepiej: szeroki lub średni kadr, osoba nie zasłania całej szerokości

### Przygotowanie plików assets
Efekt używa dwóch wersji wideo:
- `assets/norm.mp4` — wersja jasna ("po"), bezpośrednio z nagrania kursantki (przycięta do 7s, 1080×1920, 30fps)
- `assets/bef.mp4` — ta sama wersja, tylko przyciemniona (brightness −0.12, saturation 0.6, contrast 0.82)

Generowanie przez FFmpeg:
```bash
# Normalizacja do 1080x1920, 30fps, pierwsze 7 sekund
ffmpeg -i <oryginal.mp4> -vf "scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2" -t 7 -r 30 -c:v libx264 -preset fast -crf 18 -c:a aac assets/norm.mp4

# Wersja przyciemniona ("przed")
ffmpeg -i assets/norm.mp4 -vf "eq=brightness=-0.12:saturation=0.6:contrast=0.82" -c:a copy assets/bef.mp4
```

Pliki dźwiękowe (`assets/whoosh.mp3`, `assets/pop.mp3`) są już w repo — nie trzeba ich generować.

---

## Projekt HyperFrames

Plik: `hf/index.html`

### Struktura kompozycji (7s, 1080×1920)

| Element | Start | Koniec | Opis |
|---|---|---|---|
| `vid-przed` | 0 | 7 | `bef.mp4`, pełny kadr, przyciemniony, z-index 1 |
| `vid-po` (w wrapperze) | 0 | 7 | `norm.mp4`, pełny kadr, z-index 2, clip-path animowany |
| `audio-orig` | 0 | 7 | dźwięk z `norm.mp4` |
| `audio-pop` | 1 | 1.48 | pop.mp3, volume 1.8 |
| `audio-whoosh` | 3 | 3.78 | whoosh.mp3, volume 1.2 |
| `divider` | 3 | 6.7 | biała linia 3px pełna wysokość |
| `handle` | 3 | 6.7 | białe koło 116px z tekstem `< >` |
| `badge-przed` | 0 | 6.7 | ciemny badge "przed", górna strefa |
| `badge-po` | 3 | 7 | żółty badge "po", górna strefa |
| `cap-po` | 3 | 6.7 | napis na lewej połowie (wersja "po") |
| `cap-przed` | 3 | 6.7 | napis na prawej połowie (wersja "przed") |

### Animacja GSAP (czasy kluczowe)

```
SPT = 3.0   // Split Point: linia wjeżdża
SPE = 4.2   // Split Point End: linia w środku (x=540)
HE  = 5.5   // Hold End: linia zaczyna wyjazd
EE  = 6.7   // Exit End: linia opuszcza kadr
```

Animacje:
- `#vid-po-wrap` clip-path: `inset(0 100% 0 0)` → `inset(0 50% 0 0)` → `inset(0 0% 0 0)`, ease power2.inOut, duration 1.2s
- `#divider` x: 0 → 537 → 1077, te same czasy
- `#handle` x: 0 → 537 → 1077, te same czasy (CSS `left: -58px` sprawia że center = GSAP x)
- `#badge-przed` x: 0 → 267 (przesuwa się do prawej połowy)
- `#badge-po` x: -215 → 0 (wjeżdża z lewej)
- napisy: opacity 0 → 1 przy t=3.2, duration 0.4s

---

## Personalizacja dla kursantki

| Co zmienić | Gdzie | Wskazówka |
|---|---|---|
| Napisy (`cap-po`, `cap-przed`) | `index.html` | Maksymalnie 3–4 słowa, wielkie litery robią efekt |
| Tekst badge'y | `index.html` | Domyślnie "przed" / "po", można zastąpić np. "raw" / "edited" |
| Kolor badge "po" | CSS `#badge-po background` | Domyślnie żółty (`rgba(245,240,50,0.84)`), dopasować do stylu kursantki |
| Czcionka napisów | `@font-face` w `<head>` | Domyślnie próbuje Avenir Next Heavy (macOS), fallback Montserrat |
| Pozycja uchwytu | CSS `#handle top` | `calc(60% - 58px)` = 60% wysokości kadru. Zmienić jeśli twarz jest inaczej umiejscowiona |
| Czas wejścia linii (`SPT`) | GSAP w `<script>` | Minimum 2.5s (kursantka musi mieć czas na "przed") |

---

## Jak aplikować do konkretnego momentu w rolce

Ten efekt to **samodzielny klip 7s** — nie nakładka na istniejące nagranie. Stosuje się go jako osobny segment:

1. Kursantka nagrywa scenę specjalnie pod efekt PRZED → PO
2. Claude generuje `assets/norm.mp4` i `assets/bef.mp4` przez FFmpeg
3. Claude edytuje napisy i ewentualnie kolory w `hf/index.html`
4. Render: `npx hyperframes render --output wynik.mp4 --quality looks`
5. Gotowy plik wchodzi jako segment do montażu rolki (krok 5 w `studio:montaz`)

---

## Co sprawdzić po renderze

- [ ] Linia zaczyna od lewej krawędzi (x=0 przy t=3)
- [ ] Uchwyt `< >` porusza się dokładnie z linią
- [ ] Prawa strona jest widocznie ciemniejsza niż lewa
- [ ] Badge "przed" schodzi na prawą połowę gdy linia przychodzi
- [ ] Badge "po" wjeżdża z lewej
- [ ] Napisy są czytelne na obu połowach (mocny cień)
- [ ] Dźwięk pop słychać ok. 1s przed linią
- [ ] Dźwięk whoosh synchronizuje się z wejściem linii

---

## Znane pułapki

- `#vid-po-wrap` to **zwykły div**, nie `.clip` — GSAP animuje clip-path wrappera, a nie samego `<video>`
- Jeśli `bef.mp4` i `norm.mp4` mają różne rozdzielczości, linia nie będzie na granicy — oba muszą być identyczne rozmiarem
- `data-duration` na audio musi odpowiadać realnej długości pliku (whoosh = 0.78s, pop = 0.48s) — inaczej `check` wyrzuca ostrzeżenie
- Nie używać CSS `filter` na wideo — już użyte są pre-processed pliki z ffmpeg
- GSAP `fromTo` a nie `from` — efekt musi być seekowalny do dowolnej klatki
