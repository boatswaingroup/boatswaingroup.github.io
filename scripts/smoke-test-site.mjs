import { chromium } from 'playwright';
import { pathToFileURL } from 'node:url';
import path from 'node:path';

const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage();
  await page.goto(pathToFileURL(path.resolve('index.html')).href);
  await page.waitForLoadState('domcontentloaded');
  if (await page.locator('.property').count() !== 6) throw new Error('Expected six property cards');
  await page.locator('#search').fill('Moniya');
  if (await page.locator('.property:visible').count() !== 1) throw new Error('Property search did not filter to Moniya');
  await page.locator('#search').fill('');
  await page.locator('#type').selectOption('Agricultural land');
  if (await page.locator('.property:visible').count() !== 1) throw new Error('Property type filter did not return one agricultural listing');
  await page.locator('#type').selectOption('');
  await page.locator('[data-modal="account"]').first().click();
  await page.locator('#accountForm [name="name"]').fill('Browser Test Customer');
  await page.locator('#accountForm [name="email"]').fill('browser-test@example.test');
  await page.locator('#accountForm [name="phone"]').fill('+2348030000000');
  await page.locator('#accountForm input[type="checkbox"]').check();
  const popupPromise = page.waitForEvent('popup');
  await page.locator('#accountForm button[type="submit"]').click();
  const popup = await popupPromise;
  await popup.waitForLoadState('domcontentloaded').catch(() => {});
  if (!popup.url().includes('wa.me/2348033635755')) throw new Error('Enquiry did not open the published Boatswain WhatsApp number');
  await popup.close();
  console.log('Browser smoke test passed: property search, type filter, registration-interest form and WhatsApp handoff.');
} finally {
  await browser.close();
}
