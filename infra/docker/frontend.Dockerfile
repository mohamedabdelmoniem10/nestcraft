# NestCraft Frontend - Multi-stage Docker Build (Nx Compatible)
FROM node:18-alpine AS base

# Install system dependencies
RUN apk add --no-cache libc6-compat git
RUN npm install -g pnpm
WORKDIR /app

# Dependencies installation stage
FROM base AS deps
COPY package.json package-lock.json* ./
COPY nx.json ./
COPY tsconfig.json ./
COPY jest.preset.js ./

# Copy project configurations
COPY apps/frontend/project.json ./apps/frontend/
COPY libs/shared/project.json ./libs/shared/

# Install all dependencies (including dev dependencies for build)
RUN npm ci --only=production --frozen-lockfile
RUN npm ci --frozen-lockfile

# Build stage
FROM base AS builder
COPY . .
COPY --from=deps /app/node_modules ./node_modules

# Set Next.js environment variables for build
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Build shared library first, then frontend
RUN npx nx build shared
RUN npx nx build frontend

# Production stage
FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create system user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy public assets
COPY --from=builder /app/apps/frontend/public ./public

# Copy standalone build output
COPY --from=builder --chown=nextjs:nodejs /app/dist/apps/frontend/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/dist/apps/frontend/.next/static ./apps/frontend/.next/static

# Copy shared library to node_modules
COPY --from=builder --chown=nextjs:nodejs /app/dist/libs/shared ./node_modules/@nestcraft/shared

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1

CMD ["node", "server.js"] 