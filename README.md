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

This is an actively developed application foundation, **not yet a production-ready or live transaction system**. The API and database code are implemented on the development branch, but the public GitHub Pages frontend has no configured API URL and therefore does not expose live accounts or reservations. Payment tables are accounting infrastructure only: there is no payment initialization, gateway SDK, webhook, customer charge, or receipt generation. No live payment is enabled. The ₦350,000 amount is a proposed rule from the project brief, not a universal deposit policy or payment request.

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
- Confirm whether the exact deposit is ₦350,000 for every estate/plot or varies by offering.

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
