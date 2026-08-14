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
- [x] Remove decorative mini-titles across public pages and rebalance the About opening statement layout.
- [x] Add consent-first Google Analytics 4 across all public pages in all six languages.
- [x] Approve the article-detail layout and content-field model.
- [x] Create the Drive template, guidance, dedicated media folder, parser, multilingual article pages, dynamic homepage feed and `/news` archive described in `ARTICLES.md`.
- [-] Grant the production Google service account Reader access to the Article folders, deploy and verify one real published Doc end to end.
- [ ] Complete and publish the contact-form email workflow.
- [x] Create multilingual Privacy Policy, Cookie Policy and Terms pages based on the website's implemented processing.
- [ ] Obtain qualified Cyprus/EU legal review of the three informative legal drafts before treating them as final legal advice.

## Contact form — postponed

The multilingual `/contact` page and its server-side `/api/contact` endpoint exist, but production delivery is not complete. Resume this checklist when the contact workflow becomes the active task.

- [ ] Confirm that the Vercel project is accessed with `contact@studio17.world` only.
- [ ] Connect Resend to the correct Studio 17 Vercel project.
- [ ] Verify `studio17.world` as a sending domain and complete the required DNS records.
- [ ] Configure `RESEND_API_KEY`, `CONTACT_FROM_EMAIL` and `CONTACT_TO_EMAIL` for Production, Preview and Development as appropriate.
- [ ] Confirm that the sender and recipient are both approved Studio 17 addresses.
- [ ] Deploy the contact page and serverless endpoint.
- [ ] Submit one test enquiry in each language: English, Portuguese (Portugal), Spanish, Greek, Russian and Hebrew.
- [ ] Confirm that every message reaches `contact@studio17.world` and that Reply answers the visitor's email address.
- [ ] Test required-field errors, invalid email, consent, rate limiting, provider failure and duplicate-submit prevention.
- [ ] Test keyboard use, screen-reader labels, mobile layouts, translated text wrapping and Hebrew RTL behavior.
- [x] Add the live Privacy Policy route to the shared footer and contact consent language.
- [ ] Review provider logs without exposing visitor messages or personal data in application logs.
- [ ] Update `CONTACT_FORM.md`, `README.md`, `CHANGELOG.md` and this task list after production verification.

BLOCKED: The Vercel/Resend account connection requires explicit authorization before Studio 17 credentials or hosted settings are changed.

## Articles — production handoff

- [ ] Share the article root folder with `studio17-careers-website@studio17-newsletter.iam.gserviceaccount.com` as Reader from `contact@studio17.world`.
- [ ] Deploy the article Functions, clean route and News archive.
- [ ] Copy the master template, upload separate cover/social images, and publish one English test article.
- [ ] Verify the homepage card, `/news`, article page, social preview image and `/sitemap.xml` in production.
- [ ] Add one optional translation and verify that incomplete language tabs remain hidden.

BLOCKED: The connected Drive editor cannot change folder permissions and the available browser session is not signed in. Permission changes also require confirmation at the final action.

## Page-development rule

When a task creates or publishes a page:

- [ ] Use a clean URL without `.html`.
- [ ] Reuse the shared header, `page-hero`, closing CTA where relevant and footer.
- [ ] Add all six public languages unless the page is an approved English-only exception.
- [ ] Use Lucide for interface icons.
- [ ] Update the human sitemap, XML sitemap, metadata and documentation.
- [ ] Verify desktop, mobile, keyboard, RTL, reduced motion and zero horizontal overflow.
- [ ] Replace the related WIP link only after the final page works.
