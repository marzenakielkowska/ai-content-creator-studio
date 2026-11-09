# Znane pułapki — HyperFrames i FFmpeg

Claude czyta ten plik przed budowaniem kompozycji i zawsze, gdy coś nie działa. Kursantka go nie widzi.
Zanim zaczniesz szukać błędu na ślepo, sprawdź, czy pasuje do jednego z poniższych. Każdy z nich kosztował kiedyś
render.

## Synchronizacja i czas

- **Sylwetka rozjeżdża się z obrazem** (po cięciu przez chwilę widać dwie osoby): nagranie miało nierówne klatki
  albo przesunięty start. Zawsze tnij przez `zloz` (równe 30 klatek/s od zera), a `wytnij-tlo` sprawdza, czy
  sylwetka ma tyle samo klatek co rolka. Przy niezgodności: `zloz` od nowa, potem `wytnij-tlo`.
- **Grafika zostaje o klatkę za długo po cięciu:** czas zaokrąglony do sekund. Bierz `start` z `segmenty.json`
  (klatka/30 minus 2 ms).
- **Podgląd (`snapshot`) przy cięciu pokazuje następne ujęcie o klatkę za wcześnie.** To nie błąd rolki. Cięcia
  potwierdza tylko `sprawdz-ciecia` na gotowym renderze.
- **Napisy rozjeżdżają się po poprawce cięć:** czasy słów z poprzedniej wersji. Po każdym `zloz` zrób
  `transkrypcja` od nowa.
- **Transkrypcja dopisuje słowo przy cięciu** albo przesuwa czasy o 0,1–0,3 s. Potwierdzaj pauzy przez `pauzy`.

## Budowa kompozycji

- **Najpierw `index.html`, od razu lint, dopiero potem kompozycje.** Zły atrybut w kompozycji głównej (np.
  `data-scene` zamiast `data-composition-src`) wychodzi dopiero po godzinie pracy i dwóch nieudanych renderach.
- Nazwy atrybutów: osadzona kompozycja to `data-composition-src="compositions/x.html"`; jej element-gospodarz
  potrzebuje **obu**: `id="scene-x"` i `data-composition-id="scene-x"`.
- Wideo z głosem: `data-has-audio="true"`, nie `muted`.
- GSAP ładujesz sama w `<head>` `index.html` (`SKILL.md`, krok 6). Bez tego lint przechodzi, a animacje nie działają.

## Wycięcie z tła

Na ruchliwym pokoju błędów wycięcia nie widać, na gładkim płótnie widać od razu. Kursantka nazywa to prześwitami.

- **Model łapie kawałki tła** (poduszka, kanapa, półka), najczęściej gdy osoba unosi dłoń, pochyla się albo zmienia się
  światło. Dlatego każde okno z płótnem albo grafiką za osobą przechodzi przez `czysc-tlo`.
- **Co robi `czysc-tlo`:** przy brzegu osoby szacuje tło z tej samej klatki i zostawia tylko to, co się od niego różni, a brzeg dostaje kolor osoby: włosy zachowują kształt, bez szarej otoczki i bez schodków. Duże kawałki mebli usuwa czystym obrazem pokoju, oderwane resztki i migające płaty odcina typowym kształtem osoby z całego okna. Środek osoby jest chroniony, a skóra (kolor próbkowany z twarzy) zostaje przy bokach kadru, więc dłoń nie znika.
- **Po każdym czyszczeniu `kontrola-wyciecia`, oba arkusze.** Szukasz dwóch rzeczy naraz: plam i ubytków.
  - Włosy ucięte, gdy głowa wyszła poza typowy kształt: to okno z `--bez-obwiedni`.
  - Dziura w osobie o kanciastych brzegach (włosy lub ubranie w kolorze ściany): to okno z `--bez-pokoju`.
  - Mały kawałek ściany w szparze między włosami a ramieniem albo cienki pasek poduszki przy ramieniu zostaje. Gdy rzuca się w oczy, daj płótno w kolorze bliższym ścianie albo pokaż to okno bez płótna.
- **Plama trzyma się przez pierwsze klatki ujęcia:** niech płótno wjedzie później. Do tego czasu w tym samym ujęciu stoi
  nagranie, a gdy pokój jest przyciemniony, daj na ten czas kopię nagrania z filtrem płótna (osobny `<video>` z
  `data-media-start`, wyciszony), żeby skóra nie skoczyła, gdy płótno wjeżdża.
- **Postać zmniejszona na płótnie ma ucięte ramiona** prostą linią (krawędź kadru). Zamiast skalować sylwetkę użyj
  pasma u góry: nagranie zjeżdża w dół (`y`), a płótno wjeżdża z góry i przykrywa pustą górę. Ramiona zostają w kadrze.
- **Nic półprzezroczystego przed nagraniem.** Rozmyty koniec dłoni czy naklejki wygląda jak prześwit. Elementy są
  w pełni kryjące, a ich koniec chowa się poza kadrem.
- **Płaskie cięcia przy dłoni:** nie przycinaj sylwetki prostokątem ani wielokątem w miejscu, gdzie porusza się dłoń.

## Polskie znaki

- **Polskie znaki: tylko czcionki z pełnym latin-ext.** Gdy czcionka nie ma polskiej litery, HyperFrames bierze ją
  z czcionki zastępczej i nie zgłasza błędu: „ć” w „zrobić” wychodzi cieńsze i w innym kroju niż reszta słowa.
  Widać to dopiero w zbliżeniu (`rules/sprawdzanie.md`).
- **Wbudowane czcionki HyperFrames w grubościach 400, 700 i 900 mają w środku tylko litery bez polskich.** Polskie
  litery dokłada pobrana z Google Fonts łatka, która nie zawsze wygrywa. Dotyczy Montserrat, Inter, Nunito,
  Playfair Display (krój prosty), JetBrains Mono i EB Garamond (w tych dwóch 400 i 700), a także nazw, które
  HyperFrames na nie podmienia: Helvetica, Arial, SF Pro, Avenir (→ Inter), Georgia, Times (→ EB Garamond).
  Test 2026-11-02, HyperFrames 0.9.1, zbliżenia `snapshot` i render:

  | Gubi polskie litery | Przechodzi |
  |---|---|
  | Montserrat 400, 700, 900 | Montserrat 300, 500, 600, 800 |
  | Inter 400, 700, 900 (też Helvetica, Arial, SF Pro) | Inter 300, 500, 600, 800 |
  | Nunito 400 | Nunito 300, 500, 600, 700, 800, 900 |
  | Playfair Display 400 (prosty) | Playfair Display 700, 800, 900 i każda kursywa |
  | JetBrains Mono 400, 700 | JetBrains Mono 500 |
  | Georgia, Times (EB Garamond) 400, 700 | — |
  | Elsie Swash Caps — nie ma ć, ś, ź, ż | — |

- **Co robić:** w tych rodzinach bierz najbliższą bezpieczną grubość (400 → 500, 700 → 600 albo 800, 900 → 800)
  albo plik czcionki z latin-ext w `assets/fonts/` przez `@font-face` (wtedy HyperFrames nie wstawia swojej wersji
  tej rodziny, więc zadeklaruj wszystkie używane grubości). Nazw systemowych (Helvetica, Arial, SF Pro, Avenir,
  Georgia, Times) nie używaj jako czcionek tekstu.
- Nunito 700 i 900, Playfair Display 700 i 900 oraz Oswald 400 i 700 przechodzą, ale z tego samego powodu co
  gubiące — po aktualizacji HyperFrames sprawdź je zbliżeniem. Pozostałe wbudowane rodziny (Poppins, Roboto, Lato,
  Outfit, Open Sans) są niesprawdzone: traktuj je jak Montserrat.
- Czcionki z Lookbooka spoza HyperFrames (Inter Tight, Barlow Condensed, Figtree, Space Grotesk, Archivo, Anton,
  Abril Fatface, DM Serif Display, Newsreader, Instrument Serif, Cormorant, Caveat, Marck Script, Pixelify Sans)
  przez link Google Fonts przechodzą. Bebas Neue HyperFrames rysuje jako League Gothic (polskie litery są).
- Nowa czcionka albo grubość spoza tej listy: najpierw zbliżenie z tekstem „ąćęłńóśźż ĄĆĘŁŃÓŚŹŻ zrobić”.

## Render

- **Czarny ekran albo zamrożone wideo:** każdy `<video>` musi mieć `id`. Każdy nakładający się w czasie element
  wideo i dźwięku (także efekty dźwiękowe `<audio>`) potrzebuje własnego `data-track-index`.
- **Animacja nie działa:**
  - Animuj wyłącznie GSAP na jednym zatrzymanym (paused) timeline. `requestAnimationFrame`, `setTimeout`,
    `setInterval` i CSS `@keyframes` nie działają przy renderze klatka po klatce (CSS zostaw najwyżej dla
    drobnych dekoracji).
  - Timeline rejestruj jako obiekt z nazwą kompozycji:
    `window.__timelines = window.__timelines || {}; window.__timelines["<id-kompozycji>"] = tl;`
    (to obiekt, nie tablica).
  - Stany początkowe ustawiaj `gsap.set(...)` **poza** timeline.
- **Element widoczny, zanim powinien:** `fromTo` od razu pokazuje stan „from”. Dla wszystkiego, co ma być ukryte do
  swojego czasu, dodaj `immediateRender: false`. Płótno albo inny duży element, który wjeżdża po cięciu, dostaje stan
  początkowy przez `gsap.set` poza osią czasu. Podgląd `snapshot` tego nie pokazuje: mignięcie widać dopiero na arkuszu
  cięć po renderze.
- **Przezroczystość nie działa:** silnik sam pilnuje widoczności elementów z `data-start` (klipów) i wymusza im pełną
  widoczność. Nie animuj `opacity` ani `autoAlpha` na samym klipie — owiń go w zwykły `div` i animuj ten `div`.
- **Warstwa „3% przezroczystości” świeci na 100%:** `autoAlpha: 1` nadpisuje `opacity` z CSS. Niską przezroczystość
  daj elementowi w środku albo animuj `opacity` do docelowej wartości.
- **Element z `opacity: 0` na starcie znika na stałe w niektórych wersjach:** gdy tak się dzieje, zacznij od `0.01`.
- **Lint odrzuca animację odstępów między literami (`letterSpacing`):** udawaj rozstrzelenie przez `scaleX`
  (np. 1,45 → 1) z lekkim rozmyciem.
- **Cały skrypt przestaje działać:** `id` z apostrofem (np. z „i’ve”). W `id` tylko litery, cyfry i myślniki.
- **Maska CSS (`mask-image`) znika w renderze:** przezroczystość wypal w pliku (WebM VP9 z kanałem alfa przez
  FFmpeg), zamiast maskować w CSS.
- **Czarne klatki w renderze:** za dużo ciężkiego rozmycia (`backdrop-filter`, `blur`) naraz. Najwyżej kilka
  elementów z rozmyciem.
- **Tekst rozmazany po powiększeniu:** nie skaluj napisów `scale()` w górę na stałe — ustaw większy `font-size`
  (krótkie „wskoczenie” ze skali 1,2 do 1 jest OK).
- **Czcionka systemowa zamiast wybranej:** czcionka nie zdążyła się wczytać. Najlepiej pliki czcionek lokalnie w
  projekcie (`@font-face`, `font-display: block`); z Google Fonts zawsze z `display=swap` i `preload`.
- **Nieskończona pętla zamraża render:** nigdy `repeat: -1` bez skończonej długości elementu, nigdy
  `animation-iteration-count: infinite`.
- **Dwa rendery tej samej klatki różnią się:** `Math.random()` albo `Date.now()` w animacji. Używaj stałych wartości.
- **Render przekracza czas:** za dużo warstw albo za długa scena — podziel na krótsze kompozycje (do ~15 s).

## FFmpeg

- **Plik WebM bez przezroczystości:** koduj z `-c:v libvpx-vp9 -pix_fmt yuva420p -auto-alt-ref 0`. Odczytując klatki
  z takiego pliku, podaj dekoder przed plikiem: `-c:v libvpx-vp9 -i plik.webm`, inaczej przezroczystość zniknie.
- **Niedokładna klatka:** `-ss` przed `-i` przy kopiowaniu strumienia skacze do najbliższej klatki kluczowej.
  Przy wycinaniu klatek do sprawdzenia dawaj `-ss` po `-i` albo licz klatki (`select=eq(n,…)`).
- **`-vf` i `-af` razem przy kilku wejściach:** użyj `-filter_complex` z mapowaniem.
- **FFmpeg kończy się błędem, a plik jest:** sprawdź, czy plik wyjściowy istnieje i ma rozmiar > 0, zanim uznasz,
  że się nie udało.
- **Polskie znaki w napisach jako „?”:** każdy plik tekstowy (HTML, .ass, JSON) zapisuj w UTF-8, bez BOM.

## Windows

- **Ścieżki w filtrach FFmpeg** (`subtitles=`, `movie=`) psują się przez dwukropek dysku i ukośniki odwrotne. Nie
  wkładaj ścieżek do filtrów — pliki podawaj przez `-i`, a listy `concat` trzymaj z samymi nazwami plików
  (skrypty Studio już tak robią).
- **Polskie znaki rozsypane:** Windows otwiera pliki tekstowe w starym kodowaniu, jeśli się go nie poprosi o UTF-8.
  Każdy zapis i odczyt pliku tekstowego z jawnym `utf8`.
- **Program zainstalowany w trakcie pracy nie jest widoczny,** dopóki Claude nie zostanie całkiem zamknięty i
  otwarty ponownie.
- **Zabezpieczenia Windows 11 / antywirus** potrafią raz zablokować bibliotekę obrazów albo FFmpeg (`spawn EBUSY`).
  Spróbuj raz jeszcze; jeśli dalej blokuje, powiedz kursantce, co zostało zablokowane.
- **Wycinanie z tła jest dużo wolniejsze** (bez przyspieszenia graficznego). Uruchom w tle i buduj resztę w tym czasie.
- Polecenia: pełne ścieżki w cudzysłowie z ukośnikami `/`, jedno polecenie na raz, bez `&&`, bez `~` w argumentach.
