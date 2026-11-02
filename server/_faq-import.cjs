'use strict';
const STATUS = ['Idea', 'Draft', 'Review', 'Approved', 'Published', 'Archive'];
const PUBLIC_FIELDS = ['id', 'locale', 'categoryId', 'question', 'answer', 'searchTerms', 'service', 'ctas'];
const importFaq = ({ values, routes, ctaDirectory }) => {
  if (!Array.isArray(values) || values.length < 2) throw new Error('FAQ import: missing or empty sheet');
  const headers = values[0];
  const required = ['FAQ ID', 'Language', 'Category', 'Question (EN)', 'Short Answer (EN)', 'Priority', 'Content Status', 'Content Quality Review', 'Verification Required', 'Category URL', 'Standalone Page?'];
  required.push(...[1, 2, 3].flatMap(n => [`CTA ${n} Label`, `CTA ${n} URL`]));
  for (const key of required) if (!headers.includes(key)) throw new Error(`FAQ import: missing column ${key}`);
  const categories = routes.values.slice(1).filter(row => /^\/faq\//.test(row[3] || '') && Number(row[4]) > 0).map(row => ({ id: row[0], source: row[1], label: row[2], path: row[3], count: Number(row[4]), title: row[5], heading: row[6], description: row[8] }));
  const baseline = new Map(ctaDirectory.values.slice(1).filter(row => row[0]).map(row => [row[0], row[1]]));
  const seen = new Set();
  const priorities = { High: 0, Medium: 1, Low: 2 };
  const eligible = [];
  let excluded = 0;
  values.slice(1).forEach((row, index) => {
    if (!row.some(Boolean)) return;
    const get = key => String(row[headers.indexOf(key)] || '').trim();
    const id = get('FAQ ID');
    const fail = reason => { throw new Error(`FAQ import row ${index + 2} (${id || 'missing ID'}): ${reason}`); };
    if (!/^FAQ-\d{4}$/.test(id)) fail('invalid ID');
    if (get('Language') !== 'EN') fail('unapproved locale');
    if (seen.has(id)) fail('duplicate ID/locale');
    seen.add(id);
    if (!STATUS.includes(get('Content Status'))) fail('unknown status');
    if (!Object.hasOwn(priorities, get('Priority'))) fail('unknown priority');
    if (!['Yes', 'No'].includes(get('Standalone Page?'))) fail('invalid standalone value');
    if (get('Category') === 'Events' || !['Approved', 'Published'].includes(get('Content Status'))) { excluded++; return; }
    const category = categories.find(item => item.source === get('Category'));
    if (!category) fail('unknown or withheld category');
    if (get('Content Quality Review') !== 'Ready for Publication') fail('readiness blocks publication');
    if (get('Verification Required') !== 'None — reviewed against current sources on 2026-11-01.') fail('verification requires a new editorial review');
    if (!get('Question (EN)') || !get('Short Answer (EN)')) fail('missing question or answer');
    if (get('Category URL') !== category.path) fail('category route mismatch');
    const ctas = [];
    for (const n of [1, 2, 3]) {
      const label = get(`CTA ${n} Label`), url = get(`CTA ${n} URL`);
      if (!label && !url) continue;
      if (!label || !url) fail(`incomplete CTA ${n}`);
      let parsed;
      try { parsed = new URL(url); } catch { fail(`invalid CTA ${n} URL`); }
      if (parsed.protocol !== 'https:' || parsed.hostname !== 'www.studio17.world' || parsed.username || parsed.password || parsed.pathname.startsWith('/wip') || baseline.get(label) !== url) fail(`CTA ${n} not in approved destination directory`);
      ctas.push({ label, url });
    }
    eligible.push({ rank: priorities[get('Priority')], record: { id, locale: 'en', categoryId: category.id, question: get('Question (EN)'), answer: get('Short Answer (EN)'), searchTerms: get('Search Terms / Synonyms').split(',').map(term => term.trim()).filter(Boolean), service: get('Service / Subtopic'), ctas } });
  });
  if (!eligible.length) throw new Error('FAQ import: no eligible records; retain last-known-good output');
  const records = eligible.sort((a, b) => a.rank - b.rank || Number(a.record.id.slice(4)) - Number(b.record.id.slice(4))).map(item => item.record);
  for (const category of categories) {
    const actual = records.filter(record => record.categoryId === category.id).length;
    if (actual !== category.count) throw new Error(`FAQ import: ${category.id} expected ${category.count}, got ${actual}; review Routes before publishing`);
  }
  const hub = routes.values.find(row => row[0] === 'Hub');
  const copy = key => routes.values.find(row => row[0] === 'Copy' && row[1] === key)?.[2];
  if (records.length !== Number(hub?.[4])) throw new Error('FAQ import: hub count differs from Routes');
  return { records, categories: categories.map(({ source, count, ...category }) => category), hub: { title: hub[5], heading: hub[6], eyebrow: copy('Eyebrow'), description: copy('Supporting paragraph'), metaDescription: copy('Meta description'), placeholder: copy('Search placeholder') }, excluded };
};
const validatePublicData = data => {
  if (!data || !Array.isArray(data.records) || !data.records.length || !Array.isArray(data.categories) || !data.categories.length) throw new Error('FAQ snapshot missing records/categories');
  const ids = new Set();
  for (const category of data.categories) {
    if (!/^[a-z]+(?:-[a-z]+)*$/.test(category.id) || category.path !== `/faq/${category.id}` || !category.title || !category.heading || !category.description || ['events', 'ai-solutions'].includes(category.id)) throw new Error('Invalid/withheld FAQ category');
    if (!data.records.some(record => record.categoryId === category.id)) throw new Error('Empty FAQ category');
  }
  for (const record of data.records) {
    if (Object.keys(record).some(key => !PUBLIC_FIELDS.includes(key)) || PUBLIC_FIELDS.some(key => !Object.hasOwn(record, key))) throw new Error(`${record.id}: unexpected/missing public field`);
    if (!/^FAQ-\d{4}$/.test(record.id) || ids.has(record.id) || record.locale !== 'en' || !record.question || !record.answer || !Array.isArray(record.searchTerms) || !data.categories.some(category => category.id === record.categoryId)) throw new Error(`${record.id}: invalid public record`);
    ids.add(record.id);
    if (!Array.isArray(record.ctas) || record.ctas.length > 3) throw new Error(`${record.id}: invalid CTAs`);
    for (const cta of record.ctas) {
      const url = new URL(cta.url);
      if (!cta.label || url.origin !== 'https://www.studio17.world' || url.pathname.startsWith('/wip')) throw new Error(`${record.id}: invalid CTA`);
    }
  }
  if (!data.hub?.heading || !data.hub?.placeholder) throw new Error('FAQ hub copy missing');
  return data;
};
const saveSnapshot = (input, target) => {
  const fs = require('node:fs'), path = require('node:path');
  const { excluded, ...data } = importFaq(input);
  validatePublicData(data);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  const pending = `${target}.pending`;
  fs.writeFileSync(pending, JSON.stringify(data, null, 2) + '\n');
  fs.renameSync(pending, target);
  return { records: data.records.length, categories: data.categories.length, excluded };
};
module.exports = { importFaq, validatePublicData, saveSnapshot, PUBLIC_FIELDS };
