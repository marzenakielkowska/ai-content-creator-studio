> ⚠️ **Sprawdzenie twarzy — wyjątek tego efektu:** lista jest półprzezroczystą nakładką PRZED osobą na prawie całym kadrze (tak działa ten efekt, kursantka wybiera go świadomie). Zatrzymany, podświetlony wiersz stawiaj pod brodą (`broda_okolo + 40` z `glowa.json`) albo nad głową, nigdy na oczach. Lista kończy się nad pasem napisów (maska do Y ≈ 1260). Reszta rolki: sekcja **„Twarz — reguła nadrzędna”** w `studio/skills/montaz/SKILL.md`.

# Efekt: Lista za palcem (rybie oko)

**Co robi:** prawdziwa lista z aplikacji (np. ostatnie wyszukiwania w Spotify) bez ciemnego tła leży przed kursantką i jest wybrzuszona jak przez rybie oko: środek kadru powiększony około 1,5 raza, brzegi ściśnięte i wygięte. Lista przesuwa się tylko wtedy, gdy kursantka rusza ręką, jakby przewijała ją palcem w powietrzu. Na słowie „O, jest!” staje na szukanej pozycji, wokół wiersza rysuje się odręczny kontur z gwiazdkami. Na „uruchamiam” wiersz miga i rozchodzi się kółko stuknięcia, a na „lecimy” lista odlatuje do widza i znika. Wideo pod listą jest lekko przygaszone, żeby tekst był czytelny.

**Czego potrzeba od kursantki:**
1. Nagranie 9:16: mówi do kamery i udaje, że przewija palcem w powietrzu (krótkie ruchy w górę), dłoń z boku twarzy, nie przed nią. Potem „O, jest!”, „stuknięcie” palcem i „lecimy”.
2. Nagranie ekranu telefonu w tej samej aplikacji (ciemny motyw): przewija listę od góry do dołu, tak żeby było widać pozycję, na której lista ma się zatrzymać. Plik trafia do `<projekt>/materialy/`.

Gdy kursantka nie ma nagrania ekranu, poproś o nie. Nie odtwarzaj listy ręcznie (zasada „Dowód: tylko prawdziwy”).

## Kroki

### 1. Jeden długi pasek listy

Weź dwie nieruchome klatki z nagrania ekranu: listę u góry i listę przewiniętą w dół. Przesunięcie to różnica Y tego samego wiersza w obu klatkach (odczytaj z obejrzanych klatek). Obetnij pasek stanu u góry i pasek nawigacji na dole.

```bash
ffmpeg -ss <t_gora> -i ekran.mp4 -frames:v 1 gora.png
ffmpeg -ss <t_dol>  -i ekran.mp4 -frames:v 1 dol.png
# G = granica między wierszami w górnej klatce (koniec doklejanej części), P = przesunięcie, K = koniec ostatniego pełnego wiersza w dolnej
ffmpeg -i gora.png -i dol.png -filter_complex "[0]crop=iw:G-150:0:150[a];[1]crop=iw:K-(G-P):0:G-P[b];[a][b]vstack,scale=1080:-2" lista.jpg
```
Obejrzyj szew: żaden wiersz nie może się powtarzać ani zniknąć. Pasek musi być na tyle długi, żeby w każdej pozycji przykrywał kadr do Y 1920.

### 2. Wycięte tło

```bash
ffmpeg -i lista.jpg -vf "colorkey=0x121212:0.09:0.06,format=rgba" assets/lista-alfa.png
```
`0x121212` to tło Spotify. W innej aplikacji zmierz kolor tła na klatce i wpisz go tu. Zostają tekst, okładki i ikony.

### 3. Mapa wybrzuszenia i maska (raz na kadr 1080×1920)

```bash
ffmpeg -f lavfi -i "color=c=gray:s=1080x1920:d=1" -frames:v 1 -vf "format=rgb24,geq=r='128+255/200*(X-540)*if(gt(hypot(X-540,Y-960),0.5),pow(hypot(X-540,Y-960),0.25)/pow(1101,0.25)-1,0)':g='128+255/200*(Y-960)*if(gt(hypot(X-540,Y-960),0.5),pow(hypot(X-540,Y-960),0.25)/pow(1101,0.25)-1,0)':b='128'" assets/wybrzuszenie.png
ffmpeg -f lavfi -i "color=c=black:s=1080x1920:d=1" -frames:v 1 -vf "format=rgba,geq=r='255':g='255':b='255':a='255*clip(min((Y-230)/90,(1260-Y)/110),0,1)'" assets/lista-maska.png
```
Mapa mówi każdemu punktowi, skąd wziąć obraz: środek jest rozpychany na zewnątrz, brzegi zostają. Silniejsze wybrzuszenie: zmniejsz wykładnik `0.25` (np. 0,2). Maska: lista widoczna od Y ~230 do ~1260 z miękkimi brzegami, dół zostaje dla napisów.

### 4. Ruch dłoni → przewijanie

Na złożonej rolce zmierz, jak bardzo zmienia się obraz w obszarze dłoni (bez twarzy), klatka po klatce:
```bash
ffmpeg -ss <start> -t <dlugosc> -i assets/aroll.mp4 -vf "crop=330:1000:0:500,format=gray,tblend=all_mode=difference,signalstats,metadata=print:key=lavfi.signalstats.YAVG:file=ruch.txt" -f null -
```
Obszar `crop` dopasuj do strony, po której kursantka trzyma dłoń. Klatkę cięcia z przybliżeniem wyzeruj (skok obrazu to nie ruch ręki). Z `pts_time` + `start` i `YAVG` zrób listę `[czas, ruch]`, a potem pozycje listy:

```js
// lista jedzie tylko wtedy, gdy ręka się rusza; yOd → yDo w czasie od → doo
function klatkiPrzewijania(od, doo, yOd, yDo) {
  const czasy = [];
  for (let t = od; t < doo - 0.001; t += 1 / 30) czasy.push(t);
  const surowe = czasy.map((t) => ruchW(t)); // najbliższy pomiar YAVG
  const gladkie = surowe.map((_, i) => {
    const okno = surowe.slice(Math.max(0, i - 2), i + 3);
    return Math.max(0, okno.reduce((a, b) => a + b, 0) / okno.length - 4); // próg ~4 = szum
  });
  const suma = gladkie.reduce((a, b) => a + b, 0) || 1;
  let narast = 0;
  return czasy.map((t, i) => { narast += gladkie[i]; return [t, Math.round(yOd + (yDo - yOd) * (narast / suma))]; });
}
```
Pierwsze zdanie („przewijam…”): od góry listy do jej dołu (`y` od 0 do `1920 − wysokość paska`). Drugie („szukam…”): z powrotem, tak żeby szukany wiersz stanął dokładnie na „O, jest!” na wybranej wysokości (przed wygięciem; np. środek wiersza na Y ~1060, czyli pod brodą przy osobie na środku kadru).

### 5. Kompozycja (nad nagraniem, pod napisami; sylwetka niepotrzebna)

```html
<svg width="0" height="0" style="position:absolute"><defs>
  <filter id="rybie-oko" filterUnits="userSpaceOnUse" x="0" y="0" width="1080" height="1920" color-interpolation-filters="sRGB">
    <feImage href="assets/wybrzuszenie.png" x="0" y="0" width="1080" height="1920" preserveAspectRatio="none" result="mapa"/>
    <feDropShadow in="SourceGraphic" dx="0" dy="3" stdDeviation="4" flood-color="#000" flood-opacity="0.7" result="cien"/>
    <feDisplacementMap in="cien" in2="mapa" scale="200" xChannelSelector="R" yChannelSelector="G" result="wygiete"/>
    <feImage href="assets/lista-maska.png" x="0" y="0" width="1080" height="1920" preserveAspectRatio="none" result="maska"/>
    <feComposite in="wygiete" in2="maska" operator="in"/>
  </filter>
</defs></svg>

<div id="nakladka" class="clip" data-start="START" data-duration="DLUGOSC" data-layout-allow-overflow>
  <div id="przyciemnienie"></div>
  <div id="soczewka">
    <div id="lista-wejscie">
      <img id="lista" src="assets/lista-alfa.png" alt="">
      <div id="wiersz-blysk"></div>
      <svg id="kontur" viewBox="0 0 1080 1920"><path id="kontur-p" d="…odręczny, lekko krzywy prostokąt wokół wiersza…"/></svg>
      <!-- 2–3 gwiazdki ✦ jako SVG przy rogach konturu -->
      <div id="tap"></div>
    </div>
  </div>
</div>
```
```css
#przyciemnienie { position: absolute; inset: 0; background: #000; opacity: 0; }
#soczewka { position: absolute; inset: 0; filter: url(#rybie-oko); }
#lista-wejscie { position: absolute; inset: 0; }
#lista { position: absolute; left: 0; top: 0; width: 1080px; display: block; }
#kontur { position: absolute; left: 0; top: 0; width: 1080px; height: 1920px; overflow: visible; }
#kontur path { fill: none; stroke: #fff; stroke-width: 7; stroke-linecap: round; stroke-linejoin: round; }
#wiersz-blysk { position: absolute; left: 0; width: 1080px; height: 162px; background: #fff; opacity: 0; } /* top: na wierszu */
#tap { position: absolute; width: 160px; height: 160px; border-radius: 50%; background: rgba(255,255,255,.6); opacity: 0; }
```
```js
const IN = { immediateRender: false };
// lista trochę węższa niż kadr: po wybrzuszeniu okładki i krzyżyki nie uciekają za krawędź
gsap.set("#lista-wejscie", { scale: 0.9, transformOrigin: "540px 960px" });
tl.fromTo("#przyciemnienie", { opacity: 0 }, { opacity: 0.32, duration: 0.25, ease: "power2.out", ...IN }, START);
tl.fromTo("#lista-wejscie", { y: 240, opacity: 0 }, { y: 0, opacity: 1, duration: 0.3, ease: "power3.out", ...IN }, START);
przewijanie.forEach(([t, y]) => tl.set("#lista", { y }, t)); // pozycja w każdej klatce (krok 4)

// „O, jest!”: kontur się rysuje, gwiazdki wyskakują
const p = document.querySelector("#kontur-p"), dl = p.getTotalLength();
gsap.set(p, { strokeDasharray: dl, strokeDashoffset: dl });
tl.to(p, { strokeDashoffset: 0, duration: 0.34, ease: "power2.out" }, CZAS_O);

// „uruchamiam”: stuknięcie w wiersz
tl.fromTo("#wiersz-blysk", { opacity: 0 }, { opacity: 0.22, duration: 0.06, yoyo: true, repeat: 1, ...IN }, CZAS_TAP);
tl.fromTo("#tap", { scale: 0.2, opacity: 0.85 }, { scale: 1.6, opacity: 0, duration: 0.38, ease: "power2.out", ...IN }, CZAS_TAP);

// „lecimy”: lista odlatuje do widza, wideo wraca do pełnej jasności
tl.to("#soczewka", { scale: 1.45, opacity: 0, duration: 0.36, ease: "power2.in", transformOrigin: "50% 55%" }, CZAS_ODLOT);
tl.to("#przyciemnienie", { opacity: 0, duration: 0.3, ease: "power2.out" }, CZAS_ODLOT);
```

## Zasady

- Filtr rybiego oka (SVG `feDisplacementMap`) działa w podglądach i w renderze HyperFrames (sprawdzone 2026-11-02). Maskę daje `feComposite` w tym samym filtrze. Nie używaj CSS `mask-image`, bo w renderze znika.
- Przyciemnienie 0,25–0,35 tylko na czas listy. Poza efektem wideo wraca do pełnej jasności.
- Błyskawiczne przybliżenia na „O, jest!” i „lecimy” dawaj na nagraniu, nie na liście. Lista stoi w miejscu jak soczewka, osoba się zbliża.
- Napisy w tej scenie na dole (Y od 1290), poniżej maski. Nigdy tekst na tekście.
- Dźwięki: whoosh na wejściu listy, pop przy konturze, click przy stuknięciu, sparkle przy odlocie.
- Kolejność rolki, która dobrze działa: nagranie na sucho z etykietą „● NAGRANIE”, potem praca przy komputerze, potem ten sam fragment z efektem i etykietą „GOTOWY EFEKT”.
