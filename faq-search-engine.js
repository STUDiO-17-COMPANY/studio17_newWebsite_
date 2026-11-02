((root, factory) => {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.Studio17FaqSearch = api;
})(typeof window === 'object' ? window : globalThis, () => {
  const normalize = value => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim().replace(/\s+/g, ' ');
  // Small, explicit equivalences, not fuzzy matching or invented search demand.
  const priceTerms = ['price', 'prices', 'pricing', 'cost', 'costs', 'fee', 'fees'];
  const synonyms = { ...Object.fromEntries(priceTerms.map(term => [term, priceTerms.filter(other => other !== term)])), website: ['site', 'websites'], instagram: ['reels', 'instagram'], video: ['filming', 'video'], translation: ['localisation', 'localization', 'translation'] };
  // Return plain-text segments so consumers can safely create text/strong nodes.
  // Whole-word matching avoids highlighting "cost" inside "customers", for example.
  const highlightQuestion = (question, query) => {
    const original = String(question || '');
    const tokens = normalize(query).split(' ').filter(Boolean);
    if (!tokens.length) return [{ text: original, matched: false }];
    const terms = new Set(tokens.flatMap(token => [token, ...(synonyms[token] || [])]));
    const words = [...original.matchAll(/[\p{L}\p{N}][\p{L}\p{M}\p{N}]*/gu)].map(match => ({ text: normalize(match[0]), start: match.index, end: match.index + match[0].length }));
    const ranges = [];
    for (let index = 0; index < words.length; index++) {
      if (tokens.length > 1 && tokens.every((token, offset) => words[index + offset]?.text === token)) {
        ranges.push([words[index].start, words[index + tokens.length - 1].end]);
        index += tokens.length - 1;
      } else if (terms.has(words[index].text)) ranges.push([words[index].start, words[index].end]);
    }
    const segments = []; let cursor = 0;
    for (const [start, end] of ranges) {
      if (start > cursor) segments.push({ text: original.slice(cursor, start), matched: false });
      segments.push({ text: original.slice(start, end), matched: true }); cursor = end;
    }
    if (cursor < original.length) segments.push({ text: original.slice(cursor), matched: false });
    return segments;
  };
  const search = (records, categories, query, categoryId = '') => {
    const phrase = normalize(query);
    const tokens = [...new Set(phrase.split(' ').filter(Boolean))];
    return records.filter(record => !categoryId || record.categoryId === categoryId).map((record, index) => {
      if (!tokens.length) return { record, score: 0, index };
      const question = normalize(record.question);
      const context = normalize([record.service, categories.find(category => category.id === record.categoryId)?.label, ...record.searchTerms].join(' '));
      const answer = normalize(record.answer);
      const matches = tokens.every(token => [token, ...(synonyms[token] || [])].some(term => `${question} ${context} ${answer}`.includes(term)));
      const score = matches ? (question.includes(phrase) ? 100 : 0) + tokens.reduce((sum, token) => sum + (question.includes(token) ? 12 : context.includes(token) ? 6 : 1), 0) : -1;
      return { record, score, index };
    }).filter(item => item.score >= 0).sort((a, b) => b.score - a.score || a.index - b.index).map(item => item.record);
  };
  return { normalize, synonyms, search, highlightQuestion };
});
