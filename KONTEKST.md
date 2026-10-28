# Kontekst projektu — AI Content Creator Studio

Ten plik czyta Claude na początku każdej sesji. Zawiera wszystkie ustalenia, decyzje i stan prac.
Aktualizuj go po każdej sesji roboczej.

---

## Co to jest

Wtyczka Claude Code dla kursantów kursu AI Content Creator Studio (autorka: Marzena Kiełkowska).
Kursantka nagrywa, Claude montuje rolkę w jej stylu — na jej własnym komputerze, bez zewnętrznych serwerów.

Repozytorium: https://github.com/marzenakielkowska/ai-content-creator-studio
Wtyczka instaluje się przez: `claude plugin marketplace add marzenakielkowska/ai-content-creator-studio`

---

## Co już działa (wersja 0.5.13)

| Skill | Komenda | Co robi |
|---|---|---|
| start | `/studio:start` | Instaluje narzędzia: Node, FFmpeg, HyperFrames, model mowy, przeglądarka do renderu, **yt-dlp**; sprawdza (nie instaluje) Pythona; włącza automatyczne aktualizacje |
| witaj | `/studio:witaj` | Sprawdza czy wtyczka działa |
| lookbook | `/studio:lookbook` | Kursantka wybiera styl napisów, efektów, kolorów, czcionek i układ napisów/nagłówka; zapisuje do `moj-styl.json` |
| dzwieki | `/studio:dzwieki` | Kursantka wybiera dźwięki, zapisuje do `moj-styl.json` |
| montaz | `/studio:montaz` | Montaż rolki: 8 kroków z zatrzymaniem na OK po każdym (szczegóły niżej) |

Stos techniczny: Node.js + Shell (Mac) / PowerShell (Windows). Python 3 opcjonalny, tylko dla efektu „Przed i po”
(sama biblioteka standardowa); Studio go nie instaluje, a Pillow/numpy od 2026-10-28 nie są instalowane (nic ich nie
używało poza `_stare`). Wycinanie z tła: `hyperframes remove-background` (bez Pythona). Zasada: nowy efekt, który
czegoś potrzebuje, pyta o zgodę w chwili użycia. Bez sudo.

Foldery na komputerze kursantki:
- `~/.ai-content-studio/` — narzędzia, yt-dlp, biblioteka wzorców (`wzorce/`)
- `~/.ai-content-creator-studio/` — zapisany styl (`moj-styl.json`), używany przez lookbook, dzwieki i montaz

---

## Skill montażu (`studio/skills/montaz/`)

Stan od 2026-10-28. Kroki w `SKILL.md`: 1 wczytanie (kilka nagrań naraz) → 2 transkrypcja do sprawdzenia →
3 plan cięć (`edl.json`, OK kursantki) → 4 plan montażu (efekty, OK) → 5 przygotowanie kadru (sylwetka, głowa,
wstawki równolegle) → 6 storyboard → 7 budowa i render → 8 sprawdzenie → 9 oddanie. Na końcu SKILL.md: „Wygląd
domyślny” (wnioski z praktyki, gdy styl kursantki nie mówi inaczej).

Skrypt `scripts/montaz.mjs` (Node + FFmpeg + HyperFrames, bez Pythona; `montaz.sh` / `montaz.ps1`):
`wczytaj`, `pauzy`, `zloz` (równe 30 kl/s, `segmenty.json` z klatką każdego cięcia), `transkrypcja`, `wytnij-tlo`
(ze sprawdzeniem zgodności klatek), `glowa` (`glowa.json`), `strefa` (nakładka strefy Reels na podglądy),
`sprawdz-ciecia` (arkusz klatek przed/po cięciu, głośność, kopia 720p), `glosnosc`.
Przetestowane 2026-10-28 na dwóch nagraniach Marzeny łącznie z renderem HyperFrames.
Strefy Instagrama (2026-10-28, zmierzone na zrzutach Marzeny, wersja ostrzejsza): góra Y 0–220, dół od Y 1470,
boki 60 px, kolumna ikon X 900–1080 od Y 1050. Montaż ma też krok 0 (nowa rolka / kontynuacja wg plików w projekcie)
i tryb cięcia ręczny/automatyczny (`ustawienia-montazu.json`).

| Plik `rules/` | Co zawiera |
|---|---|
| `ciecie.md` | wybór ujęć z kilku nagrań, punkty cięcia, potwierdzanie pauz, przybliżenia, `edl.json` |
| `uklad.md` | pomiar głowy, napisy wprowadzające, karty pod brodą, słowo za głową (wzór), czasy cięć |
| `napisy.md` | co pokazać, oznaczanie słów, gdzie i kiedy |
| `grafiki.md` | plan, prawda na ekranie, czas wyświetlania, oryginalne zrzuty |
| `ruch.md` | GSAP: czasy, easing, wzorce wejść/wyjść, efekt na cięciach |
| `wstawki.md` | animowane wstawki: kiedy równolegle (2+ złożone), zlecenie dla pomocnika |
| `tryb-tlumaczenia.md` | gdy kursantka tłumaczy proces: podział ekranu, przejście, 15 klocków, napisy w pigułce |
| `sprawdzanie.md` | 6 defektów, 4 warunki, kontrola cięć na renderze, głośność, kopia na telefon |
| `pulapki.md` | znane pułapki HyperFrames, FFmpeg i Windows |

`_stare/` — poprzednia wersja (archiwum). Zasady z niej są już przeniesione do `rules/`; `replicate.md`,
`gifs.md`, `napisy-style.md` i `wzorzec.md` nie są przeniesione. Trzy gotowe „wyglądy” z prywatnego skilla
„video-edit” świadomie NIE są przenoszone (Studio ma własny Lookbook).

Gdy brak `moj-styl.json`, montaż pyta: film wzorcowy, opis słowami albo lookbook (patrz niżej).

---

## Lookbook (`studio/lookbook/`)

- `gotowe/` — 3 gotowe zestawy: ciepły wieczór, delikatna siła, energia
- `napisy/` — 6 stylów napisów (stare; 23 nowe czekają na prawdziwe podglądy)
- `efekty/` — 13 efektów, opis wykonania w `efekty/INDEX.md`
- Efekt „Przed i po” (październik 2026) ma pełne wykonanie: HyperFrames (`hf/`), `PRZEPIS.md`,
  `measure.py`, `build.py`, podgląd wideo z dźwiękiem. To efekt samodzielny (osobny klip, nie nakładka),
  z opcją dwóch nagrań bez filtra ciemności. Wybór koloru i etykiet usunięty z Lookbooka.
- Dodawanie stylów: `lookbook/JAK-DODAC-STYL.md`

### Sekcje Lookbooka (v0.5.x, październik 2026)

Lookbook ma 7 kroków (sekcji):
1. Krok 1 — Napisy (wybór stylu napisów)
2. Krok 2 — Efekty (wybór efektów wideo, filtr kategorii)
3. Krok 3 — Kolory (kolor główny, akcent, nagłówek, CTA)
4. Krok 4 — **Układ** — suwaki pozycji napisów (24–55% od dołu) i nagłówka (12–50% od góry; dolne granice = strefy Instagrama); podgląd telefonu odświeża się na żywo
5. Krok 5 — Czcionki (czcionka napisów, nagłówka, CTA)
6. Krok 6 — Dźwięki
7. Krok 7 — Styl (gotowy zestaw)

Zapisywanie: możliwe z samym efektem (bez napisów). Przycisk „Wyczyść wybór” kasuje poszczególne sekcje. Po zapisaniu kursantka dostaje podpowiedź `/studio:montaz`.

---

## Otwarte sprawy do decyzji

1. ✅ **Linki do materiałów wideo — decyzja podjęta (2026-10-25).**
   Kursantka może podać URL zamiast pliku. Flow: yt-dlp próbuje pobrać → jeśli zawiedzie, Claude przechodzi
   do Apify i informuje kursantkę jednym zdaniem. Pobieranie ograniczone do 960p (ok. 4× mniejszy plik).
   Zaktualizowano: `SKILL.md` montażu. `rules/wzorzec.md` i `replicate.md` dotyczą analizy stylu
   (inny przepływ) — nie wymagają zmian.
2. **`co-nowego.json` przy 0.4.0** opisuje tylko Lookbook, a montaż też wszedł w tej wersji.
3. **README obiecuje „jeden folder Studio”**, a są dwa (patrz wyżej). Do wyboru: ujednolicić folder
   (zmiana w serwer.mjs lookbooka i dźwięków + SKILL.md) albo poprawić opis w README.
4. ~~numpy i rembg poza folderem Studio~~ — załatwione 2026-10-28: Studio nie instaluje już bibliotek Pythona.
   Zostaje zapasowa droga `pip install rembg` w PRZEPIS.md efektów wycieta-z-tla i orbita (pyta o zgodę, ale
   polecenie `rembg i` działa tylko na zdjęciach, nie na wideo) — do poprawy albo usunięcia.
5. ~~Python nie w wymaganiach~~ — załatwione 2026-10-28: README i /studio:start mówią, że jest opcjonalny i do czego.
   Do rozważenia: przepisać skrypty „Przed i po” z Pythona na Node, wtedy Python znika z wymagań całkiem.
6. **README: usunąć słowo „testowa"** — gdy studio wyjdzie z fazy testów (lookbook gotowy, ścieżka
   onboardingowa działa), usunąć „Wersja testowa." z bloku info w README.md oraz z sekcji „Stan lookbooka".

---

## Kluczowe decyzje projektowe

### Programy i biblioteki potrzebne efektom (ustalone 2026-10-28)

- Studio instaluje tylko to, czego coś faktycznie używa. Pillow i numpy usunięte z instalacji, bo nic aktywnego
  ich nie używało. Kod ich instalacji jest w historii git (przed commitem „bez bibliotek Pythona”).
- **Gdy nowy efekt czegoś potrzebuje** — zorganizować to przy dodawaniu efektu: dopisać do `/studio:start`
  (lista przed zgodą) albo dodać sprawdzenie na początku jego PRZEPIS.md. Zasada jest w `lookbook/JAK-DODAC-STYL.md`.
- Python opcjonalny (tylko „Przed i po”); kursantka instaluje go sama po informacji.
- **Wsparcie:** do zrobienia raport dla kursantki (np. `/studio:witaj`), który pokazuje wersję Studio i co jest
  zainstalowane, żeby na zgłoszenie „nie działa” dało się sprawdzić, czy brakuje programu.

### Profile klientów (do zrobienia)
Kursantki montują też dla swoich klientów. Planowana zmiana struktury:
- `moj-styl.json` → `profil-moj.json` (własny styl)
- `profil-[nazwa].json` dla każdego klienta
- `aktywny-profil.txt` — jeden plik z nazwą aktywnego profilu
- Zmiana w `serwer.mjs` Lookbooka: przyjmuje argument `--profil <nazwa>`
- Szacowany nakład: ~20 linii kodu

### Stan lookbooka i ścieżka kursantki

**Teraz (wersja testowa):**
Kursantka nie przechodzi przez lookbook przy pierwszym uruchomieniu. Gdy wpisuje `/studio:montaz` bez `moj-styl.json`, Claude pyta jak chce montować: film wzorcowy, opis słowami, albo lookbook. To pozwala testować montaż zanim lookbook będzie gotowy.

**Docelowo (po zbudowaniu lookbooka):**
Kursantka przy pierwszym uruchomieniu (`/studio:start`) powinna przejść przez pełną ścieżkę onboardingową:
1. `/studio:lookbook` — wybiera styl napisów z podglądami (prawdziwymi, nie makietami)
2. `/studio:dzwieki` — wybiera dźwięki i efekty
3. Dopiero potem `/studio:montaz` używa zapisanego `moj-styl.json`

**Co blokuje lookbook:**
Marzena nagrywa teraz filmy testowe i tworzy style (montuje próbne rolki w różnych wariantach). Po zatwierdzeniu tych stylów wchodzą jako prawdziwe podglądy do lookbooka. Lookbooka NIE robimy z makiet — tylko z prawdziwych zmontowanych przykładów.

**Kiedy wrócimy do tego:**
Gdy Marzena nagra i zatwierdzi style → wtedy budujemy lookbook z prawdziwymi podglądami i przywracamy obowiązkową ścieżkę onboardingową.

---

### Zakres produktu (co robimy, czego nie)

**W zakresie:**
- Kursantka wrzuca materiał → wybiera styl/czcionki/dźwięki → Claude + HyperFrames montują → kursantka pobiera gotową rolkę i sama publikuje
- Warianty rolek do testowania (patrz niżej)

**Poza zakresem:**
- Publikowanie na Instagram/TikTok (kursantka robi to sama po pobraniu)
- Integracja z zewnętrznymi narzędziami do planowania postów

### Warianty rolek do testowania

Kursantka po zmontowaniu rolki może poprosić o N wersji próbnych. Claude pyta:
> „Chcesz 3 wersje próbne z innym hookiem albo innym zestawem efektów?"

Każda wersja różni się jedną rzeczą (inny hook, inne efekty, inny styl napisów). Kursantka testuje która działa najlepiej na Instagramie.

Krok 8a w `SKILL.md` montażu już to opisuje. Szczegółowy plik zasad wariantów — jeszcze nie powstał.

### Kolejność budowania
1. ✅ Reguły grafik → checks → NOTES_LOG → SKILL.md skilla montażu
2. ✅ Uzupełnienia do cut.md (cisza wewnątrz słowa, formuła głośności)
3. ✅ Wykrycie pozycji mówiącej (krok 2b, layout.json)
4. ✅ `gotchas.md` — znane błędy HyperFrames i FFmpeg
5. ✅ `motion.md` — zasady animowania warstw graficznych
6. ✅ `gifs.md` — wstawianie GIF-ów do rolek
7. ✅ `replicate.md` + `wzorzec.md` — kopiowanie stylu z rolki wzorcowej, biblioteka wzorców
8. ✅ Skrypty montażu, wersja 0.4.0
9. ✅ Efekt „Przed i po” w Lookbooku z podglądem wideo
10. ✅ Lookbook v0.5.x: kolory, czcionki, sekcja Układ (suwaki pozycji napisów i nagłówka)
11. ✅ yt-dlp: automatyczna instalacja w `/studio:start` + obsługa URL w montażu (fallback Apify)
12. ⏳ Ujednolicić pozostałe sprawy z sekcji „Otwarte sprawy do decyzji” (punkty 2–6)
13. ⏳ Podglądy stylów w Lookbooku (po nagraniu testowym)
14. ⏳ Warianty rolek — szczegółowy plik zasad
15. ⏳ Profile klientów (zmiana Lookbooka)
16. ⏳ Ocenić czy przywrócić `replicate.md` z `_stare/` — po przetestowaniu lookbooka z efektami. Plik ma wartościowe instrukcje (wyciąganie klatek, mapowanie stylu, styl-wzorzec.json). Nie przywracać `wzorzec.md` — opisuje komendy których skrypt już nie ma.

**Uwaga do gotchas.md:** To plik dla Claude — kursantka go nie widzi. Claude czyta go gdy HyperFrames lub FFmpeg zwraca błąd i stosuje znane rozwiązanie automatycznie, bez angażowania kursantki.

### Źródła reguł
Reguły montażu wypracowane wewnętrznie na podstawie doświadczeń z montażem rolek.

---

## 23 style napisów

Zdecydowane nazwy i czcionki. Do implementacji w Lookbooku.

| # | Nazwa | Czcionka |
|---|---|---|
| 1 | Biały piksel | Pixelify Sans |
| 2 | Słowa kluczowe | Figtree |
| 3 | Notatnik | DM Serif Display |
| 4 | Nagłówek | Inter Tight (Black) |
| 5 | Pojedyncze słowa | Barlow Condensed |
| 6 | Jedno słowo naraz i kursywa | Instrument Serif + Playfair Display italic |
| 7 | Mocne słowo i ozdobny tytuł | Elsie Swash Caps |
| 8 | Mocna linia | Archivo Black + Archivo italic |
| 9 | Styl kinowy | Newsreader italic |
| 10 | Liczby i wezwania | Barlow Condensed + Inter Tight |
| 11 | Mocny pokaz | Inter Tight (900) |
| 12 | Cozy style | Figtree + Playfair Display italic |
| 13 | Męski styl | Montserrat + DM Serif Display |
| 14 | Karaoke | Archivo (800) |
| 15 | Podkreślenie | Inter Tight + Marck Script |
| 16 | Małe litery i słowa kluczowe | Inter Tight (700) |
| 17 | Mocne słowa | Inter (300) + Inter Tight (900) |
| 18 | Styl terminal | JetBrains Mono + Newsreader italic |
| 19 | Kontury | Bebas Neue |
| 20 | Męskie studio | Inter (500) |
| 21 | Retro plakat | Abril Fatface |
| 22 | Miękki styl | Nunito |
| 23 | Biznes | Space Grotesk |

Wszystkie czcionki z Google Fonts (licencja OFL).

---

## Jak zacząć nową sesję

Powiedz Claude na początku rozmowy:

> Pracujemy nad AI Content Creator Studio. Przeczytaj plik KONTEKST.md z repozytorium:
> https://github.com/marzenakielkowska/ai-content-creator-studio/blob/main/KONTEKST.md
> i zacznij od miejsca gdzie skończyłyśmy.

---

## Style napisów w Lookbooku — jak powstaną podglądy

Lookbook ma teraz 6 starych stylów. 23 nowe style (z napisy-style.md) jeszcze nie są w Lookbooku.

**Plan:**
1. Marzena nagrywa film testowy
2. Claude montuje go w różnych stylach napisów
3. Marzena zatwierdza te które wyglądają dobrze
4. Zatwierdzone wersje wchodzą do Lookbooka jako prawdziwe podglądy (nie makiety)

Nie budować podglądów na sucho — czekamy na nagranie testowe.

---

## ⚠️ Przed oddaniem projektu klientom

Ten plik musi zostać usunięty z GitHuba zanim projekt trafi do klientów.
Repozytorium jest publiczne, więc do tego czasu ten plik (z planami) jest widoczny dla każdego.

1. `git rm KONTEKST.md`
2. Dodaj `KONTEKST.md` do `.gitignore`
3. Zachowaj plik lokalnie w `~/Documents/` poza folderem repo
4. Commit + push

---

*Ostatnia aktualizacja: 2026-10-25*
