# Studio 17 contact form

The public page is `/contact`. It is available in English, Portuguese (Portugal), Spanish, Greek, Russian and Hebrew. The selected language is included in each enquiry email.

## Delivery flow

1. The browser validates required fields and sends JSON to `POST /api/contact`.
2. The Vercel Function validates and limits every value, checks the request origin, applies a lightweight per-IP limit and silently absorbs honeypot submissions.
3. The function sends one HTML and plain-text email through the Resend HTTPS API.
4. The recipient is `contact@studio17.world`; the visitor's address is set as `reply_to`, so replying from the Studio 17 inbox addresses the visitor directly.
5. Resend receives an idempotency key so a retried request cannot create duplicate messages within its deduplication window.

The API key never reaches the browser. Form submissions are not written to the repository, browser storage or Google Drive.

## Production configuration

Production delivery was configured and verified on 2026-08-20. The tracked `.env.example` documents the required variable names and safe non-secret sender/recipient values; it must never contain a real API key.

1. Resend is connected to the Vercel project `studio17-new-website` with a dedicated sending-only key restricted to `studio17.world`.
2. `studio17.world` is verified in Resend.
   Preserve the existing Google Workspace inbound-mail records. Add only the exact Resend sending records and hosts shown during verification; do not replace the root domain's inbound MX configuration.
3. `RESEND_API_KEY` is stored as a Sensitive Vercel variable for Production and Preview. Local development must use an ignored local environment file when real delivery is required.
4. `CONTACT_FROM_EMAIL` is `Studio 17 Website <contact@studio17.world>`.
5. `CONTACT_TO_EMAIL` is `contact@studio17.world`.
6. Redeploy after changing environment variables.

If `RESEND_API_KEY` is absent in any environment, the form displays its translated unavailable message and retains the direct `mailto:contact@studio17.world` fallback.

## Accepted fields

- Required: name, email, service, project details and contact consent.
- Optional: company, phone and indicative budget.
- Technical: page language, one-time submission ID, start time and an invisible honeypot.

No attachments or arbitrary recipients are accepted. The destination, sender contract, allowed services and allowed budgets are controlled server-side.

## Verification

Run the dependency-free API and locale checks from the project root:

```powershell
node tests/contact-api.test.cjs
node tests/contact-locales.test.cjs
node tests/clean-urls.test.cjs
```

With Playwright available, start `node dev-server.cjs 8765` in one terminal and run the full interaction suite in another:

```powershell
node tests/contact-browser.test.cjs http://127.0.0.1:8765 test-artifacts
```

The browser suite covers English, Portuguese (Portugal), Spanish, Greek, Russian and Hebrew at 1440px, 390px and the supported 320px minimum. It checks translated status copy, mobile wrapping, Hebrew RTL, document overflow, image loading, keyboard focus order, accessible required/error state, invalid email, short project details, missing consent, success, rate limiting, provider failure and concurrent duplicate-submit locking.

After deployment:

1. Submit one clearly labelled test message from every public language and confirm each is accepted and arrives at `contact@studio17.world`.
2. Reply to one message and confirm the response is addressed to the visitor's email.
3. Verify translated states in every language and RTL layout in Hebrew.
4. Confirm an invalid form does not send and that the direct email fallback opens correctly.
5. Check Vercel Function logs for `Contact email failed` without recording visitor content.

Production verification on 2026-08-20 returned HTTP 200 from `/api/contact`; Resend recorded the request as 200 and the test message to `contact@studio17.world` as `Delivered`.

The expanded automated QA suite passed on 2026-09-03 across all six languages and the supported desktop/mobile layouts. It also verifies server-side validation, origin restrictions, spam absorption, the five-request rate limit, provider/network failure handling, HTML escaping, `reply_to`, language/service tags and stable Resend idempotency keys without exposing a real API key.

Production acceptance QA on 2026-09-03 submitted one clearly labelled enquiry for each of `en`, `pt-PT`, `es`, `el`, `ru` and `he`. The public endpoint returned HTTP 200 for all six. The sixth request initially demonstrated the configured HTTP 429 limit after five rapid submissions; Hebrew was retried after the protection cleared and was accepted without weakening the limit.

## Maintenance rules

- Never place `RESEND_API_KEY` in HTML, JavaScript sent to the browser, documentation values or Git.
- Never print or paste the live API key into terminal output, screenshots, issue text or test fixtures.
- Keep `contact@studio17.world` as the recipient unless Studio 17 explicitly changes the operational inbox.
- Update all six locale JSON files and regenerate `locales/locales.js` whenever contact copy changes.
- Keep a working direct-email fallback.
- Publish an approved privacy policy before treating the form as fully launched for public data collection.
- Keep the concurrent-submit lock and stable `submissionId`; the first protects the browser session and the second lets Resend deduplicate retried requests.
