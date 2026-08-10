'use strict';

const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const root = __dirname;
const port = Number(process.argv[2] || process.env.PORT || 8080);
const cleanPages = new Map([
  ['/', 'index.html'],
  ['/sitemap', 'sitemap.html'],
  ['/wip', 'wip.html'],
  ['/contact', 'contact.html'],
  ['/faq', 'faq.html'],
  ['/careers', 'careers.html'],
  ['/career-role', 'career-role.html']
]);
const legacyPages = new Map([
  ['/index.html', '/'],
  ['/sitemap.html', '/sitemap'],
  ['/wip.html', '/wip'],
  ['/contact.html', '/contact'],
  ['/faq.html', '/faq'],
  ['/careers.html', '/careers'],
  ['/career-role.html', '/career-role']
]);
const mimeTypes = {
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8'
};

const sendFile = (response, relativePath) => {
  const filePath = path.resolve(root, relativePath);
  if (!filePath.startsWith(`${root}${path.sep}`) || !fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
    response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end('Not found');
    return;
  }
  response.writeHead(200, {
    'Content-Type': mimeTypes[path.extname(filePath).toLowerCase()] || 'text/html; charset=utf-8',
    'Cache-Control': 'no-store'
  });
  fs.createReadStream(filePath).pipe(response);
};

const server = http.createServer((request, response) => {
  const url = new URL(request.url || '/', 'http://localhost');
  const pathname = decodeURIComponent(url.pathname).replace(/\/+$/, '') || '/';

  if (legacyPages.has(pathname)) {
    response.writeHead(308, { Location: `${legacyPages.get(pathname)}${url.search}` });
    response.end();
    return;
  }
  if (cleanPages.has(pathname)) {
    sendFile(response, cleanPages.get(pathname));
    return;
  }
  if (/^\/careers\/[a-z0-9]+(?:-[a-z0-9]+)*$/.test(pathname)) {
    sendFile(response, 'career-role.html');
    return;
  }
  if (pathname.startsWith('/api/')) {
    response.writeHead(503, { 'Content-Type': 'application/json; charset=utf-8' });
    response.end(JSON.stringify({ error: { code: 'LOCAL_API_UNAVAILABLE' } }));
    return;
  }

  const staticPath = pathname.replace(/^\//, '');
  if (staticPath && path.extname(staticPath)) {
    sendFile(response, staticPath);
    return;
  }
  response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
  response.end('Not found');
});

server.listen(port, '127.0.0.1', () => {
  console.log(`Studio 17 local preview: http://127.0.0.1:${port}`);
});
