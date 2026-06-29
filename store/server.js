// Minimal zero-dependency static server for Railway.
// Railway provides the PORT env var; we serve index.html (fully self-contained).
const http = require('http');
const fs = require('fs');
const path = require('path');

const port = process.env.PORT || 3000;
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

http.createServer((req, res) => {
  let urlPath = decodeURIComponent((req.url || '/').split('?')[0]);
  if (urlPath === '/' || urlPath === '') urlPath = '/index.html';

  // Resolve safely inside this folder
  const filePath = path.join(__dirname, path.normalize(urlPath));
  if (!filePath.startsWith(__dirname)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      // SPA-style fallback: anything unknown serves the page
      fs.readFile(path.join(__dirname, 'index.html'), (e2, home) => {
        if (e2) { res.writeHead(404); res.end('Not found'); return; }
        res.writeHead(200, { 'Content-Type': types['.html'] });
        res.end(home);
      });
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, { 'Content-Type': types[ext] || 'application/octet-stream' });
    res.end(data);
  });
}).listen(port, '0.0.0.0', () =>
  console.log('Boring Golf store running on 0.0.0.0:' + port)
);
