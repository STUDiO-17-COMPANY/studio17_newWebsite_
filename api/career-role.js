'use strict';

const { CareersError, getPublishedRole, sendError, sendJson } = require('./_google-careers');

module.exports = async function careerRoleHandler(request, response) {
  if (request.method !== 'GET') {
    response.setHeader('Allow', 'GET');
    sendJson(response, 405, { error: { code: 'METHOD_NOT_ALLOWED', message: 'Use GET for this endpoint.' } });
    return;
  }

  const url = new URL(request.url || '/', `https://${request.headers.host || 'studio17.world'}`);
  const id = url.searchParams.get('id') || '';
  if (!/^[A-Za-z0-9_-]{10,200}$/.test(id)) {
    sendError(response, new CareersError('INVALID_ROLE_ID', 'The role link is invalid.', 400));
    return;
  }

  try {
    const role = await getPublishedRole(id);
    sendJson(response, 200, { role, meta: { language: 'en', generatedAt: new Date().toISOString() } }, { cache: true });
  } catch (error) {
    if (error?.status >= 500) console.error('Career role failed', id, error?.code || error?.message);
    sendError(response, error);
  }
};
