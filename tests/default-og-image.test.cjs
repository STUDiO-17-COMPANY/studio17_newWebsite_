'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const ROOT = path.resolve(__dirname, '..');
const DEFAULT_IMAGE = 'https://www.studio17.world/Images/general-OG-cover-image-compressed-2.jpg';

const SKIPPED_DIRECTORIES = new Set(['.git', '.vercel', 'node_modules', 'test-artifacts']);
const htmlFilesIn = directory => fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
  const file = path.join(directory, entry.name);
  if (entry.isDirectory()) return SKIPPED_DIRECTORIES.has(entry.name) ? [] : htmlFilesIn(file);
  return entry.name.endsWith('.html') && entry.name !== 'article.html' ? [file] : [];
});

const htmlFiles = htmlFilesIn(ROOT);

test('every non-article HTML document uses the shared Open Graph image', () => {
  for (const file of htmlFiles) {
    const source = fs.readFileSync(file, 'utf8');
    assert.match(source, new RegExp(`<meta property="og:image" content="${DEFAULT_IMAGE.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}">`), path.relative(ROOT, file));
    assert.match(source, /<meta name="twitter:card" content="summary_large_image">/, path.relative(ROOT, file));
    assert.match(source, new RegExp(`<meta name="twitter:image" content="${DEFAULT_IMAGE.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}">`), path.relative(ROOT, file));
  }
});

test('article template remains free of a default social image', () => {
  const source = fs.readFileSync(path.join(ROOT, 'article.html'), 'utf8');
  assert.doesNotMatch(source, /general-OG-cover-image-compressed-2/);
  assert.match(source, /<!-- ARTICLE_SEO -->/);
});
