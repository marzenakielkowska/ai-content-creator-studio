#!/usr/bin/env node
// AI Content Creator Studio: skrypty montazowe.
//
//   transkrypcja <plik-wideo>                        transkrybuje audio → words.json
//   klatki-pozycja <plik-wideo>                      3 klatki do wykrycia pozycji (20/50/80%)
//   klatki-sprawdzenie <plik-wideo>                  klatka co 10 klatek → folder sprawdzenie/
//   sprawdz-dzwiek <plik-wideo>                      mierzy peak audio w dB
//   tnij <plik-wideo> <cuts.json> <wyjscie.mp4>      wycina segmenty wg pliku JSON
//   render <projekt-dir> <wyjscie.mp4> [--draft]     renderuje przez HyperFrames
//   overlay-image <plik-wideo> <config.json> <wyjscie.mp4>  nakłada zdjęcia/screenshoty (Python+Pillow)
//
// Wypisuje linie "STATUS ...", "KROK ...", "WYNIK ...". Claude tlumaczy je kursantce.
// Czyta narzedzia.json zapisany przez /studio:start.

import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const DOM = process.env.AI_STUDIO_HOME || path.join(os.homedir(), '.ai-content-studio');
const WIN = process.platform === 'win32';

// ---------- narzedzia ----------

function czytajNarzedzia() {
  const plik = path.join(DOM, 'narzedzia.json');
  if (!fs.existsSync(plik)) {
    wypisz('STATUS blad brak pliku narzedzia.json - najpierw uruchom /studio:start');
    process.exit(1);
  }
  try {
    return JSON.parse(fs.readFileSync(plik, 'utf8'));
  } catch {
    wypisz('STATUS blad nie mozna odczytac narzedzia.json - uruchom /studio:start');
    process.exit(1);
  }
}

function srodowisko(narz) {
  const env = { ...process.env };
  const klucz = Object.keys(env).find((k) => k.toUpperCase() === 'PATH') || 'PATH';
  const dodatki = [path.dirname(narz.node), path.dirname(narz.ffmpeg)];
  env[klucz] = [...dodatki, env[klucz] || ''].join(path.delimiter);
  env.HYPERFRAMES_FFMPEG_PATH = narz.ffmpeg;
  env.HYPERFRAMES_FFPROBE_PATH = narz.ffprobe;
  return env;
}

function wypisz(linia) {
  process.stdout.write(linia + '\n');
}

function uruchom(polecenie, argumenty, opcje = {}) {
  const r = spawnSync(polecenie, argumenty, {
    encoding: 'utf8',
    env: opcje.env || process.env,
    timeout: opcje.timeout || 0,
    maxBuffer: 64 * 1024 * 1024,
    windowsHide: true,
    shell: opcje.shell || false,
  });
  return {
    ok: r.status === 0 && !r.error,
    kod: r.status,
    out: r.stdout || '',
    err: r.stderr || '',
  };
}

function hf(narz, argumenty) {
  return uruchom(narz.node, [narz.hyperframes, ...argumenty], {
    env: srodowisko(narz),
    timeout: 600000,
  });
}

function ff(narz, argumenty, timeout) {
  return uruchom(narz.ffmpeg, argumenty, {
    env: srodowisko(narz),
    timeout: timeout || 300000,
  });
}

function ffprobe(narz, argumenty) {
  return uruchom(narz.ffprobe, argumenty, {
    env: srodowisko(narz),
    timeout: 30000,
  });
}

// ---------- transkrypcja ----------

function transkrypcja(plikWideo) {
  const narz = czytajNarzedzia();

  if (!fs.existsSync(plikWideo)) {
    wypisz(`STATUS blad plik nie istnieje: ${plikWideo}`);
    return false;
  }

  const katalog = path.dirname(plikWideo);
  const wyjscie = path.join(katalog, 'words.json');

  wypisz('KROK transkrypcja start (to moze trwac kilka minut)');

  const r = hf(narz, [
    'transcribe', plikWideo,
    '--model', 'parakeet',
    '--format', 'words',
    '--out', wyjscie,
  ]);

  if (!r.ok || !fs.existsSync(wyjscie)) {
    // Probuj alternatywna skladnie
    const r2 = hf(narz, [
      'transcribe', plikWideo,
      '--out', wyjscie,
    ]);
    if (!r2.ok || !fs.existsSync(wyjscie)) {
      wypisz(`STATUS blad transkrypcja nie powiodla sie (kod ${r.kod})`);
      wypisz(`INFO szczegoly: ${r.err.slice(0, 300)}`);
      return false;
    }
  }

  wypisz(`KROK transkrypcja gotowe`);
  wypisz(`STATUS transkrypcja OK plik=${wyjscie}`);
  return true;
}

// ---------- klatki do wykrycia pozycji ----------

function klatki_pozycja(plikWideo) {
  const narz = czytajNarzedzia();

  if (!fs.existsSync(plikWideo)) {
    wypisz(`STATUS blad plik nie istnieje: ${plikWideo}`);
    return false;
  }

  // Odczytaj dlugosc wideo
  const rDlug = ffprobe(narz, [
    '-v', 'quiet', '-print_format', 'json',
    '-show_format', plikWideo,
  ]);
  if (!rDlug.ok) {
    wypisz('STATUS blad nie mozna odczytac dlugosci wideo');
    return false;
  }
  const info = JSON.parse(rDlug.out);
  const czas = parseFloat(info.format?.duration || '0');
  if (czas < 1) {
    wypisz('STATUS blad wideo jest za krotkie');
    return false;
  }

  const katalog = path.dirname(plikWideo);
  const procenty = [0.2, 0.5, 0.8];
  const pliki = [];

  wypisz('KROK klatki-pozycja start');

  for (let i = 0; i < procenty.length; i++) {
    const t = (czas * procenty[i]).toFixed(3);
    const wyjscie = path.join(katalog, `pozycja_${i + 1}.jpg`);
    const r = ff(narz, [
      '-y',
      '-i', plikWideo,
      '-ss', t,
      '-frames:v', '1',
      '-q:v', '2',
      wyjscie,
    ], 30000);
    if (!r.ok || !fs.existsSync(wyjscie)) {
      wypisz(`STATUS blad nie udalo sie wyciagnac klatki ${i + 1}`);
      return false;
    }
    pliki.push(wyjscie);
  }

  wypisz('KROK klatki-pozycja gotowe');
  wypisz(`STATUS klatki-pozycja OK pliki=${pliki.join(',')}`);
  return true;
}

// ---------- klatki do sprawdzenia draftu ----------

function klatki_sprawdzenie(plikWideo) {
  const narz = czytajNarzedzia();

  if (!fs.existsSync(plikWideo)) {
    wypisz(`STATUS blad plik nie istnieje: ${plikWideo}`);
    return false;
  }

  const katalog = path.dirname(plikWideo);
  const folder = path.join(katalog, 'sprawdzenie');
  fs.mkdirSync(folder, { recursive: true });

  wypisz('KROK klatki-sprawdzenie start');

  // Klatka co 10 klatek przy 30fps = co 0.333 sekundy
  const r = ff(narz, [
    '-y',
    '-i', plikWideo,
    '-vf', 'select=not(mod(n\\,10)),scale=540:-1',
    '-vsync', 'vfr',
    '-q:v', '3',
    path.join(folder, 'klatka_%04d.jpg'),
  ]);

  if (!r.ok) {
    wypisz(`STATUS blad nie udalo sie wyciagnac klatek sprawdzenia (kod ${r.kod})`);
    return false;
  }

  const pliki = fs.readdirSync(folder).filter((f) => f.endsWith('.jpg'));
  wypisz('KROK klatki-sprawdzenie gotowe');
  wypisz(`STATUS klatki-sprawdzenie OK folder=${folder} liczba=${pliki.length}`);
  return true;
}

// ---------- sprawdzenie poziomu dzwieku ----------

function sprawdz_dzwiek(plikWideo) {
  const narz = czytajNarzedzia();

  if (!fs.existsSync(plikWideo)) {
    wypisz(`STATUS blad plik nie istnieje: ${plikWideo}`);
    return false;
  }

  const r = ff(narz, [
    '-i', plikWideo,
    '-af', 'volumedetect',
    '-vn',
    '-f', 'null',
    WIN ? 'NUL' : '/dev/null',
  ]);

  // volumedetect wypisuje do stderr
  const tekst = r.out + r.err;
  const mPeak = tekst.match(/max_volume:\s*([-\d.]+)\s*dB/);

  if (!mPeak) {
    wypisz('STATUS blad nie udalo sie zmierzyc poziomu dzwieku');
    return false;
  }

  const peak = parseFloat(mPeak[1]);
  const status = peak >= -6 ? 'OK' : 'CICHO';
  const brakuje = peak < -6 ? Math.abs(peak + 6).toFixed(1) : '0';

  wypisz(`STATUS dzwiek ${status} peak=${peak}dB brakuje=${brakuje}dB`);
  return true;
}

// ---------- ciecie wideo ----------
//
// Format cuts.json:
// { "klipy": [ {"od": 0.07, "do": 5.3}, {"od": 6.1, "do": 12.7} ] }

function tnij(plikWideo, plikCuts, wyjscie) {
  const narz = czytajNarzedzia();

  for (const [nazwa, wartosc] of [['wideo', plikWideo], ['cuts.json', plikCuts]]) {
    if (!fs.existsSync(wartosc)) {
      wypisz(`STATUS blad plik ${nazwa} nie istnieje: ${wartosc}`);
      return false;
    }
  }

  let cuts;
  try {
    cuts = JSON.parse(fs.readFileSync(plikCuts, 'utf8'));
  } catch {
    wypisz('STATUS blad nie mozna odczytac cuts.json');
    return false;
  }

  if (!Array.isArray(cuts.klipy) || cuts.klipy.length === 0) {
    wypisz('STATUS blad cuts.json nie zawiera klipy[] albo lista jest pusta');
    return false;
  }

  // Plik listy dla concat demuxer
  const katalog = path.dirname(plikWideo);
  const listaPlik = path.join(katalog, '_lista_ciec.txt');
  const linie = cuts.klipy.map((k) =>
    `file '${plikWideo.replace(/'/g, "'\\''")}\'\ninpoint ${k.od}\noutpoint ${k.do}`
  );
  fs.writeFileSync(listaPlik, linie.join('\n') + '\n', 'utf8');

  wypisz(`KROK ciecie start (${cuts.klipy.length} segmentow)`);

  const r = ff(narz, [
    '-y',
    '-f', 'concat',
    '-safe', '0',
    '-i', listaPlik,
    '-c', 'copy',
    wyjscie,
  ]);

  fs.rmSync(listaPlik, { force: true });

  if (!r.ok || !fs.existsSync(wyjscie)) {
    // Jesli copy nie zadzialal - probuj przez rekodowanie (wolniejsze, ale dokladniejsze)
    wypisz('INFO ciecie przez kopiowanie nie powiodlo sie, probuje przez rekodowanie');
    const r2 = ff(narz, [
      '-y',
      '-f', 'concat',
      '-safe', '0',
      '-i', listaPlik + '.tmp',
      '-vf', 'setpts=PTS-STARTPTS',
      '-af', 'asetpts=PTS-STARTPTS',
      '-c:v', 'libx264', '-preset', 'fast', '-crf', '18',
      '-c:a', 'aac', '-b:a', '192k',
      wyjscie,
    ]);
    if (!r2.ok) {
      wypisz(`STATUS blad ciecie nie powiodlo sie (kod ${r2.kod})`);
      wypisz(`INFO szczegoly: ${r2.err.slice(0, 300)}`);
      return false;
    }
  }

  const { size } = fs.statSync(wyjscie);
  if (size < 1000) {
    wypisz('STATUS blad plik wyjsciowy jest za maly - cos poszlo nie tak');
    return false;
  }

  wypisz('KROK ciecie gotowe');
  wypisz(`STATUS ciecie OK plik=${wyjscie} segmentow=${cuts.klipy.length}`);
  return true;
}

// ---------- overlay-image ----------
//
// Nakłada zdjęcia/screenshoty na wideo z animacją pop-in, dźwiękiem snap i czerwonym kółkiem.
// Wymaga Pythona 3 z zainstalowaną biblioteką Pillow.
// Konfiguracja w pliku JSON (format opisany w overlay_image.py).

function overlay_image(plikWideo, plikConfig, wyjscie) {
  const narz = czytajNarzedzia();

  for (const [nazwa, wartosc] of [['wideo', plikWideo], ['config.json', plikConfig]]) {
    if (!fs.existsSync(wartosc)) {
      wypisz(`STATUS blad plik ${nazwa} nie istnieje: ${wartosc}`);
      return false;
    }
  }

  // Szukaj python3
  const kandydaciPy = ['python3', '/usr/bin/python3', '/usr/local/bin/python3', '/opt/homebrew/bin/python3'];
  let python = null;
  for (const p of kandydaciPy) {
    const r = uruchom(p, ['--version'], { timeout: 5000 });
    if (r.ok) { python = p; break; }
  }
  if (!python) {
    wypisz('STATUS blad Python 3 nie jest zainstalowany lub niedostepny');
    return false;
  }

  const skrypt = path.join(path.dirname(fileURLToPath(import.meta.url)), 'overlay_image.py');
  if (!fs.existsSync(skrypt)) {
    wypisz(`STATUS blad brak skryptu overlay_image.py w ${path.dirname(skrypt)}`);
    return false;
  }

  wypisz('KROK overlay-image start');

  const r = uruchom(python, [skrypt, plikWideo, plikConfig, wyjscie], {
    env: srodowisko(narz),
    timeout: 600000,
  });

  // Przepisz linie KROK/STATUS z Pythona
  for (const linia of (r.out + r.err).split(/\r?\n/).filter(Boolean)) {
    if (/^(STATUS|KROK|INFO|WYNIK)\s/.test(linia)) wypisz(linia);
  }

  if (!r.ok || !fs.existsSync(wyjscie)) {
    const blad = r.err.slice(-300).replace(/\n/g, ' ').trim();
    wypisz(`STATUS blad overlay-image nie powiodl sie (kod ${r.kod}): ${blad}`);
    return false;
  }

  const { size } = fs.statSync(wyjscie);
  if (size < 1000) {
    wypisz('STATUS blad plik wyjsciowy jest za maly — cos poszlo nie tak');
    return false;
  }

  wypisz(`STATUS overlay-image OK plik=${wyjscie}`);
  return true;
}

// ---------- zapisz-wzorzec ----------
//
// Kopiuje wyniki analizuj-wzorzec do osobistej biblioteki na dysku użytkownika:
//   ~/.ai-content-studio/wzorce/<nazwa>/
// Zapisuje pomiary.json, miniaturę i cięcia. Opis efektu (opis.md) pisze Claude.

function zapisz_wzorzec(folderAnalizy, nazwa) {
  if (!folderAnalizy || !nazwa) {
    wypisz('STATUS blad uzycie: zapisz-wzorzec <folder-analizy> <nazwa>');
    return false;
  }
  if (!fs.existsSync(folderAnalizy)) {
    wypisz(`STATUS blad folder analizy nie istnieje: ${folderAnalizy}`);
    return false;
  }
  const plikPom = path.join(folderAnalizy, 'pomiary.json');
  if (!fs.existsSync(plikPom)) {
    wypisz(`STATUS blad brak pomiary.json w ${folderAnalizy} — najpierw uruchom zbadaj-wzorzec`);
    return false;
  }

  const cel = path.join(DOM, 'wzorce', nazwa);
  fs.mkdirSync(cel, { recursive: true });

  fs.copyFileSync(plikPom, path.join(cel, 'pomiary.json'));

  const arkusze = fs.readdirSync(folderAnalizy)
    .filter((f) => f.startsWith('arkusz_') && f.endsWith('.jpg'))
    .sort();
  if (arkusze.length > 0) {
    fs.copyFileSync(path.join(folderAnalizy, arkusze[0]), path.join(cel, 'miniatura.jpg'));
  }

  const plikCiec = path.join(folderAnalizy, 'ciecia.jpg');
  if (fs.existsSync(plikCiec)) {
    fs.copyFileSync(plikCiec, path.join(cel, 'ciecia.jpg'));
  }

  wypisz(`STATUS zapisz-wzorzec OK folder=${cel}`);
  wypisz(`INFO napisz opis.md do folderu ${cel} opisz efekt i jak go odtworzyc`);
  return true;
}

// ---------- lista-wzorcow ----------
//
// Wypisuje co jest zapisane w ~/.ai-content-studio/wzorce/.
// Dla każdego wzorca czyta pierwszą linię opis.md.

function lista_wzorcow() {
  const folder = path.join(DOM, 'wzorce');
  if (!fs.existsSync(folder)) {
    wypisz('STATUS lista-wzorcow PUSTA');
    return true;
  }

  let pozycje;
  try {
    pozycje = fs.readdirSync(folder)
      .filter((f) => fs.statSync(path.join(folder, f)).isDirectory());
  } catch {
    wypisz('STATUS lista-wzorcow PUSTA');
    return true;
  }

  if (pozycje.length === 0) {
    wypisz('STATUS lista-wzorcow PUSTA');
    return true;
  }

  wypisz(`WYNIK lista-wzorcow liczba=${pozycje.length}`);
  for (const nazwa of pozycje) {
    const opisPlik = path.join(folder, nazwa, 'opis.md');
    let pierwszaLinia = '(brak opisu)';
    if (fs.existsSync(opisPlik)) {
      const tresc = fs.readFileSync(opisPlik, 'utf8');
      const linia = tresc.split('\n').find((l) => l.trim());
      if (linia) pierwszaLinia = linia.replace(/^#+\s*/, '').trim();
    }
    wypisz(`WYNIK wzorzec nazwa=${nazwa} opis=${pierwszaLinia}`);
  }
  return true;
}

// ---------- analizuj-wzorzec ----------
//
// Mierzy parametry rolki wzorcowej: cięcia, momenty ruchu, głośność.
// Buduje arkusze klatek (JPG) i pomiary.json do folderu wyjściowego.
// Wymaga Pythona 3 z zainstalowaną biblioteką Pillow.

function analizuj_wzorzec(plikWideo, folderWyj) {
  const narz = czytajNarzedzia();

  const jestUrl = plikWideo.startsWith('http://') || plikWideo.startsWith('https://');
  if (!jestUrl && !fs.existsSync(plikWideo)) {
    wypisz(`STATUS blad plik wideo nie istnieje: ${plikWideo}`);
    return false;
  }

  fs.mkdirSync(folderWyj, { recursive: true });

  const kandydaciPy = WIN
    ? ['python', 'python3', 'py']
    : ['python3', '/usr/bin/python3', '/usr/local/bin/python3', '/opt/homebrew/bin/python3'];
  let python = null;
  for (const p of kandydaciPy) {
    const r = uruchom(p, ['--version'], { timeout: 5000 });
    if (r.ok) { python = p; break; }
  }
  if (!python) {
    wypisz('STATUS blad Python 3 nie jest zainstalowany lub niedostepny');
    return false;
  }

  const skrypt = path.join(path.dirname(fileURLToPath(import.meta.url)), 'analizuj_wzorzec.py');
  if (!fs.existsSync(skrypt)) {
    wypisz(`STATUS blad brak skryptu analizuj_wzorzec.py w ${path.dirname(skrypt)}`);
    return false;
  }

  wypisz('KROK analizuj-wzorzec start (moze trwac kilka minut)');

  const r = uruchom(python, [skrypt, plikWideo, folderWyj], {
    env: srodowisko(narz),
    timeout: 600000,
  });

  for (const linia of (r.out + r.err).split(/\r?\n/).filter(Boolean)) {
    if (/^(STATUS|KROK|INFO|WYNIK)\s/.test(linia)) wypisz(linia);
  }

  const plikPom = path.join(folderWyj, 'pomiary.json');
  if (!r.ok || !fs.existsSync(plikPom)) {
    const blad = r.err.slice(-300).replace(/\n/g, ' ').trim();
    wypisz(`STATUS blad analizuj-wzorzec nie powiodl sie (kod ${r.kod}): ${blad}`);
    return false;
  }

  wypisz(`STATUS analizuj-wzorzec OK folder=${folderWyj}`);
  return true;
}

// ---------- render ----------

function render(projektDir, wyjscie, czyDraft) {
  const narz = czytajNarzedzia();

  if (!fs.existsSync(projektDir)) {
    wypisz(`STATUS blad folder projektu nie istnieje: ${projektDir}`);
    return false;
  }

  const args = ['render', projektDir, '--out', wyjscie];
  if (czyDraft) {
    args.push('--width', '540', '--height', '960');
    wypisz('KROK render-draft start (720p, bez motion blur)');
  } else {
    args.push('--width', '1080', '--height', '1920');
    wypisz('KROK render-final start (1080p pelna jakosc)');
  }

  const r = hf(narz, args);

  if (!r.ok || !fs.existsSync(wyjscie)) {
    wypisz(`STATUS blad render nie powiodl sie (kod ${r.kod})`);
    wypisz(`INFO szczegoly: ${r.err.slice(0, 300)}`);
    return false;
  }

  wypisz(`KROK render gotowe`);
  wypisz(`STATUS render OK plik=${wyjscie}`);
  return true;
}

// ---------- main ----------

process.stdout.on('error', () => {});

const [tryb = '', ...reszta] = process.argv.slice(2);

let ok = false;
switch (tryb) {
  case 'transkrypcja':
    ok = transkrypcja(reszta[0]);
    break;
  case 'klatki-pozycja':
    ok = klatki_pozycja(reszta[0]);
    break;
  case 'klatki-sprawdzenie':
    ok = klatki_sprawdzenie(reszta[0]);
    break;
  case 'sprawdz-dzwiek':
    ok = sprawdz_dzwiek(reszta[0]);
    break;
  case 'tnij':
    ok = tnij(reszta[0], reszta[1], reszta[2]);
    break;
  case 'render':
    ok = render(reszta[0], reszta[1], reszta.includes('--draft'));
    break;
  case 'overlay-image':
    ok = overlay_image(reszta[0], reszta[1], reszta[2]);
    break;
  case 'analizuj-wzorzec':
  case 'zbadaj-wzorzec':
    ok = analizuj_wzorzec(reszta[0], reszta[1]);
    break;
  case 'zapisz-wzorzec':
    ok = zapisz_wzorzec(reszta[0], reszta[1]);
    break;
  case 'lista-wzorcow':
    ok = lista_wzorcow();
    break;
  default:
    wypisz(`STATUS blad nieznane polecenie "${tryb}"`);
    wypisz('INFO dostepne: transkrypcja, klatki-pozycja, klatki-sprawdzenie, sprawdz-dzwiek, tnij, render, overlay-image, zbadaj-wzorzec, zapisz-wzorzec, lista-wzorcow');
    ok = false;
}

process.exitCode = ok ? 0 : 1;
