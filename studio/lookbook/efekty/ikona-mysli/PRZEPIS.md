> ⚠️ **Sprawdzenie twarzy:** ikona stoi obok głowy (X co najmniej `glowa_x_do + 40`, najwyżej 1020) albo nad nią, nie wchodzi na włosy. Patrz: sekcja **„Twarz — reguła nadrzędna”** w `studio/skills/montaz/SKILL.md`.

# Efekt: Ikona, która myśli

**Co robi:** obok głowy wskakuje ikona programu, wokół niej kręci się kółko ładowania w kolorze akcentu (dwa obroty
na sekundę), a pod spodem pojawia się odręczne „chwilę…”.

**Kiedy:** „to chwilę zajmie”, „AI myśli”, generowanie, czekanie na wynik.

**Czego potrzeba:** ikona programu od kursantki. Gdy jej nie ma, ogólna ikona (iskra, trybik), nigdy zmyślone logo.

## Kod

```html
<div id="im" class="clip" data-start="T" data-duration="D">
  <div class="ik" id="imI" style="left:840px;top:470px;width:150px;height:150px"><img src="assets/ikona.png" alt=""></div>
  <svg id="imR" style="position:absolute;left:816px;top:446px;width:198px;height:198px" viewBox="0 0 100 100"><circle cx="50" cy="50" r="45" fill="none" stroke="#FFD23F" stroke-width="5" stroke-linecap="round" stroke-dasharray="70 220"/></svg>
  <div class="hw" id="imH" style="left:800px;top:660px;font-size:74px;transform:rotate(-4deg)">chwilę...</div>
</div>
```
```css
.ik { position: absolute; border-radius: 24%; overflow: hidden; box-shadow: 0 10px 26px rgba(0,0,0,.35); background: #fff; } .ik img { width: 100%; height: 100%; object-fit: cover; }
.hw { position: absolute; font-family: Caveat, cursive; font-weight: 600; line-height: .95; white-space: nowrap; color: #fff; text-shadow: 0 3px 10px rgba(0,0,0,.6); }
```
```js
const IR = { immediateRender: false };
gsap.set(["#imI", "#imH"], { opacity: 0 });
tl.fromTo("#imI", { opacity: 0, scale: 0.5 }, { opacity: 1, scale: 1, duration: 0.22, ease: "back.out(2.2)", ...IR }, T + 0.05);
tl.fromTo("#imR", { rotation: 0 }, { rotation: 360 * 2 * D, duration: D, ease: "none", ...IR }, T);
tl.fromTo("#imH", { opacity: 0, scale: 0.7 }, { opacity: 1, scale: 1, duration: 0.18, ease: "back.out(2)", ...IR }, T + 0.35);
```

## Zasady

- Ikona po tej stronie głowy, po której jest więcej tła. Przy ramieniu sprawdź, czy dopisek nie wchodzi na sweter tak,
  że ginie: wtedy dopisek z ciemnym obrysem.
- Najwyżej 2 s, potem efekt znika albo zamienia się w wynik (np. dymek z odpowiedzią).
- Dźwięk: soft-click na wejście.

## Wspólne zasady

- Kolory, czcionki i płótno ze stylu kursantki (`moj-brand.json`, `moj-styl.json`); kolory podane niżej to tylko przykład.
- Stany początkowe ustawiaj `gsap.set(...)` poza osią czasu, a wejścia `fromTo` z `immediateRender: false`. Inaczej element
  stoi przez klatkę na miejscu końcowym, zanim wjedzie (`rules/pulapki.md`).
- Element wchodzi na słowie, którego dotyczy (czasy z `slowa.json`), i trwa co najmniej do końca zdania.
- Treść tylko prawdziwa: liczby, nazwy i materiały z nagrania albo od kursantki, bez zmyślonych kwot i dowodów.
- Dźwięki z jej wyboru, ciszej niż głos, bez ping.
