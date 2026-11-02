'use strict';
const assert = require('node:assert/strict');
const data = require('../faq-data/approved.json');
const { parseHTML } = require('linkedom');
const base = process.argv[2] || 'http://127.0.0.1:4173';
(async () => {
  for (const category of [null, ...data.categories]) {
    const route = category?.path || '/faq';
    const response = await fetch(base + route, { redirect: 'manual' });
    assert.equal(response.status, 200, route);
    const { document } = parseHTML(await response.text());
    assert.equal(document.title, category?.title || data.hub.title);
    assert.equal(document.querySelector('link[rel="canonical"]').href, `https://www.studio17.world${route}`);
    assert.equal(document.querySelectorAll('.faq-item').length, category ? data.records.filter(record => record.categoryId === category.id).length : 10);
    console.log(`200 + no-JS HTML + canonical: ${route}`);
  }
  for (const route of ['/faq/ai-solutions', '/faq/events']) assert.equal((await fetch(base + route)).status, 404);
  const search = await fetch(base + '/faq?q=website');
  assert.match(search.headers.get('x-robots-tag'), /noindex/);
  const legacy = await fetch(base + '/pt/faq', { redirect: 'manual' });
  assert.equal(legacy.status, 301);
  console.log('Empty categories 404; search noindex; legacy locale redirect verified on preview server.');
})().catch(error => { console.error(error); process.exitCode = 1; });
