'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { renderArticleLinks, renderRoleLinks } = require('../api/sitemap-page');

const template = fs.readFileSync(path.join(__dirname, '..', 'api', 'sitemap-template.html'), 'utf8');

assert.match(template, /href="\/services\/free-website">Free website/);
assert.doesNotMatch(template, /\/wip#for=free-website/);

assert.equal(fs.existsSync(path.join(__dirname, '..', 'sitemap.html')), false, 'A root sitemap.html would bypass the dynamic Vercel rewrite');
assert.match(template, /STUDIO17_DYNAMIC_ARTICLE_LINKS/, 'Human sitemap must expose the article insertion point');
assert.match(template, /STUDIO17_DYNAMIC_ROLE_LINKS/, 'Human sitemap must expose the careers insertion point');

const articles = renderArticleLinks([{
  slug: 'example-article',
  title: 'Example & Article',
  category: 'Insight',
  availableLanguages: ['en', 'el', 'pt-PT']
}]);

assert.match(articles, /href="\/insights\/example-article"/, 'English article URL must be linked');
assert.match(articles, /href="\/insights\/example-article\?lang=el"/, 'Greek article URL must be linked');
assert.match(articles, /href="\/insights\/example-article\?lang=pt-PT"/, 'Portuguese article URL must be linked');
assert.match(articles, /Example &amp; Article/, 'Article labels must be HTML escaped');

const categoryArticles = renderArticleLinks([
  { slug: 'client-result', title: 'Client result', category: 'Case Study', availableLanguages: ['en'] },
  { slug: 'company-update', title: 'Company update', category: 'News', availableLanguages: ['en'] }
]);
assert.match(categoryArticles, /href="\/case-studies\/client-result"/, 'Case Studies must use their own route');
assert.match(categoryArticles, /href="\/news\/company-update"/, 'News articles must use their own route');

const roles = renderRoleLinks([{ slug: 'growth-strategist', title: 'Growth Strategist' }]);
assert.match(roles, /href="\/careers\/growth-strategist"/, 'Published role URL must be linked');

console.log('Human sitemap rendering tests passed.');
