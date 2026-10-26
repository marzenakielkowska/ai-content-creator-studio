# Efekt: Polaroid w rogu



> ⚠️ **Sprawdzenie twarzy:** żaden element tego efektu nie może nachodzić na strefę twarzy (Y:250–1400px × X:200–880px przy 1080×1920). Patrz: sekcja **"Twarz — reguła nadrzędna"** w `studio/skills/montaz/SKILL.md`.

**Co robi:** Główna karta (nagranie ekranu, klip „przed") zajmuje większość kadru. Kursantka mówi z małego polaroidu — białej karty z jej twarzą, lekko obrócona, w dolnym rogu. Idealny do pokazywania procesu w Claude lub innym narzędziu.

**Kiedy używać:** Jako samodzielny klip (standalone) lub podczas konkretnej sekcji rolki gdy chcesz pokazać ekran i jednocześnie komentować.

---

## Czego potrzeba od kursantki

- Nagranie kursantki 9:16 (twarz, mówi wprost do kamery)
- Nagranie ekranu (screencast) lub klip źródłowy jako główna treść — może być MP4 lub PNG/JPG

---

## Workflow

### Krok 1. Przygotowanie materiałów

Umieść pliki w `hf/assets/`:
- `face.mp4` — nagranie kursantki (przycięte do 9:16)
- `screen.mp4` lub `screen.png` — nagranie ekranu / klip główny

### Krok 2. Kompozycja w HyperFrames

W `hf/index.html` zbuduj dwie warstwy:

```
Layer 0 (z-index: 0) — główna treść (screen.mp4):
  position: absolute, inset: 0
  background: #111
  border-radius: 0
  Treść centrowana w 88% szerokości, zachowaj margines

Layer 1 (z-index: 1) — polaroid kursantki:
  position: absolute
  bottom: 12%
  right: 6%
  width: 28%
  aspect-ratio: 9/16
  background: white
  padding: 3px 3px 20px  (biała ramka polaroidu, miejsce na podpis u dołu)
  border-radius: 4px
  transform: rotate(-5deg)
  box-shadow: 0 8px 24px rgba(0,0,0,0.4)
  overflow: hidden
  Wewnątrz: <video src="face.mp4"> wypełnia całą ramkę
```

**Wejście polaroidu:**
- Wchodzi 0.5s po starcie klipu: `translateY(40px) rotate(-5deg) → translateY(0) rotate(-5deg)`, 0.4s ease-out

### Krok 3. Sprawdzenie

```bash
npx hyperframes snapshot --at 0.5,2,5 (w folderze hf/)
```

Sprawdź: twarz w polaroidzie widoczna, ekran czytelny.

### Krok 4. Render

```bash
npx hyperframes render --quality looks --output wynik.mp4 (w folderze hf/)
```
