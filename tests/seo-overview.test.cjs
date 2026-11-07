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
  assert.equal(document.querySelector('#seo-industries'), null);
  assert.deepEqual([...document.querySelectorAll('.website-faq-column')].map(column => column.querySelectorAll('details').length), [4, 4]);
  assert.equal(document.querySelectorAll('.news-section .news-card').length, 6);
  assert.equal(document.querySelectorAll('.seo-case-grid .news-card').length, 2);
  assert.equal(document.querySelectorAll('.seo-case-caption h3').length, 2);
  assert.equal(document.querySelector('main a[href="/news?category=case-studies#all-articles"]'), null);
  assert.equal(document.querySelector('#seo-ai-title'), null);
  assert.equal(document.querySelectorAll('.seo-metrics dd').length, 4);
  assert.match(document.querySelector('#seo-results-title').parentElement.textContent, /October 2026.*Real search performance data/);
  assert.equal(document.querySelector('.seo-dashboard'), null);
  assert.equal(document.querySelector('.seo-overview-hero picture source').getAttribute('srcset'), '/Images/HeroImage_SEOServices_Mobile.avif');
  assert.equal(document.querySelector('[data-local-seo-form]').getAttribute('action'), '/contact/local-seo');
  assert.ok(document.querySelector('.closing-cta .cta-grid .services-cta-media picture'));
  assert.ok(document.querySelector('.closing-cta .solid-button [data-lucide="arrow-up-right"]'));
  assert.ok(document.querySelector('.seo-service-option a[href="/services/seo-strategy"]'));
  assert.ok(document.querySelector('.seo-audit-form input[name="intent"][value="seo"]'));
  assert.ok(document.querySelector('.seo-audit-form[data-hero-audit-form="seo"] [data-hero-audit-submit]'));
  assert.ok(document.querySelector('script[src="/homepage-audit.js"]'));
  assert.ok(document.querySelector('h1 .home-hero-rotating-word'));
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
