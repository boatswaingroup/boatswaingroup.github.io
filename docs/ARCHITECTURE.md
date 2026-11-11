# Architecture and Production Guardrails

## Reference foundation
The requested reference is demtaiwo1-eng/Winning-game- on its main branch. Inspection confirms a TypeScript/React monorepo with an eventsss123/eventsss-main workspace, a web app, an API workspace, database/Prisma scripts, automated tests and GitHub Actions workflows. Treat these as candidate patterns, not proof that every workflow or subsystem is safe or production-ready.

The source repository has no declared licence and the connected account has read-only access. Do not copy its source files wholesale until the rights holder's permission is confirmed. Keep the source repository untouched.

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
