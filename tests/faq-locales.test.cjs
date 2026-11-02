'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const languages = ['en', 'pt-PT', 'es', 'el', 'ru', 'he'];
const htmlFiles = ['home.template.html', 'api/sitemap-template.html', 'wip.html', 'contact.html', 'faq.html', 'about.html', 'team.html', 'our-story.html', 'work.html', 'services.html', 'website-development.html', 'free-website.html', 'seo.html', 'news.template.html', 'careers.html', 'career-role.html'];
const faq = fs.readFileSync(path.join(root, 'faq.html'), 'utf8');

const { parseHTML } = require('linkedom');
const { document } = parseHTML(faq);
assert.equal(document.querySelectorAll('.faq-item').length, 10);
assert.equal(document.documentElement.dataset.supportedLanguages, 'en');
assert.equal(document.querySelector('link[rel="canonical"]').href, 'https://www.studio17.world/faq');
assert.equal(document.querySelectorAll('[hreflang]').length, 0);
assert.doesNotMatch(faq, /FAQPage/);
assert.equal(JSON.parse(document.querySelector('script[type="application/ld+json"]').textContent)['@type'], 'BreadcrumbList');
const { localesForPath } = require('../server/_language-routing');
assert.deepEqual(localesForPath('/faq'), ['en']);

for (const language of languages) {
  const data = JSON.parse(fs.readFileSync(path.join(root, 'locales', `${language}.json`), 'utf8'));
  assert.ok(data.meta.faq?.title, `${language} is missing the FAQ title`);
  assert.ok(data.meta.faq?.description, `${language} is missing the FAQ description`);
  if (language === 'en') continue;
  assert.ok(data.strings.FAQs, `${language} is missing the mobile/footer FAQ label`);

}

for (const file of htmlFiles) {
  const source = fs.readFileSync(path.join(root, file), 'utf8');
  const mobileMenu = source.match(/<div class="mobile-menu"[\s\S]*?<\/header>/)?.[0] || '';
  assert.ok(mobileMenu, `${file} is missing its mobile menu`);
  const mobileLinks = [...mobileMenu.matchAll(/href="([^"]+)"/g)].map(match => match[1]);
  assert.deepEqual(mobileLinks, [
    '/services',
    '/work',
    '/about',
    '/news',
    '/careers',
    '/contact'
  ], `${file} mobile navigation must contain only the six approved links in the approved order`);
  assert.doesNotMatch(source, /href="\/wip#for=faqs"/, `${file} still sends FAQs to WIP`);
}

const i18n = fs.readFileSync(path.join(root, 'i18n.js'), 'utf8');
assert.match(i18n, /classList\.contains\('faq-page'\)/);
assert.match(i18n, /'\/faq': 'faq\.html'/);

const bundle = fs.readFileSync(path.join(root, 'locales', 'locales.js'), 'utf8');
assert.match(bundle, /"faq":\s*\{/);

console.log('FAQ locale and mobile navigation tests passed.');
