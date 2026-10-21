---
name: dzwieki
description: Otwiera Studio Dźwięków – stronę, na której kursantka słucha i wybiera dźwięki do swoich filmów. Użyj gdy kursantka wpisze /studio:dzwieki lub poprosi o wybór dźwięków.
---

# Studio Dźwięków (/studio:dzwieki)

Studio Dźwięków to strona, na której kursantka słucha dźwięków i zaznacza te, które chce w swoich filmach. Wybrane dźwięki są zapisywane i używane przy każdym montażu.

Mów do kursantki po polsku, prostym językiem. Nie pokazuj portów, ścieżek technicznych ani zawartości JSON.

`SK` to folder tego pliku. W poleceniach używaj zawsze pełnej ścieżki.

## Kiedy uruchamiać

- Kursantka pisze `/studio:dzwieki` lub prosi o wybór dźwięków.
- Skill montażu chce wiedzieć, jakich dźwięków użyć, a plik `~/.ai-content-creator-studio/moj-styl.json` nie zawiera pola `dzwieki`.

## Przebieg

### Krok 0. Cicha aktualizacja

Uruchom cicho `aktualizuj` ze skilla `/studio:start`. Nie wspominaj o wynikach `NIEDAWNO_SPRAWDZANE`, `OK` ani `WLACZONA`.

### Krok 1. Uruchom serwer

```
node "SK/serwer.mjs"
```

Uruchom w tle (`run_in_background: true`). Poczekaj na linię `GOTOWY http://127.0.0.1:<port>`. Serwer sam otwiera przeglądarkę.

Jeśli w ciągu 10 sekund nie ma `GOTOWY`, albo pojawi się `BLAD_SERWERA:`, powiedz kursantce jednym zdaniem, że coś poszło nie tak, i zakończ.

### Krok 2. Powiedz kursantce

> Studio Dźwięków jest otwarte w przeglądarce. Posłuchaj dźwięków, zaznacz te, które do Ciebie pasują, i kliknij „Zapisz wybrane dźwięki". Poczekam.

### Krok 3. Poczekaj na zapis

Śledź wyjście serwera (Monitor). Serwer wydrukuje `ZAPISANO: {...}` gdy kursantka zapisze i zamknie się sam.

Jeśli po 20 minutach nie pojawi się `ZAPISANO:`, zapytaj kursantkę, czy coś jest nie tak.

### Krok 4. Potwierdź wybór

Odczytaj JSON z linii `ZAPISANO:` i powiedz kursantce:

- `"dzwieki": []` lub brak pola: „Nie zaznaczyłaś żadnych dźwięków — to też jest wybór. Jeśli chcesz, możesz wrócić i wybrać później."
- Lista ID: „Zapisałam Twoje dźwięki: [liczba] wybranych. Od teraz będą pojawiać się w Twoich filmach."

Nie pokazuj listy ID ani ścieżki do pliku.

## Gdy coś pójdzie nie tak

- **Przeglądarka się nie otwarzyła**: powiedz, żeby wpisała adres z terminala ręcznie.
- **Port zajęty**: serwer szuka wolnego (9732–9741). Jeśli żaden nie jest wolny, poproś o zamknięcie innych programów.
- **Kursantka chce zmienić wybór**: uruchom `/studio:dzwieki` ponownie.
