---
name: karuzela-z-rolki
description: Karuzela na Instagram z gotowej rolki zmontowanej w Studio. Użyj, gdy kursantka wpisze /studio:karuzela-z-rolki albo powie „zrób z tej rolki karuzelę”, „karuzela z ostatniej rolki”, „przerób rolkę na karuzelę”, „popraw slajd 3 w karuzeli”. Claude sam układa tekst z jej słów, dobiera zdjęcia z uśmiechem, robi slajdy (obrazy i, gdy kursantka chce, slajdy-filmy bez dźwięku) i pokazuje storyboard przed publikacją.
---

# Karuzela z rolki

Kursantka ma gotową rolkę zmontowaną w Studio. Ty robisz z niej karuzelę na Instagram: jedno polecenie, bez wybierania
stylów. Wygląd bierzesz z jej Lookbooka, tekst z jej słów w rolce, zdjęcia z jej nagrania. Ona ocenia gotowe slajdy
w storyboardzie i podaje uwagi numerem slajdu.

`SK` to folder tego skilla. Przed pierwszą karuzelą w rozmowie przeczytaj `rules/zasady.md` (jak ma wyglądać dobra
karuzela) i `rules/slajdy.md` (jak napisać slajd). Mów do kursantki prostymi słowami, bez nazw plików, poleceń i linii
STATUS.

Polecenia: Mac/Linux `sh "SK/scripts/karuzela.sh" <polecenie> …`, Windows
`powershell -NoProfile -ExecutionPolicy Bypass -File "SK/scripts/karuzela.ps1" <polecenie> …`.

## Zanim zaczniesz

1. Uruchom po cichu `aktualizuj` ze skilla `/studio:start` (patrz tamten SKILL.md, sekcja „Aktualizacje”).
2. Gdy nie ma `~/.ai-content-studio/narzedzia.json`, powiedz jednym zdaniem, że najpierw trzeba przygotować komputer
   (`/studio:start`), i zakończ.
3. **Która rolka.** Folder projektów jest w `~/.ai-content-studio/ustawienia.json` (pole `projekty`). Gdy kursantka nie
   powie, o którą rolkę chodzi, weź najnowszy projekt z gotową rolką w `renders/` i nazwij go jednym zdaniem („Robię
   karuzelę z rolki «…» z 9 listopada”). Gdy projektów z rolką jest kilka z tego samego dnia, zapytaj krótko.

## Krok 1: start

`start "<projekt>"` zakłada `<projekt>/karuzela/`, zapisuje `rolka.json` i wypisuje linie `FRAGMENT id | czas w rolce |
tekst`. To są jej słowa z rolki, już poprawione przy montażu. Przeczytaj wszystkie.

- `STATUS wybory BRAK` (pierwsza karuzela): zapytaj w JEDNEJ wiadomości o nazwę konta na slajdach (np.
  @jej_konto) i, nieobowiązkowo, o zdjęcie profilowe (plik). Zapisz `~/.ai-content-studio/moj-karuzela.json`:
  `{"zapisano": "<data>", "konto": "@…", "zdjecie_profilowe": "<plik albo pomiń>", "kolory": "lookbook"}`.
  O nic więcej nie pytaj: stylu, napisów ani efektów kursantka nie wybiera.
- Gdy kursantka sama poprosi o coś na stałe („zawsze dawaj numery slajdów”, „chcę filmy w slajdach”, „inne kolory
  niż w Lookbooku”), dopisz to do `moj-karuzela.json`: `numer_slajdu: true`, `filmy: true`, `marker: true`,
  `kolory: {"tla": ["#…", "#…", "#…"], "akcent": "#…"}`. Potem uruchom `start` jeszcze raz (odświeża kolory).
- `STATUS brak-nagran`: oryginalnych nagrań nie ma na dysku. Zdjęcia bierz z gotowej rolki (`klatka … --z gotowe`,
  chwila bez napisu), a slajdu „surowe i gotowe” nie rób.

## Krok 2: plan slajdów

Ułóż karuzelę według `rules/zasady.md`: zwykle 7–10 slajdów.

1. **Okładka**: hak rolki przerobiony do czytania, duży i od lewej.
2. **Drugi hak**: u góry ten sam nagłówek co na okładce, pod nim pytanie albo zdanie, które znowu zaciekawia.
3. **Środek**: jedna myśl z rolki na slajd, w kolejności z rolki. Pytanie i od razu odpowiedź.
4. **Ostatni**: jedno działanie, z tym samym słowem do komentarza co w rolce.

Pisz jej słowami. Gdy w rolce pada liczba albo fakt, który mógł się zmienić (liczba produktów, cena, data), zapytaj,
zanim wstawisz inną. Nie wymyślaj wyników, opinii ani cytatów.

## Krok 3: zdjęcia

1. `twarze "<projekt>"` robi arkusze twarzy co 0,5 s (`work/twarze-N.jpg`, kafelki od lewej, 8 w rzędzie;
   `work/twarze.json` mówi, który kafelek to który fragment i sekunda). Obejrzyj wszystkie. Wybierz chwile
   **z uśmiechem i otwartymi oczami**, bez grymasów, bez mrugnięcia i bez ręki przy twarzy.
2. `klatka "<projekt>" <fragment> <sekunda> <nazwa>` zapisuje pełną klatkę (z oryginału, bez napisów). **Obejrzyj
   całą klatkę, nie tylko twarz:** ręce nisko albo poza kadrem, żadnej dłoni ani pięści uciętej brzegiem nagrania,
   żadnej ręki przy twarzy. Gdy ręka jest ucięta, weź inną chwilę.
3. `wytnij "<projekt>" <nazwa>` wycina postać z tła i czyści brzeg włosów → `assets/<nazwa>-wyciecie.png`, oraz
   zapisuje położenie głowy (kontrola pilnuje, żeby nic na nią nie weszło). Obejrzyj `work/<nazwa>-kontrola.jpg`.
   **Widoczne ucięcie nigdy nie idzie na slajd.** Dół obrazka zawsze na dolnej krawędzi slajdu. Gdy w nagraniu brzeg
   kadru ucina rękę albo ramię (`STATUS ucieta-lewo|prawo`), ta strona:
   - dochodzi do krawędzi slajdu (ucięcie schowane za krawędzią), albo
   - jest przykryta kartą, ramką czy polem komentarza, albo
   - jest miękko rozmyta (klasa `miekko-lewo` / `miekko-prawo` na obrazku).
   Dobrej klatki nie wyrzucaj od razu, ale dobieraj z uwagą i estetyką: gdy żaden sposób nie wygląda dobrze, weź inną
   klatkę, zdjęcie od kursantki albo inny obraz (zrzut, film z rolki). Gdy postać dotyka brzegu tylko nisko (dół
   swetra), program sam miękko wtapia ten bok.
   - `STATUS potrzebna-zgoda`: przy pierwszym wycinaniu program pobiera model (~390 MB). Zapytaj o zgodę jednym zdaniem,
     po „tak” uruchom z `--zgoda`.
   - Postać nie musi być wycięta: zwykłe zdjęcie w ramce (`.foto`) też jest dobre. Wtedy `wytnij … --bez-wyciecia`
     (samo położenie głowy).
4. **Gdy wycięcie wygląda słabo** (szara ściana przy włosach, ucięta głowa, rozmazanie): powiedz to wprost i poproś
   o zdjęcie na gładkim, kontrastowym tle. `zdjecie "<projekt>" "<plik>" <nazwa>` (zdjęcia z iPhone'a też), potem
   `wytnij`. Gdy kursantka ma folder ze swoimi zdjęciami, możesz z niego wybrać.

**Slajdy-filmy** (tylko gdy kursantka chce, `filmy: true` albo prosi w tej rozmowie): `fragment "<projekt>" <fragment>
<nazwa> --z surowe|gotowe --kadr <szer>x<wys> [--od 0] [--dl 6]`. Surowe i gotowe z tego samego fragmentu idą równo,
w tych samych ruchach: to najmocniejszy slajd „przed i po”. Filmy są bez dźwięku.

## Krok 4: slajdy

Napisz `karuzela/slajdy/01.html`, `02.html`… według `rules/slajdy.md`. Każdy plik to jeden `<div class="s …">` z
klasami szablonu. Konto, numer slajdu, sierotki i czasy filmów dokłada program sam.

## Krok 5: kontrola (zawsze, przed pokazaniem)

`kontrola "<projekt>"` → `work/kontrola.jpg` i `work/kontrola/NN.png`. Obok każdego slajdu jest lista błędów:
POZA STREFĄ, POZA SLAJDEM, NA TWARZY / POD BRODĄ, KARTA NA TWARZY, KONTO NACHODZI NA KARTĘ, MAŁY TEKST, GŁOWA POZA
STREFĄ, POSTAĆ UCIĘTA (z boku albo nad dolną krawędzią), SŁABY KONTRAST (na ciemnym tle jasna czcionka, na jasnym
ciemna; kolory akcentu też muszą być czytelne na swoim tle). Czerwone linie to strefa bezpieczna, zielona ramka to głowa. Obejrzyj
arkusz i każdy slajd z uwagą, popraw i uruchom znowu, aż wszystkie mają OK. Sprawdź też sam na obrazie: zdanie łamie
się w naturalnym miejscu, nic nie jest puste ani ściśnięte, polskie litery są tą samą czcionką (zbliżenie).

## Krok 6: render i storyboard

1. `render "<projekt>"` → `karuzela/gotowe/slajd-NN.png` (obrazy) i `slajd-NN.mp4` (filmy).
2. Napisz `karuzela/work/opis.json`: `{"tytul": "Karuzela: …", "sekcje": [{"tytul": "Haki", "nr": [1, 2]}, …],
   "slajdy": [{"nr": 1, "czas": "0:00", "slowa": "jej zdanie z rolki", "opis": "co widać i dlaczego"}], "pytania":
   ["…"]}`. W `pytania` tylko prawdziwe decyzje (zmieniona liczba, Twoje własne pytanie zamiast jej słów).
3. `strona "<projekt>" "<projekt>/karuzela/work/opis.json"` → `karuzela/strona/karuzela.html` z folderem `kl/`. Gdy masz
   narzędzie do publikowania stron (Artifact), opublikuj ją z folderem `kl/` i podaj link (gdy narzędzie przyjmuje
   tylko pliki z folderu roboczego, najpierw skopiuj tam cały folder `strona`). Gdy nie masz, otwórz plik w
   przeglądarce.
4. Powiedz w dwóch, trzech zdaniach, co jest w karuzeli i że uwagi podaje numerem slajdu.

**Poprawki:** zmień `slajdy/NN.html`, `kontrola`, `render "<projekt>" --nr NN`, `strona`, nowa wersja strony pod tym
samym linkiem.

## Krok 7: oddanie

Pliki do publikacji są w `<projekt>/karuzela/gotowe/`, ponumerowane po kolei (obrazy PNG, filmy MP4). Na Macu otwórz
ten folder (`open`) i powiedz: zaznacz wszystkie, prawy przycisk → Udostępnij → AirDrop na telefon, a na Instagramie
wybieraj je od 1 do ostatniego. Dodaj jedno zdanie: gdy Instagram przytnie wysoki slajd, zabierze po ok. 105 px u góry
i u dołu, a strefa bezpieczna to wytrzymuje, ale warto zerknąć na podgląd przed publikacją. Zaproponuj raz opis pod
post (2–4 krótkie linijki jej głosem i to samo słowo do komentarza).

## Twarde zasady

1. Najpierw kontrola, potem storyboard, publikacja dopiero po jej OK.
2. Nic nie wchodzi na twarz ani na brodę. Tekst i głowa w strefie bezpiecznej (90 px z boków, 200 px u góry i u dołu).
3. Jej słowa, jej liczby, jej słowo do komentarza. Nigdy cudzych słów, kont, logo ani zdjęć.
4. Nigdy nie zmieniaj ani nie usuwaj jej nagrań i zdjęć: klatki i zdjęcia w karuzeli to kopie.
5. Każda karuzela w folderze `karuzela` swojego projektu rolki. Nowa karuzela z tej samej rolki: `start "<projekt>"
   --nowa` odkłada poprzednią do `karuzela/poprzednia-<data>/`.
6. Gdy kursantka chce karuzeli z czegoś innego niż rolka (tekst, zdjęcia, temat), powiedz, że ten skill robi karuzele
   z gotowych rolek, a inne rodzaje mogą dojść później.

## Przykład

W `SK/przyklad/przyklad.html` (z folderem `kl/`) jest gotowa karuzela z rolki z opisem, dlaczego każdy slajd jest
zrobiony tak, a nie inaczej. Pokaż ją, gdy kursantka pyta, jak to będzie wyglądać, albo przed pierwszą karuzelą, gdy
nie wie, czego się spodziewać (opublikuj jak storyboard albo otwórz w przeglądarce). Nie kopiuj z niej słów ani
zdjęć: to cudza karuzela, wzór układu.
