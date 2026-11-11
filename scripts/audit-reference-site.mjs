#!/usr/bin/env node
/**
 * Public-site browser audit for Boatswain Properties.
 *
 * Usage:
 *   npm install --save-dev playwright
 *   npx playwright install chromium
 *   node scripts/audit-reference-site.mjs
 *
 * Optional:
 *   REFERENCE_URL=https://www.boatswainproperties.com
 *   AUDIT_OUT=./reference-audit
 *   MAX_PAGES=80
 *   PAGE_DELAY_MS=1200
 *
 * This script visits publicly accessible pages only. It does not log in,
 * bypass access controls, defeat CAPTCHAs, submit forms, or copy protected
 * material. Review captured assets/content and confirm rights before reuse.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';

const startUrl = new URL(process.env.REFERENCE_URL || 'https://www.boatswainproperties.com');
const outDir = path.resolve(process.env.AUDIT_OUT || 'reference-audit');
const maxPages = Math.max(1, Number(process.env.MAX_PAGES || 80));
const delayMs = Math.max(500, Number(process.env.PAGE_DELAY_MS || 1200));
const allowedHost = startUrl.hostname.replace(/^www\./, '');
const queue = [startUrl.href];
const queued = new Set(queue);
const visited = new Set();
const report = { source: startUrl.href, startedAt: new Date().toISOString(), pages: [], assets: [], errors: [], notes: [
  'Publicly accessible pages only. No authentication or access-control bypass.',
  'Screenshots and extracted observations are for redesign/reference; verify intellectual-property and image rights before reuse.'
] };

await fs.mkdir(path.join(outDir, 'screenshots'), { recursive: true });
await fs.mkdir(path.join(outDir, 'pages'), { recursive: true });
await fs.mkdir(path.join(outDir, 'assets'), { recursive: true });

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: 1440, height: 1000 },
  deviceScaleFactor: 1,
  ignoreHTTPSErrors: false
});
const page = await context.newPage();
page.setDefaultTimeout(20000);

function safeName(url) {
  const u = new URL(url);
  const raw = (u.pathname === '/' ? 'home' : u.pathname).replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '');
  return (raw || 'page').slice(0, 90);
}
function isAllowed(url) {
  try {
    const u = new URL(url);
    return ['http:', 'https:'].includes(u.protocol) && u.hostname.replace(/^www\./, '') === allowedHost;
  } catch { return false; }
}
function wait(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }

try {
  while (queue.length && visited.size < maxPages) {
    const url = queue.shift();
    if (visited.has(url)) continue;
    visited.add(url);
    try {
      const response = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 });
      await page.waitForLoadState('networkidle', { timeout: 8000 }).catch(() => {});
      await page.screenshot({ path: path.join(outDir, 'screenshots', safeName(url) + '.png'), fullPage: true }).catch(() => {});
      const data = await page.evaluate(() => {
        const clean = s => (s || '').replace(/\\s+/g, ' ').trim();
        const links = [...document.querySelectorAll('a[href]')].map(a => ({
          text: clean(a.innerText || a.getAttribute('aria-label')),
          href: a.href
        }));
        const images = [...document.images].map(i => ({
          src: i.currentSrc || i.src,
          alt: i.alt || '',
          width: i.naturalWidth,
          height: i.naturalHeight
        }));
        const forms = [...document.forms].map(f => ({
          action: f.action,
          method: (f.method || 'get').toUpperCase(),
          fields: [...f.querySelectorAll('input,select,textarea,button')].map(el => ({
            tag: el.tagName.toLowerCase(),
            type: el.type || '',
            name: el.name || '',
            label: clean(el.labels?.[0]?.innerText || el.getAttribute('aria-label') || el.placeholder),
            required: !!el.required
          }))
        }));
        return {
          url: location.href,
          title: document.title,
          description: document.querySelector('meta[name="description"]')?.content || '',
          canonical: document.querySelector('link[rel="canonical"]')?.href || '',
          headings: [...document.querySelectorAll('h1,h2,h3')].map(h => ({ level: h.tagName, text: clean(h.innerText) })),
          nav: [...document.querySelectorAll('header nav a, nav a')].map(a => ({ text: clean(a.innerText), href: a.href })),
          links, images, forms,
          textExcerpt: clean(document.body?.innerText).slice(0, 14000),
          stylesheets: [...document.querySelectorAll('link[rel="stylesheet"]')].map(x => x.href),
          backgroundImages: [...document.querySelectorAll('*')].map(el => getComputedStyle(el).backgroundImage)
            .filter(x => x && x !== 'none').slice(0, 100)
        };
      });
      const filename = safeName(url) + '.json';
      await fs.writeFile(path.join(outDir, 'pages', filename), JSON.stringify(data, null, 2));
      report.pages.push({
        url, status: response?.status() ?? null, title: data.title,
        headings: data.headings, nav: data.nav, forms: data.forms,
        imageCount: data.images.length, linkCount: data.links.length,
        snapshot: 'pages/' + filename, screenshot: 'screenshots/' + safeName(url) + '.png'
      });
      for (const asset of data.images) {
        if (asset.src && isAllowed(asset.src)) report.assets.push({ type: 'image', ...asset });
      }
      for (const link of data.links) {
        if (!link.href || !isAllowed(link.href)) continue;
        const normalized = new URL(link.href);
        normalized.hash = '';
        const next = normalized.href.replace(/\/$/, '') || startUrl.origin;
        if (!visited.has(next) && !queued.has(next)) {
          queued.add(next);
          queue.push(next);
        }
      }
      console.log('Audited', url, response?.status() ?? 'no status');
    } catch (error) {
      report.errors.push({ url, error: String(error) });
      console.error('Failed', url, String(error));
    }
    await wait(delayMs);
  }
} finally {
  await browser.close();
}
report.finishedAt = new Date().toISOString();
report.visitedCount = visited.size;
report.queuedCount = queue.length;
report.assets = [...new Map(report.assets.map(a => [a.src, a])).values()];
await fs.writeFile(path.join(outDir, 'audit-report.json'), JSON.stringify(report, null, 2));
await fs.writeFile(path.join(outDir, 'AUDIT-README.md'), [
  '# Reference-site audit output',
  '',
  'Generated by scripts/audit-reference-site.mjs.',
  '',
  '- screenshots/: full-page visual captures of publicly accessible pages.',
  '- pages/: extracted page structure, headings, navigation, forms, images and text excerpts.',
  '- audit-report.json: crawl summary and internal image asset references.',
  '',
  'This output is an assessment aid, not permission to reproduce protected copy, photographs, branding or proprietary interaction design. Confirm ownership/licensing before reuse.',
  ''
].join('\n'));
console.log('Audit complete:', path.join(outDir, 'audit-report.json'));
