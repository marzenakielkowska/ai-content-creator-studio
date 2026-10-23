# Katalog stylów montażu

Każdy styl zawiera: jak wygląda, font, timing, pozycja, animacja. Bez żadnych skrótów ani kodów.

Używaj opisów z tego pliku jako instrukcji do budowania efektów w HyperFrames.

---

## Wejście

Pierwsze 1–3 sekundy. Musi być w pełni na ekranie od klatki 0. Przyciąga uwagę, zanim palec przewinie.

### Gruby tytuł za głową
Font: Impact lub Bebas Neue, ok. 120px, biały kursywa (lekki). Nad tym: gruby żółty tytuł (140px, bold caps) z bardzo ciemnym obramowaniem (espresso, 4px). Kursantka wycięta z tła i stoi przed napisami. Efekt głębi. Oba napisy widoczne od klatki 0, znikają po 3s prostym fade.

### Naklejkowe haki z logoami
Kilka białych "naklejek" (zaokrąglone prostokąty) ustawionych pionowo. Gruba czarna ramka. Wewnątrz: nazwa marki/aplikacji wg koloru brandu + jej logo. Idealny do porównań ("X vs Y"). Font: Inter Bold, 28–32px. Wchodzą razem w 0.3s z odbiciem (ease back), znikają przy pierwszej zmianie sceny.

### Ciepłe litery z maszyny
Napisy ustawione w pionowym stosie, wszystkie litery wielkie (caps), w kolorze "kremowym" (#F5E6C8), outline espresso (#3D2B1F) 3px. Pod spodem mała linia z podtytułem w kolorze karmelowym. Font: Playfair Display lub Abril Fatface, 96px. Czuć ciepło i przyjaźń. Wchodzą od klatki 0, jedno po drugim z 0.1s opóźnieniem.

### Stos scrapbookowy
Dwie linie: pierwsza — cienka kursywa serif, mała (36px); pod nią — gruba zaokrąglona lowercase (80px). Miękki, redakcyjny klimat. Font: linijka 1 — Cormorant Italic; linijka 2 — Nunito ExtraBold. Kolor kremowy. Wchodzą razem z fade 0.2s, zostają przez pierwsze 4s.

### Blok z hakiem, znika po 3s
Jeden płaski kolorowy prostokąt (kolor tła wg marki lub czarny) z jednolinijkowym hakiem. Po 3s wylatuje w górę ease.in. Kadr jest potem czysty. Font: Inter Black, 40px, biały, wyśrodkowany.

### Hak nakręcony w efekcie
Kursantka nagrywa hak już będąc w miejscu, o którym mówi (fotel biznesowej klasy, scena eventu, biuro). Miejsce udowadnia tezę zanim ją powie. Brak grafik — sam kadr mówi wszystko.

### Pytanie od klatki 0 + wyskakują logotypy
Mówione pytanie zapisane na ekranie od klatki 0, tuż poniżej górnej strefy bezpiecznej. Font: Inter SemiBold, 42px, biały. Na pierwszym słowie oznaczającym markę — logo danej marki wpada z góry z odbiciem (0.25s ease back). Napisy znikają przy pierwszej zmianie sceny.

### Odręczna etykieta + gruby lowercase
Górna linia odręczna (font: Caveat, caps, 32px, espresso kolor). Pod nią: gruby lowercase (font: Nunito Black, 96px). Całość na płaskim żółtym tle (#F5E640). Pod napisami — kadr wideo jako karta z realnym bańką komentarza. Klimat rękodzielniczy. Wchodzi cały blok od klatki 0, lekkie bounce.

### Przekreślone logo vs logo
Dwa ikony apek ustawione obok siebie u góry kadru. Stare narzędzie: czerwony krzyż X na ikonę. Nowe: czyste, bez dodatków. Ikony wchodzą razem 0.2s, krzyż wchodzi 0.1s później. Mówi "to zastępuje tamto" bez słów.

### Dwuwagowy tytuł
Dwie linie wyśrodkowane nad głową: pierwsza — heavy black caps (font: Anton lub Bebas Neue, 100px); druga — cienka condensed caps (font: Barlow Condensed Light, 60px). Obie widoczne od klatki 0, unoszą się w górę i znikają po ok. 3s, ease.inOut.

---

## Napisy mówione

Jak słowa kursantki pojawiają się na ekranie. Nigdy na twarzy.

### Frazy z akcentem (żółte słowo)
Krótkie frazy w zdaniowej pisowni, słowa pojawiają się w miarę mówienia. Jedno glowing żółte słowo kluczowe na frazę. Font: Caveat lub Inter Regular, 48px, biały. Pozycja: strefa dolna, nad dolną granicą bezpieczną. Każde słowo wchodzi z lekkim fade 0.1s, żółte słowo z glow blur 8px.

### Jedno wielkie słowo
Wielkie litery (caps), jedno słowo naraz, biały, miękki cień (rgba(0,0,0,.5), blur 8px). Font: Inter Black, 96–110px. Ostre i szybkie, działa przy ekspresywnych zdaniach. Słowo wchodzi ze scale 0.85→1 w 0.12s, wychodzi z fade 0.08s.

### Bez napisów
Czyste ujęcie, tylko tytuły i grafiki. Działa przy spokojnym lub premium klimacie.

### Małe + DUŻE słowo kluczowe
Małe słowa lowercase (font: Inter Regular, 38px, biały), a jedno keyword na linię — duże i bold w kolorze akcentu. Font słowa kluczowego: Inter Black, 72px. Pozycja: centrum lub dolna 1/3 kadru.

### Frazy w białej "pigułce"
Krótkie frazy, słowa wpadają w rytm mówienia, jedno keyword w białym zaokrąglonym prostokącie (padding 8px 16px, border-radius 20px). Font: Inter SemiBold, 44px. Blok mieści się w strefie bezpiecznej, sam schodzi gdy pojawia się produkt lub ekran.

### Biała linia + żółta pointa
Mała lowercase biała linia (36px). Pod spodem — główne słowa rozmywają się (blur 0) i pojawiają, większe i żółte (72px). Cały blok wymazuje się przez blur przy zmianie frazy. Font: Inter dla małej, Inter Black dla dużej.

### Śledzone caps + wielka serif
Dwie warstwy: mała line z szeroko spacingowanymi caps (font: Montserrat Light, letterSpacing 0.25em, 24px, biały); pod nią duże słowo kluczowe w serifa (font: Playfair Display Italic, 80px). Litery drugiej linii wyrastają spod maski (clip-path reveal 0.4s). Redakcyjny, ekskluzywny klimat.

### Mały caps pod brodą
Jedna krótka linia, małymi literami (all-caps), 28px, white, tuż pod brodą. Font: Inter Medium. Ledwo widoczna — nie przeszkadza w czytaniu UI nad głową. Bez animacji, pojawia się z opacity 0→1 w 0.15s.

### Schodkowe napisy
Słowa lądują jedno po drugim i schodzą ukosem w dół przez wolną przestrzeń kadru — 3 do 5 linii, potem kasują się. Font mały: Inter Bold, 36px, biały caps. Słowo kluczowe: duże serif italic z podkreśleniem wjechającym spod (font: Playfair Display Italic, 72px, kolor jasnoniebieski #C8E0F5). Pozycja: tam gdzie kadr jest pusty, nigdy na twarzy.

---

## Układ kadru

Jak kursantka i grafiki dzielą przestrzeń 9:16.

### Głębia z wycięciem
Kursantka wycięta i stoi przed pływającymi kartami, logotypami i tytułami. Pokój za nią rozmazany (blur 20px). Daje złudzenie głębi.

### Podzielony ekran
Dowód lub b-roll na górnej połowie, kursantka na dolnej. Twarde cięcia między nimi.

### Scrapbookowe tło
Miękkie niebieskie lub kremowe tło (#EBF3FB). Kursantka wycięta. Białe karty z ramką lekko przechylone, naklejki. Klimat rękodzielniczy.

### Pełny kadr + pływające grafiki
Normalne ujęcie. Grafiki pojawiają się w wolnej przestrzeni nad głową lub z boku. Najczęściej używany layout.

### Górny pas opowieści
Kursantka w dolnych 2/3 kadru. Czysty pas powyżej głowy na cytaty, archiwalne zdjęcia i dowody. Twarz zawsze widoczna.

### Tablica nad głową
Kadr low (kursantka przystrzyżona do dolnej połowy), cała pusta ściana powyżej pełna tekstu. Nic na ciele.

### Trzy-układowa rotacja
Rotacja trzech ujęć: (1) podzielony z dowodem na górze, (2) twarz z jednym dużym słowem, (3) pełnoekranowy dowód. Zmiana przy każdym nowym pomyśle.

### Narrator z polaroidem
Ekran (np. okno Claude) jako główna karta. Kursantka mówi z małego pochylonego polaroidu w rogu. Dobry do pokazywania procesu.

### Przed / po obok siebie
Mała karta "Przed" z etykietą po lewej, duża karta "Po" po prawej, obie odtworzone jednocześnie, nagłówek "Edytowane przez" na miękkim wzorzystym tle.

---

## Dowód

Pokazuje, że to co mówisz jest prawdą. Tylko prawdziwe źródła, prawdziwe ekrany.

### Artykuł z zaznaczeniem
Prawdziwy screenshot artykułu zbliża się do cytatu, żółty zakreślacz przesuwa się przez cytat, etykieta z datą i źródłem. Zbliżenie: scale 1→1.35 w 0.8s ease.out.

### Oficjalny materiał demo
2–5 sekund z oryginalnego launch video producenta, podpisane etykietą (np. "źródło: [marka] launch 2024").

### Wielka liczba rosnąca
Liczba animuje w górę za głową kursantki, na słowie ze statystyką. Font: Anton lub Bebas, 180px, żółty lub biały. Animacja count-up: duration 1.5s, ease.out.

### Karta z postem
Prawdziwy post z X, Threads lub LinkedIn pływa jako karta (zaokrąglona, cień, border-radius 16px).

### Prywatne archiwum
Prawdziwe stare wideo i zdjęcia kursantki na pasujących liniach (pierwsze wideo, teamowe zdjęcia, eventy). Najsilniejszy ludzki sygnał. Wchodzą jako polaroidy z flash 0.1s.

### Dowód kursorem
Prawdziwe narzędzie lub tabela, nagrana screencapture z widocznym kursorem wskazującym liczbę. Mała etykieta źródła.

### Palec na ekranie
Nagranie telefonem laptopa z palcem wskazującym prawdziwe saldo lub wynik.

---

## Akcenty wizualne

Grafiki do konkretnych linii tekstu. Nie na każdej linii — tylko tam, gdzie obraz wzmacnia przekaz.

### Kafelki logotypów z rolami
Oficjalne loga aplikacji wpadają na słowie, każde z jednowyrazową rolą (np. "rozumowanie", "obrazy", "muzyka"). Font etykiety: Inter Medium, 24px. Każde logo wchodzi z scale 0→1, ease back, 0.2s.

### Loga połączone strzałkami
Strzałki rysują się między kafelkami logo — pokazują relację lub zmianę. Strzałka: stroke-dashoffset animacja 0.4s ease.in.

### Jedno duże słowo
Pojedyncze wielkie słowo tytułowe na pytaniu lub pointcie ("Dlaczego?", "Zwrot akcji"). Font: Bebas Neue lub Anton, 140px. Wchodzi z scale 0.7→1 i fade 0.2s.

### Szybkie logotypy
Loga migają szybko w jednym slocie (interwał 0.06s), potem zatrzymuje się i wpada fraza ("co tydzień"). Liczba migań: 6–10.

### Stos porównawczy
Kafelki produktów wpadają jeden po drugim z ceną i opisem dla kogo. Font: Inter Medium, 32px, karta ciemna (#1A1A1A, border-radius 12px, padding 16px). Co 0.3s nowy kafelek ze slide z prawej.

### Wielkie słowo pointy
Jedno olbrzymie bold słowo przez cały kadr na moment pointy. Font: Anton, 200px+, kolor wg stylu. 0.15s scale 0.8→1, ease back.

### Kinetyczna karta tekstowa
Pełnoekranowe zdanie budowane słowo po słowie z ikonkami emoji wbudowanymi w tekst. Font: Inter Bold, 48px. Każde słowo wchodzi co 0.15s z fade.

### Karta z cytatem
Gdy cytujesz kogoś — ich słowa piszą się w cudzysłowach w górnym pasie kadru. Font: Playfair Display Italic, 44px. Pojawia się z fade, zostaje do końca cytatu.

### Montaż z prawdziwego życia
Pełnoekranowe cięcia do prawdziwych klipów z wydarzeń i codzienności na emocjonalnej linii. Bez grafik.

### Płaski sponsor UI
Przepływ sponsorowania jako proste płaskie karty (komentarz, DM, email). Bez świecenia, bez 3D. Font: Inter, 36px.

### Nagłówek postępu
Nagłówek krokuje przez listę lub drabinkę i zostaje, żeby widz wiedział gdzie jest. Font: Inter SemiBold, 32px, kolor akcentu dla aktywnego kroku.

### Wyskakujące logo z blaskiem
Oficjalne logo + nazwa aplikacji wyskakuje z miękkim białym rozbłyskiem (bloom), lekkie odbicie i sweep lśnienia. Bez karty wokół. Dźwięk: magiczny pop. Scale 0→1.1→1, 0.3s.

### Kołowy timer iOS
Matowy pierścień (frosted glass) w wolnym centrum kadru, liczy w górę do podanej liczby w ok. 2s, potem znika. Stroke animacja z ease.inOut.

### Widżet kalendarza
Biały iOS-style widżet pojawia się i przerzuca rok do tyłu na słowach ("10+ lat temu"). Gets jego własny czysty moment. Font: SF Pro lub Inter, systemowy styl.

### Powiadomienie iPhone
Prawdziwy iOS banner zsuwa się z góry z treścią powiedzianą w zdaniu ("Raport wysłany do teamu"). Wąski, wewnątrz strefy bezpiecznej. Po 2s zsuwa się z powrotem.

### Kafelki Centrum Sterowania
iPhone Wi-Fi i Telefon kafelki wyłączają się na słowach ("bez internetu, bez telefonu"). Ciemne tło, SF icons. Toggle: opacity 1→0.3 z glow.

### Gradient "wpisz słowo" CTA
Biała karta z gradienci kółkiem (IG-style: fiolet-pomarańcz) pojawia się chwilę przed słowem kluczowym. Wewnątrz: pisanie "Wpisz" + duże słowo kluczowe z gradientem. Zostaje. Nic innego na ekranie.

### Polaroidy z wyjazdu
Prawdziwe zdjęcia z podróży lub eventu wpadają jako polaroidy z błyskiem flash i klikiem migawki. Lekki obrót przy wejściu.

### Live profil CTA
Ciemny ekran Instagram Live przed klatką kursantki: komentarz pisze się i wysyła z sercem, potem przełącza się do profilu i tapuje "Obserwuj". Efekt animowany, własna kompozycja HyperFrames.

### Numerowany licznik efektu
Stały nagłówek serii u góry ("10 narzędzi AI") z małym licznikiem 01/10 nad dużą żółtą etykietą dla każdego elementu. Font nagłówek: Inter Medium, 32px. Font etykieta: Bebas Neue, 80px, żółta.

### Odręczne strzałki notatek
Małe odręczne notki caps ("przed") z narysowaną strzałką wskazującą kartę. Font: Caveat, 32px. Czuć jak adnotacje własnej pracy.

### Przyklejony baner komentarza
Jedna mała odręczna linia "przyklejona" u góry przez cały film (Twoje CTA). Działa od sekundy 0. Font: Caveat, 28px.

### Siatka wyników
Dwie rzędy wyników ("Nowe wideo" / "Surowy klip") zmieniają się co sekundę — pokazuje że efekt działa na wielu przykładach. Klatka: border-radius 12px, cień.

---

## Animowane b-roll

Odtworzone momenty aplikacji i interfejsów. Zamieniaj prywatne dane na przykładowe.

### Pytanie i odpowiedź czatu
Wiadomość kursantki pisze się i wysyła. Odpowiedź bota streamuje się. Font: Inter, 36px. Tło: ciemna karta chatbot, bubble z border-radius 18px.

### Grupy chatbotów
Boty rozmawiają ze sobą z imionami, avatarami i @wzmiankamii. Każda wiadomość wchodzi co 0.3s z slide.

### Chat do Kalendarza
Link kliknięty, otwiera się Google Calendar, event wpada w datę. Animacja sequential: 0.4s na każdy krok.

### Chat do Drive do Arkuszy
Link kliknięty, Drive się otwiera, wiersze arkusza wpadają jeden po jednym.

### iMessage-style
Zielone i szare dymki w ramce iPhone. Font: San Francisco / Inter, 32px. Wchodzą co 0.25s z slide.

### Klik w Doku
Przybliżenie do Docka Mac, kliknięcie, ikona odbija się i aplikacja się otwiera. Scale 1→1.15→1 przy kliknięciu.

### Powiadomienie z avatarem
Avatar postaci pulsuje, dymek z wypowiedzią pojawia się nad nagraniem. Font: Inter, 32px.

### Pigułka z logo
Ciemna szklana pigułka: ikona apki, nazwa, "by [firma]", sweep lśnienia przez pigułkę. Cień, border-radius 50px.

### Rząd z twarzami postaci
Postaci z imionami wpadają w rząd. Każda 0.15s po poprzedniej, scale 0→1 ease back.

### Diagram pojęciowy
Prosta animowana infografika (chmura serwerów, konta się łączą). Linie rysują się, ikonki wpadają. Clean, bez gradientów.

### Filmowy reveal loga
Oryginalne materiały, slow-mo z grade, logo wchodzi spokojnie i płynnie. Styl kinowy.

---

## Efekty sygnaturowe

Jednoklatkowe show-stopery. Jeden na pomysł, nigdy kilka naraz.

### Orbita
Małe zaokrąglone karty-ekrany (inne rolki kursantki) krążą wokół niej, przechodząc z tyłu i z przodu ciała. Kursantka wycięta z tła. Karty: 200×356px, border-radius 24px, lekki cień. Ruch eliptyczny GSAP, czas trwania 6s, 3 karty w różnych fazach.

### Ściana rolek
Ściana za kursantką wypełnia się kafelkową kolaż jej miniatur, tweetów i screenshotów. Ona stoi wycięta na pierwszym planie.

### Świat UI
Tło zamienione na czysty off-white interfejs chatowy (kremowy #FAFAF8). Pasek promptu pisze zapytanie dokładnie nad głową kursantki.

### Wyłamanie z ramki
Ujęcie kurczy się do zaokrąglonej ramki telefonu na ciemnym rozmytym tle. Ciało kursantki wystaje poza ramkę (efekt pop-out 3D).

### Cyfrowy zoom
Szybki push z szerokim ujęciem w ciasny crop twarzy na kluczowym słowie. Lekka winieta. Twarde cięcie, bez blur.

### Wsuwany mockup telefonu
Ciemny mockup telefonu wsuwa się z krawędzi kadru obok kursantki, lista kroków się wypełnia, żółty przycisk tapuje się na "Gotowe".

### Tykające zadania na liście
Mała ciemna karta w pustej ścianie obok głowy, trzy kroki zaznaczają się zielonym ptaszkiem jeden po jednym. Font: Inter, 32px.

### Ściana nagłówków
Kartki z notatkami, karty z cytatami i snippety z wyszukiwania naklejają się na ścianę wokół głowy, lekko pochylone, jeden na beat. Font mix: Caveat i Inter.

### Zoom-przez-czerń
Kamera wchodzi szybko w ciemny fragment kadru (kurtka, cień), przechodzi przez czerń, następna scena otwiera się z ciemności. Twarde.

### Rosnący wykres
Świecąca linia wykresu rysuje się przez "pokój" za kursantką, potem strzela w górę neonowym żółtym z glow trail na pointę. Stroke animacja z ease.inOut.

### Pull-back reveal
Ujęcie cofa się i okazuje się, że to ekran w oknie Claude, z listą zadań i paskiem postępu obok. Skala 1.0→0.65 w 1.2s ease.inOut.

### Podwójne ujęcie zza ekranu
Ty na dole, a mała ciemna karta nad Tobą pokazuje ten sam materiał z innego kąta, jak ekran za Tobą.

### Wycinanka papierowa
Kursantka staje się białym papierowym wycinkiem na kolaż z porwanego papieru, literami ransom-note, kredkowymi gryzmołami i taśmą.

### Drżące kontury
Falujący, ręcznie rysowany biały obrys obrysowuje kursantkę i dygocze klatka po klatce. Serduszka i gwiazdki pojawiają się przy głowie. Font Caveat dla notatek.

### Zawrót głowy (vertigo)
Dolly zoom: kursantka pozostaje tego samego rozmiaru, a pokój za nią rozciąga się i cofa. Efekt na linii z odkryciem.

### Okładka magazynu
Kadr zamienia się w okładkę magazynu: cienki serif masthead za głową, małe nagłówki w rogach, kursywa strapline poniżej.

### Szklany napis
Olbrzymi, frosted-glass napis siedzi za głową i refrakcjonuje pokój przez siebie.

### Flashcardy ikon
W karcie "Po": kremowe karty z przykładowym 3D obiektem każda (maszyna do pisania = Napisy, kamera = B-roll, rolka filmowa = Animacja) i serif etykietą. Przerzucają się co 0.5s.

### Monitor w ciemnym pokoju
Cały explainer gra na monitorze w ciemnym pokoju ze świecącą klawiaturą, prostą grafiką na ekranie, stały serif tytuł poniżej.

---

## Ruch i tempo

Jak montaż się porusza.

### Punch-in cięcia
Twarde cięcie ze zbliżeniem na początku zdania, żeby ujęcie ciągle się zmieniało.

### Rozmyte zoom-przejścia
Szybki zoom-blur w cutaway i z niego, miękki ciepły przeciek światła.

### Szybkie wizualne
Nowe wizualne co 2–3 sekundy. Nigdy dwa razy ten sam element pod rząd.

### Spokojny i statyczny
Mało cięć, powolne pushes, więcej oddechu. Mniej, ale silniejszych grafik.

### Dwa-framing jump cuty
Jedno ujęcie, na przemian szerokie i ciasne kadrowanie na każdym zdaniu, pauzy cięte ciasno. Tylko twarde cięcia.

### Zoom centralny na twarz
Szybkie 115–120% punch-in na krótkich zdaniach akcentowych, powolny push-in z ease na dłuższych. Zawsze centruje twarz.

### Kołowy wipe koloru
Kółko w kolorze marki rośnie z karty, by przejść do następnej sekcji. Czyste, bez blur.

---

## Dźwięk

Mix ok. −14 LUFS. Efekty zawsze ciszej niż głos (−18 do −24 dB).

### Efekty na każdym wizualnym
Popy, whooshe, tiki i hity na każdej grafice, zawsze pod głosem.

### Lekkie efekty
Dźwięki tylko na największych momentach.

### Muzyczne tło
Cicha podkładka muzyczna pod głosem. Użyj muzyki, do której masz prawa.

---

## Obraz i kolor

Całościowy wygląd i kolorystyka rolki.

### Ciepły kinowy
Lekki ciepły grade (+10 temperatura, +8 odcień, −6% ekspozycja, +20% kontrast, −14% nasycenie), winieta i lekki grain (5–8%). Tło za kartami rozmazane. Klimat premium.

### Czyste światło
Miękkie białe panele, cienkie akcent bary, brak emoji ani odznak. Najczystszy styl.

### Pastelowy błękit
Pastelowe niebieskie tło (#D6E8F5), zabawne naklejki, luźny klimat.

### Apple clean
Białe iOS-style karty, frosted glass, SF Pro lub Inter, miękkie cienie, jeden ekran na beat. Bez świecącego tekstu, stempli ani neonu.

### Ciepła redakcyjna
Miękki ciepły sepia grade, kremowy tekst, jedno maślano-żółte serif kursywa punch-line z iskrzącymi gwiazdkami. Kojarzy się z estetyką „cool girl".

### Ciemny editorial
Pokój przyciemniony, kursantka podświetlona, chłodny teal tone i winieta, bez grain. Szerokie ujęcie na przemian z ciasnym close-up jak wywiad studyjny.

### Płótno żółte
Całe wideo na jednym płaskim maślanym żółtym tle (#F5D840) z białym tekstem i kartami z białą ramką. Natychmiast rozpoznawalny look serii.
