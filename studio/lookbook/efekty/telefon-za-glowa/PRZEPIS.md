> ⚠️ **Sprawdzenie twarzy:** telefon stoi ZA osobą (sylwetka na wierzchu), więc może chować się za włosami, ale nigdy nie leży na twarzy. Patrz: sekcja **„Twarz — reguła nadrzędna”** w `studio/skills/montaz/SKILL.md`.

# Efekt: Telefon z rolką za głową

**Co robi:** odmiana „Wysuwanej makiety telefonu” na hak z reakcją. Duży telefon z grającą rolką (bez jej dźwięku) wjeżdża od pierwszej klatki z prawej, przechylony w 3D, i staje obok głowy. Lewa część telefonu chowa się za włosami i ramieniem kursantki, co daje głębię. Telefon lekko dryfuje, a na „sprawdźmy” albo w następnym ujęciu odlatuje w prawo. Pod telefonem jest podpis konta autora rolki.

**Czego potrzeba od kursantki:**
- nagrania ekranu z rolką, na którą reaguje (wystarczą pierwsze 3 s), i nazwy konta autora;
- wycięcia z tła (`wytnij-tlo`) na czas haka. Sylwetka musi mieć ten sam zoom co nagranie, a przybliżenie na „sprawdźmy” obejmuje kadr i sylwetkę razem.

**Cudza rolka zawsze z podpisem `@konto` autora** (`rules/grafiki.md`). Nie pokazuj jej dłużej niż w haku.

## Przygotowanie

```bash
ffmpeg -i ekran-rolki.mov -t 3.2 -an -vf "fps=30,scale=720:-2:flags=lanczos" -c:v libx264 -crf 18 -pix_fmt yuv420p -movflags +faststart assets/wzor.mp4
```

## Kod (telefon nad nagraniem, pod sylwetką)

```html
<div id="kadr"> … nagranie … </div>
<div id="telefon">
  <video id="wzor" class="clip" src="assets/wzor.mp4" data-start="0" data-duration="KONIEC_TELEFONU" data-track-index="1" muted playsinline></video>
</div>
<div id="sylwetki"> … sylwetka w czasie haka … </div>
<!-- w kompozycji grafik: <div id="autor" class="clip" …><div id="autor-pill">@konto</div></div> -->
```
```css
/* z nagłówkiem nad głową: top 410; bez nagłówka: top 270. Lewa krawędź ~150 px na głowie (za włosami). */
#telefon { position: absolute; left: 630px; top: 410px; width: 420px; height: 795px; z-index: 2; box-sizing: border-box; padding: 13px;
  border-radius: 58px; background: #0d0d0d; box-shadow: 0 0 0 3px rgba(255,255,255,.92), 0 34px 80px rgba(0,0,0,.6); }
#wzor { display: block; width: 100%; height: 100%; object-fit: cover; border-radius: 47px; }
#sylwetki { position: absolute; inset: 0; z-index: 4; }
#autor { position: absolute; left: 690px; top: 1222px; } /* pod telefonem, nad pasem napisów */
#autor-pill { display: inline-block; padding: 8px 18px; border-radius: 20px; background: rgba(0,0,0,.55); color: #fff;
  font-family: Nunito, sans-serif; font-weight: 800; font-size: 28px; }
```
```js
// widoczny od klatki 0 (hak), już częściowo w kadrze
gsap.set("#telefon", { transformPerspective: 1600, transformOrigin: "50% 50%", x: 110, rotationY: -32, rotation: 9, scale: 0.95 });
tl.to("#telefon", { x: 0, rotationY: -16, rotation: 6, scale: 1, duration: 0.38, ease: "power3.out" }, 0);
tl.to("#telefon", { rotationY: -9, rotation: 4, duration: ODLOT - 0.4, ease: "sine.inOut" }, 0.38);
tl.to("#telefon", { x: 760, rotationY: -55, rotation: 14, duration: 0.26, ease: "power2.in" }, ODLOT);
tl.fromTo("#autor-pill", { y: -14, opacity: 0 }, { y: 0, opacity: 1, duration: 0.25, ease: "power3.out", immediateRender: false }, 0.12);
tl.to("#autor-pill", { opacity: 0, duration: 0.15, ease: "power2.in" }, ODLOT - 0.04);
```

## Zasady

- Pozycję dopasuj do `glowa.json`: lewa krawędź telefonu około 150 px na głowie (żeby się za nią chowała), prawa najwyżej około X 1050. Środek ekranu telefonu musi zostać widoczny.
- Sylwetka trwa do końca odlotu telefonu, inaczej w ostatnich klatkach telefon przeleci po twarzy.
- Czcionka podpisu: Nunito 800 (pełne polskie znaki).
- Dźwięk: short-whoosh na wjeździe (klatka 0), whoosh na odlocie.
