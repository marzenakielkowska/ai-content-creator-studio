---
name: gify
description: Wstawia GIF jako nakładkę do rolki. Użyj gdy kursantka prosi o GIF w filmie, reakcję, animowaną nakładkę, lub mówi "wstaw gifa".
---

# Wstawianie GIF-ów do rolki

GIF w rolce to nakładka — pojawia się na kilka sekund w konkretnym miejscu, pasuje do tego co kursantka mówi.

---

## Przed wstawieniem — zapytaj

Zapytaj kursantkę w jednej wiadomości:
1. Który moment w filmie (podaj sekundy z transkrypcji)?
2. Gdzie na ekranie: góra, środek, dół? Lewa, prawa, środek?
3. Jak długo ma być widoczny?
4. Skąd pochodzi GIF — czy wrzuci plik, czy opisze co szukać?

Nie wstawiaj GIF-a bez tych odpowiedzi.

---

## Zasady GIF-ów

- **Bezpieczna strefa:** ta sama co grafiki — góra 220px, dół 450px, boki 35px. Nic poza tą strefą.
- **Z dala od twarzy:** sprawdź `layout.json`. GIF idzie na stronę wolną od twarzy.
- **Rozmiar:** max 400×400 px na ekranie. Większy zakrywa za dużo i rozprasza.
- **Bez prawa autorskiego:** GIF-y z rozpoznawalnych filmów lub seriali mają prawa. Kursantka musi to wiedzieć. Zapytaj jeśli GIF wydaje się materiałem cudzym.
- **Nie pętle przez cały film** — GIF ma być akcentem, nie dekoracją tła.

---

## Konwersja GIF → webm (overlay bez tła)

GIF-y mają białe lub szare tło. Żeby nakładka była przezroczysta, konwertuj przez FFmpeg:

```bash
# Konwersja z zachowaniem przezroczystości
ffmpeg -i wejscie.gif \
  -vf "scale=400:-1:flags=lanczos" \
  -c:v libvpx-vp9 \
  -pix_fmt yuva420p \
  -auto-alt-ref 0 \
  -b:v 0 -crf 10 \
  wyjscie.webm
```

Jeśli GIF nie ma przezroczystości (np. biały lub kolorowy wypełnienie):
```bash
# Usuń konkretny kolor tła (tu: biały)
ffmpeg -i wejscie.gif \
  -vf "scale=400:-1:flags=lanczos,colorkey=white:0.3:0.1" \
  -c:v libvpx-vp9 \
  -pix_fmt yuva420p \
  -auto-alt-ref 0 \
  wyjscie.webm
```

---

## Pętla GIF-a (ile razy ma się powtórzyć)

```bash
# 3 pętle GIF-a
ffmpeg -stream_loop 3 -i wejscie.gif \
  -vf "scale=400:-1:flags=lanczos" \
  -c:v libvpx-vp9 -pix_fmt yuva420p -auto-alt-ref 0 \
  wyjscie.webm
```

Oblicz: `czas_wyswietlania / czas_jednej_petli_gif = liczba_petli`. Zaokrąglij w górę.

---

## Nakładanie GIF-a na wideo przez FFmpeg

```bash
ffmpeg -i film.mp4 -i nakładka.webm \
  -filter_complex \
    "[1:v] setpts=PTS-STARTPTS+<start_s>/TB [gif]; \
     [0:v][gif] overlay=<x>:<y>:enable='between(t,<start_s>,<stop_s>)' [v]" \
  -map "[v]" -map "0:a" \
  -c:v libx264 -c:a copy \
  wynik.mp4
```

Gdzie:
- `<start_s>` — sekundy początku (np. `5.2`)
- `<stop_s>` — sekundy końca (np. `9.0`)
- `<x>`, `<y>` — pozycja lewego górnego rogu GIF-a w pikselach

Przykładowe pozycje dla formatu 1080×1920:
| Miejsce | x | y |
|---|---|---|
| Dół środek (400×400) | 340 | 1070 |
| Góra prawa (400×400) | 645 | 220 |
| Środek lewy (400×400) | 35 | 760 |

---

## Zanim pokażesz kursantce

Sprawdź (te same punkty co w `rules/checks.md`):
- GIF nie wychodzi poza bezpieczną strefę
- GIF nie zakrywa twarzy
- GIF nie nakłada się na napisy
- Czas pojawienia jest zsynchronizowany z wypowiedź

Pokaż kadr testowy z GIF-em przed finalnym renderem i czekaj na OK.
