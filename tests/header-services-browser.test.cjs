'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require(process.env.STUDIO17_PLAYWRIGHT_PATH || 'playwright');

const baseUrl = process.argv[2] || 'http://127.0.0.1:8765';
const artifactDir = process.argv[3] || path.join(process.cwd(), 'test-artifacts');
const root = path.resolve(__dirname, '..');
const locales = ['en', 'pt-PT', 'es', 'el', 'ru', 'he'];
const translations = Object.fromEntries(locales.map(locale => {
  if (locale === 'en') return [locale, {}];
  const data = JSON.parse(fs.readFileSync(path.join(root, 'locales', `${locale}.json`), 'utf8'));
  return [locale, data.strings];
}));
const translate = (locale, text) => translations[locale][text] || text;
let activeBrowser;

(async () => {
  fs.mkdirSync(artifactDir, { recursive: true });
  const browser = await chromium.launch({ headless: true, channel: 'msedge' });
  activeBrowser = browser;
  const consoleErrors = [];

  for (const locale of locales) {
    for (const width of [390, 320]) {
      const context = await browser.newContext({ viewport: { width, height: 844 } });
      const page = await context.newPage();
      page.on('console', message => {
        if (message.type() === 'error') consoleErrors.push(`${locale}/${width}: ${message.text()}`);
      });
      await page.goto(`${baseUrl}/?lang=${encodeURIComponent(locale)}`, { waitUntil: 'networkidle' });

      await page.locator('.menu-toggle').click();
      assert.equal(await page.locator('#mobile-menu').isVisible(), true, `${locale}/${width}: mobile menu`);
      assert.equal(await page.locator('#mobile-menu nav > a').count(), 4, `${locale}/${width}: four non-Service top-level links`);
      assert.equal(await page.locator('.mobile-services-overview-link').count(), 1, `${locale}/${width}: Services top-level link`);

      const toggle = page.locator('.mobile-services-toggle');
      assert.equal(await toggle.getAttribute('aria-label'), translate(locale, 'Show services'));
      await toggle.click();
      assert.equal(await toggle.getAttribute('aria-expanded'), 'true');
      assert.equal(await toggle.getAttribute('aria-label'), translate(locale, 'Hide services'));
      assert.equal(await page.locator('.mobile-services-panel').isVisible(), true);
      assert.equal(await page.locator('.mobile-services-category').count(), 6);
      assert.equal(await page.locator('.mobile-services-list a').count(), 36);

      const categories = page.locator('.mobile-services-category');
      await categories.nth(0).click();
      assert.equal(await page.locator('.mobile-services-list').nth(0).isVisible(), true);
      assert.equal(await page.locator('.mobile-services-list').nth(0).locator('a').count(), 5);
      await categories.nth(1).click();
      assert.equal(await page.locator('.mobile-services-list').nth(0).isHidden(), true);
      assert.equal(await page.locator('.mobile-services-list').nth(1).isVisible(), true);
      assert.equal(await page.locator('.mobile-services-list').nth(1).locator('a').count(), 8);

      const websiteDevelopmentHref = await page.locator('.mobile-services-list').nth(1).locator('a').first().getAttribute('href');
      assert.ok(websiteDevelopmentHref.includes('/services/website-development'));
      if (locale === 'en') assert.doesNotMatch(websiteDevelopmentHref, /[?&]lang=/);
      else assert.ok(websiteDevelopmentHref.includes(`lang=${encodeURIComponent(locale)}`));

      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, `${locale}/${width}: horizontal overflow`);
      assert.equal(await page.locator('i[data-lucide]').count(), 0, `${locale}/${width}: Lucide replacement`);
      if ((locale === 'en' && width === 390) || (locale === 'he' && width === 320)) {
        await page.screenshot({ path: path.join(artifactDir, `mobile-services-${locale}-${width}.png`) });
      }

      await page.keyboard.press('Escape');
      assert.equal(await page.locator('#mobile-menu').isHidden(), true);
      assert.equal(await toggle.getAttribute('aria-expanded'), 'false');
      await context.close();
    }
  }

  assert.deepEqual(consoleErrors, []);
  await browser.close();
  activeBrowser = null;
  console.log('Mobile Services browser tests passed for six languages at 390px and 320px.');
})().catch(async error => {
  console.error(error);
  if (activeBrowser) await activeBrowser.close();
  process.exitCode = 1;
});
