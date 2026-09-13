'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const context = { window: { Studio17ServiceLocaleData: {} } };
vm.createContext(context);
vm.runInContext(read('service-locales/requested-translations.js'), context);
const store = context.window.Studio17ServiceLocaleData;

const targets = [
  { file: 'website-services.html', page: 'websiteServices', languages: ['he'], faq: 6 },
  { file: 'seo.html', page: 'seo', languages: ['pt-PT', 'es', 'he'], faq: 8 },
  { file: 'seo-cyprus.html', page: 'seoCyprus', languages: ['he'], faq: 8 },
  { file: 'seo-limassol.html', page: 'seoLimassol', languages: ['he'], faq: 8 }
];

for (const target of targets) {
  const html = read(target.file);
  const keys = [...html.matchAll(/data-service-key="([^"]+)"/g)].map(match => match[1]);
  assert.match(html, /requested-translations\.js/);
  for (const language of target.languages) {
    const page = store[language]?.[target.page];
    assert.ok(page, `${target.page} must exist in ${language}`);
    assert.deepEqual(keys.filter(key => !page[key]), [], `${target.page} has missing ${language} regions`);
    assert.ok(page.meta.title && page.meta.description, `${target.page} ${language} requires translated metadata`);
    assert.equal((page.faq.match(/<details>/g) || []).length, target.faq, `${target.page} ${language} FAQ count`);
    assert.doesNotMatch(JSON.stringify(page), /<svg\b/, `${target.page} ${language} must preserve reusable Lucide markup`);
    assert.match(JSON.stringify(page), /data-lucide/, `${target.page} ${language} must preserve Lucide icons`);
  }
}

assert.match(read('website-services.html'), /data-supported-languages="en,pt-PT,es,el,ru,he"/);
assert.match(read('seo.html'), /data-supported-languages="en,pt-PT,es,el,ru,he"/);
for (const file of ['seo-cyprus.html', 'seo-limassol.html']) assert.match(read(file), /data-supported-languages="en,el,ru,he"/);
assert.match(read('service-pages.js'), /he: \{ build: 'בניית אתר'/);
assert.match(read('service-pages.js'), /he: \{ label: 'עמודי SEO קשורים'/);

for (const language of ['pt-PT', 'es', 'he']) {
  assert.doesNotMatch(store[language].seo.meta.title, /Estúdio 17|Estudio 17|סטודיו 17/);
  assert.match(store[language].seo.meta.title, /Studio 17/);
}

console.log('Requested Website and SEO translation tests passed.');
