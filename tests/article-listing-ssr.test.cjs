'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');
const { renderHomePage } = require('../api/home-page');
const { PAGE_SIZE, renderNewsPage } = require('../api/news-page');

const articles = Array.from({ length: 14 }, (_, index) => {
  const category = ['Case Study', 'Insight', 'News'][index % 3];
  const section = { 'Case Study': 'case-studies', Insight: 'insights', News: 'news' }[category];
  return {
    slug: `article-${index + 1}`, category, publishedDate: `2026-09-${String(24 - index).padStart(2, '0')}`,
    modifiedDate: null, authorName: 'Studio 17', authorRole: 'Editorial team', readTime: '5',
    coverImage: '/Images/news-partnership.webp', coverAlt: `Article ${index + 1}`,
    title: `${category} article ${index + 1}`, summary: `Published summary ${index + 1}`,
    availableLanguages: ['en'], url: `/${section}/article-${index + 1}`
  };
});

const cardCount = html => html.split('class="news-card"').length - 1;

test('homepage includes the latest six article cards in the initial HTML', () => {
  const html = renderHomePage(articles);
  assert.equal(cardCount(html), 6);
  assert.doesNotMatch(html, /Loading articles/);
  assert.match(html, /href="\/case-studies\/article-1"/);
});

test('News archive uses crawlable nine-card pagination', () => {
  assert.equal(PAGE_SIZE, 9);
  const first = renderNewsPage({ articles, page: 1, query: '', category: '', locale: 'en' });
  const second = renderNewsPage({ articles, page: 2, query: '', category: '', locale: 'en' });
  assert.equal(first.status, 200);
  assert.equal(second.status, 200);
  assert.equal(cardCount(first.body), 9);
  assert.equal(cardCount(second.body), 5);
  assert.match(first.body, /href="\/news\/page\/2#all-articles" rel="next"/);
  assert.match(second.body, /<link rel="canonical" href="https:\/\/www\.studio17\.world\/news\/page\/2"/);
  assert.match(second.body, /rel="prev"/);
});

test('News search is server-rendered and cannot become an indexable results page', () => {
  const result = renderNewsPage({ articles, page: 1, query: 'Case Study', category: '', locale: 'en' });
  assert.equal(result.status, 200);
  assert.equal(result.totalResults, 5);
  assert.equal(cardCount(result.body), 5);
  assert.match(result.body, /<meta name="robots" content="noindex,follow">/);
  assert.match(result.body, /<link rel="canonical" href="https:\/\/www\.studio17\.world\/news"/);
});

test('News category filters work in the first HTML without JavaScript', () => {
  const result = renderNewsPage({ articles, page: 1, query: '', category: 'insights', locale: 'en' });
  assert.equal(result.totalResults, 5);
  assert.equal(cardCount(result.body), 5);
  assert.match(result.body, /data-article-category="Insight"/);
  assert.doesNotMatch(result.body, /data-article-category="News"/);
});
