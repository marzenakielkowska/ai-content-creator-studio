> ⚠️ **Sprawdzenie twarzy:** żaden element tego efektu nie może nachodzić na strefę twarzy (Y:250–1400px × X:200–880px przy 1080×1920), wyjątek: karta na chwilę (ok. 1,5 s) podskakuje na środek ekranu i zasłania twarz — tak ma być, bo to moment pokazania wyniku. Patrz: sekcja **"Twarz — reguła nadrzędna"** w `studio/skills/montaz/SKILL.md`.

# Efekt: Porównanie efektów

**Co robi:** biała karta (jak odpowiedź w czacie, z małym nagłówkiem, np. „Claude”) wjeżdża z dołu, od razu podskakuje na środek ekranu i powiększa się o ok. 15%. W środku dwa porównania przed i po na tym samym zdjęciu:
1. **podział poziomy** — u góry „przed”, pod spodem „po” (np. brwi permanentne: pasek z oczami i brwiami, na dolnym brwi są pełniejsze i ciemniejsze);
2. **podział pionowy** — twarz przecięta białą kreską, lewa połowa „przed”, prawa „po” (np. laser: prawa połowa wygładzona i odrobinę jaśniejsza).
Pod zdjęciami odręczne podpisy (czarne, czcionka odręczna z marki) z zagiętymi strzałkami (kolor wyraźny na zdjęciu, np. fioletowy `#6C63FF`) wskazującymi zmianę.

**To jest wizualizacja.** Nie przedstawiaj jej jako prawdziwego wyniku zabiegu. Używaj zdjęcia samej kursantki (albo jej projektu), nigdy cudzych zdjęć.

## Przygotowanie zdjęć (FFmpeg)

Klatkę z nagrania (patrzy w kamerę, oczy otwarte) wyciągnij: `ffmpeg -ss <czas> -i assets/aroll.mp4 -frames:v 1 klatka.png`.
- Pasek do podziału poziomego: wycinek z brwiami i oczami, np. `crop=500:186:<x>:<y>,scale=1000:372:flags=lanczos`. Brwi „po” rysuje się w HTML (niżej).
- Twarz do podziału pionowego, prawa połowa wygładzona:
```bash
ffmpeg -i klatka.png -filter_complex "[0]crop=500:380:<x>:<y>,scale=1000:760:flags=lanczos,split[a][b];[a]crop=500:760:0:0[l];[b]crop=500:760:500:0,bilateral=sigmaS=7:sigmaR=0.045,eq=brightness=0.02:gamma=1.03,unsharp=5:5:0.4[r];[l][r]hstack" laser.png
```
Silniejsze wygładzenie wygląda sztucznie (rozmyte oczy i włosy) — zostań przy tych wartościach.

## Kod

```html
<div id="odp">
  <div id="odp-gora"><i></i>Claude</div>
  <div class="bt" id="bt-brwi">
    <img src="assets/beauty-brwi.png" style="top:0;width:341px;height:127px">
    <img src="assets/beauty-brwi.png" style="top:133px;width:341px;height:127px">
    <svg id="brwi-svg" width="341" height="127" viewBox="0 0 341 127">
      <defs><filter id="rozmyj"><feGaussianBlur stdDeviation="1.3"/></filter></defs>
      <g fill="#3b2a20" filter="url(#rozmyj)"><path d="…kształt lewej brwi…"/><path d="…prawej…"/></g>
    </svg>
  </div>
  <div class="bt" id="bt-laser"><img src="assets/beauty-laser.png" style="top:0;width:342px;height:260px"><div id="laser-kreska"></div></div>
  <div class="odr" id="lab-brwi" style="left:70px;top:318px">brwi permanentne</div>
  <div class="odr" id="lab-laser" style="left:520px;top:318px">laser tulowy</div>
  <svg class="luk" …> strzałki od podpisów do zmiany </svg>
</div>
```
```css
#odp { position: absolute; left: 70px; top: 1080px; width: 830px; height: 386px; border-radius: 30px; background: #fff;
  border: 2px solid #DEDBD3; box-shadow: 0 12px 40px rgba(0,0,0,.16); }
.bt { position: absolute; top: 60px; height: 260px; border-radius: 16px; overflow: hidden; }
.bt img { position: absolute; left: 0; display: block; }
#bt-brwi { left: 53px; width: 341px; }  #bt-laser { left: 434px; width: 342px; }
#brwi-svg { position: absolute; left: 0; top: 133px; mix-blend-mode: multiply; }
#laser-kreska { position: absolute; left: 169px; top: 0; width: 4px; height: 260px; background: #fff; }
#odp .odr { font-size: 50px; color: #151515; text-shadow: none; }
#odp svg.luk path { stroke: #6C63FF; filter: none; }
```
Kształt brwi: dwa zwężające się łuki (gruby przy nosie, cienki na końcu) dokładnie na miejscu prawdziwych brwi — zmierz je na pasku i sprawdź na podglądzie. Krycie 0,78, `mix-blend-mode: multiply`, lekkie rozmycie.
```js
gsap.set("#odp", { y: 900 });
tl.to("#odp", { y: 0, duration: 0.18, ease: "power3.out" }, T);
tl.to("#odp", { y: -300, x: 55, scale: 1.16, duration: 0.24, ease: "back.out(1.8)" }, T + 0.18);   // na środek ekranu
tl.fromTo(".bt", { scale: 0.85, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.2, stagger: 0.12, ease: "back.out(2)", immediateRender: false }, T + 0.12);
gsap.set("#brwi-svg", { opacity: 0 }); tl.to("#brwi-svg", { opacity: 0.78, duration: 0.25 }, T + 0.47);
// podpisy pisane litera po literze, potem strzałki rysowane (stroke-dashoffset)
tl.to("#odp", { y: 900, scale: 1, duration: 0.16, ease: "power3.in" }, KONIEC - 0.17);
```
Dźwięki: pop na wejściu karty, sparkle, gdy pojawia się „po”.
