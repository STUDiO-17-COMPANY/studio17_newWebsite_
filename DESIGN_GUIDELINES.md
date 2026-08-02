# Studio 17 website design guidelines

Status: canonical implementation standard  
Last reviewed: 2026-08-02  
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
3. A page hero using the 1440px content alignment and the homepage's 55.7% / 44.3% split when two columns are required.
4. Content sections separated by 32px at desktop.
5. The shared 298px closing CTA when the page has a commercial journey.
6. A 32px gap.
7. The shared compact footer, including the large Studio 17 wordmark and an unobstructed legal row.

The header is part of the document flow. Do not make it sticky: the approved homepage shows it at the top, and a fixed header can overlap long-page content and full-page captures.

## 4. Homepage geometry

The supplied 1920px English desktop homepage was a 4378px reference composition. The approved compact-footer correction keeps every section coordinate through `y3565` and reduces the English reference height to 4294px. Translated pages may grow vertically when their copy needs more space; never crop translated content to preserve the English page height.

| Block | Top | Height |
| --- | ---: | ---: |
| Header | 0px | 80px |
| Hero | 112px | 296px |
| Trusted by | 440px | 341px |
| Services | 813px | 633px |
| AI | 1478px | 891px |
| News | 2401px | 453px |
| Testimonials | 2886px | 317px |
| Closing CTA | 3235px | 298px |
| Footer | 3565px | 729px |

The Services panel is 1440 × 538px. Its six desktop selectors are 212 × 56px with 24px gaps. The three AI cards are 464 × 757px with 24px gaps. Do not change these desktop dimensions without an approved design update.

## 5. Internal-page template

The sitemap establishes the template for non-homepage pages:

- Reuse the exact header and footer structure from `index.html`.
- Use a 296px desktop hero after the 32px top gap.
- Align hero columns to the homepage split and shell.
- Start the main content with the blue inline-highlight heading treatment.
- Use square dark cards, 24px grid gaps and clear link states.
- Reuse the homepage closing CTA when there is a meaningful contact action.
- At 900px and below, stack hero content and cards without document-level horizontal overflow.

Future pages may vary their content but not the shell, palette, heading treatment, icon language, CTA or footer contract.

### Work-in-progress page

- `/wip` is the single shared public destination for every page that has not been built yet; `wip.html` remains only its source filename.
- Use `/wip?for=<destination>` so the page can identify and translate the requested destination. Stable keys cover navigation, services, industries, content, company, sales and legal destinations.
- The WIP page reuses the shared header, footer, language selector, square geometry, blue highlight system and Lucide icon language.
- When a final page is published, replace its WIP link in `/sitemap` and update this documentation in the same change.
- Never create separate WIP HTML files per language; all localized variants use the shared page and locale JSON contract.
- Until a real page exists, its header link, CTA, card, sitemap entry and footer link must all use the same WIP key.

## 6. Components

### Header

- Black Studio 17 logo on paper.
- Uppercase navigation with the blue selected/action square.
- Desktop service dropdown supports mouse, keyboard and Escape.
- Mobile menu uses Lucide `menu` and `x`; it opens full-screen below the 68px mobile header.

### Headings

- Main section headings use a blue inline block behind the lead phrase.
- Preserve tight line-height and keep the highlighted phrase meaningful.
- Each page has exactly one `h1`; section levels must remain logical.

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

### Footer

- Dark 729px English reference field. Other locales may grow while preserving the same row order and visual treatment.
- Five-column information area, large grey wordmark and compact legal row.
- The large wordmark uses Plus Jakarta Sans ExtraBold (`800`). Keep “Studio” and “17” in separate spans: `Studio` uses `-5%` letter spacing and `17` uses `-12%` letter spacing.
- Keep a visible word gap between the two spans. At the 1920px reference width the wordmark is 395px; below that it scales fluidly so neither span is clipped.
- The information grid reserves 320px and the wordmark row 329px. Do not add top margin or transforms that recreate the former empty band.
- The display wordmark never receives pointer events. The legal row sits in the interactive foreground so Sitemap and legal links always remain clickable.
- Email uses Lucide `mail`.
- Social brand marks use the supplied official artwork because Lucide does not contain brand logos.
- Do not turn placeholder social marks into misleading links. Add separate links only after official profile URLs are supplied.

### Language selector

- Every shared header exposes English (`en`), Portuguese from Portugal (`pt-PT`), Spanish (`es`), Greek (`el`), Russian (`ru`) and Hebrew (`he`).
- The selected locale is reflected in `html[lang]`, persisted locally and shareable through the `?lang=` URL parameter.
- `locales/locales.js` is generated from the canonical JSON files and loads before `i18n.js`, allowing all six languages to work over both `file://` and HTTP.
- Internal HTML links automatically inherit the active `lang` parameter while retaining WIP `for` values and fragments.
- Hebrew sets the document to `dir="rtl"`; brand artwork, media and the Latin footer wordmark remain visually unmirrored.
- The selector must work with mouse, keyboard, Escape and outside-click dismissal on both desktop and mobile.

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

## 12. Required QA before handoff

- Compare the 1920px homepage against the complete PDF/Figma reference.
- Confirm the homepage remains 1920px wide and follows every coordinate in section 4; after the approved compact-footer correction its desktop height is 4294px.
- Check homepage, sitemap and WIP at 1920px, 1440px, 1280px, 1024px, 900px, 768px, 390px and 320px.
- Check Careers at the same widths with mocked populated, empty and error API responses; check individual roles with full optional content, required-only content, invalid IDs and removed-role responses.
- Confirm zero console errors, failed local assets and document-level horizontal overflow.
- Confirm every `data-lucide` placeholder becomes a Lucide SVG.
- Test service tabs and previous/next controls, carousel controls, dropdown, mobile menu and Escape.
- Load all six locales, verify locale codes and `html[lang]`, and confirm Hebrew uses RTL without mirroring logos or the footer wordmark.
- For every locale, confirm the desktop Services dropdown opens, localized service content is present before any service click, all service/CTA buttons remain visible and next/previous carousel movement follows the document direction.
- Open every planned sitemap link and confirm it reaches WIP with the correct `for` value; changing language must preserve that value.
- Test language selection once over HTTP and once by opening `index.html` directly; both paths must update copy, locale code, metadata and document direction without console errors.
- Confirm every partner logo is fully inside the viewport and every service category has its canonical item count: 7, 9, 4, 4, 5 and 4 respectively.
- Verify keyboard focus, heading order, alt text and reduced-motion behaviour.
- Update `CHANGELOG.md`, `CONTENT_NOTES.md` and these guidelines whenever the implementation contract changes.
