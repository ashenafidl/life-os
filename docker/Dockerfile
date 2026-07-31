# Stage 1: Dependencies Installation
ARG NODE_VERSION=24.14.0-slim
FROM node:${NODE_VERSION} AS dependencies
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN --mount=type=cache,target=/root/.local/share/pnpm/store \
    corepack enable pnpm && pnpm install --frozen-lockfile;

# Stage 2: Build application
FROM node:${NODE_VERSION} AS builder
WORKDIR /app
COPY --from=dependencies /app/node_modules ./node_modules
COPY . .
ENV NODE_ENV=production
RUN corepack enable pnpm && pnpm build;

# Stage 3: Run Next.js application
FROM node:${NODE_VERSION} AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3131
ENV HOSTNAME="0.0.0.0"

COPY --from=builder --chown=node:node /app/public ./public
RUN mkdir .next
RUN chown node:node .next

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=node:node /app/.next/standalone ./
COPY --from=builder --chown=node:node /app/.next/static ./.next/static

# db scripts + migration SQL files + pg/drizzle-orm
COPY --from=builder --chown=node:node /app/dist/db ./dist/db
COPY --from=builder --chown=node:node /app/drizzle ./drizzle

COPY --chown=node:node docker/docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh

USER node
EXPOSE 3131
ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["sh", "scripts/start.sh"]