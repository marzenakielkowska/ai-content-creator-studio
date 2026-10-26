# Tryby: "Jeden gotowy styl" i "Skomponuj własny"

Usunięte 2026-10-26. Być może wykorzystamy w przyszłości — np. jako
szybki start z szablonu (wypełnia czcionki + kolory + efekty jednym
kliknięciem, kursantka może potem zmodyfikować).

---

## Dlaczego usunięte

Dwa przyciski trybu na wejściu tworzyły meta-decyzję zanim kursantka
zobaczyła treść. Praktycznie nikt nie korzysta z gotowego stylu —
każda kursantka chce ustawić swój brand. Sekcja gotowych stylów
(`#sec-ready`) była niekompletna: brand (czcionki, kolory, układ)
i tak wymagał osobnej konfiguracji.

---

## Zachowany kod

### CSS (był w index.html)

```css
.modes{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:16px;margin-top:36px}
.mode{all:unset;cursor:pointer;background:var(--surface);border:1.5px solid var(--line);border-radius:24px;padding:22px 24px;display:grid;gap:4px}
.mode b{font-size:22px;letter-spacing:-.02em}
.mode span{color:var(--muted);font-size:15px}
.mode[aria-selected="true"]{border-color:var(--accent);box-shadow:0 0 0 3px color-mix(in srgb,var(--accent) 18%,transparent)}
/* .mode:focus-visible było częścią wspólnej reguły focus-visible */
.looks .grid{grid-template-columns:repeat(auto-fill,minmax(240px,1fr))}
```

### HTML — przyciski trybu (był w .band)

```html
<div class="modes" role="tablist" aria-label="Sposób wyboru">
  <button class="mode" id="m-ready" role="tab" aria-selected="false" aria-controls="sec-ready"><b>Jeden gotowy styl</b><span>Jeden wybór ustala napisy, efekty, tempo i wygląd obrazu.</span></button>
  <button class="mode" id="m-own" role="tab" aria-selected="true" aria-controls="sec-caps"><b>Skomponuj własny</b><span>Twoje napisy i Twoje efekty. Ty decydujesz, gdzie się pojawiają.</span></button>
</div>
```

### HTML — sekcja gotowych stylów

```html
<section class="block looks" id="sec-ready" hidden>
  <div class="eyebrow">Gotowe style</div>
  <h2>Cały look jednym kliknięciem</h2>
  <p class="lead">Każdy gotowy styl to komplet: napisy, efekty, tempo montażu i wygląd obrazu.</p>
  <div class="grid" id="g-ready"></div>
</section>
```

### JS — stan i render

```js
// Stan (był w bloku zmiennych):
let mode = 'own', ready = null;

// render() — linie do usunięcia:
$('#m-ready').setAttribute('aria-selected', mode === 'ready');
$('#m-own').setAttribute('aria-selected', mode === 'own');
$('#sec-ready').hidden = mode !== 'ready';
const isMarka = mode === 'own' && lbTab === 'marka';  // → zastąpione: const isMarka = lbTab === 'marka'
const isEfekty = mode === 'own' && lbTab === 'efekty'; // → zastąpione: const isEfekty = lbTab === 'efekty'
$('#lb-tabs').hidden = mode !== 'own';  // → usunięte (tabs zawsze widoczne)

// buildChips() — gałąź gotowego stylu:
if (mode === 'ready' && ready) {
  const el = $(`#ready-${ready}`);
  addChip((el?.querySelector('.title')?.textContent || ready) + ' · gotowy styl', 'sec-ready', false, () => { ready = null; });
  ok = true;
} else if (mode === 'own' && lbTab === 'marka') {  // → if (lbTab === 'marka') {

// zapisz() — gałąź gotowego stylu:
if (mode === 'ready') {
  out = { tryb: 'gotowy', styl: ready };
}

// Ładowanie gotowych stylów:
gotowe.forEach(s => $('#g-ready').appendChild(card(s, 'ready', 'gotowe', maps)));

// Obsługa kliknięć:
$('#m-ready').onclick = () => { mode = 'ready'; render(); };
$('#m-own').onclick = () => { mode = 'own'; render(); };
```

### JS — card() dla gotowego stylu

```js
// Był w funkcji card(), linie 1166-1175:
if (kind === 'ready' && maps) {
  const nNazwa = maps.napisy[item.napisy]?.nazwa || item.napisy;
  const eNazwy = (item.efekty || []).map(id => maps.efekty[id]?.nazwa || id).join(', ');
  html += `<dl class="layers">
    <div><dt>Napisy</dt><dd>${nNazwa}</dd></div>
    <div><dt>Efekty</dt><dd>${eNazwy}</dd></div>
    <div><dt>Tempo</dt><dd>${item.tempo}</dd></div>
    <div><dt>Obraz</dt><dd>${item.obraz}</dd></div>
  </dl>`;
}
```
