# Efekt: Orbita

**Co robi:** małe zaokrąglone karty-ekrany (inne rolki kursantki) krążą wokół niej po eliptycznej ścieżce — część przechodzi z tyłu (z-index < kursantka), część z przodu (z-index > kursantka). Kursantka wycięta z tła stoi na środku. Daje efekt głębi i ruchu jednocześnie.

**Czas trwania:** 6s (loopable). Użyj jako nakładka na scenie lub jako standalone klip.

---

## Czego potrzeba

### Wideo od kursantki
- Kursantka wycięta z tła:
  ```bash
  npx hyperframes remove-background wideo.mp4 --output cutout.webm
  ```
  Jeśli pojawi się błąd planu — zaproponuj kursantce lokalne narzędzie i poczekaj na jej zgodę:
  > „Potrzebuję zainstalować dodatkowe narzędzie do wycięcia tła (`rembg`, bezpłatne, działa lokalnie). Czy mogę?"
  Po „tak":
  ```bash
  pip install rembg[cli]          # instalacja raz
  rembg i wideo.mp4 cutout.webm   # wycięcie tła
  ```
- Format 9:16, 1080×1920
- Bez ruchu tła (usuwa je remove-background)

### Miniatury rolek
- 3–5 zdjęć PNG miniatur innych rolek kursantki
- Wymiar: min 400×710px (proporcje 9:16)
- Zapisz jako: `assets/card1.png`, `card2.png` itd.

---

## Projekt HyperFrames

Plik: `hf/index.html`

### Karty-ekrany

Każda karta:
- Wymiar: `200×356px`
- `border-radius: 24px`
- `box-shadow: 0 8px 32px rgba(0,0,0,0.5)`
- Warstwa: co druga karta ma `z-index` poniżej kursantki (np. 5), co druga powyżej (np. 15). Kursantka: `z-index: 10`.

### Ścieżka orbity

Elipsa wyśrodkowana na kursantce:
- Półoś pozioma: `rx = 440px` (±440 od środka = 540px)
- Półoś pionowa: `ry = 200px`
- Środek: `cx = 540, cy = 960`

GSAP MotionPath lub ręczna parametryczna animacja (zalecana):

```javascript
// Dla każdej karty i ∈ [0, n-1]:
const phase = (i / n) * Math.PI * 2;  // rozłożone równomiernie
gsap.to(card, {
  duration: 6,
  repeat: -1,   // UWAGA: HyperFrames nie obsługuje repeat:-1 — użyj długości 6s i pętluj ręcznie
  ease: "none",
  modifiers: {
    x: (_, target) => 540 + 440 * Math.cos(progress + phase) - 100,
    y: (_, target) => 960 + 200 * Math.sin(progress + phase) - 178,
  }
});
```

**Ważne:** HyperFrames nie obsługuje `repeat: -1`. Animuj cały obrót w czasie `data-duration` sceny (6s). Użyj `keyframes` lub interpolacji ręcznej przez `progress` kluczowy od 0 do 1.

### Z-index (który ekran jest z przodu)

Oblicz na podstawie pozycji Y na orbicie: im wyżej (mniejszy Y) — tym z tyłu (mniejszy z-index). Przelicz w GSAP przez `onUpdate`:

```javascript
gsap.ticker.add(() => {
  const y = parseFloat(card.style.transform.match(/translateY\((.+?)px\)/)?.[1] ?? 960);
  card.style.zIndex = y > 960 ? 15 : 5;
});
```

### Timing kart (bez repeat:-1)

Dla n=3 kart, czas 6s:
- Karta 1: kąt 0→360° w ciągu 6s
- Karta 2: kąt 120→480° (przesunięta o 2s)
- Karta 3: kąt 240→600° (przesunięta o 4s)

Użyj `gsap.fromTo` z `delay` lub bezpośrednio przez `keyframes`.

---

## Workflow

```
1. npx hyperframes remove-background wideo.mp4 --output assets/cutout.webm
2. Skopiuj miniatury do assets/card1.png, card2.png...
3. Zbuduj hf/index.html według opisu powyżej
4. npx hyperframes check --json
5. npx hyperframes snapshot --at 1,2,3,4,5
6. npx hyperframes render --output wynik.mp4 --quality looks
```

---

## Personalizacja dla kursantki

| Co zmienić | Gdzie | Wskazówka |
|---|---|---|
| Miniatury rolek | `assets/card*.png` | Używaj swoich prawdziwych miniatur |
| Liczba kart | `index.html` — dodaj/usuń `.card` | Optymalnie 3–5 kart |
| Rozmiar kart | CSS `width/height` na `.card` | 160×284 (małe) do 240×427 (duże) |
| Prędkość orbity | `data-duration` sceny | 4s = szybko, 8s = spokojnie |
| Promień orbity | `rx`, `ry` w animacji | rx=350 gdy kursantka w środku kadru, rx=500 gdy z boku |

---

## Znane pułapki

- `remove-background` wymaga połączenia z internetem i konta HyperFrames z aktywnym planem
- Karty muszą mieć `class="clip"` z `data-start="0"` i `data-duration` równym długości sceny
- Nie używaj CSS `transform` razem z GSAP transform na tym samym elemencie
- `z-index` musi zmieniać się w `onUpdate` — inaczej karty zawsze będą albo zawsze z przodu albo zawsze z tyłu
