---
name: montaz
description: Montuje rolkę kursantki w jej stylu. Transkrypcja, cięcie, napisy, grafiki, draft, sprawdzenie, notatki, finał. Każdy krok zatrzymuje się i czeka na OK. Użyj gdy kursantka wrzuci nagranie lub powie "zmontuj", "zrób rolkę", "edytuj ten film".
---

# Montaż rolki (/studio:montaz)

Kursantka nagrywa, Ty montujesz. Każdy krok zatrzymuje się i czeka na jej odpowiedź — nie idź dalej bez wyraźnego OK.

Mów po polsku, prostym językiem. Nie pokazuj ścieżek technicznych, komend ani błędów. Tłumacz je na zwykłe zdania.

`SK` to folder tego pliku. Skrypty uruchamiasz tak:
- **Mac:** `sh "SK/scripts/montaz.sh" <polecenie> [argumenty]`
- **Windows:** `powershell -NoProfile -ExecutionPolicy Bypass -File "SK/scripts/montaz.ps1" <polecenie> [argumenty]`

Rozpoznaj system: ścieżki z literą dysku (`C:/`) = Windows; `uname` zwraca `Darwin` = Mac.

Przed każdym krokiem przeczytaj odpowiedni plik reguł:
- Cięcie → `rules/cut.md`
- Napisy → `rules/captions.md` i `napisy-style.md`
- Grafiki → `rules/graphics.md`
- Sprawdzenie → `rules/checks.md`
- Notatki → `NOTES_LOG.md`

Styl kursantki (czcionka, kolory, efekty, dźwięki) pochodzi z `~/.ai-content-creator-studio/moj-styl.json`.

Jeśli plik nie istnieje — zanim cokolwiek zrobisz, zapytaj:

> „Nie masz jeszcze zapisanego stylu. Jak chcesz żebym montowała?
> 1. **Pokaż mi film wzorcowy** — wrzuć plik albo powiedz skąd go pobrać, a dopasuję styl do niego.
> 2. **Opisz styl słowami** — powiedz jak ma wyglądać: tempo, napisy, grafiki.
> 3. **Zbuduj styl w Lookbooku** — wpisz `/studio:lookbook`, wybierz czcionki i efekty, a potem wróć tu."

Jeśli wybierze 1 lub 2 — przejdź do `replicate.md` i postępuj według tamtego pliku. Nie wymagaj `moj-styl.json` do montażu — zastąp go stylem wzorcowym z `styl-wzorzec.json`.

`SK` to folder tego pliku.

---

## Krok 1. Transkrypcja

Uruchom skrypt:
```
montaz.sh transkrypcja "<plik-wideo>"
```
Wynik: `STATUS transkrypcja OK plik=<ścieżka>` → plik `words.json` z każdym słowem i jego czasem.

Sprawdź transkrypcję pod kątem faktów:
- liczby (czy są poprawne?)
- daty
- nazwy narzędzi, marek, aplikacji (Whisper często myli: „Claude" → „cloud", „Canva" → „Kanna")

Pokaż kursantce listę podejrzanych miejsc z czasem, np.:
> „O 0:23 Whisper napisał „klaud" zamiast „Claude" — poprawić?"

Nie poprawiaj faktów sam. Czekaj na jej OK dla każdej poprawki.

**STOP — czekaj na OK przed przejściem do kroku 2.**

---

## Krok 2. Cięcie

Przeczytaj `rules/cut.md`.

Skrypt analizuje transkrypcję i nagranie i buduje listę cięć. Pokaż kursantce:
- które ujęcia wyrzucasz i dlaczego (retake, podwójne słowo, pauza)
- ile sekund usuwasz łącznie
- miejsca których nie jesteś pewna (oznacz: „tutaj nie wiem — zostaw czy wyciąć?")

Nie tniej jeszcze. Czekaj na jej decyzję w każdym wątpliwym miejscu.

**STOP — czekaj na OK lub zmiany przed przejściem do kroku 3.**

---

## Krok 2b. Pozycja mówiącej w kadrze

Uruchom skrypt:
```
montaz.sh klatki-pozycja "<plik-wideo>"
```
Wynik: `STATUS klatki-pozycja OK pliki=<ścieżki>` → 3 pliki JPG.

Obejrzyj klatki i określ:
- **Strona:** czy mówiąca jest po lewej, prawej, czy na środku kadru?
- **Przestrzeń:** gdzie jest wolne miejsce — lewa strona, prawa, dół, góra?

Zapisz wynik do pliku `layout.json` w folderze projektu:
```json
{"strona": "prawa", "wolne_miejsce": "lewa", "uwagi": "twarz w górnej połowie kadru"}
```

Użyj tego pliku przy kroku 3 (napisy) i kroku 4 (grafiki) — żeby napisy i grafiki lądowały po stronie wolnej od twarzy.

Jeśli wszystkie trzy klatki są różne (kursantka się porusza) — wybierz najbardziej typową i zanotuj to w `uwagi`.

---

## Krok 3. Napisy

Przeczytaj `rules/captions.md` i `napisy-style.md`.

Styl napisów (czcionka, kolor, animacja) pobierz z `moj-styl.json`.

1. Oznacz kluczowe słowa w transkrypcji: liczba / nazwa / akcent / wezwanie (zasady w `rules/captions.md`).
2. Wybierz linie do pokazania (1–6 słów, kluczowe, nie każde słowo).
3. Pokaż plan jako listę w czacie, np.:
   > „0:04 — **7 narzędzi** (liczba) | 0:12 — automatycznie (akcent) | 0:31 — skomentuj NARZĘDZIE (wezwanie)"
4. Zbuduj plik `.ass` z napisami.
5. Pokaż jedną klatkę testową żeby kursantka widziała jak wygląda.

**STOP — czekaj na OK przed przejściem do kroku 4.**

---

## Krok 4. Grafiki

Przeczytaj `rules/graphics.md`.

1. Napisz plan grafik jako listę w czacie: co, o której sekundzie, jak długo, gdzie na ekranie.
2. Zapytaj o kolor akcentu (jeśli nie ma w `moj-styl.json`) i styl: dark (czarna karta) lub paper (biała karta).

**STOP — czekaj na OK planu.**

3. Zbuduj grafiki przez HyperFrames.

**STOP — czekaj na OK gotowych grafik przed przejściem do kroku 5.**

---

## Krok 5. Draft

Uruchom skrypt:
```
montaz.sh render "<projekt-dir>" "<wyjście-draft.mp4>" --draft
```
Render 540×960 (połowa rozmiaru), bez motion blur. Jeden render na raz.

Nie pokazuj jeszcze kursantce — najpierw krok 6.

---

## Krok 6. Sprawdzenie

Przeczytaj `rules/checks.md`.

Uruchom skrypt:
```
montaz.sh klatki-sprawdzenie "<draft.mp4>"
```
Wynik: `STATUS klatki-sprawdzenie OK folder=<ścieżka> liczba=<N>` → folder ze zdjęciami co 10 klatek.

Przejrzyj każde zdjęcie. Szukaj 6 defektów:
1. animacja odgrywa się dwa razy
2. flash krótszy niż 0,5 s
3. tekst pojawia się za późno
4. grafika zakrywa twarz
5. słowo powiedziane dwa razy
6. usta nie zgadzają się z głosem

Sprawdź też tabelę 4 warunków z `rules/checks.md` (twarz, strefa bezpieczeństwa, czytelność, synchronizacja cięć).

Jeśli znajdziesz problem — napraw, zrób nowy draft, sprawdź ponownie. Dopiero gdy wszystko OK — pokaż kursantce.

**STOP — pokaż draft i czekaj na notatki.**

---

## Krok 7. Notatki

Przeczytaj `NOTES_LOG.md`.

Każda uwaga kursantki:
1. Napraw w tym filmie.
2. Zapytaj: „Która reguła, gdyby istniała, zapobiegłaby temu?"
3. Przepisz tę regułę w odpowiednim pliku `rules/*.md` — nie dodawaj nowej obok.
4. Zapisz jedną linię w `NOTES_LOG.md`: data | uwaga | plik | nowe brzmienie.
5. Zrób nowy draft i sprawdź (wróć do kroku 6).

**STOP — czekaj na potwierdzenie że kursantka jest zadowolona z draftu.**

---

## Krok 8a. Warianty próbne (opcjonalnie)

Po zatwierdzeniu draftu zapytaj:
> „Chcesz kilka wersji próbnych do testowania? Mogę zrobić np. 3 rolki — każda różni się jedną rzeczą: inny hook, inne efekty albo inny styl napisów. Wrzucasz je jako trial reels na Instagram i zostawiasz tę, która działa najlepiej."

Jeśli tak — zapytaj w jednej wiadomości:
1. Ile wersji (2–5)?
2. Co testować: hook (inne pierwsze zdanie), efekty, styl napisów, czy wszystko po trochu?

Dla każdej wersji zmień dokładnie jedną rzecz. Każda wersja to osobny plik. Pokaż plan wersji przed budowaniem i czekaj na OK.

**STOP — czekaj na OK planu wersji, potem buduj.**

---

## Krok 8. Finał

Tylko gdy kursantka wyraźnie zatwierdzi draft.

Uruchom skrypty:
```
montaz.sh render "<projekt-dir>" "<wyjście-final.mp4>"
montaz.sh sprawdz-dzwiek "<wyjście-final.mp4>"
```
Wynik dźwięku: `STATUS dzwiek OK peak=-Xdb` — w porządku. `STATUS dzwiek CICHO` — powiedz i zaproponuj głośniejszą kopię.

Na końcu zapytaj:
> „Czy coś z tego filmu powinno stać się regułą na przyszłość?"

Jeśli tak — przepisz regułę i zapisz do `NOTES_LOG.md`.
