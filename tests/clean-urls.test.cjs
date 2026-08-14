'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const htmlFiles = ['index.html', 'sitemap.html', 'wip.html', 'contact.html', 'faq.html', 'about.html', 'services.html', 'website-development.html', 'news.html', 'article.html', 'careers.html', 'career-role.html', 'privacy-policy.html', 'cookie-policy.html', 'terms.html'];

for (const file of htmlFiles) {
  const source = fs.readFileSync(path.join(root, file), 'utf8');
  assert.doesNotMatch(source, /(?:href|action)="[^"]*\.html(?:[?#"])/i, `${file} contains a public .html link`);
}

const configuration = JSON.parse(fs.readFileSync(path.join(root, 'vercel.json'), 'utf8'));
assert.equal(configuration.cleanUrls, true);
assert.equal(configuration.rewrites.some(route => route.source === '/careers/:slug'), true);
assert.equal(configuration.rewrites.some(route => route.source === '/insights/:slug' && route.destination === '/api/article-page?slug=:slug'), true);
assert.equal(configuration.rewrites.some(route => /\.html/.test(route.source) || /\.html/.test(route.destination)), false);

const sitemapSource = fs.readFileSync(path.join(root, 'api', 'sitemap.js'), 'utf8');
assert.doesNotMatch(sitemapSource, /SITE_URL}\/[a-z-]+\.html/);

console.log('Clean URL tests passed.');
