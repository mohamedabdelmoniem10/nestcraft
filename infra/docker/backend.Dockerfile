# NestCraft Backend - Multi-stage Docker Build (Nx Compatible)
FROM node:18-alpine AS base

# Install system dependencies and pnpm globally
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
COPY apps/backend/project.json ./apps/backend/
COPY libs/shared/project.json ./libs/shared/

# Install all dependencies (including dev dependencies for build)
RUN npm ci --only=production --frozen-lockfile
RUN npm ci --frozen-lockfile

# Build stage
FROM base AS builder
COPY . .
COPY --from=deps /app/node_modules ./node_modules

# Build shared library first, then backend
RUN npx nx build shared
RUN npx nx build backend

# Production stage
FROM node:18-alpine AS runner
WORKDIR /app

# Create system user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nestjs

# Install production dependencies only
RUN npm install -g pnpm
COPY package.json package-lock.json* ./
RUN npm ci --only=production && npm cache clean --force

# Copy built application and shared library
COPY --from=builder --chown=nestjs:nodejs /app/dist/apps/backend ./dist
COPY --from=builder --chown=nestjs:nodejs /app/dist/libs/shared ./node_modules/@nestcraft/shared

# Copy package.json for runtime
COPY --chown=nestjs:nodejs package.json ./

USER nestjs

EXPOSE 4000

ENV NODE_ENV=production
ENV PORT=4000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node healthcheck.js

CMD ["node", "dist/main.js"] 