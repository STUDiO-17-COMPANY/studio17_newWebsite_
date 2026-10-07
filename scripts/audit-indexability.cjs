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

const normaliseUrl = value => {
  try {
    const url = new URL(value);
    url.hash = '';
    return url.href;
  } catch { return ''; }
};

const audit = async url => {
  const response = await fetch(url, { redirect: 'manual', headers: { 'user-agent': 'Googlebot' } });
  const body = await response.text();
  return {
    url,
    status: response.status,
    redirect: response.headers.get('location') || '',
    xRobotsTag: response.headers.get('x-robots-tag') || '',
    metaRobots: readMeta(body, 'robots'),
    canonical: readCanonical(body),
    body
  };
};

(async () => {
  const robotsResponse = await fetch(`${SITE_URL}/robots.txt`, { redirect: 'manual' });
  const robots = await robotsResponse.text();
  if (!robotsResponse.ok || !/^Allow:\s*\/$/im.test(robots) || !new RegExp(`^Sitemap:\\s*${SITE_URL.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\/sitemap\\.xml$`, 'im').test(robots)) {
    throw new Error('robots.txt does not allow public crawling and reference the canonical sitemap.');
  }
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
  const duplicateUrls = entries.map(item => item.url).filter((url, index, all) => all.indexOf(url) !== index);
  if (duplicateUrls.length) throw new Error(`Duplicate sitemap URLs: ${[...new Set(duplicateUrls)].join(', ')}`);
  for (const item of entries) {
    const url = new URL(item.url);
    if (url.protocol !== 'https:' || url.host !== 'www.studio17.world' || url.hash) {
      throw new Error(`Non-canonical sitemap URL: ${item.url}`);
    }
  }
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
    || /nofollow/i.test(result.xRobotsTag)
    || /nofollow/i.test(result.metaRobots)
    || !result.canonical
    || normaliseUrl(result.canonical) !== normaliseUrl(result.url)
    || (result.sitemapLastmod && lastmodIsInvalid(result.sitemapLastmod))
  ));

  const careers = results.find(result => result.url === `${SITE_URL}/careers`);
  const roleUrls = entries.map(item => item.url).filter(url => url.startsWith(`${SITE_URL}/careers/`));
  const missingRoleLinks = roleUrls.filter(url => !careers?.body.includes(`href="${new URL(url).pathname}"`));
  if (missingRoleLinks.length) failures.push(...missingRoleLinks.map(url => ({ url, issue: 'Role is missing from server-rendered Careers HTML.' })));

  const pageTwo = results.find(result => result.url === `${SITE_URL}/news/page/2`);
  if (pageTwo && !/class="news-card"/.test(pageTwo.body)) failures.push({ url: pageTwo.url, issue: 'News page 2 has no server-rendered article cards.' });
  if (entries.some(item => item.url.includes('/how-much-doe-seo-cost-'))) failures.push({ url: `${SITE_URL}/sitemap.xml`, issue: 'Sitemap contains the retired typo slug.' });

  console.table(results.map(result => ({
    status: result.status,
    robots: result.xRobotsTag || result.metaRobots || '(missing)',
    canonical: result.canonical || '(missing)',
    lastmod: result.sitemapLastmod || '(missing)',
    url: result.url
  })));
  console.log(`\nAudited ${results.length} sitemap URLs. ${failures.length} issue(s) found.`);
  if (failures.length) {
    for (const failure of failures) console.error(JSON.stringify({ ...failure, body: undefined }));
    process.exitCode = 1;
  }
})().catch(error => {
  console.error(error);
  process.exit(1);
});
