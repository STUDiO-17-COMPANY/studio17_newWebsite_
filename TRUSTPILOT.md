# Studio 17 Trustpilot integration

## Approved public destination

- Official profile: `https://www.trustpilot.com/review/studio17.world`
- All visible Trustpilot links must use this URL, open in a new tab and include `rel="noopener noreferrer"`.
- Do not link Trustpilot navigation to WIP after the public profile is available.

## Current implementation

The public-profile integration is active in every shared footer and the human sitemap. It intentionally uses the clean profile URL without `_gl`, `_ga`, `_gcl_au` or other visitor-specific campaign parameters.

Do not scrape Trustpilot pages, copy changing scores into the source, or present manually copied aggregate ratings as live data. The public profile is the source of truth.

## Free-plan rule

Under Trustpilot's September 2026 Legal Brand Guidelines, the free plan may use:

- A plain-text link such as **See our reviews on Trustpilot** pointing to the official profile.
- The official Review Collector supplied inside the Studio 17 Business Account to invite genuine customers to write a review.

The free plan must not display the Trustpilot logo, star graphics, TrustScore, Star Label, review count or a widget that showcases reviews or ratings. Do not recreate those assets in Studio 17 styling or use a third-party widget to bypass the plan.

## Recommended implementation

1. Keep the existing plain-text profile links across the public website.
2. Keep the approved plain-text **See all our reviews on Trustpilot** action directly beneath the homepage Testimonials section.
3. Use the official Review Collector only in a post-project or client-only flow where the visitor is genuinely eligible to review Studio 17. Do not place a generic review invitation prominently in acquisition navigation.
4. Copy the Review Collector code only from the approved `contact@studio17.world` Trustpilot Business Account. No API key, password or private account credential belongs in the repository.
5. If Studio 17 later upgrades, reassess the TrustBox assets actually included in that paid plan before adding any logo, rating or review display.

## Implementation contract

- Keep the existing Studio 17 testimonial section and its approved quotations; the public Trustpilot profile is an independent verification destination, not a replacement for project-specific testimonials.
- Keep the profile action as plain text while Studio 17 remains on the free plan. Do not add the Trustpilot logo, stars, score or copied review cards.
- Do not make the page depend on Trustpilot for navigation, layout or content visibility.
- If the Review Collector is deployed, review its storage and network behavior before launch. If it is non-essential or sets tracking identifiers, load it only after the visitor's relevant consent and retain a normal no-script route.
- Update the Privacy Policy and Cookie Policy if the deployed widget changes the website's disclosed processors, cookies, storage or data transfers.
- Do not add self-serving aggregate-rating structured data to Studio 17 Organization or LocalBusiness markup merely to pursue review stars in Google Search.

## QA checklist

- Verify the plain-text profile links on English, Portuguese (Portugal), Spanish, Greek, Russian and Hebrew pages.
- Verify Hebrew RTL, keyboard focus, screen-reader naming and visible focus.
- Verify 1920px, 1440px, tablet, 390px and 320px layouts with no horizontal overflow.
- If the Review Collector is added, verify the page remains usable when Trustpilot is blocked or times out.
- If the Review Collector is added, verify consent refusal does not load a script classified as optional tracking.
- Verify the official profile link resolves to `studio17.world` reviews.
- Re-run routing, analytics-consent, testimonial and responsive browser tests before deployment.
