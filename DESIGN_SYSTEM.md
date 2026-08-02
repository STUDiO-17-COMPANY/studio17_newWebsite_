# Studio 17 design system

This file is the compact token and geometry reference. `DESIGN_GUIDELINES.md` is the canonical implementation standard for future pages.

## Foundations

| Token | Value | Use |
| --- | --- | --- |
| Paper | `#F8FAFC` | Page background |
| Ink | `#0F172A` | Primary copy, dark panels and footer |
| Blue | `#0456FE` | Brand highlights, selected controls and CTAs |
| White | `#FFFFFF` | Cards and copy on dark backgrounds |
| Muted | `#5F6B7C` | Secondary copy |
| Line | `#DBE1EA` | Dividers and card borders |
| Content width | `1440px` | Desktop shell at the 1920px reference width |

The primary typeface is the locally hosted Inter family in `Fonts/`, with Arial as the system fallback. Headings use tight tracking and a dense line-height; navigation and metadata use uppercase labels with wider tracking. The footer display wordmark uses Plus Jakarta Sans ExtraBold (`800`): `Studio` at `-5%` letter spacing and `17` at `-12%`.

## Composition

- Desktop content is centred in a 1440px shell, producing 240px margins at the 1920px reference width.
- The homepage desktop frame is 1920 × 4294px after the approved compact-footer correction. Sections are separated by 32px and use the reference geometry below.
- Section headings use a blue inline highlight behind the lead phrase.
- Content-heavy cards and panels use dark navy against the off-white page.
- Edges remain square to match the approved design; avoid adding arbitrary rounded cards.

| Homepage block | Top | Height |
| --- | ---: | ---: |
| Header | 0px | 80px |
| Hero | 112px | 296px |
| Trusted by | 440px | 341px |
| Services | 813px | 633px |
| AI | 1478px | 891px |
| News | 2401px | 453px |
| Testimonials | 2886px | 317px |
| Final CTA | 3235px | 298px |
| Footer | 3565px | 729px |

The Services panel is 1440 × 538px. Its six desktop selectors are 212 × 56px with 24px gaps. The three AI cards are 464 × 757px with 24px gaps.

## Responsive behaviour

- At 1280px and above: use full navigation, the six-column service selector and three-column AI grid. Exact fixed heights belong only to the 1920px English reference; translated content grows vertically.
- 901–1279px: section heights become content-driven, service controls wrap and AI cards become split horizontal cards.
- 900px and below: navigation becomes a scroll-safe full-screen menu, content stacks and carousels remain touch-friendly.
- 600px and below: service category and item controls become fully visible two-column grids.
- 500px and below: footer and CTA simplify to a single-column layout without hiding copy.

## Component rules

- Primary buttons: solid blue, uppercase label, north-east arrow.
- Text links: compact uppercase label with a blue square arrow.
- Service selector: only one service and one industry may be active at a time.
- Cards: use borders, contrast and spacing rather than decorative shadows; shadows appear only on interaction.
- Horizontal collections: use scroll snapping, visible arrow controls and native touch scrolling.
- Footer: dark field, large grey Plus Jakarta Sans wordmark and compact legal row. It is 395px at the 1920px reference frame, scales before it can be clipped and never intercepts pointer input.
- Partners: two continuous 24-second linear rows moving in opposite directions. Each has one accessible logo sequence plus one `aria-hidden` seamless-loop clone; artwork remains contained inside every cell.
- Languages: `en`, `pt-PT`, `es`, `el`, `ru` and `he` share one structural template; Hebrew switches complete page flow to RTL while logos and the Latin wordmark stay unmirrored.
- Translation safety: text-bearing controls use natural height and wrapping; localized sections may grow beyond English reference heights, and initial service copy always comes from the active locale.
- Sitemap: every existing page is linked; planned destinations remain labelled and open the shared WIP page until their final files exist.
- WIP: one reusable route accepts a stable `?for=` destination, keeps the selected language and is replaced link-by-link as final pages launch.
- Navigation contract: only Homepage, Sitemap, WIP, structural accessibility anchors and real email addresses bypass WIP before their final destination page exists.
- Locale loading: JSON files remain canonical; the generated `locales/locales.js` bundle provides identical behavior over HTTP and direct `file://` access.
- Internal pages: reuse the 80px header, 32px section gaps, 296px hero, blue lead-phrase headings, closing CTA and shared footer.

## Icons

- Use the locally pinned Lucide 1.24.0 package for every interface pictogram.
- Default Lucide stroke width is 2 and every icon receives an explicit CSS size.
- Use Lucide arrows, chevrons, locale, menu, close, mail, user and quote glyphs instead of Unicode characters or CSS-drawn icons.
- Keep supplied official artwork for Studio 17, partner and social brand marks; Lucide intentionally does not provide brand logos.

## Motion

- Hover transitions use the `--ease` curve: `cubic-bezier(.22, 1, .36, 1)`.
- Images zoom no more than roughly 5%.
- Cards lift between 3px and 12px depending on size.
- Section reveals run once when content enters the viewport.
- Partner rows move continuously in opposite directions without hover interruption and stop through `prefers-reduced-motion`.
- All motion is disabled or reduced through `prefers-reduced-motion: reduce`.

## Accessibility

- One page-level `h1`; section headings follow a logical hierarchy.
- A skip link is available for keyboard users.
- Focus indicators remain visible.
- Interactive tabs support arrow, Home and End keys.
- Mobile navigation closes with Escape.
- Informative imagery has alt text; decorative repeated logos do not.
