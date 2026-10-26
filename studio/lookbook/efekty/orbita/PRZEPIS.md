# Efekt: Orbita



> ⚠️ **Sprawdzenie twarzy:** żaden element tego efektu nie może nachodzić na strefę twarzy (Y:250–1400px × X:200–880px przy 1080×1920). Patrz: sekcja **"Twarz — reguła nadrzędna"** w `studio/skills/montaz/SKILL.md`.

**Co robi:** małe zaokrąglone karty-ekrany (inne rolki kursantki) krążą wokół niej po eliptycznej ścieżce — część przechodzi z tyłu (z-index < kursantka), część z przodu (z-index > kursantka). Kursantka wycięta z tła stoi na środku. Daje efekt głębi i ruchu jednocześnie.

**Czas trwania:** 6s (loopable). Użyj jako standalone klip.

---

## Czego potrzeba od kursantki

- Nagranie 9:16 (wytnij tło: patrz krok 1)
- 3–5 miniatur PNG jej innych rolek (min. 400×710 px)

---

## Workflow

### Krok 1. Wycięcie tła
```bash
npx hyperframes remove-background wideo.mp4 --output hf/assets/cutout.webm
```

Jeśli pojawi się błąd — zaproponuj kursantce lokalne narzędzie i poczekaj na jej zgodę:
> „Potrzebuję zainstalować dodatkowe narzędzie do wycięcia tła (`rembg`, bezpłatne, działa lokalnie). Czy mogę?"

Po „tak":
```bash
pip install rembg[cli]
rembg i wideo.mp4 hf/assets/cutout.webm
```

### Krok 2. Miniatury rolek
Zapisz miniatury jako:
```
hf/assets/card1.png
hf/assets/card2.png
hf/assets/card3.png
```
(opcjonalnie card4.png, card5.png)

### Krok 3. Szablon jest gotowy
Plik `hf/index.html` to gotowy szablon orbity. Nie przepisuj — uruchamiaj.

Jeśli kursantka chce więcej kart (np. 4): dodaj `<div id="card-3" ...>` w HTML i dopisz `'card-3'` do tablicy `cards` w skrypcie.

### Krok 4. Sprawdzenie
```bash
cd hf && npx hyperframes check --json
```

### Krok 5. Podgląd klatek
```bash
npx hyperframes snapshot --at 0,1.5,3,4.5
```
Sprawdź: karty krążą, część za osobą, część przed.

### Krok 6. Render
```bash
npx hyperframes render --output ../wynik.mp4 --quality looks
```

---

## Parametry do iteracji

Kursantka mówi słowami — Claude zmienia liczby w `hf/index.html` (sekcja „Parametry do zmiany"):

| Co kursantka mówi | Co zmienić | Przykład |
|---|---|---|
| „wyżej" / „niżej" | `CY` | 800 = wyżej, 1100 = niżej |
| „mniejsza orbita" | `RX`, `RY` | RX=300, RY=140 |
| „większa orbita" | `RX`, `RY` | RX=520, RY=240 |
| „większe karty" | `W`, `H` | W=240, H=427 |
| „mniejsze karty" | `W`, `H` | W=160, H=284 |
| „wolniej" | `data-duration` na `#root` | 8 = wolno, 4 = szybko |
| „4 karty" / „5 kart" | dodaj card-3/card-4 w HTML + w tablicy `cards` | — |

---

## Znane pułapki

- `remove-background` wymaga połączenia z internetem i konta HyperFrames z aktywnym planem
- Karty muszą mieć `class="clip"` z `data-start="0"` i `data-duration` równym długości sceny
- Nie używaj CSS `transform` razem z GSAP transform na tym samym elemencie
- `z-index` ustawiany przez `card.style.zIndex` w `onUpdate` — nie w CSS
