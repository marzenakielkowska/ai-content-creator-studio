# AI Content Creator Studio

Nagrywasz, a Claude montuje rolkę w Twoim stylu.

Ta wtyczka jest dla kursantów AI Content Creator Studio. Filmy instruktażowe i wsparcie znajdziesz w materiałach kursu.

> **Wersja testowa (0.1.0).** Na razie wtyczka sprawdza tylko, czy instalacja się udała. Montaż rolek pojawi się
> w kolejnych aktualizacjach.

## Czego potrzebujesz

- Aplikacji **Claude** na komputerze, z planem, który obejmuje Claude Code.
- Programu **git**:
  - **Mac:** nic nie musisz robić wcześniej. Jeśli komputer poprosi o doinstalowanie narzędzi, zgódź się.
  - **Windows:** najpierw zainstaluj [Git for Windows](https://git-scm.com/downloads) i zostaw domyślne ustawienia.

## Instalacja w aplikacji Claude

1. Otwórz aplikację Claude i przejdź do karty **Code**.
2. Kliknij **+** obok pola wiadomości, potem **Plugins**, potem **Browse plugins**.
3. Kliknij **Add**, potem **Add marketplace**, potem **Add from a repository**.
4. Wklej ten link i kliknij **Sync**:

   ```
   https://github.com/marzenakielkowska/ai-content-creator-studio
   ```

5. Na liście znajdź **AI Content Creator Studio** i zainstaluj.
6. Zacznij nowy czat i wpisz:

   ```
   /studio:witaj
   ```

   Jeśli Claude odpowie, że Studio działa, wszystko jest gotowe.

## Instalacja z terminala (zamiast aplikacji)

Tylko jeśli używasz Claude Code w Terminalu (Mac) albo w PowerShellu (Windows). Wklej każdą linijkę osobno:

```
claude plugin marketplace add marzenakielkowska/ai-content-creator-studio
```

```
claude plugin install studio@ai-content-studio
```

Potem uruchom Claude Code i wpisz `/studio:witaj`.

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

Po aktualizacji zacznij nowy czat, żeby Claude wczytał nową wersję.

## Pomoc

Napisz na adres wsparcia podany w kursie. Opisz, co robiłaś lub robiłeś i co się stało. Zrzut ekranu bardzo pomaga.

---

© 2026 Marzena Kiełkowska. Dla kursantów AI Content Creator Studio, na warunkach opisanych w pliku
[LICENSE.md](LICENSE.md). Projekt niezależny, niepowiązany z Anthropic.
