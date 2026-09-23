'use strict';

// One shared head rule for static pages and the HTML templates bundled into server routes.
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const link = '<link rel="describedby" href="https://www.studio17.world/llms.txt">';
for (const directory of [root, path.join(root, 'api')]) {
  for (const name of fs.readdirSync(directory).filter(name => name.endsWith('.html'))) {
    const file = path.join(directory, name);
    const source = fs.readFileSync(file, 'utf8');
    if (!source.includes('</head>')) continue;
    const clean = source.replace(/\s*<link\b[^>]*rel="describedby"[^>]*>/g, '');
    const result = clean.replace('</head>', `\n  ${link}\n</head>`);
    if (result !== source) fs.writeFileSync(file, result);
  }
}
