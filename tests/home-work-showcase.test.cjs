'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');

test('homepage replaces the former AI block with selected client work', () => {
const html = read('home.template.html');
  assert.doesNotMatch(html, /class="ai-section"|AI helps your business to respond faster/);
  assert.match(html, /class="website-work home-work-showcase"/);
  assert.match(html, /<span>Selected client work<\/span> in web development and marketing<\/h2>/);
  assert.match(html, /automotive marketing, social media promotion and design/);

  const showcase = html.match(/<section class="website-work home-work-showcase"[\s\S]*?<\/section>/)?.[0] || '';
  assert.equal((showcase.match(/class="website-project-card(?: [^"]*)?"/g) || []).length, 4);
  for (const asset of ['/Images/Terrassivilla_Image_Showcase_General-compressed.avif', '/Images/phosoptics_website.png', '/Images/farmacialourel_client-compressed.avif', '/Images/NeuropposBarberShop.webp']) assert.ok(showcase.includes(asset), asset);
  for (const project of ['Terrassi Villa', 'PHÓS Optics', 'Farmácia do Lourel', 'Nerouppos Barber Shop']) assert.ok(showcase.includes(project), project);
  assert.doesNotMatch(showcase, /100 Pratos|RG Automotive/);
  const projectOrder = ['Terrassi Villa', 'PHÓS Optics', 'Farmácia do Lourel', 'Nerouppos Barber Shop'].map(project => showcase.indexOf(project));
  assert.ok(projectOrder.every((position, index) => position >= 0 && (index === 0 || position > projectOrder[index - 1])));
  assert.match(showcase, /href="\/case-studies\/terrassi-villa-accessible-hospitality-website-case-study"[^>]*aria-label="Read the Terrassi Villa case study"/);
  assert.match(showcase, />Read case study <i data-lucide="arrow-up-right"/);
  assert.doesNotMatch(showcase, /terrassivilla-accessible-tourism-in-the-azores|Read the project article/);
  const farmaciaCard = showcase.slice(showcase.indexOf('<h3>Farmácia do Lourel</h3>') - 500, showcase.indexOf('</article>', showcase.indexOf('<h3>Farmácia do Lourel</h3>')));
  assert.match(farmaciaCard, /Farmácia do Lourel[\s\S]*?Case study coming soon/);
  assert.doesNotMatch(farmaciaCard, /href=/);
  assert.match(showcase, /href="\/case-studies\/nerouppos-barber-shop-google-reviews-nfc"/);
  assert.match(showcase, /href="\/work#selected-work"[^>]*>See more of our work/);

  const order = ['services-section', 'home-work-showcase', 'news-section'].map(className => html.indexOf(className));
  assert.ok(order.every((position, index) => position >= 0 && (index === 0 || position > order[index - 1])));
});

test('homepage work showcase uses the shared six-language contract', () => {
  const html = read('home.template.html');
  assert.doesNotMatch(html, /service-locales\/locales\.js|home-work\.js|data-home-work-key/);

  for (const locale of ['pt-PT', 'es', 'el', 'ru', 'he']) {
    const generic = require(path.join(root, 'locales', `${locale}.json`));
    assert.ok(generic.strings['Selected client work'], locale);
    assert.ok(generic.strings['Automotive marketing · Social media and design'], locale);
    assert.ok(generic.strings['View on Instagram'], locale);
    assert.ok(generic.strings['See more of our work'], locale);
    assert.ok(generic.strings['Read case study'], locale);
    assert.ok(generic.strings['Read the Terrassi Villa case study'], locale);
    assert.ok(generic.strings['Business account recovery · Cybersecurity'], locale);
    assert.ok(generic.strings['Case study coming soon'], locale);
    assert.ok(generic.strings['Urgent recovery and protection of compromised business accounts after a cyberattack, securing access and restoring critical digital information.'], locale);
  }
});

test('obsolete AI section styles are removed', () => {
  const css = read('styles.css');
  assert.match(css, /\.home-work-showcase \.website-project-card \{ background: transparent; \}/);
  assert.match(css, /\.home-work-showcase \+ \.news-section \{ margin-top: 0; \}/);
  assert.doesNotMatch(css, /\.ai-section|\.ai-grid|\.ai-card|\.ai-heading|\.ai-button/);
});
