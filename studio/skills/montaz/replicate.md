---
name: replicate
description: Analizuje rolkę wzorcową i odtwarza jej styl montażu. Użyj gdy kursantka pokaże film i powie "zrób jak tu", "skopiuj ten styl", "chcę tak samo", "zrób w stylu tego".
---

# Kopiowanie stylu z rolki wzorcowej

Kursantka pokazuje Ci film, który jej się podoba. Ty analizujesz jak jest zrobiony i odtwarzasz ten styl na jej własnym nagraniu.

---

## Krok 1. Odbierz rolkę wzorcową

Kursantka wrzuca plik lub link. Jeśli wrzuciła link — powiedz jej żeby pobrała plik i wrzuciła bezpośrednio (nie pobierasz za niej z zewnętrznych serwisów).

Sprawdź format: mp4, mov, webm — OK. Inne formaty — powiedz jakiego oczekujesz.

---

## Krok 2. Wyciągnij klatki do analizy

```bash
# Klatka co sekundę przez pierwsze 30 sekund
ffmpeg -i wzorzec.mp4 \
  -vf "fps=1,scale=540:-1" \
  -frames:v 30 \
  klatka_%03d.jpg
```

Przejrzyj klatki. Szukasz:

**Napisy:**
- Są napisy? Tak / Nie
- Gdzie stoją: dół, góra, lewa, prawa, środek
- Ile słów na raz (jedna sylaba, jedno słowo, kilka słów, całe zdanie)
- Czcionka: serif (z ogonkami) czy sans-serif (prosty krój)?
- Styl: pogrubiona, cienka, kursywa?
- Kolor: biały, żółty, inny?
- Efekt: cień, obrys, brak?
- Animacja napisów: fade, pop, karaoke (litera po literze)?

**Grafiki:**
- Są karty tytułowe lub callout? Tak / Nie
- Styl: dark (czarne tło), paper (białe), inne?
- Gdzie stoją na ekranie?
- Jak wchodzą i wychodzą?

**Cięcie i rytm:**
- Tempo: szybkie (cięcie co 1–2 s), normalne (3–4 s), wolne (5+ s)?
- Są przejścia? Jakie (fade, cut, zoom)?
- Są retaki widoczne?

**Dźwięk:**
- Głośność: wyraźna, ściszona, zmieniana dynamicznie?
- Są efekty dźwiękowe lub podkład muzyczny?

---

## Krok 3. Podsumuj co wykryłaś

Napisz kursantce krótki raport — pokaż co znalazłaś. Na przykład:

> Widzę że ten film ma:
> - Napisy: jedno słowo na raz, dół ekranu, biała pogrubiona czcionka bez ogonków, z czarnym cieniem
> - Grafiki: brak kart tytułowych, tylko podkreślenie słów przez zmianę koloru napisu
> - Tempo: szybkie, cięcie co około 2 sekundy
> - Dźwięk: wyraźna mówczyni, bez podkładu muzycznego
>
> Nie jestem pewna co do czcionki — może to Inter albo Figtree. Chcesz żebym używała tej samej?

Czekaj na potwierdzenie. Jeśli kursantka coś poprawia — zapisz.

---

## Krok 4. Zmapuj na dostępne style

Próbuj dopasować wykryty styl do istniejących stylów z `napisy-style.md`.

| Jeśli wzorzec ma | Styl do sprawdzenia |
|---|---|
| Pogrubiony, jedno słowo, biały | Mocny pokaz (#11), Nagłówek (#4) |
| Kursywa, elegancja | Notatnik (#3), Styl kinowy (#9) |
| Karaoke, litera po literze | Karaoke (#14) |
| Podkreślenie ważnych słów | Podkreślenie (#15) |
| Duże, pełne ekranu | Kontury (#19), Retro plakat (#21) |

Jeśli żaden styl nie pasuje dobrze — powiedz kursantce: "Twój styl wzorcowy jest inny niż nasze gotowe szablony. Mogę zrobić styl niestandardowy tylko dla tego filmu, albo wybrać ten który jest najbliższy."

---

## Krok 5. Zapytaj o trzy decyzje

Przed montażem potrzebujesz wyraźnej odpowiedzi na:

1. **Styl napisów**: wybrać najbliższy gotowy (podaj nazwę) czy zrobić niestandardowy?
2. **Grafiki**: odtworzyć jeśli były, czy pominąć?
3. **Tempo cięcia**: dopasować do wzorca czy do naturalnego rytmu mówienia w jej filmie?

Pytaj w jednej wiadomości. Czekaj na odpowiedź.

---

## Krok 6. Zapisz styl tymczasowo

Stwórz plik `styl-wzorzec.json` w folderze projektu (nie nadpisuj `moj-styl.json`):

```json
{
  "zrodlo": "wzorzec od kursantki",
  "napisy": {
    "styl": "nazwa stylu lub opis",
    "pozycja": "dol",
    "animacja": "fade"
  },
  "grafiki": {
    "dark_or_paper": "dark",
    "sa_karty_tytulowe": false
  },
  "tempo_ciecia": "szybkie"
}
```

Użyj tego pliku przy montażu zamiast `moj-styl.json`.

Na końcu zapytaj: "Czy chcesz ten styl zapisać jako jeden z Twoich stałych stylów?" Jeśli tak — dodaj go do `moj-styl.json` pod osobną kluczem.

---

## Czego nie kopiujesz

- **Treści:** słowa, grafiki, liczby z wzorca są cudzą własnością. Kopiujesz tylko formę — jak wygląda, jak się porusza, jakie ma tempo.
- **Muzyki:** nawet jeśli w wzorcu jest podkład muzyczny, nie szukasz tej samej ścieżki. Kursantka dobiera muzykę samodzielnie.
- **Logo i brandingu** z cudzego filmu — zawsze.
