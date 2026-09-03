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
const call = async ({ method = 'POST', body = {}, origin = 'https://www.studio17.world', ip } = {}) => {
  const response = createResponse();
  requestNumber += 1;
  await contactHandler({
    method,
    body,
    headers: { origin, 'x-forwarded-for': ip || `192.0.2.${requestNumber}` }
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
  const originalVercelEnvironment = process.env.VERCEL_ENV;
  const originalConsoleError = console.error;
  delete process.env.RESEND_API_KEY;

  try {
    const method = await call({ method: 'GET' });
    assert.equal(method.response.statusCode, 405);
    assert.equal(method.response.getHeader('allow'), 'POST');
    assert.equal(method.response.getHeader('cache-control'), 'no-store');
    assert.equal(method.response.getHeader('x-content-type-options'), 'nosniff');

    const origin = await call({ body: validSubmission, origin: 'https://malicious.example' });
    assert.equal(origin.response.statusCode, 403);
    assert.equal(origin.payload.error.code, 'ORIGIN_NOT_ALLOWED');

    process.env.VERCEL_ENV = 'production';
    const insecureOrigin = await call({ body: validSubmission, origin: 'http://localhost:4173' });
    assert.equal(insecureOrigin.response.statusCode, 403);
    process.env.VERCEL_ENV = 'preview';
    const localOrigin = await call({ body: validSubmission, origin: 'http://127.0.0.1:4173' });
    assert.equal(localOrigin.response.statusCode, 503);

    const malformed = await call({ body: '{not json' });
    assert.equal(malformed.response.statusCode, 400);
    assert.equal(malformed.payload.error.code, 'INVALID_JSON');

    const invalidCases = [
      ['name', { name: 'A' }],
      ['email', { email: 'not-an-email' }],
      ['service', { service: 'unknown' }],
      ['budget', { budget: 'unknown' }],
      ['message', { message: 'Too short' }],
      ['language', { language: 'fr' }],
      ['consent', { consent: false }]
    ];
    for (const [field, change] of invalidCases) {
      const invalid = await call({ body: { ...validSubmission, ...change } });
      assert.equal(invalid.response.statusCode, 400, `${field} should be rejected`);
      assert.equal(invalid.payload.error.code, 'INVALID_SUBMISSION');
    }

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
    const sentRequests = [];
    global.fetch = async (url, options) => {
      sentRequests.push({ url: String(url), options, body: JSON.parse(options.body) });
      return Response.json({ id: 'email-id' });
    };
    const sent = await call({ body: validSubmission });
    assert.equal(sent.response.statusCode, 200);
    assert.equal(sent.payload.ok, true);
    const sentRequest = sentRequests.at(-1);
    assert.equal(sentRequest.url, 'https://api.resend.com/emails');
    assert.equal(sentRequest.options.headers.authorization, 'Bearer re_test_key');
    assert.equal(sentRequest.options.headers['user-agent'], 'Studio17-Website/1.0');
    assert.equal(sentRequest.options.headers['idempotency-key'], `contact/${validSubmission.submissionId}`);
    assert.equal(sentRequest.body.from, 'Studio 17 Website <contact@studio17.world>');
    assert.deepEqual(sentRequest.body.to, ['contact@studio17.world']);
    assert.equal(sentRequest.body.reply_to, 'alex@example.com');
    assert.match(sentRequest.body.html, /&lt;Acme &amp; Co&gt;/);
    assert.doesNotMatch(sentRequest.body.html, /<Acme/);
    assert.match(sentRequest.body.text, /Website language: pt-PT/);
    assert.deepEqual(sentRequest.body.tags, [
      { name: 'source', value: 'website-contact' },
      { name: 'language', value: 'pt-PT' },
      { name: 'service', value: 'website' }
    ]);

    const localeRequests = [];
    global.fetch = async (url, options) => {
      localeRequests.push(JSON.parse(options.body));
      return Response.json({ id: 'email-id' });
    };
    for (const language of ['en', 'pt-PT', 'es', 'el', 'ru', 'he']) {
      const result = await call({ body: { ...validSubmission, language, submissionId: `contact-language-${language}` } });
      assert.equal(result.response.statusCode, 200, `${language} submission should send`);
    }
    assert.deepEqual(localeRequests.map(request => request.tags.find(tag => tag.name === 'language').value), ['en', 'pt-PT', 'es', 'el', 'ru', 'he']);
    assert.deepEqual(localeRequests.map(request => request.text.match(/Website language: ([^\n]+)/)[1]), ['en', 'pt-PT', 'es', 'el', 'ru', 'he']);

    const duplicateId = 'duplicate-contact-submission';
    const duplicateKeys = [];
    global.fetch = async (url, options) => {
      duplicateKeys.push(options.headers['idempotency-key']);
      return Response.json({ id: 'email-id' });
    };
    await call({ body: { ...validSubmission, submissionId: duplicateId } });
    await call({ body: { ...validSubmission, submissionId: duplicateId } });
    assert.deepEqual(duplicateKeys, [`contact/${duplicateId}`, `contact/${duplicateId}`]);

    console.error = () => {};
    global.fetch = async () => Response.json({ name: 'provider_error' }, { status: 500 });
    const providerFailure = await call({ body: validSubmission });
    assert.equal(providerFailure.response.statusCode, 502);
    assert.equal(providerFailure.payload.error.code, 'EMAIL_DELIVERY_FAILED');

    global.fetch = async () => { throw new TypeError('network unavailable'); };
    const networkFailure = await call({ body: validSubmission });
    assert.equal(networkFailure.response.statusCode, 502);
    assert.equal(networkFailure.payload.error.code, 'EMAIL_DELIVERY_FAILED');

    global.fetch = async () => Response.json({ id: 'email-id' });
    const rateIp = '198.51.100.77';
    for (let index = 0; index < 5; index += 1) {
      const accepted = await call({ body: { ...validSubmission, submissionId: `rate-limit-${index}` }, ip: rateIp });
      assert.equal(accepted.response.statusCode, 200);
    }
    const limited = await call({ body: validSubmission, ip: rateIp });
    assert.equal(limited.response.statusCode, 429);
    assert.equal(limited.payload.error.code, 'RATE_LIMITED');

    console.log('Contact API tests passed.');
  } finally {
    global.fetch = originalFetch;
    console.error = originalConsoleError;
    if (originalKey === undefined) delete process.env.RESEND_API_KEY;
    else process.env.RESEND_API_KEY = originalKey;
    if (originalVercelEnvironment === undefined) delete process.env.VERCEL_ENV;
    else process.env.VERCEL_ENV = originalVercelEnvironment;
  }
})().catch(error => {
  console.error(error);
  process.exit(1);
});
