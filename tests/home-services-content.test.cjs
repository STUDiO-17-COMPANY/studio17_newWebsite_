'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const expectedItems = [
  'socialManagement', 'socialAutomation', 'growthStrategy', 'communityManagement', 'freeAudit',
  'websiteDevelopment', 'websiteRevamp', 'websiteDesign', 'seo', 'geo', 'copywriting', 'localization', 'maintenance', 'freeWebsite',
  'filming', 'photography', 'videoEditing', 'graphicDesign', 'digitalDesign', 'scripting', 'aiGeneration',
  'metaAds', 'googleAds', 'socialAds', 'influencerAds', 'ugcCreators', 'emailAds',
  'automotive', 'restaurants', 'health', 'ecommerce', 'influencers', 'education', 'local', 'smes',
  'presentialEvents', 'onlineEvents'
];

const readEnglishServices = () => {
  const script = read('script.js');
  const match = script.match(/const englishServices = (\{[\s\S]*?\n  \});\n\n  const serviceFeature/);
  assert.ok(match, 'English service content object should remain statically testable');
  return Function(`"use strict"; return (${match[1]});`)();
};

test('every homepage service selector item has distinct sales content', () => {
  const services = readEnglishServices();
  assert.deepEqual(expectedItems.filter(key => !(key in services.descriptions)), []);
  assert.equal(new Set(expectedItems.map(key => services.descriptions[key])).size, expectedItems.length);
  for (const key of expectedItems) {
    const description = services.descriptions[key];
    assert.ok(description.length >= 95, `${key} should provide a concrete offer description`);
  }
  assert.deepEqual(expectedItems.filter(key => !(key in services.outcomes)), []);
  assert.equal(new Set(expectedItems.map(key => services.outcomes[key])).size, expectedItems.length);
  for (const key of expectedItems) {
    const outcome = services.outcomes[key];
    assert.ok(outcome.length >= 65, `${key} should provide a service-specific outcome`);
  }
  assert.deepEqual(Object.keys(services.templates), ['industry', 'website', 'content', 'social', 'ads', 'events']);
  for (const template of Object.values(services.templates)) {
    assert.ok(template.title.includes('{item}'));
    assert.ok(template.result.length >= 70);
  }
});

test('all public locales retain complete translated service content', () => {
  for (const locale of ['en', 'pt-PT', 'es', 'el', 'ru', 'he']) {
    const services = require(path.join(root, 'locales', `${locale}.json`)).services;
    assert.ok(services.controls.category, `${locale}: mobile category label`);
    assert.ok(services.controls.item, `${locale}: mobile item label`);
    assert.ok(Object.keys(services.descriptions).length >= 33, locale);
    assert.ok(Object.keys(services.outcomes).length >= 33, `${locale}: outcomes`);
  }
});

test('mobile service discovery uses two synchronized selects instead of a wall of buttons', () => {
  const html = read('home.template.html');
  const css = read('styles.css');
  const script = read('script.js');
  assert.match(html, /class="service-mobile-selector"/);
  assert.match(html, /data-service-category-select/);
  assert.match(html, /data-service-item-select/);
  assert.match(html, /data-lucide="chevron-down"/);
  assert.match(css, /\.service-mobile-selector \{ display: none; \}/);
  assert.match(css, /@media \(max-width: 600px\)[\s\S]*\.service-mobile-selector \{ display: grid;/);
  assert.match(css, /\.service-tabs, \.industry-list \{ display: none; \}/);
  assert.match(script, /serviceCategorySelect\?\.addEventListener\('change'/);
  assert.match(script, /serviceItemSelect\?\.addEventListener\('change'/);
  assert.match(script, /serviceItemSelect\.replaceChildren/);
  assert.match(script, /serviceCategorySelect\.value = category/);
});

test('selector rendering prioritizes item-specific descriptions and verified proof', () => {
  const script = read('script.js');
  assert.match(script, /getLanguage\?\.\(\) === 'en'[\s\S]*\? englishServices/);
  assert.match(script, /locale\.descriptions\?\.\[item\] \|\| englishServices\.descriptions\[item\]/);
  assert.match(script, /locale\.outcomes\?\.\[item\] \|\| englishServices\.outcomes\[item\]/);
  assert.match(script, /body: featured\?\.body \|\| description/);
  assert.match(script, /result: featured\?\.result \|\| outcome/);
  assert.match(script, /One dealership client grew from selling up to 4 cars per month to more than 10 cars per month/);
});
