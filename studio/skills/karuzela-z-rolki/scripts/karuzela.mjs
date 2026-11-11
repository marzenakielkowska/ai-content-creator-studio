#!/usr/bin/env node
// AI Content Creator Studio: karuzela z gotowej rolki.
//
//   start <projekt> [--nowa]
//        folder <projekt>/karuzela, rolka.json (tekst kazdego fragmentu rolki z czasami w nagraniu i w gotowej rolce),
//        marka.css z Lookbooka kursantki i moj-karuzela.json (--nowa: poprzednia karuzela do karuzela/poprzednia-<data>/)
//   twarze <projekt> [--co 0.5]
//        arkusze twarzy z oryginalnych nagran co 0,5 s -> karuzela/work/twarze-N.jpg (wybor zdjec z usmiechem)
//   klatka <projekt> <fragment> <sekunda> <nazwa> [--z gotowe]
//        pelna klatka 1080x1920 -> karuzela/assets/<nazwa>.jpg (sekunda liczona od poczatku fragmentu;
//        domyslnie z oryginalnego nagrania, bez napisow; --z gotowe bierze z gotowej rolki)
//   zdjecie <projekt> <plik> <nazwa>
//        zdjecie od kursantki -> karuzela/assets/<nazwa>.jpg (obrot z telefonu, HEIC tez)
//   wytnij <projekt> <nazwa> [--zgoda] [--bez-wyciecia]
//        postac bez tla z czystymi wlosami -> assets/<nazwa>-wyciecie.png i polozenie glowy -> assets/<nazwa>.twarz.json
//        (--bez-wyciecia: tylko polozenie glowy, gdy slajd pokazuje zwykle zdjecie)
//   fragment <projekt> <fragment> <nazwa> [--z surowe|gotowe] [--kadr 768x1268] [--od 0] [--dl 7]
//        film bez dzwieku do slajdu-filmu -> karuzela/assets/<nazwa>.mp4
//        (surowe i gotowe tego samego fragmentu ida rowno, w tych samych ruchach)
//   zbuduj <projekt>
//        kompozycja kazdego slajdu z karuzela/slajdy/NN.html -> karuzela/work/slajdy/NN (sierotki, twarze, filmy)
//   kontrola <projekt>
//        kazdy slajd z opisem bledow obok (poza strefa, na twarzy, maly tekst, poza slajdem) -> work/kontrola.jpg
//   render <projekt> [--nr 2,7]
//        gotowe pliki do publikacji -> karuzela/gotowe/slajd-NN.png albo slajd-NN.mp4
//   strona <projekt> <opis.json>
//        storyboard z przewijaniem jak na Instagramie -> karuzela/strona/karuzela.html (z folderem kl/)
//
// Wypisuje linie "STATUS ...", "KROK ...", "INFO ...", "WYNIK ...". Claude tlumaczy je kursantce.
// Narzedzia (Node, FFmpeg, HyperFrames) bierze z narzedzia.json zapisanego przez /studio:start.

import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const DOM = process.env.AI_STUDIO_HOME || path.join(os.homedir(), '.ai-content-studio');
const TU = path.dirname(fileURLToPath(import.meta.url));
const SZABLON = path.join(TU, '..', 'szablon');
const SW = 1080; // szerokosc slajdu
const SH = 1650; // wysokosc slajdu
const STREFA = { lewo: 90, prawo: 90, gora: 200, dol: 200 };

// ---------- narzedzia ----------

function wypisz(linia) {
  process.stdout.write(linia + '\n');
}

function blad(tekst) {
  wypisz(`STATUS blad ${tekst}`);
  wypisz('WYNIK BLAD');
  process.exit(1);
}

let NARZ = null;
function narzedzia() {
  if (NARZ) return NARZ;
  const plik = path.join(DOM, 'narzedzia.json');
  if (!fs.existsSync(plik)) blad('brak narzedzia.json - najpierw uruchom /studio:start');
  try {
    NARZ = JSON.parse(fs.readFileSync(plik, 'utf8'));
  } catch {
    blad('nie mozna odczytac narzedzia.json - uruchom /studio:start');
  }
  return NARZ;
}

function srodowisko() {
  const n = narzedzia();
  const env = { ...process.env };
  const klucz = Object.keys(env).find((k) => k.toUpperCase() === 'PATH') || 'PATH';
  env[klucz] = [path.dirname(n.node), path.dirname(n.ffmpeg), env[klucz] || ''].join(path.delimiter);
  env.HYPERFRAMES_FFMPEG_PATH = n.ffmpeg;
  env.HYPERFRAMES_FFPROBE_PATH = n.ffprobe;
  return env;
}

function uruchom(polecenie, argumenty, opcje = {}) {
  const r = spawnSync(polecenie, argumenty, {
    encoding: opcje.binarnie ? 'buffer' : 'utf8',
    env: srodowisko(),
    cwd: opcje.cwd,
    input: opcje.wejscie,
    timeout: opcje.timeout || 0,
    maxBuffer: 512 * 1024 * 1024,
    windowsHide: true,
  });
  const tekst = (b) => (Buffer.isBuffer(b) ? b.toString('utf8') : b || '');
  return { ok: r.status === 0 && !r.error, kod: r.status, out: opcje.binarnie ? r.stdout : tekst(r.stdout), err: tekst(r.stderr) };
}

const ff = (argumenty, opcje) => uruchom(narzedzia().ffmpeg, ['-hide_banner', '-nostdin', '-loglevel', 'error', ...argumenty], opcje);
const ffprobe = (argumenty) => uruchom(narzedzia().ffprobe, ['-v', 'error', ...argumenty], { timeout: 120000 });
const hf = (argumenty, opcje = {}) => uruchom(narzedzia().node, [narzedzia().hyperframes, ...argumenty], opcje);

function ffWymagane(argumenty, co, opcje) {
  const r = ff(['-y', ...argumenty], opcje);
  if (!r.ok) {
    wypisz(`INFO ${r.err.trim().split(/\r?\n/).slice(-3).join(' | ')}`);
    blad(`${co} nie powiodlo sie`);
  }
  return r;
}

function czytajJson(plik, co) {
  if (!fs.existsSync(plik)) blad(co);
  try {
    return JSON.parse(fs.readFileSync(plik, 'utf8'));
  } catch {
    blad(`${co} (plik uszkodzony: ${plik})`);
  }
}

function czytajJsonCicho(plik, domyslnie = null) {
  try {
    return JSON.parse(fs.readFileSync(plik, 'utf8'));
  } catch {
    return domyslnie;
  }
}

function zapiszJson(plik, dane) {
  fs.mkdirSync(path.dirname(plik), { recursive: true });
  fs.writeFileSync(plik, JSON.stringify(dane, null, 2) + '\n');
}

function opcja(argumenty, nazwa, domyslna) {
  const i = argumenty.indexOf(nazwa);
  if (i === -1) return domyslna;
  const w = argumenty[i + 1];
  argumenty.splice(i, 2);
  return w;
}

function flaga(argumenty, nazwa) {
  const i = argumenty.indexOf(nazwa);
  if (i === -1) return false;
  argumenty.splice(i, 1);
  return true;
}

const r2 = (x) => Math.round(x * 100) / 100;
const esc = (t) => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const nn = (n) => String(n).padStart(2, '0');
const mmss = (t) => `${Math.floor(t / 60)}:${(t % 60).toFixed(1).padStart(4, '0').replace('.', ',')}`;

function dlugosc(plik) {
  const r = ffprobe(['-show_entries', 'format=duration', '-of', 'csv=p=0', plik]);
  const d = parseFloat(r.out);
  return Number.isFinite(d) ? d : 0;
}

function sciezki(projekt) {
  if (!projekt) blad('podaj folder projektu rolki');
  const p = path.resolve(projekt);
  if (!fs.existsSync(p)) blad(`nie ma folderu projektu: ${p}`);
  const k = path.join(p, 'karuzela');
  return {
    projekt: p,
    karuzela: k,
    assets: path.join(k, 'assets'),
    slajdy: path.join(k, 'slajdy'),
    work: path.join(k, 'work'),
    gotowe: path.join(k, 'gotowe'),
    strona: path.join(k, 'strona'),
    rolka: path.join(k, 'rolka.json'),
  };
}

// ---------- rolka: tekst i czasy ----------

function najnowszaRolka(projekt) {
  const porz = czytajJsonCicho(path.join(projekt, 'porzadek.json'));
  if (porz && porz.rolka && fs.existsSync(path.join(projekt, porz.rolka))) return path.join(projekt, porz.rolka);
  const folder = path.join(projekt, 'renders');
  if (!fs.existsSync(folder)) return null;
  const pliki = fs
    .readdirSync(folder)
    .filter((f) => /\.mp4$/i.test(f) && !/-telefon|warianty/i.test(f))
    .map((f) => path.join(folder, f))
    .sort((a, b) => fs.statSync(b).mtimeMs - fs.statSync(a).mtimeMs);
  return pliki[0] || null;
}

function start(argumenty) {
  const nowa = flaga(argumenty, '--nowa');
  const s = sciezki(argumenty[0]);
  // nowa karuzela z tej samej rolki: poprzednia odkladana obok, nic nie ginie
  if (nowa && fs.existsSync(s.slajdy) && fs.readdirSync(s.slajdy).length) {
    const cel = path.join(s.karuzela, `poprzednia-${new Date().toISOString().slice(0, 16).replace(/[-:T]/g, '')}`);
    fs.mkdirSync(cel, { recursive: true });
    for (const f of ['slajdy', 'gotowe', 'strona']) if (fs.existsSync(path.join(s.karuzela, f))) fs.renameSync(path.join(s.karuzela, f), path.join(cel, f));
    wypisz(`INFO poprzednia karuzela odlozona do ${cel}`);
  }
  const edl = czytajJson(path.join(s.projekt, 'edl.json'), 'brak edl.json - to nie jest projekt rolki zmontowanej w Studio');
  const zrodla = czytajJson(path.join(s.projekt, 'zrodla.json'), 'brak zrodla.json w projekcie rolki');
  const rolka = najnowszaRolka(s.projekt);
  if (!rolka) blad('w projekcie nie ma gotowej rolki (folder renders)');
  for (const f of [s.assets, s.slajdy, s.work, s.gotowe]) fs.mkdirSync(f, { recursive: true });

  const dlRolki = dlugosc(rolka);
  const suma = edl.reduce((a, e) => a + (e.do - e.od), 0);
  const tempo = suma > 0 && dlRolki > 0 ? suma / dlRolki : 1;
  let t = 0;
  const fragmenty = edl.map((e) => {
    const dl = (e.do - e.od) / tempo;
    const f = { id: e.id, tekst: e.tekst || '', klip: e.klip, nagranie: zrodla[e.klip] || null, od: e.od, do: e.do, w_rolce_od: r2(t), w_rolce_do: r2(t + dl) };
    t += dl;
    return f;
  });
  const brak = [...new Set(fragmenty.filter((f) => !f.nagranie || !fs.existsSync(f.nagranie)).map((f) => f.klip))];
  zapiszJson(s.rolka, { rolka: path.relative(s.projekt, rolka), dlugosc: r2(dlRolki), tempo: r2(tempo), fragmenty });

  // marka z Lookbooka i wybory karuzeli
  const marka = czytajJsonCicho(path.join(DOM, 'moj-brand.json'), {});
  const wybory = czytajJsonCicho(path.join(DOM, 'moj-karuzela.json'), null);
  fs.writeFileSync(path.join(s.karuzela, 'marka.css'), markaCss(marka, wybory));
  for (const f of ['slajd.css', 'caveat-600.woff2']) fs.copyFileSync(path.join(SZABLON, f), path.join(s.assets, f));
  // zdjecie profilowe: zapisane w moj-karuzela.json, a gdy go nie ma - profile_*.jpg z projektu
  const zapisane = wybory && wybory.zdjecie_profilowe && fs.existsSync(wybory.zdjecie_profilowe) ? wybory.zdjecie_profilowe : null;
  const profil = zapisane || znajdzProfil(s.projekt);
  if (profil) ffWymagane(['-i', profil, '-vf', 'scale=256:256:force_original_aspect_ratio=increase,crop=256:256', '-q:v', '2', path.join(s.assets, 'profil.jpg')], 'zdjecie profilowe');

  wypisz(`INFO rolka ${path.relative(s.projekt, rolka)} (${mmss(dlRolki)}), tempo ${r2(tempo)}x, fragmentow ${fragmenty.length}`);
  for (const f of fragmenty) wypisz(`FRAGMENT ${f.id} | ${mmss(f.w_rolce_od)}-${mmss(f.w_rolce_do)} | ${f.tekst}`);
  if (brak.length) wypisz(`STATUS brak-nagran ${brak.join(',')} (zdjecia i surowe filmy tylko z gotowej rolki, chyba ze kursantka wskaze nagrania)`);
  wypisz(`STATUS wybory ${wybory ? 'zapisane' : 'BRAK'}`);
  wypisz(`STATUS profil ${fs.existsSync(path.join(s.assets, 'profil.jpg')) ? 'jest' : 'BRAK'}`);
  wypisz(`WYNIK OK ${s.karuzela}`);
}

function znajdzProfil(projekt) {
  const kandydaci = [];
  const szukaj = (folder, glebokosc) => {
    if (glebokosc < 0 || !fs.existsSync(folder)) return;
    for (const w of fs.readdirSync(folder, { withFileTypes: true })) {
      if (w.name.startsWith('.') || w.name === 'karuzela') continue;
      const p = path.join(folder, w.name);
      if (w.isDirectory()) szukaj(p, glebokosc - 1);
      else if (/^(profil|profile|avatar)([_-][a-z0-9]+)?\.(jpe?g|png)$/i.test(w.name) && !/gora|naglowek|header|baner/i.test(w.name)) kandydaci.push(p);
    }
  };
  szukaj(projekt, 3);
  return kandydaci[0] || null;
}

const CZCIONKI = {
  nunito: 'Nunito', montserrat: 'Montserrat', inter: 'Inter', poppins: 'Poppins', 'dm-sans': 'DM Sans',
  oswald: 'Oswald', 'playfair-display': 'Playfair Display', 'space-grotesk': 'Space Grotesk', figtree: 'Figtree',
};

// kolor tekstu na tle: bialy na ciemnym, ciemny na jasnym (wieksza roznica jasnosci)
function naTle(hex) {
  const m = /^#?([0-9a-f]{6})$/i.exec(String(hex).trim());
  if (!m) return '#1E1B2E';
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(m[1].slice(i, i + 2), 16) / 255).map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  const L = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  const zBialym = 1.05 / (L + 0.05), zCiemnym = (L + 0.05) / 0.0622; // 0.0622 = jasnosc #1E1B2E + 0.05
  return zBialym >= zCiemnym ? '#FFFFFF' : '#1E1B2E';
}

function markaCss(marka, wybory) {
  const k = marka.kolory || {};
  const tla = ((marka.plotno && marka.plotno.kolory) || []).map((x) => x.kolor).filter(Boolean);
  const wl = (wybory && wybory.kolory && wybory.kolory !== 'lookbook' && typeof wybory.kolory === 'object') ? wybory.kolory : null;
  const t = (wl && wl.tla) || tla;
  const tlo = (i, d) => t[i] || d;
  const nazwa = (marka.czcionki && marka.czcionki.akcent) || 'nunito';
  const czcionka = (wl && wl.czcionka) || CZCIONKI[nazwa] || nazwa.replace(/-/g, ' ').replace(/\b\w/g, (z) => z.toUpperCase());
  return `/* Z Lookbooka kursantki (moj-brand.json) i jej wyborow karuzeli (moj-karuzela.json). Robi to: karuzela.mjs start */
:root {
  --tlo-1: ${tlo(0, '#6C4BEF')};
  --tlo-2: ${tlo(1, '#9CC8FF')};
  --tlo-3: ${tlo(2, '#F5C9D8')};
  --tlo-jasne: #FAF8F5;
  --akcent: ${(wl && wl.akcent) || k.akcent || '#FFD166'};
  --ciemny: #1E1B2E;
  --szary: #4F4C63;
  --na-1: ${naTle(tlo(0, '#6C4BEF'))};
  --na-2: ${naTle(tlo(1, '#9CC8FF'))};
  --na-3: ${naTle(tlo(2, '#F5C9D8'))};
  --czcionka: '${czcionka}', 'Nunito', sans-serif;
  --odreczna: 'Caveat', cursive;
}
`;
}

// ---------- twarze: wybor zdjec ----------

function fragmentyRolki(s) {
  return czytajJson(s.rolka, 'najpierw uruchom: start <projekt>').fragmenty;
}

function twarze(argumenty) {
  const co = parseFloat(opcja(argumenty, '--co', '0.5'));
  const s = sciezki(argumenty[0]);
  const fr = fragmentyRolki(s).filter((f) => f.nagranie && fs.existsSync(f.nagranie));
  if (!fr.length) blad('brak oryginalnych nagran - wybierz klatki z gotowej rolki (klatka ... --z gotowe)');
  const kafle = [];
  for (const f of fr) for (let t = 0; t < f.do - f.od - 0.05; t += co) kafle.push({ id: f.id, nagranie: f.nagranie, t: r2(t), abs: r2(f.od + t) });
  const NA_ARKUSZ = 48; // 8 x 6
  const tmp = path.join(s.work, 'twarze-tmp');
  fs.rmSync(tmp, { recursive: true, force: true });
  fs.mkdirSync(tmp, { recursive: true });
  kafle.forEach((k, i) => {
    ffWymagane(['-ss', String(k.abs), '-i', k.nagranie, '-frames:v', '1', '-vf', 'scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,crop=760:900:160:260,scale=190:225', '-q:v', '4', path.join(tmp, `${String(i).padStart(4, '0')}.jpg`)], `klatka ${k.id} ${k.t}`);
  });
  const arkusze = Math.ceil(kafle.length / NA_ARKUSZ);
  for (let a = 0; a < arkusze; a++) {
    const wyj = path.join(s.work, `twarze-${a + 1}.jpg`);
    ffWymagane(['-start_number', String(a * NA_ARKUSZ), '-i', path.join(tmp, '%04d.jpg'), '-frames:v', '1', '-vf', 'tile=8x6:padding=4:color=white', wyj], 'arkusz twarzy');
    wypisz(`ARKUSZ ${wyj} (kafelki ${a * NA_ARKUSZ + 1}-${Math.min(kafle.length, (a + 1) * NA_ARKUSZ)}, 8 w rzedzie, czytaj od lewej)`);
  }
  fs.rmSync(tmp, { recursive: true, force: true });
  zapiszJson(path.join(s.work, 'twarze.json'), kafle.map((k, i) => ({ kafelek: i + 1, fragment: k.id, sekunda: k.t })));
  wypisz(`INFO kafelek N = wpis N w ${path.join(s.work, 'twarze.json')} (fragment i sekunda od jego poczatku)`);
  wypisz(`WYNIK OK ${kafle.length} kafelkow`);
}

// ---------- klatki i zdjecia ----------

function klatka(argumenty) {
  const z = opcja(argumenty, '--z', 'surowe');
  const [projekt, id, sek, nazwa] = argumenty;
  const s = sciezki(projekt);
  if (!id || sek === undefined || !nazwa) blad('uzycie: klatka <projekt> <fragment> <sekunda> <nazwa> [--z gotowe]');
  const dane = czytajJson(s.rolka, 'najpierw uruchom: start <projekt>');
  const f = dane.fragmenty.find((x) => x.id === id);
  if (!f) blad(`nie ma fragmentu ${id}`);
  const t = parseFloat(sek);
  let plik, czas;
  if (z === 'gotowe') {
    plik = path.join(s.projekt, dane.rolka);
    czas = f.w_rolce_od + t / dane.tempo;
  } else {
    if (!f.nagranie || !fs.existsSync(f.nagranie)) blad(`brak nagrania ${f.klip} - uzyj --z gotowe`);
    plik = f.nagranie;
    czas = f.od + t;
  }
  const wyj = path.join(s.assets, `${nazwa}.jpg`);
  ffWymagane(['-ss', String(r2(czas)), '-i', plik, '-frames:v', '1', '-vf', 'scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920', '-q:v', '1', wyj], 'klatka');
  wypisz(`WYNIK OK ${wyj}`);
}

function zdjecie(argumenty) {
  const [projekt, plik, nazwa] = argumenty;
  const s = sciezki(projekt);
  if (!plik || !nazwa || !fs.existsSync(plik)) blad('uzycie: zdjecie <projekt> <plik> <nazwa>');
  const wyj = path.join(s.assets, `${nazwa}.jpg`);
  let r = ff(['-y', '-i', plik, '-frames:v', '1', '-vf', "scale='min(2000,iw)':-2", '-q:v', '1', wyj]);
  if (!r.ok && process.platform === 'darwin') {
    // HEIC z iPhone'a: sips jest w kazdym macOS
    const tmp = path.join(s.work, `${nazwa}-heic.jpg`);
    r = uruchom('/usr/bin/sips', ['-s', 'format', 'jpeg', plik, '--out', tmp]);
    if (r.ok) r = ff(['-y', '-i', tmp, '-frames:v', '1', '-vf', "scale='min(2000,iw)':-2", '-q:v', '1', wyj]);
  }
  if (!r.ok) blad('nie udalo sie odczytac zdjecia');
  wypisz(`WYNIK OK ${wyj}`);
}

// ---------- wyciecie z czystymi wlosami (bez Pythona: piksele w Node) ----------

function wymiary(plik) {
  const r = ffprobe(['-select_streams', 'v:0', '-show_entries', 'stream=width,height', '-of', 'csv=p=0', plik]);
  const [w, h] = r.out.trim().split(',').map(Number);
  if (!w || !h) blad(`nie mozna odczytac wymiarow ${plik}`);
  return { w, h };
}

function czytajRgba(plik, w, h) {
  const r = ff(['-i', plik, '-vf', `scale=${w}:${h}`, '-f', 'rawvideo', '-pix_fmt', 'rgba', '-'], { binarnie: true, timeout: 120000 });
  if (!r.ok || !r.out || r.out.length !== w * h * 4) blad(`nie mozna odczytac pikseli ${plik}`);
  return r.out;
}

function zapiszRgba(bufor, w, h, plik) {
  const r = ff(['-y', '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', `${w}x${h}`, '-i', '-', '-frames:v', '1', plik], { wejscie: bufor, timeout: 120000 });
  if (!r.ok) blad(`nie mozna zapisac ${plik}`);
}

function calka(m, w, h) {
  const I = new Float64Array((w + 1) * (h + 1));
  for (let y = 0; y < h; y++) {
    let wiersz = 0;
    for (let x = 0; x < w; x++) {
      wiersz += m[y * w + x];
      I[(y + 1) * (w + 1) + x + 1] = I[y * (w + 1) + x + 1] + wiersz;
    }
  }
  return I;
}

function sumaOkna(I, w, h, x, y, r) {
  const x0 = Math.max(0, x - r), y0 = Math.max(0, y - r), x1 = Math.min(w, x + r + 1), y1 = Math.min(h, y + r + 1);
  const W1 = w + 1;
  return { s: I[y1 * W1 + x1] - I[y0 * W1 + x1] - I[y1 * W1 + x0] + I[y0 * W1 + x0], n: (x1 - x0) * (y1 - y0) };
}

function erozja(m, w, h, r) {
  const I = calka(m, w, h), o = new Uint8Array(w * h);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const { s, n } = sumaOkna(I, w, h, x, y, r); o[y * w + x] = s >= n ? 1 : 0; }
  return o;
}

function dylatacja(m, w, h, r) {
  const I = calka(m, w, h), o = new Uint8Array(w * h);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) o[y * w + x] = sumaOkna(I, w, h, x, y, r).s > 0 ? 1 : 0;
  return o;
}

function rozmycie(m, w, h, r, przejscia = 3) {
  let a = Float64Array.from(m);
  for (let p = 0; p < przejscia; p++) {
    const I = calka(a, w, h), o = new Float64Array(w * h);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const { s, n } = sumaOkna(I, w, h, x, y, r); o[y * w + x] = s / n; }
    a = o;
  }
  return a;
}

function mediana(wartosci) {
  if (!wartosci.length) return null;
  const k = [0, 1, 2].map((c) => {
    const h = new Uint32Array(256);
    for (const v of wartosci) h[v[c]]++;
    let s = 0;
    for (let i = 0; i < 256; i++) { s += h[i]; if (s >= wartosci.length / 2) return i; }
    return 255;
  });
  return k;
}

function czystyBrzeg(foto, alfa, w, h) {
  // 1. kolor sciany i ciemnego tla (kanapy) z miejsc, gdzie postaci nie ma
  const sciana = [], ciemne = [];
  for (let i = 0; i < w * h; i += 7) {
    if (alfa[i] >= 10) continue;
    const p = [foto[i * 4], foto[i * 4 + 1], foto[i * 4 + 2]];
    (p[0] + p[1] + p[2] > 300 ? sciana : ciemne).push(p);
  }
  const kS = mediana(sciana), kC = mediana(ciemne);
  // 2. pas przy brzegu postaci (do ~22 px w glab)
  const maska = new Uint8Array(w * h);
  for (let i = 0; i < w * h; i++) maska[i] = alfa[i] > 128 ? 1 : 0;
  const rdzen = erozja(maska, w, h, 22);
  // 3. w pasie: szare, malo nasycone piksele w kolorze tla = resztki sciany
  const a2 = new Uint8Array(w * h);
  let usuniete = 0;
  for (let i = 0; i < w * h; i++) {
    let a = maska[i];
    if (a && !rdzen[i]) {
      const r = foto[i * 4], g = foto[i * 4 + 1], b = foto[i * 4 + 2];
      const mx = Math.max(r, g, b), mn = Math.min(r, g, b);
      const nas = (mx - mn) / Math.max(mx, 1);
      const d = (k) => (k ? Math.hypot(r - k[0], g - k[1], b - k[2]) : 999);
      if (nas < 0.11 && (d(kS) < 26 || d(kC) < 22)) { a = 0; usuniete++; }
    }
    a2[i] = a;
  }
  // 4. gladki kontur: bez drobinek, bez dziurek, miekki brzeg
  let m = dylatacja(erozja(a2, w, h, 5), w, h, 5);
  m = erozja(dylatacja(m, w, h, 5), w, h, 5);
  const gl = rozmycie(m, w, h, 3);
  const prog = new Uint8Array(w * h);
  for (let i = 0; i < w * h; i++) prog[i] = gl[i] > 0.5 ? 1 : 0;
  const koniec = rozmycie(erozja(prog, w, h, 1), w, h, 1, 2);
  // gdzie postac dotyka brzegu kadru (sweter, ramie): tam brzeg sie miekko wtapia, zeby nie bylo prostej linii
  const krawedzie = [];
  const od = {};
  const dotyka = (kol) => { let n = 0, pierwszy = -1; for (let y = 0; y < h; y++) if (koniec[y * w + kol] > 0.5) { n++; if (pierwszy < 0) pierwszy = y; } return n > h * 0.03 ? pierwszy / h : null; };
  const l = dotyka(1), p = dotyka(w - 2);
  if (l !== null) { krawedzie.push('lewo'); od.lewo = r2(l * 100); }
  if (p !== null) { krawedzie.push('prawo'); od.prawo = r2(p * 100); }
  { let n = 0; for (let x = 0; x < w; x++) if (koniec[(h - 2) * w + x] > 0.5) n++; if (n > w * 0.05) krawedzie.push('dol'); }
  const F = Math.round(w * 0.13);
  const gladko = (t) => t * t * (3 - 2 * t);
  for (let y = 0; y < h; y++) for (let x = 0; x < F; x++) {
    const k = gladko(x / F);
    if (od.lewo !== undefined && od.lewo >= 75) koniec[y * w + x] *= k;
    if (od.prawo !== undefined && od.prawo >= 75) koniec[y * w + (w - 1 - x)] *= k;
  }
  const wyj = Buffer.alloc(w * h * 4);
  for (let i = 0; i < w * h; i++) {
    wyj[i * 4] = foto[i * 4]; wyj[i * 4 + 1] = foto[i * 4 + 1]; wyj[i * 4 + 2] = foto[i * 4 + 2];
    wyj[i * 4 + 3] = Math.round(Math.min(1, koniec[i]) * 255);
  }
  return { wyj, usuniete, alfaKoniec: koniec, krawedzie, od };
}

function polozenieGlowy(alfa, w, h) {
  // czubek glowy = pierwszy wiersz z postacia; szerokosc glowy z wlosami kawalek nizej
  let gora = -1;
  for (let y = 0; y < h && gora < 0; y++) {
    let n = 0;
    for (let x = 0; x < w; x++) if (alfa[y * w + x] > 0.5) n++;
    if (n > w * 0.03) gora = y;
  }
  if (gora < 0) return null;
  const y = Math.min(h - 1, gora + Math.round(h * 0.13));
  let l = -1, p = -1;
  for (let x = 0; x < w; x++) if (alfa[y * w + x] > 0.5) { if (l < 0) l = x; p = x; }
  const szer = Math.max(1, p - l);
  const wys = Math.round(szer * 1.08);
  return { x: r2((l / w) * 100), y: r2((gora / h) * 100), w: r2((szer / w) * 100), h: r2((Math.min(h - gora, wys) / h) * 100) };
}

function modelWycinania() {
  return fs.existsSync(path.join(os.homedir(), '.cache', 'hyperframes', 'background-removal', 'models', 'u2net_human_seg.onnx'));
}

function wytnij(argumenty) {
  const zgoda = flaga(argumenty, '--zgoda');
  const bez = flaga(argumenty, '--bez-wyciecia');
  const [projekt, nazwa] = argumenty;
  const s = sciezki(projekt);
  const foto = path.join(s.assets, `${nazwa}.jpg`);
  if (!nazwa || !fs.existsSync(foto)) blad('uzycie: wytnij <projekt> <nazwa> (najpierw klatka albo zdjecie)');
  if (!modelWycinania() && !zgoda) {
    wypisz('STATUS potrzebna-zgoda HyperFrames przy pierwszym wycinaniu pobiera model (~390 MB)');
    wypisz('WYNIK CZEKA');
    return;
  }
  const surowe = path.join(s.work, `${nazwa}-model.png`);
  wypisz('KROK wycinanie z tla');
  const r = hf(['remove-background', foto, '-o', surowe], { timeout: 900000 });
  if (!r.ok || !fs.existsSync(surowe)) {
    wypisz(`INFO ${(r.err || r.out).trim().split(/\r?\n/).slice(-2).join(' | ')}`);
    blad('wycinanie z tla nie powiodlo sie');
  }
  const { w, h } = wymiary(foto);
  const px = czytajRgba(foto, w, h);
  const al = czytajRgba(surowe, w, h);
  const alfa = new Uint8Array(w * h);
  for (let i = 0; i < w * h; i++) alfa[i] = al[i * 4 + 3];
  wypisz('KROK czyszczenie brzegu wlosow');
  const { wyj, usuniete, alfaKoniec, krawedzie, od } = czystyBrzeg(px, alfa, w, h);
  const glowa = polozenieGlowy(alfaKoniec, w, h);
  if (glowa) zapiszJson(path.join(s.assets, `${nazwa}.twarz.json`), { ...glowa, krawedzie, krawedzie_od: od, opis: 'glowa z wlosami w % zdjecia: x, y (czubek), szerokosc, wysokosc do brody; krawedzie = gdzie postac dotyka brzegu kadru; krawedzie_od = od ktorego % wysokosci zdjecia' });
  if (krawedzie.length) wypisz(`INFO postac dotyka brzegu kadru: ${krawedzie.map((k) => (od[k] !== undefined ? `${k} od ${od[k]}% wysokosci` : k)).join(', ')}`);
  const wysoko = Object.entries(od).filter(([, v]) => v < 75).map(([k]) => k);
  for (const k of wysoko) wypisz(`STATUS ucieta-${k} reka albo ramie uciete brzegiem kadru: ta strona do ${k === 'lewo' ? 'lewej' : 'prawej'} krawedzi slajdu, przykryta karta albo miekko rozmyta (klasa miekko-${k})`);
  if (wysoko.length === 2) wypisz('INFO uciete z obu stron: jedna strona do krawedzi, druga przykryta albo rozmyta - a gdy wyglada to slabo, inna klatka albo zdjecie');
  if (!bez) {
    const cel = path.join(s.assets, `${nazwa}-wyciecie.png`);
    zapiszRgba(wyj, w, h, cel);
    // kontrola: wyciecie na jednolitym tle
    ffWymagane(['-f', 'lavfi', '-i', `color=c=0x6C4BEF:s=${w}x${h}`, '-i', cel, '-filter_complex', '[0][1]overlay,scale=540:-2', '-frames:v', '1', path.join(s.work, `${nazwa}-kontrola.jpg`)], 'podglad wyciecia');
    wypisz(`INFO resztki tla usuniete: ${usuniete} px; obejrzyj ${path.join(s.work, `${nazwa}-kontrola.jpg`)}`);
    wypisz(`WYNIK OK ${cel}`);
  } else {
    wypisz(`WYNIK OK ${path.join(s.assets, `${nazwa}.twarz.json`)}`);
  }
  fs.rmSync(surowe, { force: true });
}

// ---------- fragmenty filmowe ----------

function fragment(argumenty) {
  const z = opcja(argumenty, '--z', 'gotowe');
  const kadr = opcja(argumenty, '--kadr', '768x1268');
  const od = parseFloat(opcja(argumenty, '--od', '0'));
  const dlOpc = opcja(argumenty, '--dl', null);
  const [projekt, id, nazwa] = argumenty;
  const s = sciezki(projekt);
  if (!id || !nazwa) blad('uzycie: fragment <projekt> <fragment> <nazwa> [--z surowe|gotowe] [--kadr 768x1268] [--od 0] [--dl 7]');
  const dane = czytajJson(s.rolka, 'najpierw uruchom: start <projekt>');
  const i = dane.fragmenty.findIndex((x) => x.id === id);
  if (i < 0) blad(`nie ma fragmentu ${id}`);
  const f = dane.fragmenty[i];
  const [kw, kh] = kadr.split('x').map(Number);
  if (!kw || !kh) blad('kadr podaj jako SZERxWYS, np. 768x1268');
  const dlRolka = f.w_rolce_do - f.w_rolce_od;
  const dl = dlOpc ? parseFloat(dlOpc) : Math.max(3, Math.min(8, r2(dlRolka - od)));
  const wyj = path.join(s.assets, `${nazwa}.mp4`);
  // kadr: cala szerokosc, wysokosc z proporcji, od gory 2% (glowa zostaje w kadrze)
  const ch = Math.min(1920, Math.round((1080 * kh) / kw));
  const cy = Math.round((1920 - ch) * 0.02);
  const vf = `scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,crop=1080:${ch}:0:${cy},scale=${kw}:${kh},fps=30`;
  if (z === 'surowe') {
    if (!f.nagranie || !fs.existsSync(f.nagranie)) blad(`brak nagrania ${f.klip} - surowego fragmentu nie da sie zrobic`);
    // ten sam kawalek co w rolce, w tym samym tempie co rolka
    const t0 = f.od + od * dane.tempo;
    ffWymagane(['-ss', String(r2(t0)), '-t', String(r2(dl * dane.tempo + 0.2)), '-i', f.nagranie, '-an', '-vf', `setpts=PTS/${dane.tempo},${vf}`, '-t', String(dl), '-c:v', 'libx264', '-crf', '20', '-pix_fmt', 'yuv420p', wyj], 'surowy fragment');
  } else {
    const t0 = f.w_rolce_od + od;
    ffWymagane(['-ss', String(r2(t0)), '-t', String(dl), '-i', path.join(s.projekt, dane.rolka), '-an', '-vf', vf, '-c:v', 'libx264', '-crf', '20', '-pix_fmt', 'yuv420p', wyj], 'fragment rolki');
  }
  wypisz(`WYNIK OK ${wyj} (${dl} s, bez dzwieku)`);
}

// ---------- slajdy: skladanie kompozycji ----------

function listaSlajdow(s) {
  if (!fs.existsSync(s.slajdy)) blad('brak folderu slajdy');
  const pliki = fs.readdirSync(s.slajdy).filter((f) => /^\d{2}\.html$/.test(f)).sort();
  if (!pliki.length) blad('w karuzela/slajdy nie ma plikow 01.html, 02.html...');
  return pliki.map((f) => ({ nr: parseInt(f, 10), plik: path.join(s.slajdy, f) }));
}

function sierotki(html) {
  // jednoliterowe slowa nigdy na koncu linii: tylko w tekscie, nie w stylach ani skryptach
  let ile = 0;
  const czesci = html.split(/(<style[\s\S]*?<\/style>|<script[\s\S]*?<\/script>|<[^>]+>)/);
  const wynik = czesci.map((c) => {
    if (!c || c.startsWith('<')) return c;
    return c.replace(/(^|[\s(„"])([aiouwzAIOUWZ])\s+(?=\S)/g, (m, p, l) => { ile++; return `${p}${l}&nbsp;`; });
  });
  return { html: wynik.join(''), ile };
}

function wybory() {
  return czytajJsonCicho(path.join(DOM, 'moj-karuzela.json'), {}) || {};
}

function zbudujJeden(s, sl, ile) {
  let html = fs.readFileSync(sl.plik, 'utf8');
  const naprawa = sierotki(html);
  html = naprawa.html;
  const wyb = wybory();
  // filmy: id, czasy, bez dzwieku
  const filmy = [...html.matchAll(/<video\b[^>]*\bsrc="([^"]+)"/g)].map((m) => m[1]);
  let dl = 1;
  for (const f of filmy) dl = Math.max(dl, dlugosc(path.join(s.karuzela, f)));
  dl = r2(Math.min(15, dl || 1));
  let n = 0;
  html = html.replace(/<video\b([^>]*)>/g, (m, atr) => {
    n++;
    const styl = /style=/.test(atr) ? '' : ' style="display:block; width:100%; height:100%; object-fit:cover;"';
    return `<video id="film${n}" class="clip" data-start="0" data-duration="${dl}" data-track-index="${n + 1}" muted playsinline${styl}${atr.replace(/\s(muted|playsinline|autoplay|loop)(?=[\s>]|$)/g, '')}>`;
  });
  // twarze z plikow .twarz.json
  html = html.replace(/<img\b([^>]*?)\bsrc="assets\/([^"]+?)(-wyciecie)?\.(png|jpe?g)"([^>]*)>/g, (m, a, baza, w, ext, b) => {
    const tw = czytajJsonCicho(path.join(s.assets, `${baza}.twarz.json`));
    if (!tw || /data-twarz=/.test(m)) return m;
    const kr = w && tw.krawedzie && tw.krawedzie.length ? ` data-krawedzie="${tw.krawedzie.map((k) => `${k}:${(tw.krawedzie_od || {})[k] ?? 100}`).join(',')}"` : '';
    return m.replace('<img', `<img data-twarz="${tw.x},${tw.y},${tw.w},${tw.h}"${kr}`);
  });
  // animacje z atrybutow: data-przewin="-240" (przewijanie zrzutu w dol)
  const skrypty = [];
  let a = 0;
  html = html.replace(/<([a-z]+)\b([^>]*?)\bdata-przewin="(-?\d+)"([^>]*)>/g, (m, tag, x, ile2, y) => {
    a++;
    const id = /\bid="([^"]+)"/.exec(m)?.[1] || `przewin${a}`;
    if (!/\bid="/.test(m)) m = m.replace(`<${tag}`, `<${tag} id="${id}"`);
    skrypty.push(`gsap.set('#${id}', { y: 0 }); tl.to('#${id}', { y: ${ile2}, duration: ${r2(dl * 0.55)}, ease: 'power2.inOut' }, ${r2(dl * 0.15)});`);
    return m;
  });
  // wlasne ruchy Claude'a: <script type="text/x-ruch"> tl.to(...) </script>
  html = html.replace(/<script type="text\/x-ruch">([\s\S]*?)<\/script>/g, (m, kod) => { skrypty.push(kod.trim()); return ''; });
  // konto i numer slajdu
  const bezKonta = /data-bez-konta/.test(html);
  const konto = wyb.konto || '';
  const kontoHtml = !bezKonta && konto
    ? `<div class="konto${/data-konto-pigulka/.test(html) ? ' pig' : ''}">${fs.existsSync(path.join(s.assets, 'profil.jpg')) ? '<img src="assets/profil.jpg" alt="">' : ''}${esc(konto)}</div>`
    : '';
  const numer = wyb.numer_slajdu ? `<div class="nr">${sl.nr}/${ile}</div>` : '';
  const film = filmy.length > 0;
  // konto i numer wewnatrz slajdu, zeby braly jego kolor
  const ostatni = html.lastIndexOf('</div>');
  if (ostatni > 0) html = html.slice(0, ostatni) + kontoHtml + numer + html.slice(ostatni);
  const korzen = `<div id="root" data-composition-id="main" data-start="0" data-duration="${dl}" data-width="${SW}" data-height="${SH}">`;
  const strona = `<!DOCTYPE html>
<html lang="pl">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=${SW}, height=${SH}">
<script src="https://cdn.jsdelivr.net/npm/gsap@3.15.0/dist/gsap.min.js"></script>
<link rel="stylesheet" href="assets/marka.css">
<link rel="stylesheet" href="assets/slajd.css">
</head>
<body>
${korzen}
${html.trim()}
</div>
<script>
  window.__timelines = window.__timelines || {};
  const tl = gsap.timeline({ paused: true });
  ${skrypty.join('\n  ')}
  tl.set({}, {}, ${dl});
  window.__timelines["main"] = tl;
</script>
</body>
</html>
`;
  const folder = path.join(s.work, 'slajdy', nn(sl.nr));
  fs.rmSync(folder, { recursive: true, force: true });
  fs.mkdirSync(path.join(folder, 'assets'), { recursive: true });
  fs.writeFileSync(path.join(folder, 'index.html'), strona);
  // tylko uzyte pliki (twarde dowiazanie, a gdy sie nie da - kopia)
  const uzyte = new Set(['marka.css', 'slajd.css', 'caveat-600.woff2', 'profil.jpg']);
  for (const m of strona.matchAll(/assets\/([^"')\s]+)/g)) uzyte.add(m[1]);
  fs.copyFileSync(path.join(s.karuzela, 'marka.css'), path.join(folder, 'assets', 'marka.css'));
  for (const f of uzyte) {
    if (f === 'marka.css') continue;
    const z = path.join(s.assets, f);
    if (!fs.existsSync(z)) { if (f !== 'profil.jpg') wypisz(`STATUS brak-pliku slajd ${nn(sl.nr)}: assets/${f}`); continue; }
    const c = path.join(folder, 'assets', f);
    fs.mkdirSync(path.dirname(c), { recursive: true });
    try { fs.linkSync(z, c); } catch { fs.copyFileSync(z, c); }
  }
  return { folder, film, dl, sierotki: naprawa.ile };
}

function zbuduj(argumenty) {
  const s = sciezki(argumenty[0]);
  const lista = listaSlajdow(s);
  const wynik = lista.map((sl) => ({ ...sl, ...zbudujJeden(s, sl, lista.length) }));
  for (const w of wynik) wypisz(`SLAJD ${nn(w.nr)} ${w.film ? `film ${w.dl} s` : 'obraz'}${w.sierotki ? `, sierotki naprawione: ${w.sierotki}` : ''}`);
  zapiszJson(path.join(s.work, 'slajdy.json'), wynik.map(({ nr, folder, film, dl }) => ({ nr, folder, film, dl })));
  wypisz(`WYNIK OK ${wynik.length} slajdow`);
  return wynik;
}

// ---------- kontrola ----------

function kontrola(argumenty) {
  const s = sciezki(argumenty[0]);
  const wynik = zbuduj([argumenty[0]]);
  const skrypt = fs.readFileSync(path.join(SZABLON, 'kontrola.js'), 'utf8')
    .replace('__STREFA__', JSON.stringify(STREFA)).replace('__SW__', String(SW)).replace('__SH__', String(SH));
  const kl = path.join(s.work, 'kontrola');
  fs.rmSync(kl, { recursive: true, force: true });
  fs.mkdirSync(kl, { recursive: true });
  for (const w of wynik) {
    const dir = path.join(s.work, 'kontrola-kompozycje', nn(w.nr));
    fs.rmSync(dir, { recursive: true, force: true });
    fs.cpSync(w.folder, dir, { recursive: true });
    let html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8');
    // obok slajdu pole z opisem bledow: kompozycja szersza o 640 px
    html = html.replace(`data-width="${SW}"`, `data-width="${SW + 640}"`)
      .replace(`content="width=${SW}`, `content="width=${SW + 640}`)
      .replace('</body>', `<script>${skrypt}</script>\n</body>`);
    fs.writeFileSync(path.join(dir, 'index.html'), html);
    const t = r2(Math.min(w.dl * 0.6, Math.max(0.3, w.dl - 0.5)));
    const r = hf(['snapshot', '.', '--at', String(t), '--no-end', '-o', path.resolve(kl, `s${nn(w.nr)}`)], { cwd: dir, timeout: 600000 });
    const png = fs.existsSync(path.join(kl, `s${nn(w.nr)}`)) ? fs.readdirSync(path.join(kl, `s${nn(w.nr)}`)).find((f) => /^frame-.*\.png$/.test(f)) : null;
    if (!r.ok || !png) { wypisz(`STATUS blad-kontroli slajd ${nn(w.nr)}`); continue; }
    fs.renameSync(path.join(kl, `s${nn(w.nr)}`, png), path.join(kl, `${nn(w.nr)}.png`));
    fs.rmSync(path.join(kl, `s${nn(w.nr)}`), { recursive: true, force: true });
    const lint = hf(['check', '.'], { cwd: w.folder, timeout: 600000 });
    const linie = (lint.out + lint.err).split(/\r?\n/).filter((l) => /✗/.test(l));
    const kontrast = linie.filter((l) => /\d(\.\d+)?:1 \(need/.test(l));
    if (kontrast.length) wypisz(`UWAGA slajd ${nn(w.nr)}: SLABY KONTRAST tekstu z tlem (${kontrast.length} miejsc) - zmien kolor tekstu albo tla`);
    for (const b of linie.filter((l) => !kontrast.includes(l)).slice(0, 3)) wypisz(`UWAGA slajd ${nn(w.nr)}: ${b.trim()}`);
  }
  fs.rmSync(path.join(s.work, 'kontrola-kompozycje'), { recursive: true, force: true });
  const pliki = fs.readdirSync(kl).filter((f) => /^\d{2}\.png$/.test(f)).sort();
  if (pliki.length) {
    ffWymagane(['-framerate', '1', '-pattern_type', 'sequence', '-start_number', String(parseInt(pliki[0], 10)), '-i', path.join(kl, '%02d.png'), '-frames:v', '1', '-vf', `scale=${Math.round((SW + 640) / 3)}:-2,tile=${Math.min(4, pliki.length)}x${Math.ceil(pliki.length / 4)}:padding=6:color=white`, path.join(s.work, 'kontrola.jpg')], 'arkusz kontroli');
  }
  wypisz(`INFO obejrzyj ${path.join(s.work, 'kontrola.jpg')} i kazdy slajd z uwaga w ${kl} (prawa strona: lista bledow; czerwone linie = strefa bezpieczna, zielona ramka = glowa)`);
  wypisz(`WYNIK OK ${pliki.length} slajdow`);
}

// ---------- render ----------

function render(argumenty) {
  const tylko = (opcja(argumenty, '--nr', '') || '').split(',').filter(Boolean).map(Number);
  const s = sciezki(argumenty[0]);
  const wynik = zbuduj([argumenty[0]]).filter((w) => !tylko.length || tylko.includes(w.nr));
  fs.mkdirSync(s.gotowe, { recursive: true });
  for (const w of wynik) {
    const baza = path.join(s.gotowe, `slajd-${nn(w.nr)}`);
    for (const ext of ['.png', '.mp4']) fs.rmSync(baza + ext, { force: true });
    if (w.film) {
      wypisz(`KROK film slajdu ${nn(w.nr)} (${w.dl} s)`);
      const r = hf(['render', '.', '-o', path.resolve(baza + '.mp4'), '-q', 'delivery'], { cwd: w.folder, timeout: 1800000 });
      if (!r.ok || !fs.existsSync(baza + '.mp4')) { wypisz(`INFO ${(r.err || r.out).trim().split(/\r?\n/).slice(-2).join(' | ')}`); blad(`render slajdu ${nn(w.nr)} nie powiodl sie`); }
    } else {
      const tmp = path.join(s.work, 'render-tmp');
      fs.rmSync(tmp, { recursive: true, force: true });
      const r = hf(['snapshot', '.', '--at', '0.5', '--no-end', '-o', path.resolve(tmp)], { cwd: w.folder, timeout: 600000 });
      const png = fs.existsSync(tmp) ? fs.readdirSync(tmp).find((f) => /^frame-.*\.png$/.test(f)) : null;
      if (!r.ok || !png) blad(`obraz slajdu ${nn(w.nr)} nie powiodl sie`);
      fs.renameSync(path.join(tmp, png), baza + '.png');
      fs.rmSync(tmp, { recursive: true, force: true });
    }
    wypisz(`GOTOWE ${path.basename(baza)}${w.film ? '.mp4' : '.png'}`);
  }
  wypisz(`WYNIK OK ${s.gotowe}`);
}

// ---------- strona (storyboard) ----------

function strona(argumenty) {
  const [projekt, opisPlik] = argumenty;
  const s = sciezki(projekt);
  const opis = czytajJson(opisPlik, 'brak opisu strony (opis.json)');
  const pliki = fs.existsSync(s.gotowe) ? fs.readdirSync(s.gotowe).filter((f) => /^slajd-\d{2}\.(png|mp4)$/.test(f)).sort() : [];
  if (!pliki.length) blad('najpierw: render <projekt>');
  const kl = path.join(s.strona, 'kl');
  fs.rmSync(s.strona, { recursive: true, force: true });
  fs.mkdirSync(kl, { recursive: true });
  const slajdy = pliki.map((f) => {
    const nr = parseInt(f.slice(6, 8), 10);
    const film = f.endsWith('.mp4');
    const src = path.join(s.gotowe, f);
    const jpg = path.join(kl, `s${nn(nr)}.jpg`);
    ffWymagane([...(film ? ['-ss', '1.5'] : []), '-i', src, '-frames:v', '1', '-vf', 'scale=540:-2', '-q:v', '3', jpg], `podglad slajdu ${nr}`);
    if (film) ffWymagane(['-i', src, '-an', '-vf', 'scale=540:-2', '-c:v', 'libx264', '-crf', '27', '-preset', 'slow', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', path.join(kl, `s${nn(nr)}.mp4`)], `film slajdu ${nr}`);
    return { nr, film };
  });
  const o = Object.fromEntries((opis.slajdy || []).map((x) => [x.nr, x]));
  const media = (x, duzy) => x.film
    ? `<video src="kl/s${nn(x.nr)}.mp4" poster="kl/s${nn(x.nr)}.jpg" autoplay muted loop playsinline aria-label="Slajd ${x.nr}, film"></video>`
    : `<img src="kl/s${nn(x.nr)}.jpg" alt="Slajd ${x.nr}"${duzy ? '' : ' loading="lazy"'}>`;
  const sekcje = (opis.sekcje && opis.sekcje.length ? opis.sekcje : [{ tytul: 'Slajdy', nr: slajdy.map((x) => x.nr) }]).map((sek) => {
    const figs = slajdy.filter((x) => sek.nr.includes(x.nr)).map((x) => {
      const d = o[x.nr] || {};
      return `<figure><button class="ob" data-duze="kl/s${nn(x.nr)}.jpg" data-film="${x.film ? 1 : ''}" aria-label="Slajd ${x.nr}">${media(x)}${x.film ? '<span class="film">film</span>' : ''}<span class="nr">${x.nr}</span></button><figcaption>${d.czas ? `<p class="cz">z rolki ${esc(d.czas)}</p>` : ''}${d.slowa ? `<p class="sl">${esc(d.slowa)}</p>` : ''}${d.opis ? `<p class="op">${esc(d.opis)}</p>` : ''}</figcaption></figure>`;
    }).join('');
    return `<section><h2>${esc(sek.tytul)}</h2><div class="siatka">${figs}</div></section>`;
  }).join('\n');
  const pytania = (opis.pytania || []).length ? `<section class="box"><h2>Do Twojej decyzji</h2><ol>${opis.pytania.map((p) => `<li>${esc(p)}</li>`).join('')}</ol></section>` : '';
  const html = `<title>${esc(opis.tytul || 'Karuzela z rolki')}</title>
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="claude:viewport-fit-sides" content="cover">
<meta charset="utf-8">
<style>
:root { --tlo: #F4F3F8; --pow: #FFFFFF; --tekst: #1D1B2A; --cichy: #5E5B70; --linia: #DEDBE9; --akcent: #5A3BE0; }
@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) { --tlo: #14131B; --pow: #1E1C29; --tekst: #EFEDF7; --cichy: #A9A5BB; --linia: #33303F; --akcent: #AE9BFF; color-scheme: dark; } }
:root[data-theme="dark"] { --tlo: #14131B; --pow: #1E1C29; --tekst: #EFEDF7; --cichy: #A9A5BB; --linia: #33303F; --akcent: #AE9BFF; color-scheme: dark; }
body { margin: 0; background: var(--tlo); color: var(--tekst); font: 500 16px/1.5 system-ui, -apple-system, "Segoe UI", sans-serif; }
.w { max-width: 1360px; margin: 0 auto; padding-left: max(16px, env(safe-area-inset-left, 0px)); padding-right: max(16px, env(safe-area-inset-right, 0px)); padding-block: 32px 64px; }
h1 { margin: 0; font-size: clamp(28px, 4vw, 42px); line-height: 1.1; text-wrap: balance; }
header p { margin: 10px 0 0; max-width: 68ch; color: var(--cichy); }
section { margin-top: 36px; }
h2 { margin: 0 0 14px; padding-top: 18px; border-top: 1px solid var(--linia); font-size: 21px; line-height: 1.2; text-wrap: balance; }
.siatka { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 18px; }
figure { margin: 0; min-width: 0; }
.ob { position: relative; display: block; width: 100%; padding: 0; border: 0; border-radius: 14px; overflow: hidden; background: #000; cursor: zoom-in; aspect-ratio: ${SW} / ${SH}; }
.ob img, .ob video { display: block; width: 100%; height: 100%; object-fit: cover; }
.ob:focus-visible { outline: 3px solid var(--akcent); outline-offset: 2px; }
.nr { position: absolute; left: 8px; top: 8px; min-width: 32px; height: 32px; padding: 0 8px; box-sizing: border-box; border-radius: 16px; background: #fff; color: #1D1B2A; font-weight: 800; font-size: 16px; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 8px rgba(0,0,0,.35); }
.film { position: absolute; right: 8px; top: 8px; padding: 4px 10px; border-radius: 12px; background: #fff; color: #1D1B2A; font-weight: 800; font-size: 12px; letter-spacing: .06em; text-transform: uppercase; box-shadow: 0 2px 8px rgba(0,0,0,.35); }
figcaption p { margin: 0; }
.cz { margin-top: 8px !important; font-size: 13px; font-weight: 700; color: var(--akcent); font-variant-numeric: tabular-nums; }
.sl { font-weight: 700; line-height: 1.3; margin-top: 2px !important; }
.op { margin-top: 4px !important; font-size: 14px; line-height: 1.42; color: var(--cichy); }
.tel { margin-top: 28px; display: flex; gap: 24px; flex-wrap: wrap; align-items: flex-start; }
.ramka { width: min(380px, 100%); background: var(--pow); border: 1px solid var(--linia); border-radius: 22px; padding: 12px; box-sizing: border-box; }
.przew { display: flex; overflow-x: auto; scroll-snap-type: x mandatory; border-radius: 12px; scrollbar-width: none; }
.przew::-webkit-scrollbar { display: none; }
.przew img, .przew video { flex: none; width: 100%; aspect-ratio: ${SW} / ${SH}; object-fit: cover; scroll-snap-align: start; }
.kropki { display: flex; gap: 6px; justify-content: center; margin-top: 10px; }
.kropki i { width: 7px; height: 7px; border-radius: 50%; background: var(--linia); }
.kropki i.on { background: var(--akcent); }
.tel p { margin: 0; max-width: 46ch; color: var(--cichy); }
.box { padding: 20px 24px; background: var(--pow); border: 1px solid var(--linia); border-radius: 16px; }
.box h2 { border: 0; padding: 0; }
.box ol { margin: 0; padding-left: 22px; } .box li { margin-top: 8px; max-width: 75ch; }
#duze { position: fixed; inset: 0; z-index: 20; background: rgba(10,8,20,.9); display: flex; align-items: center; justify-content: center; padding: max(16px, env(safe-area-inset-top, 0px)) max(16px, env(safe-area-inset-right, 0px)) max(16px, env(safe-area-inset-bottom, 0px)) max(16px, env(safe-area-inset-left, 0px)); cursor: zoom-out; }
#duze[hidden] { display: none; }
#duze img { max-width: 100%; max-height: 100%; border-radius: 16px; }
</style>
<div class="w">
<header>
<h1>${esc(opis.tytul || 'Karuzela z rolki')}</h1>
<p>${esc(opis.wstep || 'Prawdziwe slajdy, gotowe do publikacji. Przesuń karuzelę, żeby zobaczyć ją tak, jak zobaczy ją ktoś na Instagramie. Uwagi napisz w rozmowie, podając numer slajdu.')}</p>
</header>
<div class="tel">
<div class="ramka"><div class="przew" id="przew">${slajdy.map((x) => media(x, true)).join('')}</div><div class="kropki" id="kropki">${slajdy.map(() => '<i></i>').join('')}</div></div>
<p>Przesuń palcem albo myszką. Slajdy z napisem „film” są filmami bez dźwięku.</p>
</div>
${sekcje}
${pytania}
</div>
<div id="duze" hidden><img alt="Powiększony slajd"></div>
<script>
const d = document.getElementById('duze'), di = d.querySelector('img');
document.querySelectorAll('.ob').forEach(b => { if (b.dataset.film) { b.style.cursor = 'default'; return; } b.addEventListener('click', () => { di.src = b.dataset.duze; d.hidden = false; }); });
d.addEventListener('click', () => { d.hidden = true; });
document.addEventListener('keydown', ev => { if (ev.key === 'Escape') d.hidden = true; });
const p = document.getElementById('przew'), k = [...document.querySelectorAll('#kropki i')];
const ust = () => { const i = Math.round(p.scrollLeft / p.clientWidth); k.forEach((x, j) => x.classList.toggle('on', j === i)); };
p.addEventListener('scroll', ust, { passive: true }); ust();
</script>
`;
  fs.writeFileSync(path.join(s.strona, 'karuzela.html'), html);
  wypisz(`WYNIK OK ${path.join(s.strona, 'karuzela.html')} (z folderem kl/)`);
}

// ---------- start ----------

const [polecenie, ...reszta] = process.argv.slice(2);
const POLECENIA = { start, twarze, klatka, zdjecie, wytnij, fragment, zbuduj, kontrola, render, strona };
if (!POLECENIA[polecenie]) {
  wypisz('uzycie: karuzela.mjs <polecenie> ... (opis polecen na poczatku pliku)');
  wypisz(`polecenia: ${Object.keys(POLECENIA).join(', ')}`);
  process.exit(polecenie ? 1 : 0);
}
POLECENIA[polecenie](reszta);
