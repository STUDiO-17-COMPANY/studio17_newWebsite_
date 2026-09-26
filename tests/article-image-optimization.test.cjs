'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');
const sharp = require('sharp');
const {
  articleImageUrl,
  normaliseImageFormat,
  normaliseImageWidth
} = require('../server/_article-image-url');
const { optimiseArticleImage } = require('../server/_google-articles');

test('article image URLs are versioned and constrained to supported variants', () => {
  assert.equal(normaliseImageWidth(1010), 960);
  assert.equal(normaliseImageWidth(1500), 1600);
  assert.equal(normaliseImageFormat('JPEG'), 'jpeg');
  assert.equal(normaliseImageFormat('svg'), 'webp');
  assert.equal(
    articleImageUrl('IMAGE_FILE_1234567890', 960, '2026-09-26T08:00:00Z'),
    '/api/article-image?id=IMAGE_FILE_1234567890&w=960&v=2026-09-26T080000Z&format=webp'
  );
});

test('article images are resized and converted before delivery', async () => {
  const source = await sharp({
    create: { width: 1600, height: 900, channels: 3, background: '#165dff' }
  }).png().toBuffer();
  const result = await optimiseArticleImage(source, 480, 'webp');
  const metadata = await sharp(result.bytes).metadata();
  assert.equal(result.mimeType, 'image/webp');
  assert.equal(metadata.width, 480);
  assert.equal(metadata.height, 270);
  assert.ok(result.bytes.length < source.length);
});
