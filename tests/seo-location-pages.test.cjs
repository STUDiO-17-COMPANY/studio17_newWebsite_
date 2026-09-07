'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const pages = [
  { file: 'seo-cyprus.html', route: '/seo/cyprus', market: 'cyprus', areaType: 'Country', areaName: 'Cyprus' },
  { file: 'seo-limassol.html', route: '/seo/limassol', market: 'limassol', areaType: 'City', areaName: 'Limassol' }
];

const titles = new Set();
const descriptions = new Set();
const headings = new Set();

for (const page of pages) {
  const source = read(page.file);
  const title = source.match(/<title>([^<]+)<\/title>/)?.[1];
  const description = source.match(/<meta name="description" content="([^"]+)">/)?.[1];
  const h1Matches = [...source.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/g)];
  const canonical = `https://www.studio17.world${page.route}`;
  const structuredDataSource = source.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)?.[1];
  const structuredData = JSON.parse(structuredDataSource);

  assert.ok(title && description, `${page.file} requires a title and description`);
  assert.equal(h1Matches.length, 1, `${page.file} must have one H1`);
  assert.match(source, new RegExp(`<link rel="canonical" href="${canonical.replaceAll('/', '\\/')}"`));
  assert.equal((source.match(/hreflang=/g) || []).length, 4, `${page.file} must expose x-default, EN, EL and RU alternates`);
  assert.match(source, new RegExp(`href="\\/contact\\?service=seo&amp;market=${page.market}"`));
  assert.match(source, /Get Your Free SEO Analysis/);
  assert.match(source, /Talk to Sales/);
  assert.match(source, /href="\/services\/seo"/);
  assert.equal((source.match(/<details>/g) || []).length, 8, `${page.file} must contain eight decision FAQs`);
  assert.doesNotMatch(source, /aggregateRating|"review"\s*:/i, `${page.file} must not invent rating or review structured data`);
  assert.equal(structuredData['@type'], 'Service');
  assert.equal(structuredData.areaServed['@type'], page.areaType);
  assert.equal(structuredData.areaServed.name, page.areaName);

  titles.add(title);
  descriptions.add(description);
  headings.add(h1Matches[0][1].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim());
}

assert.equal(titles.size, pages.length, 'Location pages must have unique titles');
assert.equal(descriptions.size, pages.length, 'Location pages must have unique descriptions');
assert.equal(headings.size, pages.length, 'Location pages must have unique H1 copy');

const localeContext = { window: { Studio17ServiceLocaleData: {} } };
vm.createContext(localeContext);
vm.runInContext(read(path.join('service-locales', 'seo-locations.js')), localeContext);
for (const page of pages) {
  const pageKey = page.market === 'cyprus' ? 'seoCyprus' : 'seoLimassol';
  const serviceKeys = [...read(page.file).matchAll(/data-service-key="([^"]+)"/g)].map(match => match[1]);
  for (const locale of ['el', 'ru']) {
    const localizedPage = localeContext.window.Studio17ServiceLocaleData[locale]?.[pageKey];
    assert.ok(localizedPage, `${pageKey} must exist in ${locale}`);
    assert.deepEqual(serviceKeys.filter(key => !(key in localizedPage)), [], `${pageKey} has missing ${locale} regions`);
    assert.equal((localizedPage.faq.match(/<details>/g) || []).length, 8, `${pageKey} ${locale} must contain eight FAQs`);
  }
}

const sitemap = read(path.join('api', 'sitemap.js'));
assert.match(sitemap, /SITE_URL}\/seo\/cyprus/);
assert.match(sitemap, /SITE_URL}\/seo\/limassol/);

console.log('SEO location landing page tests passed.');
