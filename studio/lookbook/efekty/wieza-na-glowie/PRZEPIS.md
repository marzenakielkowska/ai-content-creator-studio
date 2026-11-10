> ⚠️ **Sprawdzenie twarzy:** karteczki lądują na czubku głowy i rosną w górę, przewracają się na boki nad głową; nic nie spada na twarz. Patrz: sekcja **„Twarz — reguła nadrzędna”** w `studio/skills/montaz/SKILL.md`.

# Efekt: Wieża na głowie

**Co robi:** na cięciu kadr przybliża się od górnej krawędzi (około 1,25×), więc głowa schodzi niżej i nad nią robi się
miejsce. Na każde słowo z wyliczanki z góry spada biała karteczka z czarną obwódką i tym słowem: odbija się i ląduje na
czubku głowy albo na poprzedniej karteczce, lekko przechylona. Wieża rośnie z każdym słowem. Na końcu wyliczanki
wszystkie karteczki naraz przewracają się i rozlatują na boki z rozmyciem (0,2 s).

**Kiedy:** kursantka wylicza 3–4 rzeczy, które spadają jej (albo widzowi) na głowę: obowiązki, pytania, zadania,
decyzje. Na przykład „pytania, marka, czcionki, kolory” albo „faktury, maile, telefony”.

**Czego potrzeba:** nic poza nagraniem i `glowa.json` (czubek głowy w tym ujęciu).

## Słowa kursantki

- Na karteczkach są słowa z jej wyliczanki, każde w chwili, gdy je mówi: 1–2 słowa, najwyżej około 12 znaków. Słowa
  z filmu podglądowego to tylko przykład.
- Karteczka może mieć krótszą formę tego, co kursantka mówi („pytania” zamiast „odpowiedzieć na kilka pytań”), ale to musi
  być jej słowo.
- W planie montażu pokaż kursantce słowa na karteczkach.

## Kod

```html
<!-- każda karteczka w wierszu na środku kadru; GL = czubek głowy po przybliżeniu (tu 500), kolejne co 66 px w górę -->
<div id="wz" class="clip" data-start="T" data-duration="D" style="position:absolute;inset:0">
  <div class="wz-w" style="top:434px"><div class="karta wz" id="wz0">pytania</div></div>    <!-- GL − 66 -->
  <div class="wz-w" style="top:368px"><div class="karta wz" id="wz1">marka</div></div>      <!-- GL − 132 -->
  <div class="wz-w" style="top:302px"><div class="karta wz" id="wz2">czcionki</div></div>   <!-- GL − 198 -->
  <div class="wz-w" style="top:236px"><div class="karta wz" id="wz3">kolory</div></div>     <!-- GL − 264 -->
</div>
```
```css
.karta { position: absolute; background: #fff; border-radius: 28px; box-shadow: 0 18px 44px rgba(0,0,0,.32); box-sizing: border-box; font-family: Nunito, sans-serif; font-weight: 800; color: #1C1C1E; }
.wz-w { position: absolute; left: 0; right: 0; height: 70px; display: flex; justify-content: center; }
.wz { position: relative; height: 70px; padding: 0 28px; border-radius: 18px; font-size: 42px; display: flex; align-items: center; white-space: nowrap; border: 3px solid #1C1C1E; box-shadow: 0 10px 22px rgba(0,0,0,.35); }
```
```js
// Przybliżenie od górnej krawędzi: kontener nagrania (i wycięcia, jeśli jest) ma transform-origin: 540px 0.
// Czubek głowy schodzi z glowa_gora na GL = glowa_gora × 1,25 (tu 400 → 500); powolny najazd trzyma czubek w miejscu.
tl.fromTo("#wrap", { scale: 1.25, y: 0 }, { scale: 1.269, y: -8, duration: D, ease: "none", immediateRender: false }, T);
// KARTKI: [czas słowa, przesunięcie w bok, przechył]; KONIEC = przewrócenie (co najmniej 0,2 s po ostatnim słowie)
const GL = 500, KARTKI = [[T1, 0, -3], [T2, -16, 4], [T3, 12, -2], [T4, -8, 5]];
KARTKI.forEach(([t, dx, r], i) => {
  const s = "#wz" + i, y = GL - 66 * (i + 1), strona = i % 2 ? -1 : 1, ost = i === KARTKI.length - 1;
  const od = t - (ost ? 0.14 : 0.12);
  gsap.set(s, { x: dx, y: -(y + 300), rotation: r * 3, opacity: 0, filter: "blur(0px)" });
  tl.set(s, { opacity: 1 }, od);
  tl.to(s, { y: 0, rotation: r, duration: ost ? 0.3 : 0.42, ease: "bounce.out" }, od);
  tl.to(s, { x: dx + strona * (560 + i * 40), y: 20 + i * 10, rotation: strona * (70 + i * 25), opacity: 0,
    filter: "blur(6px)", duration: 0.18, ease: "power2.in" }, KONIEC + i * 0.012);
});
```

## Zasady

- Przybliżenie od górnej krawędzi (skala około 1,25) na cięciu przed pierwszym słowem; bez niego nad głową nie ma miejsca.
- Karteczka zaczyna spadać 0,12 s przed słowem i odbija się 0,42 s; ostatnia 0,3 s, żeby wylądowała przed przewróceniem.
- Najwyżej 4 karteczki, najwyższa od Y 220 (strefa bezpieczna). Gdy czubek głowy jest niżej, zmieści się piąta.
- Przewrócenie na końcu wyliczanki albo na słowie, które ją zamyka („i wszystko…”), co najmniej 0,2 s po ostatnim słowie.
  Karteczki lecą na boki nad głową, nigdy w dół przez twarz.
- Dźwięki: pop na każdą karteczkę, short-whoosh na przewrócenie.

## Wspólne zasady

- Kolory, czcionki i płótno ze stylu kursantki (`moj-brand.json`, `moj-styl.json`); kolory podane niżej to tylko przykład.
- Stany początkowe ustawiaj `gsap.set(...)` poza osią czasu, a wejścia `fromTo` z `immediateRender: false`. Inaczej element
  stoi przez klatkę na miejscu końcowym, zanim wjedzie (`rules/pulapki.md`).
- Element wchodzi na słowie, którego dotyczy (czasy z `slowa.json`), i trwa co najmniej do końca zdania.
- Treść tylko prawdziwa: liczby, nazwy i materiały z nagrania albo od kursantki, bez zmyślonych kwot i dowodów.
- Dźwięki z jej wyboru, ciszej niż głos, bez ping.
