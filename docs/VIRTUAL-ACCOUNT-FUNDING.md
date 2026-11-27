# Virtual-account wallet funding

## Intended customer flow

1. After registration and login, a customer sees a virtual bank account assigned to their Boatswain Properties profile.
2. The customer transfers NGN from their bank app to that account. Do not require a checkout redirect.
3. The provider sends a signed transfer event to the API. The API verifies the signature and, where supported, confirms the transaction directly with the provider.
4. The API checks the virtual-account/customer mapping, provider transaction reference, amount, currency, destination account and final settlement status.
5. A single database transaction records the provider event, creates an idempotent credit ledger entry, and updates the customer's wallet balance.
6. The dashboard shows the confirmed transfer and updated balance. Pending, reversed, duplicate, mismatched or unverified events never credit the wallet.

## Not enabled in this build

The current Boatswain Properties backend has property-payment ledger records but no wallet-funding virtual-account model or provider adapter. The dashboard must not display a fabricated account number or accept a customer-submitted “payment complete” assertion. The current UI therefore communicates that account issuance is not connected.

## Required provider onboarding before live account issuance

The business owner must select and onboard a bank/virtual-account provider that supports Nigerian NGN dedicated virtual accounts and inbound transfer webhooks. Obtain its official API contract and sandbox credentials. Confirm account issuance, transfer notification signature scheme, transaction status verification, reversals, settlement/reconciliation and production approval. Keep secrets in the hosting environment, never in Git.

## Implementation and release gates

- Add a provider-neutral virtual account record linked uniquely to a customer and provider account reference.
- Add an authenticated account-details endpoint that returns only the signed-in customer's account.
- Add a provider-specific issuance adapter; never guess endpoints or webhook signature rules.
- Persist webhook event IDs and provider transaction references with uniqueness constraints.
- Verify signature, timestamp/replay protection, destination account, currency, amount and settled status before crediting.
- Credit the wallet and append the ledger entry atomically and idempotently.
- Test duplicate/replayed events, invalid signatures, wrong destination, wrong amount/currency, pending transfers, reversals, provider timeout and reconciliation.
- Enable live issuance only after provider-approved production credentials, sandbox evidence and a monitored low-value transfer.

A dashboard account number is not proof of payment. Only provider-verified, reconciled transfers may change wallet funds.
