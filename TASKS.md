# Studio 17 website tasks

This file is the shared development task list for `studio17_newWebsite_`. Keep it updated whenever work is added, completed, blocked or deliberately postponed. Do not store passwords, API keys or private account data here.

## Status key

- `[ ]` Planned
- `[-]` In progress or partially complete
- `[x]` Completed and verified
- `BLOCKED:` Waiting for access, approval or external configuration

## Current priorities

- [x] Standardize Sitemap, WIP, Careers, career-role and Contact heroes on the homepage media-hero model.
- [x] Make first-visit language detection regional-code aware and use the browser's ordered language preferences.
- [x] Restrict every complete mobile menu to Services, Work, About, News and Careers.
- [x] Publish the multilingual FAQ content and clean `/faq` route.
- [x] Publish the multilingual About page, Greek presentation link and confirmed social profiles.
- [x] Rebuild About with the approved hero, origin summary, European presence, Trustpilot proof, founders carousel, culture and Careers action.
- [x] Publish clean `/our-story` and `/team` routes, add them to both sitemaps and cover them with regression tests.
- [ ] Obtain approved founder portraits, longer biographies and optional personal facts before expanding `/team`; Pedro Leonardo's Instagram is intentionally omitted at present.
- [ ] Complete native-language editorial review of the long-form Our Story narrative for Spanish, Greek, Russian and Hebrew before replacing the approved English fallback.
- [x] Remove decorative mini-titles across public pages and rebalance the About opening statement layout.
- [x] Add consent-first Google Analytics 4 across all public pages in all six languages.
- [x] Verify the `studio17.world` Google Search Console Domain property under `contact@studio17.world`, submit the XML sitemap and associate the Studio 17 GA4 data stream.
- [x] Approve the article-detail layout and content-field model.
- [x] Create the Drive template, guidance, dedicated media folder, parser, multilingual article pages, dynamic homepage feed and `/news` archive described in `ARTICLES.md`.
- [x] Grant the production Google service account Reader access to the Article folders, deploy and verify a real multilingual published Doc with separate social-sharing media end to end.
- [x] Complete and publish the contact-form email workflow.
- [-] Review and publish the staged Vercel country-access rule before changing it from Log to Deny.
- [x] Create multilingual Privacy Policy, Cookie Policy and Terms pages based on the website's implemented processing.
- [x] Publish the multilingual, price-free Services catalogue and the five-package Website Development page with proof projects, clean routes and sales CTAs.
- [ ] Obtain qualified Cyprus/EU legal review of the three informative legal drafts before treating them as final legal advice.

## Vercel firewall — country restriction

- [-] Publish the staged `Restrict selected countries` rule in Log mode for India, Pakistan, Iran, Iraq, Bangladesh, Myanmar, Thailand and North Korea.
- [ ] Review matched traffic and confirm the rule does not affect legitimate visitors, SEO crawlers or internal tools.
- [ ] Change the rule to Deny in Preview, publish it and verify the expected 403 response from a matching test location.
- [ ] Change the validated rule to Deny for Production and have the user publish the final firewall change.

## Contact form — production delivery

The multilingual `/contact` page and its server-side `/api/contact` endpoint are live. Production email delivery was verified on 2026-08-20.

- [x] Use the explicitly approved Vercel owner account only for Vercel administration; use `contact@studio17.world` for Resend and contact delivery.
- [x] Connect Resend to the correct Studio 17 Vercel project with a domain-restricted, sending-only key.
- [x] Verify `studio17.world` as the sending domain without changing Google Workspace inbound-mail routing.
- [x] Configure the sensitive API key for Production and Preview, and the non-secret sender/recipient values for Production, Preview and Development.
- [x] Confirm that the sender and recipient are approved Studio 17 addresses at `contact@studio17.world`.
- [x] Deploy the contact page and serverless endpoint to `www.studio17.world`.
- [x] Submit one production test enquiry in each language: English, Portuguese (Portugal), Spanish, Greek, Russian and Hebrew; all six received HTTP 200 on 2026-09-03.
- [-] Confirm inbox delivery from all six public languages. Production accepted every locale; English inbox delivery was previously verified and `reply_to` is covered by the API regression test.
- [x] Test required-field errors, invalid email, short messages, consent, rate limiting, provider/network failure and duplicate-submit prevention.
- [x] Test keyboard use, accessible labels and error states, desktop/mobile layouts down to 320px, translated text wrapping and Hebrew RTL behavior.
- [x] Add the live Privacy Policy route to the shared footer and contact consent language.
- [x] Review provider logs without exposing visitor messages or personal data in application logs.
- [x] Update `CONTACT_FORM.md`, `README.md`, `CHANGELOG.md` and this task list after production verification.

## Articles — production handoff

- [x] Share the article root folder with `studio17-careers-website@studio17-newsletter.iam.gserviceaccount.com` as Reader from `contact@studio17.world`.
- [x] Deploy the article Functions, clean route and News archive.
- [x] Copy the master template, upload separate cover/social images, and publish the Terrassi Villa article.
- [x] Verify the homepage card, `/news`, article page, independent social preview image and `/sitemap.xml` in production.
- [x] Publish and verify Portuguese (Portugal) and Greek translations while keeping incomplete language tabs hidden.

Production was rechecked on 2026-09-05: the Terrassi Villa article returned HTTP 200, exposed English, Portuguese (Portugal) and Greek alternates, and used a dedicated `/api/article-image` Open Graph image.

## Trustpilot integration

- [x] Replace every Trustpilot WIP destination with the official Studio 17 Trustpilot profile.
- [x] Confirm the free-plan brand restriction: use plain-text profile links and do not publish the logo, stars, TrustScore or review-showcase widgets.
- [x] Add the approved plain-text Trustpilot profile action beneath the homepage testimonials in all six languages.
- [ ] Optionally add Trustpilot's official Review Collector to a post-project or client-only review-request flow after its placement and generated code are approved.

## Page-development rule

When a task creates or publishes a page:

- [ ] Use a clean URL without `.html`.
- [ ] Reuse the shared header, `page-hero`, closing CTA where relevant and footer.
- [ ] Add all six public languages unless the page is an approved English-only exception.
- [ ] Use Lucide for interface icons.
- [ ] Update the human sitemap, XML sitemap, metadata and documentation.
- [ ] Verify desktop, mobile, keyboard, RTL, reduced motion and zero horizontal overflow.
- [ ] Replace the related WIP link only after the final page works.
