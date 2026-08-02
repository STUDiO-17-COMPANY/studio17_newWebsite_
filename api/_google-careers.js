'use strict';

const { createSign } = require('node:crypto');

const DEFAULT_OPEN_ROLES_FOLDER_ID = '1jbuO2nBYoGwnFP7HLZFTERt_IUmclxGc';
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const GOOGLE_SCOPE = [
  'https://www.googleapis.com/auth/drive.readonly',
  'https://www.googleapis.com/auth/documents.readonly'
].join(' ');
const GOOGLE_DOC_MIME = 'application/vnd.google-apps.document';
const REQUEST_TIMEOUT_MS = 9000;

const FIELD_HEADINGS = new Map([
  ['department', 'department'],
  ['location', 'location'],
  ['work model', 'workModel'],
  ['employment type', 'employmentType'],
  ['experience level', 'experienceLevel'],
  ['application deadline', 'applicationDeadline'],
  ['application url', 'applicationUrl'],
  ['short summary', 'summary']
]);

const SECTION_HEADINGS = new Map([
  ['about the role', 'about'],
  ['what you will do', 'responsibilities'],
  ['what we are looking for', 'requirements'],
  ['nice to have', 'niceToHave'],
  ['what we offer', 'offer'],
  ['hiring process', 'hiringProcess'],
  ['equal opportunity', 'equalOpportunity']
]);

let cachedAccessToken = null;

class CareersError extends Error {
  constructor(code, message, status = 500) {
    super(message);
    this.name = 'CareersError';
    this.code = code;
    this.status = status;
  }
}

const base64Url = value => Buffer.from(value)
  .toString('base64')
  .replace(/=/g, '')
  .replace(/\+/g, '-')
  .replace(/\//g, '_');

const decodeJsonCredential = encoded => {
  try {
    return JSON.parse(Buffer.from(encoded, 'base64').toString('utf8'));
  } catch {
    throw new CareersError('CAREERS_NOT_CONFIGURED', 'The Google service-account configuration is invalid.', 503);
  }
};

const getConfiguration = () => {
  const bundled = process.env.GOOGLE_SERVICE_ACCOUNT_JSON_BASE64
    ? decodeJsonCredential(process.env.GOOGLE_SERVICE_ACCOUNT_JSON_BASE64)
    : null;
  const email = bundled?.client_email || process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = (bundled?.private_key || process.env.GOOGLE_PRIVATE_KEY || '').replace(/\\n/g, '\n');
  const folderId = process.env.GOOGLE_DRIVE_OPEN_ROLES_FOLDER_ID || DEFAULT_OPEN_ROLES_FOLDER_ID;

  if (!email || !privateKey) {
    throw new CareersError(
      'CAREERS_NOT_CONFIGURED',
      'The Careers connection has not been configured yet.',
      503
    );
  }

  return { email, privateKey, folderId };
};

const createAccessToken = async (configuration, forceRefresh = false) => {
  const now = Math.floor(Date.now() / 1000);
  if (!forceRefresh && cachedAccessToken?.expiresAt > now + 60) return cachedAccessToken.value;

  const header = base64Url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const claims = base64Url(JSON.stringify({
    iss: configuration.email,
    scope: GOOGLE_SCOPE,
    aud: GOOGLE_TOKEN_URL,
    iat: now,
    exp: now + 3600
  }));
  const unsignedToken = `${header}.${claims}`;
  let signature;

  try {
    const signer = createSign('RSA-SHA256');
    signer.update(unsignedToken);
    signer.end();
    signature = signer.sign(configuration.privateKey);
  } catch {
    throw new CareersError('CAREERS_NOT_CONFIGURED', 'The Google service-account key could not be read.', 503);
  }

  const assertion = `${unsignedToken}.${base64Url(signature)}`;
  const response = await fetchWithTimeout(GOOGLE_TOKEN_URL, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion
    })
  });

  if (!response.ok) {
    throw new CareersError('GOOGLE_AUTH_FAILED', 'The Careers connection could not authenticate with Google.', 502);
  }

  const payload = await response.json();
  if (!payload.access_token) {
    throw new CareersError('GOOGLE_AUTH_FAILED', 'Google did not return an access token.', 502);
  }

  cachedAccessToken = {
    value: payload.access_token,
    expiresAt: now + Math.min(Number(payload.expires_in) || 3600, 3600)
  };
  return cachedAccessToken.value;
};

async function fetchWithTimeout(url, options = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } catch (error) {
    if (error?.name === 'AbortError') {
      throw new CareersError('GOOGLE_TIMEOUT', 'The Careers data source took too long to respond.', 504);
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

const googleJson = async (url, configuration, forceRefresh = false) => {
  const token = await createAccessToken(configuration, forceRefresh);
  const response = await fetchWithTimeout(url, {
    headers: { authorization: `Bearer ${token}`, accept: 'application/json' }
  });

  if (response.status === 401 && !forceRefresh) {
    cachedAccessToken = null;
    return googleJson(url, configuration, true);
  }
  if (response.status === 404) {
    throw new CareersError('ROLE_NOT_FOUND', 'This role is no longer open.', 404);
  }
  if (!response.ok) {
    throw new CareersError('GOOGLE_API_FAILED', 'The Careers data source is temporarily unavailable.', 502);
  }
  return response.json();
};

const listRoleFiles = async configuration => {
  const files = [];
  let pageToken = '';

  do {
    const params = new URLSearchParams({
      q: `'${configuration.folderId}' in parents and trashed = false and mimeType = '${GOOGLE_DOC_MIME}'`,
      fields: 'nextPageToken,files(id,name,mimeType,parents,createdTime,modifiedTime)',
      orderBy: 'createdTime desc',
      pageSize: '100',
      supportsAllDrives: 'true',
      includeItemsFromAllDrives: 'true'
    });
    if (pageToken) params.set('pageToken', pageToken);

    const payload = await googleJson(`https://www.googleapis.com/drive/v3/files?${params}`, configuration);
    files.push(...(payload.files || []));
    pageToken = payload.nextPageToken || '';
  } while (pageToken);

  return files;
};

const getRoleFile = async (id, configuration) => {
  const fields = 'id,name,mimeType,parents,createdTime,modifiedTime,trashed';
  const payload = await googleJson(
    `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(id)}?fields=${encodeURIComponent(fields)}&supportsAllDrives=true`,
    configuration
  );

  const isPublished = payload.mimeType === GOOGLE_DOC_MIME
    && !payload.trashed
    && Array.isArray(payload.parents)
    && payload.parents.includes(configuration.folderId);
  if (!isPublished) throw new CareersError('ROLE_NOT_FOUND', 'This role is no longer open.', 404);
  return payload;
};

const getRoleDocument = (id, configuration) => googleJson(
  `https://docs.googleapis.com/v1/documents/${encodeURIComponent(id)}?includeTabsContent=true`,
  configuration
);

const getBodyContent = document => {
  if (Array.isArray(document.tabs) && document.tabs.length) {
    return document.tabs[0]?.documentTab?.body?.content || [];
  }
  return document.body?.content || [];
};

const inlineText = element => {
  if (element.textRun?.content) return element.textRun.content;
  if (element.richLink?.richLinkProperties) {
    return element.richLink.richLinkProperties.title
      || element.richLink.richLinkProperties.uri
      || '';
  }
  if (element.person?.personProperties?.name) return element.person.personProperties.name;
  if (element.dateElement?.dateElementProperties?.displayText) return element.dateElement.dateElementProperties.displayText;
  return '';
};

const extractParagraphs = document => getBodyContent(document)
  .filter(item => item.paragraph)
  .map(item => ({
    text: (item.paragraph.elements || []).map(inlineText).join('').replace(/\n+$/, '').trim(),
    bullet: Boolean(item.paragraph.bullet),
    style: item.paragraph.paragraphStyle?.namedStyleType || 'NORMAL_TEXT'
  }))
  .filter(paragraph => paragraph.text);

const normaliseHeading = text => text
  .toLowerCase()
  .replace(/[\u2010-\u2015]/g, '-')
  .replace(/\s*:\s*$/, '')
  .replace(/\s+/g, ' ')
  .trim();

const isPlaceholder = text => /^\s*\[[\s\S]*\]\s*$/.test(text) || /\[(?:required|optional)\b/i.test(text);

const cleanText = text => text.replace(/\s+/g, ' ').trim();

const parseRoleDocument = document => {
  const values = {};
  let target = null;

  for (const paragraph of extractParagraphs(document)) {
    const heading = normaliseHeading(paragraph.text);
    const field = FIELD_HEADINGS.get(heading);
    const section = SECTION_HEADINGS.get(heading);

    if (field || section) {
      target = field || section;
      if (!values[target]) values[target] = [];
      continue;
    }
    if (/^(?:TITLE|SUBTITLE|HEADING_\d+)$/.test(paragraph.style)) {
      target = null;
      continue;
    }
    if (!target || isPlaceholder(paragraph.text)) continue;
    values[target].push({ text: paragraph.text.trim(), bullet: paragraph.bullet });
  }

  const scalar = key => cleanText((values[key] || []).map(item => item.text).join(' '));
  const paragraphs = key => (values[key] || []).map(item => item.text.trim()).filter(Boolean);

  return {
    department: scalar('department'),
    location: scalar('location'),
    workModel: scalar('workModel'),
    employmentType: scalar('employmentType'),
    experienceLevel: scalar('experienceLevel'),
    applicationDeadline: scalar('applicationDeadline'),
    applicationUrl: scalar('applicationUrl'),
    summary: scalar('summary'),
    about: paragraphs('about'),
    responsibilities: paragraphs('responsibilities'),
    requirements: paragraphs('requirements'),
    niceToHave: paragraphs('niceToHave'),
    offer: paragraphs('offer'),
    hiringProcess: paragraphs('hiringProcess'),
    equalOpportunity: paragraphs('equalOpportunity')
  };
};

const safeApplicationUrl = value => {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' ? url.href : '';
  } catch {
    return '';
  }
};

const slugify = value => value
  .normalize('NFKD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '')
  .slice(0, 80) || 'open-role';

const buildRole = (file, document) => {
  const parsed = parseRoleDocument(document);
  parsed.applicationUrl = safeApplicationUrl(parsed.applicationUrl);

  const required = {
    department: parsed.department,
    location: parsed.location,
    workModel: parsed.workModel,
    employmentType: parsed.employmentType,
    applicationUrl: parsed.applicationUrl,
    summary: parsed.summary,
    about: parsed.about.length,
    responsibilities: parsed.responsibilities.length,
    requirements: parsed.requirements.length
  };
  const missing = Object.entries(required).filter(([, value]) => !value).map(([key]) => key);

  return {
    valid: missing.length === 0,
    missing,
    role: {
      id: file.id,
      title: cleanText(file.name || 'Open role'),
      slug: slugify(file.name || 'open-role'),
      createdTime: file.createdTime || null,
      modifiedTime: file.modifiedTime || null,
      ...parsed
    }
  };
};

const toRoleSummary = role => ({
  id: role.id,
  title: role.title,
  slug: role.slug,
  department: role.department,
  location: role.location,
  workModel: role.workModel,
  employmentType: role.employmentType,
  experienceLevel: role.experienceLevel,
  applicationDeadline: role.applicationDeadline,
  summary: role.summary,
  createdTime: role.createdTime,
  modifiedTime: role.modifiedTime
});

const mapWithConcurrency = async (items, limit, mapper) => {
  const results = new Array(items.length);
  let index = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (index < items.length) {
      const current = index++;
      results[current] = await mapper(items[current], current);
    }
  });
  await Promise.all(workers);
  return results;
};

const listPublishedRoles = async () => {
  const configuration = getConfiguration();
  const files = await listRoleFiles(configuration);
  if (!files.length) return { roles: [], invalidCount: 0 };

  const results = await mapWithConcurrency(files, 6, async file => {
    try {
      const document = await getRoleDocument(file.id, configuration);
      return buildRole(file, document);
    } catch (error) {
      console.warn('Careers: unable to parse role document', file.id, error?.code || error?.message);
      return { valid: false, missing: ['unreadable'], error };
    }
  });

  const failures = results.filter(result => result.error);
  if (failures.length === files.length) throw failures[0].error;

  const roles = results
    .filter(result => result.valid)
    .map(result => toRoleSummary(result.role));
  return { roles, invalidCount: results.length - roles.length };
};

const getPublishedRole = async id => {
  const configuration = getConfiguration();
  const file = await getRoleFile(id, configuration);
  const document = await getRoleDocument(id, configuration);
  const result = buildRole(file, document);

  if (!result.valid) {
    console.warn('Careers: requested role is incomplete', id, result.missing.join(','));
    throw new CareersError('ROLE_NOT_FOUND', 'This role is no longer open.', 404);
  }
  return result.role;
};

const sendJson = (response, status, payload, { cache = false } = {}) => {
  response.statusCode = status;
  response.setHeader('Content-Type', 'application/json; charset=utf-8');
  response.setHeader('X-Content-Type-Options', 'nosniff');
  if (cache && status === 200) {
    response.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
    response.setHeader('CDN-Cache-Control', 'public, s-maxage=30, stale-while-revalidate=30');
    response.setHeader('Vercel-CDN-Cache-Control', 'public, s-maxage=30, stale-while-revalidate=30');
  } else {
    response.setHeader('Cache-Control', 'no-store');
  }
  response.end(JSON.stringify(payload));
};

const sendError = (response, error) => {
  const known = error instanceof CareersError;
  const status = known ? error.status : 500;
  const code = known ? error.code : 'CAREERS_UNAVAILABLE';
  const message = known && status < 500
    ? error.message
    : known && code === 'CAREERS_NOT_CONFIGURED'
      ? error.message
      : 'Open roles are temporarily unavailable.';
  sendJson(response, status, { error: { code, message } });
};

module.exports = {
  CareersError,
  buildRole,
  extractParagraphs,
  getPublishedRole,
  listPublishedRoles,
  parseRoleDocument,
  sendError,
  sendJson,
  slugify
};
