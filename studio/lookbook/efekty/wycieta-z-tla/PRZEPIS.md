# Efekt: Wycięta z tła



> ⚠️ **Sprawdzenie twarzy:** żaden element tego efektu nie może nachodzić na strefę twarzy (Y:250–1400px × X:200–880px przy 1080×1920). Patrz: sekcja **"Twarz — reguła nadrzędna"** w `studio/skills/montaz/SKILL.md`.

**Co robi:** Kursantka wycięta z tła stoi na tle rozmytego pokoju. Pływające karty z grafikami, logotypami i tytułami pojawiają się wokół niej — część za nią, część przed nią. Efekt głębi 3D.

**Kiedy używać:** Przez cały film lub w wybranych sekcjach (intro, kluczowe punkty). Każda karta wchodzi na słowo które ilustruje.

---

## Czego potrzeba od kursantki

- Nagranie 9:16 z nieruchomym tłem i dobrym kontrastem osoby
- Grafiki/loga/treści do kart (opcjonalnie — Claude może wygenerować placeholdery)

---

## Workflow

### Krok 1. Wycięcie tła

Użyj sylwetki z montażu: skrypt `wytnij-tlo` (patrz `skills/montaz/SKILL.md`, krok 5) robi `assets/sylwetka.webm`
z całej złożonej rolki i sprawdza, że ma tyle samo klatek co obraz. Nie wycinaj tła osobno z innego pliku — sylwetka
rozjedzie się z obrazem. Pozycję głowy bierz z `glowa.json` (`glowa`).

Jeśli wycinanie się nie uda, nie instaluj innych narzędzi: zajrzyj do `skills/montaz/rules/pulapki.md`, a gdy to nie
pomoże — powiedz kursantce, że ten efekt pominiemy, i zaproponuj efekt bez wycięcia z tła.

### Krok 2. Rozmyte tło

```bash
ffmpeg -i wideo.mp4 -vf "boxblur=12:3,scale=1080:1920" hf/assets/bg-blur.mp4
```

### Krok 3. Kompozycja w HyperFrames

W `hf/index.html` zbuduj trzy warstwy:

```
Layer 0 (z-index: 0) — rozmyte tło (bg-blur.mp4), pełen kadr
Layer 1 (z-index: 1) — karty za osobą: karty wchodzą z animacją na słowo
Layer 2 (z-index: 2) — sylwetka kursantki (assets/sylwetka.webm), w tym samym miejscu co obraz
Layer 3 (z-index: 3) — karty przed osobą: (opcjonalnie) mniejsze karty w przednim planie
```

**Styl kart:**
- Rozmiar: 280–400px szerokość, zaokrąglone narożniki (16–24px)
- Tło: `rgba(255,255,255,0.12)` lub kolor z marki kursantki
- Wejście: `translateY(20px) → translateY(0)` + `opacity: 0 → 1`, 0.3s ease-out
- Pozycja: w wolnej przestrzeni — nigdy na twarzy

### Krok 4. Sprawdzenie

```bash
npx hyperframes snapshot --at 1,3,6,10 (w folderze hf/)
```

Sprawdź: twarz widoczna, karty nie zasłaniają oczu ani ust, tło rozmyte.

### Krok 5. Render

```bash
npx hyperframes render --quality looks --output wynik.mp4 (w folderze hf/)
```
