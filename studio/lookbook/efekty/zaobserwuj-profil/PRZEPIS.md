> ⚠️ **Sprawdzenie twarzy:** karta pod brodą, górna krawędź co najmniej `broda + 40`; gdy głowa jest nisko w kadrze, karta może iść nad głowę (dolna krawędź 40 px nad włosami). Patrz: sekcja **„Twarz — reguła nadrzędna”** w `studio/skills/montaz/SKILL.md`.

# Efekt: Zaobserwuj profil

**Co robi:** pod brodą wjeżdża biała karta profilu: okrągłe zdjęcie kursantki w fioletowej obwódce, nazwa konta,
„Zaobserwuj profil”, „by być na bieżąco” i fioletowy przycisk „Obserwuj”. Kursor podjeżdża do przycisku i klika:
rozchodzi się kółko, karta lekko podskakuje, a przycisk zmienia się na szary „✓ Obserwujesz”. Kursor odjeżdża, karta
zostaje do końca ujęcia.

**Kiedy:** koniec rolki i pożegnanie („trzymaj się”, „do zobaczenia”), prośba o obserwowanie albo zdanie
o obserwujących („przybyło mi tylu obserwujących”). Raz na rolkę, 2,5–4 s.

**Czego potrzeba:** jej zdjęcie profilowe i nazwa konta (z marki albo od kursantki).

## Słowa kursantki

- Nazwa konta i zdjęcie zawsze jej, nigdy z filmu podglądowego. Podpis „by być na bieżąco” można zmienić na jej słowa
  („po więcej przepisów”, „po kolejne porady”).
- Karta wjeżdża na początku zdania, klik na słowie kluczowym („obserwuj”, „obserwujących”, ostatnie słowo pożegnania).

## Kod

```html
<div id="zp" class="clip" data-start="T" data-duration="D" style="position:absolute;inset:0">
  <div id="ob" class="karta" style="left:90px;top:800px;width:900px;height:206px;display:flex;align-items:center;gap:26px;padding:0 34px">   <!-- top = broda + 40 -->
    <img src="assets/profil.jpg" style="width:138px;height:138px;border-radius:50%;object-fit:cover;flex:none;box-shadow:0 0 0 6px #6C4BEF" alt="">
    <div style="flex:1;min-width:0"><div style="font-weight:600;font-size:27px;color:#8E8B9E">nazwa_konta</div><div style="font-weight:800;font-size:44px;line-height:1.1">Zaobserwuj profil</div><div style="font-weight:600;font-size:29px;color:#5A3BE0">by być na bieżąco</div></div>
    <div style="position:relative;width:268px;height:92px;flex:none">
      <div id="ob-a" style="position:absolute;inset:0;border-radius:24px;background:#6C4BEF;color:#fff;font-weight:800;font-size:38px;display:flex;align-items:center;justify-content:center">Obserwuj</div>
      <div id="ob-b" style="position:absolute;inset:0;border-radius:24px;background:#ECEAF3;color:#1D1B2A;font-weight:800;font-size:34px;display:flex;align-items:center;justify-content:center;gap:8px"><svg viewBox="0 0 24 24" width="34" height="34"><path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="#6C4BEF" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/></svg>Obserwujesz</div>
    </div>
    <i id="ob-r" style="position:absolute;left:776px;top:43px;width:120px;height:120px;border-radius:50%;border:8px solid #6C4BEF;box-sizing:border-box"></i>
    <svg id="ob-k" viewBox="0 0 24 24" width="88" height="88" style="position:absolute;left:820px;top:98px;z-index:3"><path d="M5 2l14 9.5-6.2 1.3 3.6 7-2.9 1.4-3.5-7L5 18.5z" fill="#fff" stroke="#1D1B2A" stroke-width="1.6" stroke-linejoin="round"/></svg>
  </div>
</div>
```
```css
.karta { position: absolute; background: #fff; border-radius: 44px; box-shadow: 0 22px 60px rgba(20,12,60,.38); box-sizing: border-box; color: #1D1B2A; font-family: Figtree, sans-serif; font-weight: 800; }
```
```js
// T_WEJ = początek zdania, T_KLIK = słowo kluczowe (z slowa.json); T_KLIK - T_WEJ co najmniej 1 s
gsap.set("#ob", { opacity: 0.001, y: 120, scale: 0.9 }); gsap.set("#ob-b", { opacity: 0 });
gsap.set("#ob-k", { x: 320, y: 520, opacity: 0.001 }); gsap.set("#ob-r", { scale: 0.3, opacity: 0.001 });
tl.to("#ob", { opacity: 1, y: 0, scale: 1, duration: 0.32, ease: "back.out(1.6)" }, T_WEJ);
tl.to("#ob-k", { opacity: 1, duration: 0.1 }, T_KLIK - 0.48);
tl.to("#ob-k", { x: 0, y: 0, duration: 0.42, ease: "power2.out" }, T_KLIK - 0.48);
tl.to("#ob-k", { scale: 0.82, duration: 0.07 }, T_KLIK); tl.to("#ob-k", { scale: 1, duration: 0.14 }, T_KLIK + 0.07);
tl.to("#ob-r", { scale: 1, opacity: 1, duration: 0.1 }, T_KLIK);
tl.to("#ob-r", { scale: 1.6, opacity: 0, duration: 0.24, ease: "power2.out" }, T_KLIK + 0.1);
tl.set("#ob-a", { opacity: 0 }, T_KLIK + 0.04); tl.set("#ob-b", { opacity: 1 }, T_KLIK + 0.04);
tl.to("#ob", { scale: 1.05, duration: 0.08 }, T_KLIK + 0.04); tl.to("#ob", { scale: 1, duration: 0.22, ease: "back.out(3)" }, T_KLIK + 0.12);
tl.to("#ob-k", { opacity: 0, x: 240, y: 300, duration: 0.3, ease: "power2.in" }, T_KLIK + 0.76);
```

Dźwięk: `short-whoosh` przy wejściu karty (0,09), `click` przy kliknięciu (0,12), cichy `pop` 0,1 s później (0,07).
