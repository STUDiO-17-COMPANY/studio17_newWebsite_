'use strict';

const assert = require('node:assert/strict');
const { buildRole, parseRoleDocument, slugify } = require('../api/_google-careers');

const paragraph = (text, bullet = false, style = 'NORMAL_TEXT') => ({
  paragraph: {
    elements: [{ textRun: { content: `${text}\n` } }],
    paragraphStyle: { namedStyleType: style },
    ...(bullet ? { bullet: { listId: 'test-list' } } : {})
  }
});

const completeLines = [
  ['Department'], ['Growth'],
  ['Location'], ['Europe'],
  ['Work model'], ['Remote'],
  ['Employment type'], ['Full-time'],
  ['Experience level'], ['Mid'],
  ['Application deadline'], ['Ongoing'],
  ['Application URL'], ['https://example.com/apply'],
  ['Short summary'], ['Build useful growth systems.'],
  ['About the role'], ['This role connects strategy and delivery.'],
  ['What you will do'], ['Own the roadmap', true], ['Ship improvements', true],
  ['What we are looking for'], ['Clear communication', true],
  ['Nice to have'], ['Agency experience', true],
  ['What we offer'], ['Remote collaboration', true],
  ['Hiring process'], ['Introductory conversation followed by a practical discussion.'],
  ['Equal opportunity'], ['Applications are considered fairly.']
];

const document = { body: { content: completeLines.map(([text, bullet]) => paragraph(text, bullet)) } };
const file = {
  id: 'testDocument123',
  name: 'Growth Strategist',
  createdTime: '2026-08-01T12:00:00.000Z',
  modifiedTime: '2026-08-02T12:00:00.000Z'
};

const parsed = parseRoleDocument(document);
assert.equal(parsed.department, 'Growth');
assert.deepEqual(parsed.responsibilities, ['Own the roadmap', 'Ship improvements']);
assert.equal(parsed.applicationUrl, 'https://example.com/apply');

const boundaryDocument = {
  body: {
    content: [
      paragraph('Short summary', false, 'HEADING_2'),
      paragraph('A concise public summary.'),
      paragraph('Role description', false, 'HEADING_1'),
      paragraph('This heading and paragraph are structural guidance.'),
      paragraph('About the role', false, 'HEADING_2'),
      paragraph('The actual public description.'),
      paragraph('Final check before publishing', false, 'HEADING_1'),
      paragraph('This checklist must not leak into the public description.', true)
    ]
  }
};
const boundaries = parseRoleDocument(boundaryDocument);
assert.equal(boundaries.summary, 'A concise public summary.');
assert.deepEqual(boundaries.about, ['The actual public description.']);

const completed = buildRole(file, document);
assert.equal(completed.valid, true);
assert.equal(completed.role.title, 'Growth Strategist');
assert.equal(completed.role.slug, 'growth-strategist');
assert.equal(completed.role.applicationUrl, 'https://example.com/apply');

const insecure = JSON.parse(JSON.stringify(document));
insecure.body.content[13] = paragraph('http://example.com/apply');
const rejected = buildRole(file, insecure);
assert.equal(rejected.valid, false);
assert.ok(rejected.missing.includes('applicationUrl'));

const placeholders = {
  body: {
    content: [
      paragraph('Department'),
      paragraph('[Required — department]'),
      paragraph('Location'),
      paragraph('[Required — location]')
    ]
  }
};
assert.equal(parseRoleDocument(placeholders).department, '');
assert.equal(slugify('D\u00e9veloppeur Web'), 'developpeur-web');

console.log('Careers parser tests passed.');
