> ⚠️ **Sprawdzenie twarzy:** stoper i dopisek stoją nad głową albo obok niej, od Y 300 do `glowa_gora − 40`. Patrz: sekcja **„Twarz — reguła nadrzędna”** w `studio/skills/montaz/SKILL.md`.

# Efekt: Stoper

**Co robi:** nad głową wskakuje biała tarcza stopera z przyciskiem u góry. Czerwona wskazówka kręci się szybko (trzy
obroty w około 1,3 s), a obok wskakuje odręczne pytanie, np. „ile?”.

**Kiedy:** „wyobraź sobie, ile by to zajęło”, „ile czasu tracisz”, termin, szybkość.

**Czego potrzeba:** nic poza nagraniem.

## Kod

```html
<div id="st" class="clip" data-start="T" data-duration="D">
  <svg id="sto" style="position:absolute;left:440px;top:304px;width:164px;height:164px" viewBox="0 0 100 100">
    <circle cx="50" cy="54" r="40" fill="#fff" stroke="#15315E" stroke-width="6"/>
    <rect x="43" y="4" width="14" height="10" rx="3" fill="#15315E"/>
    <g id="stoW"><path d="M50 54 L50 24" stroke="#E5484D" stroke-width="6" stroke-linecap="round"/></g>
  </svg>
  <div class="hw" id="stoH" style="left:650px;top:330px;font-size:96px;transform:rotate(-4deg)">ile?</div>
</div>
```
```css
@font-face { font-family: "Caveat"; src: url("assets/fonts/caveat-600.woff2") format("woff2"); font-weight: 600; font-display: block; }
.hw { position: absolute; font-family: Caveat, cursive; font-weight: 600; line-height: .95; white-space: nowrap; color: #fff; text-shadow: 0 3px 10px rgba(0,0,0,.6); }
```
```js
const IR = { immediateRender: false };
gsap.set(["#sto", "#stoH"], { opacity: 0 });
tl.fromTo("#sto", { opacity: 0, scale: 0.6 }, { opacity: 1, scale: 1, duration: 0.2, ease: "back.out(2)", ...IR }, T + 0.1);
gsap.set("#stoW", { svgOrigin: "50 54" });
tl.fromTo("#stoW", { rotation: 0 }, { rotation: 1080, svgOrigin: "50 54", duration: 1.3, ease: "none", ...IR }, T + 0.1);
tl.fromTo("#stoH", { opacity: 0, scale: 0.7 }, { opacity: 1, scale: 1, duration: 0.18, ease: "back.out(2)", ...IR }, T + 0.5);
```

## Zasady

- Wskazówka obraca się wokół środka tarczy (`svgOrigin`), nie wokół rogu obrazka.
- Dopisek odręczną czcionką kursantki, jedno słowo ze znakiem zapytania, z cieniem albo na płótnie.
- Dźwięk: key-press albo soft-click na wejście, bez tykania przez cały czas.

## Wspólne zasady

- Kolory, czcionki i płótno ze stylu kursantki (`moj-brand.json`, `moj-styl.json`); kolory podane niżej to tylko przykład.
- Stany początkowe ustawiaj `gsap.set(...)` poza osią czasu, a wejścia `fromTo` z `immediateRender: false`. Inaczej element
  stoi przez klatkę na miejscu końcowym, zanim wjedzie (`rules/pulapki.md`).
- Element wchodzi na słowie, którego dotyczy (czasy z `slowa.json`), i trwa co najmniej do końca zdania.
- Treść tylko prawdziwa: liczby, nazwy i materiały z nagrania albo od kursantki, bez zmyślonych kwot i dowodów.
- Dźwięki z jej wyboru, ciszej niż głos, bez ping.
