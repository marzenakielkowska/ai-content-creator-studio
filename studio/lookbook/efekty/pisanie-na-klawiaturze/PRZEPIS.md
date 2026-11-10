> ⚠️ **Sprawdzenie twarzy:** klawiatura pod brodą, górna krawędź co najmniej `broda + 40`; nic nie wchodzi na usta. Patrz: sekcja **„Twarz — reguła nadrzędna”** w `studio/skills/montaz/SKILL.md`.

# Efekt: Pisanie na klawiaturze

**Co robi:** pod brodą wysuwa się karta z polem wiadomości, paskiem podpowiedzi i klawiaturą telefonu. Pierwsze słowa
polecenia wpisują się litera po literze, a nad każdym klawiszem wyskakuje powiększona litera. Kolejne słowa podpowiada
pasek nad klawiaturą: środkowa podpowiedź to słowo, które kursantka zaraz powie. W chwili, gdy je mówi, obwódka obejmuje
podpowiedź, a słowo wskakuje do pola w kolorze akcentu. Na końcu przycisk wysyłania zmienia kolor i się wciska, tekst
odlatuje w górę, a klawiatura zjeżdża w dół.

**Kiedy:** kursantka mówi polecenie albo wiadomość, którą się komuś wysyła: programowi, AI, urzędowi, klientce. Na
przykład „zmontuj moje surowe nagrania wideo”, „wyślij wniosek o alimenty”, „napisz do mnie”.

**Czego potrzeba:** nic poza nagraniem. Czasy słów ze `slowa.json`.

## Słowa kursantki

- Polecenie to jej zdanie z nagrania. Pierwsze 1–2 słowa piszą się literami: zaczynają się na pierwszym słowie i kończą
  przed następnym. Każde kolejne słowo pasek podpowiada i wybiera dokładnie w chwili, gdy ona je mówi.
- Dwie boczne podpowiedzi to inne słowa, które pasują do tematu (przy „wniosek” na przykład „pismo” i „pozew”), nigdy
  przypadkowe.
- Litera z ogonkiem wyskakuje nad klawiszem bez ogonka (ś nad s, ą nad a).
- Słowa z filmu podglądowego to tylko przykład. W planie montażu pokaż kursantce polecenie tak, jak się wpisze (literówki
  z transkrypcji popraw), i zapytaj, czy pasuje.

## Kod

```html
<div id="kb-o" class="clip" data-start="T" data-duration="D" style="position:absolute;inset:0">
  <div class="karta" id="kb" style="left:60px;top:1070px;width:840px;height:400px">   <!-- top = broda + 40 -->
    <div id="kb-pole"><span id="kb-t">
      <!-- litery: <span class="kb-z" id="kz0">Z</span><span class="kb-z" id="kz1">m</span>… (spacja = &nbsp;) -->
      <!-- słowa z podpowiedzi: <span class="kb-z kb-pw" id="kw0">surowe&nbsp;</span>… -->
      <i id="kb-kur"></i></span></div>
    <div id="kb-wy"><svg viewBox="0 0 24 24" width="34" height="34"><path d="M12 19V5M5 12l7-7 7 7" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg></div>
    <div id="kb-ps">
      <!-- zestawy podpowiedzi: <div class="kb-p" id="kp0"><span>Cześć</span><span>Zmontuj</span><span>Dzięki</span></div>… -->
      <i id="kb-kolo"></i></div>
    <!-- klawisze .kk: rzędy qwertyuiop / asdfghjkl / zxcvbnm co 81,3 px, x od 16 / 57,7 / 139, y 146 / 206 / 266;
         ⇧ (16, 266) i ⌫ (724, 266) po 100 px; dolny rząd y 326: 123 (16, 110 px), spacja #kb-sp (134, 572 px), ↵ (714, 110 px) -->
    <!-- bąbelek nad klawiszem każdej litery (id = numer znaku w TEKST): <i class="kb-b" id="kb0" style="left:{x − 3}px;top:{y − 74}px">Z</i> -->
  </div>
</div>
```
```css
.karta { position: absolute; background: #fff; border-radius: 28px; box-shadow: 0 18px 44px rgba(0,0,0,.32); box-sizing: border-box; font-family: Nunito, sans-serif; font-weight: 800; color: #1C1C1E; }
#kb { background: #F1EFF7; overflow: visible; }
#kb-pole { position: absolute; left: 16px; top: 16px; width: 728px; height: 64px; border-radius: 32px; background: #fff; display: flex; align-items: center; padding-left: 24px; font-size: 32px; color: #1C1C1E; white-space: nowrap; overflow: hidden; }
#kb-t { display: flex; align-items: center; }
.kb-z { display: none; } .kb-pw { color: #6C4BEF; }
#kb-kur { display: block; width: 3px; height: 36px; background: #6C4BEF; margin-left: 2px; }
#kb-wy { position: absolute; left: 760px; top: 16px; width: 64px; height: 64px; border-radius: 50%; background: #CFCBDB; display: flex; align-items: center; justify-content: center; }
#kb-ps { position: absolute; left: 16px; top: 88px; width: 808px; height: 50px; }
.kb-p { position: absolute; inset: 0; display: flex; opacity: 0; }
.kb-p span { flex: 1; display: flex; align-items: center; justify-content: center; font-size: 30px; color: #3A3A44; border-right: 2px solid #D9D6E2; }
.kb-p span:last-child { border-right: 0; } .kb-p span:nth-child(2) { color: #1C1C1E; }
#kb-kolo { position: absolute; left: 309px; top: -4px; width: 190px; height: 58px; border-radius: 29px; border: 4px solid #6C4BEF; box-sizing: border-box; opacity: 0; }
.kk { position: absolute; width: 74px; height: 52px; border-radius: 12px; background: #fff; box-shadow: 0 2px 0 #C9C5D6; display: flex; align-items: center; justify-content: center; font: 800 30px Nunito, sans-serif; color: #1C1C1E; font-style: normal; }
.kk.sz { background: #DCD8E6; font-size: 28px; }
.kb-b { position: absolute; width: 80px; height: 120px; border-radius: 16px; background: #fff; box-shadow: 0 10px 24px rgba(0,0,0,.28); display: flex; align-items: flex-start; justify-content: center; padding-top: 10px; box-sizing: border-box; font: 800 48px Nunito, sans-serif; color: #1C1C1E; font-style: normal; opacity: 0; }
```
```js
// TEKST = słowa pisane literami, T_PISZ = czas pierwszego z nich, KROK = 0,06 s na literę.
// WYBORY = czasy kolejnych słów (wybieranych z paska). PODP = czasy zmian zestawów: pierwszy od T, następny 0,02 s po
// ostatniej literze każdego pisanego słowa i 0,08 s po każdym wybranym; środkowe słowo zestawu = słowo, które zaraz padnie.
// WYSLIJ ≈ 0,3 s po ostatnim słowie polecenia.
const TEKST = "Zmontuj moje ", T_PISZ = 41.3, KROK = 0.06;
gsap.set("#kb", { y: 900 });
tl.to("#kb", { y: 0, duration: 0.3, ease: "power3.out" }, T + 0.08);
[...TEKST].forEach((c, i) => {
  const t = T_PISZ + i * KROK;
  tl.set("#kz" + i, { display: "inline" }, t);
  if (c === " ") { tl.set("#kb-sp", { background: "#DCD8E6" }, t); tl.set("#kb-sp", { background: "#fff" }, t + 0.06); }
  else { tl.set("#kb" + i, { opacity: 1 }, t); tl.set("#kb" + i, { opacity: 0 }, t + 0.055); }
});
PODP.forEach((t, j) => {
  tl.set("#kp" + j, { opacity: 1 }, t);
  if (j + 1 < PODP.length) tl.set("#kp" + j, { opacity: 0 }, PODP[j + 1]);
});
WYBORY.forEach((t, j) => {
  tl.fromTo("#kb-kolo", { opacity: 0, scale: 0.7 }, { opacity: 1, scale: 1, duration: 0.1, ease: "back.out(3)", immediateRender: false }, t - 0.1);
  tl.set("#kb-kolo", { opacity: 0 }, t + 0.08);
  tl.set("#kw" + j, { display: "inline" }, t);
});
tl.set("#kb-wy", { background: "#6C4BEF" }, WYSLIJ - 0.1);
tl.to("#kb-wy", { scale: 0.86, duration: 0.07, yoyo: true, repeat: 1 }, WYSLIJ);
tl.to("#kb-t", { y: -70, opacity: 0, duration: 0.16, ease: "power2.in" }, WYSLIJ + 0.08);
tl.to("#kb", { y: 900, duration: 0.26, ease: "power3.in" }, WYSLIJ + 0.3);
```

## Zasady

- Karta pod brodą, w kadrze szerokim: górna krawędź co najmniej `broda + 40`, od X 60 do 900 (kolumna ikon zostaje wolna).
  Napisy w tym czasie milkną: polecenie i tak widać na ekranie.
- Stan początkowy `y: 900`: karta razem z cieniem całkiem pod kadrem.
- Litery co 0,06 s, nie szybciej. W polu najwyżej około 30 znaków; przy dłuższym poleceniu mniejsza czcionka pola (28 px).
- Dźwięki: short-whoosh na wejście, typing pod literami (0,8 s), soft-click na każde wybrane słowo, click na wysłanie,
  short-whoosh na zjazd.

## Wspólne zasady

- Kolory, czcionki i płótno ze stylu kursantki (`moj-brand.json`, `moj-styl.json`); kolory podane niżej to tylko przykład.
- Stany początkowe ustawiaj `gsap.set(...)` poza osią czasu, a wejścia `fromTo` z `immediateRender: false`. Inaczej element
  stoi przez klatkę na miejscu końcowym, zanim wjedzie (`rules/pulapki.md`).
- Element wchodzi na słowie, którego dotyczy (czasy z `slowa.json`), i trwa co najmniej do końca zdania.
- Treść tylko prawdziwa: liczby, nazwy i materiały z nagrania albo od kursantki, bez zmyślonych kwot i dowodów.
- Dźwięki z jej wyboru, ciszej niż głos, bez ping.
