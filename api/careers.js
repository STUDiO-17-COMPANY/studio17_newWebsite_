'use strict';

const { listPublishedRoles, sendError, sendJson } = require('./_google-careers');

module.exports = async function careersHandler(request, response) {
  if (request.method !== 'GET') {
    response.setHeader('Allow', 'GET');
    sendJson(response, 405, { error: { code: 'METHOD_NOT_ALLOWED', message: 'Use GET for this endpoint.' } });
    return;
  }

  try {
    const result = await listPublishedRoles(request);
    sendJson(response, 200, {
      roles: result.roles,
      meta: {
        language: 'en',
        invalidRoleCount: result.invalidCount,
        generatedAt: new Date().toISOString()
      }
    }, { cache: true });
  } catch (error) {
    console.error('Careers list failed', error?.code || error?.message);
    sendError(response, error);
  }
};
