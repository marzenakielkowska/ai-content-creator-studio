> ⚠️ **Sprawdzenie twarzy:** drzwi stoją za osobą (pod wycięciem z tła), nazwa nad głową, nic nie przechodzi przez twarz. Patrz: sekcja **„Twarz — reguła nadrzędna”** w `studio/skills/montaz/SKILL.md`.

# Efekt: Otwierane drzwi

**Co robi:** za osobą stoją zamknięte, dwuskrzydłowe drzwi w kolorze marki, z żółtymi klamkami. Na słowie „otwieram”
skrzydła rozsuwają się na boki (0,45 s), a za nimi widać ścianę kafelków z materiałów kursantki. Nad głową wskakuje nazwa
tego, co się otwiera.

**Kiedy:** „otwieram drzwi do…”, „startują zapisy”, „ruszam z…”, premiera kursu albo produktu. Raz w rolce, zwykle przy
wezwaniu do działania.

**Czego potrzeba:** wycięcie z tła na to ujęcie (`czysc-tlo <projekt> <nazwa> <od> <do>`), 30–60 kafelków (klatki z jej
rolek, zdjęcia produktu, okładki) i nazwa z nagrania.

## Kod

```html
<!-- warstwa za osobą (pod wycięciem) -->
<div id="dr" class="clip" data-start="T" data-duration="D" style="position:absolute;inset:0">
  <div style="position:absolute;inset:0;background:#6C4BEF"></div>
  <div id="dr-sc"><!-- 9 kolumn × 7 rzędów: <img class="kaf" src="assets/k01.jpg" style="left:Xpx;top:Ypx"> --></div>
  <div id="drL" class="drzwi" style="left:0"><i class="klamka" style="right:26px"></i></div>
  <div id="drR" class="drzwi" style="left:540px"><i class="klamka" style="left:26px"></i></div>
</div>
<!-- warstwa przed osobą -->
<div id="dr-n" class="clip" data-start="T2" data-duration="D2">Nazwa<br><b>oferty</b></div>
```
```css
.drzwi { position: absolute; top: 0; width: 540px; height: 1920px; background-color: #5A3BE0;
  background-image: linear-gradient(90deg, rgba(0,0,0,.12) 2px, transparent 2px), linear-gradient(rgba(255,255,255,.06) 2px, transparent 2px);
  background-size: 180px 300px; box-shadow: inset 0 0 0 6px rgba(255,255,255,.18); }
.klamka { position: absolute; top: 980px; width: 26px; height: 120px; border-radius: 13px; background: #FFD23F; box-shadow: 0 6px 12px rgba(0,0,0,.35); }
#dr-sc .kaf { position: absolute; width: 112px; height: 199px; object-fit: cover; border-radius: 12px; border: 3px solid #fff; box-sizing: border-box; }
#dr-sc { position: absolute; left: 9px; top: 470px; }   /* kafelek co 118 px w poziomie, co 205 px w pionie */
#dr-n { position: absolute; left: 60px; right: 60px; top: 312px; text-align: center; font: 800 74px Nunito, sans-serif; line-height: 1.02; color: #fff; text-shadow: 0 5px 18px rgba(0,0,0,.6); }
#dr-n b { color: #FFD23F; font-weight: 800; }
```
```js
// OTWIERAM = czas słowa „otwieram” (albo „startuję”, „ruszam”)
gsap.set("#dr-n", { opacity: 0 });
tl.to("#drL", { x: -560, duration: 0.45, ease: "power3.inOut" }, OTWIERAM - 0.1);
tl.to("#drR", { x: 560, duration: 0.45, ease: "power3.inOut" }, OTWIERAM - 0.1);
tl.fromTo("#dr-n", { opacity: 0, scale: 0.8 }, { opacity: 1, scale: 1, duration: 0.24, ease: "back.out(2)", immediateRender: false }, OTWIERAM + 0.15);
```

## Zasady

- Drzwi są tłem: warstwa pod wycięciem, osoba stoi przed nimi przez cały czas. Bez wycięcia z tła tego efektu nie rób.
- Drzwi są zamknięte od pierwszej klatki ujęcia, otwierają się dopiero na słowie. Przed słowem widz ma je zobaczyć co
  najmniej 0,6 s.
- Nazwa nad głową: od Y 310 do `glowa_gora − 40`, najwyżej dwie linie, druga w kolorze akcentu.
- Dźwięki: whoosh na otwarcie, sparkle na nazwę.

## Wspólne zasady

- Kolory, czcionki i płótno ze stylu kursantki (`moj-brand.json`, `moj-styl.json`); kolory podane niżej to tylko przykład.
- Stany początkowe ustawiaj `gsap.set(...)` poza osią czasu, a wejścia `fromTo` z `immediateRender: false`. Inaczej element
  stoi przez klatkę na miejscu końcowym, zanim wjedzie (`rules/pulapki.md`).
- Element wchodzi na słowie, którego dotyczy (czasy z `slowa.json`), i trwa co najmniej do końca zdania.
- Treść tylko prawdziwa: liczby, nazwy i materiały z nagrania albo od kursantki, bez zmyślonych kwot i dowodów.
- Dźwięki z jej wyboru, ciszej niż głos, bez ping.
