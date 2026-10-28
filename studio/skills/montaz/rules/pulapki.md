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
  swojego czasu, dodaj `immediateRender: false`.
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
