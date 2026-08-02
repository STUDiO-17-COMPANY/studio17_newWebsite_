# Changelog

All meaningful design, code and content changes to the Studio 17 website are recorded here.

## 2026-08-02 — Automatic Google Drive Careers workflow

- Added the English-only `careers.html` page with responsive hero, open-role cards, loading/empty/error states, working-principle cards, candidate-process guidance and the shared Studio 17 footer.
- Added the reusable `career-role.html` detail page with dynamic role sections, accessible role facts, a verified application action and explicit invalid/removed/API-unavailable states.
- Added secure Vercel Functions that authenticate to Google with a server-side service account, list native Docs directly inside the approved open-role folder, validate the template contract and withhold incomplete documents.
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
