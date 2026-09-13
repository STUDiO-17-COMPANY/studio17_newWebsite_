'use strict';

const assert = require('node:assert/strict');
const os = require('node:os');
const path = require('node:path');
const { chromium } = require('playwright');

const baseUrl = process.env.STUDIO17_TEST_URL || 'http://127.0.0.1:8084';
const targets = [
  { route: '/services/website', language: 'he', original: 'Website services connected around how your business grows.', faq: 6 },
  { route: '/services/seo', language: 'pt-PT', original: 'SEO services that connect search demand to growth.', faq: 8 },
  { route: '/services/seo', language: 'es', original: 'SEO services that connect search demand to growth.', faq: 8 },
  { route: '/services/seo', language: 'he', original: 'SEO services that connect search demand to growth.', faq: 8 },
  { route: '/seo/cyprus', language: 'he', original: 'SEO agency in Cyprus for businesses ready to be found and chosen', faq: 8 },
  { route: '/seo/limassol', language: 'he', original: 'SEO agency in Limassol for businesses ready to be found and chosen', faq: 8 }
];

(async () => {
  const browser = await chromium.launch({ headless: true, channel: 'msedge' });
  const errors = [];
  try {
    for (const width of [1440, 390]) {
      const context = await browser.newContext({ viewport: { width, height: 900 } });
      await context.addInitScript(() => localStorage.setItem('studio17-analytics-consent-v1', 'denied'));
      for (const target of targets) {
        const page = await context.newPage();
        page.on('console', message => { if (message.type() === 'error') errors.push(`${target.route} ${target.language} ${width}: ${message.text()}`); });
        page.on('pageerror', error => errors.push(`${target.route} ${target.language} ${width}: ${error.message}`));
        await page.goto(`${baseUrl}${target.route}?lang=${target.language}`, { waitUntil: 'networkidle' });
        assert.equal(await page.locator('html').getAttribute('lang'), target.language);
        assert.equal(await page.locator('html').getAttribute('dir'), target.language === 'he' ? 'rtl' : 'ltr');
        assert.notEqual((await page.locator('h1').innerText()).trim(), target.original);
        assert.equal(await page.locator('.website-faq-list details').count(), target.faq);
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), true, `${target.route} ${target.language} overflows at ${width}px`);
        assert.equal(await page.locator('svg[data-lucide]').count() > 0, true);
        if (target.route === '/services/website') {
          assert.equal(await page.locator('[data-website-service]').count(), 8);
          assert.equal(await page.locator('[data-website-service-panel]').count(), 8);
        }
        if (target.route === '/services/seo') {
          assert.equal(await page.locator('.seo-capability-grid > article').count(), 9);
          assert.equal(await page.locator('.seo-capability-detail .seo-capability-detail').count(), 0, 'SEO capability details must not be nested twice');
        }
        if (width === 1440 && target.route === '/services/website' && target.language === 'he') {
          await page.screenshot({ path: path.join(os.tmpdir(), 'studio17-website-he.png'), fullPage: true });
        }
        if (width === 390 && target.route === '/seo/limassol' && target.language === 'he') {
          await page.screenshot({ path: path.join(os.tmpdir(), 'studio17-seo-limassol-he-mobile.png'), fullPage: true });
        }
        await page.close();
      }
      await context.close();
    }
    assert.deepEqual(errors, [], `browser errors: ${errors.join(' | ')}`);
    console.log('Requested Website and SEO translation browser tests passed.');
  } finally {
    await browser.close();
  }
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
