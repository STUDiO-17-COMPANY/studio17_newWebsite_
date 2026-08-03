'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const htmlFiles = ['index.html', 'sitemap.html', 'wip.html', 'contact.html', 'careers.html', 'career-role.html'];

for (const file of htmlFiles) {
  const source = fs.readFileSync(path.join(root, file), 'utf8');
  assert.doesNotMatch(source, /(?:href|action)="[^"]*\.html(?:[?#"])/i, `${file} contains a public .html link`);
}

const configuration = JSON.parse(fs.readFileSync(path.join(root, 'vercel.json'), 'utf8'));
assert.equal(configuration.cleanUrls, true);
assert.equal(configuration.rewrites.some(route => route.source === '/careers/:slug'), true);
assert.equal(configuration.rewrites.some(route => /\.html/.test(route.source) || /\.html/.test(route.destination)), false);

const sitemapSource = fs.readFileSync(path.join(root, 'api', 'sitemap.js'), 'utf8');
assert.doesNotMatch(sitemapSource, /SITE_URL}\/[a-z-]+\.html/);

console.log('Clean URL tests passed.');
