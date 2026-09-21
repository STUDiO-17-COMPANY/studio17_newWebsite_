'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const script = fs.readFileSync(path.join(root, 'script.js'), 'utf8');
const css = fs.readFileSync(path.join(root, 'styles.css'), 'utf8');

assert.match(script, /const createAnima = \(\) =>/);
assert.match(script, /data-lucide="message-circle"/);
assert.match(script, /Hi, I’m Anima, your quick-answer assistant/);
assert.match(script, /Prepared answers · Not live chat/);
assert.match(script, /Talk with a human/);
assert.match(script, /data-anima-conversation aria-live="polite"/);
assert.match(script, /reduceMotion\.matches \? 80 : 2200/);
assert.match(script, /studio17:animaopen/);
assert.match(script, /studio17:siteassistopen/);
assert.match(script, /MutationObserver\(syncVisibility\)/);
assert.equal((script.match(/id: '[^']+',\n\s+question:/g) || []).length, 6);
assert.match(script, /anima\.hidden = unavailable/);
assert.doesNotMatch(script, /setTimeout\(revealLauncher, 18000\)/);
assert.doesNotMatch(script, /class="anima-mark"/);

for (const route of ['/contact', '/career-role', '/wip', '/privacy-policy', '/cookie-policy', '/terms']) {
  assert.ok(script.includes(`'${route}'`), `Anima must be excluded from ${route}`);
}

assert.match(css, /\.anima\s*\{[^}]*bottom:\s*86px/);
assert.match(css, /\.anima-launcher\s*\{[^}]*width:\s*54px/);
assert.match(css, /\.anima-launcher\s*\{[^}]*background:\s*var\(--blue\)/);
assert.match(css, /\.anima-panel\s*\{[^}]*border:\s*3px solid var\(--blue\)/);
assert.match(css, /\.anima-typing span[^}]*animation:\s*anima-typing/);
assert.match(css, /\.anima-typing\s*\{[^}]*display:\s*flex/);
assert.match(css, /\.anima-typing span\s*\{[^}]*display:\s*block[^}]*flex:\s*0 0 7px/);
assert.match(css, /@media \(prefers-reduced-motion: reduce\)[\s\S]*?\.anima-launcher/);
assert.match(css, /@media \(max-width: 600px\)[\s\S]*?\.anima-panel\s*\{[^}]*position:\s*fixed/);

console.log('Anima assistant tests passed.');
