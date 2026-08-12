'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const demo = require('../article-demo.cjs');
const { buildSeo, renderArticleMain } = require('../api/_article-render');

const root = path.resolve(__dirname, '..');
const template = fs.readFileSync(path.join(root, 'article.html'), 'utf8');
const home = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const news = fs.readFileSync(path.join(root, 'news.html'), 'utf8');
const styles = fs.readFileSync(path.join(root, 'styles.css'), 'utf8');
const behavior = fs.readFileSync(path.join(root, 'article.js'), 'utf8');
const rendered = renderArticleMain(demo);
const seo = buildSeo(demo);

assert.match(template, /class="article-page"/);
assert.match(template, /<!-- ARTICLE_SEO -->/);
assert.match(template, /<!-- ARTICLE_MAIN -->/);
assert.match(rendered, /How Car Dealerships Can/);
assert.match(rendered, /Founder of Studio 17/);
assert.match(rendered, /7 minutes/);
assert.match(rendered, /datetime="2026-06-22"/);
assert.match(rendered, /class="shell article-cover/);
assert.match(rendered, /class="article-inline-image"/);
assert.match(rendered, /class="article-cta"/);
assert.match(seo, /"@type":"Article"/);
assert.match(seo, /name="robots" content="index,follow,max-image-preview:large"/);
assert.match(seo, /og:image" content="https:\/\/www\.studio17\.world\/Images\/news-partnership\.webp"/);
assert.doesNotMatch(seo, /og:image" content="https:\/\/www\.studio17\.world\/Images\/case-automotive\.webp"/);
assert.match(home, /data-article-feed="home"/);
assert.match(home, /article-feed\.js/);
assert.match(news, /class="news-page"/);
assert.match(news, /data-article-feed="archive"/);
assert.match(styles, /\.article-hero/);
assert.match(styles, /\.news-archive-grid/);
assert.match(behavior, /data-article-progress/);
assert.match(behavior, /navigator\.share/);
assert.match(behavior, /__STUDIO17_ARTICLE_LANGUAGES__/);

console.log('Automatic article-page tests passed.');
