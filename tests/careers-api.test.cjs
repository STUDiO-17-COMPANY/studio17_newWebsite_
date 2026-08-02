'use strict';

const assert = require('node:assert/strict');
const { generateKeyPairSync } = require('node:crypto');
const careersHandler = require('../api/careers');
const careerRoleHandler = require('../api/career-role');

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
  await handler({ method: 'GET', url, headers: { host: 'studio17.world' } }, response);
  return { response, payload: JSON.parse(response.body) };
};

const paragraph = (text, style = 'NORMAL_TEXT', bullet = false) => ({
  paragraph: {
    elements: [{ textRun: { content: `${text}\n` } }],
    paragraphStyle: { namedStyleType: style },
    ...(bullet ? { bullet: { listId: 'test' } } : {})
  }
});

(async () => {
  delete process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  delete process.env.GOOGLE_PRIVATE_KEY;
  delete process.env.GOOGLE_SERVICE_ACCOUNT_JSON_BASE64;

  const originalError = console.error;
  console.error = () => {};
  const unconfigured = await call(careersHandler, '/api/careers');
  console.error = originalError;
  assert.equal(unconfigured.response.statusCode, 503);
  assert.equal(unconfigured.payload.error.code, 'CAREERS_NOT_CONFIGURED');
  assert.doesNotMatch(unconfigured.response.body, /PRIVATE KEY|service-account@/i);

  const { privateKey } = generateKeyPairSync('rsa', { modulusLength: 2048 });
  process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL = 'careers-test@example.test';
  process.env.GOOGLE_PRIVATE_KEY = privateKey.export({ type: 'pkcs8', format: 'pem' });
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
    tabs: [{
      documentTab: {
        body: {
          content: [
            paragraph('Department', 'HEADING_2'), paragraph('Growth'),
            paragraph('Location', 'HEADING_2'), paragraph('Europe'),
            paragraph('Work model', 'HEADING_2'), paragraph('Remote'),
            paragraph('Employment type', 'HEADING_2'), paragraph('Full-time'),
            paragraph('Application URL', 'HEADING_2'), paragraph('https://example.com/apply'),
            paragraph('Short summary', 'HEADING_2'), paragraph('Build useful growth systems.'),
            paragraph('Role description', 'HEADING_1'),
            paragraph('About the role', 'HEADING_2'), paragraph('A practical role.'),
            paragraph('What you will do', 'HEADING_2'), paragraph('Own the roadmap.', 'NORMAL_TEXT', true),
            paragraph('What we are looking for', 'HEADING_2'), paragraph('Clear communication.', 'NORMAL_TEXT', true),
            paragraph('Final check before publishing', 'HEADING_1'), paragraph('Internal template instruction.', 'NORMAL_TEXT', true)
          ]
        }
      }
    }]
  };

  global.fetch = async url => {
    const value = String(url);
    if (value.includes('oauth2.googleapis.com/token')) return Response.json({ access_token: 'test-token', expires_in: 3600 });
    if (value.includes('/drive/v3/files?')) return Response.json({ files: [roleFile] });
    if (value.includes('/drive/v3/files/roleDocument123456')) return Response.json(roleFile);
    if (value.includes('/documents/roleDocument123456')) return Response.json(roleDocument);
    return Response.json({ error: 'unexpected request' }, { status: 500 });
  };

  const list = await call(careersHandler, '/api/careers');
  assert.equal(list.response.statusCode, 200);
  assert.equal(list.payload.roles.length, 1);
  assert.equal(list.payload.roles[0].title, 'Growth Strategist');
  assert.match(list.response.getHeader('vercel-cdn-cache-control'), /s-maxage=30/);

  const detail = await call(careerRoleHandler, '/api/career-role?id=roleDocument123456');
  assert.equal(detail.response.statusCode, 200);
  assert.deepEqual(detail.payload.role.about, ['A practical role.']);
  assert.equal(detail.payload.role.equalOpportunity.length, 0);

  const invalid = await call(careerRoleHandler, '/api/career-role?id=bad');
  assert.equal(invalid.response.statusCode, 400);
  assert.equal(invalid.payload.error.code, 'INVALID_ROLE_ID');

  console.log('Careers API tests passed.');
})().catch(error => {
  console.error(error);
  process.exit(1);
});
