# Boatswain Property API

A separate Node/Express + PostgreSQL API for customer accounts, public estate/plot reads, enquiries and temporary plot holds.

## Local setup

1. Use Node.js 22+ and PostgreSQL 14+.
2. Copy `.env.example` to `.env` and set `DATABASE_URL`, `JWT_SECRET` (32+ random characters), `CORS_ORIGIN`, and `PORT`.
3. Run `npm install`.
4. Run `npm run db:generate` and `npx prisma migrate dev --name init`.
5. Run `npm run dev`.

## Routes

- `GET /health` — process liveness.
- `GET /ready` — checks PostgreSQL connectivity.
- `POST /api/auth/register`, `POST /api/auth/login` — customer account and short-lived bearer token.
- `GET /api/me` — authenticated customer profile.
- `GET /api/estates`, `GET /api/estates/:slug/plots` — published inventory.
- `POST /api/enquiries` — validates and stores an enquiry.
- `GET /api/staff/enquiries` — staff-only enquiry queue.
- `POST /api/plots/:plotId/reservations` — atomic 20-minute plot hold, authenticated; no payment is collected.

## Launch limitations

This is an initial backend foundation, not a production payment system. It deliberately does not collect the requested ₦350,000 deposit or mark any plot as sold. Before live use, add email/phone verification, password reset and refresh-token/session revocation, audit logging, privacy/retention controls, CSRF strategy if cookies are adopted, reservation expiry worker, staff account provisioning, payment-provider integration with signed webhook verification, ledger and receipt generation, database backups, monitoring, security review and end-to-end tests. Create verified estate and plot records only after the business supplies approved plot inventory and legal documentation.

Never commit `.env`, credentials, customer data or real payment secrets.
