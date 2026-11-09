> ⚠️ **Sprawdzenie twarzy:** ekran stoi za osobą (pod wycięciem z tła), głowa może zasłonić jego dolną część; kursor nie przechodzi przez twarz. Patrz: sekcja **„Twarz — reguła nadrzędna”** w `studio/skills/montaz/SKILL.md`.

# Efekt: Przewijany ekran za głową

**Co robi:** na płótnie w kolorze marki wjeżdża z góry duży ekran z białą ramką: prawdziwy zrzut strony albo aplikacji.
Na kolejnych słowach przewija się do tej części, o której mowa („markę” → „czcionki” → „kolory”). Kursor może kliknąć
albo zaznaczyć, a zamiast przewijania można podmienić zrzut na następny (np. przed i po zaznaczeniu).

**Kiedy:** kursantka opowiada o stronie, programie, ustawieniach albo ofercie i wymienia jej części.

**Czego potrzeba:** długi zrzut ekranu od kursantki (cała strona od góry do dołu, najlepiej z komputera), wycięcie z tła
na to ujęcie.

## Kod

```html
<div id="ek" class="clip" data-start="T" data-duration="D" style="position:absolute;inset:0">
  <div style="position:absolute;inset:0;background:#6C4BEF"></div>
  <div id="ek-o" class="ekran" style="left:70px;top:306px;width:940px;height:760px"><img id="ek-i" src="assets/zrzut-strony.jpg" alt=""></div>
</div>
```
```css
.ekran { position: absolute; overflow: hidden; border-radius: 30px; background: #fff; box-shadow: 0 0 0 5px rgba(255,255,255,.85), 0 30px 70px rgba(0,0,0,.5); }
.ekran img { position: absolute; left: 0; top: 0; width: 100%; display: block; }
```
```js
// Y_CZESCI = położenie części na zrzucie po przeskalowaniu do 940 px szerokości (zmierz na zrzucie)
gsap.set("#ek-o", { y: -900 });
tl.fromTo("#ek-o", { y: -900 }, { y: 0, duration: 0.26, ease: "power3.out", immediateRender: false }, T);
tl.to("#ek-i", { y: -Y_CZESCI_1, duration: 0.26, ease: "power3.inOut" }, SLOWO_1);
tl.to("#ek-i", { y: -Y_CZESCI_2, duration: 0.3, ease: "power3.inOut" }, SLOWO_2);
```

## Zasady

- Tylko prawdziwy zrzut od kursantki. Gdy go nie ma, zapytaj o niego, a bez niego wybierz inny efekt.
- Ekran jest warstwą pod wycięciem z tła: osoba stoi przed nim, głowa może zasłonić dolne ~40% ekranu. Ważna część zrzutu
  musi wypaść w górnej części okna (Y 306–600).
- Każde przewinięcie na słowie, najwyżej co 0,8 s, żeby dało się przeczytać. Kadr może się w tym czasie przybliżać.
- Dźwięki: whoosh na wjazd, soft-click na każde przewinięcie.

## Wspólne zasady

- Kolory, czcionki i płótno ze stylu kursantki (`moj-brand.json`, `moj-styl.json`); kolory podane niżej to tylko przykład.
- Stany początkowe ustawiaj `gsap.set(...)` poza osią czasu, a wejścia `fromTo` z `immediateRender: false`. Inaczej element
  stoi przez klatkę na miejscu końcowym, zanim wjedzie (`rules/pulapki.md`).
- Element wchodzi na słowie, którego dotyczy (czasy z `slowa.json`), i trwa co najmniej do końca zdania.
- Treść tylko prawdziwa: liczby, nazwy i materiały z nagrania albo od kursantki, bez zmyślonych kwot i dowodów.
- Dźwięki z jej wyboru, ciszej niż głos, bez ping.
