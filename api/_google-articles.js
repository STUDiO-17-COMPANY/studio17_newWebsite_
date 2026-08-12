'use strict';

const DEFAULT_ARTICLES_FOLDER_ID = '1k8x27HIhYJH2VNpasBuj5wZSTV7CVIEP';
const DEFAULT_MEDIA_FOLDER_ID = '1epwy_o7_lyY5R--igJ5wkJEQ3hExnJyb';
const GOOGLE_DOC_MIME = 'application/vnd.google-apps.document';
const GOOGLE_STS_URL = 'https://sts.googleapis.com/v1/token';
const GOOGLE_CLOUD_SCOPE = 'https://www.googleapis.com/auth/cloud-platform';
const GOOGLE_SCOPES = [
  'https://www.googleapis.com/auth/drive.readonly',
  'https://www.googleapis.com/auth/documents.readonly'
];
const REQUEST_TIMEOUT_MS = 9000;
const SUPPORTED_TABS = new Map([
  ['EN', 'en'], ['PT-PT', 'pt-PT'], ['ES', 'es'], ['EL', 'el'], ['RU', 'ru'], ['HE', 'he']
]);
const SUPPORTED_LOCALES = [...SUPPORTED_TABS.values()];
const SETUP_FIELDS = new Map([
  ['publication status', 'status'], ['slug', 'slug'], ['category', 'category'],
  ['publication date', 'publishedDate'], ['modified date', 'modifiedDate'],
  ['author name', 'authorName'], ['author role', 'authorRole'], ['read time', 'readTime'],
  ['cover image', 'coverImage'], ['social share image', 'shareImage'],
  ['related article slugs', 'relatedSlugs']
]);
const LOCALE_FIELDS = new Map([
  ['seo title', 'seoTitle'], ['meta description', 'metaDescription'],
  ['social title', 'socialTitle'], ['social description', 'socialDescription'],
  ['article title', 'title'], ['highlighted title text', 'highlightedTitle'],
  ['summary', 'summary'], ['cover image alt text', 'coverAlt'],
  ['cover image caption', 'coverCaption'], ['cta heading', 'ctaHeading'],
  ['cta highlighted text', 'ctaHighlighted'], ['cta copy', 'ctaCopy'],
  ['cta label', 'ctaLabel'], ['cta url', 'ctaUrl']
]);

let cachedAccessToken = null;

class ArticlesError extends Error {
  constructor(code, message, status = 500) {
    super(message);
    this.name = 'ArticlesError';
    this.code = code;
    this.status = status;
  }
}

const getHeader = (request, name) => {
  const value = request?.headers?.[name] ?? request?.headers?.[name.toLowerCase()];
  return Array.isArray(value) ? value[0] : value;
};

const getConfiguration = request => {
  const projectNumber = process.env.GCP_PROJECT_NUMBER;
  const poolId = process.env.GCP_WORKLOAD_IDENTITY_POOL_ID;
  const providerId = process.env.GCP_WORKLOAD_IDENTITY_POOL_PROVIDER_ID;
  const email = process.env.GCP_SERVICE_ACCOUNT_EMAIL;
  const oidcToken = getHeader(request, 'x-vercel-oidc-token') || process.env.VERCEL_OIDC_TOKEN;
  const folderId = process.env.GOOGLE_DRIVE_ARTICLES_FOLDER_ID || DEFAULT_ARTICLES_FOLDER_ID;
  const mediaFolderId = process.env.GOOGLE_DRIVE_ARTICLE_MEDIA_FOLDER_ID || DEFAULT_MEDIA_FOLDER_ID;
  if (!projectNumber || !poolId || !providerId || !email || !oidcToken) {
    throw new ArticlesError('ARTICLES_NOT_CONFIGURED', 'The articles connection has not been configured yet.', 503);
  }
  return {
    audience: `//iam.googleapis.com/projects/${projectNumber}/locations/global/workloadIdentityPools/${poolId}/providers/${providerId}`,
    email, folderId, mediaFolderId, oidcToken
  };
};

async function fetchWithTimeout(url, options = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } catch (error) {
    if (error?.name === 'AbortError') throw new ArticlesError('GOOGLE_TIMEOUT', 'The article source took too long to respond.', 504);
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

const createAccessToken = async (configuration, forceRefresh = false) => {
  const now = Math.floor(Date.now() / 1000);
  if (!forceRefresh && cachedAccessToken?.expiresAt > now + 60) return cachedAccessToken.value;
  const federationResponse = await fetchWithTimeout(GOOGLE_STS_URL, {
    method: 'POST', headers: { 'content-type': 'application/json', accept: 'application/json' },
    body: JSON.stringify({
      audience: configuration.audience,
      grantType: 'urn:ietf:params:oauth:grant-type:token-exchange',
      requestedTokenType: 'urn:ietf:params:oauth:token-type:access_token',
      scope: GOOGLE_CLOUD_SCOPE,
      subjectTokenType: 'urn:ietf:params:oauth:token-type:jwt',
      subjectToken: configuration.oidcToken
    })
  });
  if (!federationResponse.ok) throw new ArticlesError('GOOGLE_AUTH_FAILED', 'The articles connection could not authenticate with Google.', 502);
  const federation = await federationResponse.json();
  const impersonationResponse = await fetchWithTimeout(
    `https://iamcredentials.googleapis.com/v1/projects/-/serviceAccounts/${encodeURIComponent(configuration.email)}:generateAccessToken`,
    {
      method: 'POST',
      headers: { authorization: `Bearer ${federation.access_token}`, 'content-type': 'application/json', accept: 'application/json' },
      body: JSON.stringify({ scope: GOOGLE_SCOPES, lifetime: '3600s' })
    }
  );
  if (!impersonationResponse.ok) throw new ArticlesError('GOOGLE_AUTH_FAILED', 'The articles connection could not assume its Google identity.', 502);
  const payload = await impersonationResponse.json();
  const expireTime = Math.floor(Date.parse(payload.expireTime || '') / 1000);
  cachedAccessToken = { value: payload.accessToken, expiresAt: Number.isFinite(expireTime) ? expireTime : now + 3600 };
  return payload.accessToken;
};

const googleResponse = async (url, configuration, forceRefresh = false) => {
  const token = await createAccessToken(configuration, forceRefresh);
  const response = await fetchWithTimeout(url, { headers: { authorization: `Bearer ${token}`, accept: 'application/json' } });
  if (response.status === 401 && !forceRefresh) {
    cachedAccessToken = null;
    return googleResponse(url, configuration, true);
  }
  if (!response.ok) throw new ArticlesError('GOOGLE_API_FAILED', 'The article source is temporarily unavailable.', 502);
  return response;
};

const googleJson = async (url, configuration) => (await googleResponse(url, configuration)).json();

const normaliseHeading = value => String(value || '').toLowerCase().replace(/[\u2010-\u2015]/g, '-').replace(/\s*:\s*$/, '').replace(/\s+/g, ' ').trim();
const cleanText = value => String(value || '').replace(/\s+/g, ' ').trim();
const isPlaceholder = value => /^\s*\[[\s\S]*\]\s*$/.test(value) || /\[(?:required|optional|draft|google drive|write|section|quotation|person|one statistic)\b/i.test(value);
const slugify = value => String(value || '').normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 90) || 'article';

const getDriveFileId = value => {
  const text = cleanText(value);
  if (/^[A-Za-z0-9_-]{20,}$/.test(text)) return text;
  const match = text.match(/\/d\/([A-Za-z0-9_-]{20,})/) || text.match(/[?&]id=([A-Za-z0-9_-]{20,})/);
  return match?.[1] || '';
};

const safeCtaUrl = value => {
  const text = cleanText(value);
  if (/^\/(?!\/)[A-Za-z0-9/_?=&%#.-]*$/.test(text)) return text;
  try {
    const url = new URL(text);
    return ['https:', 'mailto:'].includes(url.protocol) ? url.href : '';
  } catch { return ''; }
};

const inlineText = element => element.textRun?.content || element.richLink?.richLinkProperties?.title || element.richLink?.richLinkProperties?.uri || '';
const extractParagraphs = tab => {
  const lists = tab?.lists || tab?.documentTab?.lists || {};
  return (tab?.body?.content || tab?.documentTab?.body?.content || [])
  .filter(item => item.paragraph)
  .map(item => ({
    text: (item.paragraph.elements || []).map(inlineText).join('').replace(/\n+$/, '').trim(),
    bullet: Boolean(item.paragraph.bullet),
    listId: item.paragraph.bullet?.listId || '',
    ordered: /DECIMAL|ALPHA|ROMAN/i.test(lists[item.paragraph.bullet?.listId]?.listProperties?.nestingLevels?.[item.paragraph.bullet?.nestingLevel || 0]?.glyphType || ''),
    style: item.paragraph.paragraphStyle?.namedStyleType || 'NORMAL_TEXT'
  }))
  .filter(paragraph => paragraph.text);
};

const flattenTabs = tabs => (tabs || []).flatMap(tab => [tab, ...flattenTabs(tab.childTabs)]);
const tabTitle = tab => String(tab?.title || tab?.tabProperties?.title || '').trim().toUpperCase();

const parseFields = (paragraphs, fieldMap, stopHeading = '') => {
  const values = {};
  let target = null;
  let stopIndex = paragraphs.length;
  for (let index = 0; index < paragraphs.length; index += 1) {
    const paragraph = paragraphs[index];
    const heading = normaliseHeading(paragraph.text);
    if (stopHeading && heading === stopHeading) { stopIndex = index + 1; break; }
    const field = fieldMap.get(heading);
    if (field) { target = field; values[target] ||= []; continue; }
    if (/^(TITLE|SUBTITLE|HEADING_\d+)$/.test(paragraph.style)) { target = null; continue; }
    if (target && !isPlaceholder(paragraph.text)) values[target].push(paragraph.text.trim());
  }
  return { values, stopIndex };
};

const scalar = (values, key) => cleanText((values[key] || []).join(' '));

const parseBodyBlocks = paragraphs => {
  const blocks = [];
  let index = 0;
  const pushListItem = paragraph => {
    const ordered = Boolean(paragraph.ordered);
    const previous = blocks.at(-1);
    if (previous?.type === 'list' && previous.ordered === ordered) previous.items.push(paragraph.text);
    else blocks.push({ type: 'list', ordered, items: [paragraph.text] });
  };
  while (index < paragraphs.length) {
    const paragraph = paragraphs[index];
    if (isPlaceholder(paragraph.text)) { index += 1; continue; }
    const special = paragraph.style === 'HEADING_3' ? normaliseHeading(paragraph.text) : '';
    if (['image', 'quote', 'callout', 'statistics'].includes(special)) {
      const values = [];
      index += 1;
      while (index < paragraphs.length && !/^HEADING_\d+$/.test(paragraphs[index].style)) values.push(paragraphs[index++].text);
      const labelled = prefix => cleanText(values.find(value => normaliseHeading(value.split(':')[0]) === prefix)?.split(':').slice(1).join(':') || '');
      if (special === 'image') {
        const imageId = getDriveFileId(labelled('image url'));
        const alt = labelled('alt text');
        if (imageId && alt) blocks.push({ type: 'image', imageId, alt, caption: labelled('caption') });
      } else if (special === 'quote') {
        const text = labelled('quote text');
        if (text) blocks.push({ type: 'quote', text, citation: labelled('citation') });
      } else if (special === 'callout') {
        const copy = labelled('callout copy');
        if (copy) blocks.push({ type: 'callout', title: labelled('callout title'), copy });
      } else {
        const items = values.map(value => value.split('|').map(cleanText)).filter(parts => parts.length >= 2 && parts[0] && parts[1]);
        if (items.length) blocks.push({ type: 'statistics', items: items.map(([value, label]) => ({ value, label })) });
      }
      continue;
    }
    if (paragraph.bullet) pushListItem(paragraph);
    else if (paragraph.style === 'HEADING_2') blocks.push({ type: 'heading', level: 2, text: paragraph.text, id: slugify(paragraph.text) });
    else if (paragraph.style === 'HEADING_3') blocks.push({ type: 'heading', level: 3, text: paragraph.text });
    else blocks.push({ type: 'paragraph', text: paragraph.text });
    index += 1;
  }
  return blocks;
};

const parseSetup = tab => {
  const { values } = parseFields(extractParagraphs(tab), SETUP_FIELDS);
  return {
    status: scalar(values, 'status'), slug: scalar(values, 'slug'), category: scalar(values, 'category'),
    publishedDate: scalar(values, 'publishedDate'), modifiedDate: scalar(values, 'modifiedDate'),
    authorName: scalar(values, 'authorName'), authorRole: scalar(values, 'authorRole'),
    readTime: Number.parseInt(scalar(values, 'readTime'), 10) || 0,
    coverImageId: getDriveFileId(scalar(values, 'coverImage')),
    shareImageId: getDriveFileId(scalar(values, 'shareImage')),
    relatedSlugs: scalar(values, 'relatedSlugs').split(',').map(slugify).filter(Boolean)
  };
};

const parseLocale = tab => {
  const paragraphs = extractParagraphs(tab);
  const { values, stopIndex } = parseFields(paragraphs, LOCALE_FIELDS, 'article body');
  return {
    seoTitle: scalar(values, 'seoTitle'), metaDescription: scalar(values, 'metaDescription'),
    socialTitle: scalar(values, 'socialTitle'), socialDescription: scalar(values, 'socialDescription'),
    title: scalar(values, 'title'), highlightedTitle: scalar(values, 'highlightedTitle'), summary: scalar(values, 'summary'),
    coverAlt: scalar(values, 'coverAlt'), coverCaption: scalar(values, 'coverCaption'),
    ctaHeading: scalar(values, 'ctaHeading'), ctaHighlighted: scalar(values, 'ctaHighlighted'),
    ctaCopy: scalar(values, 'ctaCopy'), ctaLabel: scalar(values, 'ctaLabel'), ctaUrl: safeCtaUrl(scalar(values, 'ctaUrl')),
    blocks: parseBodyBlocks(paragraphs.slice(stopIndex))
  };
};

const isValidDate = value => /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(`${value}T00:00:00Z`));
const validLocale = locale => {
  const required = ['seoTitle', 'metaDescription', 'title', 'highlightedTitle', 'summary', 'coverAlt', 'ctaHeading', 'ctaCopy', 'ctaLabel', 'ctaUrl'];
  return required.every(key => locale[key] && !isPlaceholder(locale[key])) && locale.blocks.some(block => block.type === 'paragraph' || block.type === 'heading');
};

const buildArticle = (file, document) => {
  const tabs = flattenTabs(document.tabs);
  const setupTab = tabs.find(tab => tabTitle(tab) === 'SETUP');
  if (!setupTab) return { valid: false, missing: ['SETUP'] };
  const setup = parseSetup(setupTab);
  const slug = slugify(setup.slug || file.name);
  const categories = new Map([['insight', 'Insight'], ['case study', 'Case Study'], ['news', 'News']]);
  const category = categories.get(normaliseHeading(setup.category)) || '';
  const translations = {};
  for (const tab of tabs) {
    const localeCode = SUPPORTED_TABS.get(tabTitle(tab));
    if (!localeCode) continue;
    const parsed = parseLocale(tab);
    if (validLocale(parsed)) translations[localeCode] = parsed;
  }
  const missing = [];
  if (normaliseHeading(setup.status) !== 'published') missing.push('status');
  if (!category) missing.push('category');
  if (!isValidDate(setup.publishedDate)) missing.push('publishedDate');
  if (!setup.authorName) missing.push('authorName');
  if (!setup.authorRole) missing.push('authorRole');
  if (!setup.readTime) missing.push('readTime');
  if (!setup.coverImageId) missing.push('coverImage');
  if (!setup.shareImageId) missing.push('shareImage');
  if (!translations.en) missing.push('EN');
  return {
    valid: missing.length === 0,
    missing,
    article: {
      id: file.id, slug, category, publishedDate: setup.publishedDate,
      modifiedDate: isValidDate(setup.modifiedDate) ? setup.modifiedDate : null,
      sourceModifiedTime: file.modifiedTime || null, authorName: setup.authorName,
      authorRole: setup.authorRole, readTime: setup.readTime, coverImageId: setup.coverImageId,
      shareImageId: setup.shareImageId, relatedSlugs: setup.relatedSlugs,
      availableLanguages: SUPPORTED_LOCALES.filter(locale => translations[locale]), translations
    }
  };
};

const listArticleFiles = async configuration => {
  const files = [];
  let pageToken = '';
  do {
    const params = new URLSearchParams({
      q: `'${configuration.folderId}' in parents and trashed = false and mimeType = '${GOOGLE_DOC_MIME}'`,
      fields: 'nextPageToken,files(id,name,mimeType,parents,createdTime,modifiedTime)', orderBy: 'createdTime desc',
      pageSize: '100', supportsAllDrives: 'true', includeItemsFromAllDrives: 'true'
    });
    if (pageToken) params.set('pageToken', pageToken);
    const payload = await googleJson(`https://www.googleapis.com/drive/v3/files?${params}`, configuration);
    files.push(...(payload.files || []));
    pageToken = payload.nextPageToken || '';
  } while (pageToken);
  return files;
};

const getArticleDocument = (id, configuration) => googleJson(`https://docs.googleapis.com/v1/documents/${encodeURIComponent(id)}?includeTabsContent=true`, configuration);

const mapWithConcurrency = async (items, limit, mapper) => {
  const results = new Array(items.length); let index = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (index < items.length) { const current = index++; results[current] = await mapper(items[current]); }
  });
  await Promise.all(workers); return results;
};

const articleImageUrl = id => `/api/article-image?id=${encodeURIComponent(id)}`;
const toSummary = (article, locale) => {
  const content = article.translations[locale];
  return {
    slug: article.slug, category: article.category, publishedDate: article.publishedDate,
    modifiedDate: article.modifiedDate, authorName: article.authorName, authorRole: article.authorRole,
    readTime: article.readTime, coverImage: articleImageUrl(article.coverImageId), coverAlt: content.coverAlt,
    title: content.title, summary: content.summary, availableLanguages: article.availableLanguages
  };
};

const loadPublishedArticles = async request => {
  const configuration = getConfiguration(request);
  const files = await listArticleFiles(configuration);
  const results = await mapWithConcurrency(files, 5, async file => {
    try { return buildArticle(file, await getArticleDocument(file.id, configuration)); }
    catch (error) { console.warn('Articles: unable to parse document', file.id, error?.code || error?.message); return { valid: false, error }; }
  });
  if (results.length && results.every(result => result.error)) throw results[0].error;
  const seen = new Set();
  return results.filter(result => result.valid).map(result => result.article).filter(article => {
    if (seen.has(article.slug)) { console.warn('Articles: duplicate slug ignored', article.slug); return false; }
    seen.add(article.slug); return true;
  }).sort((a, b) => b.publishedDate.localeCompare(a.publishedDate));
};

const listPublishedArticles = async (request, locale = 'en') => {
  const selected = SUPPORTED_LOCALES.includes(locale) ? locale : 'en';
  const all = await loadPublishedArticles(request);
  return { articles: all.filter(article => article.translations[selected]).map(article => toSummary(article, selected)), locale: selected };
};

const getPublishedArticleBySlug = async (slug, locale, request) => {
  const cleanSlug = slugify(slug);
  if (!slug || cleanSlug !== slug) throw new ArticlesError('INVALID_ARTICLE_SLUG', 'The article link is invalid.', 400);
  const all = await loadPublishedArticles(request);
  const article = all.find(candidate => candidate.slug === slug);
  if (!article) throw new ArticlesError('ARTICLE_NOT_FOUND', 'This article is no longer available.', 404);
  const selected = SUPPORTED_LOCALES.includes(locale) ? locale : 'en';
  if (!article.translations[selected]) throw new ArticlesError('ARTICLE_TRANSLATION_NOT_FOUND', 'This article is not available in the selected language.', 404);
  const related = article.relatedSlugs.map(relatedSlug => all.find(item => item.slug === relatedSlug)).filter(item => item?.translations[selected]).slice(0, 3).map(item => toSummary(item, selected));
  return {
    ...article, locale: selected, content: article.translations[selected], related,
    coverImage: articleImageUrl(article.coverImageId), shareImage: articleImageUrl(article.shareImageId)
  };
};

const getArticleImage = async (id, request) => {
  if (!/^[A-Za-z0-9_-]{20,}$/.test(id || '')) throw new ArticlesError('INVALID_IMAGE_ID', 'The image link is invalid.', 400);
  const configuration = getConfiguration(request);
  const fields = encodeURIComponent('id,name,mimeType,parents,size,trashed');
  const metadata = await googleJson(`https://www.googleapis.com/drive/v3/files/${encodeURIComponent(id)}?fields=${fields}&supportsAllDrives=true`, configuration);
  const valid = !metadata.trashed && String(metadata.mimeType || '').startsWith('image/') && Array.isArray(metadata.parents) && metadata.parents.includes(configuration.mediaFolderId) && Number(metadata.size || 0) <= 12 * 1024 * 1024;
  if (!valid) throw new ArticlesError('IMAGE_NOT_FOUND', 'This article image is not available.', 404);
  const response = await googleResponse(`https://www.googleapis.com/drive/v3/files/${encodeURIComponent(id)}?alt=media&supportsAllDrives=true`, configuration);
  return { mimeType: metadata.mimeType, bytes: Buffer.from(await response.arrayBuffer()) };
};

const sendJson = (response, status, payload, { cache = false } = {}) => {
  response.statusCode = status;
  response.setHeader('Content-Type', 'application/json; charset=utf-8');
  response.setHeader('X-Content-Type-Options', 'nosniff');
  response.setHeader('Cache-Control', cache && status === 200 ? 'public, max-age=0, s-maxage=60, stale-while-revalidate=300' : 'no-store');
  response.end(JSON.stringify(payload));
};

const sendError = (response, error) => {
  const known = error instanceof ArticlesError;
  const status = known ? error.status : 500;
  const code = known ? error.code : 'ARTICLES_UNAVAILABLE';
  const message = known && (status < 500 || code === 'ARTICLES_NOT_CONFIGURED') ? error.message : 'Articles are temporarily unavailable.';
  sendJson(response, status, { error: { code, message } });
};

module.exports = {
  ArticlesError, SUPPORTED_LOCALES, articleImageUrl, buildArticle, extractParagraphs,
  getArticleImage, getPublishedArticleBySlug, listPublishedArticles, parseBodyBlocks,
  parseLocale, parseSetup, sendError, sendJson, slugify
};
