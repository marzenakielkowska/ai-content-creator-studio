# Jak wygląda dobra karuzela z rolki

Claude czyta ten plik przed pierwszą karuzelą w rozmowie. To zasady dla każdej kursantki. Jej Lookbook (kolory,
czcionka) i jej prośby wygrywają z wyglądem domyślnym, ale nie z zasadami czytelności i twarzy.

## Wymiar i strefa bezpieczna

- Slajd ma **1080 × 1650 px**.
- **Strefa bezpieczna:** 90 px od lewej i prawej, 200 px od góry i od dołu. Cały tekst, karty i głowa są w niej.
  U góry Instagram pokazuje licznik slajdów, a u dołu kropki. Gdy przytnie wysoki slajd, zabierze po ok. 105 px.
- W dolnym marginesie może leżeć tylko konto (zdjęcie profilowe i nazwa, u dołu po lewej). Dokłada je program.
- **Numer slajdu** („3/9”) tylko wtedy, gdy kursantka chce (`numer_slajdu` w `moj-karuzela.json`). Pomaga odbiorcy
  zobaczyć, ile jeszcze zostało.
- Nic na nic nie wchodzi: tekst na tekst, karta na kartę, konto na kartę.

## Dwa pierwsze slajdy to dwa haki

- **Okładka** zatrzymuje przewijanie. Hak rolki przerobiony do czytania: najważniejsze słowo albo liczba ogromne, reszta
  mniejsza, od lewej. Ikona narzędzia, o którym mowa, może być duża. Zdjęcie osoby z uśmiechem.
- **Slajd 2 to drugi hak.** Instagram pokazuje slajd 2 jeszcze raz osobom, które nie zareagowały na okładkę, i wtedy
  widzą go jako pierwszy. Dlatego:
  - u góry powtórz nagłówek z okładki (np. ikona i tytuł mniejszymi literami), żeby było wiadomo, o czym jest karuzela;
  - pod nim inne sformułowanie tego samego haka, które znowu zaciekawia: pytanie z rolki, zaskakująca liczba, „zobacz,
    jak to wygląda”;
  - ma działać sam, bez okładki.
- Środek karuzeli nie zaczyna się od spisu treści.

## Tekst

- **Głównie rozmowa:** pytanie i od razu odpowiedź („A montaż? Mówisz…”, „Co musisz zrobić? Tylko trzy rzeczy:”). Albo
  zachęta do przesuwania („zobacz, jak to wygląda”, „możesz się zdziwić”). Hasła i krótkie zdania też są dobre.
- **Jej słowa z rolki.** Najlepsze zdania słowo w słowo, wypełniacze i powtórzenia wypadają. Punkt, który w rolce trwa
  20 sekund, to jeden slajd: myśl jako nagłówek i jedno zdanie, dlaczego.
- **Jedna myśl na slajd.** Gdy nagłówek potrzebuje „i” między dwiema myślami, to dwa slajdy.
- **Ostatni slajd prosi o jedno:** to samo słowo do komentarza co w rolce i co za nie dostaje odbiorca. Bez nowych treści.
- **Duże napisy**, które wypełniają wolne miejsce. Pytanie ok. 80–92 px, odpowiedź ok. 50–54 px, nic poniżej 28 px.
  Pusta połowa slajdu to znak, że napis może być większy albo trzeba dodać obraz.
- **Zdanie w jednym kawałku.** Łam linie w naturalnym miejscu (`<br>` albo `white-space: nowrap` na końcówce), a nie
  słowo pod słowem. Odpowiedź może zacząć się od nowej linii.
- **Sierotki:** jednoliterowe słowa (i, a, w, z, o, u) nigdy na końcu linii. Program łączy je twardą spacją sam, ale
  sprawdź na obrazie.
- **Polskie litery** zawsze tą samą czcionką (zbliżenie przed oddaniem). Grubości 500, 600 i 800.
- Bez długich myślników, bez hashtagów i emoji na slajdach. Liczby cyframi, „+50”, a nie „50+”.
- **Wyróżnienie** najważniejszego słowa kolorem akcentu (`.ak`). Podkreślenie markerem (`.mk`) tylko gdy kursantka ma
  `marker: true` albo o nie prosi.

## Twarz i zdjęcia

- **Uśmiech, otwarte oczy, bez grymasów.** Przejrzyj całe nagranie (arkusz twarzy), nie bierz pierwszej lepszej klatki.
- **Cała postać wygląda dobrze, nie tylko twarz.** Ręce nisko albo poza kadrem, nic przy twarzy. Nigdy na slajdzie
  ucięta dłoń, pięść czy prosta linia na ramieniu: tego nikt by nie opublikował. Postać stoi na dolnej krawędzi
  slajdu, a strona uciętej ręki albo ramienia dochodzi do krawędzi slajdu, jest czymś przykryta albo delikatnie
  rozmyta. Dobrej klatki nie wykluczamy, ale dobieramy ją z uwagą i estetyką; gdy nic nie wygląda dobrze, inna
  klatka, zdjęcie od kursantki albo inny obraz.
- **Nic nie wchodzi na twarz ani na brodę.** Karta z tekstem jest mała (dwie linie) i stoi niżej, z odstępem od brody.
  Konto nigdy nie leży na karcie.
- **Postać wycięta z tła:** niżej, zwykle po prawej, ucięta dolną krawędzią, głowa ok. ćwierć szerokości slajdu i w
  strefie bezpiecznej. Tekst po lewej i u góry. Czyste włosy (bez szarej ściany i prostych cięć) i miękka poświata z
  cieniem, żeby nie była płaska.
- **Nie zawsze wycięcie.** Zwykłe zdjęcie w ramce albo ładny kadr też są dobre, zwłaszcza gdy kursantka da swoje
  zdjęcia. Gdy wycięcie z nagrania wychodzi słabo, poproś o zdjęcie na kontrastowym tle.
- Jedno spójne światło w całej karuzeli. Zdjęcie z gotowej rolki tylko w chwili bez napisu.

## Ruch i dodatki

- **Odręczne dopiski i strzałki** prowadzą wzrok do następnej rzeczy („pokażę Ci →”, strzałka od dopisku do słowa).
  Najwyżej jeden, dwa na slajd i nie na każdym slajdzie.
- **Slajdy-filmy bez dźwięku**, gdy kursantka chce: surowe nagranie obok gotowej rolki (ten sam fragment, równo),
  fragmenty rolki w ramkach, przewijany zrzut ekranu. 4–8 sekund. Pozostałe slajdy to obrazy.
- Zrzut ekranu pokazuj w karcie z etykietą obok, nie pod tekstem. Dwa obrazy do porównania obok siebie.

## Wygląd

- Kolory tła, akcent i czcionka z Lookbooka kursantki (`marka.css`), chyba że w `moj-karuzela.json` są jej własne.
  **Na ciemnym tle zawsze jasna czcionka, na jasnym ciemna.** Szablon dobiera kolor tekstu do tła sam, ale słowa w
  kolorze akcentu, dopiski i strzałki wybierasz Ty: fioletowy napis na fioletowym tle albo żółty na jasnym jest
  niewidoczny. Kontrola odrzuca każdy tekst z kontrastem poniżej 3:1 (duży) albo 4,5:1 (mały).
- Tła zmieniają się między slajdami (`t1`, `t2`, `t3`, jasne), żeby przesuwanie było widać, ale bez przypadkowej tęczy:
  2–3 kolory na całą karuzelę.
