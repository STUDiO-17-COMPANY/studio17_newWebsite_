'use strict';

const { getPublishedRole } = require('./_google-careers');

module.exports = async function legacyCareerHandler(request, response) {
  const url = new URL(request.url || '/', `https://${request.headers.host || 'www.studio17.world'}`);
  let slug = (url.searchParams.get('role') || '').toLowerCase();
  const id = url.searchParams.get('id') || '';

  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) && /^[A-Za-z0-9_-]{10,200}$/.test(id)) {
    try {
      slug = (await getPublishedRole(id, request)).slug;
    } catch {
      slug = '';
    }
  }

  response.statusCode = 308;
  response.setHeader('Location', slug ? `/careers/${encodeURIComponent(slug)}` : '/careers');
  response.setHeader('Cache-Control', 'public, max-age=3600');
  response.end();
};
