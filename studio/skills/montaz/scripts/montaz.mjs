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
//   wytnij-tlo <projekt> [--zgoda] | wytnij-tlo --sprawdz
//        sylwetka bez tla -> assets/sylwetka.webm i sprawdzenie, ze ma tyle samo klatek co aroll.mp4
//        za pierwszym razem HyperFrames pobiera model (~390 MB): bez --zgoda tylko o tym informuje
//   glowa <projekt>
//        gdzie jest glowa i sylwetka w kazdym segmencie -> glowa.json (do napisow za glowa i kart pod broda)
//   strefa <obraz.png>...
//        rysuje na podgladach czerwone pola poza strefa bezpieczna Reels -> <obraz>-strefa.png
//   sprawdz-ciecia <projekt> <render.mp4> [--telefon]
//        klatka przed i po kazdym cieciu na jednym arkuszu + glosnosc + kopia na telefon (720p)
//   glosnosc <plik>
//        szczyt (dB) i glosnosc (LUFS)
//   podlacz <projekt> <folder kompozycji>
//        wstawia assets/aroll.mp4 i assets/sylwetka.webm do <folder kompozycji>/assets bez drugiej kopii na dysku
//        (twarde dowiazanie; gdy sie nie da, zwykla kopia)
//   warianty-plan <projekt> [--ile N] [--rodzaje haslo,hook,zdanie,ruch,napis] [--rolka <plik>] [--kompozycja <folder>] [--od-nowa]
//        plan wariantow gotowej rolki do rolek probnych -> warianty.json (inny poczatek, delikatnie inne tempo i kadr)
//   warianty-przygotuj <projekt> [--nr N] [--od-nowa]
//        kopia kompozycji na kazdy wariant w work/warianty/<nazwa>/ (tu Claude zmienia hak)
//   warianty-render <projekt> [--nr N] [--od-nowa]
//        warianty jeden po drugim: poczatek z kompozycji wariantu + reszta gotowej rolki, tempo i kadr -> warianty/
//   warianty-lista <projekt>
//        gotowe pliki wariantow
//
// Wypisuje linie "STATUS ...", "KROK ...", "INFO ...", "WYNIK ...". Claude tlumaczy je kursantce.
// Narzedzia (Node, FFmpeg, HyperFrames) bierze z narzedzia.json zapisanego przez /studio:start.

import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

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

// HyperFrames przy pierwszym wycinaniu sam pobiera model (~170 MB) i silnik do niego (~220 MB) do ~/.cache/hyperframes.
// Sprawdzamy to wczesniej, zeby kursantka zgodzila sie na pobieranie, zamiast dowiadywac sie o nim po fakcie.
function brakiWycinania() {
  const cache = path.join(os.homedir(), '.cache', 'hyperframes');
  const braki = [];
  if (!fs.existsSync(path.join(cache, 'background-removal', 'models', 'u2net_human_seg.onnx'))) braki.push(['model', 170]);
  const opcjonalne = path.join(cache, 'optional');
  if (!fs.existsSync(opcjonalne) || !fs.readdirSync(opcjonalne).some((n) => n.startsWith('onnxruntime-node@'))) {
    braki.push(['silnik', 220]);
  }
  return braki;
}

function wytnijTlo(argumenty) {
  const sprawdz = argumenty.includes('--sprawdz');
  const zgoda = argumenty.includes('--zgoda');
  const [projekt, ...reszta] = argumenty.filter((a) => a !== '--sprawdz' && a !== '--zgoda');
  const braki = brakiWycinania();
  if (braki.length) {
    const mb = braki.reduce((suma, [, m]) => suma + m, 0);
    wypisz(`STATUS wycinanie DO_POBRANIA ${mb}MB (${braki.map(([n]) => n).join(', ')})`);
  } else wypisz('STATUS wycinanie GOTOWE');
  if (sprawdz) return wypisz('WYNIK OK');
  if (braki.length && !zgoda) {
    wypisz('WYNIK CZEKA_NA_ZGODE');
    process.exit(2);
  }
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

// Pola zajete przez interfejs Instagrama (zmierzone na zrzutach ekranu, kadr 1080x1920): gora 0-220,
// dol od 1470, boki po 60 px (przycinane na wysokich telefonach), kolumna ikon X 900-1080 od Y 1050 w dol.
const STREFY = [
  [0, 0, W, 220],
  [0, 1470, W, H - 1470],
  [0, 220, 60, 1250],
  [W - 60, 220, 60, 830],
  [900, 1050, W - 900, 420],
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

// Kompozycja potrzebuje nagrania we wlasnym folderze assets. Twarde dowiazanie to ten sam plik pod druga nazwa:
// nie zajmuje miejsca drugi raz, a po ponownym "zloz" kompozycja od razu widzi nowa rolke.
function podlacz(argumenty) {
  const [projekt, kompozycja] = argumenty;
  if (!projekt || !kompozycja || !fs.existsSync(kompozycja)) blad('uzycie: podlacz <projekt> <folder kompozycji>');
  const cel = path.join(kompozycja, 'assets');
  fs.mkdirSync(cel, { recursive: true });
  let ile = 0;
  for (const nazwa of ['aroll.mp4', 'sylwetka.webm']) {
    const zrodlo = path.join(projekt, 'assets', nazwa);
    if (!fs.existsSync(zrodlo)) continue;
    const plik = path.join(cel, nazwa);
    const st = fs.statSync(zrodlo);
    if (fs.existsSync(plik)) {
      const juz = fs.statSync(plik);
      if (juz.ino === st.ino && juz.dev === st.dev) {
        wypisz(`STATUS podlacz ${nazwa} JUZ`);
        ile++;
        continue;
      }
      fs.rmSync(plik, { force: true });
    }
    try {
      fs.linkSync(zrodlo, plik);
      wypisz(`STATUS podlacz ${nazwa} DOWIAZANIE`);
    } catch {
      fs.copyFileSync(zrodlo, plik);
      wypisz(`STATUS podlacz ${nazwa} KOPIA`);
    }
    ile++;
  }
  if (!ile) blad('brak assets/aroll.mp4 - najpierw zloz');
  wypisz('WYNIK OK');
}

// ---------- warianty do rolek probnych ----------

// Warianty gotowej rolki roznia sie tylko poczatkiem, bo pierwsze 3-4 sekundy decyduja, czy rolka probna pojdzie
// dalej: kazdy wariant zmienia jedna rzecz w haku. Od chwili "do" wariant jest juz gotowa rolka, doklejana z pliku
// bez drugiego renderu. Do tego kazdy wariant dostaje delikatnie inne tempo (glos bez zmiany wysokosci) i kadr, zeby
// zaden nie byl kopia innego. Kolorow i stron obrazu nie zmieniamy.
const RODZAJE = {
  haslo: { plik: 'mocniejsze-haslo', co: 'Mocniejsze haslo na start', zrob: 'nowy, mocniejszy tekst haka (wyglad haka zostaje)' },
  hook: { plik: 'inny-hook', co: 'Inny hook na pierwsze sekundy', zrob: 'inny hook z Lookbooka zamiast obecnego (tekst haka zostaje)' },
  zdanie: { plik: 'inne-pierwsze-zdanie', co: 'Inne pierwsze zdanie', zrob: 'otwarcie: najmocniejsze zdanie z nagrania z duzym hakiem, przed cala rolka' },
  ruch: { plik: 'ruch-na-start', co: 'Ruch kamery na start', zrob: 'wbicie, przyblizenie albo szybkie ciecie na pierwszych slowach' },
  napis: { plik: 'inny-napis-na-start', co: 'Inny napis na start', zrob: 'pierwsze slowa pokazane inaczej: duze, slowo po slowie' },
};
const KOLEJNOSC = ['haslo', 'hook', 'zdanie', 'ruch', 'napis'];
const MAKS_WARIANTOW = 6;
// Dla kazdego wariantu inne i nigdy 1 (tempo 1 i kadr 1 to gotowa rolka): tempo najwyzej o 2,5%, kadr najwyzej 2%
// blizej.
const TEMPA = [1.02, 0.98, 1.025, 0.975, 1.015, 0.985];
const KADRY = [1.015, 1.02, 1.01, 1.0175, 1.0125, 1.0075];
// Kadr przyblizamy wokol srodka strefy bezpiecznej (Y 220-1470): twarz prawie stoi, a napisy i karty rosna razem
// z nia, wiec zachowuja odleglosc od twarzy. Napis przy samej granicy strefy przesuwa sie najwyzej o 12 px.
const SRODEK_KADRU = [W / 2, 845];
// Ponizej 40 dB klatka wariantu wyraznie rozni sie od rolki, powyzej 32 dB w chwili doklejenia nie widac szwu.
const PSNR_ZMIANA = 40;
const PSNR_SZEW = 32;
const POMIJANE = new Set(['renders', 'snapshots', 'node_modules', '.transcode-cache', '.hyperframes', '.DS_Store', 'otwarcie', 'arkusz']);
const LOOKBOOK = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..', 'lookbook');

function sciezkiWariantow(projekt) {
  return {
    plan: path.join(projekt, 'warianty.json'),
    robocze: path.join(projekt, 'work', 'warianty'),
    gotowe: path.join(projekt, 'warianty'),
  };
}

const stempel = () => new Date().toISOString().replace(/[-:]/g, '').replace('T', '-').slice(0, 15);

function czytajJsonCicho(plik) {
  try {
    return JSON.parse(fs.readFileSync(plik, 'utf8'));
  } catch {
    return null;
  }
}

// Gotowe rolki w renders/: z kazdej serii (rolka-v001, -v002...) najnowsza wersja, bez kopii na telefon.
function rolkiProjektu(projekt) {
  const serie = {};
  let pliki = [];
  try {
    pliki = fs.readdirSync(path.join(projekt, 'renders'));
  } catch {
    return [];
  }
  for (const nazwa of pliki) {
    const m = nazwa.match(/^(.+)-v(\d+)\.(mp4|mov|m4v)$/i);
    if (!m) continue;
    const klucz = m[1].toLowerCase();
    if (!serie[klucz] || Number(m[2]) > serie[klucz].wersja) {
      serie[klucz] = { seria: m[1], wersja: Number(m[2]), plik: path.join(projekt, 'renders', nazwa) };
    }
  }
  return Object.values(serie).sort((a, b) => fs.statSync(b.plik).mtimeMs - fs.statSync(a.plik).mtimeMs);
}

// Kompozycja, z ktorej powstala rolka: hf, a dla serii z dopiskiem (rolka-wersja-b) folder hf-wersja-b.
function kompozycjaRolki(projekt, seria) {
  const foldery = fs.readdirSync(projekt, { withFileTypes: true }).filter((w) => w.isDirectory() && /^hf[-_]/i.test(w.name));
  const pasuje = foldery.find((w) => seria.toLowerCase().endsWith(w.name.slice(3).toLowerCase()));
  return pasuje ? pasuje.name : 'hf';
}

function lookbookHooki() {
  try {
    return fs.readdirSync(path.join(LOOKBOOK, 'hooki'), { withFileTypes: true })
      .filter((w) => w.isDirectory() && fs.existsSync(path.join(LOOKBOOK, 'hooki', w.name, 'hook.json')))
      .map((w) => w.name)
      .sort();
  } catch {
    return [];
  }
}

// Do kiedy wariant moze sie roznic od rolki: pierwsze ciecie miedzy 3,5 a 8 s (doklejenie wypada wtedy na cieciu),
// bez segmenty.json 5 s.
function koniecHaka(projekt, czas) {
  const s = czytajJsonCicho(path.join(projekt, 'segmenty.json'));
  const ciecia = ((s && s.segmenty) || []).map((g) => g.klatka_start / FPS).filter((t) => t >= 3.5 && t <= 8);
  return r3(Math.min(ciecia.length ? ciecia[0] : 5, Math.max(1, czas - 1)));
}

function czytajPlan(projekt) {
  if (!projekt || !fs.existsSync(projekt)) blad('podaj folder projektu');
  const dane = czytajJson(sciezkiWariantow(projekt).plan, 'najpierw warianty-plan');
  if (!Array.isArray(dane.warianty) || !dane.warianty.length) blad('warianty.json nie ma wariantow');
  return dane;
}

function wybrane(dane, nr) {
  if (!nr) return dane.warianty;
  const numery = String(nr).split(',').map((x) => Number(x.trim()));
  const lista = dane.warianty.filter((w) => numery.includes(Number(w.nr)));
  if (!lista.length) blad(`nie ma wariantu ${nr}`);
  return lista;
}

function pokazPlan(dane) {
  wypisz(`ROLKA ${dane.rolka} czas=${dane.czas_rolki}s kompozycja=${dane.kompozycja}`);
  for (const w of dane.warianty) {
    let dodatek = '';
    if (w.rodzaj === 'hook') dodatek = ` hook=${w.hook}`;
    if (w.rodzaj === 'zdanie') dodatek = ` zdanie=${w.zdanie?.od ?? '?'}-${w.zdanie?.do ?? '?'}s`;
    const zmiana = w.do == null ? 'cala rolka' : w.rodzaj === 'zdanie' ? 'otwarcie' : `0-${w.do}s`;
    wypisz(`WARIANT ${w.nr} ${w.rodzaj} plik=${w.nazwa}.mp4 zmiana=${zmiana} tempo=${w.tempo} kadr=${w.kadr} stan=${w.stan}${dodatek}`);
  }
}

// Nowy plan: wyniki poprzedniego ida na bok, nic nie kasujemy. Gotowe pliki do warianty/wczesniejsze-<data>/,
// foldery robocze do work/warianty-<data>/.
function odlozPoprzednie(robocze, gotowe) {
  const s = stempel();
  const pliki = fs.existsSync(gotowe) ? fs.readdirSync(gotowe).filter((n) => /\.(mp4|mov)$/i.test(n)) : [];
  if (pliki.length) {
    const cel = path.join(gotowe, `wczesniejsze-${s}`);
    fs.mkdirSync(cel, { recursive: true });
    for (const n of pliki) fs.renameSync(path.join(gotowe, n), path.join(cel, n));
    wypisz(`INFO poprzednie warianty przeniesione do ${cel}`);
  }
  if (fs.existsSync(robocze)) fs.renameSync(robocze, `${robocze}-${s}`);
}

function wariantyPlan(argumenty) {
  const ile = opcja(argumenty, '--ile', null);
  const rodzajeArg = opcja(argumenty, '--rodzaje', null);
  const rolkaArg = opcja(argumenty, '--rolka', null);
  const kompozycjaArg = opcja(argumenty, '--kompozycja', null);
  const odNowa = flaga(argumenty, '--od-nowa');
  const [projekt] = argumenty;
  if (!projekt || !fs.existsSync(projekt)) blad('uzycie: warianty-plan <projekt> [--ile N] [--rodzaje haslo,hook,zdanie,ruch,napis]');
  const { plan, robocze, gotowe } = sciezkiWariantow(projekt);
  if (fs.existsSync(plan) && !odNowa) {
    wypisz('INFO warianty.json juz jest i zostaje (nowy plan: --od-nowa)');
    pokazPlan(czytajJson(plan, 'plan wariantow'));
    wypisz('WYNIK OK');
    return;
  }

  let rolka;
  let seria;
  if (rolkaArg) {
    rolka = path.resolve(projekt, rolkaArg);
    if (!fs.existsSync(rolka)) blad(`nie ma pliku ${rolkaArg}`);
    seria = path.basename(rolka).replace(/-v\d+\.[^.]+$/i, '');
  } else {
    const rolki = rolkiProjektu(projekt);
    if (!rolki.length) blad('w projekcie nie ma gotowej rolki (renders/<nazwa>-v001.mp4) - najpierw montaz');
    if (rolki.length > 1) {
      rolki.forEach((r) => wypisz(`ROLKA_DO_WYBORU ${path.relative(projekt, r.plik)}`));
      blad('w projekcie jest kilka rolek - wskaz zaakceptowana: --rolka <plik>');
    }
    rolka = rolki[0].plik;
    seria = rolki[0].seria;
  }
  const kompozycja = path.resolve(projekt, kompozycjaArg || kompozycjaRolki(projekt, seria));
  if (!fs.existsSync(path.join(kompozycja, 'index.html'))) {
    blad(`nie ma ${path.relative(projekt, kompozycja)}/index.html - wskaz kompozycje rolki: --kompozycja <folder>`);
  }
  const czas = liczKlatki(rolka) / FPS;

  const rodzaje = (rodzajeArg ? rodzajeArg.split(',') : KOLEJNOSC).map((r) => r.trim()).filter(Boolean);
  const zle = rodzaje.filter((r) => !RODZAJE[r]);
  if (zle.length) blad(`nieznany rodzaj wariantu: ${zle.join(', ')} (sa: ${KOLEJNOSC.join(', ')})`);
  const hookTeraz = (czytajJsonCicho(path.join(DOM, 'moj-styl.json')) || {}).hook || null;
  const hooki = lookbookHooki().filter((h) => h !== hookTeraz);
  let wybor = rodzaje;
  if (rodzaje.includes('hook') && !hooki.length) {
    wypisz('INFO w Lookbooku nie ma innych hookow - pomijam rodzaj hook');
    wybor = rodzaje.filter((r) => r !== 'hook');
  }
  if (!wybor.length) blad('zaden rodzaj wariantu nie pasuje do tej rolki');

  let n = ile == null ? 3 : Math.round(Number(ile));
  if (!(n >= 1)) n = 3;
  if (n > MAKS_WARIANTOW) {
    wypisz(`INFO najwiecej ${MAKS_WARIANTOW} wariantow - plan ma ${MAKS_WARIANTOW}`);
    n = MAKS_WARIANTOW;
  }
  const koniec = koniecHaka(projekt, czas);
  if (odNowa) odlozPoprzednie(robocze, gotowe);

  const warianty = [];
  for (let i = 0; i < n; i++) {
    const rodzaj = wybor[i % wybor.length];
    const powtorka = Math.floor(i / wybor.length);
    const w = {
      nr: i + 1,
      rodzaj,
      nazwa: `wariant-${i + 1}-${RODZAJE[rodzaj].plik}`,
      co: RODZAJE[rodzaj].co + (powtorka ? ` (${powtorka + 1})` : ''),
      do: rodzaj === 'zdanie' ? 0 : koniec,
      tempo: TEMPA[i],
      kadr: KADRY[i],
      stan: 'plan',
    };
    if (rodzaj === 'haslo') w.haslo = '';
    if (rodzaj === 'hook') w.hook = hooki[powtorka % hooki.length];
    if (rodzaj === 'zdanie') w.zdanie = { od: null, do: null, tekst: '' };
    warianty.push(w);
  }
  const dane = {
    rolka: path.relative(projekt, rolka),
    kompozycja: path.relative(projekt, kompozycja),
    czas_rolki: r3(czas),
    hook_teraz: hookTeraz,
    utworzono: new Date().toISOString().slice(0, 19),
    warianty,
  };
  zapiszJson(plan, dane);
  pokazPlan(dane);
  if (wybor.includes('hook')) wypisz(`HOOKI ${hooki.join(', ')}`);
  if (wybor.includes('zdanie')) {
    const t = path.join(projekt, 'transkrypt-rolki.txt');
    wypisz(fs.existsSync(t) ? `ZDANIA ${t}` : 'INFO brak transkryptu rolki - zdania do wyboru da polecenie transkrypcja');
  }
  wypisz(`STATUS warianty-plan ${warianty.length} ${plan}`);
  wypisz('WYNIK OK');
}

function plikiHtml(folder) {
  const wynik = [];
  for (const w of fs.readdirSync(folder, { withFileTypes: true })) {
    if (POMIJANE.has(w.name) || w.name === 'assets') continue;
    const p = path.join(folder, w.name);
    if (w.isDirectory()) wynik.push(...plikiHtml(p));
    else if (/\.html?$/i.test(w.name)) wynik.push(p);
  }
  return wynik.sort();
}

// Lokalne pliki, ktorych kompozycja uzywa, a ktorych nie ma (po porzadku w projekcie brakuje nagrania i sylwetki).
function brakiKompozycji(folder) {
  const braki = new Set();
  for (const strona of plikiHtml(folder)) {
    for (const [, src] of fs.readFileSync(strona, 'utf8').matchAll(/\bsrc="([^"]+)"/g)) {
      if (/^(https?:|data:|\/\/)/i.test(src)) continue;
      if (!fs.existsSync(path.join(folder, src.split(/[?#]/)[0]))) braki.add(src);
    }
  }
  return [...braki];
}

function dowiaz(zrodlo, cel) {
  try {
    fs.linkSync(zrodlo, cel);
  } catch {
    fs.copyFileSync(zrodlo, cel);
  }
}

// Kopia kompozycji na wariant: strony i ustawienia jako zwykle kopie (Claude je zmienia), pliki z assets jako twarde
// dowiazania (nie zajmuja drugi raz miejsca na dysku).
function kopiujKompozycje(z, cel, wAssets = false) {
  fs.mkdirSync(cel, { recursive: true });
  for (const w of fs.readdirSync(z, { withFileTypes: true })) {
    if (POMIJANE.has(w.name)) continue;
    let zrodlo = path.join(z, w.name);
    let st;
    try {
      zrodlo = fs.realpathSync(zrodlo);
      st = fs.statSync(zrodlo);
    } catch {
      continue;
    }
    const docel = path.join(cel, w.name);
    if (st.isDirectory()) kopiujKompozycje(zrodlo, docel, wAssets || w.name === 'assets');
    else if (wAssets) dowiaz(zrodlo, docel);
    else fs.copyFileSync(zrodlo, docel);
  }
}

// Szkielet otwarcia: zdanie z rolki (ten sam obraz, kolor i glos) na sam poczatek. Hak dopisuje Claude.
function przygotujOtwarcie(kompozycja, folder, w) {
  const cel = path.join(folder, 'otwarcie');
  fs.mkdirSync(cel, { recursive: true });
  for (const n of ['hyperframes.json', 'package.json']) {
    if (fs.existsSync(path.join(kompozycja, n))) fs.copyFileSync(path.join(kompozycja, n), path.join(cel, n));
  }
  if (fs.existsSync(path.join(kompozycja, 'assets'))) kopiujKompozycje(path.join(kompozycja, 'assets'), path.join(cel, 'assets'), true);
  const z = w.zdanie || {};
  const od = Number(z.od);
  const doCzasu = Number(z.do);
  if (z.od == null || z.do == null || !(od >= 0 && doCzasu > od)) return false;
  const dl = r3(Math.max(1, Math.round((doCzasu - od) * FPS)) / FPS);
  const glowny = fs.readFileSync(path.join(kompozycja, 'index.html'), 'utf8');
  const tag = (glowny.match(/<video\b[^>]*assets\/aroll\.mp4[^>]*>/i) || [''])[0];
  const kolor = (tag.match(/\sdata-color-grading="[^"]*"/) || [''])[0];
  const glos = fs.existsSync(path.join(kompozycja, 'assets', 'glos.m4a'));
  const html = `<!DOCTYPE html>
<html lang="pl">
<head>
<meta charset="utf-8">
<script src="https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/gsap.min.js"></script>
<style>
  html, body { margin: 0; background: #000; }
  #root { position: relative; width: 1080px; height: 1920px; overflow: hidden; background: #000; }
  #kadr { position: absolute; inset: 0; z-index: 1; }
  .aroll { position: absolute; left: 0; top: 0; width: 1080px; height: 1920px; object-fit: cover; }
</style>
</head>
<body>
<!-- Otwarcie wariantu ${w.nr}: zdanie z rolki (${od}-${doCzasu} s) na sam poczatek. Hak dodaj tutaj: duzy, od klatki 0. -->
<div id="root" data-composition-id="main" data-start="0" data-duration="${dl}" data-width="1080" data-height="1920">
  <div id="kadr">
    <video id="zdanie" class="clip aroll" src="assets/aroll.mp4" data-start="0" data-duration="${dl}" data-media-start="${od}" data-track-index="0"${kolor} ${glos ? 'muted playsinline' : 'data-has-audio="true" playsinline'}></video>
  </div>
${glos ? `  <audio id="glos" class="clip" src="assets/glos.m4a" data-start="0" data-duration="${dl}" data-media-start="${od}" data-track-index="10" data-volume="1"></audio>\n` : ''}</div>
<script>
  window.__timelines = window.__timelines || {};
  const tl = gsap.timeline({ paused: true });
  window.__timelines["main"] = tl;
</script>
</body>
</html>
`;
  fs.writeFileSync(path.join(cel, 'index.html'), html, 'utf8');
  return true;
}

function zadanie(w, folder) {
  if (w.rodzaj === 'zdanie') {
    const z = w.zdanie || {};
    const ktore = z.od != null && z.do != null ? `zdanie ${z.od}-${z.do}s` : 'najpierw wybierz zdanie';
    return `${RODZAJE.zdanie.zrob}: ${ktore} w ${path.join(folder, 'otwarcie')}`;
  }
  const hook = w.rodzaj === 'hook' ? ` - hook ${w.hook}` : '';
  return `${RODZAJE[w.rodzaj].zrob}${hook}; tylko w pierwszych ${w.do}s, w ${folder}`;
}

function wariantyPrzygotuj(argumenty) {
  const nr = opcja(argumenty, '--nr', null);
  const odNowa = flaga(argumenty, '--od-nowa');
  const [projekt] = argumenty;
  const dane = czytajPlan(projekt);
  const { plan, robocze } = sciezkiWariantow(projekt);
  const kompozycja = path.resolve(projekt, dane.kompozycja);
  if (!fs.existsSync(path.join(kompozycja, 'index.html'))) blad(`nie ma kompozycji ${dane.kompozycja}`);
  const braki = brakiKompozycji(kompozycja);
  if (braki.length) {
    wypisz(`STATUS warianty BRAK_PLIKOW ${braki.join(', ')}`);
    blad('kompozycji brakuje plikow - po porzadku w projekcie: zloz (i wytnij-tlo, glowa, gdy rolka ich uzywa), potem podlacz');
  }
  for (const w of wybrane(dane, nr)) {
    const folder = path.join(robocze, w.nazwa);
    if (fs.existsSync(folder)) {
      if (!odNowa) {
        wypisz(`STATUS wariant ${w.nr} JUZ ${folder}`);
        wypisz(`ZROB ${w.nr} ${zadanie(w, folder)}`);
        continue;
      }
      fs.renameSync(folder, `${folder}-${stempel()}`);
    }
    kopiujKompozycje(kompozycja, folder);
    if (w.rodzaj === 'zdanie' && !przygotujOtwarcie(kompozycja, folder, w)) {
      wypisz(`INFO wariant ${w.nr}: wpisz zdanie.od i zdanie.do w warianty.json, potem warianty-przygotuj --nr ${w.nr} --od-nowa`);
    }
    w.stan = 'przygotowany';
    wypisz(`PRZYGOTOWANY ${w.nr} ${folder}`);
    wypisz(`ZROB ${w.nr} ${zadanie(w, folder)}`);
  }
  zapiszJson(plan, dane);
  wypisz('INFO od chwili "do" kazdy wariant ma wygladac jak gotowa rolka: od tej klatki doklejam gotowy plik');
  wypisz('WYNIK OK');
}

// Odcisk tego, co wariant zmienia: wszystkie strony kompozycji i otwarcia. Dwa takie same = ten sam wariant.
function odciskKompozycji(folder) {
  const h = createHash('sha1');
  const otwarcie = path.join(folder, 'otwarcie');
  const strony = [...plikiHtml(folder), ...(fs.existsSync(otwarcie) ? plikiHtml(otwarcie) : [])];
  for (const strona of strony) h.update(path.relative(folder, strona).split(path.sep).join('/')).update(fs.readFileSync(strona));
  return h.digest('hex');
}

// Tempo 1 i kadr 1 razem: kursantka nie chce delikatnych roznic w tym wariancie. Pozostale warianty maja swoje, rozne.
function sprawdzRoznice(warianty) {
  const zRoznica = warianty.filter((w) => !(r3(Number(w.tempo)) === 1 && r3(Number(w.kadr)) === 1));
  const tempa = zRoznica.map((w) => r3(Number(w.tempo)));
  const kadry = zRoznica.map((w) => r3(Number(w.kadr)));
  if (tempa.some((t) => !(t >= 0.95 && t <= 1.05) || t === 1)) blad('tempo wariantu: od 0.95 do 1.05 i nie 1 (albo tempo 1 i kadr 1 razem, bez roznic)');
  if (kadry.some((k) => !(k > 1 && k <= 1.04))) blad('kadr wariantu: wiecej niz 1 i najwyzej 1.04 (zmien w warianty.json)');
  if (new Set(tempa).size < tempa.length) blad('dwa warianty maja to samo tempo - zmien jedno w warianty.json');
  if (new Set(kadry).size < kadry.length) blad('dwa warianty maja ten sam kadr - zmien jeden w warianty.json');
}

// Jedno renderowanie wariantow naraz: dwa naraz moga zajac cala pamiec komputera.
function zablokuj(robocze) {
  fs.mkdirSync(robocze, { recursive: true });
  const plik = path.join(robocze, 'trwa.json');
  const b = czytajJsonCicho(plik);
  if (b && b.pid && b.pid !== process.pid && Date.now() - Date.parse(b.od || 0) < 6 * 3600000) {
    let zyje = true;
    try {
      process.kill(b.pid, 0);
    } catch (e) {
      zyje = e.code === 'EPERM';
    }
    if (zyje) blad(`warianty juz sie renderuja (od ${b.od}) - poczekaj, az tamto renderowanie sie skonczy`);
  }
  fs.writeFileSync(plik, JSON.stringify({ pid: process.pid, od: new Date().toISOString() }));
  return plik;
}

function lintKompozycji(folder) {
  const r = hf(['lint', '--json', folder], { cwd: folder, timeout: 600000 });
  try {
    const j = JSON.parse(r.out.slice(r.out.indexOf('{')));
    const bledy = (j.findings || []).filter((f) => f.severity === 'error');
    return { bledy: Number(j.errorCount ?? bledy.length), opis: bledy.slice(0, 3).map((f) => `${f.code}: ${f.message}`.slice(0, 220)) };
  } catch {
    return { bledy: r.ok ? 0 : 1, opis: [(r.err || r.out).trim().split(/\r?\n/).slice(-2).join(' | ')] };
  }
}

function renderujKompozycje(folder, wyj, koniec) {
  fs.mkdirSync(path.dirname(wyj), { recursive: true });
  fs.rmSync(wyj, { force: true });
  const argumenty = ['render', folder, '-o', wyj, '--fps', String(FPS), '--quality', 'looks', '--quiet'];
  if (koniec) argumenty.push('--end', String(koniec));
  const r = hf(argumenty, { cwd: folder, timeout: 4 * 3600000 });
  if (r.ok && fs.existsSync(wyj)) return true;
  wypisz(`INFO ${(r.err || r.out).trim().split(/\r?\n/).slice(-3).join(' | ')}`);
  return false;
}

// PSNR (dB) klatka po klatce w pierwszych n klatkach dwoch filmow, w zmniejszeniu 540x960.
function psnrKlatek(a, b, n) {
  const ciecie = `trim=end_frame=${n},setpts=PTS-STARTPTS,scale=540:960,format=yuv420p`;
  const r = ff(['-t', String(r3((n + 2) / FPS)), '-i', a, '-t', String(r3((n + 2) / FPS)), '-i', b, '-filter_complex',
    `[0:v]${ciecie}[x];[1:v]${ciecie}[y];[x][y]psnr,metadata=print:key=lavfi.psnr.psnr_avg`, '-f', 'null', '-'], { timeout: 900000 });
  return [...r.err.matchAll(/lavfi\.psnr\.psnr_avg=(inf|[\d.]+)/g)].map((m) => (m[1] === 'inf' ? 99 : Number(m[1])));
}

// Wariant z czesci (otwarcie, poczatek wariantu, reszta gotowej rolki), potem jego kadr i tempo.
// czesci: [{ plik, od: pierwsza klatka, dl: liczba klatek }]
function zlozWariant(czesci, tempo, kadr, wyj) {
  const wejscia = [];
  const filtr = [];
  let n = 0;
  czesci.forEach((c, i) => {
    const iv = n++;
    const od = c.od / FPS;
    const dl = c.dl / FPS;
    wejscia.push('-i', c.plik);
    filtr.push(`[${iv}:v]trim=start_frame=${c.od}:end_frame=${c.od + c.dl},setpts=PTS-STARTPTS,scale=${W}:${H},setsar=1,fps=${FPS},format=yuv420p[v${i}]`);
    if (info(c.plik).dzwiek) {
      filtr.push(`[${iv}:a]atrim=start=${r3(od)}:end=${r3(od + dl)},asetpts=PTS-STARTPTS,aformat=sample_rates=48000:channel_layouts=stereo,apad,atrim=end=${r3(dl)}[a${i}]`);
    } else {
      const ia = n++;
      wejscia.push('-f', 'lavfi', '-t', String(r3(dl)), '-i', 'anullsrc=r=48000:cl=stereo');
      filtr.push(`[${ia}:a]asetpts=PTS-STARTPTS[a${i}]`);
    }
  });
  const zw = Math.round((W * kadr) / 2) * 2;
  const zh = Math.round((H * kadr) / 2) * 2;
  const x = Math.round(SRODEK_KADRU[0] * (zw / W - 1));
  const y = Math.round(SRODEK_KADRU[1] * (zh / H - 1));
  filtr.push(`${czesci.map((_, i) => `[v${i}][a${i}]`).join('')}concat=n=${czesci.length}:v=1:a=1[vc][ac]`);
  filtr.push(`[vc]scale=${zw}:${zh}:flags=lanczos,crop=${W}:${H}:${x}:${y},setsar=1,setpts=PTS/${tempo},fps=${FPS}[v]`);
  filtr.push(`[ac]atempo=${tempo}[a]`);
  const tymczasowy = `${wyj}.czesciowy.mp4`;
  const r = ff(['-y', ...wejscia, '-filter_complex', filtr.join(';'), '-map', '[v]', '-map', '[a]',
    '-c:v', 'libx264', '-preset', 'medium', '-crf', '17', '-pix_fmt', 'yuv420p', '-r', String(FPS),
    '-c:a', 'aac', '-b:a', '192k', '-ar', '48000', '-movflags', '+faststart', tymczasowy], { timeout: 4 * 3600000 });
  if (!r.ok || !fs.existsSync(tymczasowy)) {
    wypisz(`INFO ${r.err.trim().split(/\r?\n/).slice(-3).join(' | ')}`);
    fs.rmSync(tymczasowy, { force: true });
    return false;
  }
  try {
    fs.renameSync(tymczasowy, wyj);
  } catch {
    wypisz(`INFO nie moge zapisac ${path.basename(wyj)} - pewnie jest otwarty w odtwarzaczu; gotowy plik czeka jako ${path.basename(tymczasowy)}`);
    return false;
  }
  return true;
}

// Klatki gotowego wariantu w podanych chwilach (glownie z haka) z polami strefy bezpiecznej, 4 w rzedzie.
function arkuszWariantu(plik, folder, czasy) {
  const tmp = path.join(folder, 'arkusz');
  fs.rmSync(tmp, { recursive: true, force: true });
  fs.mkdirSync(tmp, { recursive: true });
  const strefy = STREFY.map(([x, y, w, h]) => `drawbox=x=${x}:y=${y}:w=${w}:h=${h}:color=red@0.3:t=fill`).join(',');
  czasy.forEach((t, i) => {
    ffWymagane(['-ss', String(r3(t)), '-i', plik, '-frames:v', '1', '-vf', `${strefy},scale=270:-2`, path.join(tmp, `k${String(i + 1).padStart(2, '0')}.png`)], 'klatka arkusza');
  });
  const arkusz = path.join(folder, 'arkusz.jpg');
  ffWymagane(['-framerate', '1', '-i', path.join(tmp, 'k%02d.png'), '-vf', `tile=4x${Math.ceil(czasy.length / 4)}:padding=6:color=white`, '-frames:v', '1', '-q:v', '3', arkusz], 'arkusz wariantu');
  return arkusz;
}

function wariantyRender(argumenty) {
  const nr = opcja(argumenty, '--nr', null);
  const odNowa = flaga(argumenty, '--od-nowa');
  const [projekt] = argumenty;
  const dane = czytajPlan(projekt);
  const { plan, robocze, gotowe } = sciezkiWariantow(projekt);
  sprawdzRoznice(dane.warianty);
  const rolka = path.resolve(projekt, dane.rolka);
  if (!fs.existsSync(rolka)) blad(`nie ma gotowej rolki ${dane.rolka}`);
  const kompozycja = path.resolve(projekt, dane.kompozycja);
  const klatkiRolki = liczKlatki(rolka);
  const lista = wybrane(dane, nr);
  const blokada = zablokuj(robocze);
  fs.mkdirSync(gotowe, { recursive: true });

  // Zaden wariant nie moze byc gotowa rolka ani innym wariantem.
  const widziane = new Map();
  if (fs.existsSync(path.join(kompozycja, 'index.html'))) widziane.set(odciskKompozycji(kompozycja), 'gotowa rolka');
  for (const w of dane.warianty) {
    const f = path.join(robocze, w.nazwa);
    if (!lista.includes(w) && fs.existsSync(path.join(f, 'index.html'))) widziane.set(odciskKompozycji(f), `wariant ${w.nr}`);
  }

  wypisz(`INFO kolejka: ${lista.length} wariant(y), jeden po drugim`);
  const bledy = [];
  let gotowych = 0;
  for (const w of lista) {
    const start = Date.now();
    const folder = path.join(robocze, w.nazwa);
    const wyj = path.join(gotowe, `${w.nazwa}.mp4`);
    const nieUdalo = (powod) => {
      bledy.push(w.nr);
      w.stan = 'blad';
      zapiszJson(plan, dane);
      wypisz(`STATUS wariant ${w.nr} BLAD ${powod}`);
    };
    if (w.stan === 'gotowy' && fs.existsSync(wyj) && !odNowa) {
      wypisz(`STATUS wariant ${w.nr} JUZ ${wyj}`);
      gotowych++;
      continue;
    }
    if (!fs.existsSync(path.join(folder, 'index.html'))) {
      nieUdalo('brak folderu wariantu - najpierw warianty-przygotuj');
      continue;
    }
    const otwarcie = path.join(folder, 'otwarcie');
    const maOtwarcie = fs.existsSync(path.join(otwarcie, 'index.html'));
    const koniec = w.do == null ? null : Number(w.do);
    if (koniec != null && !(koniec >= 0)) {
      nieUdalo('zle "do" w warianty.json');
      continue;
    }
    if (w.rodzaj === 'zdanie' && !maOtwarcie) {
      nieUdalo('brak otwarcia - zbuduj otwarcie/index.html');
      continue;
    }
    if (!maOtwarcie && koniec === 0) {
      nieUdalo('wariant nic nie zmienia ("do" = 0 i brak otwarcia)');
      continue;
    }
    const odcisk = odciskKompozycji(folder);
    if (widziane.has(odcisk)) {
      nieUdalo(`wyglada tak samo jak ${widziane.get(odcisk)} - zmien hak w folderze wariantu`);
      continue;
    }
    widziane.set(odcisk, `wariant ${w.nr}`);
    const zLintem = (maOtwarcie ? [otwarcie] : []).concat(koniec === 0 ? [] : [folder]);
    const zlyLint = zLintem.map((f) => [f, lintKompozycji(f)]).find(([, l]) => l.bledy);
    if (zlyLint) {
      zlyLint[1].opis.forEach((o) => wypisz(`INFO ${o}`));
      nieUdalo(`${zlyLint[1].bledy} blad(y) lint w ${path.relative(projekt, zlyLint[0])}`);
      continue;
    }

    const czesci = [];
    const rendery = path.join(folder, 'renders');
    if (maOtwarcie) {
      wypisz(`KROK wariant ${w.nr} otwarcie`);
      const p = path.join(rendery, 'otwarcie.mp4');
      if (!renderujKompozycje(otwarcie, p)) {
        nieUdalo('render otwarcia nie powiodl sie');
        continue;
      }
      czesci.push({ plik: p, od: 0, dl: liczKlatki(p) });
    }
    let calosc = koniec == null || koniec * FPS >= klatkiRolki - 1;
    if (!calosc && koniec > 0) {
      wypisz(`KROK wariant ${w.nr} poczatek 0-${koniec}s`);
      const p = path.join(rendery, 'poczatek.mp4');
      if (!renderujKompozycje(folder, p, koniec)) {
        nieUdalo('render poczatku nie powiodl sie');
        continue;
      }
      const n = liczKlatki(p);
      const psnr = psnrKlatek(p, rolka, n);
      if (psnr.length && Math.min(...psnr) >= PSNR_ZMIANA) {
        nieUdalo(`poczatek wyglada tak samo jak w gotowej rolce - zmiana nie jest widoczna w pierwszych ${koniec}s`);
        continue;
      }
      const szew = psnr.length === n ? psnr[n - 1] : null;
      if (szew == null || szew < PSNR_SZEW) {
        wypisz(`INFO w ${koniec}s wariant rozni sie od gotowej rolki (PSNR ${szew}) - renderuje caly wariant`);
        calosc = true;
      } else {
        czesci.push({ plik: p, od: 0, dl: n });
        czesci.push({ plik: rolka, od: n, dl: klatkiRolki - n });
      }
    } else if (!calosc) {
      czesci.push({ plik: rolka, od: 0, dl: klatkiRolki });
    }
    if (calosc) {
      wypisz(`KROK wariant ${w.nr} cala rolka`);
      const p = path.join(rendery, 'calosc.mp4');
      if (!renderujKompozycje(folder, p)) {
        nieUdalo('render nie powiodl sie');
        continue;
      }
      czesci.push({ plik: p, od: 0, dl: liczKlatki(p) });
    }

    wypisz(`KROK wariant ${w.nr} skladanie tempo=${w.tempo} kadr=${w.kadr}`);
    if (!zlozWariant(czesci, Number(w.tempo), Number(w.kadr), wyj)) {
      nieUdalo('skladanie nie powiodlo sie');
      continue;
    }
    const dlugosc = info(wyj).czas;
    const otw = maOtwarcie ? czesci[0].dl / FPS : 0;
    const zmiana = Math.max(1, (otw + (calosc ? Math.min(koniec ?? 4, 6) : koniec)) / Number(w.tempo));
    // Szesc klatek ze zmienionego poczatku, jedna tuz po doklejeniu reszty rolki i jedna ze srodka.
    const czasy = [0.03, 0.2, 0.4, 0.6, 0.8, 0.95].map((u) => zmiana * u).concat([zmiana + 0.4, dlugosc * 0.6])
      .map((t) => Math.min(Math.max(0, t), dlugosc - 0.1));
    const arkusz = arkuszWariantu(wyj, folder, czasy);
    const g = mierzGlosnosc(wyj);
    w.stan = 'gotowy';
    w.plik = path.relative(projekt, wyj);
    zapiszJson(plan, dane);
    gotowych++;
    wypisz(`STATUS wariant ${w.nr} GOTOWY ${wyj} czas=${r2(dlugosc)}s lufs=${g.lufs} w=${Math.round((Date.now() - start) / 1000)}s`);
    wypisz(`ARKUSZ ${w.nr} ${arkusz}`);
  }
  fs.rmSync(blokada, { force: true });
  if (bledy.length) {
    wypisz(`STATUS warianty NIEPELNE ${gotowych}/${lista.length} bledy=${bledy.join(',')}`);
    wypisz('WYNIK BLAD');
    process.exit(1);
  }
  wypisz(`STATUS warianty GOTOWE ${gotowych}/${lista.length} folder=${gotowe}`);
  wypisz('WYNIK OK');
}

function wariantyLista(argumenty) {
  const [projekt] = argumenty;
  const dane = czytajPlan(projekt);
  const { gotowe } = sciezkiWariantow(projekt);
  for (const w of dane.warianty) {
    const plik = path.join(gotowe, `${w.nazwa}.mp4`);
    wypisz(`PLIK ${w.nr} ${fs.existsSync(plik) ? `${w.nazwa}.mp4` : 'BRAK'} rodzaj=${w.rodzaj} tempo=${w.tempo} kadr=${w.kadr}`);
  }
  wypisz(`STATUS warianty folder=${gotowe}`);
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
  podlacz,
  'warianty-plan': wariantyPlan,
  'warianty-przygotuj': wariantyPrzygotuj,
  'warianty-render': wariantyRender,
  'warianty-lista': wariantyLista,
};
if (!polecenia[polecenie]) blad(`nieznane polecenie ${polecenie || ''} (uzyj: ${Object.keys(polecenia).join(', ')})`);
polecenia[polecenie](reszta);
