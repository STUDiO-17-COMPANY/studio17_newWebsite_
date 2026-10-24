'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const { getArticlePath } = require('../server/_article-paths');
const { legacyLanguageTarget, localizedPath } = require('../server/_language-routing');

const root = path.resolve(__dirname, '..');

test('clean language paths preserve English and prefix translated pages', () => {
  assert.equal(localizedPath('/services/website-development', 'en'), '/services/website-development');
  assert.equal(localizedPath('/services/website-development', 'pt-PT'), '/pt/services/website-development');
  assert.equal(legacyLanguageTarget('/services/website-development', 'es'), '/es/services/website-development');
  assert.equal(legacyLanguageTarget('/work', 'es'), '/work');
  assert.equal(getArticlePath({ category: 'Case Study', slug: 'example' }, 'he'), '/he/case-studies/example');
});

test('generated translations contain crawlable HTML, self canonicals and reciprocal alternates', () => {
  const file = path.join(root, '_localized', 'es', 'services', 'website-development.html');
  assert.ok(fs.existsSync(file), 'Run npm run build:locales before this test');
  const html = fs.readFileSync(file, 'utf8');
  assert.match(html, /<html[^>]*lang="es"/);
  assert.match(html, /rel="canonical" href="https:\/\/www\.studio17\.world\/es\/services\/website-development"|href="https:\/\/www\.studio17\.world\/es\/services\/website-development"[^>]*rel="canonical"/);
  assert.match(html, /hreflang="en"|hreflang="en"/);
  assert.match(html, /hreflang="es"|hreflang="es"/);
  assert.doesNotMatch(html, /\?lang=/);
});

test('Vercel uses build-time localized HTML and routing middleware without adding an API function', () => {
  const config = JSON.parse(fs.readFileSync(path.join(root, 'vercel.json'), 'utf8'));
  assert.equal(config.proxy.entrypoint, 'proxy.mjs');
  assert.match(config.buildCommand, /build-localized-pages\.cjs/);
  assert.equal(config.rewrites.some(rule => rule.source === '/es/news/:slug'), true);
  assert.equal(config.rewrites.some(rule => rule.source === '/he/:path*'), true);
  assert.equal(fs.existsSync(path.join(root, 'api', 'language-redirect.js')), false);
});
