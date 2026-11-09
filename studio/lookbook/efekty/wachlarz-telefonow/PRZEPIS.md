> ⚠️ **Sprawdzenie twarzy:** środkowy telefon stoi za głową (pod wycięciem), boczne obok głowy, żaden nie wchodzi na twarz. Patrz: sekcja **„Twarz — reguła nadrzędna”** w `studio/skills/montaz/SKILL.md`.

# Efekt: Wachlarz telefonów

**Co robi:** po kolei wskakują trzy telefony z grającymi filmami: środkowy za głową, potem lewy i prawy, przechylone
o −7° i +7°. Każdy pokazuje inną rolkę albo inny efekt.

**Kiedy:** „każda rolka inna”, „spersonalizowane materiały”, „pokażę Ci trzy przykłady”, kilka produktów naraz.

**Czego potrzeba:** trzy krótkie filmy od kursantki (jej rolki, fragmenty, produkty), wycięcie z tła na to ujęcie.

## Kod

```html
<div id="wt" style="position:absolute;inset:0">
  <div id="telC" class="tel" style="left:395px;top:306px;width:290px;height:560px"><div class="e"><video id="wt-v0" class="clip" src="assets/rolka-1.mp4" data-start="T" data-duration="D" data-track-index="51" muted playsinline></video></div></div>
  <div id="telA" class="tel" style="left:30px;top:500px;width:270px;height:530px;transform:rotate(-7deg)"><div class="e"><video id="wt-v1" class="clip" src="assets/rolka-2.mp4" data-start="T" data-duration="D" data-track-index="52" muted playsinline></video></div></div>
  <div id="telB" class="tel" style="left:780px;top:500px;width:270px;height:530px;transform:rotate(7deg)"><div class="e"><video id="wt-v2" class="clip" src="assets/rolka-3.mp4" data-start="T" data-duration="D" data-track-index="53" muted playsinline></video></div></div>
</div>
```
```css
.tel { position: absolute; box-sizing: border-box; padding: 12px; border-radius: 52px; background: #0d0d0d; box-shadow: 0 0 0 3px rgba(255,255,255,.92), 0 30px 70px rgba(0,0,0,.55); }
.tel .e { position: relative; width: 100%; height: 100%; border-radius: 42px; overflow: hidden; background: #111; }
.tel video { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
```
```js
// opakowanie #wt bez data-start (filmy w środku mają własne czasy); widoczność steruj opacity
const IR = { immediateRender: false };
gsap.set(["#telC", "#telA", "#telB"], { opacity: 0 });
tl.fromTo("#telC", { opacity: 0, y: 80, scale: 0.85 }, { opacity: 1, y: 0, scale: 1, duration: 0.26, ease: "back.out(1.6)", ...IR }, T + 0.05);
tl.fromTo("#telA", { opacity: 0, x: -240, scale: 0.9 }, { opacity: 1, x: 0, scale: 1, rotation: -7, duration: 0.26, ease: "back.out(1.6)", ...IR }, T + 0.4);
tl.fromTo("#telB", { opacity: 0, x: 240, scale: 0.9 }, { opacity: 1, x: 0, scale: 1, rotation: 7, duration: 0.26, ease: "back.out(1.6)", ...IR }, T + 0.75);
tl.set(["#telC", "#telA", "#telB"], { opacity: 0 }, T + D);
```

## Zasady

- Środkowy telefon jest warstwą pod wycięciem z tła (za głową), boczne mogą być przed osobą, ale tylko przy ramionach:
  X do 300 i od 780, dolna krawędź do około Y 1040 (nad kolumną ikon i pasem napisów).
- Filmy wyciszone, każdy z innym ujęciem. Trzy różne rolki kursantki, nigdy cudze bez podpisu konta.
- Dźwięki: pop na każdy telefon, sparkle na ostatni.

## Wspólne zasady

- Kolory, czcionki i płótno ze stylu kursantki (`moj-brand.json`, `moj-styl.json`); kolory podane niżej to tylko przykład.
- Stany początkowe ustawiaj `gsap.set(...)` poza osią czasu, a wejścia `fromTo` z `immediateRender: false`. Inaczej element
  stoi przez klatkę na miejscu końcowym, zanim wjedzie (`rules/pulapki.md`).
- Element wchodzi na słowie, którego dotyczy (czasy z `slowa.json`), i trwa co najmniej do końca zdania.
- Treść tylko prawdziwa: liczby, nazwy i materiały z nagrania albo od kursantki, bez zmyślonych kwot i dowodów.
- Dźwięki z jej wyboru, ciszej niż głos, bez ping.
