> ⚠️ **Sprawdzenie twarzy:** żaden element tego efektu nie może nachodzić na strefę twarzy (Y:250–1400px × X:200–880px przy 1080×1920), chyba że przepis mówi inaczej. Patrz: sekcja **"Twarz — reguła nadrzędna"** w `studio/skills/montaz/SKILL.md`.

# Efekt: Stały nagłówek

**Co robi:** hasło z hooka (np. „+22 wideo efekty z Claude”) pojawia się ponownie nad głową w każdym fragmencie rolki, w którym górna część kadru jest wolna. Wskakuje (skala 0,7 → 1, 0,2 s, `back.out(2)`) i znika do góry (0,14 s) tuż przed efektem, który zajmuje górę.

**Wygląd:** czcionka akcentu z marki (domyślnie Montserrat 900), 66 px, dwie linijki, biały tekst, liczba lub słowo-klucz w kolorze akcentu, cień `0 3px 12px rgba(0,0,0,.7), 0 1px 3px rgba(0,0,0,.85)`. Górna krawędź Y 232 px (tuż pod strefą bezpieczną). Dolna krawędź musi być co najmniej 40 px nad `glowa_gora` z `glowa.json` — jeśli głowa jest wyżej, zmniejsz czcionkę.

**Kiedy pokazać:** wypisz z planu montażu przedziały, w których żaden efekt nie zajmuje strefy nad głową (karty pod brodą, zoomy i napisy na dole nie przeszkadzają). Tylko w nich pokazuj nagłówek.

## Kod (kompozycja nakładki)

```html
<div class="war" id="war-naglowek"><div id="naglowek"><b>+22</b> wideo efekty<br>z Claude</div></div>
```
```css
.war { position: absolute; inset: 0; opacity: 0; }
#naglowek { position: absolute; left: 40px; right: 40px; top: 232px; text-align: center; font-weight: 900; font-size: 66px;
  line-height: 1; color: #fff; letter-spacing: -2px; white-space: nowrap;
  text-shadow: 0 3px 12px rgba(0,0,0,.7), 0 1px 3px rgba(0,0,0,.85); }
#naglowek b { color: var(--akcent, #FFD166); }
```
```js
// przedziały [start, koniec] w sekundach, w których góra kadru jest wolna
[[6.8, 8.5], [11.1, 18.1], [49.1, 59.8]].forEach(([a, b], i, all) => {
  tl.set("#war-naglowek", { opacity: 1 }, a);
  tl.fromTo("#naglowek", { scale: 0.7, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.2, ease: "back.out(2)", immediateRender: false }, a);
  if (i < all.length - 1) {
    tl.to("#naglowek", { y: -20, opacity: 0, duration: 0.14, ease: "power2.in" }, b - 0.15);
    tl.set("#naglowek", { y: 0 }, b); tl.set("#war-naglowek", { opacity: 0 }, b);
  }
});
```
Ostatni przedział może trwać do końca rolki. Dźwięk nie jest potrzebny — to powracający element, nie nowy efekt.
