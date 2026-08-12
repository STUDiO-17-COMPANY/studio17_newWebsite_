# Studio 17 automatic article publishing

Status: implemented and locally verified; production folder permission and deployment remain
Last reviewed: 2026-08-12

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

## Website architecture

- `GET /api/articles?lang=<locale>` — newest-first validated summaries for the homepage and archive.
- `GET /api/article-page?slug=<slug>&lang=<locale>` — server-rendered article page and metadata.
- `GET /api/article-image?id=<drive-file-id>` — restricted article-media delivery.
- `/insights/<slug>` — clean article URL, rewritten to the server renderer.
- `/news` — multilingual archive with All, Insights, Case Studies and News filters.
- `/sitemap.xml` — static pages, open roles and every valid article translation.

Article metadata includes a canonical URL, valid-language alternates, `Article` JSON-LD, publication/modified dates and the independent social image. Removed or incomplete articles return a non-indexable unavailable page.

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
