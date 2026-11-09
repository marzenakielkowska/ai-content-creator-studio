> ⚠️ **Sprawdzenie twarzy:** kroki stoją nad głową (kadr z głową niżej) albo pod brodą, numery obok kart, nic nie wchodzi na twarz. Patrz: sekcja **„Twarz — reguła nadrzędna”** w `studio/skills/montaz/SKILL.md`.

# Efekt: Kroki w akcji

**Co robi:** każdy krok dostaje duży numer w kółku i pokazuje samą czynność: kursor wjeżdża i klika ikonę, przycisk
„Zainstaluj” zamienia się w zielone „Gotowe”, pytanie z programu dostaje odpowiedź w fioletowej pigułce. Za osobą jasne
płótno, a kadr jest opuszczony, żeby nad głową było miejsce.

**Kiedy:** kursantka mówi, co po kolei zrobić: „wejdź do…”, „zainstaluj…”, „odpowiedz na pytania”. 2–4 kroki.

**Czego potrzeba:** wycięcie z tła na to ujęcie (płótno za osobą), ikona programu od kursantki (bez niej ogólna ikona),
nazwy przycisków i pytań z nagrania albo z prawdziwego programu.

## Kod

```html
<!-- krok 1: ikona i kursor -->
<div id="k1" class="clip" data-start="T1" data-duration="D1">
  <div class="nr" style="left:356px;top:340px">1</div>
  <div class="ik" id="k1i" style="left:456px;top:300px;width:168px;height:168px"><img src="assets/ikona.png" alt=""></div>
  <svg id="k1k" class="kur" style="left:600px;top:420px" viewBox="0 0 24 24"><path d="M4 2l15 11-7 1 4 8-3 1-4-8-5 5z" fill="#fff" stroke="#15315E" stroke-width="1.6" stroke-linejoin="round"/></svg>
</div>
<!-- krok 2: przycisk, który zmienia się w „Gotowe” -->
<div id="k2" class="clip" data-start="T2" data-duration="D2">
  <div class="nr" style="left:62px;top:336px">2</div>
  <div class="karta" id="k2c"><img src="assets/ikona.png" alt=""><div class="n">Nazwa programu<small>krótki opis</small></div>
    <div id="k2b">Zainstaluj<div id="k2z">✓ Gotowe</div></div></div>
</div>
<!-- krok 3: pytanie i odpowiedź -->
<div id="k3" class="clip" data-start="T3" data-duration="D3">
  <div class="nr" style="left:40px;top:320px">3</div>
  <div class="karta bq" id="q1" style="top:306px"><img src="assets/ikona.png" alt="">Pytanie z programu?</div>
  <div class="ba" id="a1" style="left:790px;top:312px">Odpowiedź</div>
</div>
```
```css
.nr { position: absolute; width: 70px; height: 70px; border-radius: 50%; background: #FFD23F; border: 4px solid #15315E; box-sizing: border-box; display: flex; align-items: center; justify-content: center; font: 800 40px Nunito, sans-serif; color: #15315E; }
.ik { position: absolute; border-radius: 24%; overflow: hidden; box-shadow: 0 10px 26px rgba(0,0,0,.35); background: #fff; } .ik img { width: 100%; height: 100%; object-fit: cover; }
.kur { position: absolute; width: 60px; height: 60px; filter: drop-shadow(0 6px 10px rgba(0,0,0,.45)); }
#k2c { left: 120px; top: 312px; width: 840px; height: 116px; display: flex; align-items: center; gap: 18px; padding: 0 20px 0 18px; font-size: 34px; }
#k2c img { width: 76px; height: 76px; border-radius: 18px; } #k2c .n { flex: 1; line-height: 1.05; white-space: nowrap; }
#k2c small { display: block; font-size: 25px; color: #6B6B73; font-weight: 700; }
#k2b { position: relative; width: 230px; height: 66px; border-radius: 33px; background: #6C4BEF; color: #fff; font-size: 28px; display: flex; align-items: center; justify-content: center; overflow: hidden; }
#k2z { position: absolute; inset: 0; background: #34C759; display: flex; align-items: center; justify-content: center; font-size: 27px; }
.bq { left: 120px; height: 84px; display: flex; align-items: center; gap: 14px; padding: 0 28px 0 16px; border-radius: 42px; font-size: 34px; white-space: nowrap; }
.bq img { width: 56px; height: 56px; border-radius: 14px; }
.ba { position: absolute; height: 72px; border-radius: 36px; background: #6C4BEF; color: #fff; font: 800 32px Nunito, sans-serif; display: flex; align-items: center; padding: 0 26px; white-space: nowrap; }
```
```js
const IR = { immediateRender: false };
const wejdz = (s, t, od) => { gsap.set(s, { opacity: 0 }); tl.fromTo(s, { opacity: 0, ...od }, { opacity: 1, scale: 1, x: 0, y: 0, duration: 0.22, ease: "back.out(2)", ...IR }, t); };
wejdz("#k1 .nr", T1 + 0.05, { scale: 0.4 }); wejdz("#k1i", T1, { scale: 0.5 });
gsap.set("#k1k", { opacity: 0, x: 300, y: 160 }); tl.set("#k1k", { opacity: 1 }, KLIK - 0.45);
tl.fromTo("#k1k", { x: 300, y: 160 }, { x: 0, y: 0, duration: 0.42, ease: "power2.inOut", ...IR }, KLIK - 0.45);
tl.to("#k1i", { scale: 0.88, duration: 0.07, yoyo: true, repeat: 1 }, KLIK);
wejdz("#k2 .nr", T2 + 0.04, { scale: 0.4 }); wejdz("#k2c", T2, { y: -50, scale: 0.96 });
gsap.set("#k2z", { xPercent: -100 }); tl.to("#k2z", { xPercent: 0, duration: 0.3, ease: "power2.inOut" }, GOTOWE);
wejdz("#k3 .nr", T3 + 0.04, { scale: 0.4 }); wejdz("#q1", PYTANIE, { x: -60, scale: 0.92 }); wejdz("#a1", ODPOWIEDZ, { scale: 0.5 });
```

## Zasady

- Na czas kroków kadr idzie w dół (`y` około +110 przy kadrze szerokim), żeby karty stały nad głową od Y 300. Przy
  kroku z jedną małą rzeczą kadr może się przybliżyć: wtedy tylko numer i ikona.
- Jeden krok na ekranie naraz, każdy na swoim słowie. Numer zawsze obok elementu, nigdy na nim.
- Przyciski i pytania tylko takie, jakie naprawdę są w programie albo padły w nagraniu.
- Dźwięki: click na kliknięcie, soft-click na „Gotowe” i odpowiedzi, short-whoosh przy zmianie kroku.

## Wspólne zasady

- Kolory, czcionki i płótno ze stylu kursantki (`moj-brand.json`, `moj-styl.json`); kolory podane niżej to tylko przykład.
- Stany początkowe ustawiaj `gsap.set(...)` poza osią czasu, a wejścia `fromTo` z `immediateRender: false`. Inaczej element
  stoi przez klatkę na miejscu końcowym, zanim wjedzie (`rules/pulapki.md`).
- Element wchodzi na słowie, którego dotyczy (czasy z `slowa.json`), i trwa co najmniej do końca zdania.
- Treść tylko prawdziwa: liczby, nazwy i materiały z nagrania albo od kursantki, bez zmyślonych kwot i dowodów.
- Dźwięki z jej wyboru, ciszej niż głos, bez ping.
