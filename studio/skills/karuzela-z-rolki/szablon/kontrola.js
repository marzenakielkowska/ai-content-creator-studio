// Kontrola slajdu (wstawia ją karuzela.mjs kontrola). Obok slajdu rysuje listę błędów,
// na slajdzie: czerwone linie strefy bezpiecznej, zieloną ramkę głowy i czerwone ramki tekstu z błędem.
(function () {
  const STREFA = __STREFA__, SW = __SW__, SH = __SH__;
  const root = document.getElementById('root');
  root.style.width = (SW + 640) + 'px';
  document.documentElement.style.width = document.body.style.width = (SW + 640) + 'px';

  function prostokatTwarzy(img) {
    const f = img.dataset.twarz.split(',').map(Number);
    const r = img.getBoundingClientRect();
    const cs = getComputedStyle(img);
    const iw = img.naturalWidth || 1, ih = img.naturalHeight || 1;
    let ox = 0, oy = 0, rw = r.width, rh = r.height;
    if (cs.objectFit === 'cover' || cs.objectFit === 'contain') {
      const k = cs.objectFit === 'cover' ? Math.max(r.width / iw, r.height / ih) : Math.min(r.width / iw, r.height / ih);
      rw = iw * k; rh = ih * k;
      const pos = cs.objectPosition.split(' ').map((v) => parseFloat(v) / 100);
      ox = (r.width - rw) * (isNaN(pos[0]) ? 0.5 : pos[0]);
      oy = (r.height - rh) * (isNaN(pos[1]) ? 0.5 : pos[1]);
    }
    const t = { left: r.left + ox + rw * f[0] / 100, top: r.top + oy + rh * f[1] / 100 };
    t.right = t.left + rw * f[2] / 100;
    t.bottom = t.top + rh * f[3] / 100;
    // widoczna część (ramka zdjęcia przycina)
    const kl = img.closest('.foto, .ramka, .karta');
    if (kl) {
      const k = kl.getBoundingClientRect();
      t.left = Math.max(t.left, k.left); t.top = Math.max(t.top, k.top); t.right = Math.min(t.right, k.right); t.bottom = Math.min(t.bottom, k.bottom);
    }
    return t.right > t.left && t.bottom > t.top ? t : null;
  }

  function tekstowe() {
    const out = [];
    const slajd = root.querySelector('.s') || root;
    slajd.querySelectorAll('*').forEach((el) => {
      if (el.closest('svg')) return;
      const wlasny = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
      if (!wlasny) return;
      const r = el.getBoundingClientRect();
      if (!r.width || !r.height) return;
      const cs = getComputedStyle(el);
      if (cs.visibility === 'hidden' || parseFloat(cs.opacity) === 0) return;
      out.push({ el, r, rozmiar: parseFloat(cs.fontSize), tekst: el.textContent.trim().replace(/\s+/g, ' ').slice(0, 42) });
    });
    return out;
  }

  // kontrast: kolor tekstu wobec koloru tla pod nim (pierwszy przodek z kolorem tla)
  const rgb = (c) => { const m = /rgba?\(([^)]+)\)/.exec(c || ''); if (!m) return null; const v = m[1].split(',').map((x) => parseFloat(x)); return { r: v[0], g: v[1], b: v[2], a: v[3] === undefined ? 1 : v[3] }; };
  const jasnosc = (c) => { const f = (x) => { x /= 255; return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4; }; return 0.2126 * f(c.r) + 0.7152 * f(c.g) + 0.0722 * f(c.b); };
  function tloPod(el) {
    for (let e = el; e && e !== document.documentElement; e = e.parentElement) {
      const cs = getComputedStyle(e);
      if (cs.backgroundImage && cs.backgroundImage !== 'none' && !/gradient\(transparent/.test(cs.backgroundImage)) return null; // obraz albo gradient: nie oceniamy
      const c = rgb(cs.backgroundColor);
      if (c && c.a > 0.5) return c;
    }
    return { r: 255, g: 255, b: 255, a: 1 };
  }
  function kontrast(el) {
    const t = rgb(getComputedStyle(el).color), b = tloPod(el);
    if (!t || !b) return { k: 99, zlyKierunek: false };
    const L1 = jasnosc(t), L2 = jasnosc(b);
    // na ciemnym tle jasna czcionka, na jasnym ciemna
    const zlyKierunek = (L2 < 0.2 && L1 < L2 + 0.3) || (L2 > 0.45 && L1 > L2 - 0.3);
    return { k: (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05), zlyKierunek };
  }

  const zachodzi = (a, b, m = 0) => a.left < b.right + m && a.right > b.left - m && a.top < b.bottom + m && a.bottom > b.top - m;

  function sprawdz() {
    const bledy = [];
    const ramki = [];
    const strefa = { left: STREFA.lewo, top: STREFA.gora, right: SW - STREFA.prawo, bottom: SH - STREFA.dol };
    const twarze = [...root.querySelectorAll('img[data-twarz]')].map(prostokatTwarzy).filter(Boolean);
    twarze.forEach((t) => ramki.push({ r: t, kolor: '#22C55E' }));
    // glowa w strefie bezpiecznej
    twarze.forEach((t) => {
      if (t.top < strefa.top - 2 || t.left < strefa.left - 40 || t.right > strefa.right + 40) bledy.push('GŁOWA POZA STREFĄ: przesuń albo zmniejsz postać');
    });
    // postac ucieta brzegiem kadru: dol obrazka musi siegac dolnej krawedzi slajdu
    root.querySelectorAll('img[data-krawedzie]').forEach((img) => {
      const k = Object.fromEntries(img.dataset.krawedzie.split(',').map((x) => { const [n, v] = x.split(':'); return [n, parseFloat(v)]; }));
      const r = img.getBoundingClientRect();
      // bok uciety wysoko (reka, ramie): do krawedzi slajdu, przykryty karta albo miekko rozmyty
      const przykryty = (x) => {
        const pas = { left: x - 4, right: x + 4, top: r.top + r.height * (Math.min(k.lewo ?? 100, k.prawo ?? 100) / 100), bottom: Math.min(r.bottom, SH) };
        return [...root.querySelectorAll('.karta-tekst, .karta, .pole, .foto, .ramka, .lista > div')].some((el) => { const e = el.getBoundingClientRect(); return e.left <= pas.left && e.right >= pas.right && e.top <= pas.top + 20 && e.bottom >= pas.bottom - 20; });
      };
      const ok = (strona, x) => img.classList.contains('miekko-' + strona) || przykryty(x);
      if (k.lewo !== undefined && k.lewo < 75 && r.left > 1 && !ok('lewo', r.left)) { bledy.push('POSTAĆ UCIĘTA Z LEWEJ (ręka albo ramię): dosuń do lewej krawędzi, przykryj kartą albo dodaj klasę miekko-lewo'); ramki.push({ r: { left: r.left - 6, right: r.left + 6, top: r.top, bottom: r.bottom }, kolor: '#EF4444' }); }
      if (k.prawo !== undefined && k.prawo < 75 && r.right < SW - 1 && !ok('prawo', r.right)) { bledy.push('POSTAĆ UCIĘTA Z PRAWEJ (ręka albo ramię): dosuń do prawej krawędzi, przykryj kartą albo dodaj klasę miekko-prawo'); ramki.push({ r: { left: r.right - 6, right: r.right + 6, top: r.top, bottom: r.bottom }, kolor: '#EF4444' }); }
      if (k.dol !== undefined && r.bottom < SH - 2) { bledy.push('POSTAĆ UCIĘTA NAD DOLNĄ KRAWĘDZIĄ: obrazek ma sięgać do dołu slajdu'); ramki.push({ r: { left: r.left, right: r.right, top: r.bottom - 6, bottom: r.bottom + 6 }, kolor: '#EF4444' }); }
    });
    for (const x of tekstowe()) {
      const wKoncie = x.el.closest('.konto, .nr');
      if (x.r.right > SW + 1 || x.r.left < -1 || x.r.bottom > SH + 1 || x.r.top < -1) { bledy.push(`POZA SLAJDEM: „${x.tekst}”`); ramki.push({ r: x.r, kolor: '#EF4444' }); continue; }
      if (!wKoncie && (x.r.left < strefa.left - 2 || x.r.right > strefa.right + 2 || x.r.top < strefa.top - 2 || x.r.bottom > strefa.bottom + 2)) {
        bledy.push(`POZA STREFĄ: „${x.tekst}”`); ramki.push({ r: x.r, kolor: '#EF4444' });
      }
      if (x.rozmiar < 28) bledy.push(`MAŁY TEKST ${Math.round(x.rozmiar)} px: „${x.tekst}”`);
      // na ciemnym tle jasna czcionka, na jasnym ciemna: duzy tekst min. 3:1, zwykly min. 4,5:1
      const { k, zlyKierunek } = kontrast(x.el), prog = x.rozmiar >= 40 ? 3 : 4.5;
      if (k < prog) { bledy.push(`SŁABY KONTRAST ${k.toFixed(1)}:1 (potrzeba ${prog}:1): „${x.tekst}”`); ramki.push({ r: x.r, kolor: '#F59E0B' }); }
      else if (zlyKierunek) { bledy.push(`CIEMNE NA CIEMNYM / JASNE NA JASNYM: „${x.tekst}” (na ciemnym tle jasna czcionka, na jasnym ciemna)`); ramki.push({ r: x.r, kolor: '#F59E0B' }); }
      for (const t of twarze) {
        // twarz i broda: 50 px odstępu
        if (zachodzi(x.r, t, 50)) { bledy.push(`NA TWARZY / POD BRODĄ: „${x.tekst}”`); ramki.push({ r: x.r, kolor: '#EF4444' }); }
      }
    }
    // karty z tekstem, pole komentarza i konto nie mogą wchodzić na twarz
    root.querySelectorAll('.karta-tekst, .pole, .konto').forEach((el) => {
      const r = el.getBoundingClientRect();
      for (const t of twarze) if (zachodzi(r, t, 50)) { bledy.push(`KARTA NA TWARZY / POD BRODĄ: ${el.className}`); ramki.push({ r, kolor: '#EF4444' }); }
    });
    // konto nie może leżeć na innej karcie
    const konto = root.querySelector('.konto');
    if (konto) {
      const k = konto.getBoundingClientRect();
      root.querySelectorAll('.karta-tekst, .pole, .karta, .lista > div').forEach((el) => { if (zachodzi(k, el.getBoundingClientRect(), 8)) bledy.push('KONTO NACHODZI NA KARTĘ'); });
    }
    rysuj(strefa, ramki, [...new Set(bledy)]);
  }

  function rysuj(strefa, ramki, bledy) {
    document.querySelectorAll('.__kontrola').forEach((e) => e.remove());
    const warstwa = document.createElement('div');
    warstwa.className = '__kontrola';
    warstwa.style.cssText = 'position:absolute;left:0;top:0;width:' + SW + 'px;height:' + SH + 'px;z-index:9999;pointer-events:none;';
    const linia = (css) => { const d = document.createElement('div'); d.style.cssText = 'position:absolute;' + css; warstwa.appendChild(d); };
    linia(`left:${strefa.left}px;top:0;width:0;height:${SH}px;border-left:3px dashed #EF4444;`);
    linia(`left:${strefa.right}px;top:0;width:0;height:${SH}px;border-left:3px dashed #EF4444;`);
    linia(`left:0;top:${strefa.top}px;width:${SW}px;height:0;border-top:3px dashed #EF4444;`);
    linia(`left:0;top:${strefa.bottom}px;width:${SW}px;height:0;border-top:3px dashed #EF4444;`);
    for (const { r, kolor } of ramki) linia(`left:${r.left}px;top:${r.top}px;width:${r.right - r.left}px;height:${r.bottom - r.top}px;border:5px solid ${kolor};border-radius:8px;`);
    root.appendChild(warstwa);
    const panel = document.createElement('div');
    panel.className = '__kontrola';
    panel.style.cssText = 'position:absolute;left:' + SW + 'px;top:0;width:640px;height:' + SH + 'px;background:#111;color:#fff;font:600 30px/1.35 Nunito,sans-serif;padding:40px 36px;box-sizing:border-box;z-index:9999;';
    panel.innerHTML = '<div style="font-size:40px;font-weight:800;margin-bottom:24px;color:' + (bledy.length ? '#F87171' : '#4ADE80') + '">' + (bledy.length ? 'DO POPRAWY: ' + bledy.length : 'OK') + '</div>' +
      bledy.map((b) => '<div style="margin-bottom:16px">• ' + b.replace(/</g, '&lt;') + '</div>').join('');
    root.appendChild(panel);
  }

  const go = () => requestAnimationFrame(() => requestAnimationFrame(sprawdz));
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(go); else window.addEventListener('load', go);
  window.addEventListener('load', go);
})();
