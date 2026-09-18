'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const html = read('localization-and-translation.html');
const css = read('styles.css');
const menu = read('script.js');
const servicePages = read('service-pages.js');

assert.match(html, /data-supported-languages="en"/);
assert.match(html, /<link rel="canonical" href="https:\/\/www\.studio17\.world\/services\/localization-and-translation">/);
assert.match(html, /<meta name="robots" content="index,follow,max-image-preview:large">/);
assert.match(html, /"@type":"Service"/);
assert.match(html, /<h1[^>]*>[\s\S]*Localization and translation[\s\S]*new markets[\s\S]*<\/h1>/i);
assert.equal((html.match(/class="localization-capability-grid[^"]*"[\s\S]*?<\/section>/)?.[0].match(/<article>/g) || []).length, 6);
assert.equal((html.match(/class="localization-process-track[^"]*"[\s\S]*?<\/ol>/)?.[0].match(/<li>/g) || []).length, 5);
assert.equal((html.match(/class="website-faq-list"[\s\S]*?<\/section>/)?.[0].match(/<details>/g) || []).length, 8);
assert.doesNotMatch(html, /<h[12][^>]*>[^<]*\.<\/h[12]>/);
assert.doesNotMatch(html, /page-hero-icon/);
assert.doesNotMatch(html, /\/wip#for=localization-and-translation/);
assert.match(menu, /\['localization', 'Localization and Translation', '\/services\/localization-and-translation'\]/);
assert.match(menu, /'\/services\/localization-and-translation': 'localization-and-translation\.html'/);
assert.match(servicePages, /'\/services\/localization-and-translation': 'localization-and-translation\.html'/);
assert.match(css, /\.localization-main > section:not\(\.page-hero\)[^{]*\{[^}]*margin-top:\s*32px;[^}]*padding-block:\s*24px;[^}]*background:\s*var\(--paper\)/s);
assert.match(css, /\.localization-process-track li:not\(:last-child\)::after/);
assert.match(css, /@media \(prefers-reduced-motion: reduce\)[\s\S]*?\.localization-process-track li::after/);

console.log('Localization and Translation service page tests passed.');
