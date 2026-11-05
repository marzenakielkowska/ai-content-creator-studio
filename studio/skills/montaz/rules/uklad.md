# Zasady układu (kadr 1080×1920)

Claude czyta ten plik przed rozmieszczeniem napisów, kart i efektów. Reguła twarzy i strefy bezpieczne z SKILL.md
obowiązują zawsze; ten plik mówi, jak je spełnić co do piksela.

## Gdzie jest głowa — mierz, nie zgaduj

- Po `wytnij-tlo` uruchom `glowa <projekt>`. Dla każdego segmentu dostajesz w `glowa.json`:
  `glowa_gora` (najwyższy punkt głowy w tym segmencie), `glowa_x_od` / `glowa_x_do` (szerokość głowy),
  `broda_okolo` (szacunek, gdzie kończy się broda) i prostokąt całej sylwetki.
- Bez sylwetki (rolka bez wycięcia z tła) przyjmij strefę twarzy z SKILL.md (Y 250–1400, X 200–880).
- `broda_okolo` to szacunek: zawsze dodaj 40 px zapasu i sprawdź na podglądzie. Gdy kursantka podnosi ręce nad głowę,
  `glowa_gora` pokaże ręce — porównaj z arkuszem klatek.

## Gdzie co stawiać

- **Napisy wprowadzające (krótkie linie mówione):** wyśrodkowane, w pasie klatki piersiowej, mniej więcej
  Y 950–1300, przed osobą. Wyglądają lepiej niż linie przyklejone do lewej krawędzi. Mogą leżeć na tułowiu,
  nigdy na twarzy. Styl napisów z Lookbooka, który ma własne ułożenie (np. schodki), wygrywa.
- **Pozycje z Lookbooka** (`uklad.napisy` — % od dołu, `uklad.naglowek` — % od góry): przelicz na piksele
  (napisy: Y = 1920 − procent × 19,2). Gdy wypada w strefie Instagrama (napisy niżej niż Y 1470, nagłówek wyżej niż
  Y 220), przesuń do granicy i powiedz kursantce jednym zdaniem dlaczego.
- **Karty pod brodą:** górna krawędź karty co najmniej `broda_okolo + 40`. Dolna krawędź najwyżej Y 1470.
  Prawa krawędź najwyżej X 900, jeśli karta schodzi poniżej Y 1050 (kolumna ikon Instagrama).
  Gdy karta się nie mieści, zmniejsz ją albo przenieś nad głowę (Y 220 do `glowa_gora − 40`).
- **Okno „za osobą”** (aplikacja, strona): na ścianie za mówiącą, warstwa pod sylwetką, głowa może zachodzić na
  dolne ~80 px okna.
- **Karty z cudzymi rolkami / zdjęciami:** obok twarzy, lekko przechylone (−7° / +6°), dolna krawędź ≤ Y 1470.

## Słowo za głową (efekt wycięcia z tła)

Duże słowo stoi za osobą (warstwa pod sylwetką), a głowa zasłania tylko jego dolną część.

- Czytelność: głowa może zasłonić najwyżej około **25–30% wysokości liter**. Słowo zasłonięte w środku
  („cla_de”) wygląda jak błąd.
- Ustawienie: dla czcionki o wielkości S (wysokość linii 0,9) linia bazowa liter leży około 0,72·S od górnej
  krawędzi elementu, a wysokość małych liter to około 0,5·S. Chcemy, żeby linia bazowa była około 0,15·S poniżej
  `glowa_gora`, czyli: `top = glowa_gora − 0,57·S`.
  Przykład: głowa od Y 400, S = 220 px → top ≈ 275.
- Mniejsze słowa (około 220 px) łatwiej utrzymać czytelne niż ogromne (300 px).
- Gdy w czasie słowa głowa mocno się rusza (pochylenie do kamery), postaw słowo przed osobą na wysokości klatki
  piersiowej.
- Górna krawędź słowa nie wyżej niż Y 220 (strefa bezpieczna). **Gdy wzór daje `top` mniejsze niż 220**
  (osoba wysoko w kadrze), słowo nie zmieści się czytelnie za głową — zsunięte niżej zostanie zasłonięte w środku.
  Wtedy zmniejsz S albo postaw słowo przed osobą, na wysokości klatki piersiowej. Sprawdzone na renderze: przy
  głowie od Y ~140 słowo 200 px za głową było nieczytelne.
- Szerokie słowo za szeroką głową: głowa zasłania środek słowa w poziomie. Krótkie słowa albo słowa szersze niż głowa
  o co najmniej połowę z każdej strony (`glowa_x_od` / `glowa_x_do`).

## Czasy cięć w animacjach

- Każda grafika, która ma się zmienić razem z ujęciem, bierze czas z `segmenty.json` (pole `start`: klatka/30 minus
  2 ms). Bez tych 2 ms `tl.set` odpala klatkę za późno i przez jedną klatkę widać grafikę z poprzedniego ujęcia.
- Czasy słów bierz z `slowa.json` zrobionego **na złożonej rolce** (`transkrypcja`), nie z nagrań źródłowych.
- Gdy po poprawce zmieni się początek któregoś segmentu, wszystkie późniejsze czasy się przesuwają: przelicz je
  z nowego `segmenty.json` i `slowa.json`, nie poprawiaj ręcznie pojedynczych liczb.
