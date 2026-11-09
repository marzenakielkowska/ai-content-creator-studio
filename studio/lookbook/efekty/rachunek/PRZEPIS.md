> ⚠️ **Sprawdzenie twarzy:** rachunek stoi pod brodą, górna krawędź co najmniej `broda + 40`, nic nie wchodzi na usta. Patrz: sekcja **„Twarz — reguła nadrzędna”** w `studio/skills/montaz/SKILL.md`.

# Efekt: Rachunek

**Co robi:** pod brodą wysuwa się biały rachunek. Pozycje wchodzą po kolei na słowach, każda z kropkami i znakiem
zapytania po prawej. Ostatni wiersz, „Razem”, jest czerwony i dostaje słowo, które pada w nagraniu („majątek”, „za dużo”).

**Kiedy:** „ile by to kosztowało”, „co tracisz”, „delegowanie kosztowałoby…”, czas i pieniądze. Pozycje to rzeczy, które
kursantka wymienia albo które wynikają z jej zdania (np. „Twój czas na ręczny montaż”, „stracone okazje”, „czas z dziećmi”).

**Czego potrzeba:** nic poza nagraniem.

## Kod

```html
<div id="fa" class="karta clip" data-start="T" data-duration="D">
  <div class="w" id="fw0">Montaż, napisy, efekty<u></u>?</div>
  <div class="w" id="fw1">Twój czas na ręczny montaż<u></u>?</div>
  <div class="w" id="fw2">Stracone okazje<u></u>?</div>
  <div class="w raz" id="fw3">Razem<u></u>majątek</div>
</div>
```
```css
.karta { position: absolute; background: #fff; border-radius: 28px; box-shadow: 0 18px 44px rgba(0,0,0,.3); box-sizing: border-box; font-family: Nunito, sans-serif; font-weight: 800; color: #1C1C1E; }
#fa { left: 150px; top: 1072px; width: 750px; padding: 12px 30px; font-size: 36px; }   /* top = broda + 40 */
#fa .w { display: flex; justify-content: space-between; height: 46px; align-items: center; white-space: nowrap; }
#fa .w u { flex: 1; border-bottom: 4px dotted #C7C7CC; margin: 0 14px; height: 24px; text-decoration: none; }
#fa .raz { color: #E5484D; }
```
```js
const IR = { immediateRender: false };
gsap.set(["#fa", "#fw0", "#fw1", "#fw2", "#fw3"], { opacity: 0 });
tl.fromTo("#fa", { opacity: 0, y: 60 }, { opacity: 1, y: 0, duration: 0.16, ease: "power3.out", ...IR }, T);
[["#fw0", T1], ["#fw1", T2], ["#fw2", T3], ["#fw3", T_RAZEM]].forEach(([s, t]) =>
  tl.fromTo(s, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.14, ease: "power3.out", ...IR }, t));
```

## Zasady

- **Bez wymyślonych kwot.** Po prawej „?”, chyba że kwota padła w nagraniu. W „Razem” słowo z nagrania.
- Najwyżej 5 wierszy po około 28 znaków. Prawa krawędź najwyżej X 900 (kolumna ikon), dolna nad pasem napisów
  albo napisy w tym czasie milkną.
- Rachunek zostaje do końca ujęcia; przybliżenie na słowie podsumowania nie może przesunąć brody na kartę.
- Dźwięki: soft-click na każdy wiersz, pop na „Razem”.

## Wspólne zasady

- Kolory, czcionki i płótno ze stylu kursantki (`moj-brand.json`, `moj-styl.json`); kolory podane niżej to tylko przykład.
- Stany początkowe ustawiaj `gsap.set(...)` poza osią czasu, a wejścia `fromTo` z `immediateRender: false`. Inaczej element
  stoi przez klatkę na miejscu końcowym, zanim wjedzie (`rules/pulapki.md`).
- Element wchodzi na słowie, którego dotyczy (czasy z `slowa.json`), i trwa co najmniej do końca zdania.
- Treść tylko prawdziwa: liczby, nazwy i materiały z nagrania albo od kursantki, bez zmyślonych kwot i dowodów.
- Dźwięki z jej wyboru, ciszej niż głos, bez ping.
