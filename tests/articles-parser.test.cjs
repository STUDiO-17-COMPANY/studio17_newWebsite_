'use strict';

const assert = require('node:assert/strict');
const { buildArticle } = require('../server/_google-articles');

const paragraph = (text, style = 'NORMAL_TEXT', bullet = false) => ({
  paragraph: {
    paragraphStyle: { namedStyleType: style },
    ...(bullet ? { bullet: { listId: 'list-1', nestingLevel: 0 } } : {}),
    elements: [{ textRun: { content: text + '\n' } }]
  }
});
const nativeTable = rows => ({
  table: {
    tableRows: rows.map(cells => ({
      tableCells: cells.map(text => ({ content: [paragraph(text)] }))
    }))
  }
});
const tab = (title, rows) => ({
  tabProperties: { title },
  documentTab: {
    body: { content: rows.map(row => row.table ? row : paragraph(...row)) },
    lists: { 'list-1': { listProperties: { nestingLevels: [{ glyphType: 'BULLET' }] } } }
  }
});
const setupRows = [
  ['Publication status', 'HEADING_2'], ['Published'], ['Slug', 'HEADING_2'], ['drive-article-test'],
  ['Category', 'HEADING_2'], ['Insight'], ['Publication date', 'HEADING_2'], ['2026-08-12'],
  ['Author name', 'HEADING_2'], ['Studio 17'], ['Author role', 'HEADING_2'], ['Editorial team'],
  ['Author image', 'HEADING_2'], ['https://drive.google.com/file/d/AUTHORIMAGE1234567890/view'],
  ['Read time', 'HEADING_2'], ['6'], ['Cover image', 'HEADING_2'], ['https://drive.google.com/file/d/123456789012345678901/view'],
  ['Social share image', 'HEADING_2'], ['https://drive.google.com/file/d/ABCDEFGHIJabcdefghij/view'],
  ['Related article slugs', 'HEADING_2'], ['another-article']
];
const enRows = [
  ['SEO title', 'HEADING_2'], ['A useful Studio 17 article'],
  ['Meta description', 'HEADING_2'], ['A sufficiently clear article description for search and sharing.'],
  ['Article title', 'HEADING_2'], ['A useful Studio 17 article'],
  ['Highlighted title text', 'HEADING_2'], ['useful Studio 17'],
  ['Summary', 'HEADING_2'], ['A concise introduction to the subject.'],
  ['Cover image alt text', 'HEADING_2'], ['A team working around a table'],
  ['CTA heading', 'HEADING_2'], ['Ready to move forward?'],
  ['CTA copy', 'HEADING_2'], ['Talk with Studio 17 about the next practical step.'],
  ['CTA label', 'HEADING_2'], ['Contact Studio 17'],
  ['CTA URL', 'HEADING_2'], ['/contact'],
  ['Sidebar CTA title', 'HEADING_2'], ['Need help applying this?'],
  ['Sidebar CTA description', 'HEADING_2'], ['Get a practical recommendation from Studio 17.'],
  ['Sidebar CTA button text', 'HEADING_2'], ['Talk to our team'],
  ['Sidebar CTA button URL', 'HEADING_2'], ['/contact'],
  ['Article body', 'HEADING_1'],
  ['This is the opening article paragraph.'],
  ['A practical section', 'HEADING_2'],
  ['The section explains one useful idea.'],
  ['One list item', 'NORMAL_TEXT', true],
  ['Another list item', 'NORMAL_TEXT', true],
  nativeTable([
    ['SEO area', 'What it improves', 'When it matters'],
    ['Technical SEO', 'Crawling and indexation', 'Before expanding content'],
    ['Local SEO', 'Maps and local visibility', 'When serving a location']
  ]),
  ['Quote', 'HEADING_3'], ['Quote text: A useful quotation.'], ['Citation: Studio 17']
];
const incompletePt = [
  ['SEO title', 'HEADING_2'], ['[Required]'], ['Article body', 'HEADING_1'], ['[Write the introduction here.]']
];
const result = buildArticle(
  { id: 'doc-1', name: 'Drive Article Test', modifiedTime: '2026-08-12T10:00:00Z' },
  { tabs: [tab('SETUP', setupRows), tab('EN', enRows), tab('PT-PT', incompletePt)] }
);

assert.equal(result.valid, true);
assert.equal(result.article.slug, 'drive-article-test');
assert.equal(result.article.category, 'Insight');
assert.deepEqual(result.article.availableLanguages, ['en']);
assert.notEqual(result.article.coverImageId, result.article.shareImageId);
assert.equal(result.article.authorImageId, 'AUTHORIMAGE1234567890');
assert.equal(result.article.translations.en.ctaUrl, '/contact');
assert.equal(result.article.translations.en.sidebarCtaTitle, 'Need help applying this?');
assert.equal(result.article.translations.en.sidebarCtaUrl, '/contact');
assert.equal(result.article.translations.en.blocks.some(block => block.type === 'list' && block.items.length === 2), true);
assert.equal(result.article.translations.en.blocks.some(block => block.type === 'quote'), true);
const parsedTable = result.article.translations.en.blocks.find(block => block.type === 'table');
assert.deepEqual(parsedTable.headers, ['SEO area', 'What it improves', 'When it matters']);
assert.deepEqual(parsedTable.rows[1], ['Local SEO', 'Maps and local visibility', 'When serving a location']);

const optionalSetupIndex = setupRows.findIndex(row => row[0] === 'Author image');
const legacySetupRows = setupRows.filter((_, index) => index !== optionalSetupIndex && index !== optionalSetupIndex + 1);
const optionalLocaleStart = enRows.findIndex(row => row[0] === 'Sidebar CTA title');
const legacyEnRows = enRows.filter((_, index) => index < optionalLocaleStart || index >= optionalLocaleStart + 8);
const legacy = buildArticle(
  { id: 'doc-legacy', name: 'Legacy published article' },
  { tabs: [tab('SETUP', legacySetupRows), tab('EN', legacyEnRows)] }
);
assert.equal(legacy.valid, true);
assert.equal(legacy.article.authorImageId, '');
assert.equal(legacy.article.translations.en.sidebarCtaTitle, '');

const draft = buildArticle(
  { id: 'doc-2', name: 'Draft article' },
  { tabs: [tab('SETUP', setupRows.map(row => row[0] === 'Published' ? ['Draft'] : row)), tab('EN', enRows)] }
);
assert.equal(draft.valid, false);
assert.equal(draft.missing.includes('status'), true);

console.log('Article Google Docs parser tests passed.');
