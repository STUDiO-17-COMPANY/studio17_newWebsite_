((root, factory) => {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.Studio17FaqSearch = api;
})(typeof window === 'object' ? window : globalThis, () => {
  const normalize = value => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim().replace(/\s+/g, ' ');
  // Small, explicit equivalences, not fuzzy matching or invented search demand.
  const synonyms = { price: ['cost', 'pricing', 'fees'], cost: ['price', 'pricing', 'fees'], pricing: ['price', 'cost'], website: ['site', 'websites'], instagram: ['reels', 'instagram'], video: ['filming', 'video'], translation: ['localisation', 'localization', 'translation'] };
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
  return { normalize, synonyms, search };
});
