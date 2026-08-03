'use strict';

const { listPublishedRoles } = require('./_google-careers');

const SITE_URL = 'https://www.studio17.world';
const escapeXml = value => String(value || '')
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&apos;');

const entry = ({ loc, lastmod, changefreq, priority }) => [
  '  <url>',
  `    <loc>${escapeXml(loc)}</loc>`,
  lastmod ? `    <lastmod>${escapeXml(lastmod)}</lastmod>` : '',
  changefreq ? `    <changefreq>${changefreq}</changefreq>` : '',
  priority ? `    <priority>${priority}</priority>` : '',
  '  </url>'
].filter(Boolean).join('\n');

module.exports = async function sitemapHandler(request, response) {
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    response.statusCode = 405;
    response.setHeader('Allow', 'GET, HEAD');
    response.end();
    return;
  }

  try {
    const { roles } = await listPublishedRoles(request);
    const urls = [
      { loc: `${SITE_URL}/`, changefreq: 'weekly', priority: '1.0' },
      { loc: `${SITE_URL}/contact`, changefreq: 'monthly', priority: '0.8' },
      { loc: `${SITE_URL}/careers`, changefreq: 'daily', priority: '0.8' },
      { loc: `${SITE_URL}/sitemap`, changefreq: 'monthly', priority: '0.3' },
      ...roles.map(role => ({
        loc: `${SITE_URL}/careers/${encodeURIComponent(role.slug)}`,
        lastmod: role.modifiedTime || undefined,
        changefreq: 'weekly',
        priority: '0.7'
      }))
    ];
    const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(entry).join('\n')}\n</urlset>\n`;
    response.statusCode = 200;
    response.setHeader('Content-Type', 'application/xml; charset=utf-8');
    response.setHeader('X-Content-Type-Options', 'nosniff');
    response.setHeader('Cache-Control', 'public, max-age=0, must-revalidate, s-maxage=300, stale-while-revalidate=600');
    response.end(request.method === 'HEAD' ? '' : body);
  } catch (error) {
    console.error('Sitemap generation failed', error?.code || error?.message);
    response.statusCode = 503;
    response.setHeader('Content-Type', 'text/plain; charset=utf-8');
    response.setHeader('Cache-Control', 'no-store');
    response.end(request.method === 'HEAD' ? '' : 'Sitemap temporarily unavailable.');
  }
};
