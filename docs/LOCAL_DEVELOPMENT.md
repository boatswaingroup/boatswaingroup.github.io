# Boatswain local development

## Requirements
- Node.js 22+
- Docker Desktop (Windows/macOS) or Docker Engine + Docker Compose v2 (Linux)
- Git

## One-command startup
From the repository root:

```bash
npm install --prefix backend
npm run dev
```

The launcher creates a private local `backend/.env` if one does not exist, starts PostgreSQL 16 with Docker Compose, waits for the database health check, generates Prisma Client, applies checked-in migrations, and starts both application servers.

- Frontend: http://localhost:5173
- API: http://localhost:5000
- API health: http://localhost:5000/health
- API readiness: http://localhost:5000/ready
- PostgreSQL: localhost:5432 (database `boatswain`)

The local database credentials in `docker-compose.yml` are for development only. Never reuse them in staging or production. The generated JWT secret is written to the ignored `backend/.env`; do not commit or share it.

Press Ctrl+C to stop the frontend and API. PostgreSQL remains running with its data volume so the next startup is faster. Stop the database with `docker compose down`; to erase local database data as well, use `docker compose down -v`.

Override ports with `WEB_PORT` and `API_PORT`, and override the database connection with `DATABASE_URL`, if needed.
