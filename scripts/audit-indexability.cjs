'use strict';

const SITE_URL = process.env.SITE_URL || 'https://www.studio17.world';

const readMeta = (html, name) => {
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const patterns = [
    new RegExp(`<meta\\s+name=["']${escaped}["']\\s+content=["']([^"']+)["']`, 'i'),
    new RegExp(`<meta\\s+content=["']([^"']+)["']\\s+name=["']${escaped}["']`, 'i')
  ];
  return patterns.map(pattern => html.match(pattern)?.[1]).find(Boolean) || '';
};

const readCanonical = html => {
  const patterns = [
    /<link\s+rel=["']canonical["']\s+href=["']([^"']+)["']/i,
    /<link\s+href=["']([^"']+)["']\s+rel=["']canonical["']/i
  ];
  return patterns.map(pattern => html.match(pattern)?.[1]).find(Boolean) || '';
};

const audit = async url => {
  const response = await fetch(url, { redirect: 'manual' });
  const body = await response.text();
  return {
    url,
    status: response.status,
    redirect: response.headers.get('location') || '',
    xRobotsTag: response.headers.get('x-robots-tag') || '',
    metaRobots: readMeta(body, 'robots'),
    canonical: readCanonical(body)
  };
};

(async () => {
  const sitemapResponse = await fetch(`${SITE_URL}/sitemap.xml`);
  if (!sitemapResponse.ok) throw new Error(`Sitemap returned HTTP ${sitemapResponse.status}`);
  const sitemap = await sitemapResponse.text();
  const entries = [...sitemap.matchAll(/<url>([\s\S]*?)<\/url>/g)].map(match => {
    const block = match[1];
    return {
      url: block.match(/<loc>([^<]+)<\/loc>/)?.[1].replace(/&amp;/g, '&') || '',
      sitemapLastmod: block.match(/<lastmod>([^<]+)<\/lastmod>/)?.[1] || ''
    };
  }).filter(item => item.url);
  const results = [];
  for (const item of entries) results.push({ ...await audit(item.url), sitemapLastmod: item.sitemapLastmod });

  const lastmodIsInvalid = value => {
    if (!value) return true;
    const timestamp = Date.parse(value);
    return Number.isNaN(timestamp) || timestamp > Date.now() + 86400000;
  };

  const failures = results.filter(result => (
    result.status !== 200
    || /noindex/i.test(result.xRobotsTag)
    || /noindex/i.test(result.metaRobots)
    || !/\bindex\b/i.test(result.xRobotsTag || result.metaRobots)
    || !result.canonical
    || lastmodIsInvalid(result.sitemapLastmod)
  ));

  console.table(results.map(result => ({
    status: result.status,
    robots: result.xRobotsTag || result.metaRobots || '(missing)',
    canonical: result.canonical || '(missing)',
    lastmod: result.sitemapLastmod || '(missing)',
    url: result.url
  })));
  console.log(`\nAudited ${results.length} sitemap URLs. ${failures.length} issue(s) found.`);
  if (failures.length) {
    for (const failure of failures) console.error(JSON.stringify(failure));
    process.exitCode = 1;
  }
})().catch(error => {
  console.error(error);
  process.exit(1);
});
