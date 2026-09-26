'use strict';

const { getArticleImage, sendError } = require('../server/_google-articles');
const { normaliseImageFormat, normaliseImageWidth } = require('../server/_article-image-url');

const ONE_YEAR = 60 * 60 * 24 * 365;

module.exports = async function articleImageHandler(request, response) {
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    response.statusCode = 405;
    response.setHeader('Allow', 'GET, HEAD');
    response.end();
    return;
  }
  try {
    const id = typeof request.query?.id === 'string' ? request.query.id : '';
    const width = normaliseImageWidth(request.query?.w);
    const format = normaliseImageFormat(request.query?.format);
    const version = typeof request.query?.v === 'string' ? request.query.v : '1';
    const image = await getArticleImage(id, request, { width, format, version });
    if (image.redirectUrl) {
      response.statusCode = 307;
      response.setHeader('Location', image.redirectUrl);
      response.setHeader('Cache-Control', `public, max-age=${ONE_YEAR}, immutable`);
      response.setHeader('CDN-Cache-Control', `public, s-maxage=${ONE_YEAR}, immutable`);
      response.end();
      return;
    }
    response.statusCode = 200;
    response.setHeader('Content-Type', image.mimeType);
    response.setHeader('X-Content-Type-Options', 'nosniff');
    response.setHeader('Content-Disposition', 'inline');
    response.setHeader('Cache-Control', `public, max-age=${ONE_YEAR}, immutable`);
    response.setHeader('CDN-Cache-Control', `public, s-maxage=${ONE_YEAR}, immutable`);
    response.end(request.method === 'HEAD' ? '' : image.bytes);
  } catch (error) {
    console.error('Article image failed', error?.code || error?.message);
    sendError(response, error);
  }
};
