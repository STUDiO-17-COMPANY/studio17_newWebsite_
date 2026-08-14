# Changelog

## 2026-08-14 — Multilingual legal information pages

- Added clean `/privacy-policy`, `/cookie-policy` and `/terms` pages using the shared Studio 17 media hero, header, long-form reading layout and footer.
- Documented the website's current contact-form, hosting, security, analytics, language-preference and Google Workspace processing, including provider disclosures, retention, rights and consent controls.
- Added complete Portuguese (Portugal), Spanish, Greek, Russian and Hebrew variants with translated metadata and RTL support.
- Kept dedicated legal translations isolated from the generic string translator so switching from any initial locale back to English cannot leave mixed-language fragments; translated the contents-navigation labels for assistive technology.
- Added the live legal routes to the Company footer column, human sitemap, XML sitemap, direct-file routing and local development server without changing the five-item mobile menu.
- Linked the Contact privacy notice to the new policy and replaced its off-screen spam-trap positioning so Hebrew RTL no longer creates document-level horizontal overflow.
- Added legal-page regression coverage and the `LEGAL_PAGES.md` maintenance and legal-review guide.

## 2026-08-13 — Event Studio Cyprus partner

- Added Event Studio Cyprus as `partner-09` to both animated partner rows, with its supplied Instagram link, hover label and accessible name.
- Expanded the marquee grid from eight to nine columns so the new partner remains visible inside the fixed-height carousel.

## 2026-08-13 — Testimonial action spacing

- Replaced the flexible testimonial-link spacer with a consistent 13px gap so each “Learn more” action sits directly beneath its review on desktop and mobile.

## 2026-08-13 — Google footer profile

- Added the Studio 17 Google profile to both footer social groups across every page through the shared footer enhancement.
- Reused the supplied white Google brand mark from the existing footer sprite and retained the established hover and keyboard-focus behavior.
- Added localized accessibility labels for Portuguese, Spanish, Greek, Russian and Hebrew.

## 2026-08-13 — Client testimonials and Phós Optics

- Replaced the homepage testimonial placeholders with approved feedback from Rita Braz, Pantelis Petrou, Miguel Ângelo and Natalia Ioannou.
- Linked the three testimonials with supplied source or company URLs and retained Natalia's testimonial without an external link.
- Expanded the testimonial carousel height so the complete approved quotes remain readable without clipping.
- Added Phós Optics as `partner-08`, including its hover label and external website link in both animated partner rows.

## 2026-08-12 — Interactive partner carousel

- Added Selene Island using `Images/partner-07.png` and replaced the obsolete PHÓS placeholder in the homepage carousel.
- Added the supplied external URL and accessible partner name to partners 01–07.
- Added partner-name labels on hover and keyboard focus, plus a paused carousel state while a logo is being interacted with.
- Added visible keyboard focus styling and excluded the duplicated marquee sets from the tab order.

## 2026-08-12 — Automatic multilingual Articles and News

- Created the `contact@studio17.world` Drive article template, automatic-publishing guidance and isolated Article Media folder.
- Added validated Google Docs parsing for shared setup plus EN, PT-PT, ES, EL, RU and HE tabs; incomplete translations never generate public links.
- Added clean `/insights/<slug>` server-rendered pages, independent social-share images, restricted Drive image delivery, Article structured data, canonical/`hreflang` metadata and automatic sitemap entries.
- Replaced static homepage cards with the live newest-first article feed and added the multilingual `/news` archive with category filters and designed loading, empty and error states.
- Updated every existing News navigation link, the human sitemap, locale bundle, documentation and regression/browser coverage.

## 2026-08-12 — Editorial article prototype (superseded)

- Added a responsive, SEO-ready article detail prototype at `/insights/how-car-dealerships-can-increase-monthly-sales` and connected the first homepage insight card to it.
- Modelled the future Drive fields in the interface: category, dates, author, role, reading time, language availability, summary, table of contents, rich sections, images, statistics, quote, callout, CTA, sharing and related content.
- Kept the prototype out of search indexes until its editorial content and automated Drive workflow are approved.

## 2026-08-10 — Consent-first Google Analytics 4

- Corrected the Studio 17 GA4 web stream from the mistyped `G-6VWS39DSNX` to the confirmed `G-GVWS39DSNX` in the shared controller used by all eight public page sources.
- Implemented basic consent behavior: Google code is not downloaded and Analytics storage remains denied until the visitor explicitly accepts.
- Kept advertising storage, advertising user data, advertising personalization and Google signals disabled after Analytics consent.
- Added square, responsive consent controls and a permanent footer Analytics settings action in English, Portuguese (Portugal), Spanish, Greek, Russian and Hebrew.
- Restricted production measurement to `studio17.world` and `www.studio17.world` so local and preview traffic cannot pollute reports.
- Added translated language-change page views, withdrawal handling, `_ga` cookie cleanup, regression coverage and `ANALYTICS.md` maintenance guidance.
- Refined the visitor-facing consent panel to a white surface with a blue outline and plain-language purpose copy focused on traffic sources and website use rather than vendor terminology.

## 2026-08-10 — Page hierarchy and About layout refinement

- Removed decorative eyebrow and mini-title labels from About, Contact, FAQ, Careers, Sitemap and WIP so each section starts directly with its meaningful heading.
- Removed the decorative FAQ group ordinals while retaining functional sequence numbers, status labels, form labels and role metadata.
- Rebuilt the About opening content around a full-width highlighted heading followed by a balanced copy-and-principle grid that stacks cleanly on smaller screens.
- Restyled the dynamic Careers department as functional metadata rather than a decorative eyebrow.
- Added regression coverage and updated the design standard to prevent decorative mini-titles from returning.

## 2026-08-10 — Multilingual About page and official social links

- Added the clean `/about` page in English, Portuguese (Portugal), Spanish, Greek, Russian and Hebrew using the shared media hero and Studio 17 design system.
- Explained Studio 17 through its business-first positioning, connected capabilities, four-step approach and European/international perspective without inventing people, clients or results.
- Added a translated external CTA to the same Greek Studio 17 presentation on Google Drive in every locale.
- Replaced every About WIP destination with `/about` and added the page to clean routing, direct-file localization, human/XML sitemaps, metadata and regression tests.
- Activated the confirmed Instagram, Facebook and LinkedIn links across every footer and removed the visible WhatsApp, Google, X and Threads marks.
- Reworked every main About section title to reuse the homepage-sized `design-heading` component and its blue inline emphasis across all six languages.

## 2026-08-10 — Multilingual FAQ and mobile navigation cleanup

- Restricted every complete mobile menu to the approved Services, Work, About, News and Careers links; removed the FAQ and sales CTA from that menu.
- Added the clean `/faq` page with 20 decision- and search-intent questions and complete English, Portuguese (Portugal), Spanish, Greek, Russian and Hebrew copy.
- Built accessible native `details`/`summary` disclosures with Lucide chevrons, responsive layouts and Hebrew RTL support.
- Added canonical, social and reciprocal `hreflang` metadata, plus FAQ entries in the human and XML sitemaps.
- Deliberately omitted ineligible `FAQPage` rich-result markup under Google's current government/health authority restrictions.
- Added FAQ locale, route, navigation and sitemap regression coverage and updated the maintenance documentation.

## 2026-08-10 — Regional browser-language detection

- Expanded first-visit language detection to use the browser's ordered language-preference list instead of only one locale value.
- Added base-language normalization for regional codes including `en-GB`, `pt-BR`, `es-MX`, `el-GR`, `ru-RU`, `he-IL` and legacy Hebrew `iw-IL`.
- Preserved the established priority of forced page language, valid URL language, saved visitor choice, browser preferences and English fallback.
- Added automated regression coverage for regional codes, secondary supported preferences, URL/saved priority, Careers English enforcement and Hebrew RTL.

## 2026-08-05 — Shared Studio 17 media hero

- Rebuilt Sitemap, WIP, Careers, individual role and Contact heroes on one reusable `page-hero` system derived from the homepage `hero-media` treatment.
- Standardized the internal-page English desktop hero to 296px with the homepage shell, 55.7% / 44.3% split, edge fades, media overlay and restrained hover scale.
- Replaced the unrelated abstract hero artwork and oversized page-specific hero heights with existing Studio 17 photography.
- Added shared 360px tablet and 560px mobile hero behavior while allowing translated and dynamic content to grow without clipping.
- Tightened the WIP hero content so it fits the shared model without hiding its destination or navigation actions.
- Added `TASKS.md` as the living development backlog and documented the postponed contact-form production checklist.

All meaningful design, code and content changes to the Studio 17 website are recorded here.

## 2026-08-03 — Multilingual Contact page and email workflow

- Added the extensionless `/contact` page in English, Portuguese (Portugal), Spanish, Greek, Russian and Hebrew with translation-safe responsive and RTL layouts.
- Added an accessible project enquiry form with required-field feedback, contact consent, direct-email fallback and translated sending, success, rate-limit and unavailable states.
- Added a server-side Vercel Function that validates input, restricts origins, rate-limits repeated requests, absorbs honeypot spam and sends HTML/plain-text enquiries to `contact@studio17.world` through Resend.
- Added reply-to handling and Resend idempotency keys so Studio 17 can answer the visitor directly without duplicate sends on retries.
- Replaced Contact, Talk to sales and Start growing WIP links throughout the website with `/contact`.
- Added Contact to the human and XML sitemaps, canonical/hreflang metadata, the clean-route local server and automated API/locale/URL checks.
- Added `CONTACT_FORM.md`, environment-variable guidance and maintenance rules for secure delivery.

## 2026-08-02 — Extensionless public URL structure

- Enabled Vercel clean URLs so source files such as `sitemap.html` and `wip.html` are publicly served as `/sitemap` and `/wip`.
- Replaced every internal `.html` link across the homepage, sitemap, WIP, Careers and role template with a root-relative clean route.
- Preserved permanent redirects for previously shared `.html` addresses and the legacy role-detail URL.
- Updated multilingual link propagation to work with extensionless paths while retaining direct-file local preview support.
- Added a dependency-free clean-route development server and automated checks that prevent `.html` links from returning.
- Updated canonical metadata, the XML sitemap, documentation and browser test routes to the new public structure.

## 2026-08-02 — Clean Careers URLs and technical SEO foundation

- Replaced public Google Drive ID query strings with stable vacancy URLs in the form `/careers/<role-name>` while preserving a permanent redirect for previously shared links.
- Added server-generated vacancy titles, descriptions, canonical URLs, social metadata and breadcrumb markup before browser JavaScript runs, plus standards-compliant `JobPosting` data when remote applicant countries are provided.
- Added correct `404` and `noindex` behavior for removed or invalid vacancies so closed roles can leave search results cleanly.
- Added a live XML sitemap at `/sitemap.xml`, automatically populated from the current Google Drive open-role folder, and a root `robots.txt` that advertises it.
- Standardized public Careers URLs on `/careers`, permanently redirected the apex domain to `https://www.studio17.world`, and moved internal Careers links to the clean route.
- Added homepage Organization/WebSite structured data, canonical and multilingual alternate links, Open Graph/Twitter metadata, and translation-aware canonical metadata.
- Marked WIP destinations `noindex,follow` so unfinished pages do not compete in search while their links remain crawlable.
- Added automated SEO/routing tests and `SEO.md` maintenance guidance.

## 2026-08-02 — Automatic Google Drive Careers workflow

- Added the English-only `careers.html` page with responsive hero, open-role cards, loading/empty/error states, working-principle cards, candidate-process guidance and the shared Studio 17 footer.
- Added the reusable `career-role.html` detail page with dynamic role sections, accessible role facts, a verified application action and explicit invalid/removed/API-unavailable states.
- Added secure Vercel Functions that use short-lived Vercel OIDC credentials through Google Workload Identity Federation, impersonate a dedicated read-only service account, list native Docs directly inside the approved open-role folder, validate the template contract and withhold incomplete documents.
- Added folder-membership verification for every role-detail request, HTTPS-only application links, bounded Google request timeouts, sanitized errors and short CDN caching so role additions/removals update automatically.
- Converted every header, mobile, sitemap and footer Careers destination from WIP to the real English Careers page.
- Added a forced-English i18n route that preserves the visitor's saved site language and prevents translated pages from breaking the English-only Careers workflow.
- Populated the Google Doc `HR - Open Role Template` with the canonical fields, instructions, real headings and list containers required by the parser.
- Created `guidance for role position automatic` in `3. HR` with the complete HR publishing workflow, validation checklist, troubleshooting and one-time developer setup.
- Added `CAREERS_AUTOMATION.md`, `.env.example` and Vercel Function configuration, and updated the design/content documentation for the new page family.

## 2026-08-02 — Multilingual layout and interaction hardening

- Replaced English-only fixed-height assumptions with content-driven sizing for translated heroes, service panels, AI cards, news, testimonials, CTAs, sitemap heroes and footer rows.
- Made all six service-category controls and every service item visible as wrapped grids on small screens; longer labels and CTA text now grow instead of being clipped.
- Rebuilt the mobile service feature as a natural vertical flow so translated descriptions, result copy, digital/physical links and case-study action cannot overlap or disappear.
- Fixed the desktop Services dropdown by giving its panel an explicit hidden/open state shared by mouse, outside-click and Escape behavior.
- Fixed initial localized service content, eliminating the English-content flash that remained until a service control was selected.
- Mirrored the service composition correctly in Hebrew and corrected carousel movement for RTL scroll direction.
- Made AI labels, footer links, social artwork and the European-brand artwork translation-safe and responsive at the 320px minimum width.
- Raised the responsive navigation threshold to 900px and made its full-screen menu vertically scrollable without hiding the sales CTA.
- Verified homepage, sitemap and WIP across six languages and eight viewport profiles, plus direct click-through language cycling on desktop and small mobile.

## 2026-08-02 — WIP navigation population and direct-file language fix

- Routed header links, service dropdowns, mobile navigation, hero actions, service links, AI actions, article cards, testimonial links, closing CTAs, tags, sitemap entries and footer navigation to stable WIP destinations.
- Kept Homepage, Sitemap, WIP, structural anchors and real email addresses as direct working destinations.
- Added localized WIP labels for 43 destination keys, including service and industry labels from the active locale contract.
- Fixed language switching when HTML files are opened directly from the folder by adding a generated local locale bundle before `i18n.js`.
- Added automatic language propagation to internal HTML links while preserving WIP `for` parameters and page fragments.
- Added a reproducible locale-bundle generator and documented the required regeneration workflow.

## 2026-08-02 — Multilingual WIP page and Spanish locale

- Added `wip.html` as the shared destination for every page that has not been built yet.
- Added stable WIP destination keys for articles, case studies, privacy, cookies and terms, with localized destination labels.
- Converted all explicitly planned sitemap items into real WIP links and added the WIP route to the live site map.
- Added Spanish (`es`) to the language selector, browser-locale detection, page metadata, complete homepage/sitemap copy and all 33 service labels and descriptions.
- Extended homepage, sitemap and WIP to six-language coverage: English, Portuguese from Portugal, Spanish, Greek, Russian and Hebrew.
- Added responsive WIP layout, Lucide status icons, accessible navigation and Hebrew RTL support through the shared design system.

## 2026-08-02 — Seamless partner marquee repair

- Replaced the barely visible 36px ping-pong drift with a true continuous horizontal marquee.
- Added one `aria-hidden` loop clone per row and matched the animation distance to the exact sequence width plus gap, removing the loop jump.
- Set both rows to the same constant linear speed in opposite directions and removed pointer-hover interruption.
- Kept every image contained within its logo cell and retained the global reduced-motion fallback.

## 2026-08-02 — Footer interaction and partner motion correction

- Reduced the desktop footer from 813px to 729px by removing the oversized reserved gap above the wordmark while preserving its approved 395px Plus Jakarta Sans treatment.
- Removed the downward wordmark offset and compacted tablet/mobile spacing.
- Made the decorative wordmark pointer-transparent and raised the legal row so the Sitemap link remains clickable across its complete hit area.
- Restored continuous opposing movement to both partner rows without duplicating or cropping any logo.
- Added hover pause, responsive travel distances and reduced-motion handling for the partner animation.

## 2026-08-02 — Footer, partners, services and localization foundation

- Rebuilt the large footer wordmark with locally hosted Plus Jakarta Sans ExtraBold, using the approved `-5%` tracking for “Studio” and `-12%` for “17”.
- Made the desktop wordmark fluid below the 1920px reference so “17” remains fully visible at intermediate widths and in RTL layouts.
- Replaced cropped, duplicated partner marquees with two contained logo grids; all 14 displayed marks now remain complete at desktop and mobile widths.
- Added the complete canonical service catalogue across Website, By Industry, Content Creation, Social Media, Advertisement and Digital Systems.
- Rebuilt service rendering so category counts, selected items, localized descriptions and previous/next controls share one data contract.
- Added five-locale architecture for English, Portuguese from Portugal, Greek, Russian and Hebrew, including persistent switching, shareable URL parameters and RTL document direction.
- Added a shared accessible desktop/mobile language selector to the homepage and sitemap.
- Added local Plus Jakarta Sans font files and the official OFL licence; the website continues to have no runtime font or icon CDN dependency.
- Verified the homepage and sitemap in all five languages at desktop and mobile sizes with no console errors, failed assets, duplicate IDs, unloaded images or document-level horizontal overflow.

## 2026-08-02 — Lucide, shared page structure and final base correction

- Replaced Unicode arrows, CSS triangles and hand-drawn interface glyphs with the locally pinned Lucide 1.24.0 package.
- Kept official social brand artwork separate because Lucide does not include brand logos.
- Restored the approved in-flow 80px header so full-page rendering begins at the correct position and the header cannot overlap the closing CTA.
- Preserved the complete 1920 × 4378 homepage geometry, including the exact Services and footer coordinates.
- Added working Lucide previous/next controls to the service browser and retained keyboard support for all tab groups.
- Improved the mobile automotive crop so the case-study image remains legible instead of showing only the sky.
- Replaced attributed lorem-ipsum testimonials with honest, neutral placeholders pending approved client quotations.
- Rebuilt the sitemap around the homepage system: 296px hero, highlighted section heading, square dark cards, 32px rhythm, shared closing CTA and exact shared footer.
- Added `DESIGN_GUIDELINES.md` as the canonical specification for page anatomy, icons, content, responsive behaviour and QA.
- Verified homepage and sitemap at desktop and mobile sizes with no console errors, failed assets or document-level horizontal overflow.

## 2026-08-02 — Figma fidelity correction and sitemap

- Re-audited every homepage section against the complete 1920 × 4378 Figma/PDF reference.
- Rebuilt the desktop layout with the exact section coordinates, heights, 1440px shell and 32px transitions from the approved frame.
- Corrected the Services panel to 1440 × 538px, with 212 × 56px selectors and the designed image-overlay composition.
- Corrected the AI section to three 464 × 757px cards and matched its intended hands-focused image crops.
- Recreated the 813px footer with the reference columns, European-brand row, social marks, full-width wordmark and legal row.
- Aligned the hero, partner rows, news, testimonials and final CTA with their reference proportions and copy.
- Added locally hosted Inter files so typography does not depend on an external font request.
- Added `sitemap.html` with live links, planned-page states and the shared Studio 17 header/footer.
- Added/retained hover, carousel, tab, menu and reveal interactions with reduced-motion support.
- Verified the homepage at exactly 1920 × 4378px and checked desktop/mobile rendering without console errors or horizontal overflow.

## 2026-08-02 — Homepage rebuild

- Rebuilt the previous homepage from the approved Figma frame and PDF reference.
- Kept the implementation in semantic HTML, CSS and vanilla JavaScript.
- Added a sticky responsive header, services dropdown and full-screen mobile menu.
- Recreated the hero, partner marquees, interactive services browser, AI cards, news carousel, testimonial carousel, final CTA and footer.
- Added hover, focus, reveal, marquee and image motion with reduced-motion support.
- Optimised supplied design imagery to local WebP assets.
- Reused the supplied favicon and black/white Studio 17 logos.
- Added responsive layouts for desktop, tablet and mobile.
- Added keyboard support for tabs, carousels and menu dismissal.
- Documented unverified case-study metrics and demo testimonials as design-stage content.
- Added project, design-system and content-maintenance documentation.
