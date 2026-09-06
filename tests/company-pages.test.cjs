'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');

test('Our Story publishes the complete approved seven-chapter narrative', () => {
  const html = read('our-story.html');
  assert.match(html, /canonical" href="https:\/\/www\.studio17\.world\/our-story"/);
  assert.equal((html.match(/class="story-chapter(?: [^"]*)?"/g) || []).length, 7);
  assert.match(html, /Most businesses did not have a lack of suppliers\. They had too many of them\./);
  assert.match(html, /That is what Studio 17 was created to do\./);
  assert.equal((html.match(/hreflang=/g) || []).length, 7);
});

test('Team page identifies only the approved founders and does not invent profile links', () => {
  const html = read('team.html');
  assert.match(html, /canonical" href="https:\/\/www\.studio17\.world\/team"/);
  assert.equal((html.match(/class="team-profile-card/g) || []).length, 2);
  assert.match(html, /Founder &amp; Director[\s\S]*?Hugo Filipe/);
  assert.match(html, /Co-founder[\s\S]*?Pedro/);
  assert.doesNotMatch(html, /linkedin\.com\/in\//i);
  assert.equal((html.match(/hreflang=/g) || []).length, 7);
});

test('company routes are available locally and included in XML and human sitemaps', () => {
  const server = read('dev-server.cjs');
  const xml = read('api/sitemap.js');
  const human = read('sitemap.html');
  const i18n = read('i18n.js');
  for (const [route, file] of [['/our-story', 'our-story.html'], ['/team', 'team.html']]) {
    assert.ok(server.includes(`['${route}', '${file}']`));
    assert.ok(xml.includes(`SITE_URL}${route}`));
    assert.ok(human.includes(`href="${route}"`));
    assert.ok(i18n.includes(`'${route}': '${file}'`));
  }
});
