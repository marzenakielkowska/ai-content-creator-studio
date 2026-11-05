# Zasady animowania grafik

Krótki zbiór zasad. Claude czyta go gdy buduje animacje w HyperFrames. Gdy kursantka da uwagę, jedna z tych zasad zostaje PRZEPISANA (nie dodajesz nowej obok).

**Silnik animacji w HyperFrames: GSAP.** Nie CSS @keyframes (poza prostymi dekoracjami). GSAP to jedyna metoda gwarantowana przy seekowaniu klatka-po-klatce.

---

## Podstawowe zasady

- **Wejście i wyjście — raz, zawsze.** Każda grafika pojawia się z animacją wejścia i znika z animacją wyjścia. Nigdy nie skacze.
- **Najwyżej 2–3 elementy w ruchu naraz.** Dwie grafiki w tym samym miejscu nigdy razem: gdy nowa wchodzi, poprzednia
  musi już być poza ekranem. Ruch w rytm mowy: wejście na akcentowanym słowie.
- **Nigdy `repeat: -1`** bez skończonego `data-duration` na elemencie — nieskończona pętla zamraża render.
- **Nigdy `Math.random()` ani `Date.now()` w tweenach** — dwa rendery tej samej klatki muszą być identyczne.

---

## Czas animacji

| Typ | Czas |
|---|---|
| Wejście (fade, slide) | 0,25–0,35 s |
| Wyjście (fade, slide) | 0,15–0,25 s |
| Wejście wyróżnione (pop, spring) | 0,3–0,45 s |

---

## Easing

- Wejście → `"power3.out"` lub `"power2.out"` (szybki start, miękkie lądowanie)
- Wyjście → `"power2.in"` (delikatny start, pewne wyjście)
- Pop / sprężyna → `"back.out(2)"` lub `"elastic.out(1, 0.5)"`
- Nigdy `"linear"` dla wejść i wyjść

---

## Wzorce wejścia (GSAP)

```js
// Fade in
tl.from(el, { opacity: 0, duration: 0.3, ease: "power2.out" })

// Slide od dołu
tl.from(el, { opacity: 0, y: 40, duration: 0.3, ease: "power3.out" })

// Slide od lewej
tl.from(el, { opacity: 0, x: -40, duration: 0.3, ease: "power3.out" })

// Pop (powiększenie z odbiciem)
tl.from(el, { opacity: 0, scale: 0.85, duration: 0.35, ease: "back.out(2)" })

// Słowa jedno po drugim (stagger)
tl.from(".slowo", { opacity: 0, y: 30, duration: 0.25, ease: "power3.out", stagger: 0.06 })
```

---

## Wzorce wyjścia (at_end — czas od końca elementu)

Element znika o czasie `endTime`. Animacja wyjścia zaczyna się `exitDuration` sekund wcześniej.

```js
const exitDuration = 0.2

// Fade out — zaczyna 0.2s przed końcem elementu
tl.to(el, { opacity: 0, duration: exitDuration, ease: "power2.in" }, endTime - exitDuration)

// Slide w górę i znikanie
tl.to(el, { opacity: 0, y: -30, duration: exitDuration, ease: "power2.in" }, endTime - exitDuration)

// Scale down
tl.to(el, { opacity: 0, scale: 0.9, duration: exitDuration, ease: "power2.in" }, endTime - exitDuration)
```

Zasada: `at_end = endTime - exitDuration`. Jeśli nie wiesz kiedy element znika — użyj `"<+=2.8"` (2.8s po wejściu, wyjście po 0.2s = łącznie 3s na ekranie).

---

## on: "cuts" — efekt na każdym cięciu

Czasy cięć bierz z `segmenty.json` (pole `start` każdego segmentu poza pierwszym). Przejdź przez każdy i dodaj tween:

```js
// Punch-in na każdym cięciu (lekkie przybliżenie)
cutTimestamps.forEach(t => {
  tl.to(videoEl, {
    scale: 1.04,
    duration: 0.08,
    yoyo: true,
    repeat: 1,
    transformOrigin: "50% 35%"
  }, t)
})

// Biały flash na każdym cięciu
cutTimestamps.forEach(t => {
  tl.fromTo("#root",
    { filter: "brightness(1.5)" },
    { filter: "brightness(1)", duration: 0.15, ease: "power1.out" },
    t
  )
})

// Podkreślenie słowa w momencie wypowiedzenia (wersja na każde kluczowe słowo)
keywordTimestamps.forEach(({ t, el }) => {
  tl.fromTo(el,
    { scale: 1.12 },
    { scale: 1, duration: 0.18, ease: "power2.out" },
    t
  )
})
```

Efekty na cięciach używaj z umiarem — jeden efekt na film (albo punch-in, albo flash, nie oba). Flash tylko wtedy, gdy wybrany styl zakłada efektowne przejścia.

---

## Spójność kierunku

Kierunek wejścia i wyjścia powinien być spójny z układem ekranu:
- Grafika po lewej → wchodzi z lewej (`x: -40`), wychodzi w lewo (`x: -40`)
- Grafika na dole → wchodzi z dołu (`y: 40`), wychodzi w dół (`y: 40`)
- Grafika wyśrodkowana → fade in / fade out (brak kierunku = `opacity` tylko)

---

## Wieloelementowe grafiki

Gdy grafika ma wiele linii lub punktów — użyj `stagger`:
```js
tl.from(".linia", { opacity: 0, y: 20, duration: 0.25, ease: "power2.out", stagger: 0.08 })
```
Maksymalne opóźnienie między elementami grupy: 0,08 s. Więcej to widowisko, nie film.

---

## Czego nie robić

- **Nie animuj `width`, `height`, `top`, `left`** — używaj `x`, `y`, `scale`, `rotation` (GSAP transform aliases)
- **Nie używaj `autoAlpha` ani `opacity` na klipach (elementach z `data-start`)** — silnik pilnuje ich widoczności sam; owiń klip w `div` i animuj `div` (patrz `rules/pulapki.md`)
- **Nie mierz `getBoundingClientRect()` wewnątrz tweena** — oblicz pozycję raz przed zbudowaniem timeline
- **Nie obracaj karty tytułowej** — `rotation` na niej wygląda jak błąd (lekkie przechylenie kart z rolkami/zdjęciami jest OK)
- **Nie dodawaj `repeat: -1`** bez skończonego `data-duration`
