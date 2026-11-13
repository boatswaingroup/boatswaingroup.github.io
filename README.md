# Boatswain Properties & Agribusiness Platform

A mobile-first property and agribusiness marketplace for Boatswain Nigeria Limited (RC 942549), using the copied Winning-game repository as a reusable technical foundation.

## Repository layout

- `index.html` — public property catalogue and customer-journey preview.
- `foundation/Winning-game/` — complete copied source repository from `demtaiwo1-eng/Winning-game-`, preserved separately.
- `docs/BOATSWAIN-PRODUCT-PLAN.md` — product architecture, domain mapping, rollout phases and production acceptance criteria.
- `.github/workflows/pages.yml` — deploys the root website from `main`.

## Public catalogue

The preview reflects the public Boatswain Properties website audit on 13 November 2026:

| Property | Published size | Advertised range | Published status / plans |
|---|---:|---:|---|
| GreenFarm Settlement, Omi Adio | 1 acre | ₦3.8m–₦5.8m | Available; full payment or six-month plan |
| Moniya Gateway Estate | 300 sqm | ₦2m–₦2.8m | Coming soon; payment plans unavailable |
| Lagos-Ibadan Expressway Plots | 500 sqm | ₦2.8m–₦4.8m | Available; full payment or six-month plan |
| Boatswain Royal Estate, Ido | 300 sqm | ₦2m–₦2.8m | Listed; full payment or six-month plan |
| Ago-Are Commercial Plots | 500 sqm | ₦2.8m–₦4.8m | Listed; full payment or six-month plan |
| Ona Ara Residential Plots | 500 sqm | ₦2.8m–₦4.8m | Listed; full payment or six-month plan |

These are public advertised ranges, not guaranteed quotes or verified real-time inventory. Specific deposits and exact instalment amounts were not published in the audit. The preview intentionally does not invent them or collect money.

## Official business details surfaced by the public website

- Trading name: Boatswain Properties & Wood Crafts
- Company: Boatswain Nigeria Limited (RC 942549)
- Tagline: Invest Today... Own Tomorrow.
- Phone: 08033635755 / 08023882003
- Email: boatswainproperties@gmail.com
- WhatsApp: https://wa.me/2348033635755
- Office locations: 27, Akinpelu Street, Agberu Avenue, Off ICAST, Elebu, Ibadan; and 2, Ladoke Akintola Avenue, Off Aare Avenue, New Bodija Estate, Ibadan.
- Official source: https://www.boatswainproperties.com

Confirm these details with the company before publishing changes.

## Current status

The root site is a static, functional catalogue preview with search, category filtering, price sorting and links to official property details and WhatsApp enquiries. It is not yet a production marketplace.

Not yet enabled: new-platform user accounts, persistent enquiry storage, plot reservation/locking, live inventory, document vault, customer dashboards, staff/admin workflows, payment processing, automated receipts, livestock/product seller accounts and agribusiness transactions.

## Foundation reuse

The copied foundation is an event-services marketplace (EPHINTA), not a property system. Reusable engineering includes React/TypeScript web tooling, an Express API, PostgreSQL/Prisma, authentication and role models, vendor/listing/enquiry concepts, payment/ledger patterns, notifications, audit logs and mobile scaffolding. Event-specific journeys, terminology, schemas and workflows must be adapted rather than exposed as Boatswain features.

The source repository was copied intact under `foundation/Winning-game/`. Keep the original source repo unchanged. Before production, review dependencies, licences, workflows and security posture; remove unused dependencies and nested `node_modules` from production build artefacts.

## Local preview

Open `index.html` in a browser. The current root preview does not require Node or a database.

## GitHub Pages deployment

The `.github/workflows/pages.yml` workflow deploys the repository root on pushes to `main`. Verify **Settings → Pages → Build and deployment → Source: GitHub Actions**, then inspect the Actions deployment run before treating the live domain as updated.

## Production gate

Do not enable payments or claim that a plot is reserved until the company has confirmed inventory, title and survey documentation, exact prices, deposit and instalment policy, legal sale documents, refund/cancellation rules, provider credentials, webhook verification and reconciliation. Never place payment-provider secrets in frontend code.
