# Zasady grafik

Krótki zbiór zasad. Claude czyta go przed każdą grafiką. Gdy kursantka da uwagę, jedna z tych zasad zostaje PRZEPISANA (nie dodajesz nowej obok).

## Przed budowaniem

- **Najpierw plan, potem budowa.** Napisz listę grafik w czacie — kursantka zatwierdza zanim cokolwiek zbudujesz.
- **Mało grafik.** Karta tytułowa na początku, callout z listą gdy mówi o liście. Nie więcej.

## Co pokazywać

- **Tylko kluczowe słowa na karcie tytułowej** — 1–4 słowa, nigdy całe zdanie.
- **Pokaż rzeczywistą liczbę.** Jeśli kursantka mówi liczbę, ta liczba musi być na ekranie, zapisana tak jak wypowiadana.
- **Na ekranie tylko to co prawdziwe** — żadnych wymyślonych wyników, komentarzy ani liczb.

## Kiedy pokazywać

- **Grafika ląduje na słowie lub chwilę przed** — nigdy po tym jak słowo zostało powiedziane.
- **Minimum czasu wyświetlania** — 2 sekundy + 0,35 sekundy na każde słowo. Poniżej tego to flash niewidoczny na telefonie.

## Wygląd i kolory

- **Tylko jednolite kolory** — czarna lub biała karta + jeden kolor akcentu na cały film. Kolor akcentu pochodzi z `moj-styl.json`.
- **Dwa style** — dark (czarna karta, domyślnie) lub paper (biała karta, jeden wyraz akcentu kursywą szeryfową). Jeden styl na cały film.
- **Grafiki z prawdziwego tekstu i kształtów** — nigdy nie powiększaj screenshota (robi się rozmazany). Screenshot w oryginalnym rozmiarze lub mniejszy jest OK.
- **Duży tekst** — jeśli trudno czytać na telefonie, powiększ.

## Gdzie stawiać

- **Z dala od twarzy** — przed budowaniem sprawdź `layout.json`. Tytuł i listy idą na stronę wolną od twarzy (pole `wolne_miejsce`). Jeśli pliku nie ma — domyślnie lewy górny róg.
- **Nigdy na ustach ani brodzie mówiącej.** Jeśli grafika wychodzi na twarz — przesuń w górę lub na bok.
- **Bezpieczna strefa** — nic nie wychodzi poza: góra 220px, dół 450px (format 1080×1920), boki 35px.

## Animacja

- **Każda grafika animuje się raz wejście, raz wyjście** — nigdy nie powtarza.
- **Nigdy dwie grafiki naraz** — nigdy tekst na tekście.

## Nakładanie oryginalnych screenshotów (`overlay-image`)

Gdy kursantka chce pokazać swoje prawdziwe screenshoty z telefonu (np. statystyki z Instagram), użyj komendy `overlay-image`. **Nigdy nie odtwarzaj danych z screenshot ręcznie — nakładaj oryginalny plik.**

### Jak wywołać

```sh
sh montaz.sh overlay-image <wideo_wej> <config.json> <wyjscie.mp4>
```

### Format config.json

```json
{
  "fps": 30,
  "snap_sound": true,
  "overlays": [
    {
      "image":     "/ścieżka/do/screenshot.jpg",
      "appear_t":  0.35,
      "cx":        540,
      "cy":        900,
      "width":     780,
      "angle":     -3,
      "anim_dur":  0.15,
      "red_delay": 0.30,
      "red_circle": { "cx": 155, "cy": 115, "rx": 135, "ry": 55 }
    }
  ]
}
```

### Zasady pozycjonowania

- `cx`, `cy` — **środek** nałożonego obrazka w kadrze 1080×1920.
- Screenshoty lądują na **klatce/brzuchu** (cy ≈ 800–1400) — **nigdy na twarzy** (cy < 600).
- Gdy kilka screenshotów: każdy kolejny niżej, z przesunięciem ok. 220 px.
- `width` — szerokość po skalowaniu. Nie przekraczaj 900 px; 700–800 px jest czytelne na telefonie.
- `angle` — lekkie pochylenie (±2–5°) wygląda naturalnie.

### Czerwone kółko (`red_circle`)

Zaznacza kluczową wartość na screenshocie (np. Wyświetlenia). Podaj pozycję w pikselach **w zeskalowanym obrazku** (bez paddingu). Sprawdź ją narzędziem klatki-pozycja lub ręcznie szacując z proporcji.

### Wymagania

Komenda używa Pythona 3 i biblioteki Pillow. Jeśli `/studio:start` zgłosi brak Pillowa, uruchom go i poczekaj na instalację.
