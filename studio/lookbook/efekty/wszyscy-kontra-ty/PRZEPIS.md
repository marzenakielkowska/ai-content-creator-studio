> ⚠️ **Sprawdzenie twarzy:** szare kopie tylko po bokach (X do 250 i od 830), wielkie słowo za głową, głowa zasłania najwyżej 30% liter. Patrz: sekcja **„Twarz — reguła nadrzędna”** w `studio/skills/montaz/SKILL.md`.

# Efekt: Wszyscy kontra Ty

**Co robi:** na słowach „takie, jak mają wszyscy” po bokach osoby wskakują cztery jednakowe kafelki, szare i przygaszone.
Na słowie „Twoje” (albo innym słowie, które wyróżnia kursantkę) cięcie na płótno w kolorze marki i za głową staje wielkie,
kolorowe słowo z trójwymiarowym cieniem.

**Kiedy:** kontrast „wszyscy / Ty”: „nie takie jak wszyscy, Twoje”, „nie szablon, tylko Twój styl”.

**Czego potrzeba:** jeden kafelek: kadr z nagrania albo rolki kursantki (w efekcie zszarzeje), bez cudzych materiałów.
Do tego wycięcie z tła na ujęcie ze słowem.

## Kod

```html
<div id="wk" class="clip" data-start="T" data-duration="D1">
  <img id="sz0" class="kaf" src="assets/kafelek.jpg" alt="" style="left:40px;top:450px;transform:rotate(-3deg)">
  <img id="sz1" class="kaf" src="assets/kafelek.jpg" alt="" style="left:46px;top:830px;transform:rotate(2deg)">
  <img id="sz2" class="kaf" src="assets/kafelek.jpg" alt="" style="left:830px;top:450px;transform:rotate(3deg)">
  <img id="sz3" class="kaf" src="assets/kafelek.jpg" alt="" style="left:824px;top:830px;transform:rotate(-2deg)">
</div>
<!-- za osobą (pod wycięciem), od słowa: -->
<div id="wk-s" class="clip" data-start="SLOWO" data-duration="D2" style="position:absolute;inset:0">
  <div style="position:absolute;inset:0;background:#6C4BEF"></div>
  <div id="wk-w" class="slowo" style="top:296px;font-size:236px">TWOJE</div>
</div>
```
```css
.kaf { position: absolute; width: 210px; height: 373px; object-fit: cover; border-radius: 20px; border: 5px solid #fff; box-sizing: border-box; filter: grayscale(1) brightness(.85); box-shadow: 0 14px 30px rgba(0,0,0,.35); }
.slowo { position: absolute; left: 0; right: 0; text-align: center; font-family: Nunito, sans-serif; font-weight: 800; line-height: .95; color: #FFD23F; white-space: nowrap;
  text-shadow: 0 5px 0 #D9A90F, 0 10px 0 #B88B00, 0 15px 0 #8F6B00, 0 34px 50px rgba(0,0,0,.45); }
```
```js
const IR = { immediateRender: false };
[["#sz0", T], ["#sz2", T + 0.25], ["#sz1", T + 0.5], ["#sz3", T + 0.75]].forEach(([s, t]) => {
  gsap.set(s, { opacity: 0 });
  tl.fromTo(s, { opacity: 0, y: -60, scale: 0.9 }, { opacity: 1, y: 0, scale: 1, duration: 0.18, ease: "power3.out", ...IR }, t);
});
tl.fromTo("#wk-w", { scale: 0.7 }, { scale: 1, duration: 0.18, ease: "back.out(2.4)", ...IR }, SLOWO);
```

## Zasady

- Szarość tylko na kopiach. Osoby nigdy nie szarzeje się ani nie przyciemnia.
- Słowo za głową: wysokość i położenie wg `rules/uklad.md` („Słowo za głową”), głowa zasłania najwyżej 30% liter. Krótkie
  słowo, 1–6 liter, czytelne też wtedy, gdy kursantka się poruszy.
- Słowo w kolorze akcentu, płótno z marki. Dźwięki: soft-click na kopie, whoosh na słowo.

## Wspólne zasady

- Kolory, czcionki i płótno ze stylu kursantki (`moj-brand.json`, `moj-styl.json`); kolory podane niżej to tylko przykład.
- Stany początkowe ustawiaj `gsap.set(...)` poza osią czasu, a wejścia `fromTo` z `immediateRender: false`. Inaczej element
  stoi przez klatkę na miejscu końcowym, zanim wjedzie (`rules/pulapki.md`).
- Element wchodzi na słowie, którego dotyczy (czasy z `slowa.json`), i trwa co najmniej do końca zdania.
- Treść tylko prawdziwa: liczby, nazwy i materiały z nagrania albo od kursantki, bez zmyślonych kwot i dowodów.
- Dźwięki z jej wyboru, ciszej niż głos, bez ping.
