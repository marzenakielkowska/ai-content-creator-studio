#!/usr/bin/env node
// AI Content Creator Studio: przygotowanie srodowiska do montazu (Mac, Windows; Linux tylko do testow).
//
// Uruchamiane przez start.sh / start.ps1, ktore wczesniej zapewniaja Node 22+.
//
//   sprawdz                                   co jest, czego brakuje; niczego nie pobiera
//   instaluj                                  pobiera brakujace narzedzia do folderu Studio
//   ustaw --nagrania <folder> --projekty <folder>   zapisuje foldery kursanta
//   test                                      sprawdza, czy HyperFrames widzi wszystkie narzedzia
//   aktualizuj [--teraz]                      raz na dobe: automatyczne aktualizacje wtyczki i nowszy HyperFrames
//
// Wypisuje linie "STATUS ...", "KROK ...", "INFO ..." i na koniec "WYNIK ...". Claude tlumaczy je
// kursantowi na prosty jezyk. Bez zaleznosci: tylko to, co ma Node. Wszystkie pliki trafiaja do
// folderu Studio (AI_STUDIO_HOME, domyslnie ~/.ai-content-studio); HyperFrames trzyma przegladarke
// i model mowy we wlasnym folderze ~/.cache/hyperframes.

import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const TU = path.dirname(fileURLToPath(import.meta.url));
const WERSJE = JSON.parse(fs.readFileSync(path.join(TU, 'wersje.json'), 'utf8'));
const DOM = process.env.AI_STUDIO_HOME || path.join(os.homedir(), '.ai-content-studio');
const WIN = process.platform === 'win32';
const MAC = process.platform === 'darwin';
const EXE = WIN ? '.exe' : '';
const CURL = WIN ? 'curl.exe' : 'curl';

const P = {
  ffmpeg: path.join(DOM, 'ffmpeg'),
  hyperframes: path.join(DOM, 'hyperframes'),
  pobrane: path.join(DOM, 'pobrane'),
  ustawienia: path.join(DOM, 'ustawienia.json'),
  narzedzia: path.join(DOM, 'narzedzia.json'),
  aktualizacje: path.join(DOM, 'aktualizacje.json'),
  dziennik: path.join(DOM, 'dziennik.log'),
};

class BladKroku extends Error {}

// Gdy odbiorca wyjscia zamknie je wczesniej (np. przerwane polecenie), nie wywracamy sie na EPIPE.
process.stdout.on('error', () => {});

// ---------- drobne narzedzia ----------

function wypisz(linia) {
  process.stdout.write(linia + '\n');
}

function dziennik(tekst) {
  try {
    fs.mkdirSync(DOM, { recursive: true });
    fs.appendFileSync(P.dziennik, `[${new Date().toISOString()}] ${tekst}\n`);
  } catch {
    // dziennik jest pomocniczy; jego brak niczego nie blokuje
  }
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
  const wynik = {
    ok: r.status === 0 && !r.error,
    kod: r.status,
    out: r.stdout || '',
    err: r.stderr || '',
    blad: r.error ? r.error.message : '',
  };
  if (opcje.dziennik) {
    dziennik(`$ ${polecenie} ${argumenty.join(' ')}\nkod=${wynik.kod} ${wynik.blad}\n${wynik.out}\n${wynik.err}`);
  }
  return wynik;
}

function ostatniJson(tekst) {
  const linie = tekst.split(/\r?\n/).map((l) => l.trim()).filter((l) => l.startsWith('{'));
  for (let i = linie.length - 1; i >= 0; i--) {
    try {
      return JSON.parse(linie.at(i));
    } catch {
      // to nie byl caly JSON w jednej linii; probujemy calosci ponizej
    }
  }
  try {
    return JSON.parse(tekst.slice(tekst.indexOf('{')));
  } catch {
    return null;
  }
}

function rozwin(sciezka) {
  if (!sciezka) return sciezka;
  let s = sciezka.trim();
  if (s === '~' || s.startsWith('~/') || s.startsWith('~\\')) s = path.join(os.homedir(), s.slice(1));
  return path.resolve(s);
}

function sha256(plik) {
  const hash = createHash('sha256');
  const fd = fs.openSync(plik, 'r');
  const bufor = Buffer.alloc(1024 * 1024);
  try {
    let n;
    while ((n = fs.readSync(fd, bufor, 0, bufor.length, null)) > 0) hash.update(bufor.subarray(0, n));
  } finally {
    fs.closeSync(fd);
  }
  return hash.digest('hex');
}

function pobierzTekst(url) {
  const r = uruchom(CURL, ['-fsSL', '--retry', '3', '--connect-timeout', '20', url]);
  return r.ok ? r.out : null;
}

function pobierzPlik(url, cel) {
  fs.mkdirSync(path.dirname(cel), { recursive: true });
  const r = uruchom(
    CURL,
    ['-fSL', '-sS', '--retry', '3', '--connect-timeout', '20', '--speed-limit', '1024', '--speed-time', '60', '-o', cel, url],
    { dziennik: true },
  );
  return r.ok && fs.existsSync(cel);
}

function rozpakuj(archiwum, cel) {
  fs.rmSync(cel, { recursive: true, force: true });
  fs.mkdirSync(cel, { recursive: true });
  let r;
  if (archiwum.endsWith('.zip') && MAC) r = uruchom('ditto', ['-x', '-k', archiwum, cel], { dziennik: true });
  else if (archiwum.endsWith('.zip') && WIN) {
    r = uruchom('tar.exe', ['-xf', archiwum, '-C', cel], { dziennik: true });
    if (!r.ok) {
      r = uruchom(
        'powershell.exe',
        ['-NoProfile', '-Command', `Expand-Archive -LiteralPath '${archiwum}' -DestinationPath '${cel}' -Force`],
        { dziennik: true },
      );
    }
  } else if (archiwum.endsWith('.zip')) r = uruchom('unzip', ['-q', '-o', archiwum, '-d', cel], { dziennik: true });
  else r = uruchom('tar', ['-xJf', archiwum, '-C', cel], { dziennik: true });
  if (!r.ok) throw new BladKroku('nie udalo sie rozpakowac pobranego pliku');
}

function znajdzPlik(folder, nazwa) {
  for (const wpis of fs.readdirSync(folder, { withFileTypes: true })) {
    const pelna = path.join(folder, wpis.name);
    if (wpis.isFile() && wpis.name.toLowerCase() === nazwa.toLowerCase()) return pelna;
    if (wpis.isDirectory()) {
      const w = znajdzPlik(pelna, nazwa);
      if (w) return w;
    }
  }
  return null;
}

function ktory(nazwa) {
  const r = WIN ? uruchom('where', [nazwa]) : uruchom('/bin/sh', ['-c', `command -v ${nazwa}`]);
  if (!r.ok) return null;
  return r.out.split(/\r?\n/).map((l) => l.trim()).find(Boolean) || null;
}

// ---------- Python / Pillow ----------

function znajdzPython() {
  const kandydaci = WIN
    ? ['python', 'python3', 'py']
    : ['python3', '/usr/bin/python3', '/usr/local/bin/python3', '/opt/homebrew/bin/python3'];
  for (const p of kandydaci) {
    const r = uruchom(p, ['-c', 'import sys; print(sys.version_info[0])'], { timeout: 8000 });
    if (r.ok && r.out.trim().startsWith('3')) return p;
  }
  return null;
}

function sprawdzPillow(python) {
  if (!python) return false;
  const r = uruchom(python, ['-c', 'import PIL; print(PIL.__version__)'], { timeout: 8000 });
  return r.ok;
}

function instalujPillow(python) {
  const cel = path.join(DOM, 'python-packages');
  fs.mkdirSync(cel, { recursive: true });
  const r = uruchom(python, ['-m', 'pip', 'install', '--target', cel, '--quiet', 'Pillow'], {
    timeout: 120000,
    dziennik: true,
  });
  if (!r.ok) throw new BladKroku('instalacja Pillow nie powiodla sie');
}

function sprawdzNumpy(python) {
  if (!python) return false;
  const r = uruchom(python, ['-c', 'import numpy; print(numpy.__version__)'], { timeout: 8000 });
  return r.ok;
}

function instalujNumpy(python) {
  const r = uruchom(python, ['-m', 'pip', 'install', '--user', '--quiet', 'numpy'], {
    timeout: 120000,
    dziennik: true,
  });
  if (!r.ok) throw new BladKroku('instalacja numpy nie powiodla sie');
}

function sprawdzRembg(python) {
  if (!python) return false;
  const r = uruchom(python, ['-c', 'import rembg; import onnxruntime'], { timeout: 10000 });
  return r.ok;
}

function instalujRembg(python) {
  const r = uruchom(python, ['-m', 'pip', 'install', '--user', '--quiet', 'rembg', 'onnxruntime'], {
    timeout: 300000,
    dziennik: true,
  });
  if (!r.ok) throw new BladKroku('instalacja rembg nie powiodla sie');
}

// ---------- co jest na komputerze ----------

function wersjaFf(plik) {
  if (!plik || !fs.existsSync(plik)) return null;
  const r = uruchom(plik, ['-version'], { timeout: 30000 });
  if (!r.ok) return null;
  const m = r.out.match(/version\s+n?(\S+)/i);
  return m ? m[1] : 'nieznana';
}

// Kodeki, bez ktorych HyperFrames nie wyrenderuje rolki (ta sama lista sprawdzana jest w testach HyperFrames).
const KODEKI = ['libx264', 'aac'];

function maKodeki(plik) {
  const r = uruchom(plik, ['-hide_banner', '-encoders'], { timeout: 30000 });
  return r.ok && KODEKI.every((k) => new RegExp(`\\s${k}\\s`).test(r.out));
}

function znajdzFfmpeg() {
  const kandydaci = [
    { ffmpeg: path.join(P.ffmpeg, `ffmpeg${EXE}`), ffprobe: path.join(P.ffmpeg, `ffprobe${EXE}`), zrodlo: 'studio' },
    { ffmpeg: ktory('ffmpeg'), ffprobe: ktory('ffprobe'), zrodlo: 'system' },
  ];
  for (const k of kandydaci) {
    const wersja = wersjaFf(k.ffmpeg);
    if (wersja && wersjaFf(k.ffprobe) && maKodeki(k.ffmpeg)) return { ...k, wersja };
  }
  return null;
}

function hyperframesPakiet(folder = P.hyperframes) {
  const pj = path.join(folder, 'node_modules', WERSJE.hyperframes.pakiet, 'package.json');
  try {
    const j = JSON.parse(fs.readFileSync(pj, 'utf8'));
    const bin = typeof j.bin === 'string' ? j.bin : (j.bin && (j.bin.hyperframes || Object.values(j.bin)[0]));
    if (!bin) return null;
    const skrypt = path.join(path.dirname(pj), bin);
    return fs.existsSync(skrypt) ? { wersja: j.version, skrypt } : null;
  } catch {
    return null;
  }
}

function srodowisko(ff) {
  const env = { ...process.env };
  const klucz = Object.keys(env).find((k) => k.toUpperCase() === 'PATH') || 'PATH';
  const dodatki = [path.dirname(process.execPath)];
  if (ff) dodatki.push(path.dirname(ff.ffmpeg));
  env[klucz] = [...dodatki, env[klucz] || ''].join(path.delimiter);
  if (ff) {
    env.HYPERFRAMES_FFMPEG_PATH = ff.ffmpeg;
    env.HYPERFRAMES_FFPROBE_PATH = ff.ffprobe;
  }
  return env;
}

function hyperframes(argumenty, ff, folder = P.hyperframes) {
  const pakiet = hyperframesPakiet(folder);
  if (!pakiet) return { ok: false, out: '', err: 'brak hyperframes' };
  return uruchom(process.execPath, [pakiet.skrypt, ...argumenty], { env: srodowisko(ff), dziennik: true });
}

// Raport "hyperframes doctor --json": { ok, checks: [{ name, ok, detail, hint? }] }. Calosciowe "ok" bywa false
// z powodow bez znaczenia dla montazu (np. dostepna nowsza wersja, brak Dockera), wiec patrzymy na pojedyncze
// sprawdzenia.
function sprawdzenieOk(diagnoza, nazwa) {
  const lista = diagnoza && Array.isArray(diagnoza.checks) ? diagnoza.checks : [];
  const wpis = lista.find((c) => c && c.name === nazwa);
  return Boolean(wpis && wpis.ok);
}

function czytajUstawienia() {
  try {
    return JSON.parse(fs.readFileSync(P.ustawienia, 'utf8'));
  } catch {
    return null;
  }
}

function stan() {
  const python = znajdzPython();
  const s = {
    node: { wersja: process.versions.node, zrodlo: process.env.STUDIO_NODE_ZRODLO || 'system' },
    ff: znajdzFfmpeg(),
    hf: hyperframesPakiet(),
    przegladarka: null,
    transkrypcja: null,
    transkrypcjaPowod: '',
    ustawienia: czytajUstawienia(),
    python: python,
    pillow: python ? sprawdzPillow(python) : false,
    numpy: python ? sprawdzNumpy(python) : false,
    rembg: python ? sprawdzRembg(python) : false,
  };
  if (s.hf) {
    // Nie "browser path": ono przy braku przegladarki samo ja pobiera, bez zgody kursanta.
    // "doctor" tylko sprawdza (moze uzyc Chrome zainstalowanego w systemie, tak jak render).
    s.diagnoza = ostatniJson(hyperframes(['doctor', '--json'], s.ff).out);
    s.przegladarka = sprawdzenieOk(s.diagnoza, 'Chrome');
    const lista = ostatniJson(hyperframes(['models', 'list', '--json'], s.ff).out);
    const parakeet = lista && Array.isArray(lista.models) ? lista.models.find((m) => m.engine === 'parakeet') : null;
    if (parakeet && parakeet.installed) s.transkrypcja = 'OK';
    else if (parakeet && parakeet.unsupported) {
      s.transkrypcja = 'NIEOBSLUGIWANA';
      s.transkrypcjaPowod = String(parakeet.unsupported).replace(/\s+/g, ' ');
    } else s.transkrypcja = 'BRAK';
  }
  return s;
}

// NIEOBSLUGIWANA: model mowy nie dziala na tym procesorze; montaz bez napisow jest mozliwy, a transkrypcje
// na takich komputerach dolozymy w osobnym kroku. Nie blokuje to reszty przygotowania.
function narzedziaGotowe(s) {
  return Boolean(s.ff && s.hf && s.przegladarka && (s.transkrypcja === 'OK' || s.transkrypcja === 'NIEOBSLUGIWANA'));
}

function wypiszStan(s) {
  const mb = WERSJE.rozmiary_mb;
  let doPobrania = 0;
  wypisz(`STATUS system ${process.platform} ${process.arch}`);
  wypisz(`STATUS node OK ${s.node.wersja} ${s.node.zrodlo}`);
  if (s.ff) wypisz(`STATUS ffmpeg OK ${s.ff.wersja} ${s.ff.zrodlo}`);
  else {
    wypisz('STATUS ffmpeg BRAK');
    doPobrania += mb.ffmpeg;
  }
  if (s.hf) wypisz(`STATUS hyperframes OK ${s.hf.wersja}`);
  else {
    wypisz('STATUS hyperframes BRAK');
    doPobrania += mb.hyperframes;
  }
  if (s.przegladarka === null) {
    wypisz('STATUS przegladarka NIEZNANE');
    doPobrania += mb.przegladarka;
  } else if (s.przegladarka) wypisz('STATUS przegladarka OK');
  else {
    wypisz('STATUS przegladarka BRAK');
    doPobrania += mb.przegladarka;
  }
  if (s.transkrypcja === null) {
    wypisz('STATUS transkrypcja NIEZNANE');
    doPobrania += mb.transkrypcja;
  } else if (s.transkrypcja === 'NIEOBSLUGIWANA') wypisz(`STATUS transkrypcja NIEOBSLUGIWANA ${s.transkrypcjaPowod}`);
  else {
    wypisz(`STATUS transkrypcja ${s.transkrypcja}`);
    if (s.transkrypcja === 'BRAK') doPobrania += mb.transkrypcja;
  }
  if (s.ustawienia) wypisz(`STATUS ustawienia OK nagrania=${s.ustawienia.nagrania} projekty=${s.ustawienia.projekty}`);
  else wypisz('STATUS ustawienia BRAK');
  if (s.python && s.pillow) wypisz('STATUS pillow OK');
  else if (s.python && !s.pillow) wypisz('STATUS pillow BRAK python-jest-ale-pillow-nie');
  else wypisz('STATUS pillow BRAK python-nie-znaleziony');
  if (s.python && s.numpy) wypisz('STATUS numpy OK');
  else if (s.python && !s.numpy) wypisz('STATUS numpy BRAK');
  if (s.python && s.rembg) wypisz('STATUS rembg OK');
  else if (s.python && !s.rembg) wypisz('STATUS rembg BRAK');
  wypisz(`STATUS autoaktualizacja ${autoAktualizacja(false)}`);
  wypisz(`STATUS do_pobrania_mb ${doPobrania}`);
  const gotowe = narzedziaGotowe(s) && Boolean(s.ustawienia);
  wypisz(`WYNIK ${gotowe ? 'GOTOWE' : 'NIEGOTOWE'}`);
  return gotowe;
}

function zapiszNarzedzia(s) {
  if (!narzedziaGotowe(s)) return;
  const dane = {
    opis: 'Sciezki do narzedzi AI Content Creator Studio. Zapisuje je /studio:start; czytaja je pozostale skille.',
    zapisano: new Date().toISOString(),
    node: process.execPath,
    ffmpeg: s.ff.ffmpeg,
    ffprobe: s.ff.ffprobe,
    hyperframes: s.hf.skrypt,
    wersje: { node: s.node.wersja, ffmpeg: s.ff.wersja, hyperframes: s.hf.wersja },
    jak_uruchomic_hyperframes: '"<node>" "<hyperframes>" <polecenie>, z HYPERFRAMES_FFMPEG_PATH i HYPERFRAMES_FFPROBE_PATH ustawionymi na sciezki powyzej',
  };
  fs.writeFileSync(P.narzedzia, JSON.stringify(dane, null, 2) + '\n');
}

// ---------- instalacja ----------

function wybierzPaczkeBtbN(lista, cel, rozszerzenie) {
  const wydania = [];
  const re = new RegExp(`^([0-9a-f]{64})\\s+(ffmpeg-n(\\d+)\\.(\\d+)-latest-${cel}-gpl-\\d+\\.\\d+\\.${rozszerzenie})$`);
  const reMaster = new RegExp(`^([0-9a-f]{64})\\s+(ffmpeg-master-latest-${cel}-gpl\\.${rozszerzenie})$`);
  let master = null;
  for (const linia of lista.split(/\r?\n/).map((l) => l.trim())) {
    const m = linia.match(re);
    if (m) wydania.push({ suma: m[1], plik: m[2], wersja: Number(m[3]) * 1000 + Number(m[4]) });
    const mm = linia.match(reMaster);
    if (mm) master = { suma: mm[1], plik: mm[2], wersja: 0 };
  }
  wydania.sort((a, b) => b.wersja - a.wersja);
  return wydania[0] || master;
}

function instalujFfmpeg() {
  const tmp = path.join(P.pobrane, 'ffmpeg-rozpakowany');
  fs.mkdirSync(P.ffmpeg, { recursive: true });
  const skopiuj = (zrodlo, nazwa) => {
    const cel = path.join(P.ffmpeg, nazwa);
    fs.copyFileSync(zrodlo, cel);
    if (!WIN) fs.chmodSync(cel, 0o755);
  };

  if (MAC) {
    const baza = WERSJE.ffmpeg.mac.replace('{arch}', process.arch === 'arm64' ? 'arm64' : 'amd64');
    for (const nazwa of ['ffmpeg', 'ffprobe']) {
      const url = `${baza}${nazwa}.zip`;
      const archiwum = path.join(P.pobrane, `${nazwa}.zip`);
      if (!pobierzPlik(url, archiwum)) throw new BladKroku(`pobieranie ${nazwa} przerwane (sprawdz internet)`);
      const suma = (pobierzTekst(`${url}.sha256`) || '').trim().split(/\s+/)[0].toLowerCase();
      if (/^[0-9a-f]{64}$/.test(suma)) {
        if (sha256(archiwum) !== suma) throw new BladKroku(`plik ${nazwa} uszkodzony (suma kontrolna sie nie zgadza)`);
      } else wypisz(`INFO ffmpeg brak sumy kontrolnej dla ${nazwa}, sprawdzam plik uruchamiajac go`);
      rozpakuj(archiwum, tmp);
      const plik = znajdzPlik(tmp, nazwa);
      if (!plik) throw new BladKroku(`w paczce nie ma pliku ${nazwa}`);
      skopiuj(plik, nazwa);
      fs.rmSync(archiwum, { force: true });
    }
  } else {
    const arm = process.arch === 'arm64';
    const cel = WIN ? (arm ? 'winarm64' : 'win64') : arm ? 'linuxarm64' : 'linux64';
    const rozszerzenie = WIN ? 'zip' : 'tar\\.xz';
    const baza = WERSJE.ffmpeg.windows_i_linux;
    const lista = pobierzTekst(`${baza}checksums.sha256`);
    if (!lista) throw new BladKroku('nie udalo sie pobrac listy wersji ffmpeg (sprawdz internet)');
    const paczka = wybierzPaczkeBtbN(lista, cel, rozszerzenie);
    if (!paczka) throw new BladKroku(`brak paczki ffmpeg dla ${cel}`);
    const archiwum = path.join(P.pobrane, paczka.plik);
    if (!pobierzPlik(`${baza}${paczka.plik}`, archiwum)) throw new BladKroku('pobieranie ffmpeg przerwane (sprawdz internet)');
    if (sha256(archiwum) !== paczka.suma) {
      fs.rmSync(archiwum, { force: true });
      throw new BladKroku('plik ffmpeg uszkodzony (suma kontrolna sie nie zgadza)');
    }
    rozpakuj(archiwum, tmp);
    for (const nazwa of ['ffmpeg', 'ffprobe']) {
      const plik = znajdzPlik(tmp, nazwa + EXE);
      if (!plik) throw new BladKroku(`w paczce nie ma pliku ${nazwa}${EXE}`);
      skopiuj(plik, nazwa + EXE);
    }
    fs.rmSync(archiwum, { force: true });
  }
  fs.rmSync(tmp, { recursive: true, force: true });
  const ff = znajdzFfmpeg();
  if (!ff || ff.zrodlo !== 'studio') throw new BladKroku('ffmpeg pobrany, ale sie nie uruchamia');
  return ff;
}

function npmCli() {
  const folder = path.dirname(process.execPath);
  const kandydaci = [
    path.join(folder, 'node_modules', 'npm', 'bin', 'npm-cli.js'),
    path.join(folder, '..', 'lib', 'node_modules', 'npm', 'bin', 'npm-cli.js'),
  ];
  return kandydaci.find((k) => fs.existsSync(k)) || null;
}

function npm(argumenty) {
  const cli = npmCli();
  return cli
    ? uruchom(process.execPath, [cli, ...argumenty], { env: srodowisko(null), dziennik: true })
    : uruchom(WIN ? 'npm.cmd' : 'npm', argumenty, { env: srodowisko(null), dziennik: true, shell: WIN });
}

function instalujHyperframes(folder = P.hyperframes, wersja = WERSJE.hyperframes.wersja) {
  fs.mkdirSync(folder, { recursive: true });
  const pj = path.join(folder, 'package.json');
  if (!fs.existsSync(pj)) {
    fs.writeFileSync(pj, JSON.stringify({ name: 'ai-content-studio-narzedzia', private: true }, null, 2) + '\n');
  }
  const spec = `${WERSJE.hyperframes.pakiet}@${wersja}`;
  const r = npm(['install', spec, '--prefix', folder, '--no-audit', '--no-fund', '--loglevel=error']);
  if (!r.ok || !hyperframesPakiet(folder)) throw new BladKroku('instalacja HyperFrames nie powiodla sie');
}

function najnowszaWersjaHyperframes() {
  const r = npm(['view', WERSJE.hyperframes.pakiet, 'version', '--json']);
  if (!r.ok) return null;
  try {
    const v = JSON.parse(r.out.trim());
    return typeof v === 'string' ? v : null;
  } catch {
    return null;
  }
}

// ---------- automatyczne aktualizacje wtyczki ----------
//
// Claude Code sam aktualizuje wtyczki ze sklepu, ktory ma wlaczone "autoUpdate" (dla sklepow spoza Anthropic
// domyslnie jest wylaczone). Wlaczamy je dokladnie tam, gdzie robi to przelacznik "Enable auto-update" w /plugin:
// we wpisie sklepu w ustawieniach uzytkownika, a gdy go tam nie ma, w known_marketplaces.json.

const SKLEP = 'ai-content-studio';

function folderClaude() {
  return process.env.CLAUDE_CONFIG_DIR || path.join(os.homedir(), '.claude');
}

function ustawAutoUpdate(plik, wezSklep) {
  if (!fs.existsSync(plik)) return 'BRAK';
  let dane;
  try {
    dane = JSON.parse(fs.readFileSync(plik, 'utf8'));
  } catch {
    return 'NIECZYTELNY';
  }
  const wpis = wezSklep(dane);
  if (!wpis || typeof wpis !== 'object') return 'BRAK';
  if (wpis.autoUpdate === true) return 'OK';
  fs.copyFileSync(plik, `${plik}.ai-studio-kopia`);
  wpis.autoUpdate = true;
  const tmp = `${plik}.ai-studio-tmp`;
  fs.writeFileSync(tmp, JSON.stringify(dane, null, 2) + '\n');
  fs.renameSync(tmp, plik);
  return 'WLACZONA';
}

function autoAktualizacja(zmieniaj) {
  const ustawienia = path.join(folderClaude(), 'settings.json');
  const sklepy = path.join(folderClaude(), 'plugins', 'known_marketplaces.json');
  const zUstawien = (d) => d && d.extraKnownMarketplaces && d.extraKnownMarketplaces[SKLEP];
  const zeSklepow = (d) => d && d[SKLEP];
  if (!zmieniaj) {
    const czyta = (plik, wez) => {
      try {
        const w = wez(JSON.parse(fs.readFileSync(plik, 'utf8')));
        return w ? w.autoUpdate === true : null;
      } catch {
        return null;
      }
    };
    const a = czyta(ustawienia, zUstawien);
    const b = czyta(sklepy, zeSklepow);
    return a === true || (a === null && b === true) ? 'OK' : 'WYLACZONA';
  }
  try {
    const wynik = ustawAutoUpdate(ustawienia, zUstawien);
    if (wynik === 'OK' || wynik === 'WLACZONA') return wynik;
    const zapas = ustawAutoUpdate(sklepy, zeSklepow);
    return zapas === 'OK' || zapas === 'WLACZONA' ? zapas : 'NIEMOZLIWA';
  } catch (e) {
    dziennik(`autoaktualizacja: ${e.stack || e.message}`);
    return 'NIEMOZLIWA';
  }
}

function krok(nazwa, opis, dzialanie) {
  wypisz(`KROK ${nazwa} start ${opis}`);
  try {
    dzialanie();
    wypisz(`KROK ${nazwa} gotowe`);
    return true;
  } catch (e) {
    const powod = e instanceof BladKroku ? e.message : `nieoczekiwany blad: ${e.message}`;
    dziennik(`KROK ${nazwa} blad: ${e.stack || e.message}`);
    wypisz(`KROK ${nazwa} blad ${powod}`);
    return false;
  }
}

function instaluj() {
  fs.mkdirSync(P.pobrane, { recursive: true });
  const mb = WERSJE.rozmiary_mb;
  let s = stan();
  let ff = s.ff;

  if (!ff) krok('ffmpeg', `okolo ${mb.ffmpeg} MB`, () => (ff = instalujFfmpeg()));
  if (!hyperframesPakiet()) krok('hyperframes', `okolo ${mb.hyperframes} MB`, instalujHyperframes);
  if (hyperframesPakiet()) {
    s = stan();
    if (!s.przegladarka) {
      krok('przegladarka', `okolo ${mb.przegladarka} MB`, () => {
        if (!hyperframes(['browser', 'ensure'], ff).ok) throw new BladKroku('nie udalo sie pobrac przegladarki do renderu');
      });
      s = stan();
    }
    if (s.transkrypcja === 'BRAK') {
      krok('transkrypcja', `okolo ${mb.transkrypcja} MB, to najdluzszy krok`, () => {
        const r = hyperframes(['models', 'install', 'parakeet', '--json'], ff);
        const j = ostatniJson(r.out);
        if (!r.ok || (j && j.ok === false)) throw new BladKroku('nie udalo sie pobrac modelu mowy');
      });
    }
  }

  // Pillow (biblioteka graficzna Pythona do nakładania screenshotów)
  s = stan();
  if (s.python && !s.pillow) {
    krok('pillow', 'okolo 4 MB (biblioteka graficzna)', () => instalujPillow(s.python));
  } else if (!s.python) {
    wypisz('INFO pillow Python 3 nie znaleziony — komenda overlay-image bedzie niedostepna');
  }

  // numpy (biblioteka matematyczna do efektow wideo)
  s = stan();
  if (s.python && !s.numpy) {
    krok('numpy', 'okolo 20 MB (biblioteka matematyczna do efektow)', () => instalujNumpy(s.python));
  }

  // rembg NIE jest instalowane automatycznie — pobierane tylko gdy konkretny efekt tego wymaga

  wypisz(`KROK autoaktualizacja ${autoAktualizacja(true)}`);
  zapiszZnacznikAktualizacji();
  s = stan();
  zapiszNarzedzia(s);
  wypiszStan(s);
  return narzedziaGotowe(s);
}

// ---------- codzienne aktualizacje ----------
//
// "aktualizuj" uruchamia sie po cichu na poczatku kazdej pracy ze Studio. Najwyzej raz na dobe:
//  - pilnuje, zeby automatyczne aktualizacje wtyczki byly wlaczone,
//  - sprawdza, czy jest nowszy HyperFrames; instaluje go obok starego, sprawdza i dopiero wtedy podmienia.
//    Gdy nowa wersja nie przejdzie sprawdzenia, zostaje stara, dzialajaca.

const PRZERWA_GODZINY = 20;

function zapiszZnacznikAktualizacji() {
  try {
    fs.writeFileSync(P.aktualizacje, JSON.stringify({ ostatnio: new Date().toISOString() }, null, 2) + '\n');
  } catch (e) {
    dziennik(`znacznik aktualizacji: ${e.message}`);
  }
}

function niedawnoSprawdzane() {
  try {
    const { ostatnio } = JSON.parse(fs.readFileSync(P.aktualizacje, 'utf8'));
    return Date.now() - Date.parse(ostatnio) < PRZERWA_GODZINY * 3600 * 1000;
  } catch {
    return false;
  }
}

function aktualizuj(lista) {
  if (!lista.includes('--teraz') && niedawnoSprawdzane()) {
    wypisz('STATUS aktualizacja NIEDAWNO_SPRAWDZANE');
    wypisz('WYNIK OK');
    return true;
  }
  wypisz(`STATUS autoaktualizacja ${autoAktualizacja(true)}`);

  const obecny = hyperframesPakiet();
  if (!obecny) {
    wypisz('STATUS hyperframes BRAK najpierw instaluj');
    wypisz('WYNIK OK');
    return true;
  }
  const najnowsza = najnowszaWersjaHyperframes();
  if (!najnowsza) {
    // Bez internetu nie zapisujemy znacznika: sprobujemy przy nastepnej pracy.
    wypisz('STATUS hyperframes NIE_SPRAWDZONO brak_polaczenia');
    wypisz('WYNIK OK');
    return true;
  }
  if (najnowsza === obecny.wersja) {
    wypisz(`STATUS hyperframes AKTUALNY ${obecny.wersja}`);
    zapiszZnacznikAktualizacji();
    wypisz('WYNIK OK');
    return true;
  }

  const ff = znajdzFfmpeg();
  const nowy = `${P.hyperframes}-nowy`;
  const poprzedni = `${P.hyperframes}-poprzedni`;
  fs.rmSync(nowy, { recursive: true, force: true });
  let przeszedl = false;
  try {
    instalujHyperframes(nowy, najnowsza);
    const diagnoza = ostatniJson(hyperframes(['doctor', '--json'], ff, nowy).out);
    przeszedl = Boolean(diagnoza) && NIEZBEDNE.every((n) => sprawdzenieOk(diagnoza, n));
  } catch (e) {
    dziennik(`aktualizacja hyperframes: ${e.stack || e.message}`);
  }
  if (!przeszedl) {
    fs.rmSync(nowy, { recursive: true, force: true });
    wypisz(`STATUS hyperframes BEZ_ZMIAN ${obecny.wersja} nowa_wersja_${najnowsza}_nie_przeszla_sprawdzenia`);
    zapiszZnacznikAktualizacji();
    wypisz('WYNIK OK');
    return true;
  }
  fs.rmSync(poprzedni, { recursive: true, force: true });
  fs.renameSync(P.hyperframes, poprzedni);
  try {
    fs.renameSync(nowy, P.hyperframes);
  } catch (e) {
    fs.renameSync(poprzedni, P.hyperframes);
    dziennik(`podmiana hyperframes: ${e.stack || e.message}`);
    wypisz(`STATUS hyperframes BEZ_ZMIAN ${obecny.wersja} nie_udalo_sie_podmienic`);
    wypisz('WYNIK OK');
    return true;
  }
  zapiszNarzedzia(stan());
  zapiszZnacznikAktualizacji();
  wypisz(`STATUS hyperframes ZAKTUALIZOWANY ${obecny.wersja} ${najnowsza}`);
  wypisz('WYNIK OK');
  return true;
}

// ---------- ustawienia i test ----------

function argument(lista, nazwa) {
  const i = lista.indexOf(nazwa);
  return i >= 0 && i + 1 < lista.length ? lista.at(i + 1) : null;
}

function ustaw(lista) {
  const nagrania = rozwin(argument(lista, '--nagrania'));
  const projekty = rozwin(argument(lista, '--projekty'));
  if (!nagrania || !projekty) {
    wypisz('STATUS ustawienia BLAD podaj --nagrania <folder> i --projekty <folder>');
    return false;
  }
  if (!fs.existsSync(nagrania) || !fs.statSync(nagrania).isDirectory()) {
    wypisz(`STATUS ustawienia BLAD folder_nagran_nie_istnieje ${nagrania}`);
    return false;
  }
  try {
    fs.mkdirSync(projekty, { recursive: true });
  } catch (e) {
    wypisz(`STATUS ustawienia BLAD nie_moge_utworzyc_folderu_projektow ${projekty}`);
    dziennik(e.stack || e.message);
    return false;
  }
  const dane = { ...(czytajUstawienia() || {}), nagrania, projekty, zapisano: new Date().toISOString() };
  fs.mkdirSync(DOM, { recursive: true });
  fs.writeFileSync(P.ustawienia, JSON.stringify(dane, null, 2) + '\n');
  wypisz(`STATUS ustawienia ZAPISANE nagrania=${nagrania} projekty=${projekty}`);
  return true;
}

// Sprawdzenia z "hyperframes doctor", ktore musza przejsc, zeby dalo sie montowac i renderowac.
const NIEZBEDNE = ['FFmpeg', 'FFprobe', 'Chrome', 'Disk'];

function test() {
  const s = stan();
  if (!narzedziaGotowe(s)) {
    wypiszStan(s);
    wypisz('STATUS test POMINIETY brakuje narzedzi, najpierw instaluj');
    return false;
  }
  zapiszNarzedzia(s);
  if (!s.diagnoza) {
    wypisz('STATUS test BLAD hyperframes_nie_odpowiada');
    return false;
  }
  const nieudane = NIEZBEDNE.filter((n) => !sprawdzenieOk(s.diagnoza, n));
  if (nieudane.length === 0) {
    wypisz('STATUS test OK');
    return true;
  }
  for (const n of nieudane) {
    const wpis = s.diagnoza.checks.find((c) => c && c.name === n);
    wypisz(`INFO test ${n}: ${wpis ? String(wpis.detail).replace(/\s+/g, ' ') : 'brak wyniku'}`);
  }
  wypisz(`STATUS test BLAD ${nieudane.join(',')}`);
  return false;
}

// ---------- start ----------

const [tryb = 'sprawdz', ...reszta] = process.argv.slice(2);
dziennik(`przygotuj.mjs ${tryb} ${reszta.join(' ')} (node ${process.versions.node}, ${process.platform} ${process.arch})`);

let ok;
switch (tryb) {
  case 'sprawdz': {
    const s = stan();
    zapiszNarzedzia(s);
    wypiszStan(s);
    ok = true;
    break;
  }
  case 'instaluj':
    ok = instaluj();
    break;
  case 'ustaw':
    ok = ustaw(reszta);
    break;
  case 'test':
    ok = test();
    break;
  case 'aktualizuj':
    ok = aktualizuj(reszta);
    break;
  default:
    wypisz(`STATUS blad nieznane polecenie ${tryb} (uzyj: sprawdz, instaluj, ustaw, test, aktualizuj)`);
    ok = false;
}
process.exitCode = ok ? 0 : 1;
