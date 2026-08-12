'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');

const baseUrl = process.argv[2] || 'http://127.0.0.1:4173';
const artifactDir = process.argv[3] || path.join(process.cwd(), 'test-artifacts');
let activeBrowser;

(async () => {
  fs.mkdirSync(artifactDir, { recursive: true });
  const browser = await chromium.launch({ headless: true, channel: 'msedge' });
  activeBrowser = browser;
  const errors = [];

  for (const width of [1440, 900, 390, 320]) {
    const context = await browser.newContext({ viewport: { width, height: 900 } });
    await context.addInitScript(() => localStorage.setItem('studio17-language', 'en'));
    const page = await context.newPage();
    page.on('console', message => { if (message.type() === 'error') errors.push(`${width}: ${message.text()}`); });
    await page.goto(`${baseUrl}/insights/how-car-dealerships-can-increase-monthly-sales`, { waitUntil: 'networkidle' });

    assert.match(await page.title(), /How Car Dealerships Can Increase Monthly Sales/);
    assert.equal(await page.locator('h1').count(), 1);
    assert.equal(await page.locator('.article-body section').count(), 4);
    assert.equal(await page.locator('.article-language-status a').count(), 1);
    assert.equal(await page.locator('i[data-lucide]').count(), 0);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, `Article overflow at ${width}px`);
    assert.equal(await page.locator('meta[property="og:image"]').getAttribute('content'), 'https://www.studio17.world/Images/news-partnership.webp');
    assert.notEqual(await page.locator('meta[property="og:image"]').getAttribute('content'), await page.locator('.article-cover img').getAttribute('src'));

    if (width === 390) {
      await page.locator('.menu-toggle').click();
      assert.deepEqual(await page.locator('#mobile-menu nav > a').allTextContents(), ['Services', 'Work', 'About', 'News', 'Careers']);
    }

    if (width === 1440 || width === 390) {
      await page.screenshot({ path: path.join(artifactDir, `article-${width}.png`), fullPage: true });
    }
    await context.close();
  }

  {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    await context.addInitScript(() => localStorage.setItem('studio17-language', 'en'));
    const page = await context.newPage();
    await page.goto(`${baseUrl}/`, { waitUntil: 'networkidle' });
    const link = page.locator('[data-article-feed="home"] .news-card').first().locator('a');
    assert.equal(await link.getAttribute('href'), '/insights/how-car-dealerships-can-increase-monthly-sales');
    await link.click();
    await page.waitForURL('**/insights/how-car-dealerships-can-increase-monthly-sales');
    assert.equal(await page.locator('h1').isVisible(), true);
    await context.close();
  }

  {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
    await context.addInitScript(() => localStorage.setItem('studio17-language', 'he'));
    const page = await context.newPage();
    await page.goto(`${baseUrl}/news?lang=he`, { waitUntil: 'networkidle' });
    assert.equal(await page.locator('html').getAttribute('dir'), 'rtl');
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
    assert.match(await page.locator('.article-feed-empty').innerText(), /אין מאמרים/);
    await context.close();
  }

  assert.deepEqual(errors, []);
  await browser.close();
  console.log('Article browser tests passed.');
})().catch(async error => {
  console.error(error);
  await activeBrowser?.close().catch(() => {});
  process.exit(1);
});
