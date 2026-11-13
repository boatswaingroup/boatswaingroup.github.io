# Boatswain Group website

A mobile-first public website foundation for Boatswain Group, with Boatswain Properties as the first business module and an Agribusiness entry point.

## Current implementation

- Responsive six-tile group landing page (2 rows × 3 columns on desktop), with Properties first and Agribusiness as a separate entry point.
- Boatswain Properties catalogue, search, filters and detail links based on the audited public reference site; all commercial details remain unverified until approved by the business.
- Separate Node/Express/TypeScript API and PostgreSQL/Prisma data layer.
- Customer registration/login, customer profile, customer-scoped reservation history, public estate/plot inventory reads and consent-based enquiry API.
- Administrator-only estate and plot inventory management endpoints.
- Transactional 20-minute exact-plot reservations and customer plot picker; no payment is taken when a plot is held.
- Initial payment-plan, instalment, provider-payment, provider-event idempotency and immutable-ledger database foundation.
- GitHub Actions for API/database tests, static-site regression, Chromium browser smoke test and reference-site audit.

## Important status

This is an actively developed application foundation, **not yet a production-ready or live transaction system**. The API and database code are implemented on the development branch, but the public GitHub Pages frontend has no configured API URL and therefore does not expose live accounts or reservations. Payment tables are accounting infrastructure only: there is no payment initialization, gateway SDK, webhook, customer charge, or receipt generation. No live payment is enabled. The public Boatswain website audit did not find verified deposit amounts or exact monthly instalment amounts. Any amount mentioned in earlier project notes is unconfirmed and must not be displayed as an approved price or payment request.

Production activation requires:
1. Confirmed estate catalogue, plot dimensions, pricing, site plans, availability and allocation rules.
2. Production API/database hosting, secure administrator provisioning, account verification and recovery, session revocation, backups and monitoring.
3. Confirmed deposit and instalment policies, merchant payment provider, sandbox integration, signed webhook verification, reconciliation, receipts and refunds policy. Never put secret keys in browser code.
4. Approved legal Terms & Conditions, sale/allocation documents, privacy notice and data-retention policy.
5. Transactional email/SMS, secure document storage, backups, monitoring and incident response.
6. Automated tests, security review and end-to-end verification.

## Local preview

Open index.html in a browser. This is a static site and has no npm build step.

## Deployment

The GitHub Actions workflow at .github/workflows/pages.yml deploys the repository root on pushes to main.

In GitHub, open **Settings → Pages** and set **Build and deployment → Source** to **GitHub Actions**. Then inspect the Actions tab for the deployment result.

## Branding and content still needed

- Replace the temporary lettermark with the official Boatswain Group logo when supplied.
- Confirm the official names and services for divisions 3–6.
- Supply approved Boatswain Properties estate descriptions, verified images, locations, plot maps, prices and legal documents.
- Confirm the approved deposit rule and six-month instalment formula for each property; exact deposits are not published on the public website.

## Source-code and third-party rights

The design and code in this repository are independently implemented for Boatswain Group. External products such as Zillow are feature references only; no proprietary Zillow source, branding or listings are reproduced. The separate demtaiwo1-eng/Winning-game- repository has no declared licence file. The project owner has explicitly authorized reuse as a foundation; keep the source untouched and review third-party notices, dependencies and security before adapting code.


## Latest implementation update
- The public property catalogue now lists the six property pages found during the 20-page reference-site audit, with links to the original detail pages.
- Listing prices, sizes and availability are explicitly presented as values displayed on the reference website, not verified current inventory. Several source descriptions are marked as demo placeholders; confirm all facts with the business before accepting payment.
- Enquiry forms open a pre-filled WhatsApp message to the published Boatswain contact number; customers review and send the message themselves. No form data is stored by this static website.
- The official Boatswain Properties logo image is used as the temporary group mark pending the group logo.
- Automated static-site regression checks cover all six listings, contact handoff and important disclosures.


## Development branch and review

The active implementation is maintained on `project/boatswain-platform-foundation` in draft [PR #1](https://github.com/boatswaingroup/boatswain.github.io/pull/1). It is intentionally not merged to `main` or deployed as the live customer system. See `docs/ARCHITECTURE.md` for payment safeguards and remaining launch gates.


## Product-design improvements (13 November 2026)
- Completed a read-only TinyFish browser review of the live Boatswain Properties reference and the public group preview. Findings and caveats are recorded in `docs/TINYFISH_PRODUCT_DESIGN_AUDIT.md`.
- Added a mobile navigation menu, more useful catalogue filters (type, location and availability), visible result count, empty state and clear-filters action.
- Added lazy-loaded property imagery and meaningful alt text, plus a photographic hero treatment.
- Fixed price sorting so the cards actually reorder in the displayed grid.
- Removed provisional deposit figures from property cards after the 13 November public-site audit found that exact deposits were not published. Property details now request a written quote.
- Sign-out now revokes the current server session when the API is configured.
- Expanded Chromium smoke coverage for the filters, empty state and mobile navigation.

The public GitHub Pages URL still serves the older preview. These changes are on the development branch only and are not live.


## Property-detail and purchase-planning journey
- Catalogue cards now open an in-app property-detail view with the reference listing's displayed title, location, size, price range, status and source-page link.
- Property details do not display an unverified deposit amount as if it were a published fact.
- The detail view includes a buyer due-diligence checklist covering survey references, title review, boundaries/access, written price and instalment terms, allocation/refund conditions and official receipts.
- An illustrative planner calculates a remaining balance and equal monthly scenario from a buyer-entered written total/deposit. It rejects deposits greater than the total and does not assume an approved rate, fees or contractual terms.
- The property-specific enquiry CTA pre-fills the selected property and asks the team for verified inventory, title documents and written payment terms. It does not reserve a plot or collect money.
- Chromium smoke coverage verifies the detail navigation, warning, planner calculation/validation, prefilled enquiry, back-to-catalogue flow and the existing catalogue/mobile checks.


## Customer payment-plan dashboard
- Authenticated customers now have a dashboard section for approved payment plans, instalment due dates/statuses and the ledger entries associated with each plan.
- The display labels the deposit as the amount required by the plan, not as an amount already paid.
- Ledger credits/debits are formatted from integer kobo values without converting through floating-point arithmetic.
- Empty states distinguish between no approved plan and no provider-verified payment entries.
- This is a read-only account statement view. It does not initiate payments or issue receipts; only provider-verified ledger entries are shown as recorded payments.


## Secure account recovery
- Added rate-limited, email-based password reset with generic account-existence responses, 30-minute single-use tokens stored only as hashes, password update and revocation of all active sessions.
- SMTP and reset URL settings are deployment-only environment variables; no email credentials are committed. Password recovery is not live until a verified SMTP sender and HTTPS customer-site URL are configured.
- The customer account modal now supports requesting a reset link and completing the reset from the emailed link. Browser and API tests use mocked email delivery.


## Password recovery
The account modal now includes forgot-password and reset-link journeys. The backend stores only hashed one-time reset tokens, applies a 30-minute expiry and rate limit, uses generic account-existence responses, and revokes all active sessions after a successful password change. SMTP and the HTTPS reset URL must be configured in the hosting provider's environment before real email delivery is enabled. Automated browser/API tests use a mocked sender and do not send emails.


## API deployment preparation
- Render Blueprint now includes the SMTP and HTTPS reset URL environment keys required for password recovery.
- See [API deployment readiness](docs/API_DEPLOYMENT_READINESS.md) for the staging/production checklist, secure secret configuration, CORS requirements and release gates.
- The Blueprint has not been applied; no Render services, databases, email credentials or payment provider have been provisioned.
