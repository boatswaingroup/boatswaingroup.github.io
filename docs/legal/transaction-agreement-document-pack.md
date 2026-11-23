# Boatswain Group — Transaction & Agreement Document Pack

**Status:** Draft operational templates for product design and counsel review. Not legal advice, not evidence of title, and not a substitute for a signed instrument prepared or approved by Nigerian counsel. Do not issue these as final customer contracts until the company identity, regulatory status, product terms, land title, payment partners, tax treatment, privacy notice, dispute forum, and applicable Nigerian law have been verified.

## Document generation rules

- Generate a unique immutable document number and link it to the transaction, customer, property/asset, and ledger entries.
- Store the exact rendered version, template version, timestamp, signer identity/verification result, consent text, and audit events. Never silently overwrite a signed document.
- A receipt confirms only the payment actually settled and recorded. A pending payment is not a receipt for cleared funds.
- Never describe a plot as allocated, title transferred, livestock as owned/delivered, or a withdrawal as paid until the required review and settlement state is confirmed.
- Use the customer’s legal name and verified contact details; mask bank/account details in customer-facing copies.
- Attach the applicable schedule, disclosure, inspection report, land documents, payment proof, or asset details as an exhibit.
- Provide accessible PDF and HTML copies, with a download/audit record. Obtain explicit consent before electronic signing and retain the consent record.
- Have counsel review each template and determine whether witnessing, stamping, registration, notarisation, or additional disclosures are required.

## Shared transaction cover sheet

**Document ID:** [generated]  
**Template/version:** [name / version]  
**Transaction ID:** [generated]  
**Date/time (WAT):** [timestamp]  
**Company legal entity / RC number / address:** [verified details]  
**Customer legal name / customer ID:** [verified details]  
**Customer address / contact:** [verified details]  
**Product / asset / plot reference:** [reference]  
**Amount / currency:** [NGN amount]  
**Status:** [draft / awaiting consent / signed / pending settlement / settled / cancelled / disputed]  
**Supporting documents:** [list]  
**Customer support / complaints channel:** [verified channel]

---

## 1. Property reservation and deposit acknowledgement

**Purpose:** Acknowledges a reservation request and any cleared reservation/deposit payment. This document alone does not convey land, create title, or guarantee allocation.

**Parties:** [Company legal entity] and [Customer legal name].  
**Estate/project:** [name and verified location]. **Plot/plot type requested:** [reference/type].  
**Total stated price:** ₦[amount]. **Reservation/deposit amount:** ₦[amount].  
**Payment reference and settled date:** [reference/date]. **Balance:** ₦[amount].  
**Reservation expiry / next action:** [date and conditions].

The company acknowledges receipt of ₦[amount] only if its payment ledger confirms settlement. The payment is applied as follows: [allocation]. Reservation, refund, cancellation, and forfeiture rules are: [counsel-approved terms]. No plot is allocated until the company issues a separate signed Plot Allocation Confirmation after title, availability, identity, and payment checks. The customer must review the survey plan, title/encumbrance disclosures, boundaries, permitted use, infrastructure status, and all fees before signing any conveyance or lease.

**Customer acknowledgement:** I received and reviewed the disclosures and understand this is a reservation/payment acknowledgement, not a title document.  
Customer signature/date: [ ] Company authorised signatory/date: [ ]

### Deposit receipt
Receipt no. [ ] | Transaction ID [ ] | Payer [ ] | Amount ₦[ ] | Channel [ ] | Provider reference [ ] | Settled at [ ] | Applied to [ ] | Outstanding balance ₦[ ] | Issued by [ ].  
Receipt status: [settled / pending / reversed]. This receipt is valid only for the status shown in the company’s ledger.

## 2. Plot allocation confirmation (conditional)

**Do not issue until legal/title and availability checks are complete.**

Estate/project [ ] | Plot number [ ] | Plot type [ ] | Survey/plan reference [ ] | Approximate area and units [ ] | Boundary plan attached [ ] | Seller/developer and verified title reference [ ] | Purchase price ₦[ ] | Payments received ₦[ ] | Balance ₦[ ] | Payment schedule [ ].

The company confirms that, subject to the definitive sale/lease instrument and its conditions, the plot identified above is reserved/allocated to [customer]. This confirmation is not itself a conveyance or registered title. Rights, completion conditions, possession date, development obligations, taxes/fees, default, cancellation, dispute resolution, and transfer restrictions are governed by the separately executed [sale agreement/lease] attached as [exhibit]. No representation is made beyond the verified disclosures attached.

Customer signature/date [ ] | Company authorised signatory/date [ ] | Witness(es), if counsel requires [ ].

## 3. Land sale / lease agreement — counsel completion checklist

This agreement must be drafted or completed by Nigerian property counsel for the specific transaction. Do not auto-fill legal title warranties. Required schedules: parties and capacity; title chain and searches; survey plan and boundaries; consideration and payment milestones; conditions precedent; completion/possession; taxes, fees and consent/registration; representations limited to verified facts; defects/encumbrances and disclosure; default and cure; cancellation/refund; force majeure; notices; dispute resolution; governing law; execution/witnessing; and any statutory approvals. Attach the final conveyance/lease and all required exhibits. A plot allocation screen or receipt is not a substitute.

## 4. Installment payment schedule and acknowledgement

Customer [ ] | Agreement ID [ ] | Plot [ ] | Contract price ₦[ ] | Cleared payments to date ₦[ ] | Remaining principal ₦[ ] | Approved fees/interest (if any, fully disclosed) [ ] | Schedule attached [ ].

Each installment is due on the dates and amounts in the signed schedule. A payment is credited only when settled. The system must calculate the balance from the ledger, not from a client-entered value. Late fees, grace periods, acceleration, repossession, cancellation, and refund treatment must be explicitly stated in the counsel-approved underlying agreement; do not infer them. Provide a dated receipt for every settled installment and a final statement of account.

Customer acknowledgement/signature/date [ ] | Company signatory/date [ ].

## 5. Wallet funding / deposit record

Customer [ ] | Wallet ID (masked) [ ] | Funding transaction ID [ ] | Amount ₦[ ] | Funding source/channel [ ] | Provider reference [ ] | Initiated [ ] | Settled [ ] | Status [pending/settled/failed/reversed] | Ledger entry [ ].

This record confirms only the state shown. Funds are not available for trading or withdrawal until settlement and required checks complete. Fees, limits, safeguarding/custody arrangements, reversals, complaints, and any restrictions must be disclosed in the wallet terms. A wallet balance is not a bank deposit unless the relevant licensed institution and product terms establish that status.

## 6. Withdrawal / payout instruction and confirmation

Customer [ ] | Withdrawal ID [ ] | Requested amount ₦[ ] | Fees ₦[ ] | Net payout ₦[ ] | Destination bank/account (masked) [ ] | Beneficiary verification [ ] | Requested [ ] | Approved [ ] | Provider reference [ ] | Status [requested/under review/paid/failed/reversed] | Settled date [ ].

Customer authorises the payout to the verified destination stated above. A request or approval is not proof of payment. Issue a payout confirmation only after provider settlement; if failed or reversed, record the reason and return the amount to the correct ledger balance. Include the complaint/reconciliation reference [ ].

## 7. Livestock / farm asset purchase or sale confirmation

Trade ID [ ] | Buyer [ ] | Seller [ ] | Asset type/breed/description [ ] | Quantity [ ] | Unit price ₦[ ] | Gross amount ₦[ ] | Fees [ ] | Total/net amount [ ] | Market quote timestamp/source [ ] | Quote validity [ ] | Settlement state [ ] | Delivery/custody location [ ] | Inspection/health/ownership records [ ] | Delivery date and acceptance [ ].

The parties agree to the stated quantity, price, fees, settlement method, delivery/custody arrangements, inspection period, and dispute process. A displayed market price is indicative unless the trade is accepted and matched under the platform’s rules. No guaranteed profit, resale price, liquidity, or appreciation is promised. Identify who owns the asset at each stage, who bears loss/death/illness risk, insurance and veterinary responsibilities, and whether the transaction is a physical asset sale or a simulated/paper trade. Do not issue a live trade document for a simulation.

Buyer signature/acceptance [ ] | Seller signature/acceptance [ ] | Platform record [ ].

## 8. Loan application and offer summary

Applicant [ ] | Application ID [ ] | Lender legal entity and licence/status [verified] | Principal ₦[ ] | Purpose [ ] | Term [ ] | Rate and whether fixed/variable [ ] | APR/effective cost [ ] | All fees [ ] | Total repayment ₦[ ] | Repayment schedule [ ] | Security/guarantor [ ] | Cooling-off/cancellation rights [counsel-approved] | Default/cure and collections terms [ ].

This is an offer summary only until accepted and accompanied by a full lender-approved loan agreement and required disclosures. Do not offer, approve, disburse, or collect on a loan until the lender’s regulatory authority, affordability checks, privacy basis, credit reporting obligations, and enforceability have been verified. Customer acceptance [ ] | Lender authorised signatory [ ] | Date [ ].

## 9. Rental / short-stay booking agreement

Host/owner [ ] | Guest/tenant [ ] | Property/unit [ ] | Booking ID [ ] | Stay dates/times [ ] | Occupancy limit [ ] | Rent ₦[ ] | Deposit ₦[ ] | Fees/taxes ₦[ ] | Total ₦[ ] | Payment state [ ] | Cancellation/refund terms [ ] | Check-in/out and inventory [ ] | House rules [ ] | Damage/inspection process [ ] | Emergency contact [ ].

The parties agree to the dates, price, occupancy, rules, cancellation, refund, damage, access, and complaint terms attached. This booking confirmation does not create a longer tenancy or property interest unless the separately signed instrument expressly says so. Applicable tenancy, hospitality, safety, and consumer rules must be reviewed for the location and stay type.

Guest signature/acceptance [ ] | Host/authorised agent [ ].

## 10. Service / workforce engagement agreement

Company [ ] | Worker/contractor [ ] | Role/service [ ] | Start/end dates [ ] | Duties and deliverables [ ] | Fee/pay and payment dates [ ] | Expenses [ ] | Confidentiality/data handling [ ] | IP ownership/licence [ ] | Safety and conduct [ ] | Termination/notice [ ] | Dispute route [ ].

This template is not a substitute for an employment contract where the relationship is employment. Counsel/HR must classify the relationship and add statutory employment, tax, pension, insurance, workplace safety, and other required terms. Both parties sign/date [ ].

## 11. Course / learning service enrolment terms

Learner [ ] | Course [ ] | Access period [ ] | Fee ₦[ ] | Payment status [ ] | Course content/licence [ ] | Completion/certificate criteria [ ] | Refund/cancellation terms [ ] | Accessibility/support channel [ ].

Course access and any certificate are subject to the stated completion criteria. Do not imply accreditation or professional recognition unless verified and expressly identified. Learner consent/date [ ] | Provider [ ].

## 12. Refund, reversal, cancellation, or dispute record

Case ID [ ] | Original transaction/document ID [ ] | Customer [ ] | Reason/category [ ] | Amount requested ₦[ ] | Amount approved ₦[ ] | Decision authority [ ] | Evidence [ ] | Decision and rationale [ ] | Ledger reversal/refund reference [ ] | Status [ ] | Customer notified at [ ] | Appeal/complaint route [ ].

Record the original transaction; never delete it. Use linked reversal entries. State whether the amount is requested, approved, initiated, settled, or failed. Attach customer communication and provider evidence.

## 13. Final statement of account / completion certificate

Customer [ ] | Agreement/transaction [ ] | Asset/plot [ ] | Opening amount ₦[ ] | Itemised settled payments [dates, references, amounts] | Approved charges [ ] | Credits/refunds [ ] | Closing balance ₦[ ] | Completion conditions [ ] | Issued date [ ].

This statement reflects the platform ledger as of [timestamp] and is subject to correction of proven errors. It does not replace a deed, title registration, lender release, or other formal instrument required by law. Prepared by [ ] | Reviewed by [ ].

## Implementation checklist for the application

1. Create a document registry with immutable document ID, template/version, linked customer and transaction IDs, generated timestamp, status, file hash, signer/consent evidence, and audit history.
2. Generate a document only from verified server-side transaction data. Keep money amounts in integer kobo; render NGN values from the ledger.
3. Use explicit states: draft → presented → consented/signed → pending settlement → settled/completed, with cancelled/failed/reversed/disputed branches.
4. Do not unlock plot allocation, wallet withdrawal, trade ownership, loan disbursement, or payout based solely on a browser event or uploaded screenshot.
5. Require role-based approvals, maker-checker review for manual adjustments, idempotent provider references, reconciliation, and append-only ledger/audit events.
6. Encrypt personal data, restrict document access, redact bank details, define retention/deletion rules, and log downloads.
7. Store counsel-approved final templates separately from drafts. Keep versioned acceptance records so later edits do not alter an existing agreement.
8. Test duplicate callbacks, partial payments, failed/reversed payouts, mismatched references, expired offers, unsigned documents, and disputed transactions before production.

## Required business/legal inputs before finalisation

- Exact legal entity name, RC number, registered address, authorised signatories, and customer support/complaints channels.
- Verified property ownership/title and each estate’s survey, approvals, disclosures, plot inventory, fees, and completion process.
- Whether farm trading is physical asset sale, agency/custody, or simulated trading; verified supply, custody, veterinary and loss-risk rules.
- Payment provider and licensed financial partners; wallet custody model, settlement/reversal/withdrawal terms, fees, limits, and KYC/AML controls.
- Loan provider identity/licence and final lending terms; rental operating model; workforce classification; course accreditation claims.
- Counsel-approved governing law, dispute resolution, privacy notice, electronic signature process, retention policy, and all required consumer disclosures.
