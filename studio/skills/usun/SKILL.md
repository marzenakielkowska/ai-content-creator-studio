---
name: usun
description: Odinstalowuje AI Content Creator Studio. Pokazuje, co Studio zostawiło na komputerze i ile to zajmuje, a po zgodzie usuwa programy, pliki podręczne i wtyczki Studio. Nagrań i gotowych rolek nigdy nie usuwa. Użyj, gdy użytkownik wpisze /studio:usun, powie „odinstaluj Studio”, „usuń Studio”, „nie chcę już Studio” albo zapyta, jak posprzątać po Studio.
---

# Odinstalowanie Studio (/studio:usun)

Mów po polsku, prostym językiem, krótko. Nie pokazuj linii `STATUS`, ścieżek do skryptów ani błędów technicznych.
Miejsca nazywaj tak, jak widzi je kursant: „folder Studio w Twoim katalogu domowym”, „folder z rolkami”. Pełną ścieżkę
podaj tylko wtedy, gdy kursant o nią zapyta.

## Zasady, których pilnujesz zawsze

1. **Nic bez zgody.** Najpierw cała lista z rozmiarami, usuwasz dopiero po wyraźnym „tak”.
2. **Nagrania i rolki zostają.** Folderu z nagraniami i folderu z projektami i rolkami nie usuwasz nigdy, nawet na
   prośbę. Powiedz, gdzie są, i że kursant może je skasować sam, jeśli chce.
3. **Tylko skrypt z tego skilla.** Nie usuwaj niczego własnymi poleceniami (`rm`, `Remove-Item`, `rmdir`). Gdy
   skrypt zgłasza błąd, zatrzymaj się i powiedz kursantowi zwykłymi słowami, co się stało.
4. **Programy kursanta zostają.** Skrypt usuwa tylko foldery Studio i HyperFrames. Node, FFmpeg czy Python, które
   kursant miał wcześniej albo zainstalował sam, zostają.

## Skąd uruchamiać skrypt

`SK` to folder tego pliku: katalog bazowy, który Claude Code podaje przy wczytaniu skilla (lub
`${CLAUDE_PLUGIN_ROOT}/skills/usun`). Pełna ścieżka w cudzysłowie, jedno polecenie na wywołanie, bez `cd` i `&&`.

- **Mac:** `sh "SK/scripts/sprzatanie.sh" <polecenie>`
- **Windows:** `powershell -NoProfile -ExecutionPolicy Bypass -File "SK/scripts/sprzatanie.ps1" <polecenie>`

## Krok 1. Lista

Uruchom `pokaz`. Linie wyniku:

| Linia | Co znaczy |
|---|---|
| `STATUS czesc studio <MB> …` | folder Studio: programy do montażu (Node, FFmpeg, HyperFrames, program do pobierania filmów), ustawienia folderów i zapisany styl |
| `STATUS czesc stary-styl <MB> …` | dawny folder, w którym Studio trzymało styl |
| `STATUS czesc pamiec <MB> …` | pliki podręczne HyperFrames: przeglądarka do renderu, model mowy, czcionki, narzędzie do wycinania z tła, historia zmian w projektach |
| `STATUS czesc <nazwa> BRAK` | tego już nie ma; nie wspominaj |
| `STATUS styl <pliki>\|BRAK` | czy jest zapisany styl z Lookbooka i marka |
| `STATUS zostaje nagrania\|projekty <folder>\|NIEZNANE` | foldery kursanta, których nie ruszasz |

Pokaż jedną listę, zsumuj rozmiary. Przykład:

> Studio zostawiło na Twoim komputerze:
> - programy do montażu i ustawienia Studio: 260 MB
> - pliki podręczne silnika montażu (przeglądarka, model mowy, historia zmian): 1,8 GB
> - wtyczki Studio i HyperFrames w Claude
>
> Razem około 2 GB. Twoje nagrania (folder Pulpit) i gotowe rolki (folder ai-studio-projekty) zostają, nie ruszam ich.
> Usunąć wszystko z listy?

Gdy `STATUS styl` nie jest `BRAK`, zapytaj też jednym zdaniem: „Zostawić kopię Twojego stylu w folderze z rolkami?
Przyda się, jeśli kiedyś wrócisz do Studio.” Gdy kursant chce usunąć tylko część, usuń tylko ją.

## Krok 2. Usuwanie plików

Po „tak” uruchom `usun` z częściami, które nie są `BRAK` (`studio`, `stary-styl`, `pamiec`). Gdy kursant chce kopię
stylu, dodaj `--kopia-stylu "<folder projektów>"`. Gdy folder projektów jest `NIEZNANE`, zapytaj, gdzie zapisać kopię.

| Linia | Co zrobić |
|---|---|
| `STATUS kopia-stylu <folder> …` | powiedz, że kopia stylu jest w folderze z rolkami, w podfolderze moj-styl-kopia |
| `STATUS usunieto <czesc> <MB>` | gotowe |
| `STATUS usunieto <czesc> BLAD …` | coś trzyma pliki (np. otwarty podgląd). Poproś o zamknięcie podglądów i okien Studio i uruchom `usun` jeszcze raz dla tej części |
| `STATUS zwolniono <MB>` | tyle miejsca odzyskał kursant |
| `STATUS blad …` + `WYNIK BLAD` | skrypt niczego nie usunął. Wytłumacz zwykłymi słowami i nie próbuj obejść |

## Krok 3. Wtyczki

Na końcu, gdy pliki są już usunięte, odinstaluj wtyczki (każde polecenie osobno):

```
claude plugin uninstall studio@ai-content-studio --prune -y
claude plugin marketplace remove ai-content-studio
```

Pierwsze usuwa Studio i wtyczkę HyperFrames, która zainstalowała się razem z nim. Jeśli kursant ma HyperFrames
zainstalowane osobno, zostaje. Drugie usuwa sklep Studio razem z automatycznymi aktualizacjami.

Gdy polecenie `claude` nie działa (np. ktoś używa tylko aplikacji Claude), poproś kursanta, żeby zrobił to sam:
w tym samym miejscu, w którym instalował Studio (**+** obok pola wiadomości, potem **Plugins**), odinstalował
**AI Content Creator Studio** i **HyperFrames**, a potem usunął sklep **ai-content-studio**.

## Krok 4. Podsumowanie

Jednym, dwoma zdaniami: ile miejsca odzyskał, że nagrania i rolki zostały (i gdzie jest kopia stylu, jeśli była),
i że trzeba zacząć nową sesję, żeby Claude przestał widzieć Studio. Studio nie instalowało niczego w systemie, więc
nic więcej nie trzeba sprzątać.
