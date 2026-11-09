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
//   czysc-tlo <projekt> <nazwa> <od> <do> [--bez-obwiedni] [--bez-pokoju]
//        czyste wyciecie jednego okna rolki pod plotno -> assets/syl/<nazwa>.webm (bez plam tla; podaje data-start)
//   kontrola-wyciecia <projekt>
//        arkusz wszystkich okien z assets/syl na jednolitym tle -> work/kontrola-wyciecia.jpg
//   wytnij-dlon <projekt> <czas> <x,y,w,h> "<x1,y1 x2,y2 ...>"
//        dlon z klatki nagrania po obrysie, w pelni kryjaca -> assets/reka.png (do efektu Timeline z palcem)
//   glowa <projekt>
//        gdzie jest glowa i sylwetka w kazdym segmencie -> glowa.json (do napisow za glowa i kart pod broda)
//   siatka <projekt>
//        klatki z linia co 100 px -> work/siatka.jpg: stad odczytujesz czubek glowy i brode (przed zloz: z nagran)
//   strona-klatek <projekt> <folder kompozycji> <opis.json>
//        prawdziwe klatki z kompozycji i strona do oceny przed renderem -> work/klatki/klatki.html
//   strefa <obraz.png>...
//        rysuje na podgladach czerwone pola poza strefa bezpieczna Reels -> <obraz>-strefa.png
//   sprawdz-ciecia <projekt> <render.mp4> [--telefon]
//        klatka przed i po kazdym cieciu na jednym arkuszu + glosnosc + kopia na telefon (720p)
//   glosnosc <plik>
//        szczyt (dB) i glosnosc (LUFS)
//   wyrownaj-glos <render.mp4>
//        dwa przebiegi loudnorm do -14 LUFS, obraz bez zmian, ten sam plik
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
  if (argumenty.length > 3 || [od, doCzasu].some((v) => v !== undefined && !Number.isFinite(Number(v)))) blad('od i do podaj w sekundach, jako dwie osobne liczby');
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
    if (slowa.length < 3) wypisz(`INFO ${k} brak mowy w nagraniu (slow=${slowa.length}): zapytaj kursantke, czy to wlasciwy plik`);
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
      // Tylko szacunek (myli sie, gdy w kadrze sa rece albo wlosy): brode odczytaj z arkusza siatka i wpisz w pole broda.
      broda_okolo: szer ? Math.round(cala.y + Math.min(szer, 640 * Number(seg.zoom || 1)) * 1.1) : null,
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
    ffWymagane(['-i', render, '-vf', `select='${wybor}',scale=180:-2`, '-fps_mode', 'passthrough', path.join(folder, 'k%03d.png')], 'klatki ciec', { timeout: 1800000 });
    const arkusz = path.join(projekt, 'work', 'kontrola-ciec.jpg');
    ffWymagane(['-framerate', '1', '-i', path.join(folder, 'k%03d.png'), '-vf', `drawbox=x=0:y=0:w=10:h=ih:color=0xFFD23F:t=fill:enable='not(mod(n\\,2))',tile=10x${Math.ceil(ciecia.length / 5)}:padding=6:color=white`, '-frames:v', '1', '-q:v', '3', arkusz], 'arkusz ciec');
    wypisz('INFO pary czytaj wierszami: zolty pasek = ostatnia klatka przed cieciem, klatka po prawej = pierwsza po cieciu');
    wypisz(`STATUS ciecia ${ciecia.length} arkusz=${arkusz}`);
    ciecia.forEach((k, i) => wypisz(`CIECIE ${i + 1} czas=${r3(k / FPS)}s przed=${segmenty[i].id} po=${segmenty[i + 1].id}`));
  } else wypisz('STATUS ciecia 0');

  const g = mierzGlosnosc(render);
  wypisz(`STATUS glosnosc lufs=${g.lufs} szczyt=${g.szczyt}`);
  if (Number.isFinite(Number(g.lufs)) && (Number(g.lufs) < -16 || Number(g.lufs) > -12)) wypisz('INFO glosnosc poza celem -14 LUFS: uruchom wyrownaj-glos na tym pliku');

  if (telefon) {
    const wyj = render.replace(/(\.[^.]+)$/, '-telefon.mp4');
    ffWymagane(['-i', render, '-vf', 'scale=720:-2', '-c:v', 'libx264', '-preset', 'medium', '-crf', '27', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '128k', '-movflags', '+faststart', wyj], 'kopia na telefon', { timeout: 1800000 });
    wypisz(`STATUS telefon ${wyj} ${r2(fs.statSync(wyj).size / 1048576)}MB`);
  }
  wypisz('WYNIK OK');
}

// Kompozycja potrzebuje nagrania we wlasnym folderze assets. Twarde dowiazanie to ten sam plik pod druga nazwa:
// nie zajmuje miejsca drugi raz, a po ponownym "zloz" kompozycja od razu widzi nowa rolke.
// Render HyperFrames wychodzi zwykle okolo -25 LUFS: dwa przebiegi loudnorm do -14 LUFS, obraz bez zmian.
function wyrownajGlos(argumenty) {
  const [plik] = argumenty;
  if (!plik || !fs.existsSync(plik)) blad('uzycie: wyrownaj-glos <render.mp4>');
  const pomiar = ff(['-nostats', '-i', plik, '-af', 'loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json', '-f', 'null', '-'], { timeout: 1800000 });
  const json = (pomiar.err.match(/\{[\s\S]*\}/) || [])[0];
  if (!json) blad('pomiar glosnosci nie powiodl sie');
  const m = JSON.parse(json);
  const wyj = plik.replace(/(\.[^.]+)$/, '.glos$1');
  ffWymagane(['-i', plik, '-c:v', 'copy', '-af',
    `loudnorm=I=-14:TP=-1.5:LRA=11:measured_I=${m.input_i}:measured_TP=${m.input_tp}:measured_LRA=${m.input_lra}:measured_thresh=${m.input_thresh}:offset=${m.target_offset}:linear=true,aresample=48000`,
    '-c:a', 'aac', '-b:a', '256k', '-movflags', '+faststart', wyj], 'wyrownanie glosu', { timeout: 1800000 });
  fs.renameSync(wyj, plik);
  const g = mierzGlosnosc(plik);
  wypisz(`STATUS glosnosc lufs=${g.lufs} szczyt=${g.szczyt}`);
  wypisz('WYNIK OK');
}

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
  // Wyciecia okien z plotnem i dlon: tez bez drugiej kopii.
  const dodatki = [];
  const okna = path.join(projekt, 'assets', 'syl');
  if (fs.existsSync(okna)) for (const f of fs.readdirSync(okna)) if (f.endsWith('.webm')) dodatki.push([path.join(okna, f), path.join(cel, 'syl', f)]);
  const reka = path.join(projekt, 'assets', 'reka.png');
  if (fs.existsSync(reka)) dodatki.push([reka, path.join(cel, 'reka.png')]);
  // Czcionka odreczna: wbudowana w HyperFrames nie zawsze ma polskie litery.
  const caveat = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'fonts', 'caveat-600.woff2');
  if (fs.existsSync(caveat)) dodatki.push([caveat, path.join(cel, 'fonts', 'caveat-600.woff2')]);
  for (const [zrodlo, plik] of dodatki) {
    fs.mkdirSync(path.dirname(plik), { recursive: true });
    fs.rmSync(plik, { force: true });
    try { fs.linkSync(zrodlo, plik); } catch { fs.copyFileSync(zrodlo, plik); }
  }
  if (dodatki.length) wypisz(`STATUS podlacz dodatki ${dodatki.length}`);
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

// ---------- siatka (pomiar glowy i brody na klatkach) ----------

// Arkusz klatek z linia co 100 px (gruba co 500): stad odczytujesz czubek glowy i brode.
// Po zloz: srodek kazdego segmentu. Przed zloz: srodek kazdego segmentu z edl.json, a bez planu po 3 klatki z kazdego nagrania, caly kadr 9:16 (do wyliczenia cy).
function siatka(argumenty) {
  const [projekt] = argumenty;
  if (!projekt) blad('uzycie: siatka <projekt>');
  const folder = path.join(projekt, 'work', 'siatka');
  fs.rmSync(folder, { recursive: true, force: true });
  fs.mkdirSync(folder, { recursive: true });
  const kreski = `drawgrid=w=${W}:h=100:t=2:c=yellow@0.6,drawgrid=w=${W}:h=500:t=6:c=red@0.8,scale=270:-2`;
  const aroll = path.join(projekt, 'assets', 'aroll.mp4');
  const plikSegmentow = path.join(projekt, 'segmenty.json');
  const opis = [];
  let n = 0;
  if (fs.existsSync(aroll) && fs.existsSync(plikSegmentow)) {
    const { segmenty } = czytajJson(plikSegmentow, 'najpierw zloz');
    for (const s of segmenty) {
      n++;
      const t = r3((s.klatka_start + s.klatki / 2) / FPS);
      ffWymagane(['-ss', String(t), '-i', aroll, '-frames:v', '1', '-vf', kreski, path.join(folder, `k${String(n).padStart(3, '0')}.png`)], `klatka ${s.id}`);
      opis.push(`${n}=${s.id}(zoom ${s.zoom})`);
    }
  } else if (fs.existsSync(path.join(projekt, 'edl.json'))) {
    // Plan cięć jest, rolki jeszcze nie: srodek kazdego segmentu w pelnym kadrze, stad broda do policzenia cy.
    const zrodla = czytajJson(path.join(projekt, 'zrodla.json'), 'najpierw wczytaj');
    for (const e of czytajJson(path.join(projekt, 'edl.json'), '')) {
      if (!zrodla[e.klip]) continue;
      n++;
      const t = r3((Number(e.od) + Number(e.do)) / 2);
      ffWymagane(['-ss', String(t), '-i', zrodla[e.klip], '-frames:v', '1', '-vf', `${filtrKadru({})},${kreski}`, path.join(folder, `k${String(n).padStart(3, '0')}.png`)], `klatka ${e.id}`);
      opis.push(`${n}=${e.id}@${r2(t)}s(${e.klip})`);
    }
  } else {
    const zrodla = czytajJson(path.join(projekt, 'zrodla.json'), 'najpierw wczytaj');
    for (const [klip, plik] of Object.entries(zrodla)) {
      const czas = info(plik).czas;
      for (const u of [0.25, 0.5, 0.75]) {
        n++;
        ffWymagane(['-ss', String(r3(czas * u)), '-i', plik, '-frames:v', '1', '-vf', `${filtrKadru({})},${kreski}`, path.join(folder, `k${String(n).padStart(3, '0')}.png`)], `klatka ${klip}`);
        opis.push(`${n}=${klip}@${r2(czas * u)}s`);
      }
    }
  }
  if (!n) blad('brak klatek');
  const arkusz = path.join(projekt, 'work', 'siatka.jpg');
  ffWymagane(['-framerate', '1', '-i', path.join(folder, 'k%03d.png'), '-vf', `tile=${Math.min(n, 8)}x${Math.ceil(n / 8)}:padding=6:color=white`, '-frames:v', '1', '-q:v', '3', arkusz], 'arkusz siatki');
  wypisz(`STATUS siatka ${n} arkusz=${arkusz} linia_co=100px gruba_co=500px`);
  wypisz(`INFO kolejnosc ${opis.join(' ')}`);
  wypisz('WYNIK OK');
}

// ---------- czyste wyciecie okien z plotnem ----------

const ALFA_PROGI = "alphaextract,lut=c0='clip((val-90)*255/(215-90),0,255)'";
const OTWARCIE = `scale=270:480:flags=area,${'erosion,'.repeat(4)}${'dilation,'.repeat(8)}scale=${W}:${H}:flags=bilinear,lut=c0='if(gt(val,70),255,0)',gblur=sigma=2.5`;
const NA_BIALO = "lut=c0='if(gt(val,225),255,val)'";
const NA_CZARNO = "lut=c0='if(lt(val,24),0,val)'";

function kadrSegmentu(projekt, seg) {
  const edl = czytajJson(path.join(projekt, 'edl.json'), 'brak edl.json');
  const wpis = edl.find((e) => e.id === seg.id) || {};
  const z = Math.max(1, Number(seg.zoom || 1));
  return { klip: seg.klip, z, cx: z > 1 ? Number(wpis.cx ?? 0.5) : 0.5, cy: z > 1 ? Number(wpis.cy ?? 0.5) : 0.5 };
}

// Czysty obraz pokoju bez osoby dla danego kadru (pol rozdzielczosci). Kazdy piksel to mediana z tych klatek, w ktorych
// osoby tam nie ma: gdy wyciecie zawiedzie w pojedynczych klatkach, to nie psuje obrazu. Piksel widziany za rzadko albo
// niestabilny zostaje przezroczysty: tam czysc-tlo nic nie usuwa.
const PW = 540;
const PH = 960;

function surowaKlatka(argumenty, rozmiar) {
  const r = spawnSync(narzedzia().ffmpeg, ['-hide_banner', '-nostdin', '-v', 'error', ...argumenty, '-f', 'rawvideo', '-'], { env: srodowisko(), windowsHide: true, maxBuffer: 64 * 1024 * 1024 });
  if (r.status !== 0 || !r.stdout || r.stdout.length < rozmiar) return null;
  return r.stdout;
}

function czystyPokoj(projekt, kadr, segmenty) {
  const folder = path.join(projekt, 'work', 'pokoj');
  fs.mkdirSync(folder, { recursive: true });
  const klucz = `${kadr.klip}_z${kadr.z}_${kadr.cx}_${kadr.cy}`;
  const plik = path.join(folder, `${klucz}.png`);
  if (fs.existsSync(plik)) return plik;
  const szerokie = segmenty.filter((s) => s.klip === kadr.klip && Math.max(1, Number(s.zoom || 1)) === 1);
  const zSzerokich = szerokie.length > 0;
  const uzyte = zSzerokich
    ? szerokie
    : segmenty.filter((s) => { const k = kadrSegmentu(projekt, s); return s.klip === kadr.klip && k.z === kadr.z && k.cx === kadr.cx && k.cy === kadr.cy; });
  if (!uzyte.length) return null;
  const baza = path.join(folder, `${zSzerokich ? kadr.klip : klucz}_baza.png`);
  if (!fs.existsSync(baza)) {
    const klatki = uzyte.flatMap((s) => Array.from({ length: s.klatki }, (_, i) => s.klatka_start + i));
    const ile = Math.min(40, klatki.length);
    wypisz(`KROK pokoj start ${ile} klatek`);
    const aroll = path.join(projekt, 'assets', 'aroll.mp4');
    const sylwetka = path.join(projekt, 'assets', 'sylwetka.webm');
    const obrazy = [];
    const maski = [];
    for (let i = 0; i < ile; i++) {
      const t = String(r3((klatki[Math.floor((i * klatki.length) / ile)] + 0.5) / FPS));
      const obraz = surowaKlatka(['-ss', t, '-i', aroll, '-frames:v', '1', '-vf', `scale=${PW}:${PH}:flags=area,format=rgb24`], PW * PH * 3);
      const maska = surowaKlatka(['-c:v', 'libvpx-vp9', '-ss', t, '-i', sylwetka, '-frames:v', '1', '-vf',
        `format=yuva420p,alphaextract,lut=c0='if(gt(val,25),255,0)',scale=270:480:flags=area,lut=c0='if(gt(val,8),255,0)',${'dilation,'.repeat(6)}scale=${PW}:${PH}:flags=bilinear,format=gray`], PW * PH);
      if (obraz && maska) { obrazy.push(obraz); maski.push(maska); }
    }
    if (obrazy.length < 5) return null;
    const minWidzianych = Math.max(4, Math.round(obrazy.length * 0.2));
    const wynik = Buffer.alloc(PW * PH * 4);
    const jasnosci = new Int16Array(obrazy.length);
    const numery = new Int16Array(obrazy.length);
    for (let p = 0; p < PW * PH; p++) {
      let n = 0;
      for (let k = 0; k < obrazy.length; k++) {
        if (maski[k][p] > 5) continue;
        const o = obrazy[k];
        const j = o[p * 3] + o[p * 3 + 1] + o[p * 3 + 2];
        // sortowanie przez wstawianie: malo elementow
        let m = n++;
        while (m > 0 && jasnosci[m - 1] > j) { jasnosci[m] = jasnosci[m - 1]; numery[m] = numery[m - 1]; m--; }
        jasnosci[m] = j;
        numery[m] = k;
      }
      if (n < minWidzianych) continue;
      const rozrzut = (jasnosci[Math.floor(n * 0.75)] - jasnosci[Math.floor(n * 0.25)]) / 3;
      if (rozrzut > 22) continue;
      const o = obrazy[numery[n >> 1]];
      wynik[p * 4] = o[p * 3];
      wynik[p * 4 + 1] = o[p * 3 + 1];
      wynik[p * 4 + 2] = o[p * 3 + 2];
      wynik[p * 4 + 3] = 255;
    }
    const zapis = spawnSync(narzedzia().ffmpeg, ['-hide_banner', '-nostdin', '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', `${PW}x${PH}`, '-i', '-', '-frames:v', '1', '-c:v', 'png', baza], { input: wynik, env: srodowisko(), windowsHide: true, maxBuffer: 16 * 1024 * 1024 });
    if (zapis.status !== 0) blad('zapis czystego pokoju nie powiodl sie');
  }
  if (zSzerokich && kadr.z > 1) {
    const { z, cx, cy } = kadr;
    ffWymagane(['-i', baza, '-vf', `format=rgba,crop=w=iw/${z}:h=ih/${z}:x='min(max(${cx}*iw-ow/2,0),iw-ow)':y='min(max(${cy}*ih-oh/2,0),ih-oh)',scale=${PW}:${PH}:flags=bilinear,format=rgba`, '-frames:v', '1', '-c:v', 'png', plik], 'kadr pokoju');
  } else {
    fs.copyFileSync(baza, plik);
  }
  return plik;
}

// Krawedz osoby z tej samej klatki. Model dolicza do osoby pas sciany przy wlosach i poduszke przy ramionach, a tnac po
// masce w niskiej rozdzielczosci robi sie wycinanka. Dlatego tlo tuz za osoba szacujemy z pikseli, ktorych model na pewno
// nie objal, i przy brzegu zostaje tylko to, co sie od tego tla rozni: wlosy zachowuja ksztalt, sciana odpada, a zmiana
// ekspozycji nic nie psuje. Liczone w polowie rozdzielczosci i wygladzone, bo inaczej maska lapie bloki kompresji i brzeg ma
// schodki. Srodek osoby (rdzen) jest chroniony. Ponizej brody liczymy zgrubnie, zeby faktura poduszki nie udawala osoby. Wejscia: [fr] klatka, [am] alfa modelu. Wyjscie: [kr].
const SUMA_KANALOW = 'colorchannelmixer=rr=.5:rg=.5:rb=.5:gr=.5:gg=.5:gb=.5:br=.5:bg=.5:bb=.5';

function filtrKrawedzi(yBrody) {
  return [
    '[am]split=3[am1][am2][am3]',
    "[am1]scale=270:480:flags=area,lut=c0='if(gt(val,12),255,0)',dilation,dilation,dilation,lut=c0='255-val',format=gray,split[tm1][tm2]",
    '[fr]scale=270:480:flags=area,format=gbrp,split=3[fs1][fs2][fs3]',
    '[tm1]format=gbrp[tm3]',
    "[fs1][tm3]blend=all_expr='A*B/255',gblur=sigma=6[tla]",
    '[tm2]format=gbrp,gblur=sigma=6[tlb]',
    "[tla][tlb]blend=all_expr='if(gt(B,1),min(255,A*255/B),128)',split[tl1][tl2]",
    `[tl1]scale=${PW}:${PH}:flags=bicubic[tlo]`,
    '[kol]format=gbrp,split[ff][fk]',
    `[ff]scale=${PW}:${PH}:flags=area[fh];[fh][tlo]blend=all_mode=difference,format=rgb24,${SUMA_KANALOW},format=gray,gblur=sigma=2,split[d1][d2]`,
    `[d1]lut=c0='clip((val-16)*6,0,255)',dilation,dilation,erosion,erosion,scale=${W}:${H}:flags=bicubic,format=gray,gblur=sigma=6,lut=c0='clip((val-110)*4,0,255)'[drobna]`,
    `[fs2][tl2]blend=all_mode=difference,format=rgb24,${SUMA_KANALOW},format=gray,gblur=sigma=.8,lut=c0='clip((val-16)*7,0,255)',scale=${W}:${H}:flags=bilinear,format=gray,gblur=sigma=3,drawbox=x=0:y=0:w=${W}:h=${yBrody}:color=white:t=fill,${NA_BIALO}[zgrubna]`,
    '[drobna][zgrubna]blend=all_mode=darken[mat]',
    `[am2]scale=270:480:flags=area,lut=c0='if(gt(val,230),255,0)',${'erosion,'.repeat(7)}format=gray,split=3[rl1][rl2][rl3]`,
    `[rl1]scale=${W}:${H}:flags=bilinear,format=gray,gblur=sigma=7,lut=c0='clip((val-110)*4,0,255)',split[rdzen][rn]`,
    "[am3]lut=c0='clip(val*3,0,255)',gblur=sigma=1.5[dop]",
    '[mat][dop]blend=all_mode=darken[brzeg]',
    '[brzeg][rdzen]blend=all_mode=lighten[kr]',
    // Kolor brzegu: co przypomina tlo, dostaje kolor rozlany ze srodka osoby, wiec na plotnie nie ma szarej poswiaty.
    "[rl2]format=gbrp[rc];[fs3][rc]blend=all_expr='A*B/255',gblur=sigma=9[oa];[rl3]format=gbrp,gblur=sigma=9[ob]",
    `[oa][ob]blend=all_expr='if(gt(B,1),min(255,A*255/B),128)',scale=${W}:${H}:flags=bicubic[oso]`,
    `[d2]scale=${W}:${H}:flags=bicubic,format=gray,lut=c0='255-clip((val-25)*2.6,0,255)'[w0];[rn]lut=c0='255-val'[rni];[w0][rni]blend=all_mode=darken,format=gbrp[w]`,
    '[fk][oso][w]maskedmerge,format=yuv420p[kol2]',
  ].join(';');
}

// Czysty pokoj usuwa tylko duze kawalki (poduszka zlapana przez model): to, co sie z nim zgadza na malej powierzchni,
// to zwykle pasmo wlosow w kolorze sciany, wiec zostaje. Nieznane miejsca zostaja. Ponizej Y 1200 nic nie ruszamy.
function filtrPokoju() {
  return [
    '[frp]scale=270:480:flags=area,format=rgb24[frl]',
    '[2:v]format=rgba,split[pr0][pa]',
    `[pr0]format=rgb24,scale=270:480:flags=area[prgb];[frl][prgb]blend=all_mode=difference,${SUMA_KANALOW},format=gray,lut=c0='if(gt(val,14),255,0)'[d]`,
    "[pa]alphaextract,scale=270:480:flags=area,lut=c0='if(gt(val,250),0,255)',format=gray[u]",
    `[d][u]blend=all_mode=lighten:shortest=1,dilation,dilation,dilation,erosion,erosion,erosion,dilation,dilation,dilation,scale=${W}:${H}:flags=bilinear,format=gray,lut=c0='clip((val-60)*3,0,255)',gblur=sigma=3,drawbox=x=0:y=1200:w=${W}:h=${H - 1200}:color=white:t=fill,${NA_BIALO}[allow]`,
  ].join(';');
}

// Wycina jedno okno rolki pod plotno: assets/syl/<nazwa>.webm (klatka 0 pliku = pierwsza klatka okna).
function czyscTlo(argumenty) {
  const bezObwiedni = flaga(argumenty, '--bez-obwiedni');
  const bezPokoju = flaga(argumenty, '--bez-pokoju');
  const [projekt, nazwa, odTxt, doTxt] = argumenty;
  if (!projekt || !nazwa || !odTxt || !doTxt) blad('uzycie: czysc-tlo <projekt> <nazwa> <od> <do> [--bez-obwiedni] [--bez-pokoju]');
  const sylwetka = path.join(projekt, 'assets', 'sylwetka.webm');
  const aroll = path.join(projekt, 'assets', 'aroll.mp4');
  if (!fs.existsSync(sylwetka) || !fs.existsSync(aroll)) blad('brak assets/sylwetka.webm albo aroll.mp4 - najpierw zloz i wytnij-tlo');
  const { segmenty } = czytajJson(path.join(projekt, 'segmenty.json'), 'najpierw zloz');
  const k0 = Math.ceil(Number(odTxt) * FPS - 0.2);
  const k1 = Math.round(Number(doTxt) * FPS);
  if (!(k1 > k0)) blad('zly zakres czasu');
  const wOknie = segmenty.filter((s) => s.klatka_start < k1 && s.klatka_start + s.klatki > k0);
  const kadr = kadrSegmentu(projekt, wOknie[0]);
  if (wOknie.some((s) => { const k = kadrSegmentu(projekt, s); return k.klip !== kadr.klip || k.z !== kadr.z || k.cx !== kadr.cx || k.cy !== kadr.cy; })) {
    blad(`okno obejmuje kilka roznych kadrow (${wOknie.map((s) => s.id).join(', ')}): podziel je na osobne okna`);
  }
  let glowy = {};
  const plikGlow = path.join(projekt, 'glowa.json');
  if (fs.existsSync(plikGlow)) for (const g of czytajJson(plikGlow, '')) glowy[g.id] = g;
  const pokoj = bezPokoju ? null : czystyPokoj(projekt, kadr, segmenty);
  const gory = wOknie.map((s) => (glowy[s.id] || {}).glowa_gora).filter((v) => Number.isFinite(v));
  const ciecie = gory.length ? Math.max(0, Math.min(...gory) - 150) : 0;
  const brody = wOknie.map((s) => (glowy[s.id] || {}).broda).filter((v) => Number.isFinite(v));
  const yBrody = Math.round(Math.max(900, Math.min(1300, brody.length ? Math.max(...brody) : 1050)));
  const gora = ciecie > 0 ? `,drawbox=x=0:y=0:w=${W}:h=${ciecie}:color=black:t=fill,${NA_CZARNO}` : '';
  const baza = `${ALFA_PROGI}${gora}`;
  const przeskok = String(r3((k0 - 0.25) / FPS));
  const trim = `trim=end_frame=${k1 - k0},setpts=PTS-STARTPTS`;
  const wejscia = ['-c:v', 'libvpx-vp9', '-ss', przeskok, '-i', sylwetka, '-ss', przeskok, '-i', aroll];
  if (pokoj) wejscia.push('-loop', '1', '-framerate', String(FPS), '-i', pokoj);
  const folder = path.join(projekt, 'work', 'pokoj');
  fs.mkdirSync(folder, { recursive: true });
  fs.mkdirSync(path.join(projekt, 'assets', 'syl'), { recursive: true });
  let wejsciaKoniec = [...wejscia];
  let obwiednia = '[a3]null[a4];';
  let podzial = pokoj ? 'split=3[fr][frp][kol]' : 'split[fr][kol]';
  if (!bezObwiedni && k1 - k0 >= 20) {
    // Typowy ksztalt osoby z calego okna: to, co pojawia sie w mniej niz 10% klatek (migajace platy tla), odpada.
    const env = path.join(folder, `obwiednia_${nazwa}.png`);
    const m = Math.min(128, Math.floor((k1 - k0) / 2));
    ffWymagane(['-c:v', 'libvpx-vp9', '-ss', przeskok, '-i', sylwetka, '-filter_complex',
      `[0:v]${trim},format=yuva420p,${baza},split[a1][a2];[a2]${OTWARCIE}[m];[a1][m]blend=all_mode=darken,select='not(mod(n\\,2))',setpts=N/15/TB,tmix=frames=${m},trim=start_frame=${m - 1},scale=270:480:flags=area,lut=c0='if(gt(val,25),255,0)',${'dilation,'.repeat(3)}scale=${W}:${H}:flags=bilinear,lut=c0='clip((val-40)*3,0,255)',gblur=sigma=3,drawbox=x=0:y=1300:w=${W}:h=${H - 1300}:color=white:t=fill,${NA_BIALO},format=gray[o]`,
      '-map', '[o]', '-frames:v', '1', '-c:v', 'png', env], 'typowy ksztalt');
    // Dlon moze wyjsc poza typowy ksztalt przy bokach kadru: skora (kolor z twarzy) zostaje tam zawsze.
    const srodek = k0 + Math.floor((k1 - k0) / 2);
    const g = glowy[wOknie[0].id] || {};
    const yTwarzy = Math.round(Math.min(H - 80, (g.glowa_gora ?? 600) + 220));
    const skora = (() => {
      const r2d = spawnSync(narzedzia().ffmpeg, ['-hide_banner', '-nostdin', '-v', 'error', '-ss', String(r3(srodek / FPS)), '-i', aroll, '-frames:v', '1', '-vf', `crop=60:60:510:${yTwarzy},scale=1:1:flags=area,format=rgb24`, '-f', 'rawvideo', '-'], { env: srodowisko(), windowsHide: true });
      const b = r2d.stdout;
      return b && b.length >= 3 ? `0x${[b[0], b[1], b[2]].map((v) => v.toString(16).padStart(2, '0')).join('')}` : '0xD9A58C';
    })();
    wejsciaKoniec = [...wejscia, '-loop', '1', '-framerate', String(FPS), '-i', env];
    const nr = pokoj ? 3 : 2;
    podzial = pokoj ? 'split=4[fr][frp][kol][rgbs]' : 'split=3[fr][kol][rgbs]';
    obwiednia = `[${nr}:v]format=gray[env0];[rgbs]format=rgba,colorkey=${skora}:0.17:0.05,alphaextract,lut=c0='255-val',lut=c0='if(gt(val,120),255,0)',dilation,dilation,dilation,erosion,erosion,erosion,drawbox=x=180:y=0:w=720:h=${H}:color=black:t=fill,${NA_CZARNO},format=gray[sk];[env0][sk]blend=all_mode=lighten:shortest=1[env];[a3][env]blend=all_mode=darken:shortest=1[a4];`;
  }
  const wynik = path.join(projekt, 'assets', 'syl', `${nazwa}.webm`);
  const krokPokoju = pokoj ? `${filtrPokoju()};[kr][allow]blend=all_mode=darken:shortest=1[k1];` : '[kr]null[k1];';
  ffWymagane([...wejsciaKoniec, '-filter_complex',
    `[0:v]${trim},format=yuva420p,alphaextract,format=gray${gora},split[am][ao];[1:v]${trim},format=yuv420p,${podzial};${filtrKrawedzi(yBrody)};${krokPokoju}[ao]lut=c0='clip((val-90)*255/(215-90),0,255)',${OTWARCIE}[m];[k1][m]blend=all_mode=darken[a3];${obwiednia}[a4]gblur=sigma=.6[a];[kol2][a]alphamerge,format=yuva420p[out]`,
    '-map', '[out]', '-frames:v', String(k1 - k0), '-c:v', 'libvpx-vp9', '-pix_fmt', 'yuva420p', '-crf', '20', '-b:v', '0', '-deadline', 'good', '-cpu-used', '4', '-row-mt', '1', '-threads', '8', '-auto-alt-ref', '0', '-r', String(FPS), wynik],
    `wyciecie ${nazwa}`, { timeout: 1800000 });
  const ile = liczKlatki(wynik, 'libvpx-vp9');
  wypisz(`STATUS czysc-tlo ${nazwa} klatek=${ile} oczekiwane=${k1 - k0} data-start=${r3(k0 / FPS - 0.002)} data-media-start=0 src=assets/syl/${nazwa}.webm`);
  wypisz(ile === k1 - k0 ? 'WYNIK OK' : 'WYNIK BLAD');
  if (ile !== k1 - k0) process.exit(1);
}

// Arkusz do oceny wyciecia: kazde okno na jednolitym fiolecie, 6 klatek na sekunde.
function kontrolaWyciecia(argumenty) {
  const [projekt] = argumenty;
  const folder = path.join(projekt || '', 'assets', 'syl');
  if (!projekt || !fs.existsSync(folder)) blad('brak assets/syl - najpierw czysc-tlo');
  const pliki = fs.readdirSync(folder).filter((f) => f.endsWith('.webm')).sort();
  if (!pliki.length) blad('brak okien w assets/syl');
  const wyj = path.join(projekt, 'work', 'wyciecie');
  fs.rmSync(wyj, { recursive: true, force: true });
  fs.mkdirSync(wyj, { recursive: true });
  const rzedy = [];
  for (const f of pliki) {
    const n = liczKlatki(path.join(folder, f), 'libvpx-vp9');
    const kolumny = 24;
    const wiersze = Math.max(1, Math.ceil(Math.ceil(n / 5) / kolumny));
    const cel = path.join(wyj, `${f}.jpg`);
    ffWymagane(['-f', 'lavfi', '-i', `color=c=0x7C5CF0:s=${W}x${H}:r=${FPS}`, '-c:v', 'libvpx-vp9', '-i', path.join(folder, f), '-filter_complex',
      `[0][1]overlay=shortest=1,select='not(mod(n\\,5))',scale=100:-2,tile=${kolumny}x${wiersze}:color=0x222222:padding=2`, '-frames:v', '1', '-q:v', '3', cel], `arkusz ${f}`);
    rzedy.push(cel);
    wypisz(`INFO rzad ${rzedy.length}=${f}`);
  }
  const arkusz = path.join(projekt, 'work', 'kontrola-wyciecia.jpg');
  const w = rzedy.flatMap((r) => ['-i', r]);
  const ek = rzedy.length > 1 ? ['-filter_complex', `${rzedy.map((_, i) => `[${i}]`).join('')}vstack=${rzedy.length}`] : [];
  ffWymagane([...w, ...ek, '-frames:v', '1', '-q:v', '3', arkusz], 'arkusz wyciecia');
  // Drugi arkusz: duze kadry, bo na malych nie widac otoczki przy wlosach ani paska poduszki przy ramieniu.
  const duze = [];
  for (const f of pliki) {
    const n = liczKlatki(path.join(folder, f), 'libvpx-vp9');
    const wybor = Array.from({ length: 6 }, (_, i) => `eq(n\\,${Math.floor(((i + 0.5) * n) / 6)})`).join('+');
    const cel = path.join(wyj, `${f}-duze.jpg`);
    ffWymagane(['-f', 'lavfi', '-i', `color=c=0x7C5CF0:s=${W}x${H}:r=${FPS}`, '-c:v', 'libvpx-vp9', '-i', path.join(folder, f), '-filter_complex',
      `[0][1]overlay=shortest=1,select='${wybor}',crop=${W}:1000:0:250,scale=320:-2,tile=6x1:color=0x222222:padding=2`, '-fps_mode', 'vfr', '-frames:v', '1', '-q:v', '2', cel], `duzy arkusz ${f}`);
    duze.push(cel);
  }
  const arkuszDuzy = path.join(projekt, 'work', 'kontrola-wlosy.jpg');
  const wd = duze.flatMap((r) => ['-i', r]);
  const ekd = duze.length > 1 ? ['-filter_complex', `${duze.map((_, i) => `[${i}]`).join('')}vstack=${duze.length}`] : [];
  ffWymagane([...wd, ...ekd, '-frames:v', '1', '-q:v', '2', arkuszDuzy], 'duzy arkusz');
  wypisz(`STATUS kontrola-wyciecia ${arkusz} ${arkuszDuzy} (obejrzyj oba: plamy tla i migotanie na malym; otoczka przy wlosach, pasek przy ramieniu, dziury w osobie, ucieta dlon na duzym)`);
  wypisz('WYNIK OK');
}

// ---------- dlon z palcem do timeline'u ----------

// Wycina dlon z klatki nagrania po obrysie. W pelni kryjaca, bez rozmyc: ma wchodzic z boku kadru, nadgarstek poza kadrem.
function wytnijDlon(argumenty) {
  const [projekt, czas, ramka, obrys] = argumenty;
  if (!projekt || !czas || !ramka || !obrys) blad('uzycie: wytnij-dlon <projekt> <czas> <x,y,w,h> "<x1,y1 x2,y2 ...>" (obrys w ukladzie ramki)');
  const [x, y, w, h] = ramka.split(',').map(Number);
  const punkty = obrys.trim().split(/\s+/).map((p) => p.split(',').map(Number));
  if (punkty.length < 3 || ![x, y, w, h].every(Number.isFinite)) blad('zla ramka albo obrys');
  const folder = path.join(projekt, 'work', 'dlon');
  fs.mkdirSync(folder, { recursive: true });
  const dane = Buffer.alloc(w * h);
  for (let py = 0; py < h; py++) {
    const xs = [];
    for (let i = 0; i < punkty.length; i++) {
      const [x1, y1] = punkty[i];
      const [x2, y2] = punkty[(i + 1) % punkty.length];
      if ((y1 <= py && py < y2) || (y2 <= py && py < y1)) xs.push(x1 + ((py - y1) * (x2 - x1)) / (y2 - y1));
    }
    xs.sort((a, b) => a - b);
    for (let i = 0; i + 1 < xs.length; i += 2) {
      for (let px = Math.max(0, Math.floor(xs[i])); px <= Math.min(w - 1, Math.ceil(xs[i + 1])); px++) dane[py * w + px] = 255;
    }
  }
  const pgm = path.join(folder, 'obrys.pgm');
  fs.writeFileSync(pgm, Buffer.concat([Buffer.from(`P5\n${w} ${h}\n255\n`), dane]));
  fs.mkdirSync(path.join(projekt, 'assets'), { recursive: true });
  const wyj = path.join(projekt, 'assets', 'reka.png');
  ffWymagane(['-ss', String(czas), '-i', path.join(projekt, 'assets', 'aroll.mp4'), '-i', pgm, '-frames:v', '1', '-filter_complex',
    `[0:v]crop=${w}:${h}:${x}:${y},format=rgba[rgb];[1:v]format=gray,gblur=sigma=2.4,lut=c0='clip((val-110)*5,0,255)',gblur=sigma=0.7[a];[rgb][a]alphamerge,format=rgba[o]`,
    '-map', '[o]', '-c:v', 'png', wyj], 'wyciecie dloni');
  const podglad = path.join(projekt, 'work', 'dlon-podglad.jpg');
  ffWymagane(['-f', 'lavfi', '-i', `color=c=0x1E1E24:s=${w}x${h}`, '-i', wyj, '-filter_complex', '[0][1]overlay=shortest=1', '-frames:v', '1', '-q:v', '3', podglad], 'podglad dloni');
  wypisz(`STATUS dlon ${wyj} podglad=${podglad}`);
  wypisz('WYNIK OK');
}

// ---------- strona z klatkami do oceny przed renderem ----------

const esc = (t) => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const czasEtykieta = (t) => {
  const v = Number(t);
  const m = Math.floor(v / 60);
  return `${m}:${(v - m * 60).toFixed(1).padStart(4, '0')}`;
};

// opis.json: { "tytul": "...", "momenty": [ { "czas": "0:00", "tytul": "...", "opis": "...", "klatki": [0.3, 1.2] } ], "pytania": ["..."] }
function stronaKlatek(argumenty) {
  const [projekt, kompozycja, opisPlik] = argumenty;
  if (!projekt || !kompozycja || !opisPlik) blad('uzycie: strona-klatek <projekt> <folder kompozycji> <opis.json>');
  const opis = czytajJson(opisPlik, 'brak opisu');
  const czasy = [...new Set(opis.momenty.flatMap((m) => m.klatki.map(String)))];
  const folder = path.join(projekt, 'work', 'klatki');
  const surowe = path.join(folder, 'surowe');
  fs.rmSync(folder, { recursive: true, force: true });
  fs.mkdirSync(path.join(folder, 'kl'), { recursive: true });
  const r = hf(['snapshot', '--no-end', '--at', czasy.join(','), '-o', path.resolve(surowe)], { cwd: kompozycja, timeout: 1800000 });
  if (!r.ok) {
    wypisz(`INFO ${(r.err || r.out).trim().split(/\r?\n/).slice(-2).join(' | ')}`);
    blad('podglad klatek nie powiodl sie');
  }
  for (const plik of fs.readdirSync(surowe).filter((f) => /^frame-.*-at-.*s\.png$/.test(f))) {
    const t = plik.replace(/^frame-.*-at-/, '').replace(/s\.png$/, '');
    ffWymagane(['-i', path.join(surowe, plik), '-vf', 'scale=540:-2', '-q:v', '3', path.join(folder, 'kl', `t_${t}.jpg`)], `klatka ${t}`);
  }
  fs.rmSync(surowe, { recursive: true, force: true });
  const sekcje = opis.momenty.map((m) => `<section class="mom"><div class="op"><p class="tc">${esc(m.czas)}</p><h2>${esc(m.tytul)}</h2><p>${esc(m.opis)}</p></div><div class="kls">${m.klatki.map((t) => `<button class="kl" type="button" data-src="kl/t_${t}.jpg" data-opis="${esc(czasEtykieta(t))} · ${esc(m.tytul)}" aria-label="Powiększ klatkę ${esc(czasEtykieta(t))}"><img src="kl/t_${t}.jpg" alt="Klatka z ${esc(czasEtykieta(t))}" width="540" height="960"><span>${esc(czasEtykieta(t))}</span></button>`).join('')}</div></section>`).join('\n');
  const pytania = (opis.pytania || []).length ? `<section class="dec"><h2>Do Twojej decyzji</h2><ol>${opis.pytania.map((p) => `<li>${esc(p)}</li>`).join('')}</ol></section>` : '';
  const html = `<title>${esc(opis.tytul || 'Klatki rolki')}</title>
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="claude:viewport-fit-sides" content="cover">
<meta charset="utf-8">
<style>
:root { --tlo: #F4F3F8; --tekst: #1D1B2A; --cichy: #5E5B70; --linia: #DEDBE9; --akcent: #5A3BE0; }
@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) { --tlo: #14131B; --tekst: #EFEDF7; --cichy: #A9A5BB; --linia: #33303F; --akcent: #AE9BFF; color-scheme: dark; } }
:root[data-theme="dark"] { --tlo: #14131B; --tekst: #EFEDF7; --cichy: #A9A5BB; --linia: #33303F; --akcent: #AE9BFF; color-scheme: dark; }
body { margin: 0; background: var(--tlo); color: var(--tekst); font: 500 16px/1.5 system-ui, -apple-system, "Segoe UI", sans-serif; }
.w { max-width: 1240px; margin: 0 auto; padding-left: max(16px, env(safe-area-inset-left, 0px)); padding-right: max(16px, env(safe-area-inset-right, 0px)); padding-block: 32px 56px; display: grid; gap: 32px; }
h1 { margin: 0; font-size: clamp(28px, 4vw, 40px); line-height: 1.1; text-wrap: balance; }
header p { margin: 8px 0 0; max-width: 70ch; }
h2 { margin: 0 0 6px; font-size: 20px; line-height: 1.2; text-wrap: balance; }
.mom { display: grid; grid-template-columns: minmax(0, 320px) minmax(0, 1fr); gap: 24px; padding-top: 22px; border-top: 1px solid var(--linia); align-items: start; }
.op { min-width: 0; } .op p { margin: 0; }
.tc { font-weight: 700; font-size: 15px; color: var(--akcent); font-variant-numeric: tabular-nums; margin-bottom: 4px !important; }
.kls { display: grid; grid-template-columns: repeat(auto-fill, minmax(168px, 1fr)); gap: 12px; min-width: 0; }
.kl { display: grid; gap: 6px; padding: 0; border: 0; background: none; color: inherit; font: inherit; cursor: zoom-in; text-align: left; }
.kl img { display: block; width: 100%; height: auto; aspect-ratio: 9 / 16; object-fit: cover; border-radius: 12px; background: var(--linia); }
.kl span { font-size: 13px; color: var(--cichy); font-variant-numeric: tabular-nums; }
.kl:focus-visible { outline: 3px solid var(--akcent); outline-offset: 3px; border-radius: 14px; }
.dec { padding-top: 22px; border-top: 1px solid var(--linia); max-width: 74ch; } .dec ol { margin: 8px 0 0; padding-left: 22px; display: grid; gap: 8px; }
dialog { border: 0; padding: 0; background: transparent; max-width: 100vw; max-height: 100vh; }
dialog::backdrop { background: rgba(10, 8, 20, .88); }
#duza { display: block; max-height: 88vh; max-width: 92vw; width: auto; height: auto; border-radius: 14px; }
#opis { color: #fff; font-weight: 700; padding: 8px 2px; text-align: center; }
@media (max-width: 820px) { .mom { grid-template-columns: minmax(0, 1fr); } .kls { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
</style>
<div class="w">
<header><h1>${esc(opis.tytul || 'Klatki rolki')}</h1><p>To prawdziwe klatki z montażu, jeszcze bez renderu. Kliknięcie powiększa klatkę. Napisz w rozmowie sekundę i co zmienić. Render zrobię dopiero po Twoim OK. Ruch i tempo ocenisz na gotowym filmie.</p></header>
${sekcje}
${pytania}
</div>
<dialog id="dlg" aria-label="Powiększona klatka"><img id="duza" alt=""><p id="opis"></p></dialog>
<script>
const dlg = document.getElementById("dlg"), duza = document.getElementById("duza"), podpis = document.getElementById("opis");
document.querySelectorAll(".kl").forEach((b) => b.addEventListener("click", () => { duza.src = b.dataset.src; duza.alt = b.dataset.opis; podpis.textContent = b.dataset.opis; dlg.showModal(); }));
dlg.addEventListener("click", () => dlg.close());
</script>
`;
  const strona = path.join(folder, 'klatki.html');
  fs.writeFileSync(strona, html);
  wypisz(`STATUS strona-klatek ${strona} klatek=${czasy.length}`);
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
  'czysc-tlo': czyscTlo,
  'kontrola-wyciecia': kontrolaWyciecia,
  'wytnij-dlon': wytnijDlon,
  glowa,
  siatka,
  'strona-klatek': stronaKlatek,
  strefa,
  'sprawdz-ciecia': sprawdzCiecia,
  glosnosc,
  'wyrownaj-glos': wyrownajGlos,
  podlacz,
  'warianty-plan': wariantyPlan,
  'warianty-przygotuj': wariantyPrzygotuj,
  'warianty-render': wariantyRender,
  'warianty-lista': wariantyLista,
};
if (!polecenia[polecenie]) blad(`nieznane polecenie ${polecenie || ''} (uzyj: ${Object.keys(polecenia).join(', ')})`);
polecenia[polecenie](reszta);
