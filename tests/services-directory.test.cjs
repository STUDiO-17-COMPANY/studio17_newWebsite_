const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { parseHTML } = require('linkedom');
const root = path.join(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'script.js'), 'utf8');
const menu = vm.runInNewContext(`(${source.slice(source.indexOf('  const servicesMegaMenu = ') + '  const servicesMegaMenu = '.length, source.indexOf('  const visibilityMegaMenu =')).trim().replace(/;$/, '')})`);
for (const prefix of ['', 'pt', 'es', 'el', 'ru', 'he']) {
  const file = prefix ? `_localized/${prefix}/services.html` : 'services.html';
  const { document } = parseHTML(fs.readFileSync(path.join(root, file), 'utf8'));
  const groups = document.querySelectorAll('.service-category');
  assert.equal(groups.length, menu.length);
  [...groups].forEach((group, index) => {
    assert.equal(group.id, `directory-${menu[index].categoryKey}`);
    const links = group.querySelectorAll('.service-row a');
    assert.equal(links.length, menu[index].items.length);
    [...links].forEach((link, row) => {
      const url = new URL(link.getAttribute('href'), 'https://www.studio17.world');
      const cleanPath = url.pathname.replace(/^\/(pt|es|el|ru|he)(?=\/)/, '');
      assert.equal(cleanPath + url.hash, menu[index].items[row][2]);
    });
  });
  assert.equal(document.querySelector('.page-hero-icon'), null);
}
console.log('Services directory matches every header service destination in all six languages.');
