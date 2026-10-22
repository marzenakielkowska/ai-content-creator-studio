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

## Co już działa (wersja 0.3.1)

| Skill | Komenda | Co robi |
|---|---|---|
| start | `/studio:start` | Instaluje narzędzia: Node, FFmpeg, HyperFrames, model mowy, przeglądarka do renderu |
| witaj | `/studio:witaj` | Sprawdza czy wtyczka działa |
| lookbook | `/studio:lookbook` | Kursantka wybiera styl napisów i efektów, zapisuje do `moj-styl.json` |
| dzwieki | `/studio:dzwieki` | Kursantka wybiera dźwięki, zapisuje do `moj-styl.json` |

Stos techniczny: Node.js + Shell (Mac) / PowerShell (Windows). Bez Pythona, bez sudo.
Narzędzia lądują w `~/.ai-content-studio/`. Nic nie jest instalowane systemowo.

---

## Co jest w budowie — skill montażu

Kolejny skill: `/studio:montaz` — właściwy montaż rolek. Jeszcze nie istnieje.

### Pliki już zapisane w repo (`studio/skills/montaz/`)

| Plik | Status | Co zawiera |
|---|---|---|
| `rules/cut.md` | ✅ gotowe | 9 zasad cięcia po polsku |
| `rules/captions.md` | ✅ gotowe | Zasady napisów + system oznaczania słów |
| `napisy-style.md` | ✅ gotowe | Lista 23 stylów napisów z czcionkami |

### Pliki do napisania

| Plik | Status |
|---|---|
| `rules/graphics.md` | ✅ gotowe | 14 zasad grafik: plan→zatwierdzenie, kolory, czas, strefa bezpieczeństwa |
| `rules/checks.md` | ✅ gotowe | 6 defektów + tabela 4 warunków + procedura poprawek |
| `NOTES_LOG.md` | ✅ gotowe | Dziennik uwag i przepisanych reguł, format tabeli + przykład |
| `SKILL.md` | ✅ gotowe | 8-krokowy pipeline z zatrzymaniami na OK |

---

## Kluczowe decyzje projektowe

### Profile klientów (do zrobienia po skillach)
Kursantki montują też dla swoich klientów. Planowana zmiana struktury:
- `moj-styl.json` → `profil-moj.json` (własny styl)
- `profil-[nazwa].json` dla każdego klienta
- `aktywny-profil.txt` — jeden plik z nazwą aktywnego profilu
- Zmiana w `serwer.mjs` Lookbooka: przyjmuje argument `--profil <nazwa>`
- Szacowany nakład: ~20 linii kodu
- **Priorytet: po zbudowaniu skilla montażu**

### Kolejność budowania
1. Reguły grafik → checks → NOTES_LOG → SKILL.md skilla montażu
2. Profile klientów (zmiana Lookbooka)

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

1. `git rm KONTEKST.md`
2. Dodaj `KONTEKST.md` do `.gitignore`
3. Zachowaj plik lokalnie w `~/Documents/` poza folderem repo
4. Commit + push

---

*Ostatnia aktualizacja: 2026-10-22*
