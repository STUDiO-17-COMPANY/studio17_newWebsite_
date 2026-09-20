# Studio 17 automatic article publishing

Status: implemented, connected to the live Drive workflow and locally verified
Last reviewed: 2026-09-20

## Drive resources

- Article root: `1O6v2Ni5gaXQa6W_CWEAQ9G9APzc1eUGk`
- Live publication folder — `1. Open Articles`: `1k8x27HIhYJH2VNpasBuj5wZSTV7CVIEP`
- Media folder — `2. Article Media`: `1epwy_o7_lyY5R--igJ5wkJEQ3hExnJyb`
- Master template — `Website Article Template`: `1VSRFP2xefxMBSI-o1teewuWAaLzgfnoaFNkf1GO46Ag`
- Editorial guide — `Guidance for Website Articles Automatic`: `1-0wkUYsZ0c6OsAK-DK4Y_XrKT9ih2JKM3ktykjxlcDc`
- Owner account: `contact@studio17.world` only.

## Publishing contract

One Google Doc represents one article. It contains a shared `SETUP` tab and language tabs named `EN`, `PT-PT`, `ES`, `EL`, `RU` and `HE`.

English is required. An optional language appears only when its tab contains every required field, article body and CTA and contains no template placeholders. An incomplete language is omitted from the homepage, `/news`, the article language controls, `hreflang` metadata and the XML sitemap.

An article is public only when:

1. Its Google Doc is directly inside `1. Open Articles`.
2. `Publication status` is exactly `Published`.
3. Shared fields and the English tab validate.
4. Its slug, date, CTA and media references are safe.

Moving the Doc out of the folder or changing its status to `Draft` removes it automatically after the CDN cache refresh.

## Images and sharing

All article images must be uploaded directly to `2. Article Media`. The server validates the Drive file ID, parent folder, image MIME type, deletion state and maximum size before returning bytes.

The cover image and social-share image are deliberately independent:

- `Cover image` appears on archive cards and inside the article.
- `Social share image` supplies Open Graph and Twitter preview metadata.

The recommended social image is 1200 × 630 px. A public share never falls back to the cover image because the share-image field is required.

`Author image` is optional and belongs in the shared `SETUP` tab. Upload the portrait to `2. Article Media` and paste its Drive link into that field. When it is absent, the article renders an accessible initials fallback, so existing articles remain valid.

## Article conversion and related content

Each language tab accepts four optional fields for a compact conversion box above the desktop Continue reading rail:

- `Sidebar CTA title`
- `Sidebar CTA description`
- `Sidebar CTA button text`
- `Sidebar CTA button URL`

Complete all four fields to show the box in that language. Leaving all four blank keeps the box hidden. The button URL follows the same safety rules as the closing CTA: a clean internal path, `https:` link or `mailto:` link.

`Related article slugs` in `SETUP` accepts a comma-separated list without a three-article limit. The right rail intentionally shows the first three related articles. The complete Continue reading section after the closing CTA shows every valid related article and becomes a looping carousel when four or more are available; its arrows stay hidden for three or fewer.

## Tables inside an article

Native Google Docs tables are supported inside the `Article body` of every language tab.

1. Put the cursor at the exact position where the table should appear.
2. In Google Docs, choose **Insert > Table** and create the required columns and rows.
3. Use the first row for short, meaningful column headings. The website renders this as the accessible table header.
4. Add the information in the remaining rows using plain text.
5. Repeat and translate the table independently in each language tab where the article is published.

Use at least two columns and one data row. Keep tables to a maximum of 12 columns and 100 rows. Avoid merged cells, nested tables and images inside cells; these structures are intentionally simplified by the secure article parser. On narrow screens, the table remains at a readable width and scrolls horizontally without widening the page.

## Website architecture

- `GET /api/articles?lang=<locale>` — newest-first validated summaries for the homepage and archive.
- `GET /api/article-page?slug=<slug>&lang=<locale>` — server-rendered article page and metadata.
- `GET /api/article-image?id=<drive-file-id>` — restricted article-media delivery.
- `/insights/<slug>` — clean route for articles categorised as `Insight`.
- `/case-studies/<slug>` — clean route for articles categorised as `Case Study`.
- `/news/<slug>` — clean route for articles categorised as `News`; `/news` remains the complete archive.
- `/news` — multilingual archive with All, Insights, Case Studies and News filters.
- `/sitemap.xml` — static pages, open roles and every valid article translation.

The shared category field determines the public route automatically. If an article category changes, requests to its previous or otherwise mismatched category route receive a permanent redirect to the current route. Cards, related content, language links, canonical tags, `hreflang`, the human sitemap and the XML sitemap all use the same category-aware route helper, preventing duplicate indexable URLs.

Article metadata includes a canonical URL, valid-language alternates, `Article` JSON-LD, publication/modified dates and the independent social image. Removed or incomplete articles return a non-indexable unavailable page.

The reader uses a three-column layout on wide desktop screens: section navigation, a controlled-width article column and compact related-article cards. The complete related-article section remains at the end. On mobile, the repeated cover image is removed, metadata is condensed and the section navigation starts collapsed so readers reach the article substantially sooner.

The public feeds use a 60-second CDN cache with a five-minute stale-while-revalidate window. Article images use a longer immutable cache because Drive file IDs identify fixed file versions.

## Environment contract

The article reader reuses the keyless Vercel OIDC and Google Workload Identity configuration documented for Careers. It additionally accepts:

```text
GOOGLE_DRIVE_ARTICLES_FOLDER_ID=1k8x27HIhYJH2VNpasBuj5wZSTV7CVIEP
GOOGLE_DRIVE_ARTICLE_MEDIA_FOLDER_ID=1epwy_o7_lyY5R--igJ5wkJEQ3hExnJyb
```

The default IDs are also embedded as safe non-secret configuration. The Google service account still needs Reader access to the article root so its live and media children are accessible.

## Verification

- Parser regression covers shared fields, locale validation, separate media IDs, lists, quotes, draft rejection and safe CTAs.
- Page tests cover the article template, server rendering, clean routing, `index,follow`, structured data and independent social preview image.
- Local browser QA passed at 1440 px and 390 px for `/news` and the article demo with zero horizontal overflow, a single H1, correct five-item mobile navigation and Hebrew RTL empty states.
- Production must be retested after folder access is granted and the changes are deployed.

## Editorial safety

- Never publish invented results, testimonials, quotes, clients or statistics.
- Every image requires useful alt text.
- Only internal clean routes, `https:` and `mailto:` CTAs are accepted.
- Google Doc content is converted to a restricted block model; executable HTML, scripts and iframes are never emitted.
- Keep the master template outside `1. Open Articles`; publish only completed copies.
