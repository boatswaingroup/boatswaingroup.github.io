# Boatswain Properties reference-site audit

**Audit date:** 2026-11-13  
**Source:** https://www.boatswainproperties.com/  
**Method:** Read-only public-browser review of the homepage, property catalogue and six property detail pages, services, about, contact, subscribe and account route structure. No login, form submission, purchase or payment was performed.

## Company identity and contact information observed

- Company name: Boatswain Nigeria Limited.
- Registration number displayed: RC 942549.
- Trading name: Boatswain Properties & Wood Crafts.
- Tagline: “Invest Today... Own Tomorrow.”
- Operating region: Oyo State, Nigeria.
- Logo reference: https://www.boatswainproperties.com/media/boatlogo.png
- Phone: 08033635755 and 08023882003.
- Email: boatswainproperties@gmail.com.
- WhatsApp: https://wa.me/2348033635755
- Office addresses displayed:
  - 27, Akinpelu Street, Agberu Avenue, Off ICAST, Elebu, Ibadan, Oyo State.
  - 2, Ladoke Akintola Avenue, Off Aare Avenue, New Bodija Estate, Ibadan.

Verify all corporate and contact details with company management before treating them as legally authoritative.

## Public property catalogue observed

| Property | Displayed location | Displayed size | Advertised price range | Publicly stated plan/status |
|---|---|---:|---:|---|
| GreenFarm Settlement, Omi Adio | Omi Adio LGA, Ibadan | 1 acre | ₦3.8m–₦5.8m | Available; full payment or six-month plan |
| Moniya Gateway Estate | Moniya, Ibadan | 300 sqm | ₦2m–₦2.8m | Coming soon; payment plans not currently available |
| Lagos-Ibadan Expressway Plots | Lagos-Ibadan Express Road, Oyo State | 500 sqm | ₦2.8m–₦4.8m | Available; full payment or six-month plan |
| Boatswain Royal Estate, Ido | Ido LGA, Ibadan | 300 sqm | ₦2m–₦2.8m | Listed; full payment or six-month plan |
| Ago-Are Commercial Plots | Ago-Are, Ona Ara LGA | 500 sqm | ₦2.8m–₦4.8m | Listed; full payment or six-month plan |
| Ona Ara Residential Plots | Ona Ara LGA, Ibadan | 500 sqm | ₦2.8m–₦4.8m | Listed; full payment or six-month plan |

These are aggregate advertised ranges and public-page status labels, not guaranteed quotes or real-time stock. The audit did not independently verify plot-by-plot availability, title, survey, allocation or infrastructure claims.

## Payment and customer-account observations

- Full payment and six-month plans are displayed for most listings; Moniya Gateway Estate is explicitly marked as not currently having payment plans available.
- Exact deposit amounts, monthly instalment amounts, interest, fees and total price differences were **not explicitly published** on the pages inspected.
- The public subscribe flow requests name, email, phone, message, property interest, interest type, referral source and payment plan.
- Public registration, login and password-reset routes exist. Their authenticated dashboard functions were not inspected because no account was accessed.
- A homepage crypto-payment reference was observed, but no verified provider, supported asset list, settlement terms or payment procedure was established. Do not implement a crypto payment rail without explicit business approval and legal/provider review.

## Services and agricultural scope observed

The Services page describes estate development, property sales, residential and mixed-use estate plots, farm plots, agricultural investment opportunities, property/project marketing and property advisory. GreenFarm Settlement is the visible one-acre farm settlement offering.

## Routes observed

- https://www.boatswainproperties.com/
- https://www.boatswainproperties.com/about/
- https://www.boatswainproperties.com/services/
- https://www.boatswainproperties.com/properties/
- https://www.boatswainproperties.com/contact/
- https://www.boatswainproperties.com/subscribe/
- https://www.boatswainproperties.com/accounts/register/
- https://www.boatswainproperties.com/accounts/login/
- https://www.boatswainproperties.com/accounts/password-reset/
- https://www.boatswainproperties.com/properties/greenfarm-settlement-omi-adio/
- https://www.boatswainproperties.com/properties/moniya-gateway-estate/
- https://www.boatswainproperties.com/properties/lagos-ibadan-expressway-plots/
- https://www.boatswainproperties.com/properties/boatswain-royal-estate-ido/
- https://www.boatswainproperties.com/properties/ago-are-commercial-plots/
- https://www.boatswainproperties.com/properties/ona-ara-residential-plots/

## Important caveats and implementation rules

1. The public site contains property-specific descriptions and photos. Confirm that every factual claim, image, price, plot size and status remains current before publishing it as a business commitment.
2. A public enquiry or subscribe form is not proof of payment, ownership or a reserved plot.
3. The exact deposit and instalment amounts are unpublished. Do not hard-code the ₦350,000, ₦550,000 or ₦1,100,000 figures found in earlier internal notes as official prices. Remove them from public UI until approved in writing.
4. The six-month plan must be represented by an approved, versioned written offer. The app must not infer monthly instalments from an aggregate advertised price range.
5. No crypto or other payment rail should be activated until the business approves the provider, settlement process, compliance requirements, refunds and reconciliation.
6. Use only company-owned or properly licensed photos, logos, copy and documents. This audit records public references; it does not grant reuse rights.

## Foundation reuse decision

The authorized `demtaiwo1-eng/Winning-game-` source is an ESS/event-services application, not a property-management application. Its React/TypeScript, Express API, PostgreSQL/Prisma, auth, listing/enquiry, payment-ledger, notification and audit patterns may be reusable after review. Event, guest, RSVP, event-booking, EPHINTA brand, audio and unrelated mobile workflows must not be exposed as Boatswain product features without deliberate adaptation. The source repository must remain untouched.

## Next implementation priorities

1. Obtain authoritative estate/plot inventory, plot identifiers, exact dimensions, current availability, price sheets, survey/title evidence and site maps from the company.
2. Approve the deposit and six-month plan policy in writing for each property.
3. Complete API hosting, database production configuration, secure admin provisioning, email delivery, session security and backup/restore.
4. Complete payment-provider selection and sandbox integration with signed webhook verification, idempotency, immutable ledger, reconciliation, refunds and receipts.
5. Complete legal terms, privacy notices, sales/allocation documents and data-retention review.
6. Pass end-to-end tests for registration, plot holds, double-booking prevention, payment events, refunds, document access and staff permissions before launch.

This report records what was publicly visible on 13 November 2026. It is not a title search, legal opinion, security assessment or proof that live payment/account flows are operational.
