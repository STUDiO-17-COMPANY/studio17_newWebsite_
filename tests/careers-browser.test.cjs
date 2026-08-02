'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const { chromium } = require('playwright');

const baseUrl = process.argv[2] || 'http://127.0.0.1:8765';
const artifactDir = process.argv[3] || path.join(process.cwd(), 'test-artifacts');

const role = {
  id: 'roleDocument123456',
  title: 'Growth Strategist',
  slug: 'growth-strategist',
  department: 'Growth',
  location: 'Europe',
  workModel: 'Remote',
  employmentType: 'Full-time',
  experienceLevel: 'Mid-level',
  applicationDeadline: 'Ongoing',
  applicationUrl: 'https://example.com/apply',
  summary: 'Build useful growth systems that connect strategy, communication and delivery.',
  about: ['You will work across strategy and delivery with a practical, collaborative team.'],
  responsibilities: ['Own the roadmap.', 'Turn decisions into clear actions.'],
  requirements: ['Clear written communication.', 'Experience shipping client work.'],
  niceToHave: ['Agency experience.'],
  offer: ['Remote collaboration.', 'Clear ownership.'],
  hiringProcess: ['Introductory conversation followed by a practical discussion.'],
  equalOpportunity: ['Applications are considered fairly.'],
  createdTime: '2026-08-01T12:00:00.000Z',
  modifiedTime: '2026-08-02T12:00:00.000Z'
};

const json = body => ({ status: 200, contentType: 'application/json', body: JSON.stringify(body) });
let activeBrowser;

(async () => {
  const browser = await chromium.launch({ headless: true, channel: 'msedge' });
  activeBrowser = browser;
  const consoleErrors = [];

  const newPage = async (width, height = 900) => {
    const context = await browser.newContext({ viewport: { width, height } });
    await context.addInitScript(() => localStorage.setItem('studio17-language', 'ru'));
    const page = await context.newPage();
    page.on('console', message => {
      if (message.type() === 'error') consoleErrors.push(`${message.type()}: ${message.text()}`);
    });
    return { context, page };
  };

  {
    const { context, page } = await newPage(390);
    await page.goto(`${baseUrl}/index.html?lang=he`, { waitUntil: 'networkidle' });
    assert.equal(await page.locator('html').getAttribute('lang'), 'he');
    assert.equal(await page.locator('html').getAttribute('dir'), 'rtl');
    const careerLinks = await page.locator('a[data-force-language="en"]').evaluateAll(links => links.map(link => link.getAttribute('href')));
    assert.ok(careerLinks.length >= 3);
    assert.equal(careerLinks.every(href => /[?&]lang=en(?:&|$)/.test(href)), true);
    await context.close();
  }

  for (const width of [1920, 1440, 1280, 1024, 900, 768, 390, 320]) {
    const { context, page } = await newPage(width);
    await page.route('**/api/careers', route => route.fulfill(json({ roles: [role], meta: { language: 'en' } })));
    await page.goto(`${baseUrl}/careers.html?lang=ru`, { waitUntil: 'networkidle' });
    await page.waitForSelector('.role-card:not(.role-card-skeleton)');

    assert.equal(await page.locator('html').getAttribute('lang'), 'en');
    assert.equal(await page.evaluate(() => localStorage.getItem('studio17-language')), 'ru');
    assert.match(page.url(), /[?&]lang=en(?:&|$)/);
    assert.equal(await page.locator('[data-roles-grid] .role-card').count(), 1);
    assert.equal(await page.locator('i[data-lucide]').count(), 0);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, `Careers overflow at ${width}px`);
    assert.equal(await page.evaluate(() => [...document.images].every(image => image.complete && image.naturalWidth > 0)), true);

    if (width === 1440) {
      await page.screenshot({ path: path.join(artifactDir, 'careers-desktop.png'), fullPage: true });
      await page.locator('.language-control').click();
      await page.locator('[data-lang="he"]').click();
      await page.waitForTimeout(100);
      assert.equal(await page.locator('html').getAttribute('lang'), 'en');
      assert.equal(await page.locator('[data-language-code]').first().textContent(), 'EN');
      assert.match(await page.locator('.role-card-link').getAttribute('href'), /lang=en/);
    }
    if (width === 390) await page.screenshot({ path: path.join(artifactDir, 'careers-mobile.png'), fullPage: true });
    await context.close();
  }

  {
    const { context, page } = await newPage(1280);
    await page.route('**/api/careers', route => route.fulfill(json({ roles: [], meta: { language: 'en' } })));
    await page.goto(`${baseUrl}/careers.html?lang=en`, { waitUntil: 'networkidle' });
    await page.waitForSelector('[data-roles-empty]:not([hidden])');
    assert.match(await page.locator('[data-roles-empty] h3').textContent(), /don't have any roles open/i);
    await context.close();
  }

  {
    const { context, page } = await newPage(1280);
    await page.route('**/api/careers', route => route.fulfill({ status: 503, contentType: 'application/json', body: JSON.stringify({ error: { code: 'CAREERS_NOT_CONFIGURED' } }) }));
    await page.goto(`${baseUrl}/careers.html?lang=en`, { waitUntil: 'networkidle' });
    await page.waitForSelector('[data-roles-error]:not([hidden])');
    assert.equal(await page.locator('[data-careers-retry]').isVisible(), true);
    await context.close();
  }

  for (const width of [1920, 1440, 1280, 1024, 900, 768, 390, 320]) {
    const { context, page } = await newPage(width);
    await page.route('**/api/career-role?*', route => route.fulfill(json({ role, meta: { language: 'en' } })));
    await page.goto(`${baseUrl}/career-role.html?id=${role.id}&lang=he`, { waitUntil: 'networkidle' });
    await page.waitForSelector('[data-role-content]:not([hidden])');
    assert.equal(await page.locator('[data-role-title]').textContent(), role.title);
    assert.equal(await page.locator('[data-role-apply]').getAttribute('href'), role.applicationUrl);
    assert.equal(await page.locator('[data-role-responsibilities] li').count(), 2);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, `Role overflow at ${width}px`);
    assert.equal(await page.locator('i[data-lucide]').count(), 0);
    if (width === 1440) await page.screenshot({ path: path.join(artifactDir, 'career-role-desktop.png'), fullPage: true });
    if (width === 390) await page.screenshot({ path: path.join(artifactDir, 'career-role-mobile.png'), fullPage: true });
    await context.close();
  }

  {
    const { context, page } = await newPage(390);
    await page.goto(`${baseUrl}/career-role.html?id=bad&lang=en`, { waitUntil: 'networkidle' });
    await page.waitForSelector('[data-role-error]:not([hidden])');
    assert.match(await page.locator('[data-role-error-title]').textContent(), /no longer open/i);
    await context.close();
  }

  const unexpectedConsoleErrors = consoleErrors.filter(message => !/Failed to load resource: the server responded with a status of 503/.test(message));
  assert.deepEqual(unexpectedConsoleErrors, []);
  await browser.close();
  console.log('Careers browser tests passed.');
})().catch(async error => {
  console.error(error);
  await activeBrowser?.close().catch(() => {});
  process.exit(1);
});
