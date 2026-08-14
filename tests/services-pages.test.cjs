'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const jsonLd = html => html.split('<script type="application/ld+json">').slice(1).map(block => JSON.parse(block.split('</script>')[0]));

test('services catalogue exposes every service without internal codes', () => {
  const html = read('services.html');
  assert.match(html, /<link rel="canonical" href="https:\/\/www\.studio17\.world\/services"/);
  assert.equal((html.match(/class="service-row"/g) || []).length, 43);
  assert.equal((html.match(/class="service-category"/g) || []).length, 5);
  assert.doesNotMatch(html, /WEB-\d+/);
  assert.equal(jsonLd(html)[0]['@type'], 'CollectionPage');
  for (const count of ['8 services', '13 services', '11 services', '7 services', '4 services']) assert.match(html, new RegExp(count));
});

test('website development page preserves commercial and portfolio requirements', () => {
  const html = read('website-development.html');
  assert.match(html, /canonical" href="https:\/\/www\.studio17\.world\/services\/website-development"/);
  assert.equal((html.match(/class="website-package-card(?: [^"]*)?"/g) || []).length, 5);
  for (const price of ['450,00 €', '950,00 €', '1&nbsp;500,00 €', '2&nbsp;250,00 €', '3&nbsp;500,00 €']) assert.ok(html.includes(price), price);
  assert.match(html, /website-package-card is-popular[\s\S]*Most bought[\s\S]*Website – Starter/);
  for (const term of ['SEO foundation', 'GEO foundation', 'Technical SEO']) assert.ok(html.includes(term), term);
  for (const asset of ['/Images/100pratos_website.png', '/Images/phosoptics_website.png', '/Images/terrassivilla.jpg']) assert.ok(html.includes(asset), asset);
  assert.ok(html.includes('https://www.100pratos.pt/'));
  assert.ok(html.includes('https://www.phosoptics.com/en'));
  assert.ok(html.includes('/insights/terrassivilla-accessible-tourism-in-the-azores'));
  const structured = jsonLd(html)[0];
  assert.equal(structured['@type'], 'Service');
  assert.equal(structured.hasOfferCatalog.itemListElement.length, 5);
});

test('all service locales preserve the page schema and content counts', () => {
  const locales = ['pt-PT', 'es', 'el', 'ru', 'he'];
  const reference = require(path.join(root, 'service-locales', 'pt-PT.json'));
  for (const locale of locales) {
    const data = require(path.join(root, 'service-locales', `${locale}.json`));
    assert.deepEqual(Object.keys(data.pages.services), Object.keys(reference.pages.services), locale);
    assert.deepEqual(Object.keys(data.pages.websiteDevelopment), Object.keys(reference.pages.websiteDevelopment), locale);
    assert.equal((data.pages.services.catalogue.match(/service-row/g) || []).length, 43, locale);
    assert.equal((data.pages.websiteDevelopment.packages.match(/website-package-card/g) || []).length, 5, locale);
    assert.doesNotMatch(data.pages.services.catalogue, /WEB-\d+/, locale);
  }
});

test('clean routes and sitemaps include both service pages', () => {
  const server = read('dev-server.cjs');
  const vercel = read('vercel.json');
  const sitemap = read('api/sitemap.js');
  assert.ok(server.includes("['/services', 'services.html']"));
  assert.ok(server.includes("['/services/website-development', 'website-development.html']"));
  assert.ok(vercel.includes('"source": "/services/website-development"'));
  assert.ok(sitemap.includes('`${SITE_URL}/services`'));
  assert.ok(sitemap.includes('`${SITE_URL}/services/website-development`'));
});

test('mobile menu remains limited to the approved five destinations', () => {
  for (const file of ['services.html', 'website-development.html']) {
    const html = read(file);
    const menu = html.match(/<div class="mobile-menu"[\s\S]*?<\/div>\s*<\/header>/)?.[0] || '';
    assert.equal((menu.match(/<a /g) || []).length, 5, file);
    for (const label of ['Services', 'Work', 'About', 'News', 'Careers']) assert.ok(menu.includes(`>${label}</a>`), `${file}: ${label}`);
    assert.ok(menu.includes('href="/services"'));
    assert.doesNotMatch(menu, /Sitemap|FAQ/);
  }
});
