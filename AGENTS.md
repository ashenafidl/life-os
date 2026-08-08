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
- Schema lives in `src/db/schema/`; migration SQL is committed under `./drizzle`. Add a new migration, don't rewrite existing ones.
- `pnpm build` = `next build` + esbuild bundle of migrate/seed into `dist/db` (gitignored). The Docker entrypoint runs migrate → seed → `node server.js`, so schema changes ship as committed migration SQL.

## Architecture

- Modules are a route group under `src/app/(modules)/<module>/` with a shared sidebar layout. Register new modules and nav items in `src/constants/module.ts`.
- `typedRoutes: true` — route hrefs are type-checked; cast literal paths as `Route` from `next`.
- Forms: @tanstack/react-form (`src/components/form/`, `src/hooks/use-form.ts`); tables: @tanstack/react-table; mutations: server actions in `src/actions/`. All wrapped in TanStack Devtools panels in `src/app/layout.tsx`.
- `cacheComponents: true` in `next.config.ts` (Next 16 Cache Components) — caching/prerender behavior differs from older Next; read `node_modules/next/dist/docs/` before relying on it.

## Runtime gotchas

- `src/instrumentation.ts` (→ `instrumentation-node.ts`) publishes an mDNS `_sms-sync._tcp.local` record on boot for the SMS-sync route (`/api/sms/sync`). `bonjour-service` is in `serverExternalPackages` — keep it server-only.
- Docker compose must use `network_mode: host` for that mDNS broadcast to reach the LAN; postgres maps to host port 5433.
- CI (`.github/workflows/docker-publish.yml`) builds and pushes `ashenafidl/lifeos` on `main` and `v*.*.*` tags (Node 24, standalone output).
