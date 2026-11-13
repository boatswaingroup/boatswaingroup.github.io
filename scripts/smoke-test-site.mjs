import { chromium } from 'playwright';
import { pathToFileURL } from 'node:url';
import path from 'node:path';

const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage();
  await page.addInitScript(() => { window.open = (url) => { window.__boatswainOpenedUrl = String(url); return null; }; });
  await page.goto(pathToFileURL(path.resolve('index.html')).href);
  await page.waitForLoadState('domcontentloaded');
  if (await page.locator('.property').count() !== 6) throw new Error('Expected six property cards');
  await page.locator('#search').fill('Moniya');
  if (await page.locator('.property:visible').count() !== 1) throw new Error('Property search did not filter to Moniya');
  await page.locator('#search').fill('');
  await page.locator('.property').filter({ hasText: 'Boatswain Royal Estate, Ido' }).locator('button[data-open-property-detail]').click();
  if (!(await page.locator('#property-detail').isVisible())) throw new Error('Property detail view did not open');
  if (!(await page.locator('#detailTitle').innerText()).includes('Boatswain Royal Estate')) throw new Error('Property detail title was not populated');
  if (!(await page.locator('#detailDepositNotice').innerText()).includes('unverified reference information')) throw new Error('Reference deposit must be clearly marked unverified');
  await page.locator('#planTotal').fill('5000000');
  await page.locator('#planDeposit').fill('500000');
  await page.locator('#planMonths').selectOption('6');
  await page.locator('#paymentPlanner button[type="submit"]').click();
  if (!(await page.locator('#planResult').innerText()).includes('₦750,000')) throw new Error('Illustrative payment planner calculated an incorrect monthly amount');
  await page.locator('#planDeposit').fill('6000000');
  await page.locator('#paymentPlanner button[type="submit"]').click();
  if (!(await page.locator('#planResult').innerText()).includes('cannot exceed')) throw new Error('Payment planner did not reject a deposit greater than the total');
  await page.locator('#detailEnquire').click();
  if (!(await page.locator('#accountModal').isVisible())) throw new Error('Property enquiry did not open the customer enquiry modal');
  if (!(await page.locator('#accountForm [name="message"]').inputValue()).includes('Boatswain Royal Estate')) throw new Error('Property-specific enquiry message was not populated');
  await page.locator('#accountModal [data-close]').click();
  await page.locator('#backToProperties').click();
  if (!(await page.locator('#properties').isVisible())) throw new Error('Back-to-properties action did not return to catalogue');
  await page.locator('#type').selectOption('Agricultural land');
  if (await page.locator('.property:visible').count() !== 1) throw new Error('Property type filter did not return one agricultural listing');
  await page.locator('#type').selectOption('');
  await page.locator('#locationFilter').selectOption('ido');
  if (await page.locator('.property:visible').count() !== 1) throw new Error('Location filter did not return the Ido listing');
  await page.locator('#locationFilter').selectOption('');
  await page.locator('#availabilityFilter').selectOption('coming-soon');
  if (await page.locator('.property:visible').count() !== 1) throw new Error('Availability filter did not return the coming-soon listing');
  await page.locator('#availabilityFilter').selectOption('');
  await page.locator('#minPrice').fill('2500000');
  if (await page.locator('.property:visible').count() !== 4) throw new Error('Minimum price filter did not return four matching listings');
  await page.locator('#minPrice').fill('');
  await page.locator('#maxPrice').fill('2500000');
  if (await page.locator('.property:visible').count() !== 2) throw new Error('Maximum price filter did not return two matching listings');
  await page.locator('#maxPrice').fill('');
  await page.locator('#sort').selectOption('high');
  if (!(await page.locator('.property:visible h3').first().innerText()).includes('GreenFarm')) throw new Error('Price sorting did not reorder the cards');
  await page.locator('#resetFilters').click();
  if (await page.locator('.property:visible').count() !== 6) throw new Error('Clear filters did not restore all six listings');
  await page.locator('#search').fill('no matching estate');
  if (await page.locator('#noProperties').isHidden()) throw new Error('Empty search state was not displayed');
  await page.locator('#search').fill('');
  await page.setViewportSize({ width: 390, height: 844 });
  if (!(await page.locator('#menuToggle').isVisible())) throw new Error('Mobile navigation toggle is not visible');
  await page.locator('#menuToggle').click();
  if (!(await page.locator('#primaryNav a[href="#properties"]').isVisible())) throw new Error('Mobile navigation did not open');
  await page.locator('#primaryNav a[href="#properties"]').click();
  if (await page.locator('#primaryNav').isVisible()) throw new Error('Mobile navigation did not close after selection');
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.locator('[data-modal="account"]').first().click();
  if (!(await page.locator('#accountUnavailable').isVisible())) throw new Error('Expected safe enquiry-only state while API URL is unset');
  if (await page.locator('#accountAuth').isVisible()) throw new Error('Customer login must not appear before API configuration');
  await page.locator('#accountForm [name="name"]').fill('Browser Test Customer');
  await page.locator('#accountForm [name="email"]').fill('browser-test@example.test');
  await page.locator('#accountForm [name="phone"]').fill('+2348030000000');
  await page.locator('#accountForm input[type="checkbox"]').check();
  await page.locator('#accountForm button[type="submit"]').click();
  const openedUrl = await page.evaluate(() => window.__boatswainOpenedUrl || '');
  if (!openedUrl.startsWith('https://wa.me/2348033635755?text=')) throw new Error('WhatsApp enquiry handoff did not generate the expected destination URL');
  const dashboardPage = await browser.newPage();
  await dashboardPage.addInitScript(() => {
    const originalQuerySelector = Document.prototype.querySelector;
    Document.prototype.querySelector = function (selector) {
      if (selector === 'meta[name="boatswain-api-url"]') return { content: 'https://boatswain-api.test' };
      return originalQuerySelector.call(this, selector);
    };
  });
  await dashboardPage.route('https://boatswain-api.test/**', async route => {
    const url = new URL(route.request().url());
    const method = route.request().method();
    let payload = {};
    if (url.pathname === '/api/auth/login' && method === 'POST') {
      payload = { accessToken: 'mock-session-token', customer: { id: 'customer-1', fullName: 'Browser Test Customer', email: 'customer@example.test', role: 'CUSTOMER' } };
    } else if (url.pathname === '/api/me') {
      payload = { customer: { id: 'customer-1', fullName: 'Browser Test Customer', email: 'customer@example.test', phone: '+2348030000000', role: 'CUSTOMER' } };
    } else if (url.pathname === '/api/me/reservations') {
      payload = { reservations: [] };
    } else if (url.pathname === '/api/estates') {
      payload = { estates: [] };
    } else if (url.pathname === '/api/me/payment-plans') {
      payload = { paymentPlans: [{
        status: 'ACTIVE', totalPriceKobo: '500000000', depositDueKobo: '50000000',
        reservation: { plot: { plotCode: 'A-001', sizeSqm: 300, estate: { name: 'Boatswain Royal Estate' } } },
        installments: [{ sequenceNumber: 1, amountKobo: '75000000', dueAt: '2026-12-13T00:00:00.000Z', status: 'DUE' }],
        ledgerEntries: [{ description: 'Verified deposit', entryType: 'DEPOSIT', direction: 'CREDIT', amountKobo: '50000000', createdAt: '2026-11-13T12:00:00.000Z' }]
      }] };
    } else if (url.pathname === '/api/auth/logout' && method === 'POST') {
      payload = { ok: true, message: 'This session has been revoked' };
    } else {
      return route.fulfill({ status: 404, contentType: 'application/json', body: JSON.stringify({ error: 'Unexpected mocked API request: ' + method + ' ' + url.pathname }) });
    }
    return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(payload) });
  });
  await dashboardPage.goto(pathToFileURL(path.resolve('index.html')).href);
  await dashboardPage.locator('[data-modal="account"]').first().click();
  if (!(await dashboardPage.locator('#accountAuth').isVisible())) throw new Error('Configured API should expose secure customer login');
  await dashboardPage.locator('#loginForm [name="email"]').fill('customer@example.test');
  await dashboardPage.locator('#loginForm [name="password"]').fill('Correct-Horse-Battery-42!');
  await dashboardPage.locator('#loginForm button[type="submit"]').click();
  await dashboardPage.locator('#customerPaymentPlans .financial-plan').waitFor({ state: 'visible' });
  if (!(await dashboardPage.locator('#customerPaymentPlans').innerText()).includes('₦5,000,000.00')) throw new Error('Customer dashboard did not display the agreed payment-plan total');
  if (!(await dashboardPage.locator('#customerPaymentPlans').innerText()).includes('Instalment 1')) throw new Error('Customer dashboard did not display the instalment schedule');
  if (!(await dashboardPage.locator('#customerLedger').innerText()).includes('+₦500,000.00')) throw new Error('Customer dashboard did not display the verified ledger credit');
  await dashboardPage.locator('#logoutButton').click();
  await dashboardPage.waitForFunction(() => document.getElementById('authMessage')?.textContent.includes('signed out securely'));
  if (!(await dashboardPage.locator('#authMessage').innerText()).includes('signed out securely')) throw new Error('Customer dashboard sign-out did not complete');
  await dashboardPage.close();
  console.log('Browser smoke test passed: catalogue filters, property details, payment planner, tailored enquiry, mobile navigation, WhatsApp handoff and authenticated payment-plan/ledger dashboard rendering.');
} finally {
  await browser.close();
}
