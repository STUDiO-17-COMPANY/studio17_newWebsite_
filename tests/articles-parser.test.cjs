'use strict';

const assert = require('node:assert/strict');
const { buildArticle } = require('../api/_google-articles');

const paragraph = (text, style = 'NORMAL_TEXT', bullet = false) => ({
  paragraph: {
    paragraphStyle: { namedStyleType: style },
    ...(bullet ? { bullet: { listId: 'list-1', nestingLevel: 0 } } : {}),
    elements: [{ textRun: { content: text + '\n' } }]
  }
});
const tab = (title, rows) => ({
  tabProperties: { title },
  documentTab: {
    body: { content: rows.map(([text, style, bullet]) => paragraph(text, style, bullet)) },
    lists: { 'list-1': { listProperties: { nestingLevels: [{ glyphType: 'BULLET' }] } } }
  }
});
const setupRows = [
  ['Publication status', 'HEADING_2'], ['Published'], ['Slug', 'HEADING_2'], ['drive-article-test'],
  ['Category', 'HEADING_2'], ['Insight'], ['Publication date', 'HEADING_2'], ['2026-08-12'],
  ['Author name', 'HEADING_2'], ['Studio 17'], ['Author role', 'HEADING_2'], ['Editorial team'],
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
  ['Article body', 'HEADING_1'],
  ['This is the opening article paragraph.'],
  ['A practical section', 'HEADING_2'],
  ['The section explains one useful idea.'],
  ['One list item', 'NORMAL_TEXT', true],
  ['Another list item', 'NORMAL_TEXT', true],
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
assert.equal(result.article.translations.en.ctaUrl, '/contact');
assert.equal(result.article.translations.en.blocks.some(block => block.type === 'list' && block.items.length === 2), true);
assert.equal(result.article.translations.en.blocks.some(block => block.type === 'quote'), true);

const draft = buildArticle(
  { id: 'doc-2', name: 'Draft article' },
  { tabs: [tab('SETUP', setupRows.map(row => row[0] === 'Published' ? ['Draft'] : row)), tab('EN', enRows)] }
);
assert.equal(draft.valid, false);
assert.equal(draft.missing.includes('status'), true);

console.log('Article Google Docs parser tests passed.');
