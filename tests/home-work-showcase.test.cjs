'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');

test('homepage replaces the former AI block with selected client work', () => {
  const html = read('index.html');
  assert.doesNotMatch(html, /class="ai-section"|AI helps your business to respond faster/);
  assert.match(html, /class="website-work home-work-showcase"/);
  assert.match(html, /<span>Selected client work<\/span> in web development and marketing\./);
  assert.match(html, /automotive marketing, social media promotion and design/);

  const showcase = html.match(/<section class="website-work home-work-showcase"[\s\S]*?<\/section>/)?.[0] || '';
  assert.equal((showcase.match(/class="website-project-card(?: [^"]*)?"/g) || []).length, 4);
  for (const asset of ['/Images/100pratos_website.png', '/Images/phosoptics_website.png', '/Images/terrassivilla.jpg', '/Images/rg-automotive-work.jpg']) assert.ok(showcase.includes(asset), asset);
  for (const project of ['100 Pratos', 'PHÓS Optics', 'Terrassi Villa', 'RG Automotive']) assert.ok(showcase.includes(project), project);
  assert.ok(showcase.includes('https://www.instagram.com/rgautomotive.stand/'));

  const order = ['services-section', 'home-work-showcase', 'news-section'].map(className => html.indexOf(className));
  assert.ok(order.every((position, index) => position >= 0 && (index === 0 || position > order[index - 1])));
});

test('homepage work showcase uses the shared six-language contract', () => {
  const html = read('index.html');
  assert.doesNotMatch(html, /service-locales\/locales\.js|home-work\.js|data-home-work-key/);

  for (const locale of ['pt-PT', 'es', 'el', 'ru', 'he']) {
    const generic = require(path.join(root, 'locales', `${locale}.json`));
    assert.ok(generic.strings['Selected client work'], locale);
    assert.ok(generic.strings['Automotive marketing · Social media and design'], locale);
    assert.ok(generic.strings['View on Instagram'], locale);
    assert.ok(generic.strings['Explore website development'], locale);
  }
});

test('obsolete AI section styles are removed', () => {
  const css = read('styles.css');
  assert.doesNotMatch(css, /\.ai-section|\.ai-grid|\.ai-card|\.ai-heading|\.ai-button/);
});
