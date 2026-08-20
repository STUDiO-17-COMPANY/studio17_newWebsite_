# Studio 17 website design guidelines

Status: canonical implementation standard
Last reviewed: 2026-08-20
Design source: Figma homepage frame `1725:3411` and the supplied `Homepage.pdf`

These rules are the baseline for the homepage, sitemap and every future Studio 17 page. If a later approved Figma frame conflicts with this document, the approved frame wins and this document must be updated in the same change.

## 1. Brand character

Studio 17 should feel direct, modern and commercially useful. The interface is built from strong typography, square geometry, off-white space, deep navy surfaces and bright blue emphasis. Avoid decorative gradients, soft rounded cards, glass effects or generic startup styling unless a future approved design explicitly introduces them.

## 2. Foundations

| Token | Value | Rule |
| --- | --- | --- |
| Paper | `#F8FAFC` | Default page surface |
| Ink | `#0F172A` | Text, cards, hero fields and footer |
| Blue | `#0456FE` | Highlights, selected states and primary actions |
| White | `#FFFFFF` | Text and controls on dark surfaces |
| Grey | `#838893` | Footer wordmark and muted dark-surface details |
| Desktop shell | `1440px` | Centred content width at 1920px |
| Section gap | `32px` | Standard desktop vertical transition |
| Motion curve | `cubic-bezier(.22, 1, .36, 1)` | Hover and reveal motion |

Use the locally hosted Inter family in `Fonts/` for the interface. The large footer wordmark is the only exception: it uses the locally hosted Plus Jakarta Sans ExtraBold file. Do not add a remote font dependency. Use tight tracking on large headings, compact metadata and sentence case for body copy.

## 3. Page anatomy

Every public page uses this order:

1. Shared 80px header.
2. A 32px gap.
3. A media-backed page hero using the homepage's `hero-media` signature, 1440px content alignment and 55.7% / 44.3% split.
4. Content sections separated by 32px at desktop.
5. The shared 298px closing CTA when the page has a commercial journey.
6. A 32px gap.
7. The shared compact footer, including the large Studio 17 wordmark and an unobstructed legal row.

The header is part of the document flow. Do not make it sticky: the approved homepage shows it at the top, and a fixed header can overlap long-page content and full-page captures.

## 4. Homepage geometry

The supplied 1920px English desktop homepage established the fixed geometry through the Services section. The approved 2026-08-20 replacement of the former AI block with selected website work makes the remainder of the homepage content-driven. Translated pages may grow vertically when their copy needs more space; never crop translated content to preserve a legacy page height.

| Block | Top | Height |
| --- | ---: | ---: |
| Header | 0px | 80px |
| Hero | 112px | 296px |
| Trusted by | 440px | 341px |
| Services | 813px | 633px |
| Selected website work | After the 32px section gap | Content-driven |
| News | After the 32px section gap | 453px English desktop reference |
| Testimonials | After the 32px section gap | Content-driven |
| Closing CTA | After the 32px section gap | 298px English desktop reference |
| Footer | After the 32px section gap | 729px English desktop reference |

The Services panel is 1440 × 538px. Its six desktop selectors are 212 × 56px with 24px gaps. The selected client-work section uses four project cards at desktop, two at intermediate widths and one at 900px and below, preserving supplied image aspect ratios throughout.

## 5. Internal-page template

The sitemap establishes the template for non-homepage pages:

- Reuse the exact header and footer structure from `index.html`.
- Use the shared `page-hero` structure with a `hero-media` image after the 32px top gap.
- Keep the English desktop hero at exactly 296px and align its columns to the homepage's 55.7% / 44.3% split and shell.
- Reuse the homepage edge fades, dark media overlay and restrained image-scale hover; abstract standalone hero treatments are not part of the page system.
- At 901–1279px use the shared 360px minimum hero; at 900px and below use the same stacked 560px minimum model as the homepage.
- Let translated text increase the minimum height when necessary. Never crop copy, controls or dynamic role titles to preserve a fixed reference height.
- Use the homepage `design-heading` pattern for every major internal-page section: one purposeful phrase receives the blue inline highlight while the remainder stays in the normal heading flow.

### Services page patterns

- Use square, high-contrast cards and the shared blue emphasis; do not introduce rounded SaaS pricing components.
- Use native `details`/`summary` for service groups and FAQs, with a Lucide plus icon and visible keyboard focus.
- Website package cards may grow with translated copy. The Starter card alone carries the blue “Most bought” banner.
- Keep portfolio imagery at its intrinsic aspect ratio with explicit dimensions and `object-fit: cover`; the complete image remains available through its project link.
- At mobile widths, stack service, package, project and process grids into one column and retain the approved five-item mobile menu.
- Use square dark cards, 24px grid gaps and clear link states.
- Reuse the homepage closing CTA when there is a meaningful contact action.
- At 900px and below, stack hero content and cards without document-level horizontal overflow.

Future pages may vary their content and hero image but not the shared hero geometry, shell, media treatment, palette, heading treatment, icon language, CTA or footer contract.

### Work-in-progress page

- `/wip` is the single shared public destination for every page that has not been built yet; `wip.html` remains only its source filename.
- Use `/wip?for=<destination>` so the page can identify and translate the requested destination. Stable keys cover navigation, services, industries, content, company, sales and legal destinations.
- The WIP page reuses the shared header, footer, language selector, square geometry, blue highlight system and Lucide icon language.
- When a final page is published, replace its WIP link in `/sitemap` and update this documentation in the same change.
- Never create separate WIP HTML files per language; all localized variants use the shared page and locale JSON contract.
- Until a real page exists, its header link, CTA, card, sitemap entry and footer link must all use the same WIP key.

### Contact page

- `/contact` is the shared multilingual destination for Contact, Talk to sales and Start growing actions.
- Keep the two-column project brief and form composition on desktop; stack details before the form at 900px and below.
- Preserve visible labels, keyboard focus, native field semantics, translated success/error feedback and the direct email fallback.
- Never expose email-provider credentials or accept a browser-supplied recipient address.

### Legal information pages

- `/privacy-policy`, `/cookie-policy` and `/terms` use the shared internal-page hero, blue inline emphasis, header, language selector and footer.
- Long-form content uses a readable main column with a sticky contents/related-documents sidebar on desktop; the sidebar returns to normal flow at 900px and below.
- Policy tables may scroll inside their own bordered container on narrow screens. The document itself must never create horizontal overflow.
- Legal copy lives in `legal-locales/`; update all five translated JSON sources, regenerate `legal-locales/locales.js`, and retain the complete English HTML fallback.
- Each legal page publishes canonical and six-language `hreflang` metadata. Hebrew uses the shared RTL behavior without mirroring brand artwork.
- The Cookie Policy's Analytics-settings controls must reopen the shared consent panel and remain keyboard accessible.
- Content must describe the actual website implementation. Any provider, form field, analytics behavior, storage key, retention promise or company detail change requires a same-change review of the legal pages and `LEGAL_PAGES.md`.
- Update `CONTACT_FORM.md`, all six locales, the human sitemap and XML sitemap whenever the contact workflow changes.

### FAQ page

- `/faq` is the shared multilingual destination for questions that prospective clients commonly ask before contacting an agency and while searching online.
- Use semantic native `details` and `summary` disclosures so answers remain keyboard-accessible and usable without page-specific JavaScript.
- Keep questions grouped by decision intent: agency fit, websites/SEO/GEO, content/advertising, and AI/digital systems/results.
- State pricing, timing and expected outcomes conditionally; never invent fixed quotes, guarantees or unsupported performance claims.
- Do not add `FAQPage` structured data unless Google eligibility changes and Studio 17 clearly qualifies under the then-current documentation.
- Review the page using real enquiries and Search Console query evidence; useful answers take priority over keyword repetition.

### About page

- `/about` is the shared multilingual company page and replaces every former About WIP destination.
- Explain Studio 17 through the business constraint, connected-system approach, operating method and European/international perspective; do not present a generic agency biography or invent team members.
- Keep the Google Drive presentation as one external link across all locales. Translate the CTA and clearly state that the presentation itself is in Greek.
- The company page may link to service categories that remain WIP, but it must not imply unverified results, clients, offices or awards.
- Reuse the shared media hero, square geometry, restrained hover motion, closing CTA and footer contract.
- Every main About section heading reuses the homepage blue inline-highlight treatment; do not substitute oversized unaccented display headings.
- The opening About statement uses a full-width heading above a two-column copy-and-principle composition; it stacks to one column at 900px and below.

## 6. Components

### Header

- Black Studio 17 logo on paper.
- Uppercase navigation with the blue selected/action square.
- Desktop service dropdown supports mouse, keyboard and Escape.
- Mobile menu uses Lucide `menu` and `x`; it opens full-screen below the 68px mobile header.
- The complete mobile menu is restricted to Services, Work, About, News and Careers. Do not add a CTA, FAQ, Sitemap or another link without explicit approval.

### Headings

- Main section headings use a blue inline block behind the lead phrase.
- Preserve tight line-height and keep the highlighted phrase meaningful.
- Each page has exactly one `h1`; section levels must remain logical.
- Start sections directly with the meaningful heading. Do not add decorative eyebrow, overline or mini-title text above it.
- Keep labels only when they communicate functional information, such as a form field, status, role department or ordered process step.

### Buttons and links

- Primary CTA: solid blue rectangle with a Lucide `arrow-up-right`.
- Compact action: text plus a 24px blue square containing the same icon.
- Hover may darken blue, lift up to 3px and move the arrow slightly north-east.
- Do not use unlabelled icon-only actions unless an accessible name is present.

### Cards and panels

- Square corners only.
- Use contrast and spacing as the default separation method.
- Shadows are interaction feedback, not permanent decoration.
- One selected service and one selected industry at a time.
- Every selector item must explain a distinct offer: use an outcome-led headline, a concrete description of what Studio 17 provides and a service-specific outcome. Do not reuse a generic body or closing outcome across multiple items.
- Keep verified client performance proof only where evidence exists. Other selections should describe deliverables and intended outcomes without guarantees or invented metrics.
- On phone widths, expose the service selector as two native, labelled controls (service area, then service) instead of showing the full category and item button matrices. Keep both controls synchronized with the content card and previous/next image controls.

### Footer

- Dark 729px English reference field. Other locales may grow while preserving the same row order and visual treatment.
- Five-column information area, large grey wordmark and compact legal row.
- The large wordmark uses Plus Jakarta Sans ExtraBold (`800`). Keep “Studio” and “17” in separate spans: `Studio` uses `-5%` letter spacing and `17` uses `-12%` letter spacing.
- Keep a visible word gap between the two spans. At the 1920px reference width the wordmark is 395px; below that it scales fluidly so neither span is clipped.
- The information grid reserves 320px and the wordmark row 329px. Do not add top margin or transforms that recreate the former empty band.
- The display wordmark never receives pointer events. The legal row sits in the interactive foreground so Sitemap and legal links always remain clickable.
- Email uses Lucide `mail`.
- Social brand marks use the supplied official artwork because Lucide does not contain brand logos.
- Footer social navigation contains only the confirmed Instagram, Facebook and LinkedIn profiles. WhatsApp, Google, X and Threads are not displayed.
- Every social link opens the confirmed external profile in a new tab with a visible focus state and an accessible platform label.
- The Company column exposes Privacy policy, Cookie policy and Terms and conditions on every page. These links inherit the selected language but are not added to the mobile menu.

### Language selector

- Every shared header exposes English (`en`), Portuguese from Portugal (`pt-PT`), Spanish (`es`), Greek (`el`), Russian (`ru`) and Hebrew (`he`).
- Resolve the initial locale in this order: page-enforced language, valid `?lang=`, saved visitor choice, first supported value in the browser's ordered language preferences, then English.
- Normalize regional browser codes by their base language: examples include `en-GB` → `en`, `pt-BR` → `pt-PT`, `es-MX` → `es`, `el-GR` → `el`, `ru-RU` → `ru` and `he-IL`/legacy `iw-IL` → `he`.
- The selected locale is reflected in `html[lang]`, persisted locally and shareable through the `?lang=` URL parameter.
- `locales/locales.js` is generated from the canonical JSON files and loads before `i18n.js`, allowing all six languages to work over both `file://` and HTTP.
- Internal HTML links automatically inherit the active `lang` parameter while retaining WIP `for` values and fragments.
- Hebrew sets the document to `dir="rtl"`; brand artwork, media and the Latin footer wordmark remain visually unmirrored.
- The selector must work with mouse, keyboard, Escape and outside-click dismissal on both desktop and mobile.

### Analytics consent

- Every public page loads the shared `analytics.js` controller after `i18n.js`; never paste a second Google tag directly into page HTML.
- Analytics remains off and the Google tag remains unloaded until the visitor explicitly accepts.
- The consent panel uses a white surface, strong blue outline, square corners and the shared focus-state language without obscuring page controls at the 320px minimum width.
- Accept and reject actions remain equally clear, keyboard accessible and fully translated across the six public languages.
- The footer always exposes Analytics settings so a visitor can review or withdraw the saved choice.
- Advertising storage, user data, personalization and Google signals stay disabled unless a future approved privacy scope explicitly changes them.
- Local, preview and non-production hosts never send traffic to the production GA4 property.

### Services browser

The six category lists are the canonical service navigation contract:

| Category | Services |
| --- | --- |
| Website | Website Development; Website Revamp; Free Website; SEO; GEO; Localization and Translation; Maintenance |
| By Industry | Automotive; Restaurants; Health; E-Commerce; Individual Influencers; Clothing Stores; Education; Local Businesses; Physical Advertising |
| Content Creation | Filming/Photography; Video editing and graphic design; Scripting; A.I generated Content |
| Social Media | Social Media Management; Social Media Automation; Growth strategy; Community management |
| Advertisement | Meta and Google Ads; Social Media Ads advertisement; Influencers Advertisement; UGC Creators; Email Advertisement |
| Digital Systems | Software Development; CRM; Internal Tools; Dashboards |

Desktop lists scroll vertically within the fixed English Figma panel when necessary. Between 601px and 900px they become contained horizontal touch tracks. At 600px and below both category tabs and service items use visible two-column grids, so no service disappears off-screen. Category tabs, list items and previous/next controls must always operate on the active localized dataset, and the selected service copy must render in the active language on initial load.

## 7. Icon policy

All interface pictograms come from the locally stored Lucide `1.24.0` browser package at `Vendor/lucide.min.js`.

- Declare icons with `data-lucide` and initialise them once in `script.js`.
- Default stroke width is 2; size icons explicitly in CSS.
- Use `arrow-up-right` for outbound/action affordances, `chevron-left/right` for previous/next, `chevron-down` for disclosure, `languages` for locale, `menu/x` for mobile navigation and `mail` for email.
- Do not use Unicode arrows, CSS triangles or hand-authored SVG paths as substitutes.
- Brand logos are not interface pictograms. Preserve supplied or official brand artwork for Studio 17, clients, partners and social networks.
- Footer social profiles use the supplied white brand sprite, including Instagram, Facebook, LinkedIn and Google, with the same 40px interaction area and visible keyboard focus treatment.
- Partner logos are linked brand elements: preserve their aspect ratio, reveal the partner name on hover or keyboard focus, pause the marquee during interaction, and show a visible blue focus treatment.
- Only the primary marquee set participates in keyboard navigation; repeated sets used to create the seamless loop must use `tabindex="-1"`.
- Testimonial cards display approved quotes without truncation. Keep the author name, optional company role, Lucide quote mark and supplied source link visually consistent; omit the role or source link when one was not provided instead of showing placeholder content.
- Decorative icons are hidden from assistive technology. Interactive icon-only controls require an `aria-label` on their parent control.

## 8. Imagery

- Store permanent assets locally in `Images/`; never commit expiring Figma asset URLs.
- Preserve meaningful focal points at all responsive sizes.
- Use `object-fit: cover` only after verifying desktop and mobile crops.
- Informative images require concise alt text. Repeated marquees and decorative duplicates use empty alt text.
- Partner marks use `object-fit: contain`; never crop artwork inside its logo cell. Each row contains one accessible sequence and one `aria-hidden` loop clone so the marquee can repeat without a jump.
- Partner and client marks require publication permission before launch.

## 9. Motion and states

- Hover transitions normally run between 180ms and 350ms using the shared easing curve.
- Image zoom is limited to approximately 5%.
- Card lift is limited to 3-12px depending on component size.
- Section-reveal motion must never hide content before JavaScript or during full-page capture.
- Partner rows use a 24-second linear marquee in opposite directions. The track travels by exactly one sequence width plus its inter-sequence gap, so the loop has no jump, speed change or reversal.
- Do not pause merely because the pointer rests over the section. Visitors who request reduced motion receive the global static reduced-motion treatment.
- Respect `prefers-reduced-motion: reduce` for animation, transitions and smooth scrolling.
- Focus-visible outlines must remain obvious against both paper and ink surfaces.

## 10. Responsive rules

- `1280px+`: full navigation and the English fixed desktop reference geometry. Non-English content remains free to grow vertically.
- `901-1279px`: content-driven heights, wrapped service controls and split/stacked cards.
- `900px and below`: 68px mobile header, full-screen scroll-safe menu, stacked content and touch-scroll collections.
- `600px and below`: service categories and items become fully visible two-column grids.
- `500px and below`: single-column CTA/footer simplification; do not hide translated copy to force a shorter page.
- The document's `scrollWidth` must equal its viewport width at every supported breakpoint. Deliberately scrollable tracks must be clipped by their own container.
- Fixed heights are permitted only for media crops, icon controls and the approved English 1920px reference. Text-bearing containers must use `min-height` or natural height in translated and responsive layouts.

## 11. Content rules

- Never invent client attribution, testimonials, metrics or endorsements.
- Mark unavailable destinations as planned and link them to the shared WIP page with a stable `for` key.
- Do not disguise email links as article, social or legal pages.
- Use direct source English and correct spelling; update `CONTENT_NOTES.md` whenever provisional content changes.
- Public strings belong in the relevant JSON file under `locales/`. Update all six locale contracts whenever source copy or a service label changes.
- Regenerate `locales/locales.js` after every locale JSON change; never edit the generated bundle directly.
- Do not concatenate translated sentences from fragments. Allow text to wrap naturally, and arrange complete RTL components rather than reversing individual strings.
- Update `sitemap.html` as part of every page addition, rename or removal.
- Careers and individual role pages are the approved English-only exception to the six-locale content rule. They retain the shared header/footer, display the English-availability label and preserve the visitor's saved language outside Careers.
- Dynamic Careers content is rendered with text nodes, uses Lucide icons, keeps square component edges and provides designed loading, empty, API-error, invalid-link and closed-role states.
- Role cards show title, department, location, work model, employment type, summary and one unambiguous detail action. The role page keeps its application action visible in a desktop sticky sidebar and a normal-flow mobile panel.
- Editorial pages use the shared header/footer and media-led visual language, one prominent title with a blue emphasis treatment, clear author/date/read-time metadata, a readable long-form column, optional sticky contents, accessible captions and a closing CTA.
- Article statistics, quotations, results and attribution must be verified before indexing. Prototype values must be visibly labelled and the page must remain `noindex` until approved.
- Article language controls expose only translations that exist and pass required-field validation; a missing translation must never create a thin or empty indexed page.

## 12. Required QA before handoff

- Compare the 1920px homepage against the complete PDF/Figma reference.
- Confirm the homepage remains 1920px wide, follows the fixed coordinates through Services and uses the documented content-driven flow below it.
- Check homepage, sitemap and WIP at 1920px, 1440px, 1280px, 1024px, 900px, 768px, 390px and 320px.
- Check Careers at the same widths with mocked populated, empty and error API responses; check individual roles with full optional content, required-only content, invalid IDs and removed-role responses.
- Confirm zero console errors, failed local assets and document-level horizontal overflow.
- Confirm every `data-lucide` placeholder becomes a Lucide SVG.
- Test service tabs and previous/next controls, carousel controls, dropdown, mobile menu and Escape.
- Load all six locales, verify locale codes and `html[lang]`, and confirm Hebrew uses RTL without mirroring logos or the footer wordmark.
- For every locale, confirm the desktop Services dropdown opens, localized service content is present before any service click, all service/CTA buttons remain visible and next/previous carousel movement follows the document direction.
- Open every planned sitemap link and confirm it reaches WIP with the correct `for` value; changing language must preserve that value.
- Test language selection once over HTTP and once by opening `index.html` directly; both paths must update copy, locale code, metadata and document direction without console errors.
- Check all 20 FAQ questions and answers in every locale and verify native disclosure controls by keyboard.
- Confirm heroes and major sections begin directly with meaningful headings and contain no decorative eyebrow or mini-title labels.
- Confirm the About opening statement stays balanced at desktop widths and stacks without overflow at 900px and below.
- Confirm no Google request or `_ga` cookie exists before consent, acceptance loads only `G-GVWS39DSNX`, withdrawal restores denied consent, and the footer control reopens settings.
- Check the Analytics consent panel in every language at desktop, 900px, 390px and 320px; confirm Hebrew follows RTL and both actions remain visible.
- Confirm every complete mobile menu contains exactly Services, Work, About, News and Careers, in that order.
- Check all three legal routes in all six languages, including translated metadata, contents links, related-document links, Analytics settings, table overflow and Hebrew RTL.
- Test regional browser-language detection, an unsupported primary preference followed by a supported secondary preference, URL priority, saved-choice priority, the English-only Careers override and Hebrew RTL.
- Confirm every partner logo is fully inside the viewport and every service category has its canonical item count: 7, 9, 4, 4, 5 and 4 respectively.
- Verify keyboard focus, heading order, alt text and reduced-motion behaviour.
- Update `CHANGELOG.md`, `CONTENT_NOTES.md` and these guidelines whenever the implementation contract changes.
