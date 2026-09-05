'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const profile = 'https://www.trustpilot.com/review/studio17.world';
const htmlFiles = fs.readdirSync(root).filter(file => file.endsWith('.html'));

let linkCount = 0;
for (const file of htmlFiles) {
  const source = fs.readFileSync(path.join(root, file), 'utf8');
  assert.doesNotMatch(source, /href="\/wip\?for=trustpilot"/, `${file} still sends Trustpilot visitors to WIP`);

  const links = source.match(new RegExp(`href="${profile.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"[^>]*`, 'g')) || [];
  for (const link of links) {
    assert.match(link, /target="_blank"/i, `${file} Trustpilot link must open the external profile safely`);
    assert.match(link, /rel="noopener noreferrer"/i, `${file} Trustpilot link must isolate the external page`);
  }
  linkCount += links.length;
}

assert.ok(linkCount >= 15, `expected Trustpilot links across shared page families, found ${linkCount}`);
const homepage = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
assert.match(homepage, /class="shell testimonial-section-link"[\s\S]*?See all our reviews on Trustpilot/, 'homepage must include the plain-text Trustpilot CTA below testimonials');
assert.doesNotMatch(homepage, /testimonial-section-link[\s\S]*?<img[^>]+trustpilot/i, 'homepage Trustpilot CTA must not use restricted logo artwork');
console.log(`Trustpilot link tests passed (${linkCount} links).`);
