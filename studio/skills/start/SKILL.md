---
name: start
description: Przygotowuje komputer kursanta do montażu w AI Content Creator Studio. Sprawdza i pobiera narzędzia (Node, FFmpeg, HyperFrames, przeglądarkę do renderu, model mowy do napisów) i pyta o foldery na nagrania i projekty. Użyj, gdy użytkownik wpisze /studio:start, poprosi o przygotowanie lub naprawę Studio, powie "przygotuj Studio", "zainstaluj narzędzia", "Studio nie działa", albo gdy inny skill Studio nie znajdzie narzędzi.
---

# Przygotowanie Studio (/studio:start)

Kursant to zwykle osoba, która nigdy nie montowała wideo i nie pracowała z kodem. Mów do niej po polsku, prostym
językiem, krótko. Nigdy nie pokazuj jej linii `STATUS`, ścieżek do skryptów ani błędów technicznych. Przetłumacz je
na zwykłe zdania.

Nie pokazuj też ścieżek w rodzaju `~/.ai-content-studio`, `~/.cache/...` czy `~/Downloads`. Nazywaj miejsca tak, jak
widzi je kursant: „folder Studio w Twoim katalogu domowym”, „folder Pobrane”, „folder ai-studio-projekty w Twoim
katalogu domowym”. Pełną ścieżkę podaj tylko wtedy, gdy kursant o nią zapyta.

## Zasady, których pilnujesz zawsze

1. **Najpierw cały plan, potem pytania.** Zanim cokolwiek pobierzesz, pokaż, co jest, czego brakuje i ile to waży.
   Przy każdym pytaniu powiedz w jednym zdaniu, po co pytasz.
2. **Nic bez zgody.** Pobierasz dopiero po wyraźnym „tak”.
3. **Nic poza folderem Studio.** Wszystko trafia do folderu Studio w katalogu domowym kursanta (`.ai-content-studio`)
   oraz do folderu podręcznego HyperFrames (`.cache/hyperframes`). Nie instaluj niczego systemowo, nie używaj
   `sudo`, Homebrew, winget ani instalatorów `.pkg` / `.msi`, nie zmieniaj ustawień systemu ani profilu powłoki.
   Jedyny wyjątek: skrypt włącza automatyczne aktualizacje Studio w ustawieniach Claude Code (zostawia kopię
   poprzedniego pliku obok, z końcówką `.ai-studio-kopia`).
4. **Pliki kursanta tylko do odczytu.** Nie przenosisz, nie zmieniasz i nie usuwasz jego nagrań.
5. **Tylko skrypty z tego skilla.** Nie pisz własnych poleceń instalacyjnych w zastępstwie. Gdy skrypt zgłasza błąd,
   postępuj według sekcji „Gdy coś pójdzie nie tak”.

## Skąd uruchamiać skrypty

`SK` to folder tego pliku: katalog bazowy, który Claude Code podaje przy wczytaniu skilla (lub
`${CLAUDE_PLUGIN_ROOT}/skills/start`). Zawsze pełna ścieżka w cudzysłowie, ukośniki `/`, jedno polecenie na
wywołanie, bez `cd` i bez `&&`.

- **Mac** (i Linux):
  `sh "SK/scripts/start.sh" <polecenie>`
- **Windows** (także w Git Bash, którego używa Claude Code):
  `powershell -NoProfile -ExecutionPolicy Bypass -File "SK/scripts/start.ps1" <polecenie>`

Rozpoznaj system, zanim zaczniesz: na Windowsie ścieżki zaczynają się od litery dysku (`C:/...`), a `uname` w Git Bash
zwraca `MINGW` lub `MSYS`.

Polecenia: `sprawdz`, `instaluj`, `ustaw --nagrania "<folder>" --projekty "<folder>"`, `test`, `aktualizuj`.

## Aktualizacje (automatyczne, kursant nic nie robi)

Wszystko aktualizuje się samo, bez pytania kursanta:

- **Wtyczka Studio**: `instaluj` i `aktualizuj` włączają automatyczne aktualizacje sklepu `ai-content-studio` w
  ustawieniach Claude Code (to samo, co przełącznik „Enable auto-update” w liście wtyczek). Od tej chwili Claude Code
  sam pobiera nowe wersje w tle. Gdy kursant zobaczy komunikat „Plugin updated … Run /reload-plugins”, powiedz mu,
  że przyszła nowa wersja Studio i wystarczy zacząć nową sesję (albo wpisać `/reload-plugins`).
- **HyperFrames**: `aktualizuj` raz na dobę sprawdza, czy jest nowsza wersja. Instaluje ją obok obecnej, sprawdza,
  czy działa, i dopiero wtedy podmienia. Gdy nowa wersja nie przejdzie sprawdzenia, zostaje dotychczasowa.

**Na początku każdej pracy ze Studio** (ten skill i każdy inny skill Studio) uruchom po cichu `aktualizuj`. Gdy było
sprawdzane w ostatniej dobie, kończy się od razu. Linie:

| Linia | Co zrobić |
| --- | --- |
| `STATUS aktualizacja NIEDAWNO_SPRAWDZANE` | nic, nie wspominaj o tym |
| `STATUS autoaktualizacja OK\|WLACZONA` | nic, nie wspominaj o tym |
| `STATUS autoaktualizacja NIEMOZLIWA` | powiedz jednym zdaniem, że automatyczne aktualizacje Studio trzeba włączyć ręcznie: lista wtyczek → **Marketplaces** → **ai-content-studio** → **Enable auto-update** |
| `STATUS hyperframes AKTUALNY\|NIE_SPRAWDZONO\|BRAK` | nic, nie wspominaj o tym |
| `STATUS hyperframes ZAKTUALIZOWANY <stara> <nowa>` | jedno zdanie: „Zaktualizowałam silnik montażu do nowszej wersji.” |
| `STATUS hyperframes BEZ_ZMIAN ...` | nic, nie wspominaj o tym (działa dotychczasowa wersja) |

## Przebieg

### Krok 1. Sprawdzenie (zawsze, po cichu)

Uruchom `sprawdz`. Trwa kilka sekund i niczego nie pobiera ani nie zmienia. Przeczytaj linie:

| Linia | Znaczenie |
| --- | --- |
| `STATUS node OK <wersja> <studio\|system>` | Node jest (własny Studio albo z systemu) |
| `STATUS node BRAK` | brak Node 22+; pozostałe pozycje będą `NIEZNANE`, bo bez Node nie da się ich sprawdzić |
| `STATUS ffmpeg OK\|BRAK` | program do obróbki wideo i dźwięku |
| `STATUS hyperframes OK\|BRAK` | silnik, który składa i renderuje rolki |
| `STATUS przegladarka OK\|BRAK\|NIEZNANE` | ukryta przeglądarka, w której HyperFrames renderuje |
| `STATUS transkrypcja OK\|BRAK\|NIEZNANE\|NIEOBSLUGIWANA` | model mowy do napisów (rozumie polski) |
| `STATUS ustawienia OK\|BRAK` | foldery na nagrania i projekty |
| `STATUS autoaktualizacja OK\|WYLACZONA` | czy Studio aktualizuje się samo (`instaluj` to włącza) |
| `STATUS do_pobrania_mb <liczba>` | ile mniej więcej trzeba pobrać |
| `WYNIK GOTOWE\|NIEGOTOWE` | podsumowanie |

`WYNIK GOTOWE`: powiedz jednym zdaniem, że Studio jest gotowe, i zakończ. Nie powtarzaj pytań z pierwszego razu.

### Krok 2. Plan dla kursanta

Pokaż krótką listę: co już jest, czego brakuje, łączny rozmiar pobierania. Wyjaśnij jednym zdaniem każdą brakującą
rzecz. Powiedz, gdzie to trafi i że niczego nie zmieniasz w systemie. Przykład:

> Sprawdziłam Twój komputer. Do montażu potrzebne są:
> - Node: jest
> - FFmpeg (obróbka wideo i dźwięku): brak
> - HyperFrames (składa i renderuje rolki): brak
> - przeglądarka do renderu: brak
> - model mowy do napisów: brak
>
> Do pobrania jest razem około 1,2 GB, jednorazowo. Wszystko trafi do jednego folderu Studio w Twoim katalogu domowym;
> nic nie instaluję w systemie i nie potrzebuję hasła. Zależnie od internetu potrwa to od kilku do kilkunastu minut.
> Włączę też automatyczne aktualizacje Studio, żeby poprawki przychodziły same.
> Pobieram?

Gdy `WYNIK GOTOWE`, ale `STATUS autoaktualizacja WYLACZONA`, nie pytaj o nic: uruchom `aktualizuj --teraz` (włącza
automatyczne aktualizacje) i powiedz o tym jednym zdaniem.

Przy pierwszym uruchomieniu dodaj jedno zdanie o prywatności, bo kursanci często o to pytają:

> Wszystko dzieje się na Twoim komputerze. Autorka kursu nie ma dostępu do Twoich plików ani do tego, co robisz,
> a wtyczka niczego jej nie wysyła.

Zdanie o automatycznych aktualizacjach jest obowiązkowe: kursant musi wiedzieć, że Studio będzie się aktualizować
samo.

Pytanie o zgodę zadaj osobno i czekaj na odpowiedź.

Jeśli kursant zapyta, gdzie są jego pliki albo kto je widzi, odpowiedz zgodnie z sekcją „Twoje pliki zostają u
Ciebie” w README wtyczki: GitHub zawiera tylko instrukcje, wszystko dzieje się lokalnie, autorka nic nie widzi,
nagrania są tylko czytane, a Claude analizuje transkrypcję i pojedyncze klatki w rozmowie na koncie kursanta.
Nie obiecuj niczego w imieniu narzędzi innych firm (HyperFrames, FFmpeg, Node.js, przeglądarka, model mowy) ani
samego Claude: działają według zasad swoich twórców.

### Krok 3. Instalacja

Po zgodzie uruchom `instaluj`. Pobieranie trwa długo: uruchom je w tle (lub z limitem czasu 10 minut) i informuj
kursanta o postępie, gdy zakończy się kolejny krok. Linie `KROK <nazwa> start|gotowe|blad <opis>` mówią, co się dzieje.
Powiedz na starcie: „Pobieram. Najdłużej trwa model mowy, około 700 MB.”

Jeśli polecenie zostało przerwane (limit czasu, zamknięty laptop), po prostu uruchom `instaluj` jeszcze raz. To, co
już jest, zostanie pominięte.

### Krok 4. Foldery

Gdy brakuje ustawień, zapytaj w jednej wiadomości o dwa foldery i powiedz po co:

> Dwa pytania o foldery, żebym wiedziała, gdzie szukać nagrań i gdzie zapisywać gotowe rolki:
> 1. Gdzie zwykle lądują Twoje nagrania z telefonu? (domyślnie folder Pobrane)
> 2. Gdzie zapisywać projekty i gotowe rolki? (domyślnie nowy folder `ai-studio-projekty` w katalogu domowym)

Domyślne wartości: Mac `~/Downloads` i `~/ai-studio-projekty`; Windows `C:/Users/<nazwa>/Downloads` i
`C:/Users/<nazwa>/ai-studio-projekty` (prawdziwą nazwę weź z katalogu domowego). Potem `ustaw --nagrania "<folder>"
--projekty "<folder>"`. Folder nagrań musi istnieć; folder projektów zostanie założony.

### Krok 5. Test

Uruchom `test`.
- `STATUS test OK`: powiedz, że wszystko działa, i co dalej (w tej wersji Studio montaż jedną komendą dopiero
  powstaje; zapowiedz go jednym zdaniem).
- `STATUS test BLAD <lista>`: przejdź do sekcji poniżej.

Po udanej instalacji skrypt zapisuje w folderze Studio plik `narzedzia.json` ze ścieżkami do narzędzi. Pozostałe
skille Studio czytają go zamiast szukać narzędzi same.

## Gdy coś pójdzie nie tak

- **Brak internetu albo przerwane pobieranie** (`pobieranie ... przerwane`, `nie udalo sie pobrac listy`): poproś o
  sprawdzenie internetu i uruchom `instaluj` ponownie. Najwyżej dwa podejścia; potem powiedz kursantowi, że warto
  spróbować później lub na innej sieci.
- **Suma kontrolna się nie zgadza**: plik przyszedł uszkodzony. Uruchom `instaluj` jeszcze raz.
- **`STATUS transkrypcja NIEOBSLUGIWANA`**: model mowy nie działa na tym komputerze (zwykle starszy procesor). Reszta
  działa. Powiedz, że napisy na takim komputerze dołożymy w osobnym kroku, i nie próbuj obchodzić tego innym
  instalatorem.
- **Windows, `powershell` nie startuje lub blokuje skrypt**: poproś kursanta, żeby uruchomił polecenie sam w oknie
  PowerShell (Start → wpisz PowerShell → Enter), podając mu pełną linię z `-ExecutionPolicy Bypass`.
- **Mac pyta o „narzędzia dla programistów”**: to okno systemowe pojawiające się, gdy coś wywoła `git` lub `python3`.
  Skrypty Studio go nie potrzebują; kursant może kliknąć „Zainstaluj” albo „Nie teraz”.
- **Każdy inny błąd**: powiedz zwykłymi słowami, który krok się nie udał, i poproś o zrzut ekranu dla wsparcia. Szczegóły
  techniczne są w pliku `dziennik.log` w folderze Studio; przeczytaj jego końcówkę, zanim cokolwiek zaproponujesz.

## Ponowne uruchomienie

Gdy kursant uruchamia `/studio:start` drugi raz albo prosi o zmianę folderów: zrób krok 1, pokaż w dwóch linijkach
obecne foldery i zapytaj, co zmienić. Zmieniaj tylko to. Nie pobieraj niczego ponownie, jeśli `WYNIK GOTOWE`.
