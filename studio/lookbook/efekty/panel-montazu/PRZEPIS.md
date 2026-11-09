> ⚠️ **Sprawdzenie twarzy:** panel stoi nad głową, w całości powyżej `glowa_gora`. Patrz: sekcja **„Twarz — reguła nadrzędna”** w `studio/skills/montaz/SKILL.md`.

# Efekt: Panel montażu

**Co robi:** zamiast listy z ptaszkami pokazuje, że rolka właśnie się składa. Na pełnym płótnie, za osobą, stoi niski panel: tytuł „Claude montuje · Twoja-rolka.mp4”, procenty i ścieżka. Na trzy kluczowe słowa wskakują trzy klipy z prawdziwymi kadrami, a na każdym etykieta z ptaszkiem. Głowica jedzie, procenty rosną do 100.

**Kiedy:** wyliczanka trzech korzyści albo kroków przy końcu rolki („przyciągną, zatrzymają, sprzedadzą”), gdy pełna lista byłaby za duża.

**Czego potrzeba:** płótna w kolorze marki z wycięciem z tła (`czysc-tlo`), trzech kadrów z nagrania, trzech słów z transkrypcji.

## Kod

```html
<div id="mt" class="tlp" style="left:50px;top:312px;width:980px">
  <div class="tlp-g"><span>Claude montuje · Twoja-rolka.mp4</span><b><span id="mt-n">0</span>%</b></div>
  <div style="position:relative;height:104px;margin-top:6px">
    <div id="mk0" class="m-kl" style="left:0;width:300px;background:#FDE68A"><img src="assets/kadr-a.jpg" alt=""><span><svg viewBox="0 0 24 24" width="30" height="30" style="flex:none"><circle cx="12" cy="12" r="11" fill="#34C759"/><path d="M6 12.5l4 4L18 8" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>Przyciąga</span></div>
    <!-- #mk1 left:308px;width:310px;background:#6C8CFF, #mk2 left:626px;width:300px;background:#34C77B -->
  </div>
  <div id="mt-h" class="tlp-h" style="left:24px;top:56px;height:112px"></div>
</div>
```
```css
/* .tlp, .tlp-g, .tlp-h jak w efekcie Timeline z palcem */
.m-kl { position: absolute; top: 0; height: 104px; border-radius: 12px; overflow: hidden; border: 3px solid #fff; box-sizing: border-box; }
.m-kl img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; opacity: .55; }
.m-kl span { position: absolute; left: 10px; bottom: 8px; display: flex; align-items: center; gap: 8px; font-size: 30px; color: #fff; text-shadow: 0 2px 8px rgba(0,0,0,.8); white-space: nowrap; }
```
```js
// T, D: początek i długość ujęcia; t1, t2, t3: czasy słów ze slowa.json
const IR = { immediateRender: false };
gsap.set(["#mk0", "#mk1", "#mk2"], { opacity: 0 });
tl.fromTo("#mt", { opacity: 0, y: -60, scale: 0.96 }, { opacity: 1, y: 0, scale: 1, duration: 0.28, ease: "power3.out", ...IR }, T + 0.03);
[t1, t2, t3].forEach((t, i) => tl.fromTo("#mk" + i, { opacity: 0, y: -70, scale: 1.1 }, { opacity: 1, y: 0, scale: 1, duration: 0.28, ease: "back.out(1.8)", ...IR }, t));
tl.fromTo("#mt-h", { x: 0 }, { x: 926, duration: D - 0.1, ease: "none", ...IR }, T + 0.1);
const pr = { v: 0 };
tl.fromTo(pr, { v: 0 }, { v: 100, duration: D - 0.1, ease: "none", ...IR, onUpdate: () => { document.getElementById("mt-n").textContent = Math.round(pr.v); } }, T + 0.1);
```

## Zasady

- Panel: Y od 312 (pod stałym napisem), dolna krawędź najwyżej `glowa_gora − 20`.
- Etykiety krótkie: jedno słowo. Dolne napisy lecą dalej, kluczowe słowa żółte.
- Kadry bez cudzych twarzy i bez liczb, tylko z tej rolki.
- Dźwięk: click na każdym klipie, bez ping.
