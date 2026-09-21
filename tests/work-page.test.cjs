'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');

test('Work page publishes the approved English-only client journey', () => {
  const html = read('work.html');
  assert.match(html, /<html lang="en" data-supported-languages="en">/);
  assert.match(html, /rel="canonical" href="https:\/\/www\.studio17\.world\/work"/);
  assert.equal((html.match(/<h1\b/g) || []).length, 1);
  assert.match(html, /<body class="work-page">/);
  assert.match(html, /href="\/work" aria-current="page">Work/);

  const order = ['work-hero', 'work-gallery', 'work-testimonials', 'work-trusted', 'work-faq', 'work-closing']
    .map(className => html.indexOf(className));
  assert.ok(order.every((position, index) => position >= 0 && (index === 0 || position > order[index - 1])), 'Work page sections must follow the approved order');

  assert.equal((html.match(/class="work-project-card/g) || []).length, 6);
  for (const client of ['100 Pratos', 'PHÓS Optics', 'Terrassi Villa', 'Nerouppos Barber Shop', 'RG Automotive', 'Teaching Economics']) assert.ok(html.includes(client), client);
  for (const label of ['Visit website', 'Read case study', 'View on Instagram', 'View video']) assert.ok(html.includes(label), label);
  assert.match(html, /href="https:\/\/www\.instagram\.com\/p\/DaPSeSJsA-o\/"[^>]*aria-label="View the Teaching Economics video on Instagram"/);
  assert.match(html, /Video production · Paid advertising · Business consulting/);
  assert.match(html, /href="\/case-studies\/nerouppos-barber-shop-google-reviews-nfc"[^>]*aria-label="Read the Nerouppos Barber Shop case study"/);
  assert.match(html, /src="Images\/NeuropposBarberShop\.webp"/);
  assert.equal((html.match(/class="work-quote-card/g) || []).length, 4);
  assert.match(html, /id="work-video-testimonial-template"[\s\S]*?<video controls/);
  assert.equal((html.match(/<details>/g) || []).length, 8);
  assert.equal((html.match(/class="website-faq-column"/g) || []).length, 2);
  assert.match(html, /Start a Project[\s\S]*?Talk to Sales/);
  assert.doesNotMatch(html, /wip#for=(?:work|testimonials|portfolio)/);
});

test('Work is routed from shared navigation and discovery surfaces', () => {
  const sitemap = read('api/sitemap.js');
  const sitemapPage = read('api/sitemap-template.html');
  const i18n = read('i18n.js');
  const english = JSON.parse(read('locales/en.json'));
  assert.match(sitemap, /`\$\{SITE_URL\}\/work`/);
  assert.match(sitemapPage, /href="\/work"[^>]*>Selected work/);
  assert.match(i18n, /'\/work': 'work\.html'/);
  assert.match(i18n, /classList\.contains\('work-page'\)[\s\S]*?'work'/);
  assert.ok(english.meta.work?.title);
  assert.ok(english.meta.work?.description);

  for (const file of fs.readdirSync(root).filter(file => file.endsWith('.html'))) {
    const html = read(file);
    const header = html.match(/<header class="site-header"[\s\S]*?<\/header>/)?.[0];
    if (!header) continue;
    assert.doesNotMatch(header, /wip#for=work/, `${file} still sends Work to WIP`);
    assert.match(header, /href="\/work"/, `${file} does not link to the Work page`);
  }
});

test('Work page styles preserve the shared surface and responsive layout', () => {
  const css = read('styles.css');
  const script = read('script.js');
  assert.match(css, /\.work-page,[\s\S]*?background: var\(--paper\)/);
  assert.match(css, /\.work-main > section:not\(\.page-hero\) \{ margin-top: 32px; padding-block: 24px;/);
  assert.match(css, /\.work-project-grid \{ display: grid; grid-template-columns: repeat\(2,minmax\(0,1fr\)\)/);
  assert.match(css, /@media \(max-width: 900px\)[\s\S]*?\.work-project-grid,[\s\S]*?grid-template-columns: 1fr/);
  assert.match(script, /querySelectorAll\('\.website-faq-column'\)[\s\S]*?details\[open\][\s\S]*?sibling\.open = false/);
});
