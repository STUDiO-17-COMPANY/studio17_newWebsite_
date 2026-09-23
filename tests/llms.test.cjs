'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const { getArticlePath } = require('../api/_article-render');
let articles = [
  { slug: 'older', category: 'Insight', title: 'Older', summary: 'Existing summary', publishedDate: '2026-08-01', availableLanguages: ['en', 'el'] },
  { slug: 'newer', category: 'Insight', title: 'New [article]', summary: 'One\nline <b>description</b>', publishedDate: '2026-09-01', availableLanguages: ['en'] },
  { slug: 'case', category: 'Case Study', title: 'Case', publishedDate: '2026-09-02', availableLanguages: ['en'] },
  { slug: 'news', category: 'News', title: 'News', publishedDate: '2026-09-03', availableLanguages: ['en'] }
];
let fail = false;
const context = { module: { exports: {} }, console: { error() {} }, require(name) {
  if (name === './_article-render') return { getArticlePath };
  if (name === './_google-articles') return { async listPublishedArticles(req, locale) {
    assert.equal(locale, 'en'); if (fail) throw Error('upstream failure'); return { articles };
  } };
  throw Error(name);
} };
vm.runInNewContext(fs.readFileSync(path.join(root, 'api/llms.js'), 'utf8'), context);
const call = async method => {
  const response = { headers: {}, setHeader(k, v) { this.headers[k] = v; }, end(body = '') { this.body = body; } };
  await context.module.exports({ method }, response); return response;
};
(async () => {
  const first = await call('GET');
  assert.equal(first.statusCode, 200);
  assert.equal(first.headers['Content-Type'], 'text/plain; charset=utf-8');
  assert.equal(first.headers.Location, undefined);
  assert.ok(first.body.startsWith('# Studio 17\n'));
  assert.doesNotMatch(first.body, /<html|<script|\?lang=|\/wip/);
  assert.ok(first.body.indexOf('/insights/newer') < first.body.indexOf('/insights/older'));
  for (const a of articles) assert.ok(first.body.includes('https://www.studio17.world' + getArticlePath(a, 'en')));
  assert.ok(first.body.includes('New \\[article\\]'));
  assert.ok(first.body.includes('One line description'));
  articles = articles.filter(a => a.slug !== 'case');
  assert.ok(!(await call('GET')).body.includes('/case-studies/case'));
  articles.push({ slug: 'published-now', title: 'Published now', category: 'News', publishedDate: '2026-09-23', availableLanguages: ['en'] });
  assert.ok((await call('GET')).body.includes('/news/published-now'));
  const head = await call('HEAD'); assert.equal(head.statusCode, 200); assert.equal(head.body, '');
  assert.equal((await call('POST')).statusCode, 405);
  fail = true;
  const unavailable = await call('GET'); assert.equal(unavailable.statusCode, 503); assert.equal(unavailable.headers['Cache-Control'], 'no-store');
  const config = JSON.parse(fs.readFileSync(path.join(root, 'vercel.json')));
  assert.equal(config.rewrites.find(r => r.source === '/llms.txt').destination, '/api/llms');
  for (const dir of [root, path.join(root, 'api')]) for (const name of fs.readdirSync(dir).filter(n => n.endsWith('.html'))) {
    const html = fs.readFileSync(path.join(dir, name), 'utf8');
    if (html.includes('</head>')) assert.equal((html.match(/rel="describedby"/g) || []).length, 1, name);
  }
  console.log('LLM directory tests passed.');
})().catch(error => { console.error(error); process.exitCode = 1; });
