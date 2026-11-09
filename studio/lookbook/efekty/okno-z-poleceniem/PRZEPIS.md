> ⚠️ **Sprawdzenie twarzy:** okno stoi pod brodą, kadry obok głowy, nic nie wchodzi na twarz. Patrz: sekcja **„Twarz — reguła nadrzędna”** w `studio/skills/montaz/SKILL.md`.

# Efekt: Okno z poleceniem

**Co robi:** hak w dwie sekundy pokazuje, co robi program z AI. Na pełnym płótnie, za osobą, stoi hasło rolki. Pod brodą jest ciemne okno programu z ikoną. Kadr z lewej wpada do okna jako plik, polecenie wpisuje się samo, rośnie pasek z procentami, wskakują ptaszki, a z prawej wyskakuje gotowa rolka z zielonym ptaszkiem i odręcznym dopiskiem.

**Kiedy:** pierwsze sekundy rolki o programie, automatyzacji albo AI, gdy pada „X robi to za Ciebie”. Widoczny od klatki 0, w całości do pierwszego cięcia. Także w środku rolki, gdy mówi, że program coś za nią robi (wtedy mniejsze okno, zasady niżej).

**Czego potrzeba:** wycięcia z tła na czas haka (`wytnij-tlo`, potem `czysc-tlo <projekt> hak 0 <koniec>`), płótna w kolorze marki, dwóch kadrów z nagrania (surowy i wyglądający na gotowy, bez liczb) i ikony programu. Treść polecenia i ptaszków bierz z tematu rolki, krótko.

## Kod

```html
<img id="h-kl" class="reel" src="assets/kadr-surowy.jpg" alt="" style="left:30px;top:640px;width:236px;height:420px;transform:rotate(-6deg)">
<div id="term">
  <div class="bar"><i style="background:#FF5F57"></i><i style="background:#FEBC2E"></i><i style="background:#28C840"></i><img id="t-ic" src="assets/ikona.png" alt=""><span>Claude</span></div>
  <div class="cial mono">
    <div class="tw"><b>&gt;</b><span id="t-chip"><img src="assets/kadr-surowy.jpg" alt="">moje-wideo.mov</span></div>
    <div class="tw"><b>&gt;</b><span id="t-pol"><!-- każda litera w <span>, spacja jako &nbsp; --></span><i id="t-kur"></i></div>
    <div class="tw"><span id="t-o0" class="t-ok">✓ pauzy</span><span id="t-o1" class="t-ok">✓ napisy</span><span id="t-o2" class="t-ok">✓ efekty</span></div>
    <div id="t-pas"><div id="t-pp"><div id="t-p"></div></div><span id="t-pc"><span id="t-n">0</span>%</span></div>
  </div>
</div>
<img id="h-wyn" class="reel" src="assets/kadr-gotowy.jpg" alt="" style="left:784px;top:620px;width:236px;height:420px;transform:rotate(5deg)">
<div id="h-wyn-ok"><svg viewBox="0 0 24 24" width="50" height="50"><path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="#fff" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/></svg></div>
<div id="h-wyn-n" class="hw" style="left:860px;top:476px;font-size:56px;line-height:.95;color:#FFD23F;transform:rotate(-3deg)">gotowa<br>rolka!</div>
```
```css
.reel { position: absolute; object-fit: cover; border-radius: 22px; border: 6px solid #fff; box-sizing: border-box; box-shadow: 0 14px 30px rgba(0,0,0,.32); }
.mono { font-family: "JetBrains Mono", monospace; font-weight: 500; }
#term { position: absolute; left: 60px; top: 1176px; width: 840px; height: 292px; border-radius: 26px; background: #16151B; box-shadow: 0 26px 60px rgba(0,0,0,.55); border: 2px solid rgba(255,255,255,.14); overflow: hidden; color: #F2F1EE; }
#term .bar { height: 50px; display: flex; align-items: center; gap: 10px; padding: 0 20px; background: #24232B; font-family: Nunito, sans-serif; font-weight: 800; font-size: 26px; color: #d8d6d0; }
#term .bar i { width: 15px; height: 15px; border-radius: 50%; display: block; }
#term .bar img { width: 34px; height: 34px; border-radius: 8px; margin-left: 12px; }
#term .cial { padding: 12px 24px 0; font-size: 33px; line-height: 1.2; }
.tw { position: relative; display: flex; align-items: center; gap: 14px; height: 52px; white-space: nowrap; }
.tw b { color: #D97757; font-weight: 500; }
#t-chip { display: flex; align-items: center; gap: 10px; background: #2F2E38; border-radius: 10px; padding: 2px 14px 2px 4px; font-size: 28px; }
#t-chip img { width: 36px; height: 44px; object-fit: cover; border-radius: 6px; display: block; }
#t-pol span { opacity: 0; }
#t-kur { position: absolute; left: 58px; width: 16px; height: 36px; background: #D97757; display: block; }
.t-ok { color: #7CE29B; font-size: 30px; margin-right: 26px; }
#t-pas { display: flex; align-items: center; gap: 14px; margin-top: 2px; }
#t-pp { flex: 1; height: 16px; background: #34333D; border-radius: 99px; overflow: hidden; }
#t-p { height: 100%; width: 100%; background: #FFD23F; transform-origin: 0 50%; }
#t-pc { font-size: 28px; color: #FFD23F; width: 96px; text-align: right; }
#h-wyn-ok { position: absolute; left: 950px; top: 596px; width: 76px; height: 76px; border-radius: 50%; background: #34C759; display: flex; align-items: center; justify-content: center; box-shadow: 0 8px 20px rgba(0,0,0,.3); }
```
```js
// czasy dla haka 2,1 s; przy innej długości rozłóż je tak, by rolka wyskoczyła na ostatnim słowie haka
const IR = { immediateRender: false };
gsap.set(["#t-chip", "#t-o0", "#t-o1", "#t-o2", "#h-wyn", "#h-wyn-ok", "#h-wyn-n"], { opacity: 0 });
gsap.set("#t-p", { scaleX: 0 });
tl.to("#h-kl", { x: 150, y: 590, scale: 0.14, rotation: 0, duration: 0.3, ease: "power2.in" }, 0.1);
tl.set("#h-kl", { opacity: 0 }, 0.4);
tl.fromTo("#t-chip", { opacity: 0, scale: 0.5 }, { opacity: 1, scale: 1, duration: 0.14, ease: "back.out(3)", ...IR }, 0.38);
const litery = document.querySelectorAll("#t-pol span");
litery.forEach((el, i) => tl.fromTo(el, { opacity: 0 }, { opacity: 1, duration: 0.01, ...IR }, 0.46 + i * 0.0155));
tl.fromTo("#t-kur", { x: 0 }, { x: litery.length * 19.8, duration: litery.length * 0.0155, ease: "none", ...IR }, 0.46);
tl.set("#t-kur", { opacity: 0 }, 0.92);
["#t-o0", "#t-o1", "#t-o2"].forEach((s, i) => tl.fromTo(s, { opacity: 0, x: -14 }, { opacity: 1, x: 0, duration: 0.1, ...IR }, 1.1 + i * 0.15));
tl.fromTo("#t-p", { scaleX: 0 }, { scaleX: 1, duration: 0.6, ease: "none", ...IR }, 0.95);
const pc = { v: 0 };
tl.fromTo(pc, { v: 0 }, { v: 100, duration: 0.6, ease: "none", ...IR, onUpdate: () => { document.getElementById("t-n").textContent = Math.round(pc.v); } }, 0.95);
tl.fromTo("#t-ic", { rotation: 0 }, { rotation: 360, duration: 0.6, ease: "none", ...IR }, 0.95);
tl.fromTo("#h-wyn", { opacity: 0, y: 460, scale: 0.25 }, { opacity: 1, y: 0, scale: 1, duration: 0.26, ease: "back.out(1.6)", ...IR }, 1.56);
tl.fromTo("#h-wyn-ok", { opacity: 0, scale: 0.3 }, { opacity: 1, scale: 1, duration: 0.18, ease: "back.out(3)", ...IR }, 1.76);
tl.fromTo("#h-wyn-n", { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.16, ease: "power3.out", ...IR }, 1.72);
```

## Zasady

- Górna krawędź okna co najmniej `broda + 40`, dolna najwyżej Y 1470, prawa najwyżej X 900 (kolumna ikon). Polecenie ma najwyżej około 35 znaków. Kadry: X do 266 i od 784, nie wchodzą na głowę.
- Hasło za osobą: dwie linie, Y 225 do około 590, głowa zasłania najwyżej 25% liter.
- W haku dolne napisy nie lecą, tekst jest w oknie. W środku rolki napisy zostają w swoim pasie: okno ma wtedy 150–170 px wysokości (pasek i dwie linie), od `broda + 40` do około Y 1320.
- Czcionka okna: JetBrains Mono 500 (400 i 700 gubią polskie litery).
- Dźwięki: whoosh na klatce 0, pop na wpadnięciu kadru, pisanie, key-press na „enter”, soft-click na ptaszkach, sparkle na gotowej rolce. Bez ping.
