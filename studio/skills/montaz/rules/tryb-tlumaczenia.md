# Tryb tłumaczenia — gdy kursantka tłumaczy proces

Claude czyta ten plik, gdy w transkrypcie kursantka tłumaczy, jak coś działa: wymienia kroki, pokazuje narzędzie,
opisuje przepływ „przed → po”, mówi o plikach, komendach, ustawieniach. Bierzemy **sposób pokazywania** —
kolory i czcionki zawsze ze stylu kursantki.

## Kiedy włączać

- Fragment z wyliczanką kroków („najpierw… potem… na końcu”), pokazywaniem aplikacji, pliku, rozmowy z AI, ustawień.
- Jeden fragment trwa zwykle **5–20 s**, potem wracamy do zwykłego kadru (kursantka na cały ekran).
- Na rolkę najwyżej **2 takie fragmenty** — reszta to mówiąca twarz i lekkie akcenty. W planie montażu (krok 4)
  zaproponuj tryb tłumaczenia jako jeden efekt budżetu, z czasem od–do i listą klocków.

## Układy

| Układ | Jak wygląda | Kiedy |
|---|---|---|
| **Podział** (domyślny) | góra (Y 220–900): jasne tło z kartami; dół: wideo z kursantką | tłumaczenie w trakcie mówienia do kamery |
| **Pełny ekran tłumaczenia** | cały kadr to jasne tło z kartami, bez osoby; napisy mówione dalej lecą | dłuższy schemat, dużo kart naraz (najwyżej kilka sekund) |
| **Narrator z polaroidem** | ekran (okno, aplikacja) jako główna karta, kursantka mówi z małego przechylonego zdjęcia w rogu | pokazywanie procesu na ekranie (efekt `polaroid-w-rogu`) |

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
  (Instrument Serif); treść — czcionka główna (bez marki: Inter); nazwy plików, komendy, kod — JetBrains Mono.
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
