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

    for (const viewport of [{ width: 320, height: 568 }, { width: 390, height: 844 }, { width: 430, height: 932 }]) {
      const mobile = await browser.newPage({ viewport, isMobile: true, hasTouch: true, reducedMotion: 'reduce' });
      await mobile.addInitScript(() => {
        localStorage.setItem('studio17-analytics-consent-v1', 'denied');
        localStorage.setItem('studio17-language', 'en');
      });
      await mobile.goto(`${baseUrl}/`, { waitUntil: 'networkidle' });
      await mobile.evaluate(() => scrollTo(0, document.documentElement.scrollHeight * .2));
      const mobileAnima = mobile.locator('[data-anima]');
      const mobileLauncher = mobileAnima.locator('.anima-launcher');
      const mobilePanel = mobileAnima.locator('.anima-panel');
      await mobileLauncher.waitFor({ state: 'visible' });
      await mobileLauncher.click();
      await mobile.waitForTimeout(120);
      const panelBox = await mobilePanel.boundingBox();
      const footerBox = await mobilePanel.locator('.anima-footer').boundingBox();
      const closeBox = await mobilePanel.locator('.anima-close').boundingBox();
      assert.ok(panelBox.x >= 7 && panelBox.x + panelBox.width <= viewport.width - 7, `${viewport.width}: mobile panel must stay horizontally inside the viewport`);
      assert.ok(panelBox.y >= 7 && panelBox.y + panelBox.height <= viewport.height - 7, `${viewport.width}: mobile panel must stay vertically inside the viewport`);
      assert.ok(footerBox.y >= panelBox.y && footerBox.y + footerBox.height <= panelBox.y + panelBox.height, `${viewport.width}: human contact must remain visible`);
      assert.ok(closeBox.y >= panelBox.y && closeBox.y + closeBox.height <= panelBox.y + panelBox.height, `${viewport.width}: close control must remain visible`);
      assert.equal(await mobilePanel.getAttribute('aria-modal'), 'true');
      assert.equal(await mobile.evaluate(() => document.body.classList.contains('anima-open')), true);
      assert.equal(await mobileLauncher.isVisible(), false, `${viewport.width}: launcher must not cover the open panel`);
      assert.equal(await mobile.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);

      if (viewport.width === 320) {
        const questionRegion = mobileAnima.locator('.anima-questions');
        await questionRegion.evaluate(element => { element.scrollTop = 0; });
        await questionRegion.hover();
        await mobile.mouse.wheel(0, 260);
        await mobile.waitForTimeout(100);
        assert.ok(await questionRegion.evaluate(element => element.scrollTop > 0), 'the mobile question list must support touch-style vertical scrolling');
        const lastQuestion = mobileAnima.locator('[data-anima-question]').last();
        await lastQuestion.scrollIntoViewIfNeeded();
        await lastQuestion.click();
        await mobile.waitForTimeout(120);
        assert.match(await mobileAnima.locator('.anima-message-assistant').last().textContent(), /operates from Cyprus and Portugal/);
        assert.equal(await mobilePanel.locator('[data-anima-human]').isVisible(), true, 'human contact must remain available after an answer');
      }

      await mobile.screenshot({ path: path.join(os.tmpdir(), `studio17-anima-mobile-${viewport.width}.png`) });
      await mobilePanel.locator('.anima-close').click();
      assert.equal(await mobile.evaluate(() => document.body.classList.contains('anima-open')), false);
      assert.equal(await mobileLauncher.isVisible(), true);
      await mobile.close();
    }

    console.log('Anima assistant browser tests passed.');
  } finally {
    await browser.close();
  }
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
