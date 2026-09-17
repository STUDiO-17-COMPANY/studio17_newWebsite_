'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { renderArticleLinks, renderRoleLinks } = require('../api/sitemap-page');

const template = fs.readFileSync(path.join(__dirname, '..', 'sitemap.html'), 'utf8');

assert.match(template, /STUDIO17_DYNAMIC_ARTICLE_LINKS/, 'Human sitemap must expose the article insertion point');
assert.match(template, /STUDIO17_DYNAMIC_ROLE_LINKS/, 'Human sitemap must expose the careers insertion point');

const articles = renderArticleLinks([{
  slug: 'example-article',
  title: 'Example & Article',
  availableLanguages: ['en', 'el', 'pt-PT']
}]);

assert.match(articles, /href="\/insights\/example-article"/, 'English article URL must be linked');
assert.match(articles, /href="\/insights\/example-article\?lang=el"/, 'Greek article URL must be linked');
assert.match(articles, /href="\/insights\/example-article\?lang=pt-PT"/, 'Portuguese article URL must be linked');
assert.match(articles, /Example &amp; Article/, 'Article labels must be HTML escaped');

const roles = renderRoleLinks([{ slug: 'growth-strategist', title: 'Growth Strategist' }]);
assert.match(roles, /href="\/careers\/growth-strategist"/, 'Published role URL must be linked');

console.log('Human sitemap rendering tests passed.');
