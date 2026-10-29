'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { parseHTML } = require('linkedom');

const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const home = parseHTML(read('home.template.html')).document;
const audit = parseHTML(read('audit-contact.html')).document;
const config = JSON.parse(read('vercel.json'));
const styles = read('styles.css');
const heroScript = read('homepage-audit.js');

const hero = home.querySelector('.home-conversion-hero');
assert.ok(hero, 'conversion hero should exist');
assert.equal(hero.querySelector('.media-play'), null, 'legacy play control must be removed');
assert.equal(hero.querySelector('.hero-media img')?.getAttribute('src'), '/Images/New_HomePage_heroimage.avif');
assert.equal(hero.querySelector('.hero-media source[media="(max-width: 600px)"]')?.getAttribute('srcset'), '/Images/New_Phone_HomePage_heroimage.avif');
assert.match(hero.querySelector('.hero-media img')?.getAttribute('alt') || '', /international marketing agency and web development agency/i);
assert.match(hero.querySelector('h1')?.textContent || '', /Grow your brand & revenue with smarter digital marketing/i);
assert.ok(hero.querySelector('[data-hero-word="title"]'));
assert.ok(hero.querySelector('[data-hero-word="body"]'));
assert.ok(hero.querySelector('[data-hero-audit-form]'));
assert.equal(hero.querySelectorAll('[data-audit-type]').length, 2);
assert.ok(home.querySelector('script[src="homepage-audit.js"]'));
assert.match(styles, /\.home-conversion-hero \.hero-media::after \{ background: transparent; \}/);
assert.doesNotMatch(styles, /(?:\.hero|\.page-hero|\.article-hero):hover \.hero-media img/);
assert.doesNotMatch(heroScript, /is-changing/);
assert.match(styles, /html\[lang\]:not\(\[lang="en"\]\) \.home-conversion-hero,[\s\S]*height: 500px;/);
assert.match(styles, /html\[lang="he"\] \.home-conversion-hero \.home-hero-grid \{[\s\S]*direction: ltr;/);
assert.match(styles, /html\[lang="he"\] \.home-hero-content \{[\s\S]*direction: rtl;[\s\S]*text-align: right;/);

for (const selector of ['[name="firstName"]', '[name="lastName"]', '[name="email"]', '[name="company"]', '[name="auditTarget"]', '[name="countryCode"]', '[name="phoneNumber"]', '[name="comments"]']) {
  assert.ok(audit.querySelector(selector), `audit page is missing ${selector}`);
}
assert.ok(audit.querySelector('[data-audit-contact-form]'));
assert.ok(audit.querySelector('script[src="/audit-contact.js"]'));
assert.ok(audit.querySelector('script[src="/article-feed.js"]'));
assert.equal(audit.querySelectorAll('.site-footer .footer-column').length, 4);
assert.ok(audit.querySelector('[data-article-feed="home"]'));
assert.ok(audit.querySelector('.audit-next-steps'));

const rewriteMap = new Map(config.rewrites.map(rule => [rule.source, rule.destination]));
assert.equal(rewriteMap.get('/contact/free-website-audit'), '/api/home-page?view=audit&type=website');
assert.equal(rewriteMap.get('/contact/free-social-media-audit'), '/api/home-page?view=audit&type=social-media');

const expectedAlt = {
  pt: 'A Studio 17 é uma agência internacional',
  es: 'Studio 17 es una agencia internacional',
  el: 'Η Studio 17 είναι μια διεθνής',
  ru: 'Studio 17 — международное агентство',
  he: 'Studio 17 היא סוכנות בינלאומית'
};
for (const [prefix, phrase] of Object.entries(expectedAlt)) {
  const localized = parseHTML(read(`_localized/${prefix}/home.template.html`)).document;
  assert.match(localized.querySelector('.home-conversion-hero .hero-media img')?.getAttribute('alt') || '', new RegExp(phrase));
  assert.ok(localized.querySelector('[data-hero-audit-form]'));
}

console.log('Homepage audit journey tests passed.');
