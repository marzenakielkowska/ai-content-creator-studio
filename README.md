# AI Content Creator Studio

Nagrywasz, a Claude montuje rolkę w Twoim stylu.

Ta wtyczka jest dla kursantów AI Content Creator Studio. Filmy instruktażowe i wsparcie znajdziesz w materiałach kursu.

> **Wersja testowa.** Po instalacji masz do dyspozycji: przygotowanie komputera (`/studio:start`),
> wybór stylu napisów i efektów (`/studio:lookbook`, `/studio:dzwieki`), montaż rolki jedną komendą
> (`/studio:montaz`) oraz karuzelę na Instagram z gotowej rolki (`/studio:karuzela-z-rolki`). Wtyczka jest w fazie testów — jeśli coś nie zadziała, napisz na adres wsparcia z kursu.

## Czego potrzebujesz

- Komputera z **macOS** albo **Windows 10 lub 11**.
- Aplikacji **Claude** na komputerze, z planem, który obejmuje Claude Code.
- Programu **git**:
  - **Mac:** nic nie musisz robić wcześniej. Jeśli komputer poprosi o doinstalowanie narzędzi, zgódź się.
  - **Windows:** najpierw zainstaluj [Git for Windows](https://git-scm.com/downloads) i zostaw domyślne ustawienia.
- Około **2 GB** wolnego miejsca i internetu przy pierwszym uruchomieniu.

## Instalacja

Wybierz **jeden** sposób i trzymaj się go od początku do końca. Jeśli zaczniesz jednym, a skończysz drugim, Claude
może zgłosić, że sklep z wtyczkami jest już dodany z innego adresu.

### Sposób A: w aplikacji Claude (klikanie)

1. Otwórz aplikację Claude i przejdź do karty **Code**.
2. **Sprawdź, że pracujesz na swoim komputerze**, a nie w chmurze. Po prawej stronie, w sekcji **Environment**, ma
   być wybrane **This computer** (Ten komputer). Jeśli widzisz ikonkę chmurki, kliknij nazwę środowiska i wybierz
   swój komputer. W sesji w chmurze nie da się instalować wtyczek.
3. Kliknij **+** obok pola wiadomości, potem **Plugins**, potem **Browse plugins**.
4. Kliknij **Add**, potem **Add marketplace**, potem **Add from a repository**.
5. Wklej ten link i kliknij **Sync**:

   ```
   https://github.com/marzenakielkowska/ai-content-creator-studio
   ```

6. Na liście znajdź **AI Content Creator Studio** i zainstaluj. Razem ze Studio zainstaluje się sama wtyczka
   **HyperFrames** (podpowiedzi dla Claude, jak budować animacje). To normalne, Studio jej potrzebuje.

### Sposób B: w terminalu

Jeśli używasz Claude Code w Terminalu (Mac) albo w PowerShellu (Windows), albo w terminalu wbudowanym w aplikację
Claude (ikonka **>_** w prawym górnym rogu). Wklej każdą linijkę osobno i zatwierdź Enterem:

```
claude plugin marketplace add marzenakielkowska/ai-content-creator-studio
```

```
claude plugin install studio@ai-content-studio
```

Po każdej linijce powinien pojawić się zielony znaczek ✔ i słowo „Successfully”. Druga linijka dopisze
„+ 1 dependency: hyperframes”: to wtyczka z podpowiedziami do silnika montażu, instaluje się razem ze Studio.

## Pierwsze uruchomienie

1. Zacznij **nową sesję** na swoim komputerze (wtyczki wczytują się przy starcie sesji).
2. Wpisz:

   ```
   /studio:start
   ```

3. Claude sprawdzi Twój komputer i pokaże, czego brakuje do montażu oraz ile to waży (za pierwszym razem około
   1,2 GB). Na liście jest wszystko, co Studio chce pobrać, także małe dodatki. Pobiera dopiero po Twojej zgodzie.
   Efekty z wycięciem z tła potrzebują jeszcze osobnego narzędzia (około 390 MB, jednorazowo). Claude zapyta o nie,
   gdy pierwszy raz wybierzesz taki efekt.
4. Odpowiedz na dwa pytania o foldery: gdzie lądują Twoje nagrania i gdzie zapisywać gotowe rolki.
5. Na koniec Claude sprawdzi, czy wszystko działa.

Wszystkie narzędzia trafiają do jednego folderu Studio w Twoim katalogu domowym (`.ai-content-studio`). Nic nie jest
instalowane w systemie i nie jest potrzebne hasło administratora.

**Python jest opcjonalny.** Studio go nie instaluje i montaż działa bez niego. Potrzebny jest tylko do efektu
„Przed i po”. Jeśli chcesz z niego korzystać: na Macu wystarczy zgodzić się na „narzędzia dla programistów”, gdy
komputer o nie zapyta; na Windowsie pobierz Pythona ze strony [python.org](https://www.python.org/downloads/)
i przy instalacji zaznacz „Add python.exe to PATH”. Claude powie Ci przy `/studio:start`, czy go masz.

Chcesz tylko sprawdzić, czy wtyczka jest zainstalowana? Wpisz `/studio:witaj`.

## Twoje pliki zostają u Ciebie

- **Pracujesz na swoim komputerze, nie na cudzym serwerze.** Ten GitHub zawiera wyłącznie instrukcje i skrypty
  wtyczki. Przy instalacji Claude pobiera ich kopię na Twój komputer i od tej chwili wszystko dzieje się u Ciebie.
- **Autorka kursu nie widzi, co robisz.** Nie ma dostępu do Twojego komputera, nagrań, rolek, ustawień ani rozmów
  z Claude. Instalacja wtyczki nie daje nikomu dostępu do niczego.
- **Wtyczka niczego nie wysyła autorce.** Nie zbiera statystyk i nie śledzi, jak z niej korzystasz. Jedyne, co
  przychodzi z GitHuba, to aktualizacje instrukcji; nic nie idzie w drugą stronę.
- **Nagrania tylko czytamy.** Studio nigdy nie zmienia ani nie usuwa Twoich oryginalnych plików. Projekty i gotowe
  rolki zapisuje w folderze, który sama lub sam wskażesz.
- **Co widzi Claude.** Podczas pracy Claude analizuje to, czego potrzebuje do montażu: transkrypcję i pojedyncze
  klatki do sprawdzenia jakości. Dzieje się to w Twojej rozmowie z Claude, na Twoim koncie, tak jak przy każdej
  innej pracy z Claude.
- **Narzędzia innych firm.** Studio korzysta z gotowych narzędzi, które pobiera przy pierwszym uruchomieniu:
  Node.js, FFmpeg, HyperFrames (od firmy HeyGen), przeglądarki do renderu, modelu mowy i programu do pobierania
  filmów z linków (yt-dlp). Każde z nich działa według
  zasad i polityki prywatności swojego twórcy. Opis powyżej dotyczy wtyczki i autorki kursu, nie tych narzędzi
  ani samego Claude.

## Aktualizacje

**Nic nie musisz robić.** `/studio:start` włącza automatyczne aktualizacje i od tej chwili wszystko aktualizuje się
samo:

- **Studio** (ta wtyczka): Claude pobiera nowe wersje w tle. Gdy zobaczysz komunikat „Plugin updated … Run
  /reload-plugins”, zacznij nową sesję albo wpisz `/reload-plugins`.
- **Silnik montażu HyperFrames**: Studio raz dziennie sprawdza, czy jest nowsza wersja. Instaluje ją obok obecnej,
  sprawdza, czy działa, i dopiero wtedy podmienia. Jeśli nowa wersja nie działa, zostaje dotychczasowa.

Twoje ustawienia, foldery i projekty zostają nietknięte przy każdej aktualizacji.

Gdyby automatyczne aktualizacje były kiedyś wyłączone, możesz je włączyć ręcznie: lista wtyczek → **Marketplaces** →
**ai-content-studio** → **Enable auto-update**.

## Gdy coś nie działa

- **„/studio:start isn't a command here”**: wtyczka nie jest zainstalowana albo sesja wystartowała przed instalacją.
  Sprawdź, że jesteś na swoim komputerze (nie w chmurze), i zacznij nową sesję.
- **Lista wtyczek pokazuje, że Studio „nie wczytało się”, bo brakuje „hyperframes”**: w tej samej liście, przy
  sklepie AI Content Creator Studio, zainstaluj też **hyperframes** (albo w terminalu:
  `claude plugin install hyperframes@ai-content-studio`) i zacznij nową sesję.
- **„Cannot add marketplace … doesn't match”**: sklep jest już dodany innym sposobem. Pomiń dodawanie i od razu
  zainstaluj wtyczkę: `claude plugin install studio@ai-content-studio`.
- **Pobieranie przerwane**: wpisz `/studio:start` jeszcze raz. To, co już jest, zostanie pominięte.
- **Po aktualizacji Studio czegoś brakuje**: nowa wersja może potrzebować nowego dodatku. Wpisz `/studio:start`;
  Claude pokaże, czego brakuje, i pobierze to dopiero po Twojej zgodzie.

## Miejsce na dysku

**Jedna rolka zamiast kilku wersji.** Przy pierwszej gotowej rolce Claude zapyta raz, czy sprzątać projekt. Jeśli
się zgodzisz: przy poprawkach zostaje tylko najnowsza wersja, a po akceptacji w projekcie zostaje sama rolka do
publikacji, plan montażu i Twoje materiały. Starsze wersje, kopie nagrania, transkrypcje i pliki robocze trafiają do
**Kosza**, więc niczego nie tracisz od razu. Miejsce zwalnia się po opróżnieniu Kosza. Chcesz zachować którąś starszą
wersję? Powiedz o tym, np. „zostaw wersję 4”. Zmienisz zdanie? Napisz „nie sprzątaj już moich projektów” albo
„sprzątaj projekty po akceptacji”.

**Sprzątanie na żądanie.** Silnik montażu zostawia też własne pliki robocze (kopie nagrań w historii zmian, klatki,
lżejsze kopie do podglądu). Rosną z każdą rolką. Żeby je usunąć i posprzątać starsze projekty, wpisz:

```
/studio:zwolnij-miejsce
```

Claude pokaże, ile miejsca można odzyskać, i sprząta dopiero po Twojej zgodzie. Nagrania, gotowe rolki, Twoje
materiały i styl zostają.

## Jak odinstalować Studio

Zrób to, **zanim skończy się Twoja subskrypcja Claude**: wtedy wystarczy jedna komenda.

### Najprościej: jedną komendą

Wpisz:

```
/studio:usun
```

Claude pokaże, co Studio zostawiło na komputerze i ile to zajmuje. Po Twojej zgodzie usunie programy i pliki Studio,
a na końcu same wtyczki. Może też zostawić kopię Twojego stylu w folderze z rolkami, gdybyś kiedyś chciała lub chciał
wrócić. **Twoich nagrań i gotowych rolek nie usuwa nigdy.** Na koniec zacznij nową sesję.

### Ręcznie

Gdy Claude nie działa (np. subskrypcja już się skończyła) albo wolisz zrobić to sama lub sam:

1. **Wtyczki.** W aplikacji Claude: **+** obok pola wiadomości → **Plugins**. Odinstaluj **AI Content Creator Studio**
   i **HyperFrames**, potem usuń sklep **ai-content-studio**. W terminalu (każda linijka osobno):

   ```
   claude plugin uninstall studio@ai-content-studio --prune -y
   ```

   ```
   claude plugin marketplace remove ai-content-studio
   ```

2. **Foldery.** Są w Twoim katalogu domowym i są ukryte (nazwy zaczynają się od kropki):
   - **Mac:** w Finderze otwórz swój katalog domowy (**Idź → Dom**) i naciśnij **Cmd + Shift + .**, żeby zobaczyć
     ukryte foldery.
   - **Windows:** otwórz folder `C:\Users\<Twoja nazwa>` i w Eksploratorze włącz **Widok → Pokaż → Ukryte elementy**.

   Przenieś do kosza:
   - `.ai-content-studio`: programy, ustawienia i Twój styl (jeśli chcesz zachować styl, skopiuj wcześniej z niego
     pliki `moj-styl.json` i `moj-brand.json`),
   - `.hyperframes`,
   - w folderze `.cache`: folder `hyperframes`,
   - `.ai-content-creator-studio`, jeśli go masz (tak wcześniej nazywał się folder ze stylem),
   - gdy nie dało się odinstalować wtyczek w punkcie 1: w folderze `.claude/plugins` foldery `cache/ai-content-studio`
     i `marketplaces/ai-content-studio`. Całych folderów `.cache` i `.claude` nie usuwaj, są w nich pliki innych
     programów.

Studio nie instalowało niczego w systemie, więc nic więcej nie trzeba sprzątać. Pythona, jeśli go dodałaś lub dodałeś
do efektu „Przed i po”, odinstalowujesz jak każdy inny program.

## Pomoc

Napisz na adres wsparcia podany w kursie. Opisz, co robiłaś lub robiłeś i co się stało. Zrzut ekranu bardzo pomaga.

---

© 2026 Marzena Kiełkowska. Dla kursantów AI Content Creator Studio, na warunkach opisanych w pliku
[LICENSE.md](LICENSE.md). Projekt niezależny, niepowiązany z Anthropic. Narzędzia pobierane przy pierwszym
uruchomieniu (Node.js, FFmpeg, HyperFrames, przeglądarka do renderu, model mowy, yt-dlp) pochodzą od ich twórców
i działają na
własnych licencjach.
