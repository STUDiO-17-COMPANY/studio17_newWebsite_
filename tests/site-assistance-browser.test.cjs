'use strict';

const assert = require('node:assert/strict');
const os = require('node:os');
const path = require('node:path');
const { chromium } = require('playwright');

const baseUrl = process.env.STUDIO17_TEST_URL || 'http://127.0.0.1:8082';

(async () => {
  const browser = await chromium.launch({ headless: true, channel: 'msedge' });
  try {
    const desktop = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    const errors = [];
    desktop.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
    desktop.on('pageerror', error => errors.push(error.message));
    await desktop.addInitScript(() => {
      localStorage.setItem('studio17-analytics-consent-v1', 'denied');
      localStorage.setItem('studio17-language', 'en');
    });
    await desktop.goto(`${baseUrl}/`, { waitUntil: 'networkidle' });
    await desktop.evaluate(() => scrollTo(0, document.documentElement.scrollHeight * .3));

    const launcher = desktop.locator('.site-assist-launcher');
    await launcher.waitFor({ state: 'visible' });
    const launcherBox = await launcher.boundingBox();
    assert.ok(launcherBox.width <= 56, 'desktop launcher must begin as a compact icon');
    assert.ok(1440 - launcherBox.x - launcherBox.width <= 25, 'desktop launcher must sit in the bottom-right corner');
    await launcher.hover();
    await desktop.waitForTimeout(400);
    assert.ok((await launcher.boundingBox()).width >= 230, 'desktop hover must reveal the launcher label');
    assert.equal((await launcher.locator('span').textContent()).trim(), 'Not sure where to start?');
    await launcher.click();
    assert.equal(await launcher.getAttribute('aria-expanded'), 'true');
    assert.equal(await desktop.locator('.site-assist-panel').isVisible(), true);
    assert.equal((await desktop.locator('.site-assist-panel h2').textContent()).trim(), 'Not sure where to start?');
    await desktop.waitForTimeout(350);
    await desktop.screenshot({ path: path.join(os.tmpdir(), 'studio17-assistance-desktop.png') });
    await desktop.keyboard.press('Escape');
    assert.equal(await launcher.getAttribute('aria-expanded'), 'false');

    await desktop.goto(`${baseUrl}/services/seo`, { waitUntil: 'networkidle' });
    await desktop.evaluate(() => scrollTo(0, document.documentElement.scrollHeight * .3));
    await desktop.locator('.site-assist-launcher').waitFor({ state: 'visible' });
    await desktop.locator('.site-assist-launcher').click();
    assert.equal((await desktop.locator('.site-assist-panel h2').textContent()).trim(), 'Want to improve your search visibility?');
    assert.match(await desktop.locator('.site-assist-cta').getAttribute('href'), /^\/contact\?service=seo&source=assistance-badge$/);

    await desktop.goto(`${baseUrl}/contact`, { waitUntil: 'networkidle' });
    assert.equal(await desktop.locator('[data-site-assist]').count(), 0, 'contact page must not include the assistance badge');
    assert.deepEqual(errors, [], `browser console errors: ${errors.join(' | ')}`);

    const mobile = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
    await mobile.addInitScript(() => localStorage.setItem('studio17-analytics-consent-v1', 'denied'));
    await mobile.goto(`${baseUrl}/?lang=pt-PT`, { waitUntil: 'networkidle' });
    await mobile.evaluate(() => scrollTo(0, document.documentElement.scrollHeight * .3));
    const mobileLauncher = mobile.locator('.site-assist-launcher');
    await mobileLauncher.waitFor({ state: 'visible' });
    const mobileLauncherBox = await mobileLauncher.boundingBox();
    assert.ok(mobileLauncherBox.width <= 56, 'mobile launcher must remain compact');
    assert.ok(390 - mobileLauncherBox.x - mobileLauncherBox.width <= 13, 'mobile launcher must sit in the bottom-right corner');
    await mobileLauncher.click();
    assert.equal(await mobile.locator('.site-assist-panel').isVisible(), true);
    assert.equal((await mobile.locator('.site-assist-panel h2').textContent()).trim(), 'Não sabe por onde começar?');
    assert.ok((await mobileLauncher.boundingBox()).width <= 56, 'open mobile launcher must remain icon-only');
    await mobile.waitForTimeout(350);
    await mobile.screenshot({ path: path.join(os.tmpdir(), 'studio17-assistance-mobile.png') });
    const overflow = await mobile.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    assert.ok(overflow <= 1, `mobile page must not overflow horizontally (${overflow}px)`);

    console.log('Contextual assistance badge browser tests passed.');
  } finally {
    await browser.close();
  }
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
