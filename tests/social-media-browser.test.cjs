'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require(process.env.STUDIO17_PLAYWRIGHT_PATH || 'playwright');

const baseUrl = process.argv[2] || 'http://127.0.0.1:8080';
const artifactDir = process.argv[3] || path.join(process.cwd(), 'test-artifacts');
let activeBrowser;

(async () => {
  fs.mkdirSync(artifactDir, { recursive: true });
  const browser = await chromium.launch({ headless: true, channel: 'msedge' });
  activeBrowser = browser;
  const consoleErrors = [];

  for (const width of [1440, 390, 320]) {
    const context = await browser.newContext({ viewport: { width, height: width > 900 ? 1000 : 844 } });
    const page = await context.newPage();
    page.on('console', message => { if (message.type() === 'error') consoleErrors.push(`${width}: ${message.text()}`); });
    await page.goto(`${baseUrl}/services/social-media`, { waitUntil: 'networkidle' });

    assert.equal((await page.locator('h1').innerText()).toLowerCase(), 'we take care of your social media');
    assert.equal(await page.locator('[data-social-feature-title]').innerText(), 'Social Media Management');
    assert.equal(await page.locator('.website-faq-column').count(), 2);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, `${width}: horizontal overflow`);
    assert.equal(await page.locator('i[data-lucide]').count(), 0, `${width}: Lucide replacement`);

    if (width > 900) {
      await page.locator('[data-social-service="automation"]').click();
      assert.equal(await page.locator('[data-social-feature-title]').innerText(), 'Social Media Automation');
      await page.locator('[data-social-service-group="grow"]').click();
      assert.equal(await page.locator('[data-social-feature-title]').innerText(), 'Growth Strategy');
    } else {
      assert.equal(await page.locator('[data-social-service-group-select]').isVisible(), true);
      assert.equal(await page.locator('[data-social-service-select]').isVisible(), true);
      await page.locator('[data-social-service-group-select]').selectOption('grow');
      await page.locator('[data-social-service-select]').selectOption('community');
      assert.equal(await page.locator('[data-social-feature-title]').innerText(), 'Community Management');
    }

    await page.screenshot({ path: path.join(artifactDir, `social-media-${width}.png`), fullPage: true });
    await context.close();
  }

  assert.deepEqual(consoleErrors, []);
  await browser.close();
  activeBrowser = null;
  console.log('Social Media responsive browser tests passed at 1440px, 390px and 320px.');
})().catch(async error => {
  console.error(error);
  if (activeBrowser) await activeBrowser.close();
  process.exitCode = 1;
});
