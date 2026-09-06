# Services pages

## Public routes

- `/services` is the price-free catalogue of Studio 17 capabilities.
- `/services/website-development` is the commercial Website Development page.
- `/services/free-website` is the multilingual application page for the selected-business Free Website offer.
- `/services/seo` is the international commercial SEO page.

All routes use clean URLs, canonical metadata, the shared header/footer, and the approved five-link mobile menu. The catalogue, Website Development and Free Website pages support all six site languages. The SEO page follows the current new-page scope: English, Greek and Russian only, with reciprocal `hreflang` links for those versions plus `x-default`.

## Website packages

The published starting packages are Conversion Landing Page (€450), Website – Starter (€950), Website – Growth (€1,500), Website – Business (€2,250), and Custom Website / Enterprise (€3,500). Website – Starter is the only package marked “Most bought”.

Every package includes an SEO foundation, GEO foundation, Technical SEO, responsive development, accessibility foundations, and launch QA. Published prices cover the standard scope described on the page; additions, third-party services, and out-of-scope requirements must be confirmed separately.

## Catalogue rules

The catalogue contains 43 services across Website Builds; Domain & Website Add-ons; SEO, Performance & Accessibility; AI & Automation; and Website Care. Internal service codes must never appear on the public site. Use native `details`/`summary` controls so the catalogue stays accessible without JavaScript.

The Legal Pages Setup entry means technical publication of approved text. It is not legal advice.

## Free Website offer

The Free Website page is a qualification and application journey, not an unconditional giveaway. It clearly states that Studio 17 waives its design and development fee only for selected suitable businesses and only for the agreed one-page scope. Applying does not guarantee selection. The page anchors the comparable scope to the existing €950 Website – Starter offer while clearly excluding third-party costs.

The published scope contains exactly 21 inclusions: brand-led responsive structure; hero, company, service, benefit and contact content; form, call, optional WhatsApp, Maps and social actions; essential footer information; basic SEO, Analytics, Search Console and performance setup; SSL/security, basic cookie implementation, one revision and the required “Website by Studio 17” footer credit. The free scope covers one page in one agreed language.

Domain, hosting, licences, paid tools, copywriting, photography, translations, extra pages, e-commerce, booking systems, integrations and ongoing maintenance are separate when required. The client remains responsible for accurate approved content and appropriate legal advice; basic consent implementation is not a compliance guarantee.

Every application CTA uses `/contact?service=free-website`, which is accepted by the server-side contact allowlist and labelled as a Free Website application. The page uses all six published languages and retains Hebrew RTL support.

The page order is fixed: shared hero; four-point credibility strip; three supplied showcase images; Who it is for; exact inclusions; €0 statement; real Studio 17 work carousel; five-step timeline; applicant handover; Free versus Paid comparison; value statement; two-column desktop FAQ; final image-led CTA. The real-work carousel currently contains Terrassi Villa and PHÓS Optics. The final CTA uses `Free Website CTA Imaghe.webp` as supplied and should retain a wide crop.

## SEO service page

The SEO page is an international, high-intent landing page. Its decision map connects each priority query to a useful page and measurable business action through three concrete lenses: demand, website experience and outcome. The delivery route then moves through research, roadmap, implementation and measurement. Its scope covers strategy and keyword research, Technical SEO, On-page SEO, Local SEO, Content SEO, International SEO, Google Business Profile and Maps, Analytics and Search Console, AI Search/GEO, and continuous SEO.

Use `SEO_heroimage.webp` as the page hero at its native 1744 × 296 ratio. The final CTA uses `CTA_SEO_MainIMAGE.webp` inside the same 520 × 260 visual window established for service CTAs; keep it cropped with `object-fit: cover` and never stretch the source.

The “Every priority query needs a purpose” panel uses `Every_priority_query_needs_a_purpose_image.webp` as a full-bleed crop with a dark readability gradient. Its capability link stays over the bottom-inline corner as a translucent, keyboard-accessible button; do not return this panel to a flat empty colour block.

The nine-item capability explorer is one connected container with “SEO strategy & keyword research” open by default so its behaviour is immediately clear. On desktop, pointer hover and keyboard focus expand the active capability while the remaining cards contract; on mobile, its Lucide-chevron disclosures open one at a time by tap. The unenhanced HTML must continue to show all nine complete cards.

Keep the page commercially useful without unsupported promises. Never guarantee rankings, invent client SEO results, ratings or review data, or imply location-specific expertise that has not been approved. Proof may link only to real published work, the official Trustpilot profile and approved Studio 17 insights. Visible FAQs remain semantic HTML; do not add `FAQPage` structured data while the site is not eligible for that Google rich result.

Every SEO enquiry CTA uses `/contact?service=seo`. The contact page must keep `seo` in the server-side service allowlist and preselect it only when the query value matches a valid option.

The SEO FAQ starts by answering what the service can include, then addresses timing, guarantees, ongoing work, website rebuilds, local/international SEO, GEO and measurement. Keep all eight answers synchronized across English, Greek and Russian.

## Proof projects

- 100 Pratos links to `https://www.100pratos.pt/`.
- PHÓS Optics links to `https://www.phosoptics.com/en`.
- Terrassi Villa is marked in development and links to `/insights/terrassivilla-accessible-tourism-in-the-azores`.

Project images must keep descriptive alternative text, explicit dimensions, lazy loading, and the approved destination.

The general Services page closing CTA uses `CTA_Question_Image.webp` instead of an icon. Display it in a responsive media window up to 520 × 260px, aligned with the CTA copy and using the approved close crop, intrinsic dimensions and localised alternative text. It must remain compact enough to preserve the shared CTA height.

The CTA keeps **Talk to sales** as the primary contact action and includes **See our work** as the secondary action. Until the portfolio page is published, the secondary action must use `/wip?for=portfolio` and preserve the active locale.

## Translation workflow

English source content lives in the HTML pages. The catalogue and Website Development translations live in all five `service-locales/<locale>.json` files. Free Website translations live in the page-specific browser module `service-locales/free-website.js` for Portuguese (Portugal), Spanish, Greek, Russian and Hebrew. SEO translations live only in `el.json` and `ru.json` until another language is explicitly approved. After editing the canonical JSON service locales, run `node service-locales/build-bundle.cjs` and commit the regenerated `service-locales/locales.js`; the page-specific Free Website module does not require that build step. Do not change or remove `data-service-key` values; they are the stable translation contract.

## Update checklist

When a package, price, service, or project changes:

1. Update the English source page.
2. Update every locale currently approved for that page.
3. Regenerate the service locale bundle.
4. Update structured data when an offer or price changes.
5. Update this document and `CHANGELOG.md`.
6. Run `node --test tests/services-pages.test.cjs` and check every supported language and responsive layout. Include Hebrew RTL checks only on pages where Hebrew is published.
