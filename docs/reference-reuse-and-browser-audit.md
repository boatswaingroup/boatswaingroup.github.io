# Foundation reuse and reference website audit

## Permission and source handling

The project owner has explicitly authorized reuse of the requested foundation repository, `demtaiwo1-eng/Winning-game-`. Keep its upstream repository untouched. The import helper adds a snapshot under `foundation/Winning-game/` in a separate branch so the existing Boatswain website is not overwritten.

Because the upstream repository does not declare a licence, retain its existing notices and obtain/retain the rights-holder's permission record with the project. Review every dependency, workflow, secret reference, data file and deployment target before running imported code. Never import production credentials, customer records or secrets.

## Import the foundation snapshot

1. Clone `https://github.com/boatswaingroup/boatswaingroup.github.io.git`.
2. From the destination repository root, run:

```bash
bash scripts/import-winning-game-foundation.sh
```

3. The script shallow-clones the upstream `main` branch, copies tracked working-tree content (including dotfiles) into `foundation/Winning-game/`, excludes Git internals, dependency caches and build outputs, creates branch `foundation/import-winning-game`, commits and pushes it.
4. Review the imported tree and open a pull request. Do not run its workflows or application until the security and compatibility review is complete.

The script refuses to overwrite an existing foundation directory and does not rewrite the destination repository history.

## Browser-based public website assessment

The Playwright audit script is `scripts/audit-reference-site.mjs`. It crawls same-host public pages, captures full-page screenshots, and extracts headings, navigation, page metadata, form field structure, image references, link structure and text excerpts.

Install and run:

```bash
npm install --save-dev playwright
npx playwright install chromium
node scripts/audit-reference-site.mjs
```

Optional environment variables:

- `REFERENCE_URL` — defaults to `https://www.boatswainproperties.com`.
- `AUDIT_OUT` — defaults to `./reference-audit`.
- `MAX_PAGES` — maximum pages to visit; defaults to 80.
- `PAGE_DELAY_MS` — delay between pages; defaults to 1200 ms.
- `TINYFISH_CDP_URL` — optional TinyFish Browser CDP endpoint. If supplied, the script connects to that remote Chromium session using Playwright; otherwise it launches local Chromium.

TinyFish Browser supports Playwright/Puppeteer/CDP control of a managed Chromium session. See [TinyFish Browser](https://www.tinyfish.ai/browser) for current setup, API access and pricing. A TinyFish account/API session and its CDP URL are not included in this repository; do not commit API keys or session URLs.

Output is written to `reference-audit/`:
- `screenshots/` — visual page captures.
- `pages/` — structured JSON page observations.
- `audit-report.json` — crawl summary.
- `AUDIT-README.md` — output guide.

The crawler stays on the starting hostname, checks robots.txt, rate-limits requests, and does not sign in, bypass authentication, defeat CAPTCHAs, submit forms, or access restricted/private content. It records public form structure only; it does not transmit submitted data. If the official website requires an authenticated session for a page, obtain authorized access and review it manually or use an explicitly authorized account session—never circumvent the site's controls.

## Turning the audit into a Boatswain implementation

Use the report and screenshots to create a page-by-page design inventory: page purpose, layout, navigation, typography, colours, spacing, responsive behavior, components, content hierarchy, forms and customer journeys. Rebuild those patterns as an original maintainable Boatswain implementation. Reuse logos, photographs, text and other assets only where Boatswain owns them or has permission to reuse them. Zillow is a feature/UX reference only; do not copy its source code, brand assets, listing data or protected content.

The audit script is a capture/assessment tool, not a one-click website copier or production readiness guarantee. Human review is required for accuracy, accessibility, privacy, security and rights clearance.
