'use strict';

const crypto = require('node:crypto');

const CONTACT_TO = process.env.CONTACT_TO_EMAIL || 'contact@studio17.world';
const CONTACT_FROM = process.env.CONTACT_FROM_EMAIL || 'Studio 17 Website <contact@studio17.world>';
const MAX_BODY_BYTES = 20 * 1024;
const RATE_WINDOW_MS = 15 * 60 * 1000;
const RATE_LIMIT = 5;
const attempts = new Map();

const allowedServices = new Set(['website', 'content', 'social-media', 'advertising', 'digital-systems', 'ai-solutions', 'other']);
const allowedBudgets = new Set(['not-sure', 'under-1k', '1k-3k', '3k-10k', '10k-plus']);
const allowedLanguages = new Set(['en', 'pt-PT', 'es', 'el', 'ru', 'he']);
const serviceLabels = {
  website: 'Website',
  content: 'Content creation',
  'social-media': 'Social Media',
  advertising: 'Advertisement',
  'digital-systems': 'Digital systems',
  'ai-solutions': 'AI solutions',
  other: 'Something else'
};
const budgetLabels = {
  'not-sure': 'Not sure yet',
  'under-1k': 'Under €1,000',
  '1k-3k': '€1,000–€3,000',
  '3k-10k': '€3,000–€10,000',
  '10k-plus': '€10,000+'
};

const getHeader = (request, name) => {
  const value = request.headers?.[name] ?? request.headers?.[name.toLowerCase()];
  return Array.isArray(value) ? value[0] : String(value || '');
};

const sendJson = (response, status, payload) => {
  response.statusCode = status;
  response.setHeader('Content-Type', 'application/json; charset=utf-8');
  response.setHeader('Cache-Control', 'no-store');
  response.setHeader('X-Content-Type-Options', 'nosniff');
  response.end(JSON.stringify(payload));
};

const readBody = request => new Promise((resolve, reject) => {
  if (request.body && typeof request.body === 'object') {
    resolve(request.body);
    return;
  }
  if (typeof request.body === 'string') {
    try { resolve(JSON.parse(request.body)); } catch { reject(new Error('INVALID_JSON')); }
    return;
  }
  let size = 0;
  const chunks = [];
  request.on('data', chunk => {
    size += chunk.length;
    if (size > MAX_BODY_BYTES) {
      reject(new Error('BODY_TOO_LARGE'));
      request.destroy();
      return;
    }
    chunks.push(chunk);
  });
  request.on('end', () => {
    try { resolve(JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}')); }
    catch { reject(new Error('INVALID_JSON')); }
  });
  request.on('error', reject);
});

const clean = (value, max) => String(value || '')
  .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
  .replace(/\r\n?/g, '\n')
  .trim()
  .slice(0, max);

const escapeHtml = value => String(value || '')
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;');

const validate = body => {
  const data = {
    name: clean(body.name, 100),
    email: clean(body.email, 254).toLowerCase(),
    company: clean(body.company, 120),
    phone: clean(body.phone, 50),
    service: clean(body.service, 40),
    budget: clean(body.budget || 'not-sure', 40),
    message: clean(body.message, 5000),
    language: clean(body.language || 'en', 10),
    consent: body.consent === 'yes' || body.consent === true,
    website: clean(body.website, 200),
    submissionId: clean(body.submissionId, 100)
  };
  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(data.email);
  const valid = data.name.length >= 2
    && emailValid
    && allowedServices.has(data.service)
    && allowedBudgets.has(data.budget)
    && data.message.length >= 20
    && allowedLanguages.has(data.language)
    && data.consent;
  return { valid, data };
};

const allowedOrigin = request => {
  const origin = getHeader(request, 'origin');
  if (!origin) return true;
  try {
    const { hostname, protocol } = new URL(origin);
    if (process.env.VERCEL_ENV !== 'production'
      && protocol === 'http:'
      && (hostname === 'localhost' || hostname === '127.0.0.1')) return true;
    return protocol === 'https:' && (
      hostname === 'www.studio17.world'
      || hostname === 'studio17.world'
      || hostname.endsWith('.vercel.app')
    );
  } catch {
    return false;
  }
};

const isRateLimited = request => {
  const forwarded = getHeader(request, 'x-forwarded-for').split(',')[0].trim();
  const ip = forwarded || getHeader(request, 'x-real-ip');
  if (!ip) return false;
  const now = Date.now();
  const recent = (attempts.get(ip) || []).filter(timestamp => now - timestamp < RATE_WINDOW_MS);
  if (recent.length >= RATE_LIMIT) {
    attempts.set(ip, recent);
    return true;
  }
  recent.push(now);
  attempts.set(ip, recent);
  if (attempts.size > 1000) {
    for (const [key, values] of attempts) {
      if (!values.some(timestamp => now - timestamp < RATE_WINDOW_MS)) attempts.delete(key);
    }
  }
  return false;
};

const emailMarkup = data => {
  const row = (label, value) => value
    ? `<tr><td style="padding:10px 12px;color:#64748b;border-bottom:1px solid #e2e8f0;vertical-align:top">${escapeHtml(label)}</td><td style="padding:10px 12px;color:#0f172a;border-bottom:1px solid #e2e8f0">${escapeHtml(value)}</td></tr>`
    : '';
  return `<!doctype html><html><body style="margin:0;background:#f1f5f9;font-family:Arial,sans-serif;color:#0f172a"><div style="max-width:680px;margin:0 auto;padding:32px 16px"><div style="background:#0f172a;color:#fff;padding:24px 28px"><strong style="font-size:22px">Studio 17</strong><p style="margin:8px 0 0;color:#cbd5e1">New website enquiry</p></div><div style="background:#fff;padding:20px 16px"><table style="width:100%;border-collapse:collapse;font-size:15px">${row('Name', data.name)}${row('Email', data.email)}${row('Company', data.company)}${row('Phone', data.phone)}${row('Service', serviceLabels[data.service])}${row('Budget', budgetLabels[data.budget])}${row('Website language', data.language)}</table><div style="padding:22px 12px"><p style="margin:0 0 8px;color:#64748b">Project details</p><p style="margin:0;white-space:pre-wrap;line-height:1.6">${escapeHtml(data.message)}</p></div></div></div></body></html>`;
};

const emailText = data => [
  'New Studio 17 website enquiry',
  '',
  `Name: ${data.name}`,
  `Email: ${data.email}`,
  data.company ? `Company: ${data.company}` : '',
  data.phone ? `Phone: ${data.phone}` : '',
  `Service: ${serviceLabels[data.service]}`,
  `Budget: ${budgetLabels[data.budget]}`,
  `Website language: ${data.language}`,
  '',
  'Project details:',
  data.message
].filter(line => line !== '').join('\n');

module.exports = async function contactHandler(request, response) {
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST');
    sendJson(response, 405, { ok: false, error: { code: 'METHOD_NOT_ALLOWED' } });
    return;
  }
  if (!allowedOrigin(request)) {
    sendJson(response, 403, { ok: false, error: { code: 'ORIGIN_NOT_ALLOWED' } });
    return;
  }
  if (isRateLimited(request)) {
    sendJson(response, 429, { ok: false, error: { code: 'RATE_LIMITED' } });
    return;
  }

  let body;
  try { body = await readBody(request); }
  catch (error) {
    sendJson(response, error.message === 'BODY_TOO_LARGE' ? 413 : 400, { ok: false, error: { code: error.message } });
    return;
  }

  const { valid, data } = validate(body);
  if (data.website) {
    sendJson(response, 200, { ok: true });
    return;
  }
  if (!valid) {
    sendJson(response, 400, { ok: false, error: { code: 'INVALID_SUBMISSION' } });
    return;
  }
  if (!process.env.RESEND_API_KEY) {
    sendJson(response, 503, { ok: false, error: { code: 'CONTACT_NOT_CONFIGURED' } });
    return;
  }

  const idempotencyId = /^[A-Za-z0-9-]{8,100}$/.test(data.submissionId)
    ? data.submissionId
    : crypto.randomUUID();
  const subjectSuffix = data.company ? ` — ${data.company}` : '';
  try {
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        'content-type': 'application/json',
        'user-agent': 'Studio17-Website/1.0',
        'idempotency-key': `contact/${idempotencyId}`
      },
      body: JSON.stringify({
        from: CONTACT_FROM,
        to: [CONTACT_TO],
        reply_to: data.email,
        subject: `Website enquiry — ${data.name}${subjectSuffix}`.slice(0, 180),
        html: emailMarkup(data),
        text: emailText(data),
        tags: [
          { name: 'source', value: 'website-contact' },
          { name: 'language', value: data.language },
          { name: 'service', value: data.service }
        ]
      })
    });
    if (!emailResponse.ok) {
      const errorPayload = await emailResponse.json().catch(() => ({}));
      console.error('Contact email failed', emailResponse.status, errorPayload.name || errorPayload.error || 'RESEND_ERROR');
      sendJson(response, 502, { ok: false, error: { code: 'EMAIL_DELIVERY_FAILED' } });
      return;
    }
    sendJson(response, 200, { ok: true });
  } catch (error) {
    console.error('Contact email unavailable', error?.name || 'NETWORK_ERROR');
    sendJson(response, 502, { ok: false, error: { code: 'EMAIL_DELIVERY_FAILED' } });
  }
};
