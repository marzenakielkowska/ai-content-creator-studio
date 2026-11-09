> ⚠️ **Sprawdzenie twarzy:** karta nad głową (Y 316–462), rolki po bokach na wysokości ramion, linie nie przechodzą przez twarz. Patrz: sekcja **„Twarz — reguła nadrzędna”** w `studio/skills/montaz/SKILL.md`.

# Efekt: Karta stylu

**Co robi:** nad głową wskakuje biała karta „Twój styl” z kolorami marki (kółka) i próbkami jej czcionek („Aa”). Na słowie
„stylu” po bokach wskakują dwie rolki, a białe łuki rysują się od karty do każdej z nich.

**Kiedy:** „kolejne rolki nie będą oderwane od Twojego stylu”, spójna marka, identyfikacja wizualna.

**Czego potrzeba:** kolory i czcionki z `moj-brand.json` kursantki, dwie miniatury jej rolek.

## Kod

```html
<div id="ks" class="clip" data-start="T" data-duration="D">
  <div class="karta" id="ks-k"><div class="t">Twój styl</div>
    <div class="w"><i style="background:KOLOR_1"></i><i style="background:KOLOR_2"></i><i style="background:KOLOR_3"></i>
      <em style="font-family:CZCIONKA_GLOWNA">Aa</em><em style="font-family:CZCIONKA_AKCENTU">Aa</em><em style="font-family:Caveat">Aa</em></div></div>
  <img class="dok" id="dk0" src="assets/r1.jpg" alt="" style="left:50px;top:520px">
  <img class="dok" id="dk1" src="assets/r2.jpg" alt="" style="left:860px;top:520px">
  <svg style="position:absolute;inset:0;width:1080px;height:1920px;overflow:visible">
    <path id="dk0s" d="M300 460 C 230 480 170 480 135 520" fill="none" stroke="#fff" stroke-width="6" stroke-linecap="round" pathLength="1" stroke-dasharray="1" stroke-dashoffset="1"/>
    <path id="dk1s" d="M780 460 C 850 480 910 480 945 520" fill="none" stroke="#fff" stroke-width="6" stroke-linecap="round" pathLength="1" stroke-dasharray="1" stroke-dashoffset="1"/>
  </svg>
</div>
```
```css
.karta { position: absolute; background: #fff; border-radius: 28px; box-shadow: 0 18px 44px rgba(0,0,0,.3); box-sizing: border-box; font-family: Nunito, sans-serif; font-weight: 800; color: #1C1C1E; }
#ks-k { left: 240px; top: 316px; width: 600px; height: 146px; padding: 12px 26px; } #ks-k .t { font-size: 34px; }
#ks-k .w { display: flex; align-items: center; gap: 12px; margin-top: 8px; } #ks-k .w i { display: block; width: 44px; height: 44px; border-radius: 50%; }
#ks-k .w em { font-style: normal; font-size: 44px; line-height: 1; margin-left: 6px; }
.dok { position: absolute; width: 170px; height: 302px; object-fit: cover; border-radius: 18px; border: 5px solid #fff; box-sizing: border-box; box-shadow: 0 14px 30px rgba(0,0,0,.45); }
```
```js
const IR = { immediateRender: false };
gsap.set(["#ks-k", "#dk0", "#dk1", "#dk0s", "#dk1s"], { opacity: 0 });
tl.fromTo("#ks-k", { opacity: 0, y: -40, scale: 0.95 }, { opacity: 1, y: 0, scale: 1, duration: 0.2, ease: "power3.out", ...IR }, T);
[["#dk0", "#dk0s", STYL], ["#dk1", "#dk1s", STYL + 0.2]].forEach(([r, s, t]) => {
  tl.fromTo(r, { opacity: 0, y: 40, scale: 0.8 }, { opacity: 1, y: 0, scale: 1, duration: 0.2, ease: "back.out(1.8)", ...IR }, t);
  tl.set(s, { opacity: 1 }, t + 0.1); tl.to(s, { strokeDashoffset: 0, duration: 0.18, ease: "power2.out" }, t + 0.1);
});
```

## Zasady

- Kolory i czcionki z marki kursantki, nigdy stałe z przykładu. Bez marki: kolory z jej Lookbooka albo ten efekt pomiń.
- Linie rysują się od dolnych rogów karty do górnych rogów rolek i nie przecinają głowy.
- Dźwięki: soft-click na kartę i każdą rolkę.

## Wspólne zasady

- Kolory, czcionki i płótno ze stylu kursantki (`moj-brand.json`, `moj-styl.json`); kolory podane niżej to tylko przykład.
- Stany początkowe ustawiaj `gsap.set(...)` poza osią czasu, a wejścia `fromTo` z `immediateRender: false`. Inaczej element
  stoi przez klatkę na miejscu końcowym, zanim wjedzie (`rules/pulapki.md`).
- Element wchodzi na słowie, którego dotyczy (czasy z `slowa.json`), i trwa co najmniej do końca zdania.
- Treść tylko prawdziwa: liczby, nazwy i materiały z nagrania albo od kursantki, bez zmyślonych kwot i dowodów.
- Dźwięki z jej wyboru, ciszej niż głos, bez ping.
