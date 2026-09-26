# Studio 17 automatic article publishing

Status: implemented, connected to the live Drive workflow and locally verified
Last reviewed: 2026-09-26

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

Moving a completed Google Doc directly into `1. Open Articles` is the publication approval action. An article is eligible only when:

1. Its Google Doc is directly inside `1. Open Articles`.
2. Shared fields and the English tab validate.
3. Its slug, date, CTA and media references are safe.

`Publication status` is retained in older Docs for backwards compatibility but no longer controls the website. Folder membership is the source of truth.

- If the article is first detected in `1. Open Articles` with today's `Publication date`, it is published immediately.
- If its `Publication date` is in the future, it remains private and returns no public URL until 10:00 Europe/Nicosia on that date.
- The stored schedule remains stable across cache refreshes and Cyprus daylight-saving changes.
- Moving the Doc out of `1. Open Articles` unpublishes it automatically after the source cache refresh.

Scheduled content is excluded from the homepage, News archive, category results, direct article routes, related content, the human and XML sitemaps and `llms.txt` until its release time.

## Images and sharing

All article images must be uploaded directly to `2. Article Media`. The server validates the Drive file ID, parent folder, image MIME type, deletion state and maximum size before returning bytes.

The cover image and social-share image are deliberately independent:

- `Cover image` appears on archive cards and inside the article.
- `Social share image` supplies Open Graph and Twitter preview metadata.

The recommended social image is 1200 × 630 px. A public share never falls back to the cover image because the share-image field is required.

Published article images are never delivered to readers as raw Google Drive files. The image endpoint creates constrained WebP variants for article content and JPEG for social previews, emits responsive `srcset` markup, and uses a versioned URL with one-year immutable caching. When the project Blob store is connected, each generated variant is uploaded once and subsequent requests are redirected to the public global CDN URL. If Blob is temporarily unavailable, the optimized variant is still returned through the existing Vercel CDN endpoint, so images remain available during rollout or provider incidents.

The article hero requests only the appropriate 720, 1280 or 1600 px variant and receives high fetch priority. Inline images remain lazy-loaded with responsive 480, 960 and 1600 px options. Article cards use a dedicated 720 px version instead of downloading the full original. Width, height and a neutral placeholder reserve space before delivery to reduce layout movement.

`Author image` is optional and belongs in the shared `SETUP` tab. Upload the portrait to `2. Article Media` and paste its Drive link into that field. When it is absent, the article renders an accessible initials fallback, so existing articles remain valid.

## Article conversion and related content

Each language tab accepts four optional fields for a compact conversion box above the desktop Continue reading rail:

- `Sidebar CTA title`
- `Sidebar CTA description`
- `Sidebar CTA button text`
- `Sidebar CTA button URL`

Complete all four fields to show the box in that language. Leaving all four blank keeps the box hidden. The button URL follows the same safety rules as the closing CTA: a clean internal path, `https:` link or `mailto:` link.

`Related article slugs` in `SETUP` accepts a comma-separated list without a three-article limit. The right rail intentionally shows the first three related articles. The complete Continue reading section after the closing CTA shows every valid related article and becomes a looping carousel when four or more are available; its arrows stay hidden for three or fewer.

## Inline links inside an article

Links applied to words or phrases in the Google Doc `Article body` are preserved on the published website. Select the relevant text in Google Docs, use **Insert link**, and enter a website URL, email link or clean internal Studio 17 path. Linked text is rendered in Studio 17 blue with an underline, supports keyboard focus and opens external web links safely in a new tab. Existing articles without inline links continue to render unchanged. Unsafe link protocols are discarded while their visible text is retained.

## Tables inside an article

Native Google Docs tables are supported inside the `Article body` of every language tab.

1. Put the cursor at the exact position where the table should appear.
2. In Google Docs, choose **Insert > Table** and create the required columns and rows.
3. Use the first row for short, meaningful column headings. The website renders this as the accessible table header.
4. Add the information in the remaining rows using plain text.
5. Repeat and translate the table independently in each language tab where the article is published.

Use at least two columns and one data row. Keep tables to a maximum of 12 columns and 100 rows. Avoid merged cells, nested tables and images inside cells; these structures are intentionally simplified by the secure article parser. On narrow screens, the table remains at a readable width and scrolls horizontally without widening the page.

## Website architecture

- `GET /api/articles?lang=<locale>` — newest-first validated summaries from the shared processed publication cache.
- `/` — the latest six published English articles are rendered into the first HTML response; JavaScript only enhances later language changes.
- `GET /api/article-page?slug=<slug>&lang=<locale>` — server-rendered article page and metadata.
- `GET /api/article-image?id=<drive-file-id>` — restricted article-media delivery.
- `/insights/<slug>` — clean route for articles categorised as `Insight`.
- `/case-studies/<slug>` — clean route for articles categorised as `Case Study`.
- `/news/<slug>` — clean route for articles categorised as `News`; `/news` remains the complete archive.
- `/news` and `/news/page/<number>` — server-rendered archive with nine cards per page, crawlable pagination, category filters and metadata search. Search and filter result URLs are `noindex,follow`; clean numbered archive pages are indexable.
- `/sitemap.xml` — static pages, open roles and every valid article translation.

The shared category field determines the public route automatically. If an article category changes, requests to its previous or otherwise mismatched category route receive a permanent redirect to the current route. Cards, related content, language links, canonical tags, `hreflang`, the human sitemap and the XML sitemap all use the same category-aware route helper, preventing duplicate indexable URLs.

Article metadata includes a canonical URL, valid-language alternates, `Article` JSON-LD, publication/modified dates and the independent social image. Removed or incomplete articles return a non-indexable unavailable page.

The reader uses a three-column layout on wide desktop screens: section navigation, a controlled-width article column and compact related-article cards. The complete related-article section remains at the end. On mobile, the repeated cover image is removed, metadata is condensed and the section navigation starts collapsed so readers reach the article substantially sooner.

Google Drive remains the editorial source, but normal homepage, archive, article, sitemap and `llms.txt` requests share one processed publication manifest in Vercel Runtime Cache. The fresh manifest lasts two minutes and each validated article plus a last-known-good manifest is retained for up to 30 days. A future article is stored in that manifest with a private release timestamp, so publication at 10:00 does not depend on a fresh Google Drive request, another deployment or an additional Vercel Function. A temporary Drive/Docs error therefore serves the last validated publication set instead of emptying public pages. Any failed document fetch aborts a refresh so a partial source response cannot accidentally remove live content.

The homepage and archive HTML responses normally use a two-minute CDN cache with a ten-minute stale-while-revalidate window. When a future publication exists, the cache automatically shortens to the release boundary and disables stale delivery so scheduled content cannot remain hidden behind an old response after 10:00. Article images use a longer immutable cache because Drive file IDs identify fixed file versions. Publishing, editing or removing a valid article updates the detail route, homepage six-card feed, paginated archive, XML sitemap and `llms.txt` from this same source after cache refresh; no second URL list is maintained.

## Environment contract

The article reader reuses the keyless Vercel OIDC and Google Workload Identity configuration documented for Careers. It additionally accepts:

```text
GOOGLE_DRIVE_ARTICLES_FOLDER_ID=1k8x27HIhYJH2VNpasBuj5wZSTV7CVIEP
GOOGLE_DRIVE_ARTICLE_MEDIA_FOLDER_ID=1epwy_o7_lyY5R--igJ5wkJEQ3hExnJyb
```

The default IDs are also embedded as safe non-secret configuration. The Google service account still needs Reader access to the article root so its live and media children are accessible.

For direct Blob delivery, connect a public Vercel Blob store to the production project. Vercel supplies `BLOB_READ_WRITE_TOKEN`, or `BLOB_STORE_ID` can be used with the existing Vercel OIDC identity. No extra Serverless Function is created; the existing article-image function performs the one-time optimization and upload.

## Verification

- Parser regression covers shared fields, locale validation, separate media IDs, lists, quotes, safe inline links, folder-controlled approval, Cyprus summer/winter scheduling, release gating, cache-boundary expiry and safe CTAs.
- Image regression covers URL versioning, supported widths and formats, resizing and WebP output without adding another Vercel Function.
- Page tests cover the article template, server rendering, clean routing, `index,follow`, structured data and independent social preview image.
- Local browser QA passed at 1440 px and 390 px for `/news` and the article demo with zero horizontal overflow, a single H1, correct five-item mobile navigation and Hebrew RTL empty states.
- Production must be retested after folder access is granted and the changes are deployed.

## Editorial safety

- Never publish invented results, testimonials, quotes, clients or statistics.
- Every image requires useful alt text.
- Only internal clean routes, `https:` and `mailto:` CTAs are accepted.
- Google Doc content is converted to a restricted block model; executable HTML, scripts and iframes are never emitted.
- Keep the master template outside `1. Open Articles`; publish only completed copies.
