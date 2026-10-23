# Efekty — jak je uruchamiać

Każdy efekt ma swój folder z `efekt.json` (dane dla Lookbooka) i `PRZEPIS.md` (instrukcja wykonania).

---

## Dwa rodzaje efektów

### Nakładkowe
Powstają podczas montażu rolki (Krok 4 montażu). Claude dodaje grafikę lub animację na wideo kursantki — pop-in, wjazd z boku, licznik itp. Kursantka nie dostarcza dodatkowego nagrania.

W `moj-styl.json` te efekty są zapisane jako:
```json
"efekty": { "pop-in": "wszedzie" }
```
lub z miejscem w filmie:
```json
"efekty": { "wjazd-z-boku": ["poczatek", "koniec"] }
```

### Samodzielne (standalone)
Tworzą osobny klip — nie nakładkę na reel. Kursantka dostarcza nagranie, Claude generuje gotowy plik wideo (7–10 sekund). Klip jest niezależny od rolki.

W `moj-styl.json` samodzielne efekty są zapisane jako obiekt z ustawieniami personalizacji:
```json
"efekty": {
  "przed-i-po": { "kolor_po": "rgba(245,240,50,0.84)", "label_po": "po", "label_przed": "przed" }
}
```

---

## Katalog efektów

| ID | Nazwa | Rodzaj |
|---|---|---|
| `przed-i-po` | Przed i po | samodzielny |

*(Nakładkowe efekty są dodawane do tego katalogu w kolejnych aktualizacjach.)*

---

## Jak uruchomić efekt samodzielny: `przed-i-po`

Pełna instrukcja: `efekty/przed-i-po/PRZEPIS.md`

Kursantka pyta: *„Zrób mi efekt przed i po"* lub wybiera go z Lookbooka.

**Czego potrzeba od kursantki:**
- Jedno nagranie 9:16, kamera nieruchoma, ta sama scena przed i po zmianie
- Minimalna długość: 7 sekund

**Kroki (Claude wykonuje):**
```
1. python3 "SK/../../lookbook/efekty/przed-i-po/measure.py" <plik-wideo>
   ↳ Walidacja klipu, podgląd klatki, gotowy blok CLIP do wklejenia

2. Uzupełnij blok CLIP w build.py:
   - WIDEO: ścieżka do nagrania kursantki
   - NAPIS_PO / NAPIS_PRZED: 2–4 słowa na każdą stronę
   - KOLOR_PO: z moj-styl.json (jeśli kursantka personalizowała)
   - LABEL_PO / LABEL_PRZED: z moj-styl.json lub domyślnie "po"/"przed"

3. python3 "SK/../../lookbook/efekty/przed-i-po/build.py"
   ↳ FFmpeg generuje assets, tworzy hf/index.html, sprawdza spójność

4. npx hyperframes snapshot --at 1,3.5,5.0 (w folderze hf/)
   ↳ Sprawdź: linia startuje z lewej, uchwyt porusza się z linią

5. npx hyperframes render --quality looks --output wynik.mp4 (w folderze hf/)
   ↳ Gotowy klip 7 sekund, 1080×1920
```

**Ustawienia personalizacji** (z `moj-styl.json`, pole `efekty.przed-i-po`):
- `kolor_po` → kolor badge "po" (domyślnie żółty)
- `label_po` → tekst badge (domyślnie "po")
- `label_przed` → tekst badge (domyślnie "przed")

---

## Jak dodawać nakładkowe efekty (dla Claude)

Nakładkowe efekty działają podczas montażu rolki w Kroku 4. Mają swoje foldery w tym katalogu z `efekt.json` i `PRZEPIS.md`. Szczegółowe instrukcje montażu — patrz `SK/../montaz/SKILL.md`.
