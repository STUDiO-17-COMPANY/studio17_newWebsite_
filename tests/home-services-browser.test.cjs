'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');

const baseUrl = process.argv[2] || 'http://127.0.0.1:4173';
const artifactDir = process.argv[3] || path.join(process.cwd(), 'test-artifacts', 'home-services');
const categories = ['Social Media', 'Website', 'Content creation', 'Advertisement', 'By industry', 'Events'];
const services = {
  social: ['Social Media Management', 'Social Media Automation', 'Growth strategy', 'Community management', 'Free Audit'],
  website: ['Website Development', 'Website Revamp', 'Website Design', 'SEO', 'GEO', 'Copywriting', 'Localization and Translation', 'Maintenance', 'Free Website'],
  content: ['Filming', 'Photography', 'Video editing', 'Graphic design', 'Digital design', 'Scripting', 'AI Generation'],
  ads: ['Meta ads', 'Google ads', 'Social Media ads', 'Influencer ads', 'UGC creators', 'Email ads'],
  industry: ['Automotive', 'Restaurants', 'Health', 'E-Commerce', 'Individual Influencers', 'Education', 'Local Business', 'SMEs'],
  events: ['Presential Events', 'Online Events']
};

(async () => {
  fs.mkdirSync(artifactDir, { recursive: true });
  const browser = await chromium.launch({ headless: true, channel: 'msedge' });
  const errors = [];

  for (const width of [1440, 390]) {
    const context = await browser.newContext({ viewport: { width, height: 900 } });
    await context.addInitScript(() => {
      localStorage.setItem('studio17-language', 'en');
      localStorage.setItem('studio17-analytics-consent-v1', 'denied');
    });
    const page = await context.newPage();
    page.on('console', message => { if (message.type() === 'error') errors.push(`${width}: ${message.text()}`); });
    await page.goto(`${baseUrl}/`, { waitUntil: 'networkidle' });

    assert.equal(await page.title(), 'Marketing Agency for your problems | Built for modern growth');
    assert.equal((await page.locator('#hero-title').textContent()).replace(/\s+/g, ' ').trim(), 'Marketing Agency for your problems');
    assert.equal((await page.locator('.hero-copy h2').innerText()).trim(), 'Built for modern growth');
    assert.deepEqual(await page.locator('[data-service-tab]').allTextContents(), categories);
    assert.equal(await page.locator('[data-service-tab="social"]').getAttribute('aria-selected'), 'true');
    assert.equal(await page.locator('.service-section-heading .service-carousel-controls').count(), 1);
    assert.equal(await page.locator('.service-feature [data-service-prev], .service-feature [data-service-next]').count(), 0);

    for (const [category, expected] of Object.entries(services)) {
      if (width > 600) await page.locator(`[data-service-tab="${category}"]`).click();
      else await page.locator('[data-service-category-select]').selectOption(category);
      const actual = width > 600
        ? await page.locator('.industry-list [data-service-item]').allTextContents()
        : await page.locator('[data-service-item-select] option').allTextContents();
      assert.deepEqual(actual, expected, `${category} at ${width}px`);
    }

    if (width > 600) {
      await page.locator('[data-service-tab="social"]').click();
      const controls = page.locator('.service-carousel-controls button');
      await page.locator('#hero-title').hover();
      assert.equal(await controls.nth(0).evaluate(element => getComputedStyle(element).color), await controls.nth(1).evaluate(element => getComputedStyle(element).color));
      await page.locator('[data-service-next]').click();
      assert.equal(await page.locator('.industry-list [aria-selected="true"]').innerText(), 'Social Media Automation');
      await controls.nth(0).hover();
      assert.equal(await controls.nth(0).evaluate(element => {
        const reference = document.createElement('span');
        reference.style.background = 'var(--blue)';
        document.body.appendChild(reference);
        const matches = getComputedStyle(element).backgroundColor === getComputedStyle(reference).backgroundColor;
        reference.remove();
        return matches;
      }), true);
    }

    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, `Homepage overflow at ${width}px`);
    await page.screenshot({ path: path.join(artifactDir, `homepage-services-${width}.png`), fullPage: true });
    await context.close();
  }

  const context = await browser.newContext({ viewport: { width: 390, height: 900 } });
  await context.addInitScript(() => {
    localStorage.setItem('studio17-language', 'pt-PT');
    localStorage.setItem('studio17-analytics-consent-v1', 'denied');
  });
  const page = await context.newPage();
  await page.goto(`${baseUrl}/?lang=pt-PT`, { waitUntil: 'networkidle' });
  assert.equal(await page.title(), 'Agência de marketing para os seus problemas | Criada para o crescimento moderno');
  assert.equal((await page.locator('#hero-title').textContent()).replace(/\s+/g, ' ').trim(), 'Agência de marketing para os seus problemas');
  assert.equal((await page.locator('.hero-copy h2').innerText()).trim(), 'Criada para o crescimento moderno');
  assert.deepEqual(await page.locator('[data-service-category-select] option').allTextContents(), ['Redes sociais', 'Website', 'Criação de conteúdos', 'Publicidade', 'Por setor', 'Eventos']);
  await context.close();

  assert.deepEqual(errors, []);
  await browser.close();
  console.log('Homepage services browser tests passed.');
})().catch(error => {
  console.error(error);
  process.exit(1);
});
