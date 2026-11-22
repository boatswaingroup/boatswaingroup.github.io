# Boatswain Group — Comprehensive Platform Build Scope

Status: implementation scope and acceptance criteria. This document is not evidence that any feature is already implemented or approved for live financial use.

## Delivery principle

Build the platform in deployable, tested increments. Keep demo/simulated data visibly separate from verified records and real-money transactions. Never credit a spendable balance from registration alone. All financial postings must be backed by a confirmed provider event or reconciled payment and recorded in an append-only ledger. Apply least-privilege access, MFA for privileged roles, maker-checker approval for payouts, audit logging, rate limits, and secure secret handling.

## Workstreams

### 1. Identity, accounts, and workforce directory
- Registration creates a pending profile/application, not a funded account.
- Accounts team reviews required identity/KYC documents, records decision and reason, then activates or rejects the account.
- Internal staff and external contractors/workers have distinct worker types, company/business-unit/site assignment, job role, status, supervisor, and permission set.
- RBAC permissions are enforced server-side for every protected operation; UI hiding alone is not authorization.
- Support account suspension, offboarding, access revocation, MFA for privileged users, audit history, and data export appropriate to role.
- Do not represent this as Microsoft Active Directory replacement; consider Entra ID SSO as a separate integration.

### 2. Deposits, wallet, payouts, and reconciliation
- Admin-configurable packages and terms; package copy must disclose fees, eligibility, restrictions, and whether it is savings, investment, or a property payment.
- Payment intent -> provider confirmation/webhook -> reconciliation -> ledger posting. Use idempotency keys and immutable transaction references.
- Pending/failed/reversed payments never increase available balance. Display pending, available, and held balances separately.
- Payout requests require verified account and destination, policy/limit checks, maker-checker approval, provider confirmation, receipt, and reconciliation.
- No live money movement until licensed/contracted payment provider, KYC/AML process, privacy controls, fraud controls, and Nigerian legal/compliance review are approved.
- Wallet is a ledger display, not a bank deposit or guaranteed stored-value product unless legally structured as such.

### 3. Livestock inventory and trading
- Preserve lot/animal/batch purchase price, date, quantity, supplier, ownership, and care history.
- Show verified source price and timestamp separately from estimated/demo price; show unrealized and realized P/L against original cost.
- Sales reduce owned quantity and create a settlement record; proceeds are credited only after confirmed settlement.
- No invented “real-time market” feed. Start with admin-entered verified quotes and timestamp/source fields until a suitable market-data provider is contracted.

### 4. Property, plot allocation, and short-stay rental
- Keep reservation, deposit, allocation, contract, installment schedule, receipt, and handover records linked and auditable.
- Support exact plot/type selection only against live availability; prevent double allocation with server-side transactions.
- Rental listings require owner/asset authorization, readiness and compliance checks, calendar, booking, fees, operating costs, cancellations, and payout rules.
- Rental income before buyer occupancy is only possible under a signed, disclosed management/rental agreement; calculate net proceeds after expenses and do not guarantee occupancy or returns.

### 5. Assisted building planner and quantity surveying
- Template library: house/home, hotel, store, and other configurable building types.
- User edits dimensions, room/space schedule, materials, finishes, and options; generate a versioned brief and preliminary quantities/estimate.
- Estimates must state assumptions, location, unit rates, exclusions, validity date, and “preliminary—not construction-ready” until reviewed.
- Final BOQ and construction documents require qualified quantity-surveyor/architect/engineer review as applicable; do not claim automatic professional certification.

### 6. Retirement, loans, and employee benefits
- Separate customer retirement/investment products from staff pension/retirement benefits.
- Use configurable, reviewed eligibility and contribution rules; display projections as estimates, never guaranteed returns.
- Loan workflow: application, consent, documented eligibility, affordability assessment, human approval, contract, disbursement, schedule, repayment, arrears and complaints.
- Do not automate discriminatory decisions or promise approval. Regulatory/product design review required before offering credit or pension/investment products.

### 7. Workforce operations, payroll, recognition, and notifications
- Daily labour portal for construction, farms, livestock, greenhouse, hotels, offices, feed mill, artisans, and other units.
- Assignments, attendance, timesheets, approvals, safety/training records, payroll inputs, and payment reconciliation.
- Recognition is tied to documented activity and transparent criteria; allow correction/appeal.
- Birthday/team messages use opt-in contact preferences and approved email/WhatsApp providers; log delivery status and support unsubscribe/quiet hours.

### 8. Academy / LMS
- Enrollment, course catalog, lessons, resources, assessment, attendance/progress, instructor/admin tools, and completion records.
- Two-month and six-month course formats can be configured.
- Describe credentials accurately. Do not call a course a National Diploma or imply accredited qualification until the awarding institution and required accreditation/approval are verified.

## Required release gates
1. Threat model, data classification, privacy notice/consent, access matrix, and security review.
2. Automated tests for authorization, account approval, ledger invariants, idempotency, concurrent plot allocation, and payout approvals.
3. Provider sandbox integration and reconciliation tests; no production credentials in source control.
4. Migration/backups/restore test, monitoring/alerts, incident response, and audit retention policy.
5. Compliance/legal approval for payments, lending, retirement/investment, rental operations, and credential claims.
6. Mobile/responsive accessibility checks, API contract tests, and end-to-end smoke tests.
7. Explicit production go-live approval after all gates pass.

## Initial implementation order
1. Establish backend domain models and role/permission enforcement.
2. Build pending account review and workforce directory.
3. Implement ledger, deposit confirmation, and controlled payout workflows in provider sandbox.
4. Connect property, livestock, rental, planner, workforce, and academy modules to persistent APIs.
5. Integrate approved notification and external providers.
6. Test, review, and release in stages.

## Definition of done
A feature is done only when its UI, authenticated API, persistent data model/migration, authorization, audit trail, error states, automated tests, and operational configuration are present and verified. A mockup, local-only state, demo balance, or successful CI build alone does not satisfy this definition.
