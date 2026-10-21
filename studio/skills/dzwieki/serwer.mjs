import http from 'http';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const STRONA   = path.join(__dirname, 'strona');
const KATALOG  = path.join(__dirname, '..', '..', 'dzwieki', 'katalog.json');
const PLIKI    = path.join(__dirname, '..', '..', 'dzwieki', 'pliki');
const STYL_DIR = path.join(os.homedir(), '.ai-content-creator-studio');
const STYL_PLIK= path.join(STYL_DIR, 'moj-styl.json');
const PORT_START = 9732;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css':  'text/css; charset=utf-8',
  '.js':   'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.mp3':  'audio/mpeg',
  '.ogg':  'audio/ogg',
  '.wav':  'audio/wav',
};

function readKatalog() {
  try { return JSON.parse(fs.readFileSync(KATALOG, 'utf8')); } catch { return []; }
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

function serveAudio(filePath, req, res) {
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
        'Content-Type': 'audio/mpeg',
      });
      fs.createReadStream(filePath, { start, end }).pipe(res);
    } else {
      res.writeHead(200, {
        'Content-Type': 'audio/mpeg',
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
    const url = new URL(req.url, 'http://127.0.0.1');
    const p = url.pathname;

    if (req.method === 'POST' && p === '/api/zapisz') {
      let body = '';
      req.on('data', c => { body += c; });
      req.on('end', () => {
        try {
          const wybor = JSON.parse(body);
          fs.mkdirSync(STYL_DIR, { recursive: true });
          let styl = {};
          try { styl = JSON.parse(fs.readFileSync(STYL_PLIK, 'utf8')); } catch {}
          styl.dzwieki = wybor.dzwieki;
          styl.zapisano = new Date().toISOString().slice(0, 10);
          fs.writeFileSync(STYL_PLIK, JSON.stringify(styl, null, 2), 'utf8');
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ ok: true }));
          process.stdout.write(`ZAPISANO: ${JSON.stringify(styl)}\n`);
          setTimeout(() => { srv.close(); process.exit(0); }, 800);
        } catch (e) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ ok: false, blad: String(e.message) }));
        }
      });
      return;
    }

    if (req.method !== 'GET') { res.writeHead(405); res.end(); return; }

    if (p === '/api/dzwieki') {
      const katalog = readKatalog().map(d => ({
        ...d,
        ma_plik: fs.existsSync(path.join(PLIKI, d.id + '.mp3'))
      }));
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify(katalog));
      return;
    }

    const audioM = p.match(/^\/audio\/([a-z0-9-]+)$/);
    if (audioM) {
      serveAudio(path.join(PLIKI, audioM[1] + '.mp3'), req, res);
      return;
    }

    const staticPath = p === '/'
      ? path.join(STRONA, 'index.html')
      : path.join(STRONA, p.replace(/^\/+/, ''));
    if (!staticPath.startsWith(STRONA + path.sep) && staticPath !== path.join(STRONA, 'index.html')) {
      res.writeHead(403); res.end('Forbidden'); return;
    }
    serveStatic(staticPath, res);
  });

  srv.on('error', e => {
    if (e.code === 'EADDRINUSE') { startServer(port + 1); }
    else { process.stdout.write(`BLAD_SERWERA: ${e.message}\n`); process.exit(1); }
  });

  srv.listen(port, '127.0.0.1', () => {
    const url = `http://127.0.0.1:${port}`;
    process.stdout.write(`GOTOWY ${url}\n`);
    const cmd = process.platform === 'win32'
      ? `start "" "${url}"`
      : process.platform === 'darwin' ? `open "${url}"` : `xdg-open "${url}"`;
    exec(cmd);
  });
}

startServer(PORT_START);
