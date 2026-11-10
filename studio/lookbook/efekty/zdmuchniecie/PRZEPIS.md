> ⚠️ **Sprawdzenie twarzy:** przed rozsypaniem twarz bez zmian (bez filtra i przyciemnienia), rozsypuje się na samym końcu. Patrz: sekcja **„Twarz — reguła nadrzędna”** w `studio/skills/montaz/SKILL.md`.

# Efekt: Zdmuchnięcie

**Co robi:** na cięciu za osobą z góry zjeżdża płótno w kolorze marki (z delikatnymi kropkami), a osoba stoi przed nim
wycięta z tła. Po ostatnim słowie obraz zatrzymuje się na jednej klatce i osoba rozsypuje się w drobny pył: od dołu
z lewej, kawałek po kawałku. Ziarenka odlatują w prawo i w górę, maleją i gasną, a głowa znika ostatnia. Zostaje samo
płótno.

**Kiedy:** koniec rolki: po ostatnim zdaniu albo po wezwaniu do działania, na „znikam”, „i po problemie”, „pa!”. Raz
w rolce, zawsze jako ostatni efekt.

**Czego potrzeba:** wycięcie z tła ostatniego ujęcia (`czysc-tlo <projekt> <nazwa> <od> <do>`; pierwsze wycięcie wymaga
zgody na pobranie narzędzia, krok 4 montażu) i stopklatka z tego wycięcia jako PNG z przezroczystością (polecenie niżej).

## Po ostatnim słowie

Rozsypanie zaczyna się po ostatnim słowie, a nie w trakcie mówienia. Gdy nagranie kończy się tuż po nim, dołóż na końcu
rolki około 1,5 s: płótno stoi dalej, nagranie już się skończyło, a stopklatka rozsypuje się w ciszy (zostają tylko
dźwięki pyłu). W filmie podglądowym autorka kursu rozsypuje się jeszcze w trakcie ostatnich słów, bo jej nagranie nie
miało ciszy na końcu.

## Wariant bez płótna (pusty pokój)

Zamiast płótna za osobą zostaje jej prawdziwy pokój. Potrzebna jest klatka pustego pokoju z tego samego ujęcia:
kursantka na końcu nagrania wychodzi z kadru albo nagrywa 2 s pustego tła, nie ruszając telefonu. Do `T_PYL` nic się nie
zmienia (zwykłe nagranie). Od `T_PYL` pod pyłem leży zdjęcie pustego pokoju (`<img id="zd-pl" src="assets/pusty-pokoj.jpg">`
zamiast płótna, bez zjazdu), z tym samym kadrem co nagranie, a na nim rozsypuje się stopklatka. Bez takiej klatki zrób
wersję z płótnem.

## Stopklatka

```
"<ffmpeg>" -nostdin -y -c:v libvpx-vp9 -ss SEK -i assets/syl/<nazwa>.webm -frames:v 1 assets/zdmuchniecie.png
```

`SEK` = `T_PYL` − początek okna wycięcia (`data-start` z `czysc-tlo`). `-c:v libvpx-vp9` przed `-i` jest konieczne: bez
niego PNG traci przezroczystość. Stopklatka musi być dokładnie z tej chwili, w której znika wycięcie wideo, inaczej obraz
przeskoczy.

## Kod

```html
<!-- warstwy: nagranie (z-index 1) → płótno (2) → wycięcie i pył (3) → reszta grafik (4) -->
<div id="zd-pl" class="clip" data-start="T_PLOTNO" data-duration="D" style="position:absolute;inset:0;z-index:2"></div>
<div id="zd-s" style="position:absolute;inset:0;z-index:3">
  <div id="sylw" style="position:absolute;inset:0;opacity:0">
    <video id="zd-v" class="clip" src="assets/syl/NAZWA.webm" data-start="T_PLOTNO" data-duration="D" data-media-start="T_PLOTNO − początek okna" data-track-index="40" muted playsinline style="position:absolute;left:0;top:0;width:1080px;height:1920px;object-fit:cover"></video>
  </div>
  <canvas id="pyl" width="1080" height="1920" style="position:absolute;inset:0"></canvas>
  <img id="pyl-src" src="assets/zdmuchniecie.png" alt="" style="position:absolute;left:0;top:0;width:1px;height:1px;opacity:0">
</div>
```
```css
#zd-pl { background-color: #6C4BEF; background-image: radial-gradient(rgba(255,255,255,.12) 2.5px, transparent 3px); background-size: 48px 48px; }
```
```js
// T_PLOTNO = cięcie (płótno zjeżdża), T_PYL = koniec ostatniego słowa (chwila stopklatki),
// KONIEC = koniec rolki (T_PYL + 1,1–1,5 s). D = KONIEC − T_PLOTNO.
gsap.set("#zd-pl", { yPercent: -100 });
tl.fromTo("#zd-pl", { yPercent: -100 }, { yPercent: 0, duration: 0.22, ease: "power3.out", immediateRender: false }, T_PLOTNO);
tl.set("#sylw", { opacity: 1 }, T_PLOTNO);
tl.set("#sylw", { opacity: 0 }, T_PYL);
const KR = 4, CW = 1080, CH = 1920, OD = T_PYL - T_PLOTNO;
let czastki = null, src = null;
function przygotuj() {
  if (czastki) return true;
  src = document.getElementById("pyl-src");
  if (!src || !src.complete || !src.naturalWidth) return false;
  const c = document.createElement("canvas"); c.width = CW; c.height = CH;
  const x = c.getContext("2d"); x.drawImage(src, 0, 0);
  const d = x.getImageData(0, 0, CW, CH).data;
  let s = 20261110; const los = () => { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; return s / 4294967296; };
  czastki = [];
  for (let y = 0; y < CH; y += KR) for (let xx = 0; xx < CW; xx += KR) {
    const a = d[((y + KR / 2) * CW + xx + KR / 2) * 4 + 3];
    // [x, y, kiedy rusza, prędkość w bok, prędkość w górę, czas życia]: od dołu z lewej, głowa na końcu
    if (a > 20) czastki.push([xx, y, (xx / CW) * 0.25 + (1 - y / CH) * 0.35 + los() * 0.1, 160 + los() * 340, -90 - los() * 260, 0.3 + los() * 0.15]);
  }
  return true;
}
const g = document.getElementById("pyl").getContext("2d");
function rysuj(t) {
  g.clearRect(0, 0, CW, CH);
  if (t < -1e-6 || !przygotuj()) return;   // przed rozsypaniem pusto (osobę pokazuje wycięcie), także przy przewijaniu wstecz
  for (const [x, y, op, vx, vy, zyc] of czastki) {
    const u = t - op;
    if (u <= 0) { g.globalAlpha = 1; g.drawImage(src, x, y, KR, KR, x, y, KR, KR); continue; }
    const z = u / zyc; if (z >= 1) continue;
    const e = z * z, k = KR * (1 - 0.55 * z);
    g.globalAlpha = 1 - z;
    g.drawImage(src, x, y, KR, KR, x + vx * e, y + vy * e - 40 * z, k, k);
  }
  g.globalAlpha = 1;
}
const pr = { t: 0 };
// jeden tween przez całe okno (od płótna do końca): przy przewijaniu wstecz płótno pyłu się czyści
tl.fromTo(pr, { t: -OD }, { t: KONIEC - T_PYL, duration: KONIEC - T_PLOTNO, ease: "none", immediateRender: false, onUpdate: () => rysuj(pr.t) }, T_PLOTNO);
```

## Zasady

- Płótno to warstwa pod wycięciem, w kolorze z marki. Kadr szeroki (skala 1), żeby pył miał gdzie lecieć; powolny najazd
  tylko taki sam na nagraniu i na `#zd-s`, inaczej wycięcie rozjedzie się z nagraniem.
- Rozsypanie trwa około 1,1 s: od dołu z lewej, głowa na końcu. Ziarenka 4 px, bo większe wyglądają jak klocki.
- Bez korekty koloru na wycięciu i stopklatce: muszą mieć ten sam kolor co nagranie, inaczej osoba zmieni kolor w chwili
  zatrzymania.
- Ostatni efekt rolki, po nim już nic: rolka kończy się na pustym płótnie (albo w pustym pokoju).
- Dźwięki: short-whoosh na płótno, whoosh na start rozsypania, sparkle w połowie.

## Wspólne zasady

- Kolory, czcionki i płótno ze stylu kursantki (`moj-brand.json`, `moj-styl.json`); kolory podane niżej to tylko przykład.
- Stany początkowe ustawiaj `gsap.set(...)` poza osią czasu, a wejścia `fromTo` z `immediateRender: false`. Inaczej element
  stoi przez klatkę na miejscu końcowym, zanim wjedzie (`rules/pulapki.md`).
- Element wchodzi na słowie, którego dotyczy (czasy z `slowa.json`), i trwa co najmniej do końca zdania.
- Treść tylko prawdziwa: liczby, nazwy i materiały z nagrania albo od kursantki, bez zmyślonych kwot i dowodów.
- Dźwięki z jej wyboru, ciszej niż głos, bez ping.
