'use strict';

const fs = require('fs');
const path = require('path');
const { articleCacheControl, articleCdnCacheControl, listPublishedArticles } = require('../server/_google-articles');
const { renderArticleCard } = require('../server/_article-listing');

const template = fs.readFileSync(path.join(process.cwd(), 'home.template.html'), 'utf8');
const marker = '<!-- ARTICLE_HOME_FEED -->';

const renderHomePage = articles => template.replace(marker, articles.slice(0, 6).map(article => renderArticleCard(article, 'en')).join(''));

module.exports = async function homePageHandler(request, response) {
  if (!['GET', 'HEAD'].includes(request.method)) {
    response.statusCode = 405;
    response.setHeader('Allow', 'GET, HEAD');
    response.end();
    return;
  }
  try {
    const payload = await listPublishedArticles(request, 'en');
    const body = renderHomePage(payload.articles);
    response.statusCode = 200;
    response.setHeader('Content-Type', 'text/html; charset=utf-8');
    response.setHeader('Cache-Control', articleCacheControl(payload));
    response.setHeader('Vercel-CDN-Cache-Control', articleCdnCacheControl(payload));
    response.setHeader('Vercel-Cache-Tag', 'published-articles');
    response.end(request.method === 'HEAD' ? '' : body);
  } catch (error) {
    console.error('Homepage article rendering failed', error?.code || error?.message);
    const body = template.replace(marker, '<div class="article-feed-state article-feed-error"><p>Articles are temporarily unavailable.</p></div>');
    response.statusCode = 200;
    response.setHeader('Content-Type', 'text/html; charset=utf-8');
    response.setHeader('Cache-Control', 'no-store');
    response.end(request.method === 'HEAD' ? '' : body);
  }
};

module.exports.renderHomePage = renderHomePage;
