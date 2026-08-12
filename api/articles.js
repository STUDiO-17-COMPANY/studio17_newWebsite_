'use strict';

const { listPublishedArticles, sendError, sendJson } = require('./_google-articles');

module.exports = async function articlesHandler(request, response) {
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    response.statusCode = 405;
    response.setHeader('Allow', 'GET, HEAD');
    response.end();
    return;
  }
  try {
    const locale = typeof request.query?.lang === 'string' ? request.query.lang : 'en';
    const payload = await listPublishedArticles(request, locale);
    if (request.method === 'HEAD') {
      response.statusCode = 200;
      response.setHeader('Cache-Control', 'public, max-age=0, s-maxage=60, stale-while-revalidate=300');
      response.end();
      return;
    }
    sendJson(response, 200, payload, { cache: true });
  } catch (error) {
    console.error('Articles list failed', error?.code || error?.message);
    sendError(response, error);
  }
};
