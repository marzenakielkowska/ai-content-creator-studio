import http from 'http';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const STRONA = path.join(__dirname, 'strona');
const LOOKBOOK = path.join(__dirname, '..', '..', 'lookbook');
const DZWIEKI = path.join(__dirname, '..', '..', 'dzwieki');
const STYL_DIR = path.join(os.homedir(), '.ai-content-creator-studio');
const STYL_PLIK = path.join(STYL_DIR, 'moj-styl.json');
const BRAND_PLIK = path.join(STYL_DIR, 'moj-brand.json');
const PORT_START = 9731;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css':  'text/css; charset=utf-8',
  '.js':   'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.mp4':  'video/mp4',
  '.mp3':  'audio/mpeg',
  '.woff2':'font/woff2',
  '.woff': 'font/woff',
  '.svg':  'image/svg+xml',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
};

function readItems(dir, file) {
  if (!fs.existsSync(dir)) return [];
  try {
    return fs.readdirSync(dir, { withFileTypes: true })
      .filter(e => e.isDirectory())
      .flatMap(e => {
        const p = path.join(dir, e.name, file);
        if (!fs.existsSync(p)) return [];
        try {
          const data = JSON.parse(fs.readFileSync(p, 'utf8'));
          if (data.status !== 'gotowy') return [];
          const folderPath = path.join(dir, e.name);
          return [{ ...data,
            ma_podglad: fs.existsSync(path.join(folderPath, 'podglad.mp4')),
            ma_poster:  fs.existsSync(path.join(folderPath, 'podglad.jpg')) ||
                        fs.existsSync(path.join(folderPath, 'podglad.svg')),
          }];
        } catch { return []; }
      });
  } catch { return []; }
}

function readCategories() {
  const p = path.join(LOOKBOOK, 'kategorie.json');
  try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch { return { kategorie: [] }; }
}

function serveStatic(filePath, res) {
  if (!fs.existsSync(filePath)) { res.writeHead(404); res.end('Not found'); return; }
  const mime = MIME[path.extname(filePath).toLowerCase()] || 'application/octet-stream';
  try {
    const data = fs.readFileSync(filePath);
    res.writeHead(200, { 'Content-Type': mime, 'Cache-Control': 'no-store' });
    res.end(data);
  } catch { res.writeHead(500); res.end(); }
}

function serveVideo(filePath, req, res) {
  if (!fs.existsSync(filePath)) { res.writeHead(404); res.end(); return; }
  try {
    const stat = fs.statSync(filePath);
    const range = req.headers.range;
    if (range) {
      const [s, e] = range.replace(/bytes=/, '').split('-');
      const start = parseInt(s, 10);
      const end = e ? parseInt(e, 10) : stat.size - 1;
      res.writeHead(206, {
        'Content-Range': `bytes ${start}-${end}/${stat.size}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': end - start + 1,
        'Content-Type': 'video/mp4',
      });
      fs.createReadStream(filePath, { start, end }).pipe(res);
    } else {
      res.writeHead(200, {
        'Content-Type': 'video/mp4',
        'Content-Length': stat.size,
        'Accept-Ranges': 'bytes',
      });
      fs.createReadStream(filePath).pipe(res);
    }
  } catch { res.writeHead(500); res.end(); }
}

function startServer(port) {
  const srv = http.createServer((req, res) => {
    res.setHeader('Access-Control-Allow-Origin', 'null');
    const url = new URL(req.url, `http://127.0.0.1`);
    const p = url.pathname;

    // Save brand
    if (req.method === 'POST' && p === '/api/zapisz-brand') {
      let body = '';
      req.on('data', c => { body += c; });
      req.on('end', () => {
        try {
          const brand = JSON.parse(body);
          fs.mkdirSync(STYL_DIR, { recursive: true });
          fs.writeFileSync(BRAND_PLIK, JSON.stringify(brand, null, 2), 'utf8');
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ ok: true }));
          process.stdout.write(`ZAPISANO_BRAND: ${JSON.stringify(brand)}\n`);
        } catch (e) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ ok: false, blad: String(e.message) }));
        }
      });
      return;
    }

    // Save choice
    if (req.method === 'POST' && p === '/api/zapisz') {
      let body = '';
      req.on('data', c => { body += c; });
      req.on('end', () => {
        try {
          const wybor = JSON.parse(body);
          fs.mkdirSync(STYL_DIR, { recursive: true });
          fs.writeFileSync(STYL_PLIK, JSON.stringify(wybor, null, 2), 'utf8');
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ ok: true }));
          process.stdout.write(`ZAPISANO: ${JSON.stringify(wybor)}\n`);
          setTimeout(() => { srv.close(); process.exit(0); }, 800);
        } catch (e) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ ok: false, blad: String(e.message) }));
        }
      });
      return;
    }

    if (req.method !== 'GET') { res.writeHead(405); res.end(); return; }

    // Data APIs
    if (p === '/api/napisy') {
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify(readItems(path.join(LOOKBOOK, 'napisy'), 'styl.json')));
      return;
    }
    if (p === '/api/efekty') {
      const efekty = readItems(path.join(LOOKBOOK, 'efekty'), 'efekt.json');
      const { kategorie } = readCategories();
      const grouped = kategorie
        .map(k => ({ ...k, efekty: efekty.filter(e => e.kategoria === k.id) }))
        .filter(k => k.efekty.length > 0);
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify(grouped));
      return;
    }
    if (p === '/api/zastapione') {
      let mapa = {};
      try { mapa = JSON.parse(fs.readFileSync(path.join(LOOKBOOK, 'zastapione.json'), 'utf8')).efekty || {}; } catch {}
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify(mapa));
      return;
    }
    if (p === '/api/styl') {
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify(readItems(path.join(LOOKBOOK, 'styl'), 'styl.json')));
      return;
    }
    if (p === '/api/hooki') {
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify(readItems(path.join(LOOKBOOK, 'hooki'), 'hook.json')));
      return;
    }
    if (p === '/api/dzwieki') {
      const katalog = path.join(DZWIEKI, 'katalog.json');
      try {
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(fs.readFileSync(katalog));
      } catch { res.writeHead(500); res.end(); }
      return;
    }
    if (p === '/api/moj-styl') {
      try {
        const data = fs.existsSync(STYL_PLIK) ? fs.readFileSync(STYL_PLIK, 'utf8') : 'null';
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(data);
      } catch { res.writeHead(500); res.end('null'); }
      return;
    }
    if (p === '/api/moj-brand') {
      try {
        const data = fs.existsSync(BRAND_PLIK) ? fs.readFileSync(BRAND_PLIK, 'utf8') : 'null';
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(data);
      } catch { res.writeHead(500); res.end('null'); }
      return;
    }

    // Video streaming
    const videoM = p.match(/^\/podglad\/(napisy|efekty|hooki)\/([^/]+)$/);
    if (videoM) {
      serveVideo(path.join(LOOKBOOK, videoM[1], videoM[2], 'podglad.mp4'), req, res);
      return;
    }

    // Poster (thumbnail) serving
    const posterM = p.match(/^\/poster\/(napisy|efekty|hooki)\/([^/]+)$/);
    if (posterM) {
      const base = path.join(LOOKBOOK, posterM[1], posterM[2]);
      const jpg = path.join(base, 'podglad.jpg');
      const svg = path.join(base, 'podglad.svg');
      serveStatic(fs.existsSync(jpg) ? jpg : svg, res);
      return;
    }

    // Audio streaming
    const audioM = p.match(/^\/dzwiek\/([a-z0-9_-]+)$/);
    if (audioM) {
      const audioPath = path.join(DZWIEKI, 'pliki', audioM[1] + '.mp3');
      if (!audioPath.startsWith(path.join(DZWIEKI, 'pliki') + path.sep)) {
        res.writeHead(403); res.end(); return;
      }
      serveStatic(audioPath, res);
      return;
    }

    // Static files from strona/
    const staticPath = p === '/'
      ? path.join(STRONA, 'index.html')
      : path.join(STRONA, p.replace(/^\/+/, ''));
    if (!staticPath.startsWith(STRONA + path.sep) && staticPath !== path.join(STRONA, 'index.html')) {
      res.writeHead(403); res.end('Forbidden'); return;
    }
    serveStatic(staticPath, res);
  });

  srv.on('error', e => {
    if (e.code === 'EADDRINUSE') {
      startServer(port + 1);
    } else {
      process.stdout.write(`BLAD_SERWERA: ${e.message}\n`);
      process.exit(1);
    }
  });

  srv.listen(port, '127.0.0.1', () => {
    const url = `http://127.0.0.1:${port}`;
    process.stdout.write(`GOTOWY ${url}\n`);
    const cmd = process.platform === 'win32'
      ? `start "" "${url}"`
      : process.platform === 'darwin'
        ? `open "${url}"`
        : `xdg-open "${url}"`;
    exec(cmd);
  });
}

startServer(PORT_START);
