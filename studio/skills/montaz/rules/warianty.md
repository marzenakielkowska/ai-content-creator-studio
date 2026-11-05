# Warianty do rolek próbnych

Claude czyta ten plik, gdy kursantka sama prosi o warianty gotowej rolki: „zrób 3 warianty tej rolki”, „wersje do
rolek próbnych”, „kilka wersji z innym początkiem”. Warianty robisz tylko na jej prośbę. Sama ich nie proponujesz.

To zasady domyślne, nie sztywny przepis. Prośba kursantki zawsze wygrywa: inna liczba wariantów, inne zmiany (np. inne
napisy w całej rolce albo dwie zmiany w jednym wariancie), bez delikatnych różnic tempa i kadru. Zrób, o co prosi,
i powiedz jednym zdaniem, co to zmienia. Na przykład przy dwóch zmianach w jednym wariancie trudniej ocenić, która
zadziałała.

## Najważniejszy jest hak

Rolkę próbną Instagram pokazuje najpierw osobom, które kursantki nie obserwują. Czy pójdzie dalej, decydują pierwsze
3–4 sekundy. Dlatego warianty różnią się **tylko początkiem**. Każdy wariant zmienia jedną rzecz w haku, a reszta rolki
zostaje dokładnie taka sama. Gdy jeden wariant wygra, kursantka wie, co zadziałało.

| Rodzaj | Co się zmienia | Jak |
|---|---|---|
| `haslo`: mocniejsze hasło | tekst haka na ekranie | Ten sam wygląd haka, nowe słowa. Do każdego takiego wariantu 2–3 hasła do wyboru. |
| `hook`: inny hook | wygląd pierwszych sekund | Inny hook z Lookbooka (`studio/lookbook/hooki/<id>/hook.json`, pole `przepis.opis_efektu`), ten sam tekst. Wybierz taki, który najbardziej różni się od obecnego i pasuje do treści. |
| `zdanie`: inne pierwsze zdanie | to, co pada na początku | Najmocniejsze zdanie z nagrania (pytanie, liczba, zaskoczenie, efekt końcowy) jako krótkie otwarcie (1,5–5 s) z dużym hakiem przed całą rolką. Zawsze całe zdanie. W rolce padnie potem drugi raz, w swoim miejscu, i tak ma być. |
| `ruch`: ruch na start | ruch kamery | Wbicie na pierwszym mocnym słowie (przybliżenie 1,15–1,25 wokół twarzy w 0,12 s), najazd albo szybkie cięcie. Kadr i sylwetka zawsze razem (`rules/ruch.md`). |
| `napis`: inny napis na start | jak widać pierwsze słowa | Pierwsze słowa duże, słowo po słowie (2–3 na ekran), za głową, gdy jest wycięcie z tła. Po haku zwykłe napisy. |

Hak ma zatrzymać kciuk: duże formy, głębia, ruch. Mały napis nad głową to za mało.

**Hasła, które działają.** 3–7 słów, prawdziwe wobec treści rolki, słowami kursantki:
- liczba i obietnica: „3 rzeczy, które…”;
- błąd albo ostrzeżenie: „Nie rób tego, jeśli…”;
- pytanie o jej problem: „Ile godzin tracisz na…?”;
- zaskoczenie: „Od tygodni nie…”;
- efekt na start: „Tak wygląda…, zrobione w 5 minut”.

Bez obietnic, których rolka nie spełnia.

**Delikatne różnice robi program.** Każdy wariant dostaje też inne tempo (1,5–2,5% szybciej albo wolniej, głos ma tę
samą wysokość) i kadr 0,75–2% bliżej. Żaden wariant nie jest więc kopią innego. Kolorów nie zmieniamy i obrazu nie
odbijamy, bo napisy byłyby odwrócone. Nigdy nie obiecuj, że Instagram „nie wyłapie” podobieństwa. Mów, co zrobiłaś.
Kursantka nie chce tych różnic: w danym wariancie wpisz `"tempo": 1` i `"kadr": 1`.

## Ile i z czego

- Rolka musi być gotowa i zaakceptowana (`renders/<nazwa>-v00N.mp4`). Nie ma jej: najpierw montaż.
- Tyle wariantów, ile poprosiła. Bez liczby: 3. Najwięcej 6: przy większej liczbie powiedz, że robisz 6.
- Rodzaje w kolejności z tabeli: przy 3 wariantach hasło, hook i zdanie, potem ruch i napis, potem drugie hasło.
  Kursantka mówi, co zmieniać („wszystkie z innym hasłem”, „tylko hooki”): tylko te rodzaje (`--rodzaje`).

## Krok po kroku

1. **Plan:** `warianty-plan <projekt> [--ile N] [--rodzaje haslo,hook,zdanie,ruch,napis]` zapisuje `warianty.json`.
   Przy `ROLKA_DO_WYBORU` zapytaj, która rolka jest zaakceptowana, i podaj `--rolka`. Gdy jej kompozycja to nie `hf`,
   dodaj `--kompozycja`.
2. **Treść:** przeczytaj transkrypt rolki (`ZDANIA`; gdy go nie ma, `transkrypcja`) i ustal konkret każdego
   wariantu: hasła do wyboru, hook z listy `HOOKI`, zdanie na otwarcie. Czasy zdania (`od`, `do`) są czasami na
   rolce. Sprawdź je poleceniem `pauzy` na `assets/aroll.mp4`, bo początek zdania w transkrypcji bywa 0,1–0,2 s za
   wcześnie.
3. **Jedno pytanie do kursantki:** lista wariantów (numer, co się zmienia, konkret) i pytanie, czy tak może być.
   Przy haśle 2–3 propozycje do wyboru. Czekaj na odpowiedź. Gdy sama powiedziała, co zmieniać, i nie ma czego
   wybierać, nie pytaj.
4. **Zapisz decyzje** w `warianty.json`: `co` (jedno zdanie po polsku: co jest inne), `haslo`, `hook`, `zdanie`
   (`od`, `do`, `tekst`). Pole `do` mówi, do której sekundy wariant może się różnić od rolki. Plan ustawia je na
   pierwsze cięcie po 3,5 s. Gdy nowy hak trwa dłużej, przesuń je na kolejne cięcie (najdalej 8 s). Zmiana przez całą
   rolkę tylko na wyraźną prośbę (np. inne napisy wszędzie): `"do": null`. Tempa i kadru nie zmieniaj. Wyjątek:
   kursantka nie chce delikatnych różnic, wtedy wpisz 1 i 1.
5. **Przygotuj:** `warianty-przygotuj <projekt>` robi folder na każdy wariant (`work/warianty/<nazwa>/`, kopia
   kompozycji, nagranie bez drugiej kopii na dysku). Przy `BRAK_PLIKOW` projekt był już posprzątany: `zloz`,
   `wytnij-tlo` i `glowa` (gdy rolka ich używa), `podlacz` dla kompozycji rolki i jeszcze raz przygotuj.
6. **Zmień hak** w folderze każdego wariantu (linia `ZROB`). Jedna zmiana, tylko przed chwilą `do`. Od tej chwili
   wariant ma wyglądać dokładnie jak gotowa rolka, bo program dokleja tam gotowy plik. Dźwięki haka kończ przed `do`.
   Wariant `zdanie`: hak buduj w `otwarcie/index.html` (szkielet ze zdaniem, obrazem i głosem już jest).
   Obowiązują wszystkie zasady montażu: twarz, strefy, polskie litery, `rules/pulapki.md`. Lint (0 błędów) →
   snapshot pierwszych sekund i `strefa` → poprawki.
7. **Render w tle:** `warianty-render <projekt>` (zawsze w tle). Warianty powstają jeden po drugim, nigdy dwa naraz.
   Na Macu z procesorem Apple jeden wariant to około 2 minut, na innych komputerach dłużej.
   Program renderuje tylko początek wariantu, dokleja resztę gotowej rolki i nadaje tempo i kadr. Sprawdza też, czy
   zmiana jest widoczna, czy w chwili doklejenia nie widać szwu (wtedy renderuje cały wariant) i czy żaden wariant nie
   powtarza innego. `STATUS wariant N BLAD …` mówi, co poprawić.
8. **Obejrzyj** `ARKUSZ` każdego wariantu: sześć klatek z haka, chwila doklejenia i środek rolki. Nic na twarzy, nic
   w czerwonych polach, polskie litery całe. Poprawka: zmień folder wariantu i
   `warianty-render <projekt> --nr N --od-nowa`.
9. **Oddaj:** folder „warianty” w projekcie i po jednym zdaniu o każdym pliku (`warianty-lista` i pole `co`).

## Co mówić kursantce

- Pytanie (krok 3): „Proponuję 3 warianty z innym początkiem: 1. mocniejsze hasło na start, wybierz jedno: „…”,
  „…”, „…”; 2. inny hook: [nazwa z Lookbooka]; 3. na początek zdanie „…”. Reszta rolki zostaje ta sama. Może tak
  być?”
- W trakcie: „Robię warianty jeden po drugim, każdy około 2 minut. Dam znać, gdy będą gotowe.”
- Oddanie: „Warianty są w folderze „warianty” w projekcie: [plik: co jest inne]. Każdy ma też delikatnie inne tempo
  i kadr, więc żaden nie jest kopią innego. Wrzuć je na Instagram jako rolki próbne: zobaczą je najpierw osoby,
  które Cię jeszcze nie obserwują. Po kilku dniach sprawdź, który zebrał najwięcej wyświetleń. Jego początek działa
  najlepiej, więc warto go użyć w kolejnych rolkach. Publikujesz sama, a publikację możesz też zaplanować
  w aplikacji do planowania postów.”
- Niczego nie publikuj za kursantkę i nie łącz się z aplikacjami do publikowania.

## Poprawki i opublikowane warianty

- Poprawka jednego wariantu: zmiana w jego folderze, potem `warianty-render <projekt> --nr N --od-nowa`.
- Wariantu, który kursantka już opublikowała, nie zmieniaj. Zrób nowy: `warianty-plan <projekt> --od-nowa` przenosi
  poprzednie pliki do `warianty/wczesniejsze-<data>/` i niczego nie kasuje.
- Porządek w projekcie (krok 10) zostawia folder „warianty” i `warianty.json`. Foldery robocze (`work/`) idą do Kosza.
