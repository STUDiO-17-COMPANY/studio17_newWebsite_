'use strict';

const ARTICLE_IMAGE_WIDTHS = Object.freeze([160, 480, 720, 960, 1200, 1280, 1600]);
const ARTICLE_IMAGE_FORMATS = Object.freeze(['webp', 'jpeg']);

const normaliseImageWidth = value => {
  const requested = Number.parseInt(value, 10);
  if (!Number.isFinite(requested)) return 960;
  return ARTICLE_IMAGE_WIDTHS.reduce((closest, width) =>
    Math.abs(width - requested) < Math.abs(closest - requested) ? width : closest
  , ARTICLE_IMAGE_WIDTHS[0]);
};

const normaliseImageFormat = value => ARTICLE_IMAGE_FORMATS.includes(String(value || '').toLowerCase())
  ? String(value).toLowerCase()
  : 'webp';

const imageVersion = value => String(value || '1').replace(/[^A-Za-z0-9_-]+/g, '').slice(0, 48) || '1';

const articleImageUrl = (id, width = 960, version = '1', format = 'webp') => {
  const params = new URLSearchParams({
    id: String(id || ''),
    w: String(normaliseImageWidth(width)),
    v: imageVersion(version),
    format: normaliseImageFormat(format)
  });
  return `/api/article-image?${params}`;
};

module.exports = {
  ARTICLE_IMAGE_FORMATS,
  ARTICLE_IMAGE_WIDTHS,
  articleImageUrl,
  imageVersion,
  normaliseImageFormat,
  normaliseImageWidth
};
