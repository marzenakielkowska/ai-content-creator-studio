# Jak dodać nowy styl do Lookbooka

Lookbook czyta katalogi automatycznie — żeby dodać nowy styl, wystarczy dodać folder z plikiem JSON. Żadnych zmian w kodzie.

---

## Dodaj nowy styl napisów

1. Utwórz folder w `studio/lookbook/napisy/`, nazwa = id stylu (małe litery, myślniki zamiast spacji):
   ```
   studio/lookbook/napisy/moj-nowy-styl/
   ```

2. Utwórz plik `styl.json` w tym folderze:
   ```json
   {
     "id": "moj-nowy-styl",
     "nazwa": "Mój nowy styl",
     "opis": "Jedno zdanie opisu dla kursantki.",
     "najlepsze_do": "Do jakich filmów pasuje",
     "status": "szkic",
     "nowosc": false,
     "podglad_html": "<div class=\"cap c1\">przykład tekstu</div>",
     "przepis": {
       "czcionka": "Nunito",
       "grubosc": 900,
       "rozmiar_vw": 5.5,
       "kolor": "#FFFFFF",
       "cien": "0 2px 8px rgba(0,0,0,.25)",
       "polozenie": "dolne-centrum",
       "slowa_naraz": 3,
       "animacja": "fade-up",
       "czas_trwania_s": 0.15
     }
   }
   ```

3. Żeby był widoczny w Lookbooku: zmień `"status": "szkic"` na `"status": "gotowy"`.

4. Żeby miał znaczek „Nowość": zmień `"nowosc": false` na `"nowosc": true`.

### Podgląd animowany (`podglad_html`)

To kawałek HTML widoczny na karcie zamiast filmiku. Użyj jednej z gotowych klas CSS:

| Klasa | Wygląd |
|-------|--------|
| `cap c1` | biały tekst, subtelne tło |
| `cap c2` | ciemne tło, jasny tekst |
| `cap c3` | duże, pogrubione |
| `cap c4` | kursywa, animowane słowa |
| `cap c5` | nagłówek z linią |

Przykład: `"podglad_html": "<div class=\"cap c3\">mocny tekst</div>"`

### Prawdziwy filmik podglądowy

Zamiast animacji możesz wrzucić filmik `podglad.mp4` do folderu stylu:
```
studio/lookbook/napisy/moj-nowy-styl/podglad.mp4
```
Serwer automatycznie go wykryje i wyświetli zamiast animacji.

---

## Dodaj nowy efekt

1. Utwórz folder w `studio/lookbook/efekty/`:
   ```
   studio/lookbook/efekty/moj-efekt/
   ```

2. Utwórz plik `efekt.json`:
   ```json
   {
     "id": "moj-efekt",
     "kategoria": "ruch",
     "nazwa": "Mój efekt",
     "opis": "Krótki opis dla kursantki.",
     "najlepsze_do": "Do jakich momentów pasuje",
     "status": "szkic",
     "nowosc": false,
     "podglad_html": "<div class=\"fx f2\"></div>",
     "przepis": { "typ": "moj-efekt" }
   }
   ```

3. `"kategoria"` musi być jedną z: `tekst`, `plansze`, `ruch`, `dzwiek`.

4. Zmień `"status"` na `"gotowy"` gdy chcesz pokazać efekt kursantkom.

### Klasy animacji dla podglądu (`fx f1`–`fx f9`)

Liczba zmienia animację na karcie efektu. Sprawdź wizualnie w Lookbooku.

---

## Usuń albo zastąp efekt

Kursantki mają zapisane w swoim stylu identyfikatory efektów. Gdy efekt znika z `efekty/` (przeniesiony do
`archiwum/` albo usunięty), a ma nowszego zastępcę, dopisz parę do `studio/lookbook/zastapione.json`:

```json
{ "efekty": { "stary-efekt": "nowy-efekt" } }
```

Lookbook przy otwarciu zaznaczy wtedy zastępcę, a montaż użyje go zamiast starego efektu. Bez zastępcy montaż
pominie efekt i poprosi kursantkę o ponowny zapis w Lookbooku.

---

## Workflow

1. Dodajesz folder + JSON ze `"status": "szkic"` — niewidoczny dla kursantek.
   **Czy efekt potrzebuje programu albo biblioteki, której Studio jeszcze nie instaluje** (np. Pillow, numpy,
   Python)? Jeśli tak: dopisz ją do `/studio:start` (`skills/start/scripts/przygotuj.mjs` + `wersje.json` +
   tabela w `skills/start/SKILL.md`, tak żeby była na liście przed zgodą) albo — jeśli jest opcjonalna — dodaj
   na początku `PRZEPIS.md` sprawdzenie i komunikat dla kursantki, jak w `efekty/przed-i-po/PRZEPIS.md`
   („Najpierw Python”). Nic nie instaluje się po cichu.
2. Testujesz lokalnie: `node studio/skills/lookbook/serwer.mjs`
3. Gdy gotowy: zmieniasz na `"status": "gotowy"`.
4. Wypychasz na GitHub: `git add . && git commit -m "nowy styl: ..." && git push`
5. Kursantki dostają aktualizację automatycznie.
