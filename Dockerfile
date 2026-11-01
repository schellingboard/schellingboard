# Compile native modules (better-sqlite3) against Node's ABI
FROM node:25-bookworm AS deps
WORKDIR /app
COPY --from=oven/bun:1 /usr/local/bin/bun /usr/local/bin/bun
RUN apt-get update && apt-get install -y --no-install-recommends python3 make g++ && rm -rf /var/lib/apt/lists/*
COPY package.json bun.lock ./
# A frozen install fails unless every workspace's manifest is present.
COPY packages/domain/package.json packages/domain/
COPY packages/contracts/package.json packages/contracts/
COPY packages/api-client/package.json packages/api-client/
COPY apps/web/package.json apps/web/
RUN bun install --frozen-lockfile

FROM node:25-bookworm AS builder
WORKDIR /app
COPY --from=oven/bun:1 /usr/local/bin/bun /usr/local/bin/bun
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Passed by scripts/docker-build.sh; empty builds show no version in the footer.
ARG APP_VERSION
ENV APP_VERSION=$APP_VERSION
RUN bun x vite build apps/web && bun scripts/build-server.ts

FROM node:25-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production

# The node image is rebuilt days after Debian publishes a security fix, so take
# the fixes here. The app never runs a package manager, and npm's bundled
# dependencies are the image's most frequent vulnerability findings.
RUN apt-get update && apt-get upgrade -y && rm -rf /var/lib/apt/lists/* && \
    rm -rf /usr/local/lib/node_modules/npm /usr/local/lib/node_modules/corepack \
      /usr/local/bin/npm /usr/local/bin/npx /usr/local/bin/corepack \
      /opt/yarn-* /usr/local/bin/yarn /usr/local/bin/yarnpkg

RUN groupadd --system --gid 1001 nodejs && \
    useradd --system --uid 1001 --gid nodejs nextjs

# The server is one bundle; only the native addons and what is read by path stay outside it
COPY --from=builder --chown=nextjs:nodejs /app/dist/server ./dist/server
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
# The SPA shell and assets are read from disk, relative to the working directory
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/dist ./apps/web/dist
# Migrations are loaded at runtime relative to process.cwd()
COPY --from=builder --chown=nextjs:nodejs /app/drizzle ./drizzle
# The bundle's externals (scripts/build-server.ts) with their dependencies, and
# the API reference script that is served by path
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/better-sqlite3 ./node_modules/better-sqlite3
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/sharp ./node_modules/sharp
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/@img ./node_modules/@img
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/detect-libc ./node_modules/detect-libc
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/semver ./node_modules/semver
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/@scalar/api-reference/dist/browser/standalone.js ./node_modules/@scalar/api-reference/dist/browser/standalone.js

RUN mkdir -p /data && chown nextjs:nodejs /data

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV DATABASE_URL=file:/data/data.db
# Uploaded files must live on the persistent /data volume
ENV SB_UPLOADS_DIR=/data/uploads

HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD node -e "fetch('http://localhost:3000/api/health').then(r=>r.ok?process.exit(0):process.exit(1)).catch(()=>process.exit(1))"

CMD ["node", "dist/server/main.mjs"]
