---
name: lookbook
description: Otwiera Lookbook – stronę, na której kursantka wybiera styl napisów i efektów i zapisuje wybór. Użyj gdy kursantka wpisze /studio:lookbook, poprosi o wybranie stylu, albo gdy inny skill Studio wykryje brak pliku moj-styl.json.
---

# Lookbook (/studio:lookbook)

Lookbook to strona, na której kursantka wybiera swój styl montażu. Po zapisaniu Claude będzie montować każdy jej film w tym stylu, bez pytania za każdym razem.

Mów do kursantki po polsku, prostym językiem. Nie pokazuj portów, ścieżek technicznych ani zawartości JSON, chyba że ona sama o to pyta.

`SK` to folder tego pliku. W poleceniach używaj zawsze pełnej ścieżki.

## Kiedy uruchamiać

- Kursantka pisze `/studio:lookbook` lub prosi o wybór stylu.
- Inny skill montażu nie znalazł pliku `~/.ai-content-creator-studio/moj-styl.json`.

## Przebieg

### Krok 0. Cicha aktualizacja

Uruchom cicho `aktualizuj` ze skilla `/studio:start` (patrz tamten SKILL.md, sekcja „Aktualizacje"). Nie wspominaj kursantce o wynikach `NIEDAWNO_SPRAWDZANE`, `OK` ani `WLACZONA`.

### Krok 1. Uruchom serwer

```
node "SK/serwer.mjs"
```

Uruchom w tle (`run_in_background: true`). Poczekaj na linię `GOTOWY http://127.0.0.1:<port>` w wyjściu procesu. Serwer sam otwiera przeglądarkę kursantki.

Jeśli w ciągu 10 sekund nie ma linii `GOTOWY`, albo pojawi się `BLAD_SERWERA:`, powiedz kursantce jednym zdaniem, że coś poszło nie tak, i zakończ.

### Krok 2. Powiedz kursantce

> Lookbook jest otwarty w przeglądarce. Obejrzyj wzory, zaznacz to, co do Ciebie pasuje, i kliknij „Zapisz mój styl". Poczekam.

Jeśli przeglądarka się nie otworzyła automatycznie, zapytaj kursantkę, czy widzi stronę. Jeśli nie – powiedz, że może otworzyć ją ręcznie wpisując adres z terminala.

### Krok 3. Poczekaj na zapis

Śledź wyjście serwera (Monitor). Serwer wydrukuje `ZAPISANO: {...}` gdy kursantka kliknie „Zapisz mój styl" i zamknie się sam.

Jeśli po 20 minutach nie pojawi się `ZAPISANO:`, zapytaj kursantkę, czy coś jest nie tak lub czy chce zamknąć Lookbook i wrócić do niego później.

### Krok 4. Potwierdź wybór

Odczytaj JSON z linii `ZAPISANO:` i powiedz kursantce, co wybrała:

- `"tryb": "wlasny"` z napisami i efektami: „Zapisałam Twój wybór: napisy **[nazwa napisów]** i [liczba] efektów. Od teraz każdy film będzie montowany w tym stylu."
- `"tryb": "wlasny"` tylko efekty (bez napisów): „Zapisałam Twój wybór: efekt **[nazwa efektu]**, bez napisów. Od teraz każdy film będzie montowany w tym stylu."
- `"tryb": "wlasny"` tylko napisy: „Zapisałam: napisy **[nazwa napisów]**, bez efektów."

Po każdym wariancie dopisz od razu w nowej linii:

> Kiedy będziesz gotowa — wrzuć swoje wideo i wpisz `/studio:montaz`. Możesz też najpierw zmienić wybór wpisując `/studio:lookbook`.

Nazwy napisów i efektów możesz odczytać z plików `SK/../../lookbook/napisy/<id>/styl.json` i `SK/../../lookbook/efekty/<id>/efekt.json` (pole `nazwa`).

Nie pokazuj kursantce JSON ani ścieżki do pliku, chyba że ona pyta.

## Gdy coś pójdzie nie tak

- **Przeglądarka się nie otwarzyła**: powiedz, żeby wpisała w przeglądarkę adres widoczny w terminalu.
- **Port zajęty**: serwer sam szuka wolnego (9731–9740). Jeśli żaden nie jest wolny, poproś kursantkę o zamknięcie innych programów i spróbuj jeszcze raz.
- **Kursantka chce zmienić wybór**: uruchom `/studio:lookbook` ponownie. Nowy zapis nadpisuje poprzedni.
- **Plik moj-styl.json zniknął**: uruchom Lookbook automatycznie (opcja B z ustaleń), poinformuj kursantkę jednym zdaniem.
