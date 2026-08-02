'use strict';

const DEFAULT_OPEN_ROLES_FOLDER_ID = '1jbuO2nBYoGwnFP7HLZFTERt_IUmclxGc';
const GOOGLE_STS_URL = 'https://sts.googleapis.com/v1/token';
const GOOGLE_SCOPES = [
  'https://www.googleapis.com/auth/drive.readonly',
  'https://www.googleapis.com/auth/documents.readonly'
];
const GOOGLE_CLOUD_SCOPE = 'https://www.googleapis.com/auth/cloud-platform';
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
  const folderId = process.env.GOOGLE_DRIVE_OPEN_ROLES_FOLDER_ID || DEFAULT_OPEN_ROLES_FOLDER_ID;

  if (!projectNumber || !poolId || !providerId || !email || !oidcToken) {
    throw new CareersError(
      'CAREERS_NOT_CONFIGURED',
      'The Careers connection has not been configured yet.',
      503
    );
  }

  const audience = `//iam.googleapis.com/projects/${projectNumber}/locations/global/workloadIdentityPools/${poolId}/providers/${providerId}`;
  return { audience, email, folderId, oidcToken };
};

const createAccessToken = async (configuration, forceRefresh = false) => {
  const now = Math.floor(Date.now() / 1000);
  if (!forceRefresh && cachedAccessToken?.expiresAt > now + 60) return cachedAccessToken.value;

  const federationResponse = await fetchWithTimeout(GOOGLE_STS_URL, {
    method: 'POST',
    headers: { 'content-type': 'application/json', accept: 'application/json' },
    body: JSON.stringify({
      audience: configuration.audience,
      grantType: 'urn:ietf:params:oauth:grant-type:token-exchange',
      requestedTokenType: 'urn:ietf:params:oauth:token-type:access_token',
      scope: GOOGLE_CLOUD_SCOPE,
      subjectTokenType: 'urn:ietf:params:oauth:token-type:jwt',
      subjectToken: configuration.oidcToken
    })
  });

  if (!federationResponse.ok) {
    throw new CareersError('GOOGLE_AUTH_FAILED', 'The Careers connection could not authenticate with Google.', 502);
  }

  const federation = await federationResponse.json();
  if (!federation.access_token) {
    throw new CareersError('GOOGLE_AUTH_FAILED', 'Google did not accept the Vercel identity token.', 502);
  }

  const impersonationUrl = `https://iamcredentials.googleapis.com/v1/projects/-/serviceAccounts/${encodeURIComponent(configuration.email)}:generateAccessToken`;
  const impersonationResponse = await fetchWithTimeout(impersonationUrl, {
    method: 'POST',
    headers: {
      authorization: `Bearer ${federation.access_token}`,
      'content-type': 'application/json',
      accept: 'application/json'
    },
    body: JSON.stringify({ scope: GOOGLE_SCOPES, lifetime: '3600s' })
  });

  if (!impersonationResponse.ok) {
    throw new CareersError('GOOGLE_AUTH_FAILED', 'The Careers connection could not assume its Google identity.', 502);
  }

  const payload = await impersonationResponse.json();
  if (!payload.accessToken) {
    throw new CareersError('GOOGLE_AUTH_FAILED', 'Google did not return a short-lived access token.', 502);
  }

  const expireTime = Math.floor(Date.parse(payload.expireTime || '') / 1000);
  cachedAccessToken = {
    value: payload.accessToken,
    expiresAt: Number.isFinite(expireTime) ? expireTime : now + 3600
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

const listPublishedRoles = async request => {
  const configuration = getConfiguration(request);
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

const getPublishedRole = async (id, request) => {
  const configuration = getConfiguration(request);
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
