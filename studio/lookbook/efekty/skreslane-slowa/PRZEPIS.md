> ⚠️ **Sprawdzenie twarzy:** pigułki pod brodą, górna krawędź co najmniej `broda + 40`; nic nie wchodzi na usta. Patrz: sekcja **„Twarz — reguła nadrzędna”** w `studio/skills/montaz/SKILL.md`.

# Efekt: Skreślane słowa

**Co robi:** każde słowo z wyliczanki kursantki wskakuje pod brodą jako biała pigułka, w chwili, gdy je mówi. Pigułki
układają się schodkami, po trzy w rzędzie, dwa rzędy. Na zdaniu, które je odrzuca („nic nie mówię”, „tego już nie
robię”), wszystkie naraz dostają czerwoną kreskę, jedna po drugiej co 0,05 s, z whooshem. Pół sekundy później znikają
w dół.

**Kiedy:** wyliczanka 3–6 rzeczy, których kursantka już nie robi albo widz nie musi robić, a zaraz potem zdanie, które
je odrzuca. Na przykład „przesuń, odsuń, dodaj, popraw, wytnij… nic nie mówię”, „żadnych diet, liczenia kalorii,
głodówek”. Gdy nagranie nie ma takiej wyliczanki, efekt nie pasuje: dobierz inny.

**Czego potrzeba:** nic poza nagraniem.

## Słowa kursantki

- Pigułki to dokładnie jej słowa z nagrania, w tej kolejności. Każda wchodzi 0,05 s przed swoim słowem.
- Kreska na pierwszym słowie zdania, które odrzuca listę.
- Najwyżej 6 słów; dłuższe słowo (ponad 10 liter) dostaje rozmiar 44 px zamiast 52 px.
- Słowa z filmu podglądowego to tylko przykład. W planie montażu pokaż kursantce słowa i zdanie ze skreśleniem.

## Kod

```html
<div id="ss" class="clip" data-start="T" data-duration="D" style="position:absolute;left:90px;top:860px;width:900px;height:360px">
  <!-- left: 40 / 330 / 620 w rzędzie, top: 40 / 200; jedna pigułka na słowo -->
  <div class="pig" id="ss0" style="left:40px;top:40px">przesuń<i id="ssx0" class="kr"></i></div>
  <div class="pig" id="ss1" style="left:330px;top:40px">odsuń<i id="ssx1" class="kr"></i></div>
  <div class="pig" id="ss2" style="left:620px;top:40px">dodaj<i id="ssx2" class="kr"></i></div>
</div>
```
```css
.pig { position: absolute; height: 110px; padding: 0 34px; border-radius: 55px; display: flex; align-items: center; font-family: Figtree, sans-serif; font-weight: 800; font-size: 52px; white-space: nowrap; box-shadow: 0 14px 34px rgba(8,4,40,.45); background: #fff; color: #1D1B2A; }
.pig .kr { position: absolute; left: 18px; right: 18px; top: 50px; height: 10px; border-radius: 5px; background: #FF3B30; }
```
```js
// T_n = słowo n z wyliczanki, T_NIE = pierwsze słowo zdania, które odrzuca listę (z slowa.json)
const SS = ["#ss0", "#ss1", "#ss2"], TS = [T_0, T_1, T_2];
SS.forEach((s, n) => {
  gsap.set(s, { opacity: 0.001, y: 46, scale: 0.9 });
  tl.to(s, { opacity: 1, y: 0, scale: 1, duration: 0.26, ease: "back.out(1.7)" }, TS[n] - 0.05);
  gsap.set(`#ssx${n}`, { scaleX: 0, transformOrigin: "0 50%" });
  tl.to(`#ssx${n}`, { scaleX: 1, duration: 0.18, ease: "power2.out" }, T_NIE + n * 0.05);
});
tl.to(SS, { opacity: 0, y: 40, duration: 0.2, stagger: 0.04 }, T_NIE + 0.6);
```

Dźwięk: cichy `pop` przy każdej pigułce (`data-volume` 0,06), `whoosh` przy skreśleniu (0,09).
