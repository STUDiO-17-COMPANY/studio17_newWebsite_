'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const { parseHTML } = require('linkedom');
const routing = require('../server/_language-routing');
const { renderSeoPage } = require('../api/home-page');

test('SEO overview includes the full brief and distinct SEO strategy destination', () => {
  const fixture = { title: 'Fixture', url: '/insights/fixture', category: 'Insight', publishedDate: '2026-11-07' };
  const { document } = parseHTML(renderSeoPage(Array(8).fill(fixture)));
  assert.equal(document.querySelector('h1').textContent, 'Get found on Google');
  assert.equal(document.querySelector('link[rel="canonical"]').getAttribute('href'), 'https://www.studio17.world/services/seo');
  assert.equal(document.querySelectorAll('.partner-marquee').length, 1);
  assert.equal(document.querySelectorAll('.seo-service-option').length, 8);
  assert.equal(document.querySelectorAll('[data-seo-benefits] details:not([open])').length, 5);
  assert.equal(document.querySelectorAll('.seo-roadmap li').length, 5);
  assert.equal(document.querySelectorAll('.seo-case-grid article').length, 2);
  assert.equal(document.querySelectorAll('.seo-industry-cards article').length, 8);
  assert.equal(document.querySelectorAll('details[name="seo-overview-faq"]').length, 8);
  assert.equal(document.querySelectorAll('.news-card').length, 6);
  assert.match(document.querySelector('.seo-dashboard figcaption').textContent, /Illustrative data/);
  assert.ok(document.querySelector('.seo-service-option a[href="/services/seo-strategy"]'));
  assert.ok(document.querySelector('.seo-audit-form input[name="intent"][value="seo"]'));
  assert.ok(document.querySelectorAll('img[src^="/Images/"]').length > 0);
  for (const img of document.querySelectorAll('img[src^="/Images/"]')) assert.ok(fs.existsSync(decodeURIComponent(img.getAttribute('src').slice(1))), img.getAttribute('src'));
  assert.match(fs.readFileSync('seo-strategy.html', 'utf8'), /rel="canonical" href="https:\/\/www\.studio17\.world\/services\/seo-strategy"/);
});

test('SEO translations remain pending with locale-safe English fallback and legacy Hebrew preserved', () => {
  const config = require('../vercel.json');
  for (const [language, prefix] of [['pt-PT', 'pt'], ['es', 'es'], ['el', 'el'], ['ru', 'ru']]) {
    for (const route of ['/services/seo', '/services/seo-strategy']) {
      assert.equal(routing.supportsLocale(route, language), false);
      assert.equal(routing.isPendingSeoLocale(route, language), true);
      assert.equal(routing.legacyLanguageTarget(route, language), '/' + prefix + route);
    }
  }
  assert.equal(routing.supportsLocale('/services/seo', 'he'), true);
  assert.equal(routing.supportsLocale('/services/seo-strategy', 'he'), false);
  assert.ok(config.redirects.some(rule => rule.destination === '/:locale/wip?for=:service' && rule.permanent === false));
  assert.ok(config.rewrites.some(rule => rule.source === '/services/seo' && rule.destination === '/api/home-page?view=seo'));
  assert.match(fs.readFileSync('_localized/pt/wip.html', 'utf8'), /noindex/);
});
