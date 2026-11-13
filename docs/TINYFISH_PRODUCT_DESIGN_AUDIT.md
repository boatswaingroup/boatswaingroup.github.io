# TinyFish product-design audit and implementation notes

**Audit date:** 13 November 2026  
**Reference site:** https://www.boatswainproperties.com/  
**Group preview:** https://boatswaingroup.github.io/  
**Working branch:** `project/boatswain-platform-foundation`

## Executive assessment

The current public GitHub Pages site is still a preview, not a live transactional marketplace. TinyFish confirmed that it displays a preview-only enquiry experience, placeholder division names, and property data that is not yet production inventory. The PR branch contains a more complete product foundation, but it must remain a draft until its UX, API, data and launch gates are verified.

The reference website has a recognisable warm property brand (deep green, cream and gold), property-led messaging, a public catalogue, customer account journeys, and direct phone/WhatsApp contact. The product should retain that familiarity while making the group portal and property marketplace clearer, more trustworthy and easier to use.

## What was inspected

- Homepage and its primary call to action.
- Property catalogue and six linked property detail pages.
- Login, registration, password-reset and subscribe journeys.
- Contact and about pages.
- Group landing page currently deployed on GitHub Pages.
- PR branch frontend source and its existing browser smoke test.

TinyFish's browser audit was read-only. No accounts were created, no forms submitted, and no data or purchases changed.

## Verified findings and important caveats

### Public group site

- The public group URL is an older single-page preview, not the new marketplace implementation in the open PR.
- It explicitly identifies itself as a preview and says enquiries are not sent or stored.
- It shows six division tiles, with the last four still generic placeholders.
- Its property content and contact details include items still to be confirmed.
- TinyFish found the visible anchor navigation and interest modal working, with no obvious 404s or visible console errors during its check.

### Boatswain Properties reference

- Brand palette: deep green, warm cream and gold; sans-serif typography; generous whitespace.
- Main navigation includes Home, About, Services, Properties, Contact, Login and Register.
- The homepage headline is “We Build More Than Properties, We Build Trust and Value.”
- The reference homepage currently shows three product types: 300 SQM estate plot, 500 SQM estate plot and 1 Acre farm settlement.
- The homepage currently displays different initial deposits by property type: ₦350,000, ₦550,000 and ₦1,100,000 respectively. These are reference-site statements, not independently verified commercial policy. Do not impose one deposit universally or turn these amounts into live checkout rules without written confirmation.
- The reference site advertises a six-month plan and zero interest. Those terms must be approved and configured per eligible property before the platform presents them as contractual.
- Login includes a password-reset path. The PR backend does not yet implement secure email recovery; the new UI therefore explains that recovery is not yet available rather than showing a dead link.
- Registration describes account access to property selection, payment-plan review and tracking.
- The property catalogue lists GreenFarm Settlement, Moniya Gateway Estate, Lagos-Ibadan Expressway Plots, Boatswain Royal Estate, Ago-Are Commercial Plots and Ona Ara Residential Plots.
- At least two inspected detail pages explicitly contain “Demo placeholder - replace with verified company details.” Their descriptions, amenities, legal/title claims, prices and availability are not verified inventory.
- The reference site has inconsistent company naming in some page elements, and the audit noted a potentially confusing “Subscribe Now” CTA that leads to a customer-interest journey rather than a newsletter subscription.
- Detail pages would benefit from an immediate enquiry action, verified document pack, more site-plan/progress imagery and an understandable payment schedule.
- Strong independent trust evidence (verified project progress, title documents, client testimonials with permission, company/legal details) was not established by this audit.

### Conflicting observations to recheck

Some browser observations and extracted page text differed on whether property cards expose all title/price/location details and on the exact structure of the contact page. Treat those points as requiring a DOM-level recheck before changing reference-site content. The PR build should favour clear, self-contained cards regardless.

## Prioritised product-design backlog

### P0 — trust and correctness

1. Keep every unverified catalogue item visibly labelled illustrative until the business validates title, plot map, price, status, dimensions, location and imagery.
2. Present a written, property-specific quotation with deposit, balance, due dates, refund/cancellation terms and allocation conditions before payment.
3. Do not publish invented testimonials, certifications, title guarantees, remaining-plot counts, investment returns or amenities.
4. Standardise the approved legal company name, trading name, logo and contact details across the group and property experiences.
5. Keep the preview clearly separated from live customer accounts and real payment collection.

### P1 — discovery and conversion

1. Add meaningful property photography with useful alt text and a consistent crop.
2. Put the property name, location, size, price range and availability state directly on each card.
3. Provide useful search, type, location, availability and price filters, a result count and an empty state.
4. Keep browsing public; require sign-in only for account-specific actions such as holding an exact plot.
5. Add a property-specific enquiry path at the decision point.
6. Add a payment-plan estimator only after deposit and instalment rules have been approved and verified against the backend.

### P1 — mobile and accessibility

1. Provide a real mobile navigation toggle instead of hiding navigation links.
2. Keep tap targets comfortable and forms full-width on small screens.
3. Add visible keyboard focus, semantic labels, live result announcements and reduced-motion support.
4. Ensure imagery does not carry essential text and provide meaningful alt text.
5. Test keyboard navigation, zoom, narrow widths and screen-reader announcements in browser automation.

### P2 — trust and account experience

1. Add verified title/document downloads with private customer access when storage and authorization are ready.
2. Add testimonials only with customer permission and substantiated project evidence.
3. Add a customer account view for reservations, approved payment plans, ledger entries, receipts and due dates as those APIs and verified payment integrations become available.
4. Add clear empty, loading, offline and error states to every customer workflow.
5. Add property sharing, comparison and map/site-plan tools after the core inventory is accurate.

## Changes implemented in the PR branch

- Added a keyboard-accessible mobile navigation toggle and close-on-navigation behaviour.
- Added location, availability and minimum/maximum price filters alongside search and property type; fixed displayed sort ordering and added a clear-filters action.
- Added result count announcements and a no-results state.
- Added property imagery from the existing Boatswain Properties public media directory, with descriptive alt text and lazy loading.
- Added a stronger catalogue disclosure that these are reference examples, not verified live inventory.
- Replaced the blanket ₦350,000 deposit statement with a property-specific written-offer explanation.
- Made the account recovery limitation explicit rather than linking to an unimplemented recovery endpoint.
- Changed sign-out to call the API session-revocation endpoint before clearing the in-memory token.
- Extended the Playwright smoke test to cover location/availability filters, empty state and mobile navigation.

## Remaining launch blockers

- Confirm the official group/division names and supply the final Boatswain Group identity assets.
- Validate every estate, plot map, plot code, legal title, size, price, availability and amenity.
- Confirm deposit and instalment policy per estate/property and approve all sale, refund and cancellation documents.
- Deploy and configure the API/database, CORS, email delivery, secure password recovery and administrator access.
- Select and approve a payment provider; implement signed server-to-server verification, idempotent webhooks and receipts before collecting money.
- Complete customer document storage/access controls, backups, monitoring, security review and end-to-end testing.
- Test the actual PR frontend in desktop and mobile browsers; the public GitHub Pages URL still serves the older preview, not this branch.

## Release decision

**Do not merge or deploy this PR yet.** Keep it as a draft until the above data, security, commercial and operational gates are satisfied and the new branch has passed the expanded browser and CI checks.


## Final preview and regression verification

The third-party HTML preview services did not consistently report the current DOM: some runs returned stale or conflicting selector names. The authoritative branch HTML at the tested commit contains the responsive menu toggle, empty-result element, account modal, and min/max price inputs. The latest GitHub Actions run provides the reliable interaction check:

- Chromium smoke test passed, including mobile navigation open/close.
- Search, property type, location, availability, minimum/maximum price, price sorting, clear filters and empty-state assertions passed.
- API build and PostgreSQL integration tests passed.
- The public reference-site crawl completed successfully.
- Winning-game foundation compatibility review passed.

TinyFish was used for the reference-site and preview inspections, but its preview-service selector extraction is treated as advisory where it conflicts with source and Playwright regression evidence.


## Property-detail and purchase-planning milestone

The development branch now includes an in-app detail view launched from each of the six catalogue cards. It displays the source-listed name, location, size, price range and availability label, with a direct link to the corresponding reference property page. The deposit amounts displayed from the reference are explicitly labelled unverified and are not treated as company-approved payment terms.

The detail view also includes:
- A buyer due-diligence checklist (survey reference, title/root-of-title review, boundaries and access, written quotation, allocation/refund terms, approved payment channel and receipt).
- An illustrative calculator. A sample input of ₦5,000,000 total, ₦500,000 deposit and six months yields approximately ₦750,000 per month. A deposit greater than the total is rejected. This is a mathematical example only, not a quote or contract.
- A property-specific enquiry message requesting verified inventory, title documents, final price, deposit, fees and allocation/payment terms.
- A return-to-catalogue action.

### Verification and preview caveat

GitHub Actions passed the API build and integration tests, static checks, Chromium smoke tests and reference-site crawl on the validation commit. The Chromium smoke test explicitly covers the property detail, deposit disclaimer, planner arithmetic and validation, enquiry prefill, and return-to-catalogue journey.

A TinyFish inspection of the third-party HTML preview service returned the older source property-detail page after following an external link; it did not validate the in-app detail view. Treat that browser result as a preview-navigation/cache mismatch, not as evidence that the new feature is absent. The source branch and CI smoke test are authoritative for this milestone. A separate full visual/mobile browser review of this new in-app detail view remains a follow-up quality gate.


### Live interaction check of the detail journey

A targeted TinyFish browser run against commit `076358aa0a5531f5790abdb3ba3c58abd05d7263` confirmed that the explicit **View property details** button keeps the visitor inside the Boatswain preview and opens the in-page detail view. On Boatswain Royal Estate, Ido it confirmed the ₦350,000 source-displayed deposit is explicitly marked unverified, all six due-diligence prompts are visible, and the planner works:
- ₦5,000,000 total − ₦500,000 deposit = ₦4,500,000 balance
- Six equal illustrative months ≈ ₦750,000 per month
- Deposit greater than total is rejected

The property-specific enquiry opens the customer desk with the selected property included in the prefilled message. The form was not submitted. The detail action buttons now use explicit button semantics and descriptive accessible labels; the image remains an alternate detail entry point.


## Customer payment-plan dashboard milestone

The authenticated customer dashboard now reads the existing customer-scoped `GET /api/me/payment-plans` endpoint and displays:
- Estate and plot reference for each plan.
- Agreed total and the deposit required under the plan (clearly not represented as already paid).
- Instalment sequence, amount, due date and status.
- The ledger entries attached to each plan, including direction, description, date and exact Naira formatting from integer kobo values.

The UI distinguishes between no approved plan and no provider-verified ledger entries. It does not create payments, mark instalments paid, or issue receipts. The API integration test now checks that the customer payment-plan response includes the schedule and ledger collection, while remaining scoped to that customer.


## Secure customer password recovery milestone

The customer account journey now includes a forgot-password request form and a reset-link completion form.

### Security behaviour
- Reset requests are rate-limited to five per hour per client IP, in addition to the general authentication rate limit.
- The request endpoint returns the same generic `202` response for known and unknown email addresses and applies a minimum response duration to reduce account enumeration by timing.
- Reset tokens are generated from 32 cryptographically random bytes. Only a SHA-256 hash is stored in PostgreSQL; the raw token is delivered by email in the URL fragment (not the query string), so browsers do not send it to the server or third-party image hosts in HTTP Referer headers. It is never logged or returned by the API.
- Tokens expire after 30 minutes, only one unused token per customer remains valid, and each token can be consumed once.
- Successful reset updates the password hash and revokes all active sessions in the same database transaction.
- Invalid, expired and reused links receive the same generic invalid-link response.
- SMTP delivery is configured through environment variables. If the email service is not configured or delivery fails, the API does not expose the token or whether the account exists; it removes the undelivered token and returns the generic request response.
- Automated tests inject a fake sender. They do not send real email.

### Activation requirements
Set `PASSWORD_RESET_URL` to the deployed HTTPS customer website and configure `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_FROM`, `SMTP_USER` and `SMTP_PASSWORD` in the hosting provider's secret environment settings. No SMTP credentials belong in GitHub source files or chat. Until these settings are supplied, the reset UI remains a code-complete but non-delivering integration.
