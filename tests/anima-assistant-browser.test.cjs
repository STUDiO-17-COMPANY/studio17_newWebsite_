'use strict';

const assert = require('node:assert/strict');
const os = require('node:os');
const path = require('node:path');
const { chromium } = require('playwright');

const baseUrl = process.env.STUDIO17_TEST_URL || 'http://127.0.0.1:4173';

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

    const anima = desktop.locator('[data-anima]');
    const launcher = anima.locator('.anima-launcher');
    const siteLauncher = desktop.locator('.site-assist-launcher');
    await launcher.waitFor({ state: 'visible' });
    assert.equal(await siteLauncher.isVisible(), false, 'the contextual assistance launcher must remain engagement-delayed');
    assert.equal(await launcher.evaluate(element => getComputedStyle(element).backgroundColor), 'rgb(4, 86, 254)');
    await desktop.evaluate(() => scrollTo(0, document.documentElement.scrollHeight * .2));
    await siteLauncher.waitFor({ state: 'visible' });
    const animaBox = await launcher.boundingBox();
    const siteBox = await siteLauncher.boundingBox();
    assert.ok(animaBox.y + animaBox.height < siteBox.y, 'Anima must sit above the contextual assistance launcher');
    assert.equal(await anima.locator('i[data-lucide]').count(), 0, 'Lucide placeholders must be rendered');

    await launcher.click();
    assert.equal(await launcher.getAttribute('aria-expanded'), 'true');
    assert.equal(await anima.locator('.anima-panel').isVisible(), true);
    assert.equal((await anima.locator('.anima-message-assistant').first().textContent()).trim(), 'Hi, I’m Anima, your quick-answer assistant. I can help you understand our services, pricing and process, or connect you directly with our team. Let me know how I can help you.');
    assert.equal((await anima.locator('[data-anima-human]').textContent()).trim(), 'Talk with a human');
    assert.match(await anima.locator('[data-anima-human]').getAttribute('href'), /^\/contact\?source=anima$/);
    assert.equal(await anima.locator('[data-anima-question]').count(), 6);

    await anima.locator('[data-anima-question="services"]').click();
    assert.equal(await anima.locator('[data-anima-typing]').isVisible(), true);
    assert.deepEqual(await anima.locator('[data-anima-typing] span').first().evaluate(element => {
      const style = getComputedStyle(element);
      return { display: style.display, width: style.width, height: style.height, animation: style.animationName };
    }), { display: 'block', width: '7px', height: '7px', animation: 'anima-typing' });
    assert.equal(await anima.locator('[data-anima-question]:disabled').count(), 6);
    await desktop.waitForTimeout(2300);
    assert.equal(await anima.locator('[data-anima-typing]').count(), 0);
    assert.match(await anima.locator('.anima-message-assistant').last().textContent(), /website development, SEO and GEO/);
    assert.match(await anima.locator('.anima-message-assistant').last().locator('a').getAttribute('href'), /^\/services\?source=anima$/);
    await desktop.screenshot({ path: path.join(os.tmpdir(), 'studio17-anima-desktop.png') });

    await siteLauncher.click();
    assert.equal(await launcher.getAttribute('aria-expanded'), 'false', 'opening site assistance must close Anima');
    await siteLauncher.click();
    await launcher.click();
    assert.equal(await siteLauncher.getAttribute('aria-expanded'), 'false', 'opening Anima must close site assistance');
    await desktop.keyboard.press('Escape');
    assert.equal(await launcher.getAttribute('aria-expanded'), 'false');
    assert.deepEqual(errors, [], `browser console errors: ${errors.join(' | ')}`);

    const consentPage = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await consentPage.goto(`${baseUrl}/`, { waitUntil: 'networkidle' });
    await consentPage.evaluate(() => scrollTo(0, document.documentElement.scrollHeight * .25));
    assert.equal(await consentPage.locator('.analytics-consent').isVisible(), true);
    assert.equal(await consentPage.locator('[data-anima]').isVisible(), false, 'Anima must stay hidden behind consent');
    await consentPage.close();

    const mobile = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
    await mobile.addInitScript(() => {
      localStorage.setItem('studio17-analytics-consent-v1', 'denied');
      localStorage.setItem('studio17-language', 'en');
    });
    await mobile.goto(`${baseUrl}/`, { waitUntil: 'networkidle' });
    await mobile.evaluate(() => scrollTo(0, document.documentElement.scrollHeight * .2));
    const mobileAnima = mobile.locator('[data-anima]');
    await mobileAnima.locator('.anima-launcher').waitFor({ state: 'visible' });
    await mobileAnima.locator('.anima-launcher').click();
    await mobile.waitForTimeout(350);
    const panelBox = await mobileAnima.locator('.anima-panel').boundingBox();
    assert.ok(panelBox.x >= 11 && panelBox.x + panelBox.width <= 379, 'mobile panel must stay inside the viewport');
    assert.ok(panelBox.y >= 0 && panelBox.y + panelBox.height <= 844, 'mobile panel must stay vertically inside the viewport');
    assert.equal(await mobile.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
    await mobile.screenshot({ path: path.join(os.tmpdir(), 'studio17-anima-mobile.png') });
    await mobile.close();

    console.log('Anima assistant browser tests passed.');
  } finally {
    await browser.close();
  }
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
