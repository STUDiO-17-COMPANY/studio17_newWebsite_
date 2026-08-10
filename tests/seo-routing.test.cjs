'use strict';

const assert = require('node:assert/strict');
const careerPageHandler = require('../api/career-page');
const legacyCareerHandler = require('../api/legacy-career');
const sitemapHandler = require('../api/sitemap');

const createResponse = () => {
  const headers = new Map();
  return {
    statusCode: 200,
    setHeader(name, value) { headers.set(name.toLowerCase(), value); },
    end(body = '') { this.body = body; },
    getHeader(name) { return headers.get(name.toLowerCase()); }
  };
};

const call = async (handler, url) => {
  const response = createResponse();
  await handler({
    method: 'GET',
    url,
    headers: { host: 'www.studio17.world', 'x-vercel-oidc-token': 'test-oidc-token' }
  }, response);
  return response;
};

const paragraph = (text, style = 'NORMAL_TEXT', bullet = false) => ({
  paragraph: {
    elements: [{ textRun: { content: `${text}\n` } }],
    paragraphStyle: { namedStyleType: style },
    ...(bullet ? { bullet: { listId: 'test' } } : {})
  }
});

(async () => {
  process.env.GCP_PROJECT_NUMBER = '123456789012';
  process.env.GCP_SERVICE_ACCOUNT_EMAIL = 'careers-test@example.test';
  process.env.GCP_WORKLOAD_IDENTITY_POOL_ID = 'vercel';
  process.env.GCP_WORKLOAD_IDENTITY_POOL_PROVIDER_ID = 'vercel';
  process.env.GOOGLE_DRIVE_OPEN_ROLES_FOLDER_ID = 'openRolesFolder';

  const roleFile = {
    id: 'roleDocument123456',
    name: 'Growth Strategist',
    mimeType: 'application/vnd.google-apps.document',
    parents: ['openRolesFolder'],
    createdTime: '2026-08-01T12:00:00.000Z',
    modifiedTime: '2026-08-02T12:00:00.000Z',
    trashed: false
  };
  const roleDocument = {
    body: {
      content: [
        paragraph('Department', 'HEADING_2'), paragraph('Growth'),
        paragraph('Location', 'HEADING_2'), paragraph('Europe'),
        paragraph('Work model', 'HEADING_2'), paragraph('Remote'),
        paragraph('Employment type', 'HEADING_2'), paragraph('Full-time'),
        paragraph('Application URL', 'HEADING_2'), paragraph('https://example.com/apply'),
        paragraph('Short summary', 'HEADING_2'), paragraph('Build useful growth systems.'),
        paragraph('Applicant countries (SEO)', 'HEADING_2'), paragraph('Portugal, Spain'),
        paragraph('About the role', 'HEADING_2'), paragraph('A practical role.'),
        paragraph('What you will do', 'HEADING_2'), paragraph('Own the roadmap.', 'NORMAL_TEXT', true),
        paragraph('What we are looking for', 'HEADING_2'), paragraph('Clear communication.', 'NORMAL_TEXT', true)
      ]
    }
  };

  global.fetch = async (url, options = {}) => {
    const value = String(url);
    if (value.includes('sts.googleapis.com/v1/token')) return Response.json({ access_token: 'federated-token' });
    if (value.includes('iamcredentials.googleapis.com')) {
      assert.equal(options.headers.authorization, 'Bearer federated-token');
      return Response.json({ accessToken: 'google-access-token', expireTime: new Date(Date.now() + 3600000).toISOString() });
    }
    if (value.includes('/drive/v3/files?')) return Response.json({ files: [roleFile] });
    if (value.includes('/documents/roleDocument123456')) return Response.json(roleDocument);
    if (value.includes('/drive/v3/files/roleDocument123456')) return Response.json(roleFile);
    return Response.json({}, { status: 500 });
  };

  const page = await call(careerPageHandler, '/api/career-page?slug=growth-strategist');
  assert.equal(page.statusCode, 200);
  assert.match(page.getHeader('content-type'), /text\/html/);
  assert.match(page.body, /<link rel="canonical" href="https:\/\/www\.studio17\.world\/careers\/growth-strategist">/);
  assert.match(page.body, /"@type":"JobPosting"/);
  assert.match(page.body, /window\.__STUDIO17_ROLE__/);
  assert.doesNotMatch(page.body, /canonical[^>]+\?id=/i);

  const missing = await call(careerPageHandler, '/api/career-page?slug=not-open');
  assert.equal(missing.statusCode, 404);
  assert.match(missing.body, /name="robots" content="noindex,follow"/);

  const legacy = await call(legacyCareerHandler, '/api/legacy-career?id=roleDocument123456&role=growth-strategist&lang=en');
  assert.equal(legacy.statusCode, 308);
  assert.equal(legacy.getHeader('location'), '/careers/growth-strategist');

  const sitemap = await call(sitemapHandler, '/api/sitemap');
  assert.equal(sitemap.statusCode, 200);
  assert.match(sitemap.body, /https:\/\/www\.studio17\.world\/careers\/growth-strategist/);
  assert.match(sitemap.body, /https:\/\/www\.studio17\.world\/faq/);
  assert.match(sitemap.body, /https:\/\/www\.studio17\.world\/about/);
  assert.match(sitemap.body, /https:\/\/www\.studio17\.world\/sitemap</);
  assert.doesNotMatch(sitemap.body, /career-role\.html|\?id=/);

  console.log('SEO routing tests passed.');
})().catch(error => {
  console.error(error);
  process.exit(1);
});
