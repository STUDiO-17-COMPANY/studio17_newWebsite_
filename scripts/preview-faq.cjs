'use strict';
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const port = Number(process.env.PORT || 4173);
const server = http.createServer((request, response) => {
  const url = new URL(request.url, 'http://localhost');
  if (/^\/(pt|es|el|ru|he)\/faq(?:\/|$)/.test(url.pathname)) {
    response.writeHead(301, { Location: url.pathname.replace(/^\/(pt|es|el|ru|he)/, '') + url.search }); response.end(); return;
  }
  let pathname;
  try { pathname = decodeURIComponent(url.pathname); } catch { response.writeHead(400); response.end(); return; }
  let file = path.resolve(root, '.' + pathname);
  if (!file.startsWith(root + path.sep)) { response.writeHead(404); response.end(); return; }
  if (!path.extname(file)) file += '.html';
  if (!fs.existsSync(file) || !fs.statSync(file).isFile()) { response.writeHead(404); response.end('Not found'); return; }
  const types = { '.html': 'text/html; charset=utf-8', '.json': 'application/json', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.webp': 'image/webp', '.avif': 'image/avif', '.ttf': 'font/ttf' };
  response.setHeader('Content-Type', types[path.extname(file)] || 'application/octet-stream');
  if (url.searchParams.get('q') && /^\/faq(?:\/|$)/.test(url.pathname)) response.setHeader('X-Robots-Tag', 'noindex, follow');
  fs.createReadStream(file).pipe(response);
});
server.listen(port, '127.0.0.1', () => console.log(`FAQ preview: http://127.0.0.1:${port}/faq`));
