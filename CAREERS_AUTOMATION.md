# Careers automation

The Careers page is a static HTML/CSS/JavaScript page backed by two Vercel Functions. Those functions read approved Google Docs from the private `3. HR > 3. Website Open Role` folder. Google credentials never reach the browser.

## Current Google Drive resources

- HR folder: `1I0xOt-k606DMmY_yKQnykwXvNcckmmjh`
- Open-role folder: `1jbuO2nBYoGwnFP7HLZFTERt_IUmclxGc`
- Master template: `HR - Open Role Template`
- HR operating guide: `guidance for role position automatic`
- Vercel project: `studio17-new-website` (`prj_sF3bvKJJvFaMoPohTwPtcf56IsAJ`)

The master template and the operating guide live in `3. HR`. Completed copies—and only completed copies—belong directly inside `3. Website Open Role`.

## Runtime architecture

```text
Google Drive folder
  -> Vercel Function with a short-lived OIDC token
    -> Google Workload Identity Federation
      -> dedicated read-only service account
    -> validates and parses Google Docs
      -> /api/careers for listing cards
      -> /api/career-role?id=<document-id> for one detail page
        -> careers.html and career-role.html
```

The list and detail responses use a 30-second CDN cache plus a 30-second stale-while-revalidate window. A valid role normally appears or disappears within approximately one minute.

## One-time Google Cloud setup

The production setup belongs to `contact@studio17.world` and uses Google Cloud project `studio17-newsletter` (`593805484268`).

1. Enable the Google Drive API, Google Docs API and IAM Service Account Credentials API.
2. Use the dedicated service account `studio17-careers-website@studio17-newsletter.iam.gserviceaccount.com`. It needs no project role.
3. Keep the active Workload Identity Pool and provider IDs as `vercel`.
4. The provider issuer is `https://oidc.vercel.com/studio-17s-projects`, and its only allowed audience is `https://vercel.com/studio-17s-projects`.
5. Map `google.subject` to `assertion.sub` and restrict the provider with this CEL condition:

   ```text
   assertion.sub == 'owner:studio-17s-projects:project:studio17-new-website:environment:production'
   ```

6. Grant that exact federated subject `roles/iam.workloadIdentityUser` on the dedicated service account.
7. Share only `3. Website Open Role` with the service-account email as Viewer.
8. Do not share the entire HR folder and do not make either folder public.

The configuration is keyless. Do not create or download a service-account JSON key. Google organization policy intentionally blocks key creation.

## One-time Vercel setup

Keep the project OIDC issuer in Team mode. Add the following non-secret values to the connected Vercel project's Production environment:

```text
GCP_PROJECT_ID=studio17-newsletter
GCP_PROJECT_NUMBER=593805484268
GCP_SERVICE_ACCOUNT_EMAIL=studio17-careers-website@studio17-newsletter.iam.gserviceaccount.com
GCP_WORKLOAD_IDENTITY_POOL_ID=vercel
GCP_WORKLOAD_IDENTITY_POOL_PROVIDER_ID=vercel
GOOGLE_DRIVE_OPEN_ROLES_FOLDER_ID=1jbuO2nBYoGwnFP7HLZFTERt_IUmclxGc
```

Vercel injects `x-vercel-oidc-token` into the Function request at runtime. The Function exchanges that token for a short-lived Google token and never stores a private key. Preview is deliberately excluded; enabling Preview requires a separate provider condition and IAM subject.

After saving the variables, redeploy the project once. The source code itself does not need a build command. Never add a real `.env` file or a copied OIDC token to Git.

## Publishing contract

The Google Doc filename is the public role title. A document is published only when all of the following are true:

- it is a native Google Doc;
- it is a direct child of `3. Website Open Role`;
- it is not in Drive trash;
- all required template fields are complete;
- the application URL is a valid `https://` URL.

Required headings:

- Department
- Location
- Work model
- Employment type
- Application URL
- Short summary
- About the role
- What you will do
- What we are looking for

Optional headings:

- Experience level
- Application deadline
- Nice to have
- What we offer
- Hiring process
- Equal opportunity

Do not rename or duplicate headings. Square-bracket placeholder paragraphs are ignored and therefore do not satisfy required validation. An incomplete role is withheld and logged by the server instead of producing a broken public page.

## English-only behavior

`careers.html` and `career-role.html` set `data-force-language="en"`. Careers links from every locale carry `lang=en`, and the i18n layer prevents a Careers page from switching away from English without overwriting the visitor's saved preference for the rest of the website.

## Security decisions

- Authentication uses Vercel OIDC and short-lived Google credentials; there is no stored Google private key.
- The Google provider accepts only the Studio 17 Vercel team audience and the exact production deployment subject.
- The federated subject can impersonate only the dedicated careers service account.
- The service account has Viewer access only to the open-role folder and no project role.
- The browser receives normalized public role content, never Google credentials or private Drive URLs.
- A detail request verifies that the document still belongs directly to the approved folder before returning content.
- Only native Google Docs are read.
- Only `https://` application links are accepted.
- Dynamic copy is inserted with DOM text nodes, not `innerHTML`.
- Error responses do not expose Google API details, service-account identity or keys.

## Verification after configuration

1. Deploy with the three environment variables configured.
2. Open `/api/careers`; with an empty folder it must return `{"roles":[]}` with HTTP 200.
3. Copy the master template, complete every required field, rename the file to a test role title and move it into the open-role folder.
4. Wait up to one minute and confirm the card appears on `/careers.html?lang=en`.
5. Open the card, confirm every section and role fact, and test the application URL.
6. Move the test document out of the folder.
7. Wait up to one minute and confirm both the card and direct role URL are no longer public.
8. Remove the test document if it is no longer needed.

## Troubleshooting

| Symptom | Likely cause | Action |
| --- | --- | --- |
| API returns `CAREERS_NOT_CONFIGURED` | Missing WIF environment variable or missing Vercel OIDC header | Recheck Production variables, Team issuer mode and redeploy |
| API returns `GOOGLE_AUTH_FAILED` | Issuer, audience, subject condition or impersonation grant does not match | Compare Vercel project/team/environment names with the WIF provider and IAM subject |
| API returns `GOOGLE_API_FAILED` | APIs disabled, folder not shared or Google unavailable | Enable Drive/Docs APIs and verify Viewer access |
| Role is missing but API works | Incomplete template, wrong file type or wrong folder | Validate all required fields and direct folder parent |
| Role detail returns 404 | Role was removed, incomplete or the URL is invalid | Return to Careers and inspect the source document |

## Credential maintenance

There is no key to rotate. If the Vercel team slug, project name or target environment changes, update the provider issuer/audience/condition and the service-account IAM subject together, then redeploy and verify `/api/careers`.
