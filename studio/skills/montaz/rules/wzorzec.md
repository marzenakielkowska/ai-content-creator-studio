# Pomiar rolki wzorcowej (`analizuj-wzorzec`)

Gdy kursantka przynosi film referencyjny (rolka którą chce naśladować), użyj komendy `analizuj-wzorzec`. Daje to liczby i obrazki zamiast zgadywania: tempo cięć, momenty wejść, głośność.

## Jak wywołać

```sh
sh montaz.sh analizuj-wzorzec <plik-wideo> <folder-wyjscia>
```

Wynik: `STATUS analizuj-wzorzec OK folder=<ścieżka>`

## Co powstaje w folderze

| Plik | Co zawiera |
|------|-----------|
| `arkusz_01.jpg`, `arkusz_02.jpg` ... | Siatka 4×5 klatek co 0.5s — pełny przegląd rolki |
| `ciecia.jpg` | Klatki przy każdym wykrytym cięciu montażowym |
| `ruch_01.jpg`, `ruch_02.jpg` ... | Osiem klatek wokół każdego nagłego wejścia (grafika, napis) |
| `pomiary.json` | Wszystkie zmierzone liczby (patrz niżej) |

## Co czytać z pomiary.json

```json
{
  "szerokosc_px": 1080,
  "wysokosc_px": 1920,
  "fps": 30.0,
  "dlugosc_s": 45.2,
  "ciecia_s": [3.1, 6.8, 10.4, ...],
  "sredni_odstep_s": 3.6,
  "momenty_ruchu_s": [1.2, 4.0, ...],
  "srednia_glosnosc_db": -18.5,
  "szczyt_glosnosc_db": -6.1,
  "szczyty_dzwieku_s": [0.5, 6.8, ...]
}
```

- `sredni_odstep_s` — co ile sekund są cięcia → tempo montażu wzorca
- `momenty_ruchu_s` — kiedy coś wchodzi na ekran → gdzie wstawiać grafiki
- `szczyty_dzwieku_s` — uderzenia dźwięku → naturalny rytm do naśladowania

## Jak używać wyników

1. **Obejrzyj arkusze** — oceń wizualnie styl: ciemny/jasny tło, duży/mały tekst, ile miejsca na twarz.
2. **Porównaj `sredni_odstep_s` ze swoim filmem** — jeśli wzorzec ma 3s a kursantka ma 8s, skróć cięcia.
3. **Użyj `momenty_ruchu_s`** jako sugestię timestampów dla grafik — wejście grafiki przy naturalnym ruchu wygląda lepiej.
4. **`srednia_glosnosc_db`** — punkt odniesienia do normalizacji audio (`sprawdz-dzwiek`).

## Ograniczenia

- Wykrywanie ruchu działa na całej klatce — nie rozróżnia napisu od ruchu osoby. Sprawdź `ruch_NN.jpg` wzrokiem.
- Cięcia z `ciecia_s` mogą nie zawierać cięć z nakładką przejściową (fade, wipe) — te mają niższy próg zmiany pikseli.
- Komenda wymaga Pythona 3 z Pillow. Jeśli `/studio:start` zgłosi brak Pillowa, uruchom go i poczekaj.
