#!/usr/bin/env node
// AI Content Creator Studio: skrypty montazu rolki.
//
//   wczytaj <projekt> <pliki|folder>... [--najnowsze N] [--silnik parakeet|whisper]
//        rejestruje nagrania (zrodla.json), robi arkusze klatek i transkrypcje kazdego nagrania
//   pauzy <plik> [od] [do] [--prog -40] [--min 0.08]
//        mierzy cisze w nagraniu (potwierdzenie pauz przed cieciem)
//   zloz <projekt>
//        tnie rolke z oryginalow wg edl.json -> assets/aroll.mp4 (1080x1920, rowne 30 kl/s) + segmenty.json
//   transkrypcja <projekt> [--silnik parakeet|whisper]
//        czasy slow na zlozonej rolce -> slowa.json (z nich ida napisy)
//   wytnij-tlo <projekt>
//        sylwetka bez tla -> assets/sylwetka.webm i sprawdzenie, ze ma tyle samo klatek co aroll.mp4
//   glowa <projekt>
//        gdzie jest glowa i sylwetka w kazdym segmencie -> glowa.json (do napisow za glowa i kart pod broda)
//   strefa <obraz.png>...
//        rysuje na podgladach czerwone pola poza strefa bezpieczna Reels -> <obraz>-strefa.png
//   sprawdz-ciecia <projekt> <render.mp4> [--telefon]
//        klatka przed i po kazdym cieciu na jednym arkuszu + glosnosc + kopia na telefon (720p)
//   glosnosc <plik>
//        szczyt (dB) i glosnosc (LUFS)
//
// Wypisuje linie "STATUS ...", "KROK ...", "INFO ...", "WYNIK ...". Claude tlumaczy je kursantce.
// Narzedzia (Node, FFmpeg, HyperFrames) bierze z narzedzia.json zapisanego przez /studio:start.

import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const DOM = process.env.AI_STUDIO_HOME || path.join(os.homedir(), '.ai-content-studio');
const FPS = 30;
const W = 1080;
const H = 1920;
const WIDEO = /\.(mov|mp4|m4v|mkv|webm)$/i;

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
    encoding: 'utf8',
    env: srodowisko(),
    cwd: opcje.cwd,
    timeout: opcje.timeout || 0,
    maxBuffer: 256 * 1024 * 1024,
    windowsHide: true,
  });
  return { ok: r.status === 0 && !r.error, kod: r.status, out: r.stdout || '', err: r.stderr || '' };
}

const ff = (argumenty, opcje) => uruchom(narzedzia().ffmpeg, ['-hide_banner', '-nostdin', ...argumenty], opcje);
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
  if (!fs.existsSync(plik)) blad(`brak pliku ${path.basename(plik)} (${co})`);
  try {
    return JSON.parse(fs.readFileSync(plik, 'utf8'));
  } catch (e) {
    blad(`zly format ${path.basename(plik)}: ${e.message}`);
  }
}

function zapiszJson(plik, dane) {
  fs.mkdirSync(path.dirname(plik), { recursive: true });
  fs.writeFileSync(plik, JSON.stringify(dane, null, 2) + '\n', 'utf8');
}

function opcja(argumenty, nazwa, domyslna) {
  const i = argumenty.indexOf(nazwa);
  if (i === -1) return domyslna;
  const wartosc = argumenty[i + 1];
  argumenty.splice(i, 2);
  return wartosc;
}

function flaga(argumenty, nazwa) {
  const i = argumenty.indexOf(nazwa);
  if (i === -1) return false;
  argumenty.splice(i, 1);
  return true;
}

const r2 = (x) => Math.round(x * 100) / 100;
const r3 = (x) => Math.round(x * 1000) / 1000;

// ---------- informacje o pliku ----------

// Wymiary po obrocie (telefon zapisuje pion jako poziom + znacznik obrotu; ffmpeg obraca sam przy dekodowaniu).
function info(plik) {
  const r = ffprobe(['-show_entries', 'format=duration:stream=codec_type,width,height,r_frame_rate:stream_side_data=rotation', '-of', 'json', plik]);
  if (!r.ok) blad(`nie mozna odczytac pliku ${path.basename(plik)}`);
  const j = JSON.parse(r.out);
  const v = (j.streams || []).find((s) => s.codec_type === 'video');
  if (!v) blad(`w pliku ${path.basename(plik)} nie ma obrazu`);
  const obrot = Math.abs(Number(((v.side_data_list || []).find((d) => 'rotation' in d) || {}).rotation || 0));
  const [a, b] = String(v.r_frame_rate || '30/1').split('/').map(Number);
  const pion = obrot === 90 || obrot === 270;
  return {
    czas: Number(j.format.duration),
    szer: pion ? v.height : v.width,
    wys: pion ? v.width : v.height,
    fps: b ? a / b : a,
    dzwiek: (j.streams || []).some((s) => s.codec_type === 'audio'),
  };
}

function liczKlatki(plik, dekoder) {
  const argumenty = ['-select_streams', 'v:0', '-count_packets', '-show_entries', 'stream=nb_read_packets', '-of', 'csv=p=0'];
  if (dekoder) argumenty.unshift('-c:v', dekoder);
  const r = ffprobe([...argumenty, plik]);
  return r.ok ? Number(r.out.trim().split(/\s+/)[0]) : NaN;
}

// ---------- cisza ----------

function cisze(plik, { od = null, do: doCzasu = null, prog = -40, min = 0.08 } = {}) {
  const wej = [];
  if (od !== null) wej.push('-ss', String(od));
  if (doCzasu !== null) wej.push('-to', String(doCzasu));
  const r = ff([...wej, '-i', plik, '-vn', '-af', `silencedetect=noise=${prog}dB:d=${min}`, '-f', 'null', '-'], { timeout: 600000 });
  const przes = od || 0;
  const wynik = [];
  let start = null;
  for (const linia of r.err.split(/\r?\n/)) {
    const s = linia.match(/silence_start: (-?[\d.]+)/);
    const e = linia.match(/silence_end: (-?[\d.]+)/);
    if (s) start = Math.max(0, Number(s[1])) + przes;
    if (e && start !== null) {
      wynik.push({ od: r3(start), do: r3(Number(e[1]) + przes) });
      start = null;
    }
  }
  if (start !== null) wynik.push({ od: r3(start), do: null });
  return wynik;
}

function pauzy(argumenty) {
  const prog = Number(opcja(argumenty, '--prog', -40));
  const min = Number(opcja(argumenty, '--min', 0.08));
  const [plik, od, doCzasu] = argumenty;
  if (!plik || !fs.existsSync(plik)) blad('podaj istniejacy plik');
  const lista = cisze(plik, { od: od ? Number(od) : null, do: doCzasu ? Number(doCzasu) : null, prog, min });
  for (const c of lista) wypisz(`CISZA ${c.od} ${c.do ?? 'koniec'} ${c.do ? r3(c.do - c.od) : ''}`.trim());
  wypisz(`STATUS pauzy ${lista.length}`);
  wypisz('WYNIK OK');
}

// ---------- transkrypcja ----------

// Glos wyrownany (loudnorm) przed transkrypcja: ciche fragmenty mowy nie wypadaja z tekstu.
function transkrybuj(plikWideo, folder, silnik) {
  fs.mkdirSync(folder, { recursive: true });
  const audio = path.join(folder, 'audio.wav');
  ffWymagane(['-i', plikWideo, '-vn', '-af', 'loudnorm=I=-16:TP=-1.5:LRA=11', '-ac', '1', '-ar', '16000', audio], 'wyciagniecie dzwieku', { timeout: 600000 });
  const argumenty = ['transcribe', audio, '-d', folder, '--json'];
  if (silnik === 'whisper') argumenty.push('-e', 'whisper', '-m', 'medium', '-l', 'pl');
  else argumenty.push('-e', 'parakeet');
  const r = hf(argumenty, { timeout: 1800000 });
  const plik = path.join(folder, 'transcript.json');
  if (!r.ok || !fs.existsSync(plik)) {
    wypisz(`INFO ${(r.err || r.out).trim().split(/\r?\n/).slice(-2).join(' | ')}`);
    blad('transkrypcja nie powiodla sie');
  }
  return JSON.parse(fs.readFileSync(plik, 'utf8'));
}

// Linijki tekstu z czasami, dzielone na pauzach: z tego Claude buduje scenariusz i plan ciec.
function linijki(slowa, pauza = 0.6) {
  const wynik = [];
  let biezaca = null;
  for (const s of slowa) {
    const koniecZdania = biezaca && /[.?!]$/.test(biezaca.tekst[biezaca.tekst.length - 1]);
    if (!biezaca || s.start - biezaca.do > pauza || koniecZdania) {
      biezaca = { od: s.start, do: s.end, tekst: [] };
      wynik.push(biezaca);
    }
    biezaca.tekst.push(s.text);
    biezaca.do = s.end;
  }
  return wynik.map((l) => `  ${r2(l.od).toFixed(2).padStart(7)} - ${r2(l.do).toFixed(2).padStart(7)}  ${l.tekst.join(' ')}`);
}

function wczytaj(argumenty) {
  const najnowsze = Number(opcja(argumenty, '--najnowsze', 0));
  const silnik = opcja(argumenty, '--silnik', 'parakeet');
  const [projekt, ...wejscia] = argumenty;
  if (!projekt || !wejscia.length) blad('uzycie: wczytaj <projekt> <pliki|folder>');

  let pliki = [];
  for (const w of wejscia) {
    if (!fs.existsSync(w)) blad(`nie ma pliku ani folderu: ${w}`);
    if (fs.statSync(w).isDirectory()) {
      pliki.push(...fs.readdirSync(w).filter((n) => WIDEO.test(n)).map((n) => path.join(w, n)));
    } else pliki.push(w);
  }
  pliki = [...new Set(pliki.map((p) => path.resolve(p)))].sort((a, b) => fs.statSync(a).mtimeMs - fs.statSync(b).mtimeMs);
  if (najnowsze > 0) pliki = pliki.slice(-najnowsze);
  if (!pliki.length) blad('nie znalazlam nagran wideo');

  const praca = path.join(projekt, 'work');
  fs.mkdirSync(praca, { recursive: true });
  fs.mkdirSync(path.join(projekt, 'assets'), { recursive: true });
  fs.mkdirSync(path.join(projekt, 'renders'), { recursive: true });

  const zrodla = {};
  const tekst = [];
  pliki.forEach((plik, i) => {
    const k = `k${i + 1}`;
    zrodla[k] = plik;
    const inf = info(plik);
    wypisz(`KROK ${k} start ${path.basename(plik)} ${r2(inf.czas)}s ${inf.szer}x${inf.wys}`);

    // Arkusz 12 klatek: ustawienie kamery, kadr, czy to te same ujecia.
    const co = Math.max(inf.czas / 12, 0.5);
    ffWymagane(['-i', plik, '-vf', `fps=1/${co},scale=180:-2,tile=6x2`, '-frames:v', '1', '-q:v', '4', path.join(praca, `arkusz_${k}.jpg`)], 'arkusz klatek', { timeout: 600000 });

    if (!inf.dzwiek) {
      tekst.push(`== ${k} ${path.basename(plik)} (${r2(inf.czas)} s): brak dzwieku`, '');
      wypisz(`KROK ${k} gotowe bez-dzwieku`);
      return;
    }
    const slowa = transkrybuj(plik, path.join(praca, `transkrypcja_${k}`), silnik);
    zapiszJson(path.join(praca, `slowa_${k}.json`), slowa);
    const mowa = cisze(plik, { prog: -38, min: 0.3 });
    zapiszJson(path.join(praca, `cisze_${k}.json`), mowa);
    tekst.push(`== ${k} ${path.basename(plik)} (${r2(inf.czas)} s, ${inf.szer}x${inf.wys}, ${Math.round(inf.fps)} kl/s)`, ...linijki(slowa), '');
    wypisz(`KROK ${k} gotowe slow=${slowa.length}`);
  });

  zapiszJson(path.join(projekt, 'zrodla.json'), zrodla);
  fs.writeFileSync(path.join(projekt, 'transkrypt.txt'), tekst.join('\n'), 'utf8');
  wypisz(`STATUS nagrania ${pliki.length}`);
  wypisz(`STATUS transkrypt ${path.join(projekt, 'transkrypt.txt')}`);
  wypisz('WYNIK OK');
}

// ---------- skladanie rolki ----------

// Kadr 9:16 z oryginalu, potem przyblizenie (zoom) wokol punktu cx, cy (0-1, czesc kadru).
function filtrKadru(seg) {
  const z = Math.max(1, Number(seg.zoom || 1));
  const cx = Math.min(1, Math.max(0, Number(seg.cx ?? 0.5)));
  const cy = Math.min(1, Math.max(0, Number(seg.cy ?? 0.5)));
  return [
    "crop='min(iw,ih*9/16)':'min(ih,iw*16/9)'",
    `crop=w='iw/${z}':h='ih/${z}':x='min(max(${cx}*iw-ow/2,0),iw-ow)':y='min(max(${cy}*ih-oh/2,0),ih-oh)'`,
    `scale=${W}:${H}:flags=lanczos`,
    'setsar=1',
    `fps=${FPS}`,
  ].join(',');
}

function zloz(argumenty) {
  const [projekt] = argumenty;
  if (!projekt) blad('uzycie: zloz <projekt>');
  const zrodla = czytajJson(path.join(projekt, 'zrodla.json'), 'najpierw wczytaj');
  const edl = czytajJson(path.join(projekt, 'edl.json'), 'plan ciec');
  if (!Array.isArray(edl) || !edl.length) blad('edl.json jest pusty');

  const folder = path.join(projekt, 'work', 'segmenty');
  fs.rmSync(folder, { recursive: true, force: true });
  fs.mkdirSync(folder, { recursive: true });

  const segmenty = [];
  let klatka = 0;
  edl.forEach((seg, i) => {
    const plik = zrodla[seg.klip];
    if (!plik) blad(`segment ${seg.id || i + 1}: nie ma nagrania ${seg.klip} w zrodla.json`);
    const od = Number(seg.od);
    const doCzasu = Number(seg.do);
    if (!(doCzasu > od)) blad(`segment ${seg.id || i + 1}: "do" musi byc pozniej niz "od"`);
    // Kazdy segment ma calkowita liczbe klatek, a dzwiek dokladnie tyle samo czasu: bez tego obraz
    // i sylwetka bez tla rozjezdzaja sie po kilku cieciach.
    const n = Math.max(1, Math.round((doCzasu - od) * FPS));
    const dl = n / FPS;
    const nazwa = `s${String(i + 1).padStart(2, '0')}.mkv`;
    // Krotkie wyciszenie na brzegach (10-12 ms), zeby ciecie nie klikalo.
    const wejscia = ['-ss', String(od), '-i', plik];
    let mapy = ['-map', '0:v', '-map', '0:a'];
    let filtrDzwieku = `aresample=48000,apad,atrim=end=${dl},afade=t=in:d=0.01,afade=t=out:st=${Math.max(0, dl - 0.012)}:d=0.012`;
    if (!info(plik).dzwiek) {
      wejscia.push('-f', 'lavfi', '-i', 'anullsrc=r=48000:cl=stereo');
      mapy = ['-map', '0:v', '-map', '1:a'];
      filtrDzwieku = `atrim=end=${dl}`;
    }
    ffWymagane(
      [...wejscia, ...mapy, '-vf', filtrKadru(seg), '-frames:v', String(n), '-af', filtrDzwieku, '-ac', '2', '-c:a', 'pcm_s16le',
        '-c:v', 'libx264', '-preset', 'medium', '-crf', '15', '-pix_fmt', 'yuv420p', path.join(folder, nazwa)],
      `segment ${seg.id || i + 1}`,
      { timeout: 1800000 },
    );
    segmenty.push({
      id: seg.id || `s${i + 1}`,
      klip: seg.klip,
      od,
      do: doCzasu,
      zoom: Number(seg.zoom || 1),
      klatka_start: klatka,
      klatki: n,
      // Czas ciecia dla animacji: klatka/30 minus 2 ms, zeby tl.set trafil dokladnie w pierwsza klatke ujecia.
      start: r3(Math.max(0, klatka / FPS - 0.002)),
      koniec: r3((klatka + n) / FPS),
      tekst: seg.tekst || '',
    });
    klatka += n;
    wypisz(`KROK segment ${i + 1}/${edl.length} gotowe ${r2(dl)}s`);
  });

  // Lista z samymi nazwami plikow (bez sciezek): dziala tak samo na Macu i Windowsie.
  fs.writeFileSync(path.join(folder, 'lista.txt'), segmenty.map((_, i) => `file 's${String(i + 1).padStart(2, '0')}.mkv'`).join('\n') + '\n');
  const aroll = path.resolve(projekt, 'assets', 'aroll.mp4');
  fs.mkdirSync(path.dirname(aroll), { recursive: true });
  ffWymagane(
    ['-f', 'concat', '-safe', '0', '-i', 'lista.txt', '-vf', `setpts=N/${FPS}/TB`, '-fps_mode', 'cfr', '-r', String(FPS),
      '-c:v', 'libx264', '-preset', 'medium', '-crf', '16', '-pix_fmt', 'yuv420p', '-g', String(FPS),
      '-c:a', 'aac', '-b:a', '192k', '-movflags', '+faststart', aroll],
    'skladanie rolki',
    { cwd: folder, timeout: 1800000 },
  );

  const policzone = liczKlatki(aroll);
  zapiszJson(path.join(projekt, 'segmenty.json'), { fps: FPS, klatki: klatka, czas: r3(klatka / FPS), segmenty });
  if (policzone !== klatka) {
    wypisz(`STATUS blad klatki aroll=${policzone} plan=${klatka}`);
    wypisz('WYNIK BLAD');
    process.exit(1);
  }
  wypisz(`STATUS aroll OK ${r2(klatka / FPS)}s klatek=${klatka} segmentow=${segmenty.length}`);
  wypisz('WYNIK OK');
}

function transkrypcjaRolki(argumenty) {
  const silnik = opcja(argumenty, '--silnik', 'parakeet');
  const [projekt] = argumenty;
  const aroll = path.join(projekt || '', 'assets', 'aroll.mp4');
  if (!projekt || !fs.existsSync(aroll)) blad('brak assets/aroll.mp4 - najpierw zloz');
  wypisz('KROK transkrypcja start');
  const slowa = transkrybuj(aroll, path.join(projekt, 'work', 'transkrypcja_rolki'), silnik);
  zapiszJson(path.join(projekt, 'slowa.json'), slowa);
  fs.writeFileSync(path.join(projekt, 'transkrypt-rolki.txt'), linijki(slowa).join('\n') + '\n', 'utf8');
  wypisz(`STATUS slowa ${slowa.length}`);
  wypisz('WYNIK OK');
}

// ---------- sylwetka bez tla ----------

function wytnijTlo(argumenty) {
  const [projekt, ...reszta] = argumenty;
  const aroll = path.join(projekt || '', 'assets', 'aroll.mp4');
  if (!projekt || !fs.existsSync(aroll)) blad('brak assets/aroll.mp4 - najpierw zloz');
  const sylwetka = path.join(projekt, 'assets', 'sylwetka.webm');
  const czas = info(aroll).czas;
  wypisz(`KROK wycinanie start ${r2(czas)}s nagrania (na Macu z Apple okolo 8 s pracy na 1 s nagrania, na innych komputerach dluzej)`);
  const r = hf(['remove-background', aroll, '-o', sylwetka, '--quality', 'best', '--json', ...reszta], { timeout: 7200000 });
  if (!r.ok || !fs.existsSync(sylwetka)) {
    wypisz(`INFO ${(r.err || r.out).trim().split(/\r?\n/).slice(-2).join(' | ')}`);
    blad('wycinanie tla nie powiodlo sie');
  }
  const a = liczKlatki(aroll);
  const s = liczKlatki(sylwetka, 'libvpx-vp9');
  if (a !== s) {
    wypisz(`STATUS blad klatki aroll=${a} sylwetka=${s} (sylwetka rozjedzie sie z obrazem: zloz rolke od nowa)`);
    wypisz('WYNIK BLAD');
    process.exit(1);
  }
  wypisz(`STATUS sylwetka OK klatek=${s}`);
  wypisz('WYNIK OK');
}

// ---------- glowa ----------

// Prostokat nieprzezroczystej czesci (alfa) w danym fragmencie. reset=0: suma z calego fragmentu,
// wiec "y" to najwyzszy punkt, do ktorego siegnela sylwetka w tym czasie.
function prostokatAlfy(sylwetka, od, dl, wycinek) {
  const filtr = ['fps=5', 'alphaextract', wycinek, 'cropdetect=limit=40:round=2:reset=0'].filter(Boolean).join(',');
  const r = ff(['-c:v', 'libvpx-vp9', '-ss', String(od), '-t', String(Math.max(dl, 0.2)), '-i', sylwetka, '-vf', filtr, '-f', 'null', '-'], { timeout: 600000 });
  const wszystkie = [...r.err.matchAll(/crop=(\d+):(\d+):(\d+):(\d+)/g)];
  if (!wszystkie.length) return null;
  const [, w, h, x, y] = wszystkie[wszystkie.length - 1].map(Number);
  return { x, y, w, h };
}

function glowa(argumenty) {
  const [projekt] = argumenty;
  const sylwetka = path.join(projekt || '', 'assets', 'sylwetka.webm');
  if (!projekt || !fs.existsSync(sylwetka)) blad('brak assets/sylwetka.webm - najpierw wytnij-tlo');
  const { segmenty } = czytajJson(path.join(projekt, 'segmenty.json'), 'najpierw zloz');
  const PAS = 220; // pas pod czubkiem glowy, z ktorego mierzymy szerokosc glowy (bez ramion)
  const wynik = segmenty.map((seg) => {
    const dl = seg.koniec - seg.start;
    const cala = prostokatAlfy(sylwetka, seg.start, dl);
    if (!cala) return { id: seg.id, start: seg.start, koniec: seg.koniec, sylwetka: null };
    const pas = prostokatAlfy(sylwetka, seg.start, dl, `crop=iw:${PAS}:0:${Math.min(cala.y, H - PAS)}`);
    const szer = pas ? pas.w : null;
    const g = {
      id: seg.id,
      start: seg.start,
      koniec: seg.koniec,
      glowa_gora: cala.y,
      glowa_x_od: pas ? pas.x : null,
      glowa_x_do: pas ? pas.x + pas.w : null,
      // Szacunek: glowa jest okolo 1,35 raza wyzsza niz szeroka. Do kart "pod broda" dodaj zapas 40 px.
      broda_okolo: szer ? Math.round(cala.y + szer * 1.35) : null,
      sylwetka: cala,
    };
    wypisz(`GLOWA ${g.id} gora=${g.glowa_gora} x=${g.glowa_x_od}-${g.glowa_x_do} broda~${g.broda_okolo}`);
    return g;
  });
  zapiszJson(path.join(projekt, 'glowa.json'), wynik);
  wypisz(`STATUS glowa ${wynik.length}`);
  wypisz('WYNIK OK');
}

// ---------- strefa bezpieczna ----------

// Pola zajete przez interfejs Reels (na kadrze 1080x1920): gora 220, dol od 1470, boki 35,
// prawa kolumna 100 px od wysokosci 1155 w dol (ikony polubien i komentarzy).
const STREFY = [
  [0, 0, W, 220],
  [0, 1470, W, H - 1470],
  [0, 220, 35, 1250],
  [W - 35, 220, 35, 935],
  [W - 100, 1155, 100, 315],
];

function strefa(argumenty) {
  if (!argumenty.length) blad('podaj obrazy (podglady klatek)');
  const filtr = STREFY.map(([x, y, w, h]) => `drawbox=x=iw*${x}/${W}:y=ih*${y}/${H}:w=iw*${w}/${W}:h=ih*${h}/${H}:color=red@0.35:t=fill`).join(',');
  for (const obraz of argumenty) {
    if (!fs.existsSync(obraz)) blad(`nie ma obrazu ${obraz}`);
    const wyj = obraz.replace(/(\.[^.]+)$/, '-strefa$1');
    ffWymagane(['-i', obraz, '-vf', filtr, '-frames:v', '1', '-update', '1', wyj], 'nakladka strefy');
    wypisz(`STREFA ${wyj}`);
  }
  wypisz('WYNIK OK');
}

// ---------- glosnosc ----------

function mierzGlosnosc(plik) {
  const r = ff(['-i', plik, '-vn', '-af', 'ebur128=peak=true', '-f', 'null', '-'], { timeout: 600000 });
  const lufs = [...r.err.matchAll(/I:\s+(-?[\d.]+) LUFS/g)].pop();
  const szczyt = [...r.err.matchAll(/Peak:\s+(-?[\d.]+) dBFS/g)].pop();
  return { lufs: lufs ? Number(lufs[1]) : null, szczyt: szczyt ? Number(szczyt[1]) : null };
}

function glosnosc(argumenty) {
  const [plik] = argumenty;
  if (!plik || !fs.existsSync(plik)) blad('podaj istniejacy plik');
  const g = mierzGlosnosc(plik);
  wypisz(`STATUS glosnosc lufs=${g.lufs} szczyt=${g.szczyt}`);
  wypisz('WYNIK OK');
}

// ---------- kontrola ciec ----------

function sprawdzCiecia(argumenty) {
  const telefon = flaga(argumenty, '--telefon');
  const [projekt, render] = argumenty;
  if (!projekt || !render || !fs.existsSync(render)) blad('uzycie: sprawdz-ciecia <projekt> <render.mp4> [--telefon]');
  const { segmenty, klatki } = czytajJson(path.join(projekt, 'segmenty.json'), 'najpierw zloz');
  const folder = path.join(projekt, 'work', 'ciecia');
  fs.rmSync(folder, { recursive: true, force: true });
  fs.mkdirSync(folder, { recursive: true });

  const wRenderze = liczKlatki(render);
  if (Math.abs(wRenderze - klatki) > 1) wypisz(`INFO render ma ${wRenderze} klatek, rolka ${klatki}: sprawdz, czy to ta sama wersja`);

  const ciecia = segmenty.slice(1).map((s) => s.klatka_start);
  if (ciecia.length) {
    // Ostatnia klatka przed cieciem i pierwsza po nim, para obok pary: lewa = przed, prawa = po.
    const numery = ciecia.flatMap((k) => [k - 1, k]);
    const wybor = numery.map((n) => `eq(n\\,${n})`).join('+');
    ffWymagane(['-i', render, '-vf', `select='${wybor}',scale=270:-2`, '-fps_mode', 'passthrough', path.join(folder, 'k%03d.png')], 'klatki ciec', { timeout: 1800000 });
    const arkusz = path.join(projekt, 'work', 'kontrola-ciec.jpg');
    ffWymagane(['-framerate', '1', '-i', path.join(folder, 'k%03d.png'), '-vf', `tile=2x${ciecia.length}:padding=6:color=white`, '-frames:v', '1', '-q:v', '3', arkusz], 'arkusz ciec');
    wypisz(`STATUS ciecia ${ciecia.length} arkusz=${arkusz}`);
    ciecia.forEach((k, i) => wypisz(`CIECIE ${i + 1} czas=${r3(k / FPS)}s przed=${segmenty[i].id} po=${segmenty[i + 1].id}`));
  } else wypisz('STATUS ciecia 0');

  const g = mierzGlosnosc(render);
  wypisz(`STATUS glosnosc lufs=${g.lufs} szczyt=${g.szczyt}`);

  if (telefon) {
    const wyj = render.replace(/(\.[^.]+)$/, '-telefon.mp4');
    ffWymagane(['-i', render, '-vf', 'scale=720:-2', '-c:v', 'libx264', '-preset', 'medium', '-crf', '27', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '128k', '-movflags', '+faststart', wyj], 'kopia na telefon', { timeout: 1800000 });
    wypisz(`STATUS telefon ${wyj} ${r2(fs.statSync(wyj).size / 1048576)}MB`);
  }
  wypisz('WYNIK OK');
}

// ---------- start ----------

const [polecenie, ...reszta] = process.argv.slice(2);
const polecenia = {
  wczytaj,
  pauzy,
  zloz,
  transkrypcja: transkrypcjaRolki,
  'wytnij-tlo': wytnijTlo,
  glowa,
  strefa,
  'sprawdz-ciecia': sprawdzCiecia,
  glosnosc,
};
if (!polecenia[polecenie]) blad(`nieznane polecenie ${polecenie || ''} (uzyj: ${Object.keys(polecenia).join(', ')})`);
polecenia[polecenie](reszta);
