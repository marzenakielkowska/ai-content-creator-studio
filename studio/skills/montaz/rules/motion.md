# Zasady animowania grafik

Krótki zbiór zasad. Claude czyta go gdy buduje animacje w HyperFrames. Gdy kursantka da uwagę, jedna z tych zasad zostaje PRZEPISANA (nie dodajesz nowej obok).

---

## Podstawowe zasady

- **Wejście i wyjście — raz, zawsze.** Każda grafika pojawia się z animacją wejścia i znika z animacją wyjścia. Nigdy nie skacze — zawsze wchodzi i wychodzi płynnie.
- **Nigdy dwie animacje w tym samym czasie.** Gdy jedna grafika wchodzi, poprzednia musi już być poza ekranem. Jeśli harmonogram na to nie pozwala — skróć czas wyświetlania.
- **Animacja nigdy nie pętli.** `animation-iteration-count: 1` zawsze. Grafika się pojawia, jest, znika — koniec.

---

## Czas animacji

| Typ | Czas |
|---|---|
| Wejście (fade, slide) | 0,25–0,35 s |
| Wyjście (fade, slide) | 0,15–0,25 s |
| Wejście wyróżnione (scale, pop) | 0,3–0,4 s |

Poniżej 0,15 s — animacja jest niewidoczna na telefonie. Powyżej 0,5 s — grafika wydaje się ciężka i wolna.

---

## Easing (tempo animacji)

- **Wejście** → `ease-out` (zaczyna szybko, zwalnia): grafika przyspiesza do ekranu i spokojnie ląduje.
- **Wyjście** → `ease-in` (przyspiesza, kończy szybko): grafika odchodzi delikatnie i znika sprawnie.
- **Nigdy** `linear` dla wejść i wyjść — wygląda mechanicznie.

---

## Typy animacji wejścia (wybierz jedno)

```css
/* Fade in */
@keyframes wejscie-fade {
  from { opacity: 0.01; }
  to   { opacity: 1; }
}

/* Slide od dołu */
@keyframes wejscie-dol {
  from { opacity: 0.01; transform: translateY(40px); }
  to   { opacity: 1;    transform: translateY(0); }
}

/* Slide od lewej */
@keyframes wejscie-lewo {
  from { opacity: 0.01; transform: translateX(-40px); }
  to   { opacity: 1;    transform: translateX(0); }
}

/* Slide od prawej */
@keyframes wejscie-prawo {
  from { opacity: 0.01; transform: translateX(40px); }
  to   { opacity: 1;    transform: translateX(0); }
}

/* Scale (pop) */
@keyframes wejscie-pop {
  from { opacity: 0.01; transform: scale(0.85); }
  to   { opacity: 1;    transform: scale(1); }
}
```

## Typy animacji wyjścia (wybierz jedno)

```css
/* Fade out */
@keyframes wyjscie-fade {
  from { opacity: 1; }
  to   { opacity: 0; }
}

/* Slide w górę */
@keyframes wyjscie-gora {
  from { opacity: 1; transform: translateY(0); }
  to   { opacity: 0; transform: translateY(-30px); }
}

/* Slide w dół */
@keyframes wyjscie-dol {
  from { opacity: 1; transform: translateY(0); }
  to   { opacity: 0; transform: translateY(30px); }
}
```

---

## Spójność kierunku

Kierunek wejścia i wyjścia powinien być spójny z układem ekranu:
- Grafika po lewej stronie → wchodzi z lewej, wychodzi w lewo.
- Grafika na dole → wchodzi z dołu, wychodzi w dół.
- Grafika wyśrodkowana → fade in / fade out (brak kierunku = fade).

Nie mieszaj kierunków w jednym filmie bez powodu.

---

## Wieloelementowe grafiki (listy, kilka linii)

Gdy grafika ma wiele elementów (np. lista 3 punktów):
- Nie animuj każdego elementu osobno — animuj całą kartę jako jedną.
- Wyjątek: karta tytułowa z tłem + tekst mogą mieć osobne chwile (tło pojawia się 0,1 s wcześniej niż tekst).
- Maksymalne opóźnienie między elementami grupy: 0,1 s. Więcej to widowisko, nie film.

---

## Czego nie robić

- **Nie obracaj** — `rotate` na tekście lub karcie wygląda jak błąd, nie efekt.
- **Nie używaj efektu blur** — rozmycie wejścia jest popularne w szablonach ale źle się wyświetla na starszych telefonach.
- **Nie animuj koloru ani cienia** — zmiana `background-color` albo `box-shadow` w animacji jest kosztowna renderowo i niepotrzebna.
- **Nie animuj `width` ani `height`** — zamiast tego skaluj przez `transform: scale()`.
