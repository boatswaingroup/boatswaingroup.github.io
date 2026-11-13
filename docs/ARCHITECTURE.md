# Architecture and Production Guardrails

## Reference foundation
The requested reference is demtaiwo1-eng/Winning-game- on its main branch. Inspection confirms a TypeScript/React monorepo with an eventsss123/eventsss-main workspace, a web app, an API workspace, database/Prisma scripts, automated tests and GitHub Actions workflows. Treat these as candidate patterns, not proof that every workflow or subsystem is safe or production-ready.

The source repository has no declared licence. The Boatswain project owner explicitly authorized reuse of this repository as a foundation. Preserve the original repository untouched, retain applicable notices, and review all dependencies, code provenance and third-party rights before adapting components. The compatibility workflow checks out the source into an isolated CI workspace; it does not import or deploy the source application.

## Target platform
- React + TypeScript responsive web client.
- Separately hosted Node/TypeScript API.
- Transactional relational database with migrations.
- Secure authentication, session management and server-side role-based authorization.
- Private object storage for customer documents, with expiring signed access.
- Nigerian payment gateway adapter (Paystack is a candidate, subject to merchant setup and credentials).
- GitHub Pages may host only the public static frontend; it cannot host the API, database, private files or payment webhooks.

## Core domains
users, profiles, roles, permissions; divisions and content; estates and plots; reservations and allocations; sales agreements; instalment plans and schedule items; payment intents and events; append-only ledger entries; receipts and refunds; enquiries and inspections; support tickets; documents; notifications; audit events.

## Invariants
1. A plot cannot have two active reservations or allocations.
2. Reservation and allocation transitions must be transactional and protected by database constraints/locking.
3. Payment events are idempotent by provider reference/event identifier.
4. Financial history is append-only; corrections use compensating entries.
5. Every customer query is scoped to the authenticated customer.
6. Staff privileges are checked server-side on every sensitive operation.
7. Private documents are not stored in the public Pages bundle.
8. Secrets are held only in deployment secret storage, never committed or exposed to the browser.

## Delivery controls
Use pull requests, CI for type/lint/test/build, dependency and secret scanning, staging with payment sandbox credentials, database backups, monitoring, post-deploy smoke tests and documented rollback. Do not label the platform production-ready until these controls and end-to-end flows are verified.


## Foundation compatibility results (11 November 2026)
The isolated CI workflow successfully installed the source lockfile, ran the API checks, web tests and KYC self-test, built the web client and compiled the API. This establishes that the source snapshot can pass its current automated checks in CI; it does not establish that its event-management domain is suitable as the Boatswain property backend. The web build emits a large JavaScript chunk warning (about 814 kB before gzip). A dependency audit also reported 9 advisories (2 low, 4 moderate, 2 high and 1 critical); review and remediate these before any production reuse.


## Payment and instalment accounting foundation (13 November 2026)

The API database now has the initial accounting entities: payment plans tied one-to-one to a reservation, dated instalments, provider payment records, idempotent provider-event records, and an immutable ledger. Monetary values are stored as integer kobo (BIGINT), never floating-point naira. The migration adds positive-amount checks, unique idempotency/provider references, and a PostgreSQL trigger that rejects updates/deletes to ledger rows; corrections must be compensating entries.

This is a data-model foundation only. No payment initialization endpoint, gateway SDK, webhook endpoint, customer charge, receipt issuance, or live collection is enabled by this change. A payment is not considered paid based on a browser redirect; future confirmation must verify the provider's signed webhook and/or server-to-server transaction lookup, then atomically record the payment event, payment state and ledger entry.

The ₦350,000 figure from the initial brief is 35,000,000 kobo. It is not hard-coded as a universal deposit: each plan stores its own depositDueKobo, and a staff-approved business rule must decide whether it applies to each estate/product. Total price, deposit, instalment count and interval must be agreed before a plan is issued. No provider is selected or activated; Paystack and Flutterwave remain candidates pending merchant-account ownership, credentials, settlement and refund procedures, and explicit approval.

Before enabling any gateway, add sandbox integration tests for signature verification, duplicate and out-of-order events, amount/currency/reference mismatches, failed and refunded payments, replay attacks, concurrent webhook delivery, ledger reconciliation and customer ownership. Never store card PAN, CVV, PIN or OTP data.


### Payment-plan API boundary
Administrator-only `POST /api/staff/reservations/:reservationId/payment-plan` creates a schedule only for a currently active reservation with an approved plot price. The schedule is calculated server-side in integer kobo; the remainder is distributed across the requested instalment count without losing kobo. `GET /api/me/payment-plans` returns only the authenticated customer's plans, instalments and ledger rows. These endpoints create a proposed schedule, not a payment request or proof of payment. No customer-facing collection endpoint exists.
