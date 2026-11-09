> ⚠️ **Sprawdzenie twarzy:** lista stoi pod brodą, górna krawędź co najmniej `broda + 40`, prawa krawędź najwyżej X 900. Patrz: sekcja **„Twarz — reguła nadrzędna”** w `studio/skills/montaz/SKILL.md`.

# Efekt: Lista, na której jesteś

**Co robi:** pod brodą wysuwa się biała karta i kolejno wskakują wiersze z zielonymi ptaszkami: „osoba z listy”, „osoba
z listy”, a na końcu „Ty” w kolorze akcentu.

**Kiedy:** „tylko osoby z listy dostaną…”, zapisy na listę oczekujących, premiera, „dołącz do listy”.

**Czego potrzeba:** nic poza nagraniem.

## Kod

```html
<div id="li" class="karta clip" data-start="T" data-duration="D">
  <div class="w" id="lw0"><i>✓</i>osoba z listy</div>
  <div class="w" id="lw1"><i>✓</i>osoba z listy</div>
  <div class="w ty" id="lw2"><i>✓</i>Ty</div>
</div>
```
```css
.karta { position: absolute; background: #fff; border-radius: 28px; box-shadow: 0 18px 44px rgba(0,0,0,.3); box-sizing: border-box; font-family: Nunito, sans-serif; font-weight: 800; color: #1C1C1E; }
#li { left: 360px; top: 1110px; width: 540px; padding: 14px 26px; font-size: 38px; }   /* top = broda + 40 */
#li .w { display: flex; align-items: center; gap: 14px; height: 56px; }
#li .w i { display: flex; width: 40px; height: 40px; border-radius: 50%; background: #34C759; color: #fff; font-style: normal; font-size: 26px; align-items: center; justify-content: center; flex: none; }
#li .w.ty { color: #6C4BEF; }
```
```js
const IR = { immediateRender: false };
gsap.set(["#li", "#lw0", "#lw1", "#lw2"], { opacity: 0 });
tl.fromTo("#li", { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.18, ease: "power3.out", ...IR }, T);
[["#lw0", T + 0.1], ["#lw1", T + 0.35], ["#lw2", T + 0.65]].forEach(([s, t]) =>
  tl.fromTo(s, { opacity: 0, x: -20 }, { opacity: 1, x: 0, duration: 0.14, ease: "power3.out", ...IR }, t));
```

## Zasady

- Bez prawdziwych imion i nazwisk: tylko „osoba z listy”. Ostatni wiersz zawsze „Ty”.
- Karta zostaje co najmniej do końca zdania; gdy zaraz potem wchodzą nagrody („bonusy”, „zniżki”), karta znika na cięciu.
- Dźwięk: soft-click na wiersze.

## Wspólne zasady

- Kolory, czcionki i płótno ze stylu kursantki (`moj-brand.json`, `moj-styl.json`); kolory podane niżej to tylko przykład.
- Stany początkowe ustawiaj `gsap.set(...)` poza osią czasu, a wejścia `fromTo` z `immediateRender: false`. Inaczej element
  stoi przez klatkę na miejscu końcowym, zanim wjedzie (`rules/pulapki.md`).
- Element wchodzi na słowie, którego dotyczy (czasy z `slowa.json`), i trwa co najmniej do końca zdania.
- Treść tylko prawdziwa: liczby, nazwy i materiały z nagrania albo od kursantki, bez zmyślonych kwot i dowodów.
- Dźwięki z jej wyboru, ciszej niż głos, bez ping.
