'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const languages = ['en', 'pt-PT', 'es', 'el', 'ru', 'he'];
const htmlFiles = ['index.html', 'sitemap.html', 'wip.html', 'contact.html', 'faq.html', 'about.html', 'careers.html', 'career-role.html'];
const faq = fs.readFileSync(path.join(root, 'faq.html'), 'utf8');

const questions = [...faq.matchAll(/<summary><span>([^<]+)<\/span>/g)].map(match => match[1]);
const answers = [...faq.matchAll(/<div class="faq-answer"><p>([^<]+)<\/p><\/div>/g)].map(match => match[1]);

assert.equal(questions.length, 20, 'FAQ should contain 20 search-oriented questions');
assert.equal(answers.length, 20, 'every FAQ question should have one answer');
assert.match(faq, /<body class="faq-page">/);
assert.match(faq, /rel="canonical" href="https:\/\/www\.studio17\.world\/faq"/);
assert.match(faq, /hreflang="he" href="https:\/\/www\.studio17\.world\/faq\?lang=he"/);
assert.doesNotMatch(faq, /FAQPage|application\/ld\+json/, 'ineligible FAQ rich-result markup should not be added');

for (const language of languages) {
  const data = JSON.parse(fs.readFileSync(path.join(root, 'locales', `${language}.json`), 'utf8'));
  assert.ok(data.meta.faq?.title, `${language} is missing the FAQ title`);
  assert.ok(data.meta.faq?.description, `${language} is missing the FAQ description`);
  if (language === 'en') continue;
  assert.ok(data.strings.FAQs, `${language} is missing the mobile/footer FAQ label`);
  for (const key of [...questions, ...answers]) {
    assert.ok(data.strings[key], `${language} is missing FAQ translation: ${key}`);
  }
}

for (const file of htmlFiles) {
  const source = fs.readFileSync(path.join(root, file), 'utf8');
  const mobileMenu = source.match(/<div class="mobile-menu"[\s\S]*?<\/header>/)?.[0] || '';
  assert.ok(mobileMenu, `${file} is missing its mobile menu`);
  const mobileLinks = [...mobileMenu.matchAll(/href="([^"]+)"/g)].map(match => match[1]);
  assert.deepEqual(mobileLinks, [
    '/wip?for=services',
    '/wip?for=work',
    '/about',
    '/wip?for=news',
    '/careers'
  ], `${file} mobile navigation must contain only the five approved links in the approved order`);
  assert.doesNotMatch(source, /href="\/wip\?for=faqs"/, `${file} still sends FAQs to WIP`);
}

const i18n = fs.readFileSync(path.join(root, 'i18n.js'), 'utf8');
assert.match(i18n, /classList\.contains\('faq-page'\)/);
assert.match(i18n, /'\/faq': 'faq\.html'/);

const bundle = fs.readFileSync(path.join(root, 'locales', 'locales.js'), 'utf8');
assert.match(bundle, /"faq":\s*\{/);

console.log('FAQ locale and mobile navigation tests passed.');
