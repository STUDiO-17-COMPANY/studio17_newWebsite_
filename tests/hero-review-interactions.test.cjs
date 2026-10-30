const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const { parseHTML } = require('linkedom');
const path = require('node:path');
const root = path.join(__dirname, '..');
for (const language of ['pt', 'es', 'el', 'ru', 'he']) {
  const { document, window } = parseHTML(fs.readFileSync(path.join(root, '_localized', language, 'home.template.html'), 'utf8'));
  document.querySelector('[data-hero-audit-form]').remove();
  let rotate;
  vm.runInNewContext(fs.readFileSync(path.join(root, 'homepage-audit.js'), 'utf8'), {
    document, window: { setInterval: callback => { rotate = callback; } }, matchMedia: () => ({ matches: false })
  });
  for (let i = 0; i < 4; i++) {
    rotate();
    document.querySelectorAll('[data-hero-word]').forEach(element => {
      assert.equal(element.children.length, 3);
      assert.equal([...element.children].filter(child => child.style.visibility === 'visible').length, 1);
    });
  }
  vm.runInNewContext(fs.readFileSync(path.join(root, 'testimonials.js'), 'utf8'), { document, window });
  const card = document.querySelector('[data-review="yiannos"]');
  const quote = card.querySelector(':scope > p');
  const translated = quote.textContent;
  const button = card.querySelector('button');
  button.dispatchEvent(new window.Event('click'));
  assert.ok(button.querySelector('.testimonial-action-arrow'));
  assert.equal(quote.lang, 'el');
  assert.match(quote.textContent, /^Η συνεργασία/);
  button.dispatchEvent(new window.Event('click'));
  assert.equal(quote.textContent, translated);
  assert.equal(card.querySelector('a').href, 'https://share.google/uubw1oWLCdYN3xs2M');
}
console.log('Hero rotation and original-review controls passed for five languages.');
