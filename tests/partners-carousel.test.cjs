const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const about = fs.readFileSync(path.join(root, 'about.html'), 'utf8');
const work = fs.readFileSync(path.join(root, 'work.html'), 'utf8');
const css = fs.readFileSync(path.join(root, 'styles.css'), 'utf8');

const partners = [
  ['01', 'Terrassi Villa', 'https://www.terrassivilla.com/'],
  ['02', 'RG Automotive', 'https://www.instagram.com/rgautomotive.stand/'],
  ['03', '100 Pratos', 'https://www.100pratos.pt/'],
  ['04', 'For Social Media Lovers', 'https://forsocialmedialovers.com/'],
  ['05', 'Chome Rats', 'https://www.chromerats.com/'],
  ['07', 'Selene Island', 'https://www.instagram.com/seleneisland/'],
  ['08', 'Phós Optics', 'https://www.phosoptics.com/en'],
  ['09', 'Event Studio Cyprus', 'https://www.instagram.com/eventstudiocy/'],
  ['10', 'Nerouppos Barber Shop', 'https://share.google/qqDIgdgsQUuOc6XeN'],
  ['11', 'Snapdrop', 'https://www.snappdrop.com'],
  ['12', 'Teaching Economics', 'https://www.instagram.com/teaching.economics/'],
  ['13', 'Miguel Labs', 'https://miguellabs.xyz/']
];

for (const [number, name, url] of partners) {
  assert.match(html, new RegExp(`data-partner="${number}"[^>]+href="${url.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"`));
  assert.match(html, new RegExp(`aria-label="Visit ${name}"`));
  assert.match(html, new RegExp(`<span>${name}</span>`));
  const extension = number === '13' ? 'svg' : ['11', '12'].includes(number) ? 'webp' : 'png';
  assert.ok(fs.existsSync(path.join(root, 'Images', `partner-${number}.${extension}`)), `Missing partner-${number}.${extension}`);
}

assert.equal((html.match(/data-partner="11"/g) || []).length, 4, 'partner-11 must appear once in every marquee set');
assert.equal((html.match(/data-partner="12"/g) || []).length, 4, 'partner-12 must appear once in every marquee set');
assert.equal((html.match(/data-partner="13"/g) || []).length, 4, 'partner-13 must appear once in every marquee set');
assert.equal((about.match(/data-partner="12"/g) || []).length, 2, 'About must include partner-12 in both marquee sets');
assert.equal((about.match(/data-partner="13"/g) || []).length, 2, 'About must include partner-13 in both marquee sets');
assert.equal((work.match(/data-partner="12"/g) || []).length, 2, 'Work must include partner-12 in both marquee sets');
assert.equal((work.match(/data-partner="13"/g) || []).length, 2, 'Work must include partner-13 in both marquee sets');
assert.match(css, /\.partner-set\s*\{[^}]*grid-template-columns:\s*repeat\(12,/s, 'the partner grid must expose all twelve partners in one row');
assert.match(css, /--partner-row-width:\s*max\(1512px,/, 'the partner row must preserve logo width after adding partner-13');
assert.doesNotMatch(html, /Lodgify|lodgify\.com|data-partner="06"/i, 'Lodgify must not appear in the partner carousel');

assert.doesNotMatch(html, /partner-phos\.png/);
assert.match(css, /\.partner-marquee:hover \.partner-track/);
assert.match(css, /\.partner-item:hover span, \.partner-item:focus-visible span/);
assert.match(css, /animation-play-state:\s*paused/);

console.log('Interactive partner carousel tests passed.');
