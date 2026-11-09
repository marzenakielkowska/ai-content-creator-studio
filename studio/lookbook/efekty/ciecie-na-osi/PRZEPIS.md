> ⚠️ **Sprawdzenie twarzy:** panel stoi nad głową (Y 306 do około 470), przy kadrze z głową niżej. Patrz: sekcja **„Twarz — reguła nadrzędna”** w `studio/skills/montaz/SKILL.md`.

# Efekt: Cięcie na osi czasu

**Co robi:** nad głową ciemny panel osi czasu z trzema ścieżkami (żółta, niebieska, zielona). Głowica jedzie od lewej do
prawej, a czerwone fragmenty na ścieżkach znikają jeden po drugim na słowach, za każdym razem z zielonym ptaszkiem
w nagłówku panelu („✓ pauzy”, „✓ powtórki”, „✓ pomyłki”).

**Kiedy:** „wycina niepotrzebne rzeczy”, „usuwa pauzy i pomyłki”, automatyczny montaż.

**Czego potrzeba:** nic poza nagraniem. Słowa przy ptaszkach z nagrania (najwyżej 3).

## Kod

```html
<div id="tm" class="tlp clip" data-start="T" data-duration="D" style="left:70px;top:306px;width:940px">
  <div class="tlp-g"><span>Montaż</span><span class="ok"><span id="tmo0">✓ pauzy</span><span id="tmo1">✓ powtórki</span><span id="tmo2">✓ pomyłki</span></span></div>
  <div class="tlp-s"><i style="left:0;width:170px;background:#FDE68A"></i><i id="tm-x0" style="left:178px;width:70px;background:#E5484D"></i><i style="left:256px;width:240px;background:#FDE68A"></i><i style="left:504px;width:120px;background:#FDE68A"></i><i id="tm-x1" style="left:632px;width:60px;background:#E5484D"></i><i style="left:700px;width:190px;background:#FDE68A"></i></div>
  <div class="tlp-s"><i style="left:0;width:280px;background:#6C8CFF"></i><i style="left:288px;width:150px;background:#6C8CFF"></i><i id="tm-x2" style="left:446px;width:80px;background:#E5484D"></i><i style="left:534px;width:356px;background:#6C8CFF"></i></div>
  <div class="tlp-s"><i style="left:0;width:888px;background:repeating-linear-gradient(90deg,#34C77B 0 6px,#2aa865 6px 10px)"></i></div>
  <div id="tm-h" class="tlp-h"></div>
</div>
```
```css
.tlp { position: absolute; background: #1E1E24; border-radius: 26px; box-sizing: border-box; padding: 12px 22px 14px; color: #fff; font-family: Nunito, sans-serif; font-weight: 800; box-shadow: 0 22px 56px rgba(0,0,0,.5); border: 2px solid rgba(255,255,255,.1); }
.tlp-g { display: flex; justify-content: space-between; align-items: center; font-size: 27px; color: #c9c9d2; margin-bottom: 4px; white-space: nowrap; }
.tlp-g .ok { display: flex; gap: 14px; } .tlp-g .ok span { color: #7CE29B; font-size: 25px; }
.tlp-s { position: relative; height: 30px; margin-top: 6px; } .tlp-s i { position: absolute; top: 0; height: 100%; border-radius: 7px; display: block; }
.tlp-h { position: absolute; width: 4px; left: 22px; top: 46px; height: 104px; background: #FFD166; border-radius: 2px; box-shadow: 0 0 10px rgba(255,209,102,.7); }
```
```js
const IR = { immediateRender: false };
tl.fromTo("#tm-h", { x: 0 }, { x: 860, duration: D, ease: "none", ...IR }, T);
[["#tm-x0", "#tmo0", SLOWO_1], ["#tm-x2", "#tmo1", SLOWO_2], ["#tm-x1", "#tmo2", SLOWO_3]].forEach(([x, o, t]) => {
  tl.to(x, { scaleX: 0, opacity: 0, duration: 0.18, ease: "power2.in" }, t);
  gsap.set(o, { opacity: 0 });
  tl.fromTo(o, { opacity: 0, x: -14 }, { opacity: 1, x: 0, duration: 0.14, ease: "power3.out", ...IR }, t);
});
```

## Zasady

- Panel nad głową, przy kadrze z głową niżej (`y` około +110 przy kadrze szerokim) albo na płótnie.
- Ptaszki to słowa z nagrania, najwyżej 3, krótkie.
- Dźwięki: click na każdy znikający fragment.

## Wspólne zasady

- Kolory, czcionki i płótno ze stylu kursantki (`moj-brand.json`, `moj-styl.json`); kolory podane niżej to tylko przykład.
- Stany początkowe ustawiaj `gsap.set(...)` poza osią czasu, a wejścia `fromTo` z `immediateRender: false`. Inaczej element
  stoi przez klatkę na miejscu końcowym, zanim wjedzie (`rules/pulapki.md`).
- Element wchodzi na słowie, którego dotyczy (czasy z `slowa.json`), i trwa co najmniej do końca zdania.
- Treść tylko prawdziwa: liczby, nazwy i materiały z nagrania albo od kursantki, bez zmyślonych kwot i dowodów.
- Dźwięki z jej wyboru, ciszej niż głos, bez ping.
