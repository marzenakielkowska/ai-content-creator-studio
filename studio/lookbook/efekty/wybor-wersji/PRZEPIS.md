> ⚠️ **Sprawdzenie twarzy:** karty wersji stoją nad głową (Y 312–430), nie wchodzą na włosy. Patrz: sekcja **„Twarz — reguła nadrzędna”** w `studio/skills/montaz/SKILL.md`.

# Efekt: Wybór wersji

**Co robi:** nad głową wskakują po kolei trzy karty „wersja 1, 2, 3”, każda z małą miniaturą. Na słowie wyboru jedna
dostaje zielony ptaszek w rogu i lekko rośnie, a dwie pozostałe przygasają do 45%.

**Kiedy:** „pracujesz nad wersją, która Ci odpowiada”, „wybierasz jedną z trzech”, poprawki, warianty, opcje.

**Czego potrzeba:** trzy miniatury z materiałów kursantki (kadry z rolek, projekty).

## Kod

```html
<div id="wv" class="clip" data-start="T" data-duration="D">
  <div class="karta wer" id="wer0" style="left:60px"><img src="assets/m1.jpg" alt="">wersja 1</div>
  <div class="karta wer" id="wer1" style="left:399px"><img src="assets/m2.jpg" alt="">wersja 2</div>
  <div class="karta wer" id="wer2" style="left:738px"><img src="assets/m3.jpg" alt="">wersja 3<div class="ok" id="wer-ok">✓</div></div>
</div>
```
```css
.karta { position: absolute; background: #fff; border-radius: 28px; box-shadow: 0 18px 44px rgba(0,0,0,.3); box-sizing: border-box; font-family: Nunito, sans-serif; font-weight: 800; color: #1C1C1E; }
.wer { top: 312px; width: 282px; height: 118px; display: flex; align-items: center; gap: 14px; padding: 0 14px; font-size: 32px; }
.wer img { width: 54px; height: 96px; object-fit: cover; border-radius: 10px; display: block; }
.wer .ok { position: absolute; right: -10px; top: -10px; width: 52px; height: 52px; border-radius: 50%; background: #34C759; color: #fff; display: flex; align-items: center; justify-content: center; font-size: 30px; }
```
```js
const IR = { immediateRender: false };
[["#wer0", T], ["#wer1", T + 0.4], ["#wer2", T + 0.8]].forEach(([s, t]) => {
  gsap.set(s, { opacity: 0 });
  tl.fromTo(s, { opacity: 0, y: -30, scale: 0.9 }, { opacity: 1, y: 0, scale: 1, duration: 0.2, ease: "back.out(1.8)", ...IR }, t);
});
gsap.set("#wer-ok", { opacity: 0 });
tl.fromTo("#wer-ok", { opacity: 0, scale: 0.3 }, { opacity: 1, scale: 1, duration: 0.2, ease: "back.out(3)", ...IR }, WYBOR);
tl.to(["#wer0", "#wer1"], { opacity: 0.45, duration: 0.2 }, WYBOR);
tl.to("#wer2", { scale: 1.05, duration: 0.2, ease: "back.out(2)" }, WYBOR);
```

## Zasady

- Karty nad głową: Y 312–430, przy przybliżeniu sprawdź, czy dolna krawędź jest co najmniej 40 px nad włosami.
- Napisy na kartach 1–2 słowa. Wybrana wersja to ta, o której mówi kursantka (zwykle ostatnia).
- Dźwięki: soft-click na każdą kartę, sparkle na ptaszek.

## Wspólne zasady

- Kolory, czcionki i płótno ze stylu kursantki (`moj-brand.json`, `moj-styl.json`); kolory podane niżej to tylko przykład.
- Stany początkowe ustawiaj `gsap.set(...)` poza osią czasu, a wejścia `fromTo` z `immediateRender: false`. Inaczej element
  stoi przez klatkę na miejscu końcowym, zanim wjedzie (`rules/pulapki.md`).
- Element wchodzi na słowie, którego dotyczy (czasy z `slowa.json`), i trwa co najmniej do końca zdania.
- Treść tylko prawdziwa: liczby, nazwy i materiały z nagrania albo od kursantki, bez zmyślonych kwot i dowodów.
- Dźwięki z jej wyboru, ciszej niż głos, bez ping.
