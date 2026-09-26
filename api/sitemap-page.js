'use strict';

const fs = require('node:fs');
const path = require('node:path');

const TEMPLATE_PATH = path.join(__dirname, 'sitemap-template.html');

module.exports = async function sitemapPageHandler(request, response) {
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    response.statusCode = 405;
    response.setHeader('Allow', 'GET, HEAD');
    response.end();
    return;
  }

  try {
    const body = fs.readFileSync(TEMPLATE_PATH, 'utf8');

    response.statusCode = 200;
    response.setHeader('Content-Type', 'text/html; charset=utf-8');
    response.setHeader('X-Content-Type-Options', 'nosniff');
    response.setHeader('Cache-Control', 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400');
    response.end(request.method === 'HEAD' ? '' : body);
  } catch (error) {
    console.error('Human sitemap generation failed', error?.code || error?.message);
    response.statusCode = 503;
    response.setHeader('Content-Type', 'text/plain; charset=utf-8');
    response.setHeader('Cache-Control', 'no-store');
    response.end(request.method === 'HEAD' ? '' : 'Sitemap temporarily unavailable.');
  }
};
