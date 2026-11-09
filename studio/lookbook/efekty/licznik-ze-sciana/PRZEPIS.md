> ⚠️ **Sprawdzenie twarzy:** liczba nad głową, ściana za osobą (pod wycięciem z tła). Patrz: sekcja **„Twarz — reguła nadrzędna”** w `studio/skills/montaz/SKILL.md`.

# Efekt: Licznik ze ścianą

**Co robi:** na płótnie w kolorze marki nad głową liczy się liczba (od 0 do tej z nagrania, około 1 s), a za osobą
od środka wyrasta ściana kafelków: każdy kafelek wskakuje tym później, im dalej jest od środka. Na słowie „rośnie” albo
na końcu zdania ściana lekko się przybliża, a obok może wskoczyć odręczny dopisek.

**Kiedy:** liczba, która pokazuje dorobek: „54 efekty”, „300 rolek”, „120 klientek”.

**Czego potrzeba:** 40–60 kafelków z materiałów kursantki (klatki z rolek, zdjęcia), wycięcie z tła na to ujęcie.

## Kod

```html
<div id="ls" class="clip" data-start="T" data-duration="D" style="position:absolute;inset:0">
  <div style="position:absolute;inset:0;background:#6C4BEF"></div>
  <div id="ls-sc" style="position:absolute;left:9px;top:480px;width:1062px;height:1500px;transform-origin:50% 30%">
    <!-- 9 × 7: <img id="sc-R-C" class="kaf" src="assets/kNN.jpg" style="left:{C*118}px;top:{R*205}px"> -->
  </div>
  <div style="position:absolute;left:0;top:0;width:1080px;height:476px;background:#6C4BEF"></div>
</div>
<div id="ls-n" class="clip" data-start="T" data-duration="D">+<span id="ls-v">0</span> efektów</div>
```
```css
#ls-sc .kaf { position: absolute; width: 112px; height: 199px; object-fit: cover; border-radius: 12px; border: 3px solid #fff; box-sizing: border-box; box-shadow: 0 14px 30px rgba(0,0,0,.35); }
#ls-n { position: absolute; left: 0; right: 0; top: 302px; text-align: center; font: 800 150px Nunito, sans-serif; line-height: 1; color: #FFD23F;
  text-shadow: 0 5px 0 #D9A90F, 0 10px 0 #B88B00, 0 22px 34px rgba(0,0,0,.45); white-space: nowrap; }
```
```js
const IR = { immediateRender: false };
const o = { v: 0 };
tl.fromTo(o, { v: 0 }, { v: LICZBA, duration: 1.05, ease: "power2.out", ...IR, onUpdate: () => { document.getElementById("ls-v").textContent = Math.round(o.v); } }, T);
document.querySelectorAll("#ls-sc .kaf").forEach((el) => {
  const [, r, c] = el.id.split("-").map(Number);
  const t = T + 0.12 + Math.hypot(r - 1.5, c - 4) / 6.2 * 0.9;
  gsap.set(el, { opacity: 0 });
  tl.fromTo(el, { opacity: 0, scale: 0.5 }, { opacity: 1, scale: 1, duration: 0.18, ease: "back.out(1.8)", ...IR }, t);
});
tl.to("#ls-sc", { scale: 1.08, y: -120, duration: 0.5, ease: "power2.inOut" }, ROSNIE);
```

## Zasady

- Liczba dokładnie ta, która padła. Gdy kursantka mówi „ponad” albo „około”, zapisz ją z plusem przed liczbą: „+54”.
- Licznik startuje na pierwszej klatce ujęcia (inaczej przez chwilę widać „+0”).
- Ściana jest warstwą pod wycięciem z tła; pasmo płótna nad nią (do Y 476) trzyma liczbę na czystym tle.
- Dźwięki: whoosh na start, sparkle, gdy liczba dojdzie do końca.

## Wspólne zasady

- Kolory, czcionki i płótno ze stylu kursantki (`moj-brand.json`, `moj-styl.json`); kolory podane niżej to tylko przykład.
- Stany początkowe ustawiaj `gsap.set(...)` poza osią czasu, a wejścia `fromTo` z `immediateRender: false`. Inaczej element
  stoi przez klatkę na miejscu końcowym, zanim wjedzie (`rules/pulapki.md`).
- Element wchodzi na słowie, którego dotyczy (czasy z `slowa.json`), i trwa co najmniej do końca zdania.
- Treść tylko prawdziwa: liczby, nazwy i materiały z nagrania albo od kursantki, bez zmyślonych kwot i dowodów.
- Dźwięki z jej wyboru, ciszej niż głos, bez ping.
