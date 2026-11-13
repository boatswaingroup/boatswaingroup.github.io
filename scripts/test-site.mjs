import fs from 'node:fs/promises';
import assert from 'node:assert/strict';

const html = await fs.readFile(new URL('../index.html', import.meta.url), 'utf8');
const required = [
  'Boatswain Properties',
  'GreenFarm Settlement, Omi Adio',
  'Moniya Gateway Estate',
  'Lagos-Ibadan Expressway Plots',
  'Boatswain Royal Estate, Ido',
  'Ago-Are Commercial Plots',
  'Ona Ara Residential Plots',
  'property-specific deposit',
  'wa.me/2348033635755',
  'boatswainproperties@gmail.com',
  'media/boatlogo.png',
  'locationFilter',
  'minPrice',
  'maxPrice',
  'property-detail',
  'paymentPlanner',
  'detailEnquire',
  'customerPaymentsPanel',
  'customerPaymentPlans',
  'customerLedger',
  '/api/me/payment-plans',
  'loadCustomerFinancials',
  'Verified payment ledger',
  'forgotPasswordButton',
  'passwordResetRequestForm',
  'passwordResetConfirmForm',
  'passwordResetToken',
  '/api/auth/password-reset/request',
  '/api/auth/password-reset/confirm',
  'passwordResetEmailSender',
  'one-time',
  'Buyer due diligence',
  'unverified reference information',
  'availabilityFilter',
  'menuToggle',
  'resetFilters',
  'aria-live="polite"',
  'Your written offer must state the exact deposit'
];
for (const value of required) assert.ok(html.includes(value), `Missing expected site content: ${value}`);
assert.equal((html.match(/class="property"/g) || []).length, 6, 'Expected six property cards');
assert.ok(html.includes('window.open(url'), 'Enquiry forms should open WhatsApp for user-reviewed sending');
assert.ok(html.includes('Not currently open for payment'), 'Coming-soon listing must not imply payment availability');
assert.ok(html.includes('This website does not store the form'), 'Form data handling must be disclosed');
console.log('Boatswain static-site checks passed: six property cards, enquiry handoff, contact details and disclosures.');
