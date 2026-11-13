# Boatswain Properties reference-site audit

**Audit date:** 2026-11-11  
**Source:** https://www.boatswainproperties.com/  
**Method:** Playwright/Chromium, public pages only, robots.txt checked, no login or form submission.  
**Result:** 20 pages visited, 20 HTTP 200 responses, zero crawl errors. Seven additional links remained queued when the configured 20-page limit was reached.

The complete screenshots and JSON page snapshots are retained as the GitHub Actions artifact named `boatswain-reference-audit` on the repository-checks workflow run. The artifact is temporary and has a 14-day retention period.

## Observed information architecture

- Home, About, Services, Properties and Contact.
- Customer registration, login and password-reset routes.
- Property catalogue with six visible listings:
  - GreenFarm Settlement, Omi Adio
  - Moniya Gateway Estate
  - Lagos-Ibadan Expressway Plots
  - Boatswain Royal Estate, Ido
  - Ago-Are Commercial Plots
  - Ona Ara Residential Plots
- Property filters for keyword, location, property type, availability and minimum/maximum price.
- Individual property detail pages.
- A property-interest/subscribe flow with customer details, selected property, interest type, referral source, payment plan and account password fields.
- The site describes full-payment and six-month plan options.
- Main page presents 300 SQM, 500 SQM and 1-acre farm settlement options, estate features, location information and a crypto-payment section.

## Important implementation observations

1. Public registration and login pages are present. The browser audit only inspected their form structure; it did not submit credentials or test account creation.
2. The property-interest form is not proof that a payment has been made or that a plot has been reserved.
3. The GreenFarm detail page explicitly marks some property information as demo placeholder content. Verify all plot dimensions, prices, titles, location claims, infrastructure and availability with the business before publishing them as facts.
4. The website shows a six-month plan, while the Boatswain project brief separately specifies a ₦350,000 deposit. The precise deposit rule, whether it applies to every property, and how the balance is scheduled must be confirmed and implemented server-side.
5. The home page advertises a crypto payment option. Do not activate this or any other payment rail without approved business policy, provider credentials, secure server-side verification, reconciliation and refund procedures.
6. The audit captured image references and screenshots for design assessment. It did not download or transfer photographs, fonts, scripts or other protected assets. Reuse only assets Boatswain owns or is licensed to use.

## Foundation reuse decision

The authorized `demtaiwo1-eng/Winning-game-` source is a separate ESS/event-commerce application, not a property-management application. It contains reusable technical patterns worth testing (authentication, payments, vendor marketplace, notifications, API, database migrations and automated tests), but also unrelated event, KYC, Android/iOS and operational workflows. It should be integrated selectively after automated compatibility checks and a security/domain review. Do not enable upstream deployment, signing, backup, account-deactivation or payment workflows in the Boatswain repository by default.

## Next implementation priorities

1. Confirm authoritative property catalogue and exact plot inventory, plot identifiers, prices, dimensions, site plans and availability.
2. Define the ₦350,000 deposit rule and installment schedule for each offering.
3. Build secure customer authentication, admin/finance roles, plot reservation locking and a transaction ledger.
4. Integrate the selected Nigerian payment provider with signed webhook verification and reconciliation; keep secrets out of frontend code.
5. Add legal terms, privacy notices, sale/allocation documents and receipt generation after business/legal review.
6. Test registration, reservation, payment callbacks, refunds, double-booking prevention, document access and admin permissions end-to-end.

This audit describes what was publicly visible during the crawl. It is not a security assessment or confirmation that any live payment or account flow is operational.
