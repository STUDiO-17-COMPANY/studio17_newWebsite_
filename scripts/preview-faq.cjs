'use strict';
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const port = Number(process.env.PORT || 4173);
const server = http.createServer(async (request, response) => {
  const url = new URL(request.url, 'http://localhost');
  if (/^\/(pt|es|el|ru|he)\/faq(?:\/|$)/.test(url.pathname)) {
    response.writeHead(301, { Location: url.pathname.replace(/^\/(pt|es|el|ru|he)/, '') + url.search }); response.end(); return;
  }
  // Preview the real processed public feed; never query Drive or require credentials here.
  if (url.pathname === '/api/articles' || /^\/faq(?:\/[a-z-]+)?$/.test(url.pathname)) {
    try {
      const feed = await fetch('https://www.studio17.world/api/articles?lang=en');
      if (!feed.ok) throw new Error('Public article feed unavailable');
      const payload = await feed.json();
      if (url.pathname === '/api/articles') {
        response.writeHead(200, { 'Content-Type': 'application/json' }); response.end(JSON.stringify(payload)); return;
      }
      const html = require('../api/home-page').renderFaqPage(payload.articles, url.pathname.split('/')[2] || '');
      if (!html) { response.writeHead(404); response.end('Not found'); return; }
      response.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', ...(url.searchParams.get('q') ? { 'X-Robots-Tag': 'noindex, follow' } : {}) });
      response.end(html); return;
    } catch { /* Continue with the generated static FAQ if the public feed is unavailable. */ }
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
