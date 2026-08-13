const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const css = fs.readFileSync(path.join(root, 'styles.css'), 'utf8');

const partners = [
  ['01', 'Terrassi Villa', 'https://www.terrassivilla.com/'],
  ['02', 'RG Automotive', 'https://www.instagram.com/rgautomotive.stand/'],
  ['03', '100 Pratos', 'https://www.100pratos.pt/'],
  ['04', 'For Social Media Lovers', 'https://forsocialmedialovers.com/'],
  ['05', 'Chome Rats', 'https://www.chromerats.com/'],
  ['06', 'Lodgify', 'https://www.lodgify.com'],
  ['07', 'Selene Island', 'https://www.instagram.com/seleneisland/'],
  ['08', 'Phós Optics', 'https://www.phosoptics.com/en'],
  ['09', 'Event Studio Cyprus', 'https://www.instagram.com/eventstudiocy/']
];

for (const [number, name, url] of partners) {
  assert.match(html, new RegExp(`data-partner="${number}"[^>]+href="${url.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"`));
  assert.match(html, new RegExp(`aria-label="Visit ${name}"`));
  assert.match(html, new RegExp(`<span>${name}</span>`));
  assert.ok(fs.existsSync(path.join(root, 'Images', `partner-${number}.png`)), `Missing partner-${number}.png`);
}

assert.equal((html.match(/data-partner="09"/g) || []).length, 4, 'partner-09 must appear once in every marquee set');

assert.doesNotMatch(html, /partner-phos\.png/);
assert.match(css, /\.partner-marquee:hover \.partner-track/);
assert.match(css, /\.partner-item:hover span, \.partner-item:focus-visible span/);
assert.match(css, /animation-play-state:\s*paused/);

console.log('Interactive partner carousel tests passed.');
