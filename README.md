# MKT-BOT

Affiliate operations console for Hopper SE. It combines a clean modern dashboard with compact, classic operations tables and implements the supplied account, subscription, audit, scheduling, health, SSO, and reporting requirements.

## Included

- Responsive Next.js App Router admin UI in Vietnamese/English
- Account dashboard with health/issue summaries, search, filters, CSV import (5 MB max), add/edit, per-channel toggles, empty states, and pagination
- Subscription network with composite identity (`userId + channel`), scheduling, filters, create flow, and status controls
- Interaction history with filters, pagination, error detail, and CSV export
- System architecture and cron control-plane view
- Google Workspace SSO wiring via Auth.js with optional domain restriction
- Prisma data model for affiliate accounts, partners, interactions, and automation runs
- Vercel cron endpoints with authorization, timezone cutoffs, execution records, dry-run planning, and Brevo reporting
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

After the Neon migration is applied, use **Open Neon workspace** on `/login`. UI changes are persisted through the REST API to Neon.

## Cron deployment

`vercel.json` configures the supplied schedules in UTC while every endpoint enforces Asia/Bangkok operating windows. Set `CRON_SECRET`; Vercel sends it as a Bearer token. Jobs remain dry-run until an approved provider adapter is configured and `AUTOMATION_DRY_RUN=false` is explicitly set.

## Security choices

- Google SSO avoids local passwords.
- Admin access can be limited using `AUTH_ALLOWED_DOMAIN`.
- Cron endpoints require a shared secret.
- Social credentials use AES-256-GCM helpers and a managed encryption key, not SHA-256. Hashing would make credentials irrecoverable for authorized sign-in and provides no suitable secret-at-rest workflow.
- Social secrets are never returned by list endpoints or rendered in the UI.
