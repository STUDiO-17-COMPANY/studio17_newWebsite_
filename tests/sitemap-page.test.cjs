'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const template = fs.readFileSync(path.join(__dirname, '..', 'api', 'sitemap-template.html'), 'utf8');
const directory = template.match(/<section class="sitemap-directory"[\s\S]*?<\/section>/)?.[0] || '';

assert.match(template, /href="\/services\/free-website">Free website/);
assert.doesNotMatch(template, /\/wip#for=free-website/);

assert.equal(fs.existsSync(path.join(__dirname, '..', 'sitemap.html')), false, 'A root sitemap.html would bypass the dynamic Vercel rewrite');
assert.ok(directory, 'The human sitemap directory must exist');
assert.doesNotMatch(directory, /STUDIO17_DYNAMIC_ARTICLE_LINKS|STUDIO17_DYNAMIC_ROLE_LINKS/);
assert.doesNotMatch(directory, /href="\/(?:insights|case-studies|news)\/[^"]+"/, 'Individual articles must stay out of the human sitemap');
assert.doesNotMatch(directory, /href="\/careers\/[^"]+"/, 'Individual roles must stay out of the human sitemap');
assert.doesNotMatch(directory, /href="\/seo\/(?:cyprus|limassol)"/, 'Location landing pages must stay out of the human sitemap');
assert.doesNotMatch(template, /href="\/sitemap"/, 'The human sitemap must not link to itself');
assert.doesNotMatch(directory, /href="\/wip(?:#|\")/, 'Planned and WIP destinations must stay out of the main-page directory');
for (const route of ['/', '/services', '/work', '/news', '/about', '/careers', '/contact', '/faq']) {
  assert.match(directory, new RegExp(`href="${route.replace('/', '\\/')}"`), `Main route ${route} must remain linked`);
}

const directoryRoutes = [...new Set([...directory.matchAll(/href="(\/[^"]*)"/g)].map(match => match[1]))].sort();
const expectedRoutes = [
  '/',
  '/about',
  '/careers',
  '/contact',
  '/cookie-policy',
  '/faq',
  '/news',
  '/our-story',
  '/privacy-policy',
  '/services',
  '/services/free-website',
  '/services/localization-and-translation',
  '/services/seo',
  '/services/website',
  '/services/website-development',
  '/team',
  '/terms',
  '/work'
].sort();
assert.deepEqual(directoryRoutes, expectedRoutes, 'The human sitemap must expose only the approved main-page routes');

console.log('Human sitemap rendering tests passed.');
