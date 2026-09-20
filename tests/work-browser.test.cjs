'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require(process.env.STUDIO17_PLAYWRIGHT_PATH || 'playwright');

const baseUrl = process.argv[2] || 'http://127.0.0.1:4173';
const artifactDir = process.argv[3] || path.join(process.cwd(), 'test-artifacts', 'work-page');
let activeBrowser;

(async () => {
  fs.mkdirSync(artifactDir, { recursive: true });
  const browser = await chromium.launch({ headless: true, channel: 'msedge' });
  activeBrowser = browser;
  const errors = [];

  for (const width of [1440, 390, 320]) {
    const context = await browser.newContext({ viewport: { width, height: width > 400 ? 1000 : 844 } });
    await context.addInitScript(() => {
      localStorage.setItem('studio17-language', 'en');
      localStorage.setItem('studio17-analytics-consent-v1', 'denied');
    });
    const page = await context.newPage();
    page.on('console', message => { if (message.type() === 'error') errors.push(`${width}: ${message.text()}`); });
    await page.goto(`${baseUrl}/work`, { waitUntil: 'networkidle' });

    assert.equal(await page.title(), 'Selected client work | Studio 17');
    assert.equal(await page.locator('h1').count(), 1);
    assert.equal(await page.locator('.work-project-card').count(), 5);
    assert.equal(await page.locator('.work-project-card').getByText('Teaching Economics', { exact: true }).count(), 1);
    assert.equal(await page.locator('.work-project-card a[href="https://www.instagram.com/p/DaPSeSJsA-o/"]').count(), 1);
    assert.equal(await page.locator('.work-quote-card').count(), 4);
    assert.equal(await page.locator('.work-faq details').count(), 8);
    assert.equal(await page.locator('[data-nextjs-dialog], .vite-error-overlay, #webpack-dev-server-client-overlay').count(), 0);
    assert.equal(await page.evaluate(() => document.body.innerText.trim().length > 0), true);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, `${width}: horizontal overflow`);
    assert.equal(await page.locator('i[data-lucide]').count(), 0, `${width}: Lucide replacement`);

    if (width === 1440) {
      const left = page.locator('.work-faq .website-faq-column').nth(0).locator('details');
      const right = page.locator('.work-faq .website-faq-column').nth(1).locator('details');
      await left.nth(0).locator('summary').click();
      await right.nth(0).locator('summary').click();
      assert.equal(await left.nth(0).getAttribute('open'), '');
      assert.equal(await right.nth(0).getAttribute('open'), '');
      await left.nth(1).locator('summary').click();
      await page.waitForTimeout(50);
      assert.equal(await left.nth(0).getAttribute('open'), null);
      assert.equal(await left.nth(1).getAttribute('open'), '');
      assert.equal(await right.nth(0).getAttribute('open'), '');
    } else {
      await page.locator('.menu-toggle').click();
      assert.equal(await page.locator('#mobile-menu').isVisible(), true);
      assert.equal(await page.locator('#mobile-menu a[href^="/work"]').count(), 1);
      await page.keyboard.press('Escape');
      assert.equal(await page.locator('#mobile-menu').isHidden(), true);
    }

    await page.screenshot({ path: path.join(artifactDir, `work-${width}.png`), fullPage: true });
    await context.close();
  }

  assert.deepEqual(errors, []);
  await browser.close();
  activeBrowser = null;
  console.log('Work page browser tests passed at 1440px, 390px and 320px.');
})().catch(async error => {
  console.error(error);
  if (activeBrowser) await activeBrowser.close();
  process.exitCode = 1;
});
