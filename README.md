# Boatswain Group website

A mobile-first public website foundation for Boatswain Group, with Boatswain Properties as the first business module and an Agribusiness entry point.

## Current implementation

- Responsive six-tile group landing page (2 rows × 3 columns on desktop).
- Boatswain Properties catalogue preview with text search, property-type filter and sort.
- Customer-interest and contact forms with client-side validation and preview-only confirmation.
- Customer journey explanation covering the requested ₦350,000 deposit rule.
- Agribusiness marketplace scope entry point for livestock and agricultural products.
- GitHub Pages deployment workflow.

## Important status

This repository currently contains a **frontend preview**, not a production transaction system. Forms do not transmit or persist personal data. No customer account, plot reservation, inventory lock, payment, receipt, or dashboard is active yet. The ₦350,000 figure is shown as a proposed business rule from the project brief and is not a payment request.

Production activation requires:
1. Confirmed estate catalogue, plot dimensions, pricing, site plans, availability and allocation rules.
2. Backend API and database with role-based access, customer accounts, plot reservation locking, ledger and audit logs.
3. Payment provider account and server-side payment initialization, signed webhook verification, reconciliation and refunds policy. Never put secret keys in browser code.
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
