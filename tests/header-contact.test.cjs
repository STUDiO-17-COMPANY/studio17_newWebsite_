'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const root = path.resolve(__dirname, '..');
const sourcePages = [
  'about.html',
  'api/sitemap-template.html',
  'article.html',
  'career-role.html',
  'careers.html',
  'contact.html',
  'cookie-policy.html',
  'faq.html',
  'free-website.html',
  'home.template.html',
  'localization-and-translation.html',
  'news.template.html',
  'our-story.html',
  'privacy-policy.html',
  'seo-cyprus.html',
  'seo-limassol.html',
  'seo.html',
  'services.html',
  'social-media-pricing.html',
  'social-media.html',
  'team.html',
  'terms.html',
  'website-development.html',
  'website-pricing.html',
  'website-services.html',
  'wip.html',
  'work.html'
];

const read = relative => fs.readFileSync(path.join(root, relative), 'utf8');
const header = relative => read(relative).match(/<header class="site-header"[\s\S]*?<\/header>/)?.[0] || '';

test('every source header exposes Contact on desktop and mobile', () => {
  for (const file of sourcePages) {
    const markup = header(file);
    assert.ok(markup, `${file}: header`);
    assert.equal((markup.match(/class="nav-link header-contact-button" href="\/contact"/g) || []).length, 1, `${file}: desktop Contact`);
    assert.equal((markup.match(/class="mobile-contact-button" href="\/contact"/g) || []).length, 1, `${file}: mobile Contact`);
  }
});

test('the Contact page identifies the new navigation actions as current', () => {
  const markup = header('contact.html');
  assert.match(markup, /class="nav-link header-contact-button" href="\/contact" aria-current="page">Contact<\/a>/);
  assert.match(markup, /class="mobile-contact-button" href="\/contact" aria-current="page">Contact<\/a>/);
});

test('generated translated headers retain translated, localized Contact actions', () => {
  const expectations = [
    ['pt', 'Contacto'],
    ['es', 'Contacto'],
    ['el', 'Επικοινωνία'],
    ['ru', 'Контакты'],
    ['he', 'יצירת קשר']
  ];
  for (const [prefix, label] of expectations) {
    const markup = read(path.join('_localized', prefix, 'contact.html')).match(/<header class="site-header"[\s\S]*?<\/header>/)?.[0] || '';
    assert.match(markup, new RegExp(`class="nav-link header-contact-button" href="/${prefix}/contact" aria-current="page">${label}<\\/a>`), `${prefix}: desktop`);
    assert.match(markup, new RegExp(`class="mobile-contact-button" href="/${prefix}/contact" aria-current="page">${label}<\\/a>`), `${prefix}: mobile`);
  }
});
