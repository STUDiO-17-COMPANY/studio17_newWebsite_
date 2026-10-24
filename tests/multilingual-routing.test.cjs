'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const { getArticlePath } = require('../server/_article-paths');
const {
  LOCALE_PREFIXES,
  STATIC_PAGES,
  legacyLanguageTarget,
  localizedPath
} = require('../server/_language-routing');

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

test('every supported translated static route has a generated, self-canonical document', () => {
  for (const definition of STATIC_PAGES) {
    for (const locale of definition.locales.filter(language => language !== 'en')) {
      const prefix = LOCALE_PREFIXES[locale];
      const relativeRoute = definition.route.replace(/^\/+|\/+$/g, '');
      const file = path.join(root, '_localized', prefix, `${relativeRoute}.html`);
      const expectedPath = localizedPath(definition.route, locale);
      const expectedUrl = `https://www.studio17.world${expectedPath}`;

      assert.ok(fs.existsSync(file), `${expectedPath} is missing its generated HTML document`);
      const html = fs.readFileSync(file, 'utf8');
      assert.match(html, new RegExp(`<html[^>]*lang=["']${locale}["']`), `${expectedPath} has the wrong html lang`);
      assert.match(
        html,
        new RegExp(`rel=["']canonical["'][^>]*href=["']${expectedUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}["']|href=["']${expectedUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}["'][^>]*rel=["']canonical["']`),
        `${expectedPath} is not self-canonical`
      );
      assert.match(html, /hreflang=["']x-default["']/, `${expectedPath} is missing x-default hreflang`);
      assert.match(html, new RegExp(`hreflang=["']${locale}["']`), `${expectedPath} is missing its locale hreflang`);
      assert.doesNotMatch(html, /\?lang=/, `${expectedPath} still exposes a legacy language query URL`);

      const languageControl = new RegExp(
        `data-lang=["']${locale}["'][^>]*data-language-url=["']${expectedPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}["']|data-language-url=["']${expectedPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}["'][^>]*data-lang=["']${locale}["']`
      );
      assert.match(html, languageControl, `${expectedPath} is missing its canonical language-switch target`);
    }
  }
});

test('Vercel uses build-time localized HTML and routing middleware without adding an API function', () => {
  const config = JSON.parse(fs.readFileSync(path.join(root, 'vercel.json'), 'utf8'));
  assert.equal(config.proxy.entrypoint, 'proxy.ts');
  assert.match(config.buildCommand, /build-localized-pages\.cjs/);
  assert.match(config.buildCommand, /multilingual-routing\.test\.cjs/, 'Vercel must run the multilingual route guard before deployment');
  assert.equal(config.rewrites.some(rule => rule.source === '/es/news/:slug'), true);
  assert.equal(
    config.rewrites.find(rule => rule.source === '/he/:path*')?.destination,
    '/_localized/he/:path*'
  );
  ['pt', 'es', 'el', 'ru', 'he'].forEach(prefix => {
    assert.equal(
      config.rewrites.find(rule => rule.source === `/${prefix}/:path*`)?.destination,
      `/_localized/${prefix}/:path*`
    );
  });
  assert.equal(
    config.rewrites.some(rule => /:path\*\.html$/.test(rule.destination)),
    false,
    'Vercel wildcard destinations must use extensionless paths when cleanUrls is enabled'
  );
  assert.equal(fs.existsSync(path.join(root, 'api', 'language-redirect.js')), false);
});

test('every locale has complete Vercel rewrites for homes, archives and article categories', () => {
  const config = JSON.parse(fs.readFileSync(path.join(root, 'vercel.json'), 'utf8'));
  const locales = new Map([
    ['pt', 'pt-PT'],
    ['es', 'es'],
    ['el', 'el'],
    ['ru', 'ru'],
    ['he', 'he']
  ]);
  const destinationFor = source => config.rewrites.find(rewrite => rewrite.source === source)?.destination;

  locales.forEach((locale, prefix) => {
    assert.equal(destinationFor(`/${prefix}`), `/api/home-page?lang=${locale}`);
    assert.equal(destinationFor(`/${prefix}/`), `/api/home-page?lang=${locale}`);
    assert.equal(destinationFor(`/${prefix}/news`), `/api/news-page?lang=${locale}`);
    assert.equal(destinationFor(`/${prefix}/news/page/:page`), `/api/news-page?lang=${locale}&page=:page`);
    for (const section of ['insights', 'case-studies', 'news']) {
      assert.equal(
        destinationFor(`/${prefix}/${section}/:slug`),
        `/api/article-page?lang=${locale}&slug=:slug&section=${section}`
      );
    }
  });
});

test('canonical localized home URLs resolve through explicit trailing-slash rewrites', () => {
  const config = JSON.parse(fs.readFileSync(path.join(root, 'vercel.json'), 'utf8'));
  const expected = new Map([
    ['/pt/', '/api/home-page?lang=pt-PT'],
    ['/es/', '/api/home-page?lang=es'],
    ['/el/', '/api/home-page?lang=el'],
    ['/ru/', '/api/home-page?lang=ru'],
    ['/he/', '/api/home-page?lang=he']
  ]);

  expected.forEach((destination, source) => {
    assert.equal(
      config.rewrites.find(rewrite => rewrite.source === source)?.destination,
      destination,
      `${source} must render the localized homepage instead of returning Vercel's 404`
    );
  });
});
