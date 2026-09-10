# MKT-BOT

Affiliate operations console for Hopper SE. It combines a clean modern dashboard with compact, classic operations tables and implements the supplied account, subscription, audit, scheduling, health, SSO, and reporting requirements.

## Included

- Responsive Next.js App Router admin UI in Vietnamese/English
- Account dashboard with health/issue summaries, search, filters, CSV import (5 MB max), add/edit, per-channel toggles, empty states, and pagination
- Subscription network with composite identity (`userId + channel`), scheduling, filters, create flow, and status controls
- Interaction history with filters, pagination, error detail, CSV, and dependency-free Excel-compatible export
- System architecture, live automation-run history, and safe dry-run control-plane view
- Google Workspace SSO wiring via Auth.js with optional domain restriction
- Prisma data model for affiliate accounts, partners, interactions, and automation runs
- Protected Vercel cron endpoints with authorization, execution records, dry-run planning, and Brevo reporting
- Live Neon persistence through the account, subscription, and history REST endpoints

## Database note

The source brief says “Neon DB - MySQL”. Neon is a serverless PostgreSQL provider, so this project uses Prisma's `postgresql` connector. If MySQL is a hard requirement, use a MySQL host such as PlanetScale/Aiven and change the datasource provider and deployment adapter.

## Responsible provider boundary

The control plane intentionally does **not** implement CAPTCHA bypass, bulk fake-account creation, or browser-driven artificial engagement. Those operations are unsafe and typically violate platform rules. Scheduled jobs select and record eligible work, then hand it to approved official-API adapters or an operator. `AUTOMATION_DRY_RUN=true` is the default.

## Run locally

1. Copy `.env.example` to `.env.local` and configure Google OAuth, Neon, and secrets.
2. Install dependencies: `npm install` (on Windows PowerShell with restricted script execution, use `npm.cmd install`).
3. Generate the client and migrate: `npm run db:generate`, then `npm run db:migrate`.
4. Start: `npm run dev` and open `http://localhost:3000`.


## Cron deployment

`vercel.json` contains only daily or weekly review jobs so it is compatible with the Vercel Hobby cron limit. Schedules are UTC; the dashboard and run metadata use Asia/Bangkok.

Set `CRON_SECRET` in Vercel. Vercel sends it as a Bearer token. Keep `AUTOMATION_DRY_RUN=true`; the supplied jobs only create auditable review records and do not make social-network actions.

Run `npx prisma migrate deploy` during deployment to apply committed Neon migrations.

## Security choices

- Google SSO avoids local passwords.
- Admin access can be limited using `AUTH_ALLOWED_DOMAIN`.
- Cron endpoints require a shared secret.
- Social credentials use AES-256-GCM helpers and a managed encryption key, not SHA-256. Hashing would make credentials irrecoverable for authorized sign-in and provides no suitable secret-at-rest workflow.
- Social secrets are never returned by list endpoints or rendered in the UI.
