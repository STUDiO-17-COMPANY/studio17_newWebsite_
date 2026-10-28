'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { parseHTML } = require('linkedom');

const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');

test('homepage portfolio keeps the shared section gap and comparison follows it', () => {
  const html = read('home.template.html');
  const css = read('styles.css');
  const { document } = parseHTML(html);
  const portfolio = document.querySelector('.home-work-showcase');
  const comparison = document.querySelector('.agency-comparison');

  assert.ok(portfolio, 'portfolio section missing');
  assert.equal(portfolio.nextElementSibling, comparison, 'comparison must follow the portfolio');
  assert.match(css, /\.home-work-showcase\s*\{[^}]*margin-top:\s*var\(--section-gap\)/);
  assert.match(css, /\.agency-comparison\s*\{[^}]*margin-top:\s*var\(--section-gap\)/);
});

test('agency comparison is complete, accessible and uses approved Lucide cues', () => {
  const { document } = parseHTML(read('home.template.html'));
  const section = document.querySelector('.agency-comparison');
  const panels = [...section.querySelectorAll('.agency-comparison-panel')];

  assert.equal(section.getAttribute('aria-labelledby'), 'agency-comparison-title');
  assert.equal(panels.length, 2);
  assert.equal(panels[0].querySelectorAll('li').length, 13);
  assert.equal(panels[1].querySelectorAll('li').length, 13);
  assert.equal(panels[0].querySelector('[data-lucide="thumbs-up"]')?.parentElement.getAttribute('aria-hidden'), 'true');
  assert.equal(panels[1].querySelector('[data-lucide="x"]')?.parentElement.getAttribute('aria-hidden'), 'true');
  assert.equal(panels[0].querySelector('ul').getAttribute('aria-label'), 'Studio 17 advantages');
  assert.equal(panels[1].querySelector('ul').getAttribute('aria-label'), 'Common limitations of other marketing agencies');
});

test('comparison copy is available to every homepage language build', () => {
  const required = [
    'Studio 17 vs. Other Marketing Agencies',
    'Other Marketing Agencies',
    'Unbeatable Pricing with no compromise on quality',
    'Full ownership and control of business assets and data',
    'Higher agency fees for comparable services',
    'Limited access to accounts, platforms or project assets'
  ];

  for (const locale of ['pt-PT', 'es', 'el', 'ru', 'he']) {
    const strings = JSON.parse(read(`locales/${locale}.json`)).strings;
    for (const key of required) assert.ok(strings[key], `${locale} is missing: ${key}`);
  }
});
