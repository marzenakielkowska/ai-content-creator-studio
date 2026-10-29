> ⚠️ **Sprawdzenie twarzy:** żaden element tego efektu nie może nachodzić na strefę twarzy (Y:250–1400px × X:200–880px przy 1080×1920), chyba że przepis mówi inaczej. Patrz: sekcja **"Twarz — reguła nadrzędna"** w `studio/skills/montaz/SKILL.md`.

# Efekt: Lista komend

**Co robi:** pod brodą wjeżdża biała karta z nagłówkiem „Komendy” i 2–4 komendami (np. `/start`, `/lookbook`, `/edytuj wideo`). Komendy wskakują po kolei z lewej (co 0,1 s), potem jasne podświetlenie przesuwa się z jednej na drugą w rytm mówienia (z cichym kliknięciem przy każdej). Dobrze łączy się z „Światem interfejsu”: u góry pasek z wpisywaną prośbą, pod brodą lista komend.

**Treść:** komendy bierz z tego, co kursantka mówi lub pokazuje. Nie wymyślaj nazw programów — pisz ogólnie albo tak, jak w nagraniu.

## Kod

```html
<div id="komendy">
  <small>Komendy</small>
  <div class="kmd-tlo" id="kmd-tlo"></div>
  <div class="kmd" id="kmd-1"><i>/</i>start</div>
  <div class="kmd" id="kmd-2"><i>/</i>lookbook</div>
  <div class="kmd" id="kmd-3"><i>/</i>edytuj wideo</div>
</div>
```
```css
#komendy { position: absolute; left: 70px; top: 1100px; width: 830px; height: 340px; border-radius: 30px; background: #fff;
  border: 2px solid #DEDBD3; box-shadow: 0 12px 40px rgba(0,0,0,.14); padding: 22px 26px; box-sizing: border-box; }
#komendy small { display: block; font-size: 28px; font-weight: 700; color: #8a877f; margin: 0 0 10px 14px; }
.kmd { position: relative; height: 80px; border-radius: 20px; display: flex; align-items: center; gap: 18px; padding: 0 18px; font-size: 42px; font-weight: 900; }
.kmd i { font-style: normal; width: 52px; height: 52px; border-radius: 14px; background: #D97757; color: #fff; display: grid; place-items: center; font-size: 34px; }
.kmd-tlo { position: absolute; left: 26px; right: 26px; top: 72px; height: 80px; border-radius: 20px; background: #F3EEE6; }
```
```js
tl.fromTo("#komendy", { y: 900 }, { y: 0, duration: 0.22, ease: "back.out(1.4)", immediateRender: false }, T);
tl.fromTo(".kmd", { opacity: 0, x: -30 }, { opacity: 1, x: 0, duration: 0.14, stagger: 0.1, ease: "back.out(2)", immediateRender: false }, T + 0.12);
gsap.set("#kmd-tlo", { opacity: 0 });
tl.to("#kmd-tlo", { opacity: 1, duration: 0.08 }, T + 0.55);
tl.to("#kmd-tlo", { y: 80, duration: 0.14, ease: "power2.out" }, T + 1.45);
tl.to("#kmd-tlo", { y: 160, duration: 0.14, ease: "power2.out" }, T + 2.35);
tl.to("#komendy", { y: 900, duration: 0.16, ease: "power3.in" }, KONIEC - 0.2);
```
Ukryta karta musi być całkiem poza kadrem (`y: 900`), inaczej jej góra wystaje na dole. Gdy karta jest pod brodą, ukryj w tym czasie napisy.
