'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');

const baseUrl = process.argv[2] || 'http://127.0.0.1:8765';
const artifactDir = process.argv[3] || path.join(process.cwd(), 'test-artifacts');
const root = path.resolve(__dirname, '..');
const locales = ['en', 'pt-PT', 'es', 'el', 'ru', 'he'];
const messages = {
  invalid: 'Please complete the required fields before sending.',
  sending: 'Sending your enquiry…',
  success: 'Thank you. Your enquiry has been sent to Studio 17.',
  rateLimited: 'Too many messages were sent from this connection. Please wait and try again.',
  unavailable: 'The contact form is temporarily unavailable. You can email us directly at contact@studio17.world.'
};

const translations = Object.fromEntries(locales.map(locale => {
  if (locale === 'en') return [locale, {}];
  const data = JSON.parse(fs.readFileSync(path.join(root, 'locales', `${locale}.json`), 'utf8'));
  return [locale, data.strings];
}));
const translate = (locale, text) => translations[locale][text] || text;
const json = (body, status = 200) => ({ status, contentType: 'application/json', body: JSON.stringify(body) });
let activeBrowser;

const completeForm = async page => {
  await page.locator('[name="name"]').fill('Studio 17 QA');
  await page.locator('[name="email"]').fill('contact@studio17.world');
  await page.locator('[name="company"]').fill('Studio 17');
  await page.locator('[name="phone"]').fill('+351 210 000 000');
  await page.locator('[name="service"]').selectOption('website');
  await page.locator('[name="budget"]').selectOption('not-sure');
  await page.locator('[name="message"]').fill('Accessible contact-form quality assurance submission.');
  await page.locator('[name="consent"]').check();
};

(async () => {
  fs.mkdirSync(artifactDir, { recursive: true });
  const browser = await chromium.launch({ headless: true, channel: 'msedge' });
  activeBrowser = browser;
  const consoleErrors = [];

  for (const locale of locales) {
    for (const width of [1440, 390, 320]) {
      const context = await browser.newContext({ viewport: { width, height: 900 } });
      const page = await context.newPage();
      page.on('console', message => {
        if (message.type() === 'error') consoleErrors.push(`${locale}/${width}: ${message.text()}`);
      });
      const submittedPayloads = [];
      await page.route('**/api/contact', async route => {
        submittedPayloads.push(JSON.parse(route.request().postData() || '{}'));
        await route.fulfill(json({ ok: true }));
      });
      await page.goto(`${baseUrl}/contact?lang=${encodeURIComponent(locale)}`, { waitUntil: 'networkidle' });

      assert.equal(await page.locator('html').getAttribute('lang'), locale);
      assert.equal(await page.locator('html').getAttribute('dir'), locale === 'he' ? 'rtl' : 'ltr');
      assert.equal(await page.locator('i[data-lucide]').count(), 0);
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, `${locale} overflows at ${width}px`);
      assert.equal(await page.evaluate(() => [...document.images].every(image => image.complete && image.naturalWidth > 0)), true);
      assert.equal(await page.locator('[name="name"]').getAttribute('aria-required'), 'true');
      assert.equal(await page.locator('[name="message"]').getAttribute('aria-describedby'), 'contact-message-hint');
      assert.equal(await page.getByLabel(translate(locale, 'Name'), { exact: false }).count(), 1);
      assert.equal(await page.getByLabel(translate(locale, 'Email'), { exact: false }).count(), 1);
      assert.equal(await page.getByLabel(translate(locale, 'Project details'), { exact: false }).count(), 1);
      assert.equal(await page.getByLabel(translate(locale, 'I agree that Studio 17 may use these details to respond to my enquiry.'), { exact: false }).count(), 1);

      await page.locator('[data-contact-submit]').click();
      assert.equal(await page.locator('[data-contact-status]').textContent(), translate(locale, messages.invalid));
      assert.equal(await page.locator('[name="name"]').getAttribute('aria-invalid'), 'true');
      assert.equal(submittedPayloads.length, 0);

      await page.locator('[name="name"]').fill('Studio 17 QA');
      assert.equal(await page.locator('[name="name"]').getAttribute('aria-invalid'), null);
      await completeForm(page);
      await page.locator('[data-contact-submit]').click();
      await page.waitForFunction(() => document.querySelector('[data-contact-status]')?.dataset.state === 'success');
      assert.equal(await page.locator('[data-contact-status]').textContent(), translate(locale, messages.success));
      assert.equal(submittedPayloads.length, 1);
      assert.equal(submittedPayloads[0].language, locale);
      assert.equal(submittedPayloads[0].consent, 'yes');

      if (width === 1440 && (locale === 'en' || locale === 'he')) {
        await page.screenshot({ path: path.join(artifactDir, `contact-${locale}-desktop.png`), fullPage: true });
      }
      if (width === 390 && (locale === 'en' || locale === 'he')) {
        await page.screenshot({ path: path.join(artifactDir, `contact-${locale}-mobile.png`), fullPage: true });
      }
      await context.close();
    }
  }

  {
    const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    const page = await context.newPage();
    let requestCount = 0;
    await page.route('**/api/contact', route => {
      requestCount += 1;
      return route.fulfill(json({ ok: true }));
    });
    await page.goto(`${baseUrl}/contact?lang=en`, { waitUntil: 'networkidle' });
    await completeForm(page);

    await page.locator('[name="email"]').fill('invalid-email');
    await page.locator('[data-contact-submit]').click();
    assert.equal(await page.locator('[name="email"]').getAttribute('aria-invalid'), 'true');
    assert.equal(requestCount, 0);

    await page.locator('[name="email"]').fill('contact@studio17.world');
    assert.equal(await page.locator('[name="email"]').getAttribute('aria-invalid'), null);
    await page.locator('[name="message"]').fill('Too short');
    await page.locator('[data-contact-submit]').click();
    assert.equal(await page.locator('[name="message"]').getAttribute('aria-invalid'), 'true');
    assert.equal(requestCount, 0);

    await page.locator('[name="message"]').fill('Accessible contact-form quality assurance submission.');
    await page.locator('[name="consent"]').uncheck();
    await page.locator('[data-contact-submit]').click();
    assert.equal(await page.locator('[name="consent"]').getAttribute('aria-invalid'), 'true');
    assert.equal(requestCount, 0);
    await context.close();
  }

  {
    const context = await browser.newContext({ viewport: { width: 390, height: 900 } });
    const page = await context.newPage();
    let releaseRequest;
    const requestHeld = new Promise(resolve => { releaseRequest = resolve; });
    let requestCount = 0;
    await page.route('**/api/contact', async route => {
      requestCount += 1;
      await requestHeld;
      await route.fulfill(json({ ok: true }));
    });
    await page.goto(`${baseUrl}/contact?lang=en`, { waitUntil: 'networkidle' });
    await completeForm(page);
    await page.locator('[data-contact-form]').evaluate(form => {
      form.dispatchEvent(new SubmitEvent('submit', { bubbles: true, cancelable: true }));
      form.dispatchEvent(new SubmitEvent('submit', { bubbles: true, cancelable: true }));
    });
    await page.waitForFunction(() => document.querySelector('[data-contact-submit]')?.disabled === true);
    assert.equal(await page.locator('[data-contact-submit]').getAttribute('aria-busy'), 'true');
    assert.equal(await page.locator('[data-contact-status]').textContent(), messages.sending);
    assert.equal(requestCount, 1, 'Concurrent duplicate submits must create one request');
    releaseRequest();
    await page.waitForFunction(() => document.querySelector('[data-contact-status]')?.dataset.state === 'success');
    assert.equal(await page.locator('[data-contact-submit]').isEnabled(), true);
    await context.close();
  }

  for (const testCase of [
    { status: 429, key: 'rateLimited' },
    { status: 502, key: 'unavailable' }
  ]) {
    const context = await browser.newContext({ viewport: { width: 390, height: 900 } });
    const page = await context.newPage();
    await page.route('**/api/contact', route => route.fulfill(json({ ok: false }, testCase.status)));
    await page.goto(`${baseUrl}/contact?lang=pt-PT`, { waitUntil: 'networkidle' });
    await completeForm(page);
    await page.locator('[data-contact-submit]').click();
    await page.waitForFunction(() => document.querySelector('[data-contact-status]')?.dataset.state === 'error');
    assert.equal(await page.locator('[data-contact-status]').textContent(), translate('pt-PT', messages[testCase.key]));
    assert.equal(await page.locator('[data-contact-submit]').isEnabled(), true);
    await context.close();
  }

  {
    const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    const page = await context.newPage();
    await page.goto(`${baseUrl}/contact?lang=en`, { waitUntil: 'networkidle' });
    await page.locator('[name="name"]').focus();
    const focusOrder = [];
    for (let index = 0; index < 8; index += 1) {
      focusOrder.push(await page.evaluate(() => document.activeElement?.getAttribute('name')));
      await page.keyboard.press('Tab');
    }
    assert.deepEqual(focusOrder, ['name', 'email', 'company', 'phone', 'service', 'budget', 'message', 'consent']);
    await context.close();
  }

  assert.deepEqual(consoleErrors, []);
  await browser.close();
  console.log('Contact browser tests passed.');
})().catch(async error => {
  console.error(error);
  await activeBrowser?.close().catch(() => {});
  process.exit(1);
});
