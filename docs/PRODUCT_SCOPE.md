# Product Scope — Boatswain Group

## Group portal
- Six equally sized, multicoloured division tiles in two rows of three on desktop; responsive on mobile.
- Boatswain Properties is division one and the first completed module.
- Agribusiness was also discussed for livestock and agricultural products. Confirm whether it is division two or a later module.
- The remaining four division names and destinations are not yet confirmed; do not invent them as approved business units.
- Group logo is pending upload. Use the existing Boatswain Properties identity until the approved group logo is supplied.

## Boatswain Properties
- Public landing page, estate/property catalogue, search, filters, detail pages and galleries.
- Exact plot inventory with plot ID, estate, dimensions, location, price and authoritative availability.
- Registration, sign-in, account recovery and customer profile.
- Plot selection, reservation expiry, allocation and customer dashboard.
- Property-specific deposit and instalment schedules generated only from approved, versioned written offers; public source pages do not publish exact deposit amounts.
- Approved instalment schedules, balances, due dates, payment history and downloadable receipts.
- Enquiries, inspection requests, support and downloadable legal/customer documents.
- Staff/admin tools for plots, customers, allocations, payments, documents and audit logs.

## Agricultural marketplace scope
Earlier discussions included livestock and agricultural-product buying/selling. Keep it as a separate division/module unless the business confirms it belongs inside Boatswain Properties. It may need seller onboarding, product listings, inventory, buyer enquiries, orders, delivery and settlement workflows.

## Security and payments
- Payment credentials and signing secrets must remain server-side.
- Confirm payment by verified server webhook/API lookup, not by a browser redirect.
- Use idempotency and an append-only ledger to prevent duplicate payments.
- Reserve plots atomically to prevent double allocation.
- Enforce customer ownership and staff permissions on every backend request.
- Store private agreements and receipts in private object storage with controlled access.

## Launch gates
- Confirm estate data, pricing, plot maps, available plots and allocation rules.
- Confirm payment provider and merchant account.
- Approve Terms & Conditions, privacy notice, cancellation/refund rules and sales documents with qualified counsel.
- Configure backend, database, email/SMS, storage, monitoring and backups.
- Pass security, integration and end-to-end tests before enabling live payments.
