> ⚠️ **Sprawdzenie twarzy:** żaden element tego efektu nie może nachodzić na strefę twarzy (Y:250–1400px × X:200–880px przy 1080×1920), posty są ZA osobą (sylwetka na wierzchu), więc mogą przechodzić za głową. Patrz: sekcja **"Twarz — reguła nadrzędna"** w `studio/skills/montaz/SKILL.md`.

# Efekt: Ściana z postami w ruchu

**Co robi:** tło za kursantką zastępuje ściana jej postów (okładki rolek 9:16), w 4–5 rzędach. Każdy rząd przez cały efekt jedzie powoli w przeciwną stronę niż sąsiedni (±130 px, liniowo). Na wejściu ściana lekko się zbliża (skala 1,08 → 1, 0,3 s). Sylwetka kursantki (wycięta z tła) jest na wierzchu. Ściana jest lekko przyciemniona (`rgba(0,0,0,.28)`), żeby osoba się odcinała.

**Materiał:** prawdziwe posty kursantki — wytnij okładki ze zrzutu siatki profilu albo użyj okładek jej rolek. Nie używaj cudzych zdjęć. Przy 4–8 obrazach przesuń kolejność w każdym rzędzie, żeby powtórki nie stały jeden pod drugim.

**Kadr:** potrzebna sylwetka (`wytnij-tlo`) w tym samym przedziale czasu. Jeśli w tym czasie wideo ma zoom (np. podwójne kadrowanie), daj ten sam zoom oknu sylwetki, inaczej sylwetka się rozjedzie z nagraniem.

## Kod (kompozycja pod sylwetką, nad nagraniem)

```html
<div class="war" id="war-sciana">
  <div class="rzad" id="rzad-1" style="top:-40px"> <img src="assets/post1.jpg"> … 6 obrazów … </div>
  <div class="rzad" id="rzad-2" style="top:418px"> … </div>
  <div class="rzad" id="rzad-3" style="top:876px"> … </div>
  <div class="rzad" id="rzad-4" style="top:1334px"> … </div>
  <div class="rzad" id="rzad-5" style="top:1792px"> … </div>
  <div id="sciana-cien"></div>
</div>
```
```css
.rzad { position: absolute; left: -260px; display: flex; gap: 14px; }
.rzad img { width: 250px; height: 444px; border-radius: 18px; object-fit: cover; display: block; }
#sciana-cien { position: absolute; inset: 0; background: rgba(0,0,0,.28); }
```
```js
tl.set("#war-sciana", { opacity: 1 }, START);
document.querySelectorAll("#war-sciana .rzad").forEach((rz, i) => {
  const kier = i % 2 ? -1 : 1;
  tl.fromTo(rz, { x: -130 * kier }, { x: 130 * kier, duration: KONIEC - START, ease: "none", immediateRender: false }, START);
});
tl.fromTo("#war-sciana", { scale: 1.08 }, { scale: 1, duration: 0.3, ease: "power3.out", immediateRender: false }, START);
tl.set("#war-sciana", { opacity: 0 }, KONIEC);
```
Dźwięk na wejściu: whoosh.
