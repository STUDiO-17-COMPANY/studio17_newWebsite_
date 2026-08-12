'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { getPublishedArticleBySlug } = require('./_google-articles');
const { buildSeo, escapeHtml, renderArticleMain } = require('./_article-render');

let cachedTemplate = '';

const readTemplate = () => {
  const candidates = [path.resolve(process.cwd(), 'article.html'), path.resolve(__dirname, '..', 'article.html')];
  const templatePath = candidates.find(candidate => fs.existsSync(candidate));
  if (!templatePath) throw new Error('Article template was not bundled.');
  return fs.readFileSync(templatePath, 'utf8');
};

const errorPage = (status, message) => `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,follow"><title>Article unavailable | Studio 17</title><link rel="stylesheet" href="/styles.css"></head><body class="article-page"><main class="article-error"><div class="shell"><p>Studio 17</p><h1>${escapeHtml(message)}</h1><a class="solid-button" href="/news">View all articles</a></div></main></body></html>`;

module.exports = async function articlePageHandler(request, response) {
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    response.statusCode = 405;
    response.setHeader('Allow', 'GET, HEAD');
    response.end();
    return;
  }
  try {
    const slug = typeof request.query?.slug === 'string' ? request.query.slug : '';
    const locale = typeof request.query?.lang === 'string' ? request.query.lang : 'en';
    const article = await getPublishedArticleBySlug(slug, locale, request);
    cachedTemplate ||= readTemplate();
    const html = cachedTemplate
      .replace('<!-- ARTICLE_SEO -->', buildSeo(article))
      .replace('<!-- ARTICLE_MAIN -->', renderArticleMain(article))
      .replace('</head>', `<script>window.__STUDIO17_ARTICLE_LANGUAGES__=${JSON.stringify(article.availableLanguages).replace(/</g, '\\u003c')};</script></head>`)
      .replace('<html lang="en">', `<html lang="${escapeHtml(article.locale)}"${article.locale === 'he' ? ' dir="rtl"' : ''}>`);
    response.statusCode = 200;
    response.setHeader('Content-Type', 'text/html; charset=utf-8');
    response.setHeader('X-Content-Type-Options', 'nosniff');
    response.setHeader('Cache-Control', 'public, max-age=0, s-maxage=60, stale-while-revalidate=300');
    response.end(request.method === 'HEAD' ? '' : html);
  } catch (error) {
    const status = Number(error?.status) || 503;
    const message = status === 404 ? error.message : 'Articles are temporarily unavailable.';
    response.statusCode = status;
    response.setHeader('Content-Type', 'text/html; charset=utf-8');
    response.setHeader('Cache-Control', 'no-store');
    response.end(request.method === 'HEAD' ? '' : errorPage(status, message));
  }
};
