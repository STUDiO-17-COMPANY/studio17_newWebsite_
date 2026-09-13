'use strict';

const assert = require('node:assert/strict');
const os = require('node:os');
const path = require('node:path');
const { chromium } = require('playwright');

const baseUrl = process.env.STUDIO17_TEST_URL || 'http://127.0.0.1:8086';
const languages = ['en', 'el', 'ru'];

(async () => {
  const browser = await chromium.launch({ headless: true, channel: 'msedge' });
  const errors = [];
  try {
    for (const width of [1440, 390]) {
      const context = await browser.newContext({ viewport: { width, height: 900 } });
      await context.addInitScript(() => localStorage.setItem('studio17-analytics-consent-v1', 'denied'));
      for (const language of languages) {
        const page = await context.newPage();
        page.on('console', message => { if (message.type() === 'error') errors.push(`${language} ${width}: ${message.text()}`); });
        page.on('pageerror', error => errors.push(`${language} ${width}: ${error.message}`));
        await page.goto(`${baseUrl}/services/website-pricing?lang=${language}`, { waitUntil: 'networkidle' });

        assert.equal(await page.locator('html').getAttribute('lang'), language);
        assert.equal(await page.locator('html').getAttribute('dir'), 'ltr');
        assert.equal(await page.locator('.website-pricing-table').count(), 1);
        assert.equal(await page.locator('.website-pricing-table tbody tr:not(.website-pricing-group)').count(), 16);
        assert.equal(await page.locator('.website-pricing-table thead th').count(), 6);
        assert.equal(await page.locator('.website-pricing-table thead .is-popular').count(), 1);
        assert.equal(await page.locator('.website-pricing-cta .cta-actions a').count(), 2);
        assert.equal(await page.locator('.website-pricing-cta .cta-actions .solid-button').count(), 1);
        assert.equal(await page.locator('.website-pricing-cta .cta-actions .design-link').count(), 1);
        assert.equal(await page.locator('.page-hero-icon:visible').count(), 0);
        assert.equal(await page.locator('.website-pricing-hero .hero-media img').getAttribute('src'), '/Images/Team_heroimage.webp');
        assert.equal(await page.locator('.website-pricing-page h1, .website-pricing-page main h2').evaluateAll(headings => headings.every(heading => !heading.textContent.trim().endsWith('.'))), true);
        const sectionMetrics = await page.locator('.website-pricing-overview, .website-pricing-table-section, .website-pricing-cta').evaluateAll(sections => sections.map(section => {
          const style = getComputedStyle(section);
          return { marginTop: style.marginTop, paddingTop: style.paddingTop, paddingBottom: style.paddingBottom, background: style.backgroundColor };
        }));
        assert.equal(sectionMetrics.every(metric => metric.marginTop === '32px' && metric.paddingTop === '24px' && metric.paddingBottom === '24px' && metric.background === 'rgb(248, 250, 252)'), true, `${language} section rhythm at ${width}px`);
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), true, `${language} document overflows at ${width}px`);

        const ctaImage = page.locator('.website-pricing-cta img');
        await ctaImage.scrollIntoViewIfNeeded();
        await page.waitForFunction(() => document.querySelector('.website-pricing-cta img')?.complete);
        assert.equal(await ctaImage.evaluate(image => image.naturalWidth), 1920);

        const scrollMetrics = await page.locator('.website-pricing-scroll').evaluate(element => ({
          clientWidth: element.clientWidth,
          scrollWidth: element.scrollWidth
        }));
        if (width === 390) assert.ok(scrollMetrics.scrollWidth > scrollMetrics.clientWidth, `${language} table should scroll horizontally`);
        assert.equal(await page.locator('.website-pricing-table tbody th[scope="row"]').first().evaluate(element => getComputedStyle(element).position), 'sticky');

        if (width === 1440 && language === 'en') await page.screenshot({ path: path.join(os.tmpdir(), 'studio17-website-pricing-en.png'), fullPage: true });
        if (width === 390 && language === 'el') await page.screenshot({ path: path.join(os.tmpdir(), 'studio17-website-pricing-el-mobile.png'), fullPage: true });
        await page.close();
      }
      await context.close();
    }

    const linkingPage = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await linkingPage.addInitScript(() => localStorage.setItem('studio17-analytics-consent-v1', 'denied'));
    await linkingPage.goto(`${baseUrl}/services/website-development`, { waitUntil: 'networkidle' });
    await linkingPage.locator('[data-service-key="compareAction"] a').click();
    await linkingPage.waitForURL(/\/services\/website-pricing/);
    assert.equal(await linkingPage.locator('.website-pricing-table').count(), 1);
    await linkingPage.close();

    assert.deepEqual(errors, [], `browser errors: ${errors.join(' | ')}`);
    console.log('Website pricing browser tests passed.');
  } finally {
    await browser.close();
  }
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
