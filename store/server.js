// Minimal zero-dependency static server for Railway.
// Railway injects PORT — we must listen on 0.0.0.0 so public routing works.
const http = require('http');
const fs = require('fs');
const path = require('path');

const port = Number(process.env.PORT) || 3000;
const host = '0.0.0.0';
const root = __dirname;

const types = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

function safePath(urlPath) {
  const clean = decodeURIComponent((urlPath || '/').split('?')[0]);
  const relative = clean === '/' || clean === '' ? 'index.html' : clean.replace(/^\/+/, '');
  const filePath = path.resolve(root, relative);
  if (!filePath.startsWith(root + path.sep) && filePath !== root) {
    return null;
  }
  return filePath;
}

function sendFile(res, filePath, contentType) {
  fs.readFile(filePath, (err, data) => {
    if (err) {
      fs.readFile(path.join(root, 'index.html'), (e2, home) => {
        if (e2) {
          res.writeHead(404);
          res.end('Not found');
          return;
        }
        res.writeHead(200, { 'Content-Type': types['.html'] });
        res.end(home);
      });
      return;
    }
    res.writeHead(200, { 'Content-Type': contentType || 'application/octet-stream' });
    res.end(data);
  });
}

http
  .createServer((req, res) => {
    if (req.url === '/health' || req.url === '/healthz') {
      res.writeHead(200, { 'Content-Type': 'text/plain' });
      res.end('ok');
      return;
    }

    const filePath = safePath(req.url);
    if (!filePath) {
      res.writeHead(403);
      res.end('Forbidden');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    sendFile(res, filePath, types[ext]);
  })
  .listen(port, host, () => {
    console.log(`Boring Golf store listening on http://${host}:${port}`);
    console.log(`Serving files from ${root}`);
  });
