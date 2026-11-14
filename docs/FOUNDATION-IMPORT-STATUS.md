# Winning-game foundation import status

- Source repository: https://github.com/demtaiwo1-eng/Winning-game-
- Destination path: `foundation/Winning-game/`
- Destination development branch: `project/boatswain-platform-foundation`
- Source tree snapshot: 3,864 upstream entries (plus this project's import note).
- The original source repository has not been modified.
- The source copy includes the source repository's tracked files and nested assets/dependencies. The package lockfiles remain the reproducible dependency source; do not rely on copied `node_modules` for production builds.
- The imported source is an event-services product. Reuse only reviewed technical patterns; do not ship its EPHINTA branding, event-specific UI, user data, credentials, deployment secrets, mobile signing or unrelated workflows as Boatswain functionality.

The foundation review workflow has previously passed the source project's API checks, web tests, KYC self-test, web build and API build in an isolated checkout. The Boatswain branch's current CI should be re-run against the complete imported snapshot before merge.
