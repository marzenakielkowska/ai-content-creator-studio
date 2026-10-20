# AI Content Creator Studio

Nagrywasz, a Claude montuje rolkę w Twoim stylu.

Ta wtyczka jest dla kursantów AI Content Creator Studio. Filmy instruktażowe i wsparcie znajdziesz w materiałach kursu.

> **Wersja testowa (0.2.1).** Wtyczka przygotowuje komputer do montażu. Sam montaż rolek pojawi się w kolejnych
> aktualizacjach.

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

6. Na liście znajdź **AI Content Creator Studio** i zainstaluj.

### Sposób B: w terminalu

Jeśli używasz Claude Code w Terminalu (Mac) albo w PowerShellu (Windows), albo w terminalu wbudowanym w aplikację
Claude (ikonka **>_** w prawym górnym rogu). Wklej każdą linijkę osobno i zatwierdź Enterem:

```
claude plugin marketplace add marzenakielkowska/ai-content-creator-studio
```

```
claude plugin install studio@ai-content-studio
```

Po każdej linijce powinien pojawić się zielony znaczek ✔ i słowo „Successfully”.

## Pierwsze uruchomienie

1. Zacznij **nową sesję** na swoim komputerze (wtyczki wczytują się przy starcie sesji).
2. Wpisz:

   ```
   /studio:start
   ```

3. Claude sprawdzi Twój komputer i pokaże, czego brakuje do montażu oraz ile to waży (za pierwszym razem około
   1,2 GB). Pobiera dopiero po Twojej zgodzie.
4. Odpowiedz na dwa pytania o foldery: gdzie lądują Twoje nagrania i gdzie zapisywać gotowe rolki.
5. Na koniec Claude sprawdzi, czy wszystko działa.

Wszystkie narzędzia trafiają do jednego folderu Studio w Twoim katalogu domowym (`.ai-content-studio`). Nic nie jest
instalowane w systemie i nie jest potrzebne hasło administratora.

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
  innej pracy z Claude. Całe pliki wideo nie są nigdzie wysyłane.

## Aktualizacje

Poprawki i nowe funkcje przychodzą jako aktualizacje tej wtyczki.

**Najprościej:** włącz automatyczne aktualizacje. W aplikacji Claude otwórz listę wtyczek, przejdź do **Marketplaces**,
wybierz **ai-content-studio** i kliknij **Enable auto-update**.

**Z terminala:** wklej każdą linijkę osobno:

```
claude plugin marketplace update ai-content-studio
```

```
claude plugin update studio@ai-content-studio
```

Po aktualizacji zacznij nową sesję, żeby Claude wczytał nową wersję.

## Gdy coś nie działa

- **„/studio:start isn't a command here”**: wtyczka nie jest zainstalowana albo sesja wystartowała przed instalacją.
  Sprawdź, że jesteś na swoim komputerze (nie w chmurze), i zacznij nową sesję.
- **„Cannot add marketplace … doesn't match”**: sklep jest już dodany innym sposobem. Pomiń dodawanie i od razu
  zainstaluj wtyczkę: `claude plugin install studio@ai-content-studio`.
- **Pobieranie przerwane**: wpisz `/studio:start` jeszcze raz. To, co już jest, zostanie pominięte.

## Pomoc

Napisz na adres wsparcia podany w kursie. Opisz, co robiłaś lub robiłeś i co się stało. Zrzut ekranu bardzo pomaga.

---

© 2026 Marzena Kiełkowska. Dla kursantów AI Content Creator Studio, na warunkach opisanych w pliku
[LICENSE.md](LICENSE.md). Projekt niezależny, niepowiązany z Anthropic. Narzędzia pobierane przy pierwszym
uruchomieniu (Node.js, FFmpeg, HyperFrames, przeglądarka do renderu, model mowy) pochodzą od ich twórców i działają na
własnych licencjach.
