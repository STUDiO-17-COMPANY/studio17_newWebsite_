'use strict';

const { getCache } = require('@vercel/functions');
const { BlobNotFoundError, head, put } = require('@vercel/blob');
const sharp = require('sharp');
const { getArticlePath } = require('./_article-paths');
const {
  articleImageUrl,
  imageVersion,
  normaliseImageFormat,
  normaliseImageWidth
} = require('./_article-image-url');

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
const ARTICLE_CACHE_NAMESPACE = 'studio17-published-articles';
const ARTICLE_CACHE_FRESH_KEY = 'manifest:v2:fresh';
const ARTICLE_CACHE_FALLBACK_KEY = 'manifest:v2:fallback';
const ARTICLE_CACHE_FRESH_TTL = 120;
const ARTICLE_CACHE_FALLBACK_TTL = 60 * 60 * 24 * 30;
const ARTICLE_SCHEDULE_TTL = 60 * 60 * 24 * 366;
const ARTICLE_IMAGE_BLOB_TTL = 60 * 60 * 24 * 366;
const ARTICLE_IMAGE_CACHE_SECONDS = 60 * 60 * 24 * 365;
const PUBLICATION_TIME_ZONE = 'Europe/Nicosia';
const SCHEDULED_PUBLICATION_HOUR = 10;
const SETUP_FIELDS = new Map([
  ['publication status', 'status'], ['slug', 'slug'], ['category', 'category'],
  ['publication date', 'publishedDate'], ['modified date', 'modifiedDate'],
  ['author name', 'authorName'], ['author role', 'authorRole'], ['read time', 'readTime'],
  ['author image', 'authorImage'], ['author photo', 'authorImage'],
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
  ['cta label', 'ctaLabel'], ['cta url', 'ctaUrl'],
  ['sidebar cta title', 'sidebarCtaTitle'], ['sidebar cta description', 'sidebarCtaDescription'],
  ['sidebar cta button text', 'sidebarCtaLabel'], ['sidebar cta button url', 'sidebarCtaUrl']
]);

let cachedAccessToken = null;
let articleRefreshPromise = null;
const localCache = new Map();

const localCacheAdapter = {
  async get(key) {
    const entry = localCache.get(key);
    if (!entry || entry.expiresAt <= Date.now()) { localCache.delete(key); return undefined; }
    return entry.value;
  },
  async set(key, value, options = {}) {
    localCache.set(key, { value, expiresAt: Date.now() + Math.max(1, options.ttl || 60) * 1000 });
  }
};

const articleCache = () => process.env.VERCEL === '1'
  ? getCache({ namespace: ARTICLE_CACHE_NAMESPACE })
  : localCacheAdapter;

const cacheGet = async key => {
  try { return await articleCache().get(key); }
  catch (error) { console.warn('Articles: runtime cache read failed', error?.message); return undefined; }
};

const cacheSet = async (key, value, options) => {
  try { await articleCache().set(key, value, options); }
  catch (error) { console.warn('Articles: runtime cache write failed', error?.message); }
};

const publicationDateFormatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: PUBLICATION_TIME_ZONE,
  year: 'numeric', month: '2-digit', day: '2-digit'
});
const publicationDateTimeFormatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: PUBLICATION_TIME_ZONE,
  year: 'numeric', month: '2-digit', day: '2-digit',
  hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23'
});
const dateParts = (date, formatter) => Object.fromEntries(
  formatter.formatToParts(date).filter(part => part.type !== 'literal').map(part => [part.type, part.value])
);
const publicationDateFor = date => {
  const parts = dateParts(date, publicationDateFormatter);
  return `${parts.year}-${parts.month}-${parts.day}`;
};
const publicationInstant = (date, hour = SCHEDULED_PUBLICATION_HOUR) => {
  const [year, month, day] = date.split('-').map(Number);
  const localAsUtc = Date.UTC(year, month - 1, day, hour, 0, 0);
  let instant = localAsUtc;
  for (let attempt = 0; attempt < 2; attempt += 1) {
    const parts = dateParts(new Date(instant), publicationDateTimeFormatter);
    const represented = Date.UTC(
      Number(parts.year), Number(parts.month) - 1, Number(parts.day),
      Number(parts.hour), Number(parts.minute), Number(parts.second)
    );
    instant = localAsUtc - (represented - instant);
  }
  return new Date(instant).toISOString();
};
const createPublicationSchedule = (publishedDate, now = new Date(), existing = null) => {
  if (existing?.publishedDate === publishedDate && Number.isFinite(Date.parse(existing.publishAt || ''))) return existing;
  const today = publicationDateFor(now);
  return {
    publishedDate,
    firstSeenAt: now.toISOString(),
    publishAt: publishedDate <= today ? now.toISOString() : publicationInstant(publishedDate)
  };
};
const isPublicationDue = (article, now = Date.now()) => {
  const publishAt = Date.parse(article?.publishAt || '');
  return Number.isFinite(publishAt) && publishAt <= Number(now);
};
const getArticleCachePolicy = (payload, maxAge = 120, staleWhileRevalidate = 600, now = Date.now()) => {
  const next = Date.parse(payload?.nextPublicationAt || '');
  if (!Number.isFinite(next) || next <= now) return { maxAge, staleWhileRevalidate };
  return {
    maxAge: Math.max(1, Math.min(maxAge, Math.ceil((next - now) / 1000))),
    staleWhileRevalidate: 0
  };
};
const articleCacheControl = (payload, maxAge = 120, staleWhileRevalidate = 600) => {
  const policy = getArticleCachePolicy(payload, maxAge, staleWhileRevalidate);
  return `public, max-age=0, must-revalidate, s-maxage=${policy.maxAge}, stale-while-revalidate=${policy.staleWhileRevalidate}`;
};
const articleCdnCacheControl = (payload, maxAge = 120, staleWhileRevalidate = 600) => {
  const policy = getArticleCachePolicy(payload, maxAge, staleWhileRevalidate);
  return `public, max-age=${policy.maxAge}, stale-while-revalidate=${policy.staleWhileRevalidate}`;
};

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
const safeInlineUrl = value => {
  const text = cleanText(value);
  if (/^(?:\/(?!\/)|#)[A-Za-z0-9/_?=&%#.-]*$/.test(text)) return text;
  try {
    const url = new URL(text);
    return ['https:', 'http:', 'mailto:'].includes(url.protocol) ? url.href : '';
  } catch { return ''; }
};

const inlineSegments = elements => {
  const segments = (elements || []).map(element => ({
    text: inlineText(element),
    url: safeInlineUrl(element.textRun?.textStyle?.link?.url || element.richLink?.richLinkProperties?.uri || '')
  })).filter(segment => segment.text);
  if (!segments.length) return [];
  segments[segments.length - 1].text = segments.at(-1).text.replace(/\n+$/, '');
  segments[0].text = segments[0].text.replace(/^\s+/, '');
  segments[segments.length - 1].text = segments.at(-1).text.replace(/\s+$/, '');
  return segments.filter(segment => segment.text).reduce((result, segment) => {
    const previous = result.at(-1);
    if (previous?.url === segment.url) previous.text += segment.text;
    else result.push(segment);
    return result;
  }, []);
};

const paragraphRecord = (paragraph, lists = {}) => {
  const inlines = inlineSegments(paragraph?.elements);
  return {
    text: inlines.map(segment => segment.text).join(''),
    inlines,
    bullet: Boolean(paragraph?.bullet),
    listId: paragraph?.bullet?.listId || '',
    ordered: /DECIMAL|ALPHA|ROMAN/i.test(lists[paragraph?.bullet?.listId]?.listProperties?.nestingLevels?.[paragraph?.bullet?.nestingLevel || 0]?.glyphType || ''),
    style: paragraph?.paragraphStyle?.namedStyleType || 'NORMAL_TEXT'
  };
};

const structuralText = content => (content || []).flatMap(item => {
  if (item.paragraph) return (item.paragraph.elements || []).map(inlineText).join('').replace(/\n+$/, '').trim();
  if (item.table) return (item.table.tableRows || []).flatMap(row => (row.tableCells || []).map(cell => structuralText(cell.content).join(' ')));
  return '';
}).map(cleanText).filter(Boolean).join(' ');

const extractNativeTable = table => {
  const rows = (table?.tableRows || []).slice(0, 100).map(row =>
    (row.tableCells || []).slice(0, 12).map(cell => cleanText(structuralText(cell.content)))
  ).filter(row => row.some(Boolean));
  const columnCount = Math.max(0, ...rows.map(row => row.length));
  if (rows.length < 2 || columnCount < 2) return null;
  const normalised = rows.map(row => Array.from({ length: columnCount }, (_, index) => row[index] || ''));
  return { type: 'table', headers: normalised[0], rows: normalised.slice(1) };
};

const extractContentNodes = tab => {
  const lists = tab?.lists || tab?.documentTab?.lists || {};
  return (tab?.body?.content || tab?.documentTab?.body?.content || [])
  .map(item => item.paragraph
    ? { type: 'paragraph', ...paragraphRecord(item.paragraph, lists) }
    : item.table ? extractNativeTable(item.table) : null)
  .filter(node => node && (node.type === 'table' || node.text));
};

const extractParagraphs = tab => extractContentNodes(tab)
  .filter(node => node.type === 'paragraph')
  .map(({ type, ...paragraph }) => paragraph);

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

const parseBodyBlocks = entries => {
  const nodes = (entries || []).map(entry => entry?.type ? entry : { type: 'paragraph', ...entry });
  const blocks = [];
  let index = 0;
  const pushListItem = paragraph => {
    const ordered = Boolean(paragraph.ordered);
    const previous = blocks.at(-1);
    const item = { text: paragraph.text, inlines: paragraph.inlines };
    if (previous?.type === 'list' && previous.ordered === ordered) previous.items.push(item);
    else blocks.push({ type: 'list', ordered, items: [item] });
  };
  while (index < nodes.length) {
    const node = nodes[index];
    if (node.type === 'table') {
      blocks.push({ type: 'table', headers: node.headers, rows: node.rows });
      index += 1;
      continue;
    }
    const paragraph = node;
    if (isPlaceholder(paragraph.text)) { index += 1; continue; }
    const special = paragraph.style === 'HEADING_3' ? normaliseHeading(paragraph.text) : '';
    if (['image', 'quote', 'callout', 'statistics'].includes(special)) {
      const values = [];
      index += 1;
      while (index < nodes.length && nodes[index].type === 'paragraph' && !/^HEADING_\d+$/.test(nodes[index].style)) values.push(nodes[index++].text);
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
    else if (paragraph.style === 'HEADING_2') blocks.push({ type: 'heading', level: 2, text: paragraph.text, inlines: paragraph.inlines, id: slugify(paragraph.text) });
    else if (paragraph.style === 'HEADING_3') blocks.push({ type: 'heading', level: 3, text: paragraph.text, inlines: paragraph.inlines });
    else blocks.push({ type: 'paragraph', text: paragraph.text, inlines: paragraph.inlines });
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
    authorImageId: getDriveFileId(scalar(values, 'authorImage')),
    coverImageId: getDriveFileId(scalar(values, 'coverImage')),
    shareImageId: getDriveFileId(scalar(values, 'shareImage')),
    relatedSlugs: scalar(values, 'relatedSlugs').split(',').map(slugify).filter(Boolean)
  };
};

const parseLocale = tab => {
  const nodes = extractContentNodes(tab);
  const bodyIndex = nodes.findIndex(node => node.type === 'paragraph' && normaliseHeading(node.text) === 'article body');
  const metadataParagraphs = nodes.slice(0, bodyIndex < 0 ? nodes.length : bodyIndex + 1)
    .filter(node => node.type === 'paragraph');
  const { values } = parseFields(metadataParagraphs, LOCALE_FIELDS, 'article body');
  return {
    seoTitle: scalar(values, 'seoTitle'), metaDescription: scalar(values, 'metaDescription'),
    socialTitle: scalar(values, 'socialTitle'), socialDescription: scalar(values, 'socialDescription'),
    title: scalar(values, 'title'), highlightedTitle: scalar(values, 'highlightedTitle'), summary: scalar(values, 'summary'),
    coverAlt: scalar(values, 'coverAlt'), coverCaption: scalar(values, 'coverCaption'),
    ctaHeading: scalar(values, 'ctaHeading'), ctaHighlighted: scalar(values, 'ctaHighlighted'),
    ctaCopy: scalar(values, 'ctaCopy'), ctaLabel: scalar(values, 'ctaLabel'), ctaUrl: safeCtaUrl(scalar(values, 'ctaUrl')),
    sidebarCtaTitle: scalar(values, 'sidebarCtaTitle'),
    sidebarCtaDescription: scalar(values, 'sidebarCtaDescription'),
    sidebarCtaLabel: scalar(values, 'sidebarCtaLabel'),
    sidebarCtaUrl: safeCtaUrl(scalar(values, 'sidebarCtaUrl')),
    blocks: parseBodyBlocks(bodyIndex < 0 ? [] : nodes.slice(bodyIndex + 1))
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
      authorRole: setup.authorRole, authorImageId: setup.authorImageId, readTime: setup.readTime, coverImageId: setup.coverImageId,
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

const toSummary = (article, locale) => {
  const content = article.translations[locale];
  const version = article.sourceModifiedTime || article.modifiedDate || article.publishedDate;
  const summary = {
    slug: article.slug, category: article.category, publishedDate: article.publishedDate,
    modifiedDate: article.modifiedDate, authorName: article.authorName, authorRole: article.authorRole,
    readTime: article.readTime, coverImage: articleImageUrl(article.coverImageId, 720, version), coverAlt: content.coverAlt,
    title: content.title, summary: content.summary, availableLanguages: article.availableLanguages
  };
  return { ...summary, url: getArticlePath(summary, locale) };
};

const loadPublishedArticlesFromSource = async request => {
  const configuration = getConfiguration(request);
  const files = await listArticleFiles(configuration);
  const results = await mapWithConcurrency(files, 5, async file => {
    try {
      const result = buildArticle(file, await getArticleDocument(file.id, configuration));
      if (!result.valid) return result;
      const scheduleKey = `schedule:v1:${file.id}`;
      const schedule = createPublicationSchedule(
        result.article.publishedDate,
        new Date(),
        await cacheGet(scheduleKey)
      );
      result.article.publishAt = schedule.publishAt;
      await cacheSet(scheduleKey, schedule, {
        ttl: ARTICLE_SCHEDULE_TTL,
        name: 'article-publication-schedule',
        tags: ['article-publication-schedules', `article:${result.article.slug}`]
      });
      return result;
    }
    catch (error) { console.warn('Articles: unable to parse document', file.id, error?.code || error?.message); return { valid: false, error }; }
  });
  const sourceError = results.find(result => result.error)?.error;
  if (sourceError) throw sourceError;
  const seen = new Set();
  return results.filter(result => result.valid).map(result => result.article).filter(article => {
    if (seen.has(article.slug)) { console.warn('Articles: duplicate slug ignored', article.slug); return false; }
    seen.add(article.slug); return true;
  }).sort((a, b) => b.publishedDate.localeCompare(a.publishedDate));
};

const buildArticleManifest = articles => ({
  generatedAt: new Date().toISOString(),
  articles: articles.map(article => ({
    slug: article.slug,
    category: article.category,
    publishedDate: article.publishedDate,
    publishAt: article.publishAt,
    modifiedDate: article.modifiedDate,
    availableLanguages: article.availableLanguages,
    summaries: Object.fromEntries(article.availableLanguages.map(locale => [locale, toSummary(article, locale)]))
  }))
});

const persistPublishedArticles = async articles => {
  const manifest = buildArticleManifest(articles);
  const sharedOptions = { tags: ['published-articles'], name: 'published-articles' };
  await Promise.all([
    cacheSet(ARTICLE_CACHE_FRESH_KEY, manifest, { ...sharedOptions, ttl: ARTICLE_CACHE_FRESH_TTL }),
    cacheSet(ARTICLE_CACHE_FALLBACK_KEY, manifest, { ...sharedOptions, ttl: ARTICLE_CACHE_FALLBACK_TTL }),
    ...articles.map(article => cacheSet(`article:v2:${article.slug}`, article, {
      ...sharedOptions, ttl: ARTICLE_CACHE_FALLBACK_TTL, tags: ['published-articles', `article:${article.slug}`]
    }))
  ]);
  return { manifest, articles };
};

const refreshPublishedArticles = request => {
  if (!articleRefreshPromise) {
    articleRefreshPromise = loadPublishedArticlesFromSource(request)
      .then(persistPublishedArticles)
      .finally(() => { articleRefreshPromise = null; });
  }
  return articleRefreshPromise;
};

const getPublishedManifest = async request => {
  const fresh = await cacheGet(ARTICLE_CACHE_FRESH_KEY);
  if (fresh?.articles) return fresh;
  try { return (await refreshPublishedArticles(request)).manifest; }
  catch (error) {
    const fallback = await cacheGet(ARTICLE_CACHE_FALLBACK_KEY);
    if (fallback?.articles) {
      console.warn('Articles: serving the last known published manifest', error?.code || error?.message);
      return fallback;
    }
    throw error;
  }
};

const listPublishedArticles = async (request, locale = 'en') => {
  const selected = SUPPORTED_LOCALES.includes(locale) ? locale : 'en';
  const manifest = await getPublishedManifest(request);
  const now = Date.now();
  const published = manifest.articles.filter(article => isPublicationDue(article, now));
  const nextPublicationAt = manifest.articles
    .filter(article => !isPublicationDue(article, now))
    .map(article => article.publishAt)
    .filter(Boolean)
    .sort()[0] || null;
  return {
    articles: published.map(article => article.summaries[selected]).filter(Boolean),
    locale: selected,
    generatedAt: manifest.generatedAt,
    nextPublicationAt
  };
};

const getPublishedArticleBySlug = async (slug, locale, request) => {
  const cleanSlug = slugify(slug);
  if (!slug || cleanSlug !== slug) throw new ArticlesError('INVALID_ARTICLE_SLUG', 'The article link is invalid.', 400);
  let manifest = await getPublishedManifest(request);
  let manifestArticle = manifest.articles.find(candidate => candidate.slug === slug && isPublicationDue(candidate));
  if (!manifestArticle) throw new ArticlesError('ARTICLE_NOT_FOUND', 'This article is no longer available.', 404);
  let article = await cacheGet(`article:v2:${slug}`);
  if (!article) {
    const refreshed = await refreshPublishedArticles(request);
    manifest = refreshed.manifest;
    manifestArticle = manifest.articles.find(candidate => candidate.slug === slug && isPublicationDue(candidate));
    article = refreshed.articles.find(candidate => candidate.slug === slug && isPublicationDue(candidate));
  }
  if (!manifestArticle || !article) throw new ArticlesError('ARTICLE_NOT_FOUND', 'This article is no longer available.', 404);
  const selected = SUPPORTED_LOCALES.includes(locale) ? locale : 'en';
  if (!article.translations[selected]) throw new ArticlesError('ARTICLE_TRANSLATION_NOT_FOUND', 'This article is not available in the selected language.', 404);
  const related = [...new Set(article.relatedSlugs)]
    .map(relatedSlug => manifest.articles.find(item => item.slug === relatedSlug && isPublicationDue(item))?.summaries[selected])
    .filter(item => item && item.slug !== article.slug);
  return {
    ...article, locale: selected, content: article.translations[selected], related,
    authorImage: article.authorImageId ? articleImageUrl(article.authorImageId, 160, article.sourceModifiedTime) : '',
    coverImage: articleImageUrl(article.coverImageId, 1600, article.sourceModifiedTime),
    shareImage: articleImageUrl(article.shareImageId, 1200, article.sourceModifiedTime, 'jpeg')
  };
};

const optimiseArticleImage = async (bytes, width, format) => {
  const pipeline = sharp(bytes, { failOn: 'warning', limitInputPixels: 40_000_000 })
    .rotate()
    .resize({ width, withoutEnlargement: true, fit: 'inside' });
  const output = format === 'jpeg'
    ? pipeline.jpeg({ quality: 82, progressive: true, mozjpeg: true })
    : pipeline.webp({ quality: 80, effort: 4 });
  const result = await output.toBuffer({ resolveWithObject: true });
  return {
    bytes: result.data,
    mimeType: format === 'jpeg' ? 'image/jpeg' : 'image/webp',
    width: result.info.width,
    height: result.info.height
  };
};

const blobConfiguration = request => ({
  token: process.env.BLOB_READ_WRITE_TOKEN || undefined,
  storeId: process.env.BLOB_STORE_ID || undefined,
  oidcToken: getHeader(request, 'x-vercel-oidc-token') || process.env.VERCEL_OIDC_TOKEN || undefined
});

const hasBlobConfiguration = configuration => Boolean(configuration.token || (configuration.storeId && configuration.oidcToken));

const getArticleImage = async (id, request, options = {}) => {
  if (!/^[A-Za-z0-9_-]{20,}$/.test(id || '')) throw new ArticlesError('INVALID_IMAGE_ID', 'The image link is invalid.', 400);
  const width = normaliseImageWidth(options.width);
  const format = normaliseImageFormat(options.format);
  const requestedVersion = imageVersion(options.version);
  const mappingKey = `image-blob:v1:${id}:${requestedVersion}:${width}:${format}`;
  const blob = blobConfiguration(request);
  if (hasBlobConfiguration(blob)) {
    const cachedBlobUrl = await cacheGet(mappingKey);
    if (cachedBlobUrl) return { redirectUrl: cachedBlobUrl, width, format };
  }
  const configuration = getConfiguration(request);
  const fields = encodeURIComponent('id,name,mimeType,parents,size,trashed,modifiedTime,md5Checksum');
  const metadata = await googleJson(`https://www.googleapis.com/drive/v3/files/${encodeURIComponent(id)}?fields=${fields}&supportsAllDrives=true`, configuration);
  const valid = !metadata.trashed && String(metadata.mimeType || '').startsWith('image/') && Array.isArray(metadata.parents) && metadata.parents.includes(configuration.mediaFolderId) && Number(metadata.size || 0) <= 12 * 1024 * 1024;
  if (!valid) throw new ArticlesError('IMAGE_NOT_FOUND', 'This article image is not available.', 404);
  const response = await googleResponse(`https://www.googleapis.com/drive/v3/files/${encodeURIComponent(id)}?alt=media&supportsAllDrives=true`, configuration);
  const optimised = await optimiseArticleImage(Buffer.from(await response.arrayBuffer()), width, format);
  if (!hasBlobConfiguration(blob)) return optimised;

  const digest = String(metadata.md5Checksum || metadata.modifiedTime || requestedVersion).replace(/[^A-Za-z0-9_-]+/g, '').slice(0, 64);
  const pathname = `article-images/${id}/${digest}-${width}.${format === 'jpeg' ? 'jpg' : 'webp'}`;
  let stored;
  try {
    stored = await head(pathname, blob);
  } catch (error) {
    if (!(error instanceof BlobNotFoundError)) throw error;
    try {
      stored = await put(pathname, optimised.bytes, {
        ...blob,
        access: 'public',
        addRandomSuffix: false,
        allowOverwrite: false,
        cacheControlMaxAge: ARTICLE_IMAGE_CACHE_SECONDS,
        contentType: optimised.mimeType
      });
    } catch (uploadError) {
      stored = await head(pathname, blob).catch(() => { throw uploadError; });
    }
  }
  await cacheSet(mappingKey, stored.url, {
    ttl: ARTICLE_IMAGE_BLOB_TTL,
    name: 'article-image-blob-url',
    tags: ['article-images', `article-image:${id}`]
  });
  return { redirectUrl: stored.url, width: optimised.width, height: optimised.height, format };
};

const sendJson = (response, status, payload, { cache = false } = {}) => {
  response.statusCode = status;
  response.setHeader('Content-Type', 'application/json; charset=utf-8');
  response.setHeader('X-Content-Type-Options', 'nosniff');
  response.setHeader('Cache-Control', cache && status === 200 ? articleCacheControl(payload) : 'no-store');
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
  ArticlesError, PUBLICATION_TIME_ZONE, SCHEDULED_PUBLICATION_HOUR, SUPPORTED_LOCALES,
  articleCacheControl, articleCdnCacheControl, articleImageUrl, buildArticle, createPublicationSchedule,
  extractParagraphs, getArticleCachePolicy, isPublicationDue, publicationDateFor, publicationInstant,
  getArticleImage, getPublishedArticleBySlug, listPublishedArticles, optimiseArticleImage, parseBodyBlocks,
  parseLocale, parseSetup, sendError, sendJson, slugify
};
