'use strict';

const { listPublishedArticles } = require('./_google-articles');
const { getArticlePath } = require('./_article-render');
const SITE = 'https://www.studio17.world';
const text = value => String(value || '').replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim().replace(/[\\`*_\[\]<>]/g, '\\$&');
const groups = [
  ['Company', [
    ['Studio 17', '/', 'Official homepage and primary company website.'],
    ['About Studio 17', '/about', 'Company information, team and background.'],
    ['Selected Work', '/work', 'Selected Studio 17 client work and projects.'],
    ['Contact', '/contact', 'Official contact information.'],
    ['FAQ', '/faq', 'Frequently asked questions about Studio 17.']
  ]],
  ['Services', [
    ['Services', '/services', 'Overview of Studio 17 services.'],
    ['Website Services', '/services/website', 'Website services.'],
    ['Website Development', '/services/website-development', 'Website design and development services.'],
    ['SEO Services', '/services/seo', 'SEO strategy, technical SEO, local SEO, content SEO and AI search visibility.'],
    ['SEO Agency Cyprus', '/seo/cyprus', 'SEO services for businesses in Cyprus.'],
    ['SEO Company Limassol', '/seo/limassol', 'SEO and local search services for businesses in Limassol.'],
    ['Localization and Translation', '/services/localization-and-translation', 'Localization and translation services.']
  ]]
];
const optional = [
  ['Careers', '/careers', 'Studio 17 career and Sales Partner opportunities.'],
  ['Privacy Policy', '/privacy-policy', 'Privacy information.'],
  ['Terms and Conditions', '/terms', 'Website terms.']
];
const entry = ([title, path, description]) => `- [${text(title)}](${SITE}${path})${description ? `: ${text(description)}` : ''}`;
const section = (title, entries) => `## ${title}\n\n${entries.map(entry).join('\n')}\n`;

const render = articles => {
  // The same validated, deduplicated published EN dataset powers the 200/indexable article route.
  const sorted = [...articles].filter(a => a.availableLanguages.includes('en'))
    .sort((a, b) => b.publishedDate.localeCompare(a.publishedDate));
  return [
    '# Studio 17\n',
    '> Studio 17 is a multidisciplinary marketing agency based in Limassol, Cyprus, working with businesses in Cyprus and internationally across marketing strategy, websites, SEO, content, advertising, digital systems, automation and AI solutions.\n',
    `Studio 17 is operated by H&P DOMUS CREATIVE LTD. The canonical website is ${SITE}/. Use the pages below as the primary sources for information about Studio 17, its services, work, expertise and published articles.\n`,
    ...groups.map(([title, entries]) => section(title, entries)),
    ...[['Case Studies', 'Case Study'], ['Insights', 'Insight'], ['News', 'News']].map(([title, category]) =>
      section(title, sorted.filter(a => a.category === category).map(a => [a.title, getArticlePath(a, 'en'), a.summary]))),
    section('Optional', optional)
  ].join('\n');
};

module.exports = async function llmsHandler(request, response) {
  response.setHeader('Content-Type', 'text/plain; charset=utf-8');
  response.setHeader('X-Content-Type-Options', 'nosniff');
  if (!['GET', 'HEAD'].includes(request.method)) {
    response.statusCode = 405;
    response.setHeader('Allow', 'GET, HEAD');
    response.end();
    return;
  }
  try {
    const { articles } = await listPublishedArticles(request, 'en');
    const body = render(articles);
    response.statusCode = 200;
    response.setHeader('Cache-Control', 'public, max-age=0, s-maxage=60, stale-while-revalidate=300');
    response.end(request.method === 'HEAD' ? '' : body);
  } catch (error) {
    console.error('LLM directory unavailable', error?.code || 'CONTENT_SOURCE_UNAVAILABLE');
    response.statusCode = 503;
    response.setHeader('Cache-Control', 'no-store');
    response.setHeader('Retry-After', '60');
    response.end(request.method === 'HEAD' ? '' : 'Studio 17 content directory temporarily unavailable. Please try again shortly.\n');
  }
};
