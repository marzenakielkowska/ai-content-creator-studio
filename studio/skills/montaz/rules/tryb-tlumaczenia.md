# Tryb tłumaczenia — gdy kursantka tłumaczy proces

Claude czyta ten plik, gdy w transkrypcie kursantka tłumaczy, jak coś działa: wymienia kroki, pokazuje narzędzie,
opisuje przepływ „przed → po”, mówi o plikach, komendach, ustawieniach. Bierzemy **sposób pokazywania** —
kolory i czcionki zawsze ze stylu kursantki.

## Kiedy włączać

- Fragment z wyliczanką kroków („najpierw… potem… na końcu”), pokazywaniem aplikacji, pliku, rozmowy z AI, ustawień.
- **Pierwsze sekundy rolki o programie, procesie albo AI**, także gdy kursantka jeszcze nie tłumaczy kroków, tylko
  mówi, dlaczego warto. Zaraz po haku, układ „Płótno za osobą”. Dwie sekundy po haku bez niczego to za długo. Dotyczy nagrań z osobą; bez osoby nie ma płótna za nią.
- Jeden fragment trwa zwykle **5–20 s**, potem wracamy do zwykłego kadru (kursantka na cały ekran).
- Na rolkę zwykle **2–3 takie fragmenty**, reszta to mówiąca twarz z akcentami. W planie montażu (krok 4) podaj każdy
  z czasem od–do i listą klocków.

## Układy

| Układ | Jak wygląda | Kiedy |
|---|---|---|
| **Płótno za osobą** (domyślny w pierwszych sekundach) | jasne płótno w kratkę zamiast pokoju, osoba zostaje w tej samej wielkości (wycięcie z tła), nad głową 3–4 karty przepływu wchodzą po kolei, np. Nagranie → Polecenie → Program → Rolka; strzałki rysują się między nimi | gdy tłumaczenie ma być krótkie, a osoba mówi dalej do kamery |
| **Podział** | góra (Y 220–900): jasne tło z kartami; dół: wideo z kursantką | tłumaczenie w trakcie mówienia do kamery |
| **Pełny ekran tłumaczenia** | cały kadr to jasne tło z kartami, bez osoby; napisy mówione dalej lecą | dłuższy schemat, dużo kart naraz (najwyżej kilka sekund) |
| **Narrator z polaroidem** | ekran (okno, aplikacja) jako główna karta, kursantka mówi z małego przechylonego zdjęcia w rogu | pokazywanie procesu na ekranie (efekt `polaroid-w-rogu`) |

**Płótno za osobą:** karty w jednym rzędzie, szerokość 205 px, X 70, 315, 560, 805, od Y 310 do najwyżej `glowa_gora − 40`, wysokość co najmniej 150 px. Gdy nad głową jest za mało miejsca, daj na to okno przybliżenie 1,25 z `cy` z brody (głowa zjeżdża niżej) albo tylko karty po bokach głowy. Biała karta z ciemną obwódką, numer w kółku w kolorze akcentu (gdy akcent zlewa się z płótnem: ciemne kółko i biała cyfra), w środku kadr, ikona albo `>_`, pod spodem jedno słowo. Wchodzą na akcentowane słowa (`back.out`), strzałka rysuje się 0,18 s przed kartą. Tło: pierwszy jasny kolor z `plotno.kolory`, bez marki `#F5F2EA`, z siatką `linear-gradient` co 54 px. Płótno może wjechać z góry w 0,22 s (`power3.out`) chwilę po cięciu, gdy w pierwszych klatkach ujęcia wycięcie łapie tło (`rules/pulapki.md`). **Stan początkowy takiego płótna ustaw poza osią czasu** (`gsap.set("#plotno", { y: -1920 })`): inaczej przez jedną klatkę widać całe płótno, potem pokój, potem wjazd.

**Przejście do podziału:** wideo z kursantką płynnie zjeżdża w dół i zmniejsza się (ok. 0,4 s, `power3.inOut`),
od góry odsłania się jasne tło, potem wskakują karty. Powrót — odwrotnie. Cichy „whoosh” przy przejściu.

**Twarz w podziale:** wideo przesuń i przytnij tak, żeby twarz była między Y ~1000 a 1400 — poniżej szwu i nad
dolną strefą Instagrama (Y 1470). Sprawdź na podglądzie z nakładką `strefa`. Reguła twarzy obowiązuje dalej.

## Tło i karty

- **Tło:** ciepła biel / papier (ok. `#EEEAE3`), może mieć bardzo jasną kratkę. Gdy kursantka ma w marce kolory
  płótna (`plotno.kolory` w `moj-brand.json`), użyj pierwszego jasnego.
- **Karty:** białe, zaokrąglenie 24–28 px, cienka jasna ramka, miękki cień (`0 20px 60px rgba(0,0,0,.18)`).
- **Tekst na kartach ciemny** (`#1A1A1A`, szarości do opisów) — biały na jasnym tle byłby nieczytelny.
- **Czcionki:** tytuły kroków — czcionka akcentu kursantki (`czcionki.akcent`), a bez marki elegancki szeryf
  (Instrument Serif); treść — czcionka główna (bez marki: Inter 500); nazwy plików, komendy, kod — JetBrains
  Mono 500 (Inter 400/700 i JetBrains Mono 400/700 gubią polskie litery — `pulapki.md`).
- **Kolor akcentu** (numery kroków, podkreślenia, kropki, ptaszki): `kolory.akcent` ze stylu kursantki. Bez stylu —
  jeden spokojny kolor na cały fragment, zielone ptaszki dla „zrobione”.
- Kluczowy tekst co najmniej 24 px w docelowym rozmiarze; na karcie najwyżej ~12 słów.

## Klocki

Z klocków składasz proces. Każdy klocek z animacją to wstawka: przy 2 i więcej złożonych klockach buduj je
równolegle wg `rules/wstawki.md`. Gdy w Lookbooku jest gotowy efekt (kolumna „Efekt”), bierz jego `PRZEPIS.md`.

| Klocek | Jak wygląda | Animacja | Efekt w Lookbooku |
|---|---|---|---|
| **Tytuł kroku** | numer w kółku + tytuł, słowo kluczowe podkreślone | numer wyskakuje, podkreślenie rysuje się od lewej | `karta-kroku` |
| **Etykieta** | małe wersaliki z odstępami („KROK 4”, „PRZYKŁAD”) | z rozmycia do ostrości | — |
| **Kroki w rzędzie** | 2–4 karty z dużą cyfrą i krótkim opisem | wchodzą kolejno; aktualny krok dostaje obrys | `kroki-na-kartach` |
| **Lista z ptaszkami** | tytuł + punkty ze znaczkami ✓ | punkty odhaczają się po kolei (klik) | `lista-kontrolna` |
| **Okno pliku** | karta z paskiem okna (3 kropki + nazwa pliku) i treścią | tekst wpisuje się na żywo, migający kursor | — |
| **Karta kodu** | numery linii, kolorowanie składni, plakietka „zainstalowane ✓” | linie pojawiają się kolejno, bieżąca podświetlona | — |
| **Okno czatu** | rozmowa z AI: wpisywana wiadomość, odpowiedź, plik z ✓ | pisanie na żywo, wysłanie, odpowiedź wskakuje | `czat-z-ai` |
| **Menu komend** | lista komend (np. `/studio:montaz`) z opisami | rozwija się po wpisaniu „/” | — |
| **Połączenie** | dwie ikony/karty połączone linią, plakietka „połączono ✓” | linia rysuje się od jednej do drugiej | `loga-ze-strzalkami` |
| **Przepływ przed → po** | „surowe nagranie - - → gotowa rolka” z małymi kartami | przerywana strzałka płynie, na końcu ✓ | `przed-i-po` (wersja wideo) |
| **Tabela statusów** | wiersze z nazwami i plakietkami („ręcznie” → „automatycznie”) | plakietki zmieniają się po kolei | — |
| **Przełącznik** | karta narzędzia z przełącznikiem | przełącznik przeskakuje na „on” | — |
| **Siatka ładowania** | 2×2 karty „generuje się…” z połyskiem | połysk przesuwa się, karty zamieniają się w wynik | — |
| **Kursor** | strzałka/łapka „klika” w elementy | płynny ruch, klik = mały „pop” | `kursor-na-ekranie` |
| **Naklejka-autor** | przechylona plakietka z awatarem i podpisem kursantki | wyskakuje z lekkim obrotem | — |

**Prawdziwe dane.** Nazwy plików, komendy, liczby i treść czatu bierz z tego, co kursantka mówi albo pokazuje.
Ekranów aplikacji nie podrabiaj jako „prawdziwych” — to odtworzenie, bez cudzych logotypów, chyba że film o nich mówi
(zasady w `rules/grafiki.md`).

## Napisy mówione w tym trybie

- Stoją **na szwie** między górą a dołem (Y ~870–960) albo w dolnej części jasnego tła — nigdy na twarzy.
- Na jasnym tle: ciemny tekst w białej „pigułce” z miękkim cieniem. Ważne słowo — kolor akcentu kursantki.
- Styl napisów z Lookbooka zostaje (czcionka, animacja); zmienia się tylko tło pod nimi.

## Rytm i dźwięk

- Klocek co ok. 0,5–1,5 s, dokładnie na słowie, którego dotyczy (czasy z `slowa.json`).
- Ruch spokojniejszy niż w zwykłym kadrze: płynne wjazdy 0,3–0,4 s, mało podskoków — ma być czytelnie.
- Dźwięki (z wyboru kursantki w Studiu Dźwięków): klik przy odhaczaniu i kursorze, „pisanie” przy wpisywaniu,
  cichy whoosh przy przejściu do podziału. Zawsze ciszej niż głos.

## Sprawdzenie

Podglądy na wejściu, w środku i przy wyjściu każdego klocka, z nakładką `strefa`: twarz widoczna, karty w Y 220–900
(podział) lub w strefie bezpiecznej (pełny ekran), tekst czytelny na telefonie.
