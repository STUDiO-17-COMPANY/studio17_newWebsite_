'use strict';
const data = require('../faq-data/approved.json');
const entries = [...new Map(data.records.flatMap(record => record.ctas).map(cta => [cta.url, cta])).values()];
(async () => {
  let failed = false;
  for (const cta of entries) {
    try {
      const response = await fetch(cta.url, { signal: AbortSignal.timeout(20000), redirect: 'follow' });
      const body = await response.text();
      const title = body.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] || '';
      const ok = response.status === 200 && new URL(response.url).hostname === 'www.studio17.world' && !new URL(response.url).pathname.startsWith('/wip') && !/page (?:not found|unavailable)|404/i.test(title);
      console.log(JSON.stringify({ label: cta.label, url: cta.url, status: response.status, finalUrl: response.url, title, ok }));
      if (!ok) failed = true;
    } catch (error) { failed = true; console.log(JSON.stringify({ url: cta.url, ok: false, error: error.cause?.code || error.message })); }
  }
  if (failed) process.exitCode = 1;
})();
