# Virtual-account provider contract

This contract is provider-neutral. It is a design boundary for direct bank transfers into a customer-specific virtual account; it is not a live integration and does not authorize posting wallet credits.

## Required provider capabilities

The selected Nigerian bank/payment provider must support:

- Issuing a dedicated NGN account number for an authenticated Boatswain customer.
- A stable provider-side account/customer reference.
- Authenticated server-to-server transfer notifications with a documented signature scheme.
- A transaction identifier and enough data to verify destination account, amount, currency, and final settlement status.
- Transaction lookup or reconciliation for missed, delayed, duplicated, or disputed notifications.

Do not launch if any required capability is missing.

## Application endpoints

Application routes currently implemented for customer reads are listed first. Provider issuance and webhook routes below remain proposed and are not yet implemented:

### `GET /api/me/virtual-account` (implemented)

Returns only the authenticated customer's active account details. If no active account exists, it returns an unavailable status and explicitly tells the customer not to transfer to unofficial account details. Pending accounts do not expose an account number.

### `GET /api/me/wallet` (implemented)

Returns the authenticated customer's NGN ledger-derived balance and up to 50 recent ledger entries. Amounts are returned as integer kobo strings.

### `POST /api/wallet/virtual-account`

Authenticated customer requests account issuance. The server obtains the customer identity from the session; it must not accept a client-supplied customer ID as the account owner.

Response should contain only the provider-issued account name, bank name, account number, currency, and status. Never fabricate or derive an account number. Repeated requests must return the existing active account or safely reconcile an in-progress issuance rather than creating uncontrolled duplicates.

### `GET /api/wallet/virtual-account`

Returns the authenticated customer's current account details and status. A customer must never be able to query another customer's account by changing an ID.

### `POST /api/webhooks/virtual-account/:provider`

Provider callback endpoint. Verify the provider's documented signature against the exact raw request body before trusting any fields. Reject invalid signatures; validate event type, final settlement status, destination account reference, NGN currency, positive amount, and provider transaction ID.

## Posting rule

Only a verified, settled inbound transfer to the customer's assigned account may create a wallet credit. The backend now includes `settleVerifiedWalletFunding` in `backend/src/wallet-funding-ledger.ts`. It accepts a funding-record ID (not raw webhook data), checks ownership, positive amount and NGN currency, changes `RECEIVED` to `SETTLED`, and inserts the unique credit ledger row in one serializable database transaction. Calling it again for a settled record returns the existing ledger entry. A provider webhook must still verify the provider signature and destination before creating/authorizing the funding record and calling this function. The handler must:

1. Persist the provider event/transaction ID under a unique database constraint.
2. Resolve the account reference to its owning customer on the server.
3. Validate amount and currency using integer minor units (kobo), never floating-point arithmetic.
4. Create one immutable ledger credit and update the wallet balance atomically in a database transaction.
5. Return success for an already-processed duplicate without posting a second credit.
6. Record rejected, unmatched, reversed, and suspicious events for review; do not credit them automatically.

A webhook payload's customer ID, email, or display name is not proof of ownership. Do not trust client-side “payment successful” messages.

## Operational safeguards

- Keep provider credentials in server-side environment secrets only; never expose them to browser code or commit them.
- Use TLS, request size limits, structured redacted logs, rate limits where appropriate, and alerting for signature failures and unmatched transfers.
- Support reconciliation against the provider's transaction lookup/reporting API.
- Define handling for reversals, chargebacks, duplicate events, partial transfers, and transfers to inactive accounts before launch.
- Do not allow withdrawals or spending of unconfirmed funds.

## Release gates

- Provider selected and its official API/webhook documentation reviewed.
- Business/compliance onboarding completed and live credentials issued by the provider.
- Database migrations and authenticated account endpoints implemented.
- Signature verification and idempotent ledger posting implemented and tested.
- Tests cover invalid signatures, duplicate events, wrong destination, wrong currency, zero/negative amounts, replay, concurrent delivery, and reconciliation.
- Staging transfer and reconciliation passed; production monitoring and support ownership assigned.

Until these gates are met, the dashboard must clearly state that virtual-account details are not available and must not instruct customers to transfer to an unofficial account.
