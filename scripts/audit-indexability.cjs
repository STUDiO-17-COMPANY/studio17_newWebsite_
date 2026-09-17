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
  const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)]
    .map(match => match[1].replace(/&amp;/g, '&'));
  const results = [];
  for (const url of urls) results.push(await audit(url));

  const failures = results.filter(result => (
    result.status !== 200
    || /noindex/i.test(result.xRobotsTag)
    || /noindex/i.test(result.metaRobots)
    || !/\bindex\b/i.test(result.xRobotsTag || result.metaRobots)
    || !result.canonical
  ));

  console.table(results.map(result => ({
    status: result.status,
    robots: result.xRobotsTag || result.metaRobots || '(missing)',
    canonical: result.canonical || '(missing)',
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
