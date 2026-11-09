> ⚠️ **Sprawdzenie twarzy:** telefon stoi obok głowy (X od 650), częściowo za nią przy wycięciu z tła, nie wchodzi na twarz. Patrz: sekcja **„Twarz — reguła nadrzędna”** w `studio/skills/montaz/SKILL.md`.

# Efekt: Szybki pokaz w telefonie

**Co robi:** z prawej wjeżdża telefon przechylony o 5° i staje obok głowy. Jego ekran co 0,23 s pokazuje inną rzecz:
kolejne efekty, zdjęcia albo produkty kursantki.

**Kiedy:** „takie efekty”, „tyle tego jest”, szybki przegląd portfolio albo produktów.

**Czego potrzeba:** 5–8 obrazów z materiałów kursantki (kadry rolek, zdjęcia produktów).

## Kod

```html
<div id="sp" class="clip" data-start="T" data-duration="D">
  <div id="sp-t" class="tel" style="left:650px;top:330px;width:370px;height:720px;transform:rotate(5deg)"><div class="e">
    <img id="sp0" src="assets/p0.jpg" alt=""><img id="sp1" src="assets/p1.jpg" alt=""><!-- … sp6 --></div></div>
</div>
```
```css
.tel { position: absolute; box-sizing: border-box; padding: 12px; border-radius: 52px; background: #0d0d0d; box-shadow: 0 0 0 3px rgba(255,255,255,.92), 0 30px 70px rgba(0,0,0,.55); }
.tel .e { position: relative; width: 100%; height: 100%; border-radius: 42px; overflow: hidden; background: #111; }
.tel img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
```
```js
const IR = { immediateRender: false };
const N = 7, CO = 0.23;
gsap.set("#sp-t", { x: 460, rotation: 14 });
tl.fromTo("#sp-t", { x: 460, rotation: 14 }, { x: 0, rotation: 5, duration: 0.2, ease: "power3.out", ...IR }, T + 0.03);
gsap.set("#sp-t img", { opacity: 0 }); gsap.set("#sp0", { opacity: 1 });
for (let k = 1; T + 0.25 + k * CO < T + D; k++) {
  const t = T + 0.25 + (k - 1) * CO;
  tl.set("#sp" + ((k - 1) % N), { opacity: 0 }, t); tl.set("#sp" + (k % N), { opacity: 1 }, t);
}
```

## Zasady

- Obrazy tylko z materiałów kursantki. Cudze rolki z podpisem @konta autora, a najlepiej wcale.
- Telefon po tej stronie, po której jest więcej tła; przy wycięciu z tła może stać częściowo za głową.
- Najwyżej około 2,5 s: dłużej męczy oczy. Dźwięk: whoosh na wjazd.

## Wspólne zasady

- Kolory, czcionki i płótno ze stylu kursantki (`moj-brand.json`, `moj-styl.json`); kolory podane niżej to tylko przykład.
- Stany początkowe ustawiaj `gsap.set(...)` poza osią czasu, a wejścia `fromTo` z `immediateRender: false`. Inaczej element
  stoi przez klatkę na miejscu końcowym, zanim wjedzie (`rules/pulapki.md`).
- Element wchodzi na słowie, którego dotyczy (czasy z `slowa.json`), i trwa co najmniej do końca zdania.
- Treść tylko prawdziwa: liczby, nazwy i materiały z nagrania albo od kursantki, bez zmyślonych kwot i dowodów.
- Dźwięki z jej wyboru, ciszej niż głos, bez ping.
