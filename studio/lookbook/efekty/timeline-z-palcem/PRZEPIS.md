> ⚠️ **Sprawdzenie twarzy:** panel stoi nad głową, dłoń wchodzi z boku kadru i nie przechodzi przez głowę. Patrz: sekcja **„Twarz — reguła nadrzędna”** w `studio/skills/montaz/SKILL.md`.

# Efekt: Timeline z palcem

**Co robi:** nad głową pojawia się ciemny panel osi czasu: tytuł i trzy ścieżki (żółta, niebieska, zielona). Prawdziwa dłoń kursantki wchodzi z boku kadru i palcem przesuwa klipy, głowica jedzie. Pokazuje, jak żmudny jest ręczny montaż. Licznik ręcznych przesunięć dajesz tylko wtedy, gdy liczba padła w nagraniu: wymyślonych liczb nie pokazujemy.

**Kiedy:** „ręcznie”, „sama to montowałam”, „godzinami”, „próby, które nie wychodzą”. Wersja „nie wychodzi”: panel za głową (pod sylwetką), przesunięte klipy czerwienieją, na końcu panel drży i pojawia się odręczne „znowu nie tak...”.

**Dłoń:** w nagraniu znajdź ostrą klatkę z uniesionym palcem na tle swetra albo ściany, weź ją z arkusza, a potem `wytnij-dlon <projekt> <czas> <x,y,w,h> "<obrys>"`. Obrys prowadź ściśle po dłoni, około 40 punktów, a współrzędne podawaj w układzie ramki. Obejrzyj `work/dlon-podglad.jpg`. Dłoń ma być w pełni kryjąca, bez rozmytych końców: półprzezroczysty koniec wygląda jak prześwit. Gdy w nagraniu nie ma takiej klatki, zamiast dłoni daj biały punkt dotyku (kółko 44 px z obwódką i cieniem), a kursantce powiedz o tym jednym zdaniem.

## Kod

```html
<div id="ta" class="tlp" style="left:70px;top:318px;width:940px">
  <div class="tlp-g"><span>Ręczny montaż · moje-wideo.mov</span><b>ręcznych przesunięć: <span id="ta-n">0</span></b></div>
  <div class="tlp-s"><i style="left:0;width:170px;background:#FDE68A"></i><i style="left:180px;width:240px;background:#FDE68A"></i><i style="left:430px;width:120px;background:#FDE68A"></i><i id="ta-y1" style="left:570px;width:150px;background:#FDE68A"></i><i id="ta-y2" style="left:760px;width:120px;background:#FDE68A"></i></div>
  <div class="tlp-s"><i style="left:0;width:280px;background:#6C8CFF"></i><i style="left:290px;width:190px;background:#6C8CFF"></i><i style="left:490px;width:170px;background:#6C8CFF"></i><i id="ta-b1" style="left:700px;width:178px;background:#6C8CFF"></i></div>
  <div class="tlp-s"><i style="left:0;width:888px;background:repeating-linear-gradient(90deg,#34C77B 0 6px,#2aa865 6px 10px)"></i></div>
  <div id="ta-h" class="tlp-h" style="left:24px;top:60px;height:148px"></div>
</div>
<img id="ta-r" class="reka" src="assets/reka.png" alt="" style="left:430px;top:380px">
```
```css
.tlp { position: absolute; background: #1E1E24; border-radius: 28px; box-sizing: border-box; padding: 16px 24px 18px; color: #fff; font-family: Nunito, sans-serif; font-weight: 800; box-shadow: 0 22px 56px rgba(0,0,0,.5); border: 2px solid rgba(255,255,255,.1); }
.tlp-g { display: flex; justify-content: space-between; align-items: center; font-size: 27px; color: #c9c9d2; margin-bottom: 8px; white-space: nowrap; }
.tlp-g b { color: #FFD166; font-weight: 800; }
.tlp-s { position: relative; height: 42px; margin-top: 8px; }
.tlp-s i { position: absolute; top: 0; height: 100%; border-radius: 8px; display: block; }
.tlp-h { position: absolute; width: 4px; background: #FFD166; border-radius: 2px; box-shadow: 0 0 10px rgba(255,209,102,.7); }
/* czubek palca stoi w punkcie left/top: margines i transform-origin ustaw na pozycję czubka w obrazku */
.reka { position: absolute; width: 360px; height: 540px; margin-left: -252px; margin-top: -22px; filter: brightness(.86) contrast(1.04) drop-shadow(0 12px 18px rgba(0,0,0,.45)); }
```
```js
// T = początek panelu, D = jego długość. Klipy po prawej stronie panelu, bo dłoń wchodzi z prawego boku.
const IR = { immediateRender: false };
tl.fromTo("#ta", { opacity: 0, y: -40, scale: 0.96 }, { opacity: 1, y: 0, scale: 1, duration: 0.26, ease: "power3.out", ...IR }, T);
tl.fromTo("#ta-h", { x: 0 }, { x: 880, duration: D, ease: "none", ...IR }, T);
// Licznik tylko z prawdziwą liczbą z nagrania (LICZBA). Bez niej usuń <b> z panelu i te dwie linie.
const n = { v: 0 };
tl.fromTo(n, { v: 0 }, { v: LICZBA, duration: D - 0.2, ease: "none", ...IR, onUpdate: () => { document.getElementById("ta-n").textContent = Math.round(n.v); } }, T + 0.2);
// [czas, x czubka, y czubka, klip, przesunięcie klipu]
const ruchy = [[T + 0.35, 740, 398, "#ta-y1", 36], [T + 0.95, 880, 448, "#ta-b1", -36], [T + 1.55, 900, 398, "#ta-y2", 12]];
gsap.set("#ta-r", { x: 700, y: 18, rotation: -85, transformOrigin: "70% 4%" });
tl.to("#ta-r", { x: 310, y: 18, duration: 0.24, ease: "power3.out" }, T + 0.02);
ruchy.forEach(([t, x, y, klip, dx]) => {
  tl.to("#ta-r", { x: x - 430, y: y - 380, duration: 0.26, ease: "power2.inOut" }, t - 0.26);
  tl.to("#ta-r", { x: x - 430 + dx, duration: 0.3, ease: "power2.inOut" }, t);
  tl.to(klip, { x: dx, duration: 0.3, ease: "power2.inOut" }, t);
});
```

## Zasady

- **Dłoń wchodzi z boku kadru i nadgarstek zostaje poza kadrem.** Czubek palca najdalej X 730 od prawej krawędzi, inaczej widać koniec dłoni. Nigdy od dołu: przeszłaby przez głowę.
- Dłoń dopasuj do filtra rolki: `brightness` tak, żeby skóra zgadzała się z twarzą.
- Panel: Y od 318 (pod stałym napisem) do najwyżej `glowa_gora`. Mniej miejsca nad głową: wersja za głową, pod sylwetką.
- Dopiski obok: „ręczny montaż” przekreślony na końcu, ikony programów do edycji przekreślone po kolei.
- Dźwięki: click na każdym przesunięciu, bez ping.
