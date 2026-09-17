'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const htmlFiles = ['index.html', 'sitemap.html', 'wip.html', 'contact.html', 'faq.html', 'about.html', 'team.html', 'our-story.html', 'services.html', 'website-development.html', 'free-website.html', 'seo.html', 'seo-cyprus.html', 'seo-limassol.html', 'news.html', 'article.html', 'careers.html', 'career-role.html', 'privacy-policy.html', 'cookie-policy.html', 'terms.html'];

for (const file of htmlFiles) {
  const source = fs.readFileSync(path.join(root, file), 'utf8');
  assert.doesNotMatch(source, /(?:href|action)="[^"]*\.html(?:[?#"])/i, `${file} contains a public .html link`);
  assert.doesNotMatch(source, /href="\/services\/website-developments(?:[?#"])/i, `${file} contains the obsolete plural Website Development route`);
}

const wipRoutingFiles = [
  ...htmlFiles,
  'script.js',
  'i18n.js',
  'wip.js',
  ...fs.readdirSync(path.join(root, 'service-locales'))
    .filter(file => /\.(?:js|json)$/i.test(file))
    .map(file => path.join('service-locales', file))
];
for (const file of wipRoutingFiles) {
  const source = fs.readFileSync(path.join(root, file), 'utf8');
  assert.doesNotMatch(source, /\/wip\?for=/i, `${file} creates a crawlable WIP query variant`);
}

const wip = fs.readFileSync(path.join(root, 'wip.html'), 'utf8');
assert.match(wip, /<meta name="robots" content="noindex,follow">/);
assert.match(wip, /<link rel="canonical" href="https:\/\/www\.studio17\.world\/wip">/);
assert.match(fs.readFileSync(path.join(root, 'wip.js'), 'utf8'), /location\.hash/);

const configuration = JSON.parse(fs.readFileSync(path.join(root, 'vercel.json'), 'utf8'));
assert.equal(configuration.cleanUrls, true);
assert.equal(configuration.rewrites.some(route => route.source === '/careers/:slug'), true);
assert.equal(configuration.rewrites.some(route => route.source === '/insights/:slug' && route.destination === '/api/article-page?slug=:slug'), true);
assert.equal(configuration.rewrites.some(route => route.source === '/seo/cyprus' && route.destination === '/seo-cyprus'), true);
assert.equal(configuration.rewrites.some(route => route.source === '/seo/limassol' && route.destination === '/seo-limassol'), true);
assert.equal(configuration.rewrites.some(route => route.source === '/sitemap' && route.destination === '/api/sitemap-page'), true);
assert.equal(configuration.rewrites.some(route => /\.html/.test(route.source) || /\.html/.test(route.destination)), false);

const sitemapSource = fs.readFileSync(path.join(root, 'api', 'sitemap.js'), 'utf8');
assert.doesNotMatch(sitemapSource, /SITE_URL}\/[a-z-]+\.html/);

console.log('Clean URL tests passed.');
