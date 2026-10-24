'use strict';

const fs = require('fs');
const path = require('path');
const { articleCacheControl, articleCdnCacheControl, listPublishedArticles } = require('../server/_google-articles');
const { renderArticleCard } = require('../server/_article-listing');
const { localePrefix, normaliseLocale } = require('../server/_language-routing');

const marker = '<!-- ARTICLE_HOME_FEED -->';
const readTemplate = locale => {
  const prefix = localePrefix(locale);
  const filename = prefix ? path.join(process.cwd(), '_localized', prefix, 'home.template.html') : path.join(process.cwd(), 'home.template.html');
  return fs.readFileSync(filename, 'utf8');
};

const renderHomePage = (articles, locale = 'en') => readTemplate(locale).replace(marker, articles.slice(0, 6).map(article => renderArticleCard(article, locale)).join(''));

module.exports = async function homePageHandler(request, response) {
  if (!['GET', 'HEAD'].includes(request.method)) {
    response.statusCode = 405;
    response.setHeader('Allow', 'GET, HEAD');
    response.end();
    return;
  }
  try {
    const locale = normaliseLocale(request.query?.lang);
    const payload = await listPublishedArticles(request, locale);
    const body = renderHomePage(payload.articles, locale);
    response.statusCode = 200;
    response.setHeader('Content-Type', 'text/html; charset=utf-8');
    response.setHeader('Cache-Control', articleCacheControl(payload));
    response.setHeader('Vercel-CDN-Cache-Control', articleCdnCacheControl(payload));
    response.setHeader('Vercel-Cache-Tag', 'published-articles');
    response.end(request.method === 'HEAD' ? '' : body);
  } catch (error) {
    console.error('Homepage article rendering failed', error?.code || error?.message);
    const locale = normaliseLocale(request.query?.lang);
    const body = readTemplate(locale).replace(marker, '<div class="article-feed-state article-feed-error"><p>Articles are temporarily unavailable.</p></div>');
    response.statusCode = 200;
    response.setHeader('Content-Type', 'text/html; charset=utf-8');
    response.setHeader('Cache-Control', 'no-store');
    response.end(request.method === 'HEAD' ? '' : body);
  }
};

module.exports.renderHomePage = renderHomePage;
