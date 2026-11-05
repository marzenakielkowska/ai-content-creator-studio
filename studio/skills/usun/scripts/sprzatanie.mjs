#!/usr/bin/env node
// AI Content Creator Studio: sprzatanie po Studio.
//
//   pokaz
//        co Studio zostawilo na komputerze i ile to zajmuje; czego nie rusza (nagrania, projekty)
//   usun <czesc>... [--kopia-stylu <folder>]
//        usuwa wybrane czesci: studio (folder Studio), stary-styl (dawny folder stylu), pamiec (foldery podreczne
//        HyperFrames). --kopia-stylu najpierw kopiuje moj-styl.json i moj-brand.json do <folder>/moj-styl-kopia
//   miejsce [--usun]
//        pliki robocze HyperFrames, ktore mozna bezpiecznie usunac ("hyperframes clean"); bez --usun tylko liczy
//   projekty [--projekt <folder>] [--zostaw <plik>]... [--wersje] [--lista] [--do-kosza]
//        porzadek w gotowych projektach rolek: zostaje jedna rolka do publikacji (najnowsza wersja), plan montazu,
//        kompozycje, materialy, dzwieki i czcionki; inne wersje, kopie na telefon, kopie nagrania, transkrypcje
//        i pliki robocze ida do Kosza. --wersje: tylko inne wersje i kopie na telefon (w trakcie poprawek).
//        Bez --projekt: wszystkie projekty z folderu projektow. Bez --do-kosza tylko liczy
//   porzadek-ustaw <tak|nie>
//        zapamietuje zgode kursantki na porzadek po kazdej zaakceptowanej rolce (ustawienia.json, pole "porzadek")
//
// Nigdy nie usuwa nagran ani folderu z projektami i rolkami. Kazda sciezke sprawdza, zanim cokolwiek usunie.
// Z projektow niczego nie kasuje na stale: przenosi do systemowego Kosza.
// Wypisuje linie "STATUS ...", "WYNIK ...". Claude tlumaczy je kursantce.

import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { FOLDER_STUDIO, STARY_FOLDER_STYLU, PLIKI_STYLU } from '../../start/scripts/styl.mjs';

const DOM = os.homedir();
// HyperFrames trzyma przegladarke, modele, czcionki i historie w ~/.cache/hyperframes, a swoje ustawienia w ~/.hyperframes.
const PAMIEC = [path.join(DOM, '.cache', 'hyperframes'), path.join(DOM, '.hyperframes')];
const FOLDER_CLAUDE = process.env.CLAUDE_CONFIG_DIR || path.join(DOM, '.claude');
// Kopie ustawien Claude, ktore /studio:start zostawia przy wlaczaniu automatycznych aktualizacji.
const KOPIE_USTAWIEN = [
  path.join(FOLDER_CLAUDE, 'settings.json.ai-studio-kopia'),
  path.join(FOLDER_CLAUDE, 'plugins', 'known_marketplaces.json.ai-studio-kopia'),
];
// Pliki, po ktorych poznajemy, ze folder naprawde jest folderem Studio.
const ZNAKI_STUDIO = ['narzedzia.json', 'ustawienia.json', 'aktualizacje.json', 'dziennik.log', ...PLIKI_STYLU];

function wypisz(linia) {
  process.stdout.write(linia + '\n');
}

function blad(tekst) {
  wypisz(`STATUS blad ${tekst}`);
  wypisz('WYNIK BLAD');
  process.exit(1);
}

function rozmiar(sciezka) {
  let st;
  try {
    st = fs.lstatSync(sciezka);
  } catch {
    return 0;
  }
  if (st.isSymbolicLink()) return 0;
  if (!st.isDirectory()) return st.size;
  let suma = 0;
  for (const nazwa of fs.readdirSync(sciezka)) suma += rozmiar(path.join(sciezka, nazwa));
  return suma;
}

const mb = (bajty) => Math.round(bajty / 1048576);

function czytajJson(plik) {
  try {
    return JSON.parse(fs.readFileSync(plik, 'utf8'));
  } catch {
    return null;
  }
}

// Folder Studio usuwamy tylko wtedy, gdy na pewno nim jest: nie katalog domowy ani nic nad nim, i ma w srodku
// pliki Studio. Chroni przed AI_STUDIO_HOME ustawionym przez pomylke na wazny folder.
function toNaPewnoStudio(folder) {
  const f = path.resolve(folder);
  const doDomu = path.relative(f, DOM); // '' = to katalog domowy; bez '..' na poczatku = folder nad nim
  if (f === path.parse(f).root || doDomu === '' || !doDomu.startsWith('..')) return false;
  if (!fs.existsSync(f) || !fs.statSync(f).isDirectory()) return false;
  return ZNAKI_STUDIO.some((n) => fs.existsSync(path.join(f, n)));
}

function czesci() {
  const ustawienia = czytajJson(path.join(FOLDER_STUDIO, 'ustawienia.json')) || {};
  const istniejace = (sciezki) => ({ sciezki, jest: sciezki.some((p) => fs.existsSync(p)) });
  return {
    studio: { sciezki: [FOLDER_STUDIO], jest: toNaPewnoStudio(FOLDER_STUDIO) },
    'stary-styl': istniejace([STARY_FOLDER_STYLU]),
    pamiec: istniejace(PAMIEC),
    ustawienia,
  };
}

function pokaz() {
  const c = czesci();
  for (const nazwa of ['studio', 'stary-styl', 'pamiec']) {
    const { sciezki, jest } = c[nazwa];
    const ile = sciezki.reduce((suma, p) => suma + rozmiar(p), 0);
    if (jest) wypisz(`STATUS czesc ${nazwa} ${mb(ile)}MB ${sciezki.filter((p) => fs.existsSync(p)).join(' ')}`);
    else wypisz(`STATUS czesc ${nazwa} BRAK`);
  }
  const styl = PLIKI_STYLU.filter((n) => fs.existsSync(path.join(FOLDER_STUDIO, n)) || fs.existsSync(path.join(STARY_FOLDER_STYLU, n)));
  wypisz(`STATUS styl ${styl.length ? styl.join(',') : 'BRAK'}`);
  const kopie = KOPIE_USTAWIEN.filter((p) => fs.existsSync(p));
  wypisz(`STATUS kopie-ustawien ${kopie.length}`);
  wypisz(`STATUS zostaje nagrania ${c.ustawienia.nagrania || 'NIEZNANE'}`);
  wypisz(`STATUS zostaje projekty ${c.ustawienia.projekty || 'NIEZNANE'}`);
  wypisz('WYNIK OK');
}

function kopiaStylu(cel) {
  if (!cel || !fs.existsSync(cel) || !fs.statSync(cel).isDirectory()) blad(`brak folderu na kopie stylu: ${cel || ''}`);
  const folder = path.join(cel, 'moj-styl-kopia');
  const skopiowane = [];
  for (const nazwa of PLIKI_STYLU) {
    const zrodlo = [FOLDER_STUDIO, STARY_FOLDER_STYLU].map((f) => path.join(f, nazwa)).find((p) => fs.existsSync(p));
    if (!zrodlo) continue;
    fs.mkdirSync(folder, { recursive: true });
    const plik = path.join(folder, nazwa);
    fs.copyFileSync(zrodlo, plik);
    if (!fs.readFileSync(plik).equals(fs.readFileSync(zrodlo))) blad(`kopia stylu sie nie zgadza: ${nazwa}`);
    skopiowane.push(nazwa);
  }
  wypisz(`STATUS kopia-stylu ${skopiowane.length ? `${folder} ${skopiowane.join(',')}` : 'BRAK_STYLU'}`);
}

function usun(argumenty) {
  const i = argumenty.indexOf('--kopia-stylu');
  const celKopii = i >= 0 ? argumenty[i + 1] : null;
  const wybrane = argumenty.filter((a, n) => !a.startsWith('--') && (i < 0 || n !== i + 1));
  const znane = ['studio', 'stary-styl', 'pamiec'];
  const nieznane = wybrane.filter((w) => !znane.includes(w));
  if (!wybrane.length || nieznane.length) blad(`podaj czesci do usuniecia: ${znane.join(', ')}`);

  const c = czesci();
  // Najpierw wszystkie sprawdzenia, potem kopia stylu, dopiero na koncu usuwanie.
  if (wybrane.includes('studio') && fs.existsSync(FOLDER_STUDIO) && !c.studio.jest) {
    blad(`folder ${FOLDER_STUDIO} nie wyglada na folder Studio - nic nie usuwam`);
  }
  // Nagrania i projekty kursantki moga lezec gdziekolwiek, nawet (przez pomylke) w folderze, ktory sprzatamy.
  for (const nazwa of wybrane) {
    for (const folder of c[nazwa].sciezki) {
      for (const jej of [c.ustawienia.nagrania, c.ustawienia.projekty, celKopii].filter(Boolean)) {
        const wzgl = path.relative(folder, path.resolve(jej));
        if (wzgl === '' || !wzgl.startsWith('..')) blad(`w folderze ${folder} sa pliki kursantki (${jej}) - nic nie usuwam`);
      }
    }
  }
  if (celKopii) kopiaStylu(celKopii);

  let razem = 0;
  for (const nazwa of wybrane) {
    const { sciezki, jest } = c[nazwa];
    if (!jest) {
      wypisz(`STATUS usunieto ${nazwa} BRAK`);
      continue;
    }
    const ile = sciezki.reduce((suma, p) => suma + rozmiar(p), 0);
    try {
      for (const p of sciezki) fs.rmSync(p, { recursive: true, force: true, maxRetries: 3 });
    } catch (e) {
      wypisz(`STATUS usunieto ${nazwa} BLAD ${e.code || e.message}`);
      continue;
    }
    razem += ile;
    wypisz(`STATUS usunieto ${nazwa} ${mb(ile)}MB`);
    if (nazwa === 'studio') {
      for (const kopia of KOPIE_USTAWIEN) if (fs.existsSync(kopia)) fs.rmSync(kopia, { force: true });
    }
  }
  wypisz(`STATUS zwolniono ${mb(razem)}MB`);
  wypisz('WYNIK OK');
}

// ---------- miejsce ----------

function hyperframes(argumenty) {
  const narz = czytajJson(path.join(FOLDER_STUDIO, 'narzedzia.json'));
  if (!narz || !narz.node || !narz.hyperframes) blad('brak narzedzia.json - nie ma czego sprzatac albo uruchom /studio:start');
  // Z folderu Studio: "hyperframes clean" sprawdza tez biezacy folder jako projekt, a tam nie ma czego usuwac.
  const r = spawnSync(narz.node, [narz.hyperframes, ...argumenty], {
    cwd: FOLDER_STUDIO,
    encoding: 'utf8',
    timeout: 1800000,
  });
  return { ok: r.status === 0, out: r.stdout || '', err: r.stderr || '' };
}

// "hyperframes clean --json" dopisuje czasem pod JSON-em zwykly tekst (np. podpowiedzi o aktualizacji).
function wezJson(tekst) {
  const start = tekst.indexOf('{');
  for (let koniec = tekst.lastIndexOf('}'); koniec > start; koniec = tekst.lastIndexOf('}', koniec - 1)) {
    try {
      return JSON.parse(tekst.slice(start, koniec + 1));
    } catch {}
  }
  return null;
}

const KATEGORIE = {
  'Video and audio copies in project history': 'historia',
  'Extracted video frames': 'klatki',
  'Video proxies': 'podglady-wideo',
  Snapshots: 'zrzuty-klatek',
  'Check reports': 'raporty',
};

function miejsce(argumenty) {
  const naprawde = argumenty.includes('--usun');
  const r = hyperframes(['clean', '--json', ...(naprawde ? [] : ['--dry-run'])]);
  const j = wezJson(r.out);
  if (!j || !Array.isArray(j.removed)) blad(`hyperframes clean nie odpowiedzial: ${(r.err || r.out).trim().split(/\r?\n/).slice(-1)[0] || ''}`);
  const grupy = {};
  for (const w of j.removed) {
    const k = KATEGORIE[w.what] || 'inne';
    grupy[k] = (grupy[k] || 0) + (w.bytes || 0);
  }
  for (const [k, b] of Object.entries(grupy)) wypisz(`STATUS miejsce ${k} ${mb(b)}MB`);
  for (const e of j.errors || []) wypisz(`STATUS miejsce-blad ${e.path || ''} ${e.message || e.error || ''}`.trim());
  wypisz(`STATUS ${naprawde ? 'zwolniono' : 'do-zwolnienia'} ${mb(j.totalBytes || 0)}MB`);
  wypisz('WYNIK OK');
}

// ---------- projekty ----------

const WIDEO = /\.(mp4|mov|m4v|mkv|webm)$/i;
// rolka-v003.mp4, rolka-v003-telefon.mp4, rolka-v003-surowy.mp4
const WERSJA = /^(.+)-v(\d+)(-[^.]*)?\.(mp4|mov|m4v|webm)$/i;
const DUZY_PLIK = 20 * 1048576;
// Tylko do testow: zamiast systemowego Kosza zwykly folder.
const KOSZ_TESTOWY = process.env.AI_STUDIO_KOSZ;

function lista(folder) {
  try {
    return fs.readdirSync(folder, { withFileTypes: true }).filter((w) => !w.isSymbolicLink());
  } catch {
    return [];
  }
}

function plikiWideo(folder) {
  const wynik = [];
  for (const w of lista(folder)) {
    const p = path.join(folder, w.name);
    if (w.isDirectory()) wynik.push(...plikiWideo(p));
    else if (w.isFile() && WIDEO.test(w.name)) wynik.push(p);
  }
  return wynik;
}

// Rozmiar bez liczenia dwa razy tego samego pliku (kompozycje dostaja nagranie jako twarde dowiazanie).
function rozmiarRaz(sciezki, widziane = new Set()) {
  let suma = 0;
  for (const p of sciezki) {
    let st;
    try {
      st = fs.lstatSync(p);
    } catch {
      continue;
    }
    if (st.isSymbolicLink()) continue;
    if (st.isDirectory()) {
      suma += rozmiarRaz(fs.readdirSync(p).map((n) => path.join(p, n)), widziane);
      continue;
    }
    const klucz = `${st.dev}:${st.ino}`;
    if (widziane.has(klucz)) continue;
    widziane.add(klucz);
    suma += st.size;
  }
  return suma;
}

function wSrodku(folder, p) {
  const wzgl = path.relative(folder, p);
  return wzgl === '' || (!wzgl.startsWith('..') && !path.isAbsolute(wzgl));
}

// Co w gotowym projekcie zostaje, a co idzie do Kosza. Zasada: przenosimy tylko to, co Studio umie odtworzyc
// albo czego nikt juz nie oglada. Plikow w glownym folderze projektu i folderu materialy nie ruszamy nigdy.
function planPorzadku(projekt, zostaw, tylkoWersje = false) {
  const zrodla = Object.values(czytajJson(path.join(projekt, 'zrodla.json')) || {}).map((p) => path.resolve(projekt, String(p)));
  const chronione = (p) => zrodla.some((z) => wSrodku(p, z));
  const doKosza = [];
  const dodaj = (p, rodzaj) => {
    if (!chronione(p)) doKosza.push({ p, rodzaj });
  };

  // Rendery: z kazdej serii (ta sama nazwa, kolejne -v001, -v002...) zostaje jeden plik: najnowsza wersja w pelnej
  // jakosci, ta do publikacji. Kopie na telefon, wersje "surowe" i starsze wersje ida do Kosza, chyba ze kursantka
  // poprosila o zachowanie konkretnego pliku. Rendery bez numeru wersji (np. proby) zostaja, bez kopii na telefon.
  // Rendery w folderach kompozycji to zawsze pliki posrednie.
  const foldery = lista(projekt).filter((w) => w.isDirectory());
  const kompozycje = foldery.filter((w) => /^hf/i.test(w.name)).map((w) => path.join(projekt, w.name));
  const pasuje = (p, z) => {
    const wzgl = path.relative(projekt, p).split(path.sep).join('/');
    return [wzgl, path.basename(p), path.basename(p, path.extname(p))].includes(z.split(path.sep).join('/'));
  };
  const zostawiony = (p) => zostaw.some((z) => pasuje(p, z));
  const serie = {};
  const bezWersji = [];
  for (const p of plikiWideo(path.join(projekt, 'renders'))) {
    const m = path.basename(p).match(WERSJA);
    if (m) (serie[m[1].toLowerCase()] ||= []).push({ p, wersja: Number(m[2]), dopisek: (m[3] || '').toLowerCase() });
    else bezWersji.push(p);
  }
  let rolka = null;
  for (const pliki of Object.values(serie)) {
    const glowne = pliki.filter((f) => !f.dopisek);
    const najnowsza = glowne.length ? Math.max(...glowne.map((f) => f.wersja)) : null;
    const glowna = glowne.find((f) => f.wersja === najnowsza);
    for (const f of pliki) if (f !== glowna && !zostawiony(f.p)) dodaj(f.p, 'wersje');
    if (glowna && (!rolka || fs.statSync(glowna.p).mtimeMs > fs.statSync(rolka).mtimeMs)) rolka = glowna.p;
  }
  for (const p of bezWersji) {
    const pelna = p.replace(/-telefon(\.[^.]+)$/i, '$1');
    if (pelna !== p && fs.existsSync(pelna) && !zostawiony(p)) dodaj(p, 'wersje');
  }
  for (const k of kompozycje) for (const p of plikiWideo(path.join(k, 'renders'))) if (!zostawiony(p)) dodaj(p, 'wersje');
  if (tylkoWersje) return { rolka, doKosza };

  // Nagranie zlozone z ciec i sylwetka bez tla (Studio odtworzy je z oryginalu), ich kopie w kompozycjach
  // i inne duze filmy robocze.
  for (const folder of [path.join(projekt, 'assets'), ...kompozycje.map((k) => path.join(k, 'assets'))]) {
    for (const w of lista(folder)) {
      const p = path.join(folder, w.name);
      if (!w.isFile() || !WIDEO.test(w.name)) continue;
      if (/^(aroll|sylwetka)/i.test(w.name) || fs.statSync(p).size >= DUZY_PLIK) dodaj(p, 'kopie-nagrania');
    }
  }
  // Pamiec podreczna i stan silnika montazu w kompozycjach (silnik odtworzy je przy nastepnym uzyciu).
  for (const k of kompozycje) {
    for (const nazwa of ['.transcode-cache', '.hyperframes']) {
      const p = path.join(k, nazwa);
      if (fs.existsSync(p)) dodaj(p, 'robocze');
    }
  }
  // Pliki pomocnicze montazu: transkrypcje, czasy slow, pomiary glowy, klatki, pociete fragmenty, podglady,
  // jednorazowe skrypty. Do poprawek wystarcza zrodla.json i edl.json: reszte Studio policzy jeszcze raz.
  // Zostaja: plan montazu i inne opisy (.md), strony .html, kompozycje i materialy, czyli to, co przydaje sie
  // jako wzor przy kolejnych rolkach.
  const POMOCNICZE = /^(transkrypt.*\.txt|slowa.*\.json|segmenty.*\.json|glowa.*\.json|.*\.(py|log))$/i;
  for (const w of lista(projekt)) {
    const p = path.join(projekt, w.name);
    if (w.isFile() && POMOCNICZE.test(w.name)) dodaj(p, 'robocze');
    if (w.isDirectory() && /^(work|storyboard|podglad.*)$/i.test(w.name)) dodaj(p, 'robocze');
  }

  return { rolka, doKosza };
}

function doKosza(sciezki) {
  const bledy = {};
  // wolna nazwa w Koszu: „aroll.mp4”, a gdy zajęta: „aroll 2.mp4”, „aroll 3.mp4”…
  const nazwa = (p, cel) => {
    const ext = path.extname(p);
    const rdzen = path.basename(p, ext);
    let n = path.basename(p);
    for (let i = 2; fs.existsSync(path.join(cel, n)); i++) n = `${rdzen} ${i}${ext}`;
    return n;
  };
  const przenies = (cel, lista = sciezki) => {
    for (const p of lista) {
      try {
        fs.renameSync(p, path.join(cel, nazwa(p, cel)));
      } catch (e) {
        bledy[p] = e.code || e.message;
      }
    }
  };
  if (KOSZ_TESTOWY) {
    fs.mkdirSync(KOSZ_TESTOWY, { recursive: true });
    przenies(KOSZ_TESTOWY);
  } else if (process.platform === 'darwin') {
    if (fs.existsSync('/usr/bin/trash')) {
      for (let i = 0; i < sciezki.length; i += 100) spawnSync('/usr/bin/trash', sciezki.slice(i, i + 100), { encoding: 'utf8' });
      // „trash” kończy się sukcesem, ale nie rusza pliku, którego twarde dowiązanie już leży w Koszu
      // (np. assets/aroll.mp4 po „podlacz”, gdy hf/assets/aroll.mp4 poszedł pierwszy). Te przenosimy sami.
      const zostaly = sciezki.filter((p) => fs.existsSync(p));
      if (zostaly.length) przenies(path.join(DOM, '.Trash'), zostaly);
    } else {
      // Starszy macOS bez polecenia "trash": przeniesienie do Kosza na tym samym dysku.
      przenies(path.join(DOM, '.Trash'));
    }
  } else if (process.platform === 'win32') {
    const naSieci = sciezki.filter((p) => p.startsWith('\\\\'));
    for (const p of naSieci) bledy[p] = 'DYSK_SIECIOWY_BEZ_KOSZA';
    const plik = path.join(os.tmpdir(), `ai-studio-kosz-${process.pid}.txt`);
    fs.writeFileSync(plik, sciezki.filter((p) => !naSieci.includes(p)).join('\r\n'), 'utf8');
    const polecenie = [
      'Add-Type -AssemblyName Microsoft.VisualBasic',
      'foreach ($p in Get-Content -LiteralPath $env:AI_STUDIO_LISTA -Encoding UTF8) {',
      '  if (-not $p) { continue }',
      "  if (Test-Path -LiteralPath $p -PathType Container) { [Microsoft.VisualBasic.FileIO.FileSystem]::DeleteDirectory($p, 'OnlyErrorDialogs', 'SendToRecycleBin') }",
      "  else { [Microsoft.VisualBasic.FileIO.FileSystem]::DeleteFile($p, 'OnlyErrorDialogs', 'SendToRecycleBin') }",
      '}',
    ].join('\n');
    spawnSync('powershell', ['-NoProfile', '-NonInteractive', '-Command', polecenie], {
      env: { ...process.env, AI_STUDIO_LISTA: plik },
      encoding: 'utf8',
      timeout: 1800000,
    });
    fs.rmSync(plik, { force: true });
  } else {
    for (const p of sciezki) bledy[p] = 'BRAK_KOSZA';
  }
  for (const p of sciezki) if (!bledy[p] && fs.existsSync(p)) bledy[p] = 'NIE_PRZENIESIONO';
  return bledy;
}

function projekty(argumenty) {
  const naprawde = argumenty.includes('--do-kosza');
  const zostaw = argumenty.flatMap((a, i) => (argumenty[i - 1] === '--zostaw' ? [a] : []));
  const i = argumenty.indexOf('--projekt');
  const ustawienia = czytajJson(path.join(FOLDER_STUDIO, 'ustawienia.json')) || {};
  const folderProjektow = ustawienia.projekty;

  let doSprawdzenia;
  if (i >= 0) {
    const p = argumenty[i + 1] && path.resolve(argumenty[i + 1]);
    if (!p || !fs.existsSync(p) || !fs.statSync(p).isDirectory()) blad(`nie ma takiego projektu: ${argumenty[i + 1] || ''}`);
    doSprawdzenia = [p];
  } else {
    if (!folderProjektow || !fs.existsSync(folderProjektow)) blad('nie znam folderu projektow - uruchom /studio:start');
    doSprawdzenia = lista(folderProjektow)
      .filter((w) => w.isDirectory() && !w.name.startsWith('.'))
      .map((w) => path.join(folderProjektow, w.name));
  }

  let razem = 0;
  for (const projekt of doSprawdzenia) {
    const nazwa = path.basename(projekt);
    // Katalog domowy, cos nad nim, folder nagran albo caly folder projektow to nie projekt (i nie liczymy ich rozmiaru).
    const doDomu = path.relative(projekt, DOM);
    if (doDomu === '' || !doDomu.startsWith('..') || [ustawienia.nagrania, folderProjektow].some((f) => f && path.resolve(f) === projekt)) {
      wypisz(`STATUS projekt ${nazwa} NIEZNANY`);
      continue;
    }
    const teraz = mb(rozmiarRaz([projekt]));
    // Projekt zalozony przez Studio ma zrodla.json. Inny uklad (starsze montaze, cudze foldery) zostawiamy.
    if (!fs.existsSync(path.join(projekt, 'zrodla.json'))) {
      wypisz(`STATUS projekt ${nazwa} NIEZNANY ${teraz}MB`);
      continue;
    }
    // Wersje, o ktore kursantka prosila przy poprzednim porzadku, zostaja tez przy kolejnym.
    const zapis = path.join(projekt, 'porzadek.json');
    const poprzednie = czytajJson(zapis) || {};
    const zostawione = [...new Set([...(poprzednie.zostawione || []), ...zostaw])];
    const { rolka, doKosza: plan } = planPorzadku(projekt, zostawione, argumenty.includes('--wersje'));
    if (!rolka) {
      wypisz(`STATUS projekt ${nazwa} W_TRAKCIE ${teraz}MB`);
      continue;
    }
    const doWyrzucenia = rozmiarRaz(plan.map((x) => x.p));
    const wzgl = (p) => path.relative(projekt, p).split(path.sep).join('/');
    if (!plan.length || mb(doWyrzucenia) < 1) {
      wypisz(`STATUS projekt ${nazwa} POSPRZATANY ${teraz}MB rolka=${wzgl(rolka)}`);
      continue;
    }
    const zmiana = new Date(fs.statSync(rolka).mtimeMs).toISOString().slice(0, 10);
    wypisz(`STATUS projekt ${nazwa} GOTOWY ${teraz}MB do-kosza=${mb(doWyrzucenia)}MB rolka=${wzgl(rolka)} zmiana=${zmiana}`);
    for (const rodzaj of ['wersje', 'kopie-nagrania', 'robocze']) {
      const czesc = plan.filter((x) => x.rodzaj === rodzaj);
      if (czesc.length) wypisz(`STATUS kosz ${nazwa} ${rodzaj} ${mb(rozmiarRaz(czesc.map((x) => x.p)))}MB plikow=${czesc.length}`);
    }
    if (argumenty.includes('--lista')) for (const x of plan) wypisz(`STATUS plik ${nazwa} ${x.rodzaj} ${wzgl(x.p)} ${mb(rozmiarRaz([x.p]))}MB`);
    const wyrzucane = new Set(plan.map((x) => x.p));
    const rendery = [path.join(projekt, 'renders'), ...lista(projekt).filter((w) => w.isDirectory() && /^hf/i.test(w.name)).map((w) => path.join(projekt, w.name, 'renders'))];
    for (const p of rendery.flatMap(plikiWideo)) if (!wyrzucane.has(p)) wypisz(`STATUS zostaje ${nazwa} ${wzgl(p)}`);
    if (!naprawde) {
      razem += doWyrzucenia;
      continue;
    }

    const bledy = doKosza(plan.map((x) => x.p));
    const przeniesione = plan.filter((x) => !bledy[x.p]);
    for (const [p, kod] of Object.entries(bledy)) wypisz(`STATUS kosz-blad ${nazwa} ${wzgl(p)} ${kod}`);
    const zwolnione = Math.max(0, doWyrzucenia - rozmiarRaz(Object.keys(bledy)));
    razem += zwolnione;
    fs.writeFileSync(
      zapis,
      JSON.stringify(
        {
          data: new Date().toISOString(),
          rolka: wzgl(rolka),
          zostawione,
          w_koszu: [...(poprzednie.w_koszu || []), ...przeniesione.map((x) => wzgl(x.p))],
        },
        null,
        2,
      ) + '\n',
    );
    wypisz(`STATUS przeniesiono ${nazwa} ${mb(zwolnione)}MB`);
  }
  wypisz(`STATUS ${naprawde ? 'w-koszu-razem' : 'do-kosza-razem'} ${mb(razem)}MB`);
  wypisz('WYNIK OK');
}

function porzadekUstaw([wybor]) {
  if (!['tak', 'nie'].includes(wybor)) blad('uzycie: porzadek-ustaw tak|nie');
  const plik = path.join(FOLDER_STUDIO, 'ustawienia.json');
  const dane = { ...(czytajJson(plik) || {}), porzadek: wybor === 'tak' ? 'po-akceptacji' : 'nie' };
  fs.mkdirSync(FOLDER_STUDIO, { recursive: true });
  fs.writeFileSync(plik, JSON.stringify(dane, null, 2) + '\n');
  wypisz(`STATUS porzadek ${dane.porzadek}`);
  wypisz('WYNIK OK');
}

// ---------- start ----------

const [polecenie, ...reszta] = process.argv.slice(2);
const polecenia = { pokaz, usun, miejsce, projekty, 'porzadek-ustaw': porzadekUstaw };
if (!polecenia[polecenie]) blad(`nieznane polecenie ${polecenie || ''} (uzyj: ${Object.keys(polecenia).join(', ')})`);
polecenia[polecenie](reszta);
