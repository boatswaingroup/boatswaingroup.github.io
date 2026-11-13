# Boatswain Marketplace — Product Architecture & Delivery Plan

**Product:** Boatswain Properties & Agribusiness Marketplace  
**Company:** Boatswain Nigeria Limited (RC 942549)  
**Primary market:** Ibadan and Oyo State, Nigeria  
**Status:** Foundation copied; public static catalogue preview built; production backend and deployment verification pending.

## 1. Product scope

A single customer-facing marketplace with two primary business verticals:

1. **Property:** estate catalogue, location and plot-size filters, property details, availability, enquiries, plot selection, reservations, instalments, receipts, document vault and customer dashboard.
2. **Agribusiness:** farm-land opportunities, livestock and agricultural product listings, verified sellers, buyer enquiries, order/contract records and fulfilment tracking.

Internal staff tooling should support inventory management, customer relationship management, allocation approvals, payment reconciliation, document review and audit history.

Zillow is a product capability reference (search, filters, maps, listing detail, saved properties, lead capture and account journeys), not a source of proprietary code, data or branding.

## 2. Foundation assessment

The copied source at `foundation/Winning-game/eventsss123/eventsss-main/` is an existing React/TypeScript + Vite web client and Express + Prisma/PostgreSQL API for an event-services marketplace.

Reusable technical patterns:
- React, TypeScript, Vite and responsive application shell.
- Express API, request validation, authentication and password-reset flows.
- PostgreSQL + Prisma data layer and migration workflow.
- Role-based user accounts and vendor/business profiles.
- Listings, categories, enquiries and reviews.
- Payment intents, wallet/ledger concepts, reconciliation, payout and audit-log patterns.
- Notifications, document/KYC workflows, offline/mobile scaffolding and automated tests.

Do not reuse as-is:
- Event, guest, RSVP, event budget, event readiness, event booking and event-service terminology.
- EPHINTA visual identity, logos, copy, audio, event-specific screens and seeded content.
- Vendor workflows where property owner, agent, farm operator and staff roles need distinct permissions.
- Any payment logic until the property reservation and allocation lifecycle is redesigned and independently tested.

The copied project includes source repository workflows and dependencies. They are nested below `foundation/Winning-game/` and do not become active root workflows. Do not run source CI workflows against the destination until reviewed. Exclude nested `node_modules`, build output, secrets, local databases and generated credentials from production build artefacts.

## 3. Proposed domain model

### Identity and access
- User: id, name, email, verified phone, password hash, status, timestamps.
- Role: CUSTOMER, PROPERTY_AGENT, PROPERTY_MANAGER, FARM_SELLER, AGRIBUSINESS_BUYER, FINANCE, SUPPORT, ADMIN.
- UserRole: explicit scoped role grants; least-privilege access.
- Session/RefreshToken: hashed, revocable, expiring.
- Verification: identity/business review status and protected document reference.

### Property inventory
- Estate: name, slug, description, LGA, city, state, coordinates, hero media, status.
- Plot: estate, plot number, area sqm/acre, category, price, currency, title/survey reference, availability status, map geometry.
- PlotStatus: DRAFT, AVAILABLE, HELD, RESERVED, ALLOCATED, SOLD, BLOCKED.
- PlotHold: plot, customer, expiry, idempotency key; unique active hold per plot.
- PropertyMedia: estate/plot, storage key, alt text, display order.
- PropertyDocument: document type, verified status, reviewer and secure storage reference.

### Pricing and sale agreements
- PriceQuote: plot, price version, expiry, approved by, currency, fees and total.
- PaymentPlan: full payment or six-month plan, eligibility, deposit rule, schedule rule, approval status and effective dates.
- SaleAgreement: customer, plot, quote snapshot, plan snapshot, signed-document reference, status.
- Installment: due date, amount in kobo, paid amount, status, grace/late policy.

All monetary values are stored as integer minor units (kobo) with ISO currency. Never calculate payment schedules from a public price range. Store a signed, immutable quote snapshot for each agreement.

### Payments and ledger
- PaymentIntent: provider, reference, amount, currency, status, idempotency key.
- PaymentEvent: provider webhook event ID, signature-verification outcome, raw event reference and processing status.
- LedgerEntry: append-only debit/credit records linked to sale agreement and payment.
- Refund: amount, reason, approval, provider reference and final status.
- Receipt: immutable receipt number, payment reference and PDF object key.

Payment success is confirmed only by a verified server-side provider webhook or server-to-server verification. Browser redirects are not proof of payment. Reconciliation must detect missing, duplicated and reversed transactions.

### Agribusiness marketplace
- SellerProfile: individual/company, verification, contact and settlement details.
- FarmOpportunity: location, area, crop/livestock focus, terms, availability and evidence.
- ProductListing: category, title, description, unit, quantity, price, media, seller and status.
- BuyerEnquiry / Order / Contract: buyer, seller, listing, quantity, negotiated terms, status and audit trail.
- FulfilmentRecord: delivery/collection, dates, evidence and disputes.

### Operations
- Enquiry: customer, channel, interest, assigned staff, status, follow-up date and consent.
- Notification: channel, template, delivery status and retries.
- AuditLog: actor, action, entity, entity ID, timestamp and safe metadata.
- AdminApproval: two-person approval for sensitive financial or allocation actions.

## 4. Critical customer journeys

### Property purchase
1. Search and filter estates; inspect map, plot dimensions, documents and current availability.
2. Register or sign in; verify email and phone.
3. Select a plot; backend atomically creates a time-limited hold.
4. Staff confirm title/document status and approve a price quote.
5. Customer reviews and accepts a written agreement and approved payment plan.
6. Backend creates an idempotent payment intent; payment provider processes payment.
7. Signed webhook and server verification post the ledger entry and update instalment balance.
8. Customer receives receipt and dashboard update.
9. Staff approve allocation; plot transitions to ALLOCATED only after all required checks.
10. Customer can download signed agreement, receipts and allocation documents.

### Agribusiness buyer/seller
1. Seller applies and completes business verification.
2. Admin reviews seller and listing evidence.
3. Approved products/opportunities appear in search.
4. Buyer contacts seller or submits order/enquiry.
5. Both parties confirm quantity, price, delivery/collection and terms.
6. Transaction status and evidence are tracked; disputes can be escalated.

## 5. Security and compliance requirements

- Argon2id or bcrypt password hashing, secure cookie/session strategy, refresh-token rotation and revocation.
- Email/phone verification, rate limits, brute-force protection and generic password-reset responses.
- RBAC enforced server-side on every protected resource; object-level authorization tests.
- HTTPS, Helmet/security headers, strict CORS allowlist, CSRF protection where cookie auth is used.
- Input validation, output encoding, upload MIME/signature/size scanning and private object storage.
- No PAN/card data stored by the platform; use hosted/tokenized provider checkout.
- Verify webhook signatures, event IDs, timestamps and idempotency; reconcile provider settlements.
- Append-only financial ledger and immutable audit events; dual approval for refunds, price overrides and plot allocation.
- Backups with tested restore, secret rotation, monitoring, alerting, incident response and retention policy.
- Nigeria Data Protection Act / NDPC-aligned privacy notice, consent, access/deletion workflow and data minimization; obtain qualified legal review.

## 6. Delivery phases

### Phase A — Foundation and public catalogue
- [x] Copy full source repository into `foundation/Winning-game/` on a separate branch.
- [x] Preserve destination `main` and original source repository.
- [x] Audit official public property catalogue and contact information.
- [x] Replace placeholder listings with the six publicly advertised properties.
- [x] Add searchable/filterable property catalogue and direct official enquiry links.
- [ ] Verify GitHub Pages settings and production deployment on the intended domain.
- [ ] Confirm logo/media rights and optimize images.

### Phase B — Product adaptation
- [ ] Create a dedicated Boatswain React app; do not expose EPHINTA UI.
- [ ] Establish a new design system aligned to Boatswain green/white/gold brand.
- [ ] Replace event schema with property, plot, sale agreement, instalment, agribusiness and seller models.
- [ ] Create Prisma migrations and seed only approved demo data.
- [ ] Build customer, agent, finance and admin route groups with server-enforced RBAC.
- [ ] Implement property map/search and saved listings.
- [ ] Build enquiry inbox and CRM follow-up workflow.

### Phase C — Transaction readiness
- [ ] Confirm property inventory, title/survey evidence, plot maps, pricing and status with company management.
- [ ] Confirm per-estate deposit and six-month schedule rules in signed policy; current public site does not publish exact deposits or instalment amounts.
- [ ] Implement plot holds, quote versioning, agreement generation and allocation approvals.
- [ ] Configure approved payment provider in test mode, webhook verification, ledger and reconciliation.
- [ ] Implement receipt/document vault and email/SMS notifications.
- [ ] Complete security review, backup/restore test, audit and end-to-end test suite.

### Phase D — Agribusiness
- [ ] Confirm which livestock/products are in scope and seller eligibility.
- [ ] Build seller onboarding, verified listing management, buyer enquiries and fulfilment.
- [ ] Add inventory quantity controls, order contracts and dispute workflows.
- [ ] Add moderation, fraud reporting and content review.

### Phase E — Launch
- [ ] Staging deployment with test accounts and no live money.
- [ ] UAT sign-off from property, finance, sales and agribusiness teams.
- [ ] Legal/privacy/security approval.
- [ ] Production secrets, domains, TLS, monitoring and backups.
- [ ] Controlled launch, daily reconciliation and support escalation.

## 7. Known official property catalogue (public audit: 13 November 2026)

- GreenFarm Settlement, Omi Adio — 1 acre — ₦3.8m–₦5.8m — full payment / six months.
- Moniya Gateway Estate — 300 sqm — ₦2m–₦2.8m — coming soon; plans unavailable.
- Lagos-Ibadan Expressway Plots — 500 sqm — ₦2.8m–₦4.8m — full payment / six months.
- Boatswain Royal Estate, Ido — 300 sqm — ₦2m–₦2.8m — full payment / six months.
- Ago-Are Commercial Plots — 500 sqm — ₦2.8m–₦4.8m — full payment / six months.
- Ona Ara Residential Plots — 500 sqm — ₦2.8m–₦4.8m — full payment / six months.

These are advertised ranges and statuses from the public site, not live verified stock. The public pages did not specify deposits or exact monthly payment amounts.

## 8. Acceptance criteria before live transactions

- Customer can never reserve a plot that another customer holds or has purchased.
- Quote and instalment calculations are deterministic, versioned and approved.
- Duplicate webhooks cannot duplicate ledger entries.
- Payment status cannot be changed by client-side input or return URL.
- Only authorized staff can verify documents, override price, refund, release holds or allocate plots.
- Every money movement reconciles to provider records and ledger.
- All critical flows have automated tests, audit trail and restore-tested backups.
- No secrets or personal data appear in logs, Git history, public assets or build output.
