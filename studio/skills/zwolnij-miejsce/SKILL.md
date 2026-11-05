---
name: zwolnij-miejsce
description: Zwalnia miejsce na dysku po montażu w AI Content Creator Studio. Usuwa pliki robocze silnika montażu (kopie nagrań w historii zmian, wyciągnięte klatki, lżejsze kopie do podglądu) i robi porządek w gotowych projektach rolek (starsze wersje, kopie nagrania i pliki robocze do Kosza), bez odinstalowywania Studio i bez ruszania nagrań i gotowych rolek. Użyj, gdy użytkownik wpisze /studio:zwolnij-miejsce, powie „brakuje miejsca na dysku”, „Studio zajmuje dużo miejsca”, „posprzątaj po montażu” albo „posprzątaj projekty”. Także gdy chce włączyć lub wyłączyć sprzątanie po rolce („nie sprzątaj moich projektów”, „sprzątaj projekty po akceptacji”).
---

# Zwolnienie miejsca (/studio:zwolnij-miejsce)

Mów po polsku, prostym językiem, krótko. Nie pokazuj linii `STATUS`, ścieżek ani nazw poleceń.

Miejsce zajmują dwie rzeczy:
1. **Pliki robocze silnika montażu (HyperFrames):** kopie nagrań w historii zmian, klatki wyciągnięte z nagrań,
   lżejsze kopie do podglądu. Usuwa je polecenie samego HyperFrames.
2. **Gotowe projekty rolek:** starsze wersje rolki, kopie na telefon, kopie nagrania (pocięte nagranie, sylwetka bez
   tła), transkrypcje, pocięte fragmenty i podglądy. Te idą do Kosza, nie są kasowane na stałe.

Nagrania, gotowe rolki (z każdej po jednym pliku do publikacji), materiały kursantki, plany montażu, kompozycje,
programy i styl zostają.

## Skąd uruchamiać skrypt

Skrypt należy do skilla `usun`. `SK` to folder tego pliku (lub `${CLAUDE_PLUGIN_ROOT}/skills/zwolnij-miejsce`), a skrypt
leży w `SK/../usun/scripts/`. Pełna ścieżka w cudzysłowie, jedno polecenie na wywołanie, bez `cd` i `&&`.

- **Mac:** `sh "SK/../usun/scripts/sprzatanie.sh" <polecenie>`
- **Windows:** `powershell -NoProfile -ExecutionPolicy Bypass -File "SK/../usun/scripts/sprzatanie.ps1" <polecenie>`

## Włączanie i wyłączanie sprzątania po rolce

Gdy kursantka chce tylko to zmienić („nie sprzątaj już moich projektów”, „sprzątaj projekty po akceptacji”), uruchom
`porzadek-ustaw nie` albo `porzadek-ustaw tak`, potwierdź jednym zdaniem i skończ (bez kroków niżej). Przy `nie`
wszystkie wersje rolek zostają w projektach; przy `tak` po akceptacji rolki zostaje sama rolka do publikacji.

## Krok 1. Ile można zwolnić

Uruchom `miejsce`, potem `projekty`. Oba tylko liczą, niczego nie ruszają.

**`miejsce`** (pliki robocze silnika):

| Linia | Jak powiedzieć |
|---|---|
| `STATUS miejsce historia <MB>` | kopie nagrań zapisane w historii zmian projektów |
| `STATUS miejsce klatki <MB>` | klatki wyciągnięte z nagrań na czas montażu |
| `STATUS miejsce podglady-wideo <MB>` | lżejsze kopie nagrań do podglądu |
| `STATUS miejsce zrzuty-klatek <MB>` | podglądy klatek ze sprawdzania |
| `STATUS miejsce raporty <MB>` | raporty ze sprawdzania kompozycji |
| `STATUS miejsce inne <MB>` | inne pliki robocze silnika montażu |
| `STATUS do-zwolnienia <MB>` | razem |

**`projekty`** (jedna linia `STATUS projekt` na projekt):

| Linia | Co znaczy |
|---|---|
| `STATUS projekt <nazwa> GOTOWY <MB> do-kosza=<MB> rolka=<plik> zmiana=<data>` | gotowa rolka; tyle można przenieść do Kosza |
| `STATUS kosz <nazwa> wersje\|kopie-nagrania\|robocze <MB> plikow=<n>` | z czego składa się ta kwota (wersje = starsze wersje i kopie na telefon) |
| `STATUS zostaje <nazwa> <plik>` | rendery, które zostają (najnowsza wersja i rendery bez numeru wersji, np. próby) |
| `STATUS projekt <nazwa> POSPRZATANY` | nie ma czego przenosić; nie wspominaj |
| `STATUS projekt <nazwa> W_TRAKCIE` | brak gotowej rolki, projekt zostaje; nie wspominaj |
| `STATUS projekt <nazwa> NIEZNANY <MB>` | folder o innym układzie (np. ze starszej wersji Studio): nie ruszasz go |

Gdy razem jest mniej niż 50 MB, powiedz, że nie ma czego sprzątać, i skończ.

Inaczej pokaż krótką listę z rozmiarami:

> Mogę zwolnić około 9 GB:
> - pliki robocze silnika montażu: 3,8 GB
> - projekt „efekty-2” (zostaje wersja 7): 2,8 GB do Kosza
> - projekt „claude-montuje” (zostaje wersja 6 i próby A, B, C): 1,8 GB do Kosza
>
> Nagrania, gotowe rolki i Twoje materiały zostają. Sprzątnąć wszystko?

Przy plikach roboczych silnika dopisz jedno zdanie: w starszych projektach nie da się potem cofnąć wcześniejszych
zmian, a pierwszy podgląd starego projektu może chwilę dłużej się wczytywać.

Gdy `zmiana` projektu to dzisiejsza data, zapytaj, czy ta rolka jest już skończona. Jeśli nie, pomiń ten projekt.
Gdy są projekty `NIEZNANY` większe niż 500 MB, dopisz jedno zdanie: te foldery mają inny układ, więc ich nie ruszasz,
a kursantka może je przejrzeć sama. Gdy kursantka pyta, co dokładnie pójdzie do Kosza, uruchom
`projekty --projekt "<folder>" --lista` i opowiedz zwykłymi słowami.

## Krok 2. Sprzątanie

Po „tak” uruchom tylko to, na co się zgodziła:
- pliki robocze silnika: `miejsce --usun`,
- wszystkie gotowe projekty: `projekty --do-kosza`; wybrane: `projekty --projekt "<folder>" --do-kosza` dla każdego
  osobno. Gdy chce zachować którąś starszą wersję, dodaj `--zostaw <nazwa pliku>`.

| Linia | Co zrobić |
|---|---|
| `STATUS zwolniono <MB>` | tyle zwolniły pliki robocze silnika |
| `STATUS przeniesiono <nazwa> <MB>` | tyle z tego projektu jest w Koszu |
| `STATUS w-koszu-razem <MB>` | razem w Koszu |
| `STATUS miejsce-blad …`, `STATUS kosz-blad …` | pliku nie dało się usunąć lub przenieść (zwykle otwarty podgląd): poproś o zamknięcie podglądów i zaproponuj powtórkę |
| `STATUS blad …` + `WYNIK BLAD` | nic nie zostało usunięte: wytłumacz zwykłymi słowami |

Na koniec powiedz, ile miejsca zwolniono, i że pliki z projektów są w Koszu: miejsce zwolni się po opróżnieniu
Kosza, a gdyby czegoś brakowało, można to z niego przywrócić.

Gdy kursant chce zwolnić jeszcze więcej, powiedz, że największe są gotowe rolki i nagrania. Te usuwa sam, w swoich
folderach. Ty ich nie usuwasz.
