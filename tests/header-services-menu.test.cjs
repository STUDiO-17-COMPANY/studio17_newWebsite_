'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const script = fs.readFileSync(path.join(root, 'script.js'), 'utf8');
const css = fs.readFileSync(path.join(root, 'styles.css'), 'utf8');
const menu = script.match(/const servicesMegaMenu = \[[\s\S]*?\n  \];/)?.[0] || '';

assert.ok(menu, 'shared Services mega-menu configuration is missing');
assert.doesNotMatch(menu, /All services/i);

const groups = ['Social Media', 'Website', 'Content creation', 'Advertisement', 'By Industry', 'Events'];
let previous = -1;
for (const group of groups) {
  const position = menu.indexOf(`label: '${group}'`);
  assert.ok(position > previous, `${group} is missing or out of order`);
  previous = position;
}

const requiredDestinations = [
  '/services/website-development',
  '/wip?for=social-media-management', '/wip?for=social-media-automation', '/wip?for=growth-strategy', '/wip?for=community-management',
  '/wip?for=website-revamp', '/wip?for=seo', '/wip?for=geo', '/wip?for=copywriting', '/wip?for=localization-and-translation', '/wip?for=maintenance',
  '/wip?for=filming', '/wip?for=photography', '/wip?for=video-editing', '/wip?for=graphic-design', '/wip?for=digital-design', '/wip?for=scripting', '/wip?for=ai-generation',
  '/wip?for=meta-ads', '/wip?for=google-ads', '/wip?for=social-media-ads', '/wip?for=influencer-ads', '/wip?for=ugc-creators', '/wip?for=email-ads',
  '/wip?for=automotive', '/wip?for=restaurants', '/wip?for=health-care', '/wip?for=ecommerce', '/wip?for=individual-influencers', '/wip?for=education', '/wip?for=local-business', '/wip?for=smes',
  '/wip?for=presential-events', '/wip?for=online-events'
];
for (const destination of requiredDestinations) assert.ok(menu.includes(destination), destination);

assert.match(css, /\.services-mega-menu\s*\{[^}]*grid-template-columns:\s*repeat\(6,minmax\(0,1fr\)\)/);
assert.match(css, /\.dropdown-panel\s*\{[^}]*width:\s*min\(1360px,calc\(100vw - 48px\)\)/);
assert.match(script, /studio17:languagechange[\s\S]*?updateServicesMegaMenu\(\)/);
assert.match(script, /const updateMobileServicesMenu = \(\) =>/);
assert.match(script, /mobile-services-toggle/);
assert.match(script, /mobile-services-category/);
assert.match(script, /updateMobileServicesMenu\(\);/);
assert.match(script, /studio17:languagechange[\s\S]*?updateMobileServicesMenu\(\)/);
assert.match(script, /closeMobileMenu[\s\S]*?closeMobileServicesDirectory\(\)/);
assert.match(css, /\.mobile-services-primary-row\s*\{[^}]*grid-template-columns:\s*minmax\(0,1fr\) 54px/);
assert.match(css, /\.mobile-services-panel\[hidden\], \.mobile-services-list\[hidden\]/);
assert.match(css, /html\[dir="rtl"\] \.mobile-services-toggle/);

for (const locale of ['pt-PT', 'es', 'el', 'ru', 'he']) {
  const data = JSON.parse(fs.readFileSync(path.join(root, 'locales', `${locale}.json`), 'utf8'));
  for (const key of ['Show services', 'Hide services']) {
    assert.ok(data.strings[key], `${locale} is missing mobile services translation: ${key}`);
  }
  for (const key of ['Copywriting', 'Filming', 'Photography', 'Video editing', 'Graphic design', 'Digital design', 'AI generation', 'Meta ads', 'Google ads', 'Influencer ads', 'SMEs', 'Events', 'Presential Events', 'Online Events', 'Health care', 'Local Business']) {
    assert.ok(data.strings[key], `${locale} is missing mega-menu translation: ${key}`);
  }
}

const wip = fs.readFileSync(path.join(root, 'wip.js'), 'utf8');
for (const destination of requiredDestinations.filter(value => value.startsWith('/wip?for='))) {
  const key = destination.split('=')[1];
  assert.ok(wip.includes(`'${key}'`) || wip.includes(`${key}:`), `WIP label mapping missing for ${key}`);
}

console.log('Responsive Services menu tests passed.');
