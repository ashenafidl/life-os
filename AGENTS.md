<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

**Keep this block, including in commits.** It is part of the project's agent setup, maintained by `next dev` for every agent that works here. If it appears as an uncommitted change, that is intentional — commit it as-is. Do not remove it to clean up a diff; it will be regenerated.

<!-- END:nextjs-agent-rules -->

# LifeOS

Personal "life OS" web app: Next.js 16 (App Router), React 19, TypeScript, Tailwind v4, PostgreSQL via Drizzle. Modules: finance, shiplog, countdown, workouts.

## Toolchain (do not use npm/yarn or eslint/prettier)

- Package manager is **pnpm 11** (`pnpm dev`, `pnpm build`).
- Lint = **oxlint**, format = **oxfmt** (no eslint/prettier config). `pnpm test` = `lint` + `fmt:check` + `typecheck`; `pnpm test:all` adds a full `build`. Run these after edits.
- oxfmt sorts imports and Tailwind classes and uses double quotes, 80 cols (`oxfmt.config.ts`).
- `src/components/ui/` is generated shadcn output, ignored by both oxlint and oxfmt — don't hand-edit or lint it. oxfmt also ignores `drizzle/`.

## Dev & DB

- Dev server runs on **port 3000**.
- `pnpm db:migrate` / `pnpm db:seed` (tsx scripts in `src/db/`) both require `DATABASE_URL` in `.env`.
- Schema lives in `src/db/schema/`; migration SQL is committed under `./drizzle`. Add a new migration, don't rewrite existing ones. Generate new ones with `pnpm drizzle-kit generate` (drizzle-kit is a devDependency but not wired into package.json scripts; drizzle-orm/drizzle-kit are 1.0.0-rc).
- `pnpm build` = `next build` + esbuild bundle of migrate/seed into `dist/db` (gitignored). The Docker entrypoint runs migrate → seed → `node server.js`, so schema changes ship as committed migration SQL.

## Architecture

- Modules are a route group under `src/app/(modules)/<module>/` with a shared sidebar layout. Register new modules and nav items in `src/constants/module.ts`.
- `typedRoutes: true` — route hrefs are type-checked; cast literal paths as `Route` from `next`.
- Forms: @tanstack/react-form (`src/components/form/`, `src/hooks/use-form.ts`); tables: @tanstack/react-table; mutations: server actions in `src/actions/`. All wrapped in TanStack Devtools panels in `src/app/layout.tsx`.
- `cacheComponents` is **off** in `next.config.ts` (it was explicitly disabled) — pages render per-request with default Next 16 behavior; don't re-enable it without reading `node_modules/next/dist/docs/`.

## Runtime gotchas

- `src/instrumentation.ts` (→ `instrumentation-node.ts`) publishes an mDNS record (`_dev-sms-sync._tcp.local` in dev, `_sms-sync._tcp.local` in prod) advertising `process.env.PORT` (default 3131) on boot for the SMS-sync route (`/api/sms/sync`). `bonjour-service` is in `serverExternalPackages` — keep it server-only.
- Docker compose must use `network_mode: host` for that mDNS broadcast to reach the LAN; postgres maps to host port 5433.
- CI (`.github/workflows/docker-publish.yml`) builds and pushes `ashenafidl/lifeos` (Node 24, standalone) on `main` and `v*.*.*` tags. `.github/workflows/release.yml` auto-creates those `v*` tags on `main` pushes from commit messages (`BREAKING CHANGE` → major, `feat` → minor), so every merge to `main` triggers a Docker publish.
