'use strict';
const fs = require('node:fs');
const path = require('node:path');
const { parseHTML } = require('linkedom');
const { pageContent } = require('../server/_faq-render.cjs');
const { validatePublicData } = require('../server/_faq-import.cjs');
const root = path.resolve(__dirname, '..');
const data = JSON.parse(fs.readFileSync(path.join(root, 'faq-data/approved.json'), 'utf8'));
validatePublicData(data);
const template = fs.readFileSync(path.join(root, 'faq-shell.html'), 'utf8');
if (!data.records.length || !data.categories.length) throw new Error('FAQ build refuses empty data');
// Generate all documents in memory before replacing any last-known-good page.
const files = [];
for (const category of [null, ...data.categories]) {
  const { document } = parseHTML(template);
  document.documentElement.setAttribute('data-supported-languages', 'en');
  document.documentElement.setAttribute('data-server-localized', '');
  document.documentElement.setAttribute('data-preserve-page-metadata', '');
  document.documentElement.lang = 'en';
  document.documentElement.dir = 'ltr';
  document.body.setAttribute('data-faq-category', category?.id || '');
  document.querySelector('main').innerHTML = pageContent(data, category);
  document.querySelectorAll('.faq-item').forEach(item => item.setAttribute('name', 'studio17-faq'));
  const trustedSource = parseHTML(fs.readFileSync(path.join(root, 'home.template.html'), 'utf8')).document.querySelector('section.trusted');
  const trusted = trustedSource.cloneNode(true);
  trusted.classList.add('faq-trusted');
  trusted.setAttribute('aria-labelledby', 'faq-trusted-title');
  trusted.querySelector('h2').id = 'faq-trusted-title';
  document.querySelector('main').append(trusted);
  const news = parseHTML(fs.readFileSync(path.join(root, 'home.template.html'), 'utf8')).document.querySelector('section.news-section').cloneNode(true);
  document.querySelector('main').append(news);
  const articleScript = document.createElement('script');
  articleScript.src = '/article-feed.js';
  articleScript.defer = true;
  document.head.append(articleScript);
  document.querySelectorAll('.language-menu [data-lang]:not([data-lang="en"])').forEach(node => node.remove());
  document.querySelectorAll('link[hreflang],script[type="application/ld+json"]').forEach(node => node.remove());
  const route = category?.path || '/faq';
  const title = category?.title || data.hub.title;
  const description = category?.description || data.hub.metaDescription;
  document.title = title;
  document.querySelector('meta[name="robots"]').setAttribute('content', 'index,follow');
  document.querySelector('meta[name="description"]').setAttribute('content', description);
  document.querySelector('link[rel="canonical"]').setAttribute('href', `https://www.studio17.world${route}`);
  for (const [selector, content] of [['meta[property="og:title"]', title], ['meta[property="og:description"]', description], ['meta[name="twitter:title"]', title], ['meta[name="twitter:description"]', description], ['meta[property="og:url"]', `https://www.studio17.world${route}`]]) document.querySelector(selector)?.setAttribute('content', content);
  const schema = document.createElement('script');
  schema.type = 'application/ld+json';
  schema.textContent = JSON.stringify({ '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Studio 17', item: 'https://www.studio17.world/' }, { '@type': 'ListItem', position: 2, name: 'FAQ', item: 'https://www.studio17.world/faq' }, ...(category ? [{ '@type': 'ListItem', position: 3, name: category.label, item: `https://www.studio17.world${route}` }] : [])] }).replace(/</g, '\\u003c');
  document.head.append(schema);
  document.querySelectorAll('[src],[href]').forEach(node => {
    for (const attr of ['src', 'href']) { const value = node.getAttribute(attr); if (value && !/^(?:\/|#|https?:|mailto:|tel:)/.test(value)) node.setAttribute(attr, '/' + value); }
  });
  files.push([route.slice(1) + '.html', ('<!doctype html>\n' + document.documentElement.outerHTML + '\n').replace(/[\t ]+$/gm, '')]);
}
files.push(['faq-search.json', JSON.stringify(data)]);
for (const [file, content] of files) { const target = path.join(root, file); fs.mkdirSync(path.dirname(target), { recursive: true }); fs.writeFileSync(target, content); }
// Remove only obsolete generated FAQ category documents after a successful build.
const categoryDirectory = path.join(root, 'faq');
for (const file of fs.readdirSync(categoryDirectory).filter(name => /^[a-z-]+\.html$/.test(name))) {
  if (!files.some(([name]) => name === `faq/${file}`)) {
    const target = path.join(categoryDirectory, file);
    if (fs.readFileSync(target, 'utf8').includes('data-faq-category=')) fs.unlinkSync(target);
  }
}
console.log(`Built FAQ hub + ${data.categories.length} categories with ${data.records.length} public records.`);
