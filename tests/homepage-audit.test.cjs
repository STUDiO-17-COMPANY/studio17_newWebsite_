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

const hero = home.querySelector('.home-conversion-hero');
assert.ok(hero, 'conversion hero should exist');
assert.equal(hero.querySelector('.media-play'), null, 'legacy play control must be removed');
assert.equal(hero.querySelector('.hero-media img')?.getAttribute('src'), 'Images/HomePage_heroimage.avif');
assert.match(hero.querySelector('.hero-media img')?.getAttribute('alt') || '', /international marketing agency and web development agency/i);
assert.match(hero.querySelector('h1')?.textContent || '', /Grow your brand & revenue with smarter digital marketing/i);
assert.ok(hero.querySelector('[data-hero-word="title"]'));
assert.ok(hero.querySelector('[data-hero-word="copy"]'));
assert.ok(hero.querySelector('[data-hero-audit-form]'));
assert.equal(hero.querySelectorAll('[data-audit-type]').length, 2);
assert.ok(home.querySelector('script[src="homepage-audit.js"]'));

for (const selector of ['[name="firstName"]', '[name="lastName"]', '[name="email"]', '[name="company"]', '[name="auditTarget"]', '[name="countryCode"]', '[name="phoneNumber"]', '[name="comments"]']) {
  assert.ok(audit.querySelector(selector), `audit page is missing ${selector}`);
}
assert.ok(audit.querySelector('[data-audit-contact-form]'));
assert.ok(audit.querySelector('script[src="/audit-contact.js"]'));

const rewriteMap = new Map(config.rewrites.map(rule => [rule.source, rule.destination]));
assert.equal(rewriteMap.get('/contact/free-website-audit'), '/audit-contact');
assert.equal(rewriteMap.get('/contact/free-social-media-audit'), '/audit-contact');

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
