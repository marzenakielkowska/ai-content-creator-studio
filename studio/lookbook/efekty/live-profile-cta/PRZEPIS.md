# Efekt: Live profil CTA

**Co robi:** Animowany klip 7.65s w dwóch fazach:

**Faza 1 (0–4.5s):** Ciemny ekran Instagram Live. Trzy komentarze piszą się jeden po drugim i wysyłają z animowanym sercem. Po lewej stronie unoszą się pływające serduszka. Widoczna liczba widzów. Wygląda jak prawdziwy Instagram Live.

**Faza 2 (4.5–7.65s):** Kadr przechodzi do profilu kursantki w ramce iPhone. Przycisk "Obserwuj" tapuje się z efektem pulse.

**Zastosowanie:** CTA na koniec rolki. Pokazuje widzom co mają zrobić (obserwuj) przez animację zamiast mówienia.

---

## Czego potrzeba

### Od kursantki
- **Screenshot profilu Instagram** — pełna strona, min 982px szerokości, format JPG lub PNG
  - Jak zrobić: otwórz swój profil na komputerze, zrób screenshot (Command+Shift+4 na Mac), zapisz jako `profile.jpg`
  - Musi zawierać: zdjęcie profilowe, nazwę, liczby (posty / obserwujący / obserwowani), przycisk Obserwuj
- **pop.mp3** — dźwięk tapnięcia przycisku (już w repozytorium przy efekcie "przed-i-po")

### Rozmiar kadru
1080×1920, 7.65s, 30fps.

---

## Projekt HyperFrames

Plik: `hf/index.html` (kompozycja v19)

### Faza 1 — Instagram Live UI

Tło: `#111111`. Elementy:

| Element | Pozycja | Styl |
|---|---|---|
| Badge LIVE | góra, 120px od lewej, y=180 | tło `#B91C5B`, `border-radius:4px`, font Inter Bold 20px |
| Liczba widzów | obok badge | biały, 18px, `rgba(255,255,255,0.72)` |
| Serduszko LIVE (ikonka) | obok liczby | `rgba(255,255,255,0.72)` |
| Komentarze (3x) | dolna 1/3, y=1400–1700 | ciemne pill `rgba(0,0,0,0.5)`, biały tekst 26px, Inter Regular |
| Serduszka pływające | lewa strona, x≈80 | unoszą się z y=1600→y=800, opacity 1→0, staggered |

**Komentarze** — pisz się i wysyłaj co 1.5s:
- Komentarz 1: t=0.5s, tekst np. "jak się to robi?" + serce 0→1
- Komentarz 2: t=2.0s, tekst "właśnie tego szukałam" + serce
- Komentarz 3: t=3.5s, tekst "obserwuję! 🙌" + serce

### Faza 2 — Profil w iPhone

Ramka iPhone:
- Wymiary ramki: 334×680px
- Pozycja: `x = (1080-334)/2 = 373`, `y = 188`
- Border-radius: 44px (iPhone-style)
- Obramowanie: 12px solid #2A2A2A
- Cień: `0 24px 64px rgba(0,0,0,0.8)`

Screenshot profilu:
- Plik: `assets/images/profile.jpg`
- Skala: `334/982 = 0.34` (jeśli screenshot 982px szeroki)
- Pozycja wewnątrz ramki: `top: 0, left: 0`
- `overflow: hidden` na ramce

Przycisk Obserwuj:
- Pozycja nad profilem: `y ≈ 188 + 255 = 443px` (zależy od screenshota)
- Wymiary: `200×44px`
- Kolor: `#005AB5` (passes WCAG 4.5:1 dla białego)
- Font: Inter SemiBold, 17px, biały
- Border-radius: 8px

**Animacja cursor i klik:**
```javascript
// Cursor pojawia się, przesuwa na przycisk, klika
gsap.set('#cursor', { xPercent:-50, yPercent:-50, x:260, y:380, opacity:0 });
tl.to('#cursor', { opacity:1, duration:0.3 }, 4.8);
tl.to('#cursor', { x:141, y:200, duration:0.6, ease:'power2.inOut' }, 5.1);
// Efekt kliknięcia — scale przycisku
tl.to('#btn-obserwuj', { scale:0.92, duration:0.12, ease:'power2.in' }, 5.8);
tl.to('#btn-obserwuj', { scale:1, duration:0.2, ease:'back.out(2)' }, 5.92);
// Pulse ring
tl.fromTo('#btn-ring', { scale:1, opacity:0.6 }, { scale:1.6, opacity:0, duration:0.4 }, 5.8);
```

---

## Workflow

```
1. Przygotuj screenshot: zrób screenshot profilu Instagram na komputerze
2. Zapisz jako hf/assets/images/profile.jpg
3. Skopiuj pop.mp3 do hf/assets/ (z efektu "przed-i-po" lub podobny)
4. Zbuduj hf/index.html według struktury powyżej
5. npx hyperframes check --json  ← napraw WSZYSTKIE błędy
6. npx hyperframes snapshot --at 0.5,2,4,5.5,7
7. Sprawdź snapshot: badge nie zakrywa twarzy, przycisk czytelny
8. npx hyperframes render --output live-profile-cta.mp4 --quality looks
```

---

## Personalizacja dla kursantki

| Co zmienić | Gdzie | Wskazówka |
|---|---|---|
| Screenshot profilu | `assets/images/profile.jpg` | Nowy screenshot = nowy efekt, reszta bez zmian |
| Treść komentarzy | HTML, `.comment` span | Max 30 znaków każdy |
| Kolor przycisku | CSS `#btn-obserwuj background` | `#005AB5` dla niebieskiego, `#18803A` dla zielonego |
| Czas przejścia fazy 1→2 | `data-start` na sekcji profilu | Domyślnie 4.5s |

---

## Znane pułapki

- Cursor: używaj `gsap.set` z `xPercent:-50, yPercent:-50` zamiast CSS `translate(-50%,-50%)` — HyperFrames nie obsługuje CSS transform na elementach animowanych przez GSAP
- Serduszka pływające: każde musi mieć unikalne id (`#fh1`, `#fh2`, `#fh3`). Nie używaj jednego elementu z `repeat:-1`
- Overlapping opacity tweens na serduszkach: dodaj `overwrite:'auto'` do tween fade-out
- Kontrast: badge LIVE musi mieć `#B91C5B` (nie `#E1306C` — zbyt słaby kontrast)
- Screenshot profilu: musi być pobrany z komputera, nie z telefonu (telefon daje zbyt mały wymiar)
