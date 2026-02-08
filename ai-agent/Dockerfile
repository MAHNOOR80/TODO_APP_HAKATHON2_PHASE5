# AI Agent Dockerfile - Multi-stage build
# Phase 4: Cloud-Native Kubernetes Deployment

# ============================================
# Stage 1: Dependencies
# ============================================
FROM node:20-alpine AS deps

WORKDIR /app

# Install dependencies for native modules and OpenSSL (for Prisma)
RUN apk add --no-cache libc6-compat openssl

# Copy package files and Prisma schema
COPY package*.json ./
COPY prisma ./prisma/

# Install all dependencies (including dev for building)
RUN npm ci

# ============================================
# Stage 2: Development (for hot reloading)
# ============================================
FROM node:20-alpine AS development

WORKDIR /app

# Install dependencies for native modules
RUN apk add --no-cache libc6-compat

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Set development environment
ENV NODE_ENV=development
ENV PORT=5000

# Expose port
EXPOSE 5000

# Start with hot reload
CMD ["npm", "run", "dev"]

# ============================================
# Stage 3: Builder
# ============================================
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build TypeScript
RUN npm run build

# Remove dev dependencies
RUN npm prune --production

# ============================================
# Stage 4: Production Runner
# ============================================
FROM node:20-alpine AS runner

WORKDIR /app

# Set production environment
ENV NODE_ENV=production
ENV PORT=5000

# Install OpenSSL for Prisma runtime
RUN apk add --no-cache openssl

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 aiagent

# Copy only necessary files from builder
COPY --from=builder --chown=aiagent:nodejs /app/dist ./dist
COPY --from=builder --chown=aiagent:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=aiagent:nodejs /app/prisma ./prisma
COPY --from=builder --chown=aiagent:nodejs /app/package.json ./

# Switch to non-root user
USER aiagent

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:5000/health || exit 1

# Start the application
CMD ["node", "dist/index.js"]
