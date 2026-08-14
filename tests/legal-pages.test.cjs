'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const pages = {
  privacy: { file: 'privacy-policy.html', route: '/privacy-policy', sections: 8 },
  cookies: { file: 'cookie-policy.html', route: '/cookie-policy', sections: 6 },
  terms: { file: 'terms.html', route: '/terms', sections: 10 }
};
const languages = ['pt-PT', 'es', 'el', 'ru', 'he'];

for (const [page, contract] of Object.entries(pages)) {
  const source = fs.readFileSync(path.join(root, contract.file), 'utf8');
  assert.match(source, new RegExp(`data-legal-page="${page}"`));
  assert.match(source, new RegExp(`rel="canonical" href="https://www\\.studio17\\.world${contract.route}"`));
  for (const language of ['en', ...languages]) assert.match(source, new RegExp(`hreflang="${language}"`));
  assert.match(source, /legal-locales\/locales\.js/);
  assert.match(source, /src="legal\.js"/);
  assert.match(source, /datetime="2026-08-14"/);
  assert.doesNotMatch(source, /href="[^"]+\.html(?:[?#"])/i);

  const menu = source.match(/<div class="mobile-menu"[\s\S]*?<\/div>/)?.[0] || '';
  assert.equal((menu.match(/<a /g) || []).length, 5, `${contract.file} mobile menu must keep exactly five links`);
  assert.doesNotMatch(menu, /privacy-policy|cookie-policy|\/terms|\/faq|\/sitemap/);
}

const privacy = fs.readFileSync(path.join(root, pages.privacy.file), 'utf8');
assert.match(privacy, /H&amp;P DOMUS CREATIVE LTD/);
assert.match(privacy, /HE 493285/);
assert.match(privacy, /Vercel[\s\S]*Resend[\s\S]*Google Analytics[\s\S]*Google Workspace/);
assert.match(privacy, /commissioner@dataprotection\.gov\.cy/);

const cookies = fs.readFileSync(path.join(root, pages.cookies.file), 'utf8');
assert.match(cookies, /studio17-language/);
assert.match(cookies, /studio17-analytics-consent-v1/);
assert.match(cookies, /_ga_GVWS39DSNX/);
assert.match(cookies, /G-GVWS39DSNX/);
assert.match(cookies, /data-open-analytics-settings/);

for (const language of languages) {
  const locale = JSON.parse(fs.readFileSync(path.join(root, 'legal-locales', `${language}.json`), 'utf8'));
  assert.equal(locale.locale, language);
  for (const page of Object.keys(pages)) {
    assert.deepEqual(Object.keys(locale.pages[page]), Object.keys(JSON.parse(fs.readFileSync(path.join(root, 'legal-locales', 'pt-PT.json'), 'utf8')).pages[page]));
    for (const [key, value] of Object.entries(locale.pages[page])) {
      assert.ok(typeof value === 'string' || (key === 'meta' && value.title && value.description), `${language}.${page}.${key} must be complete`);
    }
  }
}

const script = fs.readFileSync(path.join(root, 'script.js'), 'utf8');
assert.match(script, /data-footer-legal/);
assert.match(script, /footer-grid > \.footer-column:last-child/);
assert.doesNotMatch(script, /footer-column\[aria-label="Company"\]/);
for (const route of Object.values(pages).map(page => page.route)) assert.match(script, new RegExp(route));

const legalScript = fs.readFileSync(path.join(root, 'legal.js'), 'utf8');
assert.match(legalScript, /studio17:languagechange/);
assert.match(legalScript, /openSettings/);
assert.match(legalScript, /updateMetadata/);

const i18n = fs.readFileSync(path.join(root, 'i18n.js'), 'utf8');
assert.match(i18n, /\[data-legal-key\]/, 'The generic translator must leave legal content to legal.js');
for (const language of languages) {
  const globalLocale = JSON.parse(fs.readFileSync(path.join(root, 'locales', `${language}.json`), 'utf8'));
  for (const label of ['Privacy policy contents', 'Cookie policy contents', 'Terms and conditions contents']) {
    assert.ok(globalLocale.strings[label], `${language} is missing the accessible legal contents label`);
  }
}

const sitemap = fs.readFileSync(path.join(root, 'sitemap.html'), 'utf8');
assert.doesNotMatch(sitemap, /wip\?for=(?:privacy|cookies|terms)/);
for (const route of Object.values(pages).map(page => page.route)) assert.match(sitemap, new RegExp(`href="${route}"`));

const developmentServer = fs.readFileSync(path.join(root, 'dev-server.cjs'), 'utf8');
for (const contract of Object.values(pages)) {
  assert.match(developmentServer, new RegExp(`\\['${contract.route}', '${contract.file.replace('.', '\\.')}']`));
}

console.log('Legal page tests passed.');
