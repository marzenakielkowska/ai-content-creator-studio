> ⚠️ **Sprawdzenie twarzy:** dymek i podpis nad głową, dolna krawędź co najmniej 40 px nad czubkiem głowy. Patrz: sekcja **„Twarz — reguła nadrzędna”** w `studio/skills/montaz/SKILL.md`.

# Efekt: Wiadomość głosowa

**Co robi:** na cięciu z góry wjeżdża nad głowę biały dymek wiadomości głosowej: fioletowy przycisk odtwarzania, fala
dźwięku, licznik i przycisk wysyłania. Obok wskakuje okrągłe zdjęcie kursantki, a pod spodem podpis „Wiadomość głosowa”.
Przycisk zmienia się z „odtwórz” na „pauzę”, a fala zapełnia się kolorem akcentu w tempie jej mowy, licznik idzie 0:00,
0:01, 0:02… Na końcu zdania dymek odjeżdża w górę.

**Kiedy:** jedno zdanie mówione wprost do widza, jak w wiadomości głosowej do koleżanki: „wyobraź sobie…”, „posłuchaj…”,
osobista prośba, opinia, cytat z rozmowy. Od 2 do 9 s.

**Czego potrzeba:** jej zdjęcie profilowe (z marki albo od kursantki) i fala z jej głosu z tego zdania (polecenie niżej).

## Słowa kursantki

- Fala to zawsze jej prawdziwy głos z tych sekund, nigdy losowe słupki. Podpis zostaje „Wiadomość głosowa”.
- Postęp i licznik idą od początku do końca jej zdania.

## Fala z głosu

```
"<ffmpeg>" -nostdin -v error -ss OD -t DL -i assets/aroll.mp4 -vn -ac 1 -ar 44100 -af "asetnsamples=n=N:p=0,astats=metadata=1:reset=1,ametadata=print:key=lavfi.astats.Overall.RMS_level:file=-" -f null -
```

`OD` i `DL` to początek i długość zdania w rolce (z `slowa.json`), a `N` = 44100 × DL / 44, zaokrąglone. Wychodzą wiersze
`RMS_level=-24.1…`: weź pierwsze 44. Wysokość słupka = 64 × (dB + 50) / 30 px, nie mniej niż 10 i nie więcej niż 64.

## Kod

```html
<div id="gl-o" class="clip" data-start="T" data-duration="D" style="position:absolute;inset:0">
  <div class="karta" id="gl">
    <div id="gl-pl">
      <svg id="gl-p1" viewBox="0 0 24 24" width="34" height="34"><path d="M8 5l11 7-11 7z" fill="#fff"/></svg>
      <svg id="gl-p2" viewBox="0 0 24 24" width="34" height="34"><rect x="6" y="5" width="4" height="14" rx="1.5" fill="#fff"/><rect x="14" y="5" width="4" height="14" rx="1.5" fill="#fff"/></svg>
    </div>
    <div id="gl-f">
      <div class="gl-f0"><!-- 44 słupki: <i style="left:{i × 400 / 44}px;height:{wysokość}px"></i> --></div>
      <div id="gl-f1"><div class="gl-f0 gl-ak"><!-- te same 44 słupki --></div></div>
      <i id="gl-g"></i>
    </div>
    <div id="gl-t">0:00</div>
    <div id="gl-wy"><svg viewBox="0 0 24 24" width="32" height="32"><path d="M12 19V5M5 12l7-7 7 7" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg></div>
  </div>
  <div id="gl-av"><img src="assets/profil.jpg" alt=""></div>
  <div class="karta" id="gl-et">Wiadomość głosowa</div>
</div>
```
```css
.karta { position: absolute; background: #fff; border-radius: 28px; box-shadow: 0 18px 44px rgba(0,0,0,.32); box-sizing: border-box; font-family: Nunito, sans-serif; font-weight: 800; color: #1C1C1E; }
#gl { left: 150px; top: 238px; width: 700px; height: 104px; border-radius: 52px; display: flex; align-items: center; gap: 18px; padding: 0 16px; }
#gl-pl { width: 72px; height: 72px; border-radius: 50%; background: #6C4BEF; display: flex; align-items: center; justify-content: center; flex: none; position: relative; }
#gl-pl svg { position: absolute; } #gl-p2 { opacity: 0; }
#gl-f { position: relative; width: 400px; height: 70px; flex: none; }
.gl-f0 { position: absolute; left: 0; top: 0; width: 400px; height: 70px; }
.gl-f0 i { position: absolute; bottom: 50%; width: 5px; border-radius: 3px; background: #CFCBDB; transform: translateY(50%); }
.gl-ak i { background: #6C4BEF; }
#gl-f1 { position: absolute; left: 0; top: 0; width: 0; height: 70px; overflow: hidden; }
#gl-g { position: absolute; left: 0; top: 4px; width: 4px; height: 62px; border-radius: 2px; background: #6C4BEF; }
#gl-t { font-size: 34px; color: #3A3A44; width: 76px; flex: none; }
#gl-wy { width: 64px; height: 64px; border-radius: 50%; background: #6C4BEF; display: flex; align-items: center; justify-content: center; flex: none; }
#gl-av { position: absolute; left: 868px; top: 254px; width: 72px; height: 72px; border-radius: 50%; overflow: hidden; border: 4px solid #fff; box-shadow: 0 8px 18px rgba(0,0,0,.35); }
#gl-av img { width: 100%; height: 100%; object-fit: cover; display: block; }
#gl-et { left: 370px; top: 356px; height: 52px; padding: 0 22px; border-radius: 26px; font-size: 28px; display: flex; align-items: center; white-space: nowrap; }
```
```js
// T = cięcie (wejście dymku) = OD, początek fali; DO = koniec zdania; T_GRA = T + 0,2 (dymek już stoi); T_WYJ = DO − 0,18
const SZ = 400, x0 = (T_GRA - OD) / (DO - OD) * SZ, x1 = (T_WYJ - OD) / (DO - OD) * SZ;
gsap.set(["#gl", "#gl-av", "#gl-et"], { y: -480 });
tl.to("#gl", { y: 0, duration: 0.2, ease: "power3.out" }, T);
tl.to("#gl-av", { y: 0, duration: 0.24, ease: "back.out(1.8)" }, T + 0.05);
tl.to("#gl-et", { y: 0, duration: 0.24, ease: "back.out(1.8)" }, T + 0.11);
tl.set("#gl-p1", { opacity: 0 }, T_GRA); tl.set("#gl-p2", { opacity: 1 }, T_GRA);
tl.fromTo("#gl-f1", { width: x0 }, { width: x1, duration: T_WYJ - T_GRA, ease: "none", immediateRender: false }, T_GRA);
tl.fromTo("#gl-g", { x: x0 }, { x: x1 - 4, duration: T_WYJ - T_GRA, ease: "none", immediateRender: false }, T_GRA);
const cz = { v: T_GRA - OD };
tl.fromTo(cz, { v: T_GRA - OD }, { v: T_WYJ - OD, duration: T_WYJ - T_GRA, ease: "none", immediateRender: false,
  onUpdate: () => { document.getElementById("gl-t").textContent = "0:0" + Math.floor(cz.v); } }, T_GRA);
tl.to(["#gl", "#gl-av", "#gl-et"], { y: -480, duration: 0.17, ease: "power3.in" }, T_WYJ);
```

## Zasady

- Dymek nad głową: Y 238–342, podpis do Y 408, co najmniej 40 px nad czubkiem głowy. Gdy głowa jest wyżej, przybliż kadr
  od górnej krawędzi, żeby zeszła niżej.
- Stan początkowy `y: −480`: nad kadrem nie może wystawać nawet cień. Wejście na cięciu, wyjazd w górę 0,17 s na końcu
  zdania.
- Postęp liniowo (`ease: "none"`), licznik w formacie 0:0X, więc zdanie trwa najwyżej 9 s.
- Dźwięki: pop na wejście, soft-click na „odtwórz”, short-whoosh na wyjazd.

## Wspólne zasady

- Kolory, czcionki i płótno ze stylu kursantki (`moj-brand.json`, `moj-styl.json`); kolory podane niżej to tylko przykład.
- Stany początkowe ustawiaj `gsap.set(...)` poza osią czasu, a wejścia `fromTo` z `immediateRender: false`. Inaczej element
  stoi przez klatkę na miejscu końcowym, zanim wjedzie (`rules/pulapki.md`).
- Element wchodzi na słowie, którego dotyczy (czasy z `slowa.json`), i trwa co najmniej do końca zdania.
- Treść tylko prawdziwa: liczby, nazwy i materiały z nagrania albo od kursantki, bez zmyślonych kwot i dowodów.
- Dźwięki z jej wyboru, ciszej niż głos, bez ping.
