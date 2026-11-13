# Foundation build verification

The copied EPHINTA web client is a source foundation only; its event-planning screens are not the Boatswain product UI.

The CI quality workflow validates:
1. The Boatswain static catalogue markup, six property cards, contact links, unique IDs and filtering handler.
2. The copied React web application's dependency install, production build and web unit tests.

Run the web checks manually from the copied source project:

```bash
cd foundation/Winning-game/eventsss123/eventsss-main
npm ci
npm run build:web
npm run test -w apps/web
```

The API build and database-backed tests are intentionally separate: they require a reviewed Boatswain schema migration, database configuration and test data. Do not point source event workflows at production data.
