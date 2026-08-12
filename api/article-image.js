'use strict';

const { getArticleImage, sendError } = require('./_google-articles');

module.exports = async function articleImageHandler(request, response) {
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    response.statusCode = 405;
    response.setHeader('Allow', 'GET, HEAD');
    response.end();
    return;
  }
  try {
    const id = typeof request.query?.id === 'string' ? request.query.id : '';
    const image = await getArticleImage(id, request);
    response.statusCode = 200;
    response.setHeader('Content-Type', image.mimeType);
    response.setHeader('X-Content-Type-Options', 'nosniff');
    response.setHeader('Content-Disposition', 'inline');
    response.setHeader('Cache-Control', 'public, max-age=86400, immutable');
    response.setHeader('CDN-Cache-Control', 'public, s-maxage=86400, stale-while-revalidate=604800');
    response.end(request.method === 'HEAD' ? '' : image.bytes);
  } catch (error) {
    console.error('Article image failed', error?.code || error?.message);
    sendError(response, error);
  }
};
