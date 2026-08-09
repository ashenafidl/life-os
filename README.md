# LifeOS

LifeOS is a personal productivity dashboard built with Next.js 16, React 19, Tailwind CSS v4, Drizzle ORM, and PostgreSQL. It combines finance tracking, countdown events, workouts, and shiplog features in a modular app shell.

## Features

- Finance dashboard with transaction review, color-coded fields, and SMS reconciliation
- Countdown timer events with customizable reminders
- Workouts and shiplog modules organized by route group
- Drizzle ORM-powered PostgreSQL database and migrations

## Tech Stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS v4
- Drizzle ORM + PostgreSQL
- oxfmt / oxlint for formatting and linting

## Getting Started

### Prerequisites

- Node.js 24+
- PostgreSQL database
- `pnpm` installed globally or via `corepack`

### Install dependencies

```bash
pnpm install
```

### Environment

Create a `.env` file with at least the following:

```env
DATABASE_URL=postgres://user:password@localhost:5432/lifeos
```

### Development

```bash
pnpm dev
```

The app runs on `http://localhost:3000` by default.

## Database

Migrations and seed scripts are implemented in `src/db/`.

```bash
pnpm db:migrate
pnpm db:seed
```

## Build and Test

```bash
pnpm build
pnpm test
```

Additional commands:

- `pnpm build:db-scripts` – builds DB migration and seed scripts for standalone output
- `pnpm fmt` – format source with `oxfmt`
- `pnpm fmt:check` – verify formatting
- `pnpm lint` – lint source with `oxlint`
- `pnpm lint:fix` – fix lint issues
- `pnpm typecheck` – run TypeScript type check

## Project Structure

- `src/app/` – Next.js App Router pages and layouts
- `src/components/` – shared UI components and module-specific views
- `src/db/` – Drizzle DB connection, migrations, and seed scripts
- `src/lib/` – utility helpers and query logic
- `src/actions/` – server actions for finance and countdown modules
- `drizzle/` – committed migration SQL and snapshots

## Docker

A Docker setup is available under `docker/` for local development and deployment.

## Notes

- `next.config.ts` enables `typedRoutes` and standalone output
- `serverExternalPackages` includes `bonjour-service` for mDNS behavior
- `src/app/(modules)/` defines modular route groups for each feature area
