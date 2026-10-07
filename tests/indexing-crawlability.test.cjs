'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');

const clientTranslatedPages = [
  'home.template.html', 'about.html', 'contact.html', 'faq.html', 'team.html', 'our-story.html',
  'privacy-policy.html', 'cookie-policy.html', 'terms.html', 'services.html', 'website-services.html',
  'website-development.html', 'website-pricing.html', 'free-website.html', 'seo.html',
  'seo-cyprus.html', 'seo-limassol.html'
];

test('client-only language states consolidate without false hreflang alternates', () => {
  for (const file of clientTranslatedPages) {
    const html = read(file);
    assert.match(html, /rel="canonical" href="https:\/\/www\.studio17\.world\//, `${file} needs a canonical`);
    assert.doesNotMatch(html, /hreflang="(?:pt-PT|es|el|ru|he)"/, `${file} advertises a non-server-rendered language alternate`);
    assert.doesNotMatch(html, /rel="canonical"[^>]+\?lang=/, `${file} canonical must not include a client-state parameter`);
  }
  const i18n = read('i18n.js');
  assert.match(i18n, /hasAttribute\('data-server-localized'\)/);
  assert.match(i18n, /canonical && isServerLocalised/);
});

test('real server-rendered article translations remain independently indexable', () => {
  const renderer = read(path.join('server', '_article-render.js'));
  assert.match(renderer, /rel="alternate" hreflang=/);
  assert.match(renderer, /data-seo-canonical/);
  assert.match(read(path.join('api', 'article-page.js')), /<html lang="\$\{escapeHtml\(article\.locale\)\}"/);
});

test('career roles are discoverable through server-rendered HTML', () => {
  assert.match(read('careers.html'), /<!-- CAREERS_ROLE_CARDS -->/);
  const handler = read(path.join('api', 'career-page.js'));
  assert.match(handler, /listPublishedRoles/);
  assert.match(handler, /href="\/careers\/\$\{encodeURIComponent\(role\.slug\)\}"/);
  const config = JSON.parse(read('vercel.json'));
  assert.equal(config.rewrites.find(route => route.source === '/careers')?.destination, '/api/career-page?listing=1');
});

test('the corrected SEO pricing slug is canonical and the legacy spelling redirects', () => {
  const paths = require('../server/_article-paths');
  const oldSlug = 'how-much-doe-seo-cost-in-cyprus-2026-pricing-guide';
  const newSlug = 'how-much-does-seo-cost-in-cyprus-2026-pricing-guide';
  assert.equal(paths.getCanonicalArticleSlug(oldSlug), newSlug);
  assert.equal(paths.getSourceArticleSlug(newSlug), oldSlug);
  assert.equal(paths.getArticlePath({ category: 'Insight', slug: oldSlug }, 'en'), `/insights/${newSlug}`);
  assert.match(read(path.join('api', 'article-page.js')), /response\.statusCode = 301/);
});

test('sitemap dates are source-backed instead of one hard-coded static date', () => {
  const sitemap = read(path.join('api', 'sitemap.js'));
  assert.doesNotMatch(sitemap, /STATIC_LASTMOD/);
  assert.match(sitemap, /latestArticleDate/);
  assert.match(sitemap, /latestRoleDate/);
});

test('robots and archive rendering expose crawlable discovery paths', () => {
  const robots = read('robots.txt');
  assert.match(robots, /User-agent: \*/);
  assert.match(robots, /Allow: \//);
  assert.match(robots, /Sitemap: https:\/\/www\.studio17\.world\/sitemap\.xml/);
  const news = read(path.join('api', 'news-page.js'));
  assert.match(news, /renderArticleCard/);
  assert.match(news, /data-server-localized/);
  assert.match(news, /rel="next"/);
});
