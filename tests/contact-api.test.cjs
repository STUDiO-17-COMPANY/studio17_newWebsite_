'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const contactHandler = require('../api/contact');

const envExample = fs.readFileSync(path.join(__dirname, '..', '.env.example'), 'utf8');
assert.match(envExample, /^RESEND_API_KEY=$/m);
assert.match(envExample, /^CONTACT_FROM_EMAIL="Studio 17 Website <contact@studio17\.world>"$/m);
assert.match(envExample, /^CONTACT_TO_EMAIL=contact@studio17\.world$/m);
assert.doesNotMatch(envExample, /RESEND_API_KEY=re_/);

const createResponse = () => {
  const headers = new Map();
  return {
    statusCode: 200,
    setHeader(name, value) { headers.set(name.toLowerCase(), value); },
    end(body = '') { this.body = body; },
    getHeader(name) { return headers.get(name.toLowerCase()); }
  };
};

let requestNumber = 0;
const call = async ({ method = 'POST', body = {}, origin = 'https://www.studio17.world' } = {}) => {
  const response = createResponse();
  requestNumber += 1;
  await contactHandler({
    method,
    body,
    headers: {
      origin,
      'x-forwarded-for': `192.0.2.${requestNumber}`
    }
  }, response);
  return { response, payload: JSON.parse(response.body) };
};

const validSubmission = {
  name: 'Alex Smith',
  email: 'alex@example.com',
  company: '<Acme & Co>',
  phone: '+351 210 000 000',
  service: 'website',
  budget: '3k-10k',
  message: 'We need a multilingual website for our European launch.',
  language: 'pt-PT',
  consent: 'yes',
  website: '',
  submissionId: '123e4567-e89b-12d3-a456-426614174000'
};

(async () => {
  const originalFetch = global.fetch;
  const originalKey = process.env.RESEND_API_KEY;
  delete process.env.RESEND_API_KEY;

  const method = await call({ method: 'GET' });
  assert.equal(method.response.statusCode, 405);

  const origin = await call({ body: validSubmission, origin: 'https://malicious.example' });
  assert.equal(origin.response.statusCode, 403);
  assert.equal(origin.payload.error.code, 'ORIGIN_NOT_ALLOWED');

  const invalid = await call({ body: { ...validSubmission, email: 'not-an-email' } });
  assert.equal(invalid.response.statusCode, 400);
  assert.equal(invalid.payload.error.code, 'INVALID_SUBMISSION');

  let fetchCalls = 0;
  global.fetch = async () => {
    fetchCalls += 1;
    return Response.json({ id: 'email-id' });
  };
  const trap = await call({ body: { ...validSubmission, website: 'spam.example' } });
  assert.equal(trap.response.statusCode, 200);
  assert.equal(fetchCalls, 0);

  const unconfigured = await call({ body: validSubmission });
  assert.equal(unconfigured.response.statusCode, 503);
  assert.equal(unconfigured.payload.error.code, 'CONTACT_NOT_CONFIGURED');

  process.env.RESEND_API_KEY = 're_test_key';
  let sentRequest;
  global.fetch = async (url, options) => {
    sentRequest = { url: String(url), options, body: JSON.parse(options.body) };
    return Response.json({ id: 'email-id' });
  };
  const sent = await call({ body: validSubmission });
  assert.equal(sent.response.statusCode, 200);
  assert.equal(sent.payload.ok, true);
  assert.equal(sentRequest.url, 'https://api.resend.com/emails');
  assert.equal(sentRequest.options.headers.authorization, 'Bearer re_test_key');
  assert.equal(sentRequest.options.headers['user-agent'], 'Studio17-Website/1.0');
  assert.match(sentRequest.options.headers['idempotency-key'], /^contact\//);
  assert.equal(sentRequest.body.from, 'Studio 17 Website <contact@studio17.world>');
  assert.deepEqual(sentRequest.body.to, ['contact@studio17.world']);
  assert.equal(sentRequest.body.reply_to, 'alex@example.com');
  assert.match(sentRequest.body.html, /&lt;Acme &amp; Co&gt;/);
  assert.doesNotMatch(sentRequest.body.html, /<Acme/);
  assert.match(sentRequest.body.text, /Website language: pt-PT/);

  global.fetch = originalFetch;
  if (originalKey === undefined) delete process.env.RESEND_API_KEY;
  else process.env.RESEND_API_KEY = originalKey;
  console.log('Contact API tests passed.');
})().catch(error => {
  console.error(error);
  process.exit(1);
});
