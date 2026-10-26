# Efekt: Zestawienie obok siebie



> ⚠️ **Sprawdzenie twarzy:** żaden element tego efektu nie może nachodzić na strefę twarzy (Y:250–1400px × X:200–880px przy 1080×1920). Patrz: sekcja **"Twarz — reguła nadrzędna"** w `studio/skills/montaz/SKILL.md`.

**Co robi:** Dwa klipy grają jednocześnie obok siebie na wspólnym tle. Mała karta po lewej (stary stan / "przed"), duża karta po prawej (nowy stan / "po"). Nagłówek u góry. Oba klipy grają jednocześnie — widz widzi zmianę wprost.

**Różnica od efektu "Przed i po":** Tamten efekt to wipe/reveal — jedna scena z przesuwaną linią. Ten efekt to dwa oddzielne klipy grające równolegle na wspólnym tle.

---

## Czego potrzeba od kursantki

- Klip "przed": krótki materiał (5–15s), 9:16 lub dowolny (zostanie przycięty)
- Klip "po": krótki materiał (5–15s), 9:16 lub dowolny
- Etykiety: np. "PRZED" / "PO", "STARY" / "NOWY", albo dwa konkretne słowa kursantki

---

## Workflow

### Krok 1. Materiały

Umieść w `hf/assets/`:
- `przed.mp4` — klip lewej karty
- `po.mp4` — klip prawej karty

### Krok 2. Kompozycja w HyperFrames

Buduj `hf/index.html` z tymi warstwami:

```
Tło (#ede8e0 lub kolor z marki kursantki), pełen kadr 1080×1920

Nagłówek (top: 0, height: 12%):
  Tekst kursantki lub "PRZED I PO", font: marka glowna lub Montserrat 700
  centered, font-size: 28px

Lewa karta (before):
  top: 14%, bottom: 5%, left: 4%, width: 34%
  border-radius: 14px
  border: 3px solid #1a1a1a
  overflow: hidden
  Wewnątrz: <video src="hf/assets/przed.mp4" autoplay loop muted>
  Etykieta u dołu karty: "PRZED" (bold, kolor #1a1a1a)

Prawa karta (after):
  top: 14%, bottom: 5%, left: 42%, right: 4%
  border-radius: 14px
  border: 3px solid #1a1a1a
  overflow: hidden
  Wewnątrz: <video src="hf/assets/po.mp4" autoplay loop muted>
  Etykieta u dołu karty: "PO" (bold, kolor biały jeśli ciemny klip)
```

**Wejście kart:**
- Lewa wchodzi z lewej: `translateX(-60px) → translateX(0)`, 0.5s ease-out
- Prawa wchodzi z prawej: `translateX(60px) → translateX(0)`, 0.5s ease-out 0.15s delay

### Krok 3. Sprawdzenie

```bash
npx hyperframes snapshot --at 0.3,1,3 (w folderze hf/)
```

Sprawdź: obie karty widoczne, etykiety czytelne.

### Krok 4. Render

```bash
npx hyperframes render --quality looks --output wynik.mp4 (w folderze hf/)
```
