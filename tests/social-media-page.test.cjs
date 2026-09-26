'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const html = read('social-media.html');

test('social media page is an English-only canonical commercial page', () => {
  assert.match(html, /<html lang="en" data-supported-languages="en">/);
  assert.match(html, /<link rel="canonical" href="https:\/\/www\.studio17\.world\/services\/social-media">/);
  assert.equal((html.match(/hreflang=/g) || []).length, 2);
  assert.match(html, /<h1 id="social-media-title"><span>We Take Care<\/span> of Your Social Media<\/h1>/);
  assert.match(html, /Better Social Media Starts With a Clear Strategy/);
  assert.match(html, /href="\/wip#for=social-media-pricing"[^>]*>Explore social media services/);
  assert.match(html, /href="\/contact\?service=social-media"[^>]*>Talk to Sales/);
});

test('social media decision journey contains the approved sections', () => {
  for (const heading of ['What differentiates us', 'from the others', 'Social Media services', 'What is the social media problem', 'you are facing?', 'A clear process', 'Start with a smaller step', 'Questions businesses ask']) {
    assert.ok(html.includes(heading), heading);
  }
  for (const title of ['Unbeatable Pricing', 'Everything Under One Team', 'Faster Production With AI']) assert.ok(html.includes(title), title);
  assert.equal((html.match(/data-social-service="/g) || []).length, 4);
  assert.equal((html.match(/data-social-service-panel="/g) || []).length, 4);
  for (const service of ['Social Media Management', 'Social Media Automation', 'Growth Strategy', 'Community Management']) assert.ok(html.includes(service), service);
  const problemGrid = html.match(/<div class="website-problem-grid[\s\S]*?<\/div><\/div><\/section>/)?.[0] || '';
  assert.equal((problemGrid.match(/<a /g) || []).length, 6);
  for (const question of ['Why is my social media not growing?', 'Why are my social media posts not getting engagement?', 'Why is nobody seeing my social media posts?', "Why don't I know what to post on social media?", 'Why is my social media not generating leads?', "I don't know what we need"]) assert.ok(html.includes(question), question);
  assert.equal((html.match(/<li><span>0[1-5]<\/span>/g) || []).length, 5);
  assert.ok(html.includes('Free Social Media Audit'));
  assert.ok(html.includes('Social Media Strategy Session'));
  assert.equal((html.match(/<details>/g) || []).length, 9);
  assert.doesNotMatch(html, /Selected (?:social media )?work/i);
});

test('social media service metadata, enhancement and discovery are connected', () => {
  const jsonLd = JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
  assert.equal(jsonLd['@type'], 'Service');
  assert.equal(jsonLd.hasOfferCatalog.itemListElement.length, 4);
  const servicePages = read('service-pages.js');
  assert.match(servicePages, /const enhanceSocialMediaServices = \(\) =>/);
  assert.match(servicePages, /data-social-service-group-select/);
  assert.match(servicePages, /enhanceSocialMediaServices\(\)/);
  assert.match(read('styles.css'), /\.social-media-service-tabs\s*\{[^}]*grid-template-columns:\s*repeat\(2,minmax\(0,1fr\)\)/);
  assert.match(read('vercel.json'), /"source": "\/services\/social-media", "destination": "\/social-media"/);
  assert.match(read('dev-server.cjs'), /\['\/services\/social-media', 'social-media\.html'\]/);
  assert.match(read('api/sitemap.js'), /`\$\{SITE_URL\}\/services\/social-media`/);
  assert.match(read('api/llms.js'), /\['Social Media Services', '\/services\/social-media'/);
  assert.match(read('script.js'), /href: '\/services\/social-media'/);
  assert.match(read('script.js'), /'\/services\/social-media': 'social-media\.html'/);
  assert.doesNotMatch(read('script.js'), /href: '\/wip#for=social-media'/);
});
