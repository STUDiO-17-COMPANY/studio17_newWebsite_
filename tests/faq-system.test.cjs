'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { spawnSync } = require('node:child_process');
const { parseHTML } = require('linkedom');
const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const data = JSON.parse(read('faq-data/approved.json'));
const search = require('../faq-search-engine');
const { importFaq, saveSnapshot, PUBLIC_FIELDS } = require('../server/_faq-import.cjs');
const { questionHtml } = require('../server/_faq-render.cjs');

test('Q02/Q11–17/Q19/Q22/Q26: crawlable complete category HTML, approved copy and safe dataset', () => {
  assert.equal(data.records.length, 229); assert.equal(data.categories.length, 12);
  const all = new Set();
  for (const category of data.categories) {
    const { document } = parseHTML(read(category.path.slice(1) + '.html'));
    assert.equal(document.querySelector('h1').textContent, category.heading);
    assert.equal(document.title, category.title);
    assert.equal(document.querySelector('link[rel="canonical"]').href, `https://www.studio17.world${category.path}`);
    assert.equal(document.querySelector('meta[name="description"]').content, category.description);
    const items = document.querySelectorAll('.faq-item');
    assert.equal(items.length, data.records.filter(record => record.categoryId === category.id).length);
    for (const item of items) {
      assert.ok(!all.has(item.id)); all.add(item.id);
      const record = data.records.find(record => record.id === item.id);
      assert.equal(item.querySelector('.faq-answer p').textContent, record.answer);
      assert.equal(item.querySelector('summary').getAttribute('aria-controls'), item.querySelector('.faq-answer').id);
      assert.equal(item.querySelectorAll('.faq-context-links a').length, record.ctas.length);
    }
    assert.equal(document.querySelectorAll('[hreflang]').length, 0);
    assert.equal(document.documentElement.dataset.supportedLanguages, 'en');
    assert.equal(JSON.parse(document.querySelector('script[type="application/ld+json"]').textContent)['@type'], 'BreadcrumbList');
  }
  assert.equal(all.size, 229);
  const { document } = parseHTML(read('faq.html'));
  assert.equal(document.querySelectorAll('.faq-item').length, 10);
  assert.equal(document.querySelector('h1').textContent, 'Your questions. Answered.');
  assert.equal(document.querySelector('input').getAttribute('placeholder'), 'Search a question, service, or topic...');
  assert.equal(document.querySelectorAll('.faq-topic-filters a').length, 13);
  assert.ok(document.querySelector('.page-hero .hero-media img').getAttribute('src').includes('FAQ%20Hero%20Section-compressed.avif'));
  assert.equal(document.querySelector('.faq-experience-eyebrow'), null);
  assert.ok(document.querySelector('.faq-workspace > .faq-topic-filters'));
  assert.ok(document.querySelector('.faq-workspace > .faq-help'));
  assert.ok(document.querySelector('button[type="submit"] [data-lucide="search"]'));
  assert.ok(document.querySelector('[data-faq-more] [data-lucide="arrow-down"]'));
  assert.ok(document.querySelector('.faq-item summary [data-lucide="plus"]'));
  assert.ok(document.querySelector('.faq-trusted .partner-marquee'));
  for (const record of data.records) assert.deepEqual(Object.keys(record).sort(), [...PUBLIC_FIELDS].sort());
  assert.doesNotMatch(read('faq-search.json'), /Source \/ Evidence|Editorial Notes|Verification Required|Owner Decisions|Demand Evidence|reviewed against current sources/);
  assert.ok(!data.categories.some(category => ['events', 'ai-solutions'].includes(category.id)));
});

test('Q03/Q04/Q25: full-library weighted search, synonyms, case, accents and speed', () => {
  const run = (query, category) => search.search(data.records, data.categories, query, category);
  assert.ok(run('one page').some(record => record.id === 'FAQ-0002'));
  assert.ok(run('one page').some(record => record.id === 'FAQ-0015'));
  assert.ok(run('website price')[0].categoryId === 'pricing');
  assert.ok(run('Instagram').some(record => ['social-media', 'content-creation', 'advertising'].includes(record.categoryId)));
  assert.deepEqual(run('WÉBSITE').map(record => record.id), run('website').map(record => record.id));
  assert.equal(run('somethingqzxvvnothing').length, 0);
  assert.ok(run('search', 'seo').every(record => record.categoryId === 'seo'));
  const unseen = data.records[200];
  assert.ok(run(unseen.question).some(record => record.id === unseen.id));
  const start = performance.now();
  for (let i = 0; i < 50; i++) search.search([...data.records, ...data.records, ...data.records], data.categories, 'website price');
  console.log(`50 searches over 687 fixture records: ${Math.round(performance.now() - start)}ms (local, not a Lighthouse score)`);
});

const fixture = () => {
  const headers = ['FAQ ID', 'Language', 'Category', 'Question (EN)', 'Short Answer (EN)', 'Priority', 'Content Status', 'Content Quality Review', 'Verification Required', 'Category URL', 'Standalone Page?', 'CTA 1 Label', 'CTA 1 URL', 'CTA 2 Label', 'CTA 2 URL', 'CTA 3 Label', 'CTA 3 URL'];
  const row = ['FAQ-0001', 'EN', 'SEO', 'A question?', 'An answer.', 'High', 'Approved', 'Ready for Publication', 'None — reviewed against current sources on 2026-11-01.', '/faq/seo', 'No', 'SEO', 'https://www.studio17.world/services/seo', '', '', '', ''];
  return { values: [headers, row], routes: { values: [[], ['Hub', 'All', 'All', '/faq', 1, 'Title', 'Heading'], ['seo', 'SEO', 'SEO', '/faq/seo', 1, 'SEO', 'SEO', '', 'Intro'], ['Copy', 'Eyebrow', 'FAQ'], ['Copy', 'Supporting paragraph', 'Intro'], ['Copy', 'Meta description', 'Desc'], ['Copy', 'Search placeholder', 'Search']] }, ctaDirectory: { values: [[], ['SEO', 'https://www.studio17.world/services/seo']] } };
};
test('Q18/Q19: importer rejects unsafe and unapproved rows without leaking internal fields', () => {
  assert.equal(importFaq(fixture()).records.length, 1);
  for (const [column, value] of [['Language', 'PT'], ['Short Answer (EN)', ''], ['Category', 'Other'], ['Content Status', 'Unknown'], ['Priority', 'Urgent'], ['Content Quality Review', 'Requires Owner Approval'], ['Verification Required', 'Ask owner'], ['CTA 1 URL', ''], ['CTA 1 URL', 'javascript:alert(1)'], ['CTA 1 URL', 'https://www.studio17.world/wip'], ['Category URL', '/faq/not-real']]) {
    const f = fixture(); f.values[1][f.values[0].indexOf(column)] = value;
    assert.throws(() => importFaq(f), /row 2 \(FAQ-0001\)/);
  }
  const duplicate = fixture(); duplicate.values.push([...duplicate.values[1]]);
  assert.throws(() => importFaq(duplicate), /duplicate ID/);
  assert.throws(() => importFaq({ ...fixture(), values: [] }), /empty sheet/);
  assert.doesNotMatch(questionHtml({ ...data.records[0], answer: '<script>alert(1)</script>' }), /<script>/);
  assert.ok(questionHtml({ ...data.records[0], ctas: [] }).includes(data.records[0].id));
});

test('Q20/Q21: missing credentials and bad import preserve last-known-good snapshot', () => {
  const before = read('faq-data/approved.json');
  const missing = spawnSync(process.execPath, ['scripts/import-faq.cjs', '--sheet'], { cwd: root, env: { ...process.env, FAQ_GOOGLE_ACCESS_TOKEN: '' }, encoding: 'utf8' });
  assert.equal(missing.status, 1); assert.match(missing.stderr, /missing FAQ_GOOGLE_ACCESS_TOKEN/);
  const invalid = spawnSync(process.execPath, ['scripts/import-faq.cjs'], { cwd: root, input: '{}', encoding: 'utf8' });
  assert.equal(invalid.status, 1); assert.equal(read('faq-data/approved.json'), before);
  for (const mock of ["throw new Error('Simulated Sheet timeout')", "return {ok:false,status:503}", "return {ok:true,json:async()=>({values:[]})}"]) {
    const code = `global.fetch=async()=>{${mock}};process.argv=[process.execPath,'scripts/import-faq.cjs','--sheet'];require('./scripts/import-faq.cjs');`;
    const failure = spawnSync(process.execPath, ['-e', code], { cwd: root, env: { ...process.env, FAQ_GOOGLE_ACCESS_TOKEN: 'fixture-not-a-real-token' }, encoding: 'utf8' });
    assert.equal(failure.status, 1); assert.equal(read('faq-data/approved.json'), before);
  }
});

test('Q21: successful fixture refresh and rollback use validated atomic snapshots', () => {
  const directory = fs.mkdtempSync(path.join(require('node:os').tmpdir(), 'studio17-faq-test-'));
  const target = path.join(directory, 'approved.json');
  const first = fixture(); saveSnapshot(first, target);
  const baseline = fs.readFileSync(target, 'utf8');
  const updated = fixture(); updated.values[1][4] = 'Updated approved fixture answer.';
  saveSnapshot(updated, target);
  assert.equal(JSON.parse(fs.readFileSync(target, 'utf8')).records[0].answer, 'Updated approved fixture answer.');
  const bad = fixture(); bad.values[1][4] = '';
  assert.throws(() => saveSnapshot(bad, target));
  assert.equal(JSON.parse(fs.readFileSync(target, 'utf8')).records[0].answer, 'Updated approved fixture answer.');
  saveSnapshot(first, target);
  assert.equal(fs.readFileSync(target, 'utf8'), baseline);
  fs.unlinkSync(target); fs.rmdirSync(directory);
});

test('Q16: sitemap includes the hub and only populated English FAQ categories', async () => {
  const articles = require('../server/_google-articles');
  const careers = require('../server/_google-careers');
  const original = { articles: articles.listPublishedArticles, careers: careers.listPublishedRoles };
  articles.listPublishedArticles = async () => ({ articles: [] });
  careers.listPublishedRoles = async () => ({ roles: [] });
  delete require.cache[require.resolve('../api/sitemap')];
  try {
    let body;
    await require('../api/sitemap')({ method: 'GET' }, { setHeader() {}, end: value => { body = value; } });
    for (const category of data.categories) assert.ok(body.includes(`<loc>https://www.studio17.world${category.path}</loc>`));
    assert.ok(body.includes('<loc>https://www.studio17.world/faq</loc>'));
    assert.doesNotMatch(body, /\/faq\/(?:events|ai-solutions)|\/(?:pt|es|el|ru|he)\/faq/);
  } finally {
    articles.listPublishedArticles = original.articles; careers.listPublishedRoles = original.careers;
    delete require.cache[require.resolve('../api/sitemap')];
  }
});

test('Q05–10/Q23: UI state, full search, Load More, original IDs and consent', async () => {
  const { document, window } = parseHTML(read('faq.html'));
  let url = new URL('https://www.studio17.world/faq');
  const entries = [], telemetry = [];
  let consent = 'denied';
  const history = { state: null, pushState(state, _, target) { entries.push({ state, target }); this.state = state; url = new URL(target, url); }, replaceState(state, _, target) { this.state = state; url = new URL(target, url); } };
  window.Studio17FaqSearch = search;
  window.Studio17Analytics = { getConsent: () => consent };
  window.gtag = (...args) => telemetry.push(args);
  const context = { document, window, URL, history, get location() { return url; }, fetch: async () => ({ ok: true, json: async () => data }), setTimeout, clearTimeout };
  vm.runInNewContext(read('faq-experience.js'), context);
  await new Promise(resolve => setTimeout(resolve, 10));
  assert.equal(document.querySelectorAll('.faq-item').length, 10);
  document.querySelector('[data-faq-more]').click();
  assert.equal(document.querySelectorAll('.faq-item').length, 20);
  assert.equal(new Set([...document.querySelectorAll('.faq-item')].map(node => node.id)).size, 20);
  const input = document.querySelector('input'); input.value = 'website'; input.dispatchEvent(new window.Event('input'));
  const category = document.querySelector('[data-faq-category="websites"]'); category.click();
  assert.equal(input.value, 'website'); assert.equal(url.pathname, '/faq/websites'); assert.equal(entries.length, 1);
  assert.equal(document.querySelectorAll('.faq-item').length, 10);
  document.querySelector('[data-faq-clear]').click(); assert.equal(url.pathname, '/faq/websites'); assert.equal(input.value, '');
  input.value = 'xxxnonsensezzz'; input.dispatchEvent(new window.Event('input'));
  assert.equal(document.querySelectorAll('.faq-item').length, 0); assert.equal(document.querySelector('[data-faq-empty]').hidden, false);
  assert.equal(document.querySelector('meta[name="robots"]').content, 'noindex,follow');
  assert.equal(telemetry.length, 0);
  consent = 'granted'; document.querySelector('[data-faq-empty-clear]').click(); document.querySelector('[data-faq-category=""]').click();
  assert.ok(telemetry.some(args => args[1] === 'faq_category_select'));
  assert.ok(!JSON.stringify(telemetry).includes('xxxnonsensezzz'));
  const state = entries[0]; history.state = state.state; url = new URL(state.target, url); window.dispatchEvent(new window.Event('popstate'));
  assert.equal(document.body.dataset.faqCategory, 'websites'); assert.equal(input.value, 'website');
  document.querySelector('[data-faq-clear]').click(); document.querySelector('[data-faq-category=""]').click();
  document.querySelector('[data-faq-more]').click();
  // Linkedom does not model non-bubbling native toggle capture; browser keyboard checks cover native details.
  const details = document.querySelector('.faq-item'); details.open = true; details.dispatchEvent(new window.Event('toggle', { bubbles: true }));
  details.querySelector('[data-faq-cta]').click();
  input.value = 'xxxnonsensezzz'; input.dispatchEvent(new window.Event('input'));
  await new Promise(resolve => setTimeout(resolve, 480));
  for (const event of ['faq_search', 'faq_zero_results', 'faq_category_select', 'faq_open', 'faq_load_more', 'faq_cta_click']) assert.ok(telemetry.some(args => args[1] === event), event);
  assert.ok(!JSON.stringify(telemetry).includes('xxxnonsensezzz'));
});
