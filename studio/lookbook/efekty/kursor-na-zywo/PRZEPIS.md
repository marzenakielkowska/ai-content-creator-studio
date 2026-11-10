> ⚠️ **Sprawdzenie twarzy:** ramka idzie wokół głowy i ramion, kursor i podpis jadą po jej górnej i bocznej krawędzi, nigdy w poprzek twarzy. Patrz: sekcja **„Twarz — reguła nadrzędna”** w `studio/skills/montaz/SKILL.md`.

# Efekt: Kursor na żywo

**Co robi:** z lewego górnego rogu wjeżdża kursor z kolorowym podpisem (mała ikona i imię), jak kursor drugiej osoby we
wspólnym programie graficznym. Dojeżdża nad głowę i rysuje wokół osoby ramkę: najpierw górną krawędź, potem prawą, w dół.
Na rogach i bokach pojawia się 8 uchwytów, a pod ramką plakietka z wymiarami (np. „580 × 870”), która liczy się na żywo.
Kursor łapie prawy dolny róg i lekko zmniejsza ramkę, na chwilę miga różowa linia przyciągania. Po około 2,3 s ramka
znika, a kursor odjeżdża w prawo.

**Kiedy:** pierwsze 2–3 sekundy rolki (hak), gdy kursantka mówi, że ktoś albo coś pracuje nad jej materiałem: AI,
asystentka, program, projektowanie, poprawki. Raz w rolce.

**Czego potrzeba:** nic poza nagraniem i `glowa.json`. Do podpisu ikona: jej zdjęcie profilowe albo ikona programu,
o którym mówi.

## Słowa kursantki

- Podpis przy kursorze to imię, które pasuje do jej nagrania: jej własne, nazwa programu, o którym mówi, albo imię osoby,
  która z nią pracuje (tylko za zgodą tej osoby). W filmie podglądowym jest „Claude”, bo tak było w nagraniu autorki
  kursu: nie przepisuj go.
- W planie montażu pokaż kursantce podpis i zapytaj, czy pasuje.

## Kod

```html
<div id="kz" class="clip" data-start="T" data-duration="2.65" style="position:absolute;inset:0">
  <div id="kz-r" style="left:250px;top:372px;width:580px;height:870px">   <!-- BX, BY, BW, BH -->
    <div id="kz-uch"><!-- 8 uchwytów: <i class="kz-u" style="left:X%;top:Y%"></i> dla (0,0) (50,0) (100,0) (0,50) (100,50) (0,100) (50,100) (100,100) --></div>
  </div>
  <div id="kz-w"><span id="kz-ww">580</span> × <span id="kz-wh">870</span></div>
  <div id="kz-l"></div>
  <div id="kz-k"><svg viewBox="0 0 24 24" width="58" height="58"><path d="M4 2l15 11-7 1 4 8-3 1-4-8-5 5z" fill="#fff" stroke="#1C1C1E" stroke-width="1.6" stroke-linejoin="round"/></svg><span><img src="assets/ikona.png" alt="">Podpis</span></div>
</div>
```
```css
#kz-r { position: absolute; border: 4px solid #6C4BEF; box-sizing: border-box; }
#kz-uch { position: absolute; inset: -2px; }
.kz-u { position: absolute; width: 22px; height: 22px; margin: -11px 0 0 -11px; background: #fff; border: 4px solid #6C4BEF; box-sizing: border-box; border-radius: 4px; }
#kz-w { position: absolute; left: 0; top: 0; width: 180px; height: 40px; gap: 8px; border-radius: 10px; background: #6C4BEF; color: #fff; font: 500 26px "JetBrains Mono", monospace; display: flex; align-items: center; justify-content: center; white-space: nowrap; }
#kz-l { position: absolute; left: 130px; top: 1201px; width: 820px; height: 3px; background: #FF5DA2; }   /* top = BY + BH − 41 */
#kz-k { position: absolute; left: 0; top: 0; filter: drop-shadow(0 6px 10px rgba(0,0,0,.45)); }
#kz-k span { position: absolute; left: 40px; top: -48px; height: 44px; padding: 0 16px 0 8px; border-radius: 12px; background: #6C4BEF; color: #fff; font: 800 28px Nunito, sans-serif; display: flex; align-items: center; gap: 8px; white-space: nowrap; }
#kz-k span img { width: 30px; height: 30px; border-radius: 8px; display: block; }
```
```js
// T = początek efektu (pierwsza klatka rolki albo cięcie). Ramka z glowa.json: od ~30 px nad czubkiem głowy
// do ~210 px pod brodą, po bokach ~20 px poza włosami (tu BX 250, BY 372, BW 580, BH 870)
const BX = 250, BY = 372, BW = 580, BH = 870;
gsap.set("#kz-k", { x: 120, y: 240, opacity: 0 }); gsap.set("#kz-r", { width: 0, height: 0, opacity: 0 });
gsap.set(["#kz-w", "#kz-uch", "#kz-l"], { opacity: 0 });
tl.to("#kz-k", { opacity: 1, duration: 0.12 }, T + 0.05);
tl.to("#kz-k", { x: BX, y: BY, duration: 0.32, ease: "power2.inOut" }, T + 0.05);
tl.set("#kz-r", { opacity: 1, height: 4 }, T + 0.38);
const wym = { w: 0, h: 4 };
// plakietka pod ramką, na środku, idzie za dolną krawędzią: stała szerokość 180 px, bez mierzenia tekstu
const pokaz = () => {
  document.getElementById("kz-ww").textContent = Math.round(wym.w);
  document.getElementById("kz-wh").textContent = Math.round(wym.h);
  gsap.set("#kz-w", { x: BX + wym.w / 2 - 90, y: BY + wym.h + 16 });
};
gsap.set("#kz-w", { x: BX + BW / 2 - 90, y: BY + BH + 16 });
tl.set("#kz-w", { opacity: 1 }, T + 0.92);
tl.to("#kz-k", { x: BX + BW, duration: 0.24, ease: "power2.inOut" }, T + 0.38);
tl.to(wym, { w: BW, duration: 0.24, ease: "power2.inOut", onUpdate: () => { gsap.set("#kz-r", { width: wym.w }); pokaz(); } }, T + 0.38);
tl.to("#kz-k", { y: BY + BH, duration: 0.3, ease: "power2.inOut" }, T + 0.62);
tl.to(wym, { h: BH, duration: 0.3, ease: "power2.inOut", onUpdate: () => { gsap.set("#kz-r", { height: wym.h }); pokaz(); } }, T + 0.62);
tl.fromTo("#kz-uch", { opacity: 0, scale: 0.9 }, { opacity: 1, scale: 1, duration: 0.12, immediateRender: false }, T + 0.92);
tl.to("#kz-k", { x: BX + BW - 40, y: BY + BH - 40, duration: 0.5, ease: "power2.inOut" }, T + 1.08);
tl.to(wym, { w: BW - 40, h: BH - 40, duration: 0.5, ease: "power2.inOut", onUpdate: () => { gsap.set("#kz-r", { width: wym.w, height: wym.h }); pokaz(); } }, T + 1.08);
tl.set("#kz-l", { opacity: 0.9 }, T + 1.4); tl.set("#kz-l", { opacity: 0 }, T + 1.76);
tl.to(["#kz-r", "#kz-w"], { opacity: 0, duration: 0.16 }, T + 2.28);
tl.to("#kz-k", { x: 1120, y: BY + BH + 160, opacity: 0, duration: 0.3, ease: "power2.in" }, T + 2.3);
```

## Zasady

- Ramka obejmuje głowę i ramiona. Kursor jedzie górną i prawą krawędzią ramki (gdy z prawej jest mało miejsca: górną
  i lewą), nigdy w poprzek twarzy.
- Podpis kursora stoi nad kursorem, w prawo; przy prawej krawędzi kadru przesuń go w lewo.
- Plakietka z wymiarami pod ramką, na wysokości klatki piersiowej, w czcionce o stałej szerokości (JetBrains Mono 500).
  Liczby to szerokość i wysokość ramki w pikselach kadru.
- Kadr szeroki, bez przybliżenia i bez wycięcia z tła. Cały efekt około 2,7 s, raz w rolce.
- Dźwięki: soft-click na start rysowania (T + 0,4), click na uchwyty (T + 1,05), soft-click na przyciąganie (T + 1,62).

## Wspólne zasady

- Kolory, czcionki i płótno ze stylu kursantki (`moj-brand.json`, `moj-styl.json`); kolory podane niżej to tylko przykład.
- Stany początkowe ustawiaj `gsap.set(...)` poza osią czasu, a wejścia `fromTo` z `immediateRender: false`. Inaczej element
  stoi przez klatkę na miejscu końcowym, zanim wjedzie (`rules/pulapki.md`).
- Element wchodzi na słowie, którego dotyczy (czasy z `slowa.json`), i trwa co najmniej do końca zdania.
- Treść tylko prawdziwa: liczby, nazwy i materiały z nagrania albo od kursantki, bez zmyślonych kwot i dowodów.
- Dźwięki z jej wyboru, ciszej niż głos, bez ping.
