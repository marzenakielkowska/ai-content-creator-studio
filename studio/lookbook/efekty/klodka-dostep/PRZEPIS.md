> ⚠️ **Sprawdzenie twarzy:** pigułka stoi nad głową, od Y 300 do `glowa_gora − 40`. Patrz: sekcja **„Twarz — reguła nadrzędna”** w `studio/skills/montaz/SKILL.md`.

# Efekt: Kłódka „dostęp”

**Co robi:** nad głową wskakuje biała pigułka z fioletową kłódką i jednym słowem („dostęp”). Na tym słowie pałąk kłódki
odchyla się, czyli kłódka się otwiera.

**Kiedy:** „chcesz mieć dostęp…”, „odblokuj”, bonus dla zapisanych, zamknięta grupa.

**Czego potrzeba:** nic poza nagraniem.

## Kod

```html
<div id="kd" class="karta clip" data-start="T" data-duration="D">
  <svg viewBox="0 0 24 24" width="46" height="46"><path id="kd-p" d="M7 11V7a5 5 0 0 1 9.6-2" fill="none" stroke="#6C4BEF" stroke-width="2.6" stroke-linecap="round"/><rect x="5" y="11" width="14" height="10" rx="2.5" fill="#6C4BEF"/></svg>
  dostęp
</div>
```
```css
.karta { position: absolute; background: #fff; box-shadow: 0 18px 44px rgba(0,0,0,.3); box-sizing: border-box; font-family: Nunito, sans-serif; font-weight: 800; color: #1C1C1E; }
#kd { left: 360px; top: 306px; width: 360px; height: 84px; display: flex; align-items: center; justify-content: center; gap: 14px; font-size: 40px; border-radius: 42px; }
```
```js
const IR = { immediateRender: false };
gsap.set("#kd", { opacity: 0 });
tl.fromTo("#kd", { opacity: 0, y: -30, scale: 0.9 }, { opacity: 1, y: 0, scale: 1, duration: 0.2, ease: "back.out(2)", ...IR }, T);
tl.to("#kd-p", { rotation: -32, transformOrigin: "17px 14px", duration: 0.16 }, SLOWO);
```

## Zasady

- Jedno słowo na pigułce, to, które pada w nagraniu.
- Kłódka otwiera się dokładnie na słowie, nie wcześniej.
- Dźwięk: click na otwarcie.

## Wspólne zasady

- Kolory, czcionki i płótno ze stylu kursantki (`moj-brand.json`, `moj-styl.json`); kolory podane niżej to tylko przykład.
- Stany początkowe ustawiaj `gsap.set(...)` poza osią czasu, a wejścia `fromTo` z `immediateRender: false`. Inaczej element
  stoi przez klatkę na miejscu końcowym, zanim wjedzie (`rules/pulapki.md`).
- Element wchodzi na słowie, którego dotyczy (czasy z `slowa.json`), i trwa co najmniej do końca zdania.
- Treść tylko prawdziwa: liczby, nazwy i materiały z nagrania albo od kursantki, bez zmyślonych kwot i dowodów.
- Dźwięki z jej wyboru, ciszej niż głos, bez ping.
