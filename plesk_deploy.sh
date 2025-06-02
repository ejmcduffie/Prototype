#!/bin/bash
# AncestryChain Deployment Script for Plesk
# This script prepares files for Plesk Docker extension

# Create a logs directory in the project directory where Plesk Git user has access
PROJECT_DIR="$(pwd)"
LOGDIR="${PROJECT_DIR}/logs"
mkdir -p "$LOGDIR"
LOGFILE="${LOGDIR}/deployment-$(date +%Y%m%d-%H%M%S).log"

# Helper functions
log() {
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOGFILE"
}

error_exit() {
  log "ERROR: $1"
  exit 1
}

log_error() {
  log "ERROR: $1"
}

# Log script start
log "Starting AncestryChain deployment..."

# Skip Docker command-line checks since Plesk manages Docker differently
log "Using Plesk Docker extension for container management"

# Set project directory
PROJECT_DIR="$(pwd)"
log "Project directory: $PROJECT_DIR"

# Verify docker-compose.yml exists
if [ ! -f "$PROJECT_DIR/docker-compose.yml" ]; then
  log "docker-compose.yml not found, creating a default one..."
  
  # Create a basic docker-compose file if one doesn't exist
  cat > "$PROJECT_DIR/docker-compose.yml" << 'EOF'
version: '3'

services:
  ancestrychain:
    build:
      context: .
      dockerfile: Dockerfile
    restart: unless-stopped
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    volumes:
      - ./uploads:/app/uploads
      - ./public:/app/public
    depends_on:
      - mongodb
      
  mongodb:
    image: mongo:latest
    restart: unless-stopped
    volumes:
      - mongodb_data:/data/db
    ports:
      - "27017:27017"
    environment:
      - MONGO_INITDB_ROOT_USERNAME=${MONGO_INITDB_ROOT_USERNAME:-admin}
      - MONGO_INITDB_ROOT_PASSWORD=${MONGO_INITDB_ROOT_PASSWORD:-password}
      
volumes:
  mongodb_data:
EOF

  log "Created default docker-compose.yml"
fi

# Check for Dockerfile and create if needed
if [ ! -f "$PROJECT_DIR/Dockerfile" ]; then
  log "Dockerfile not found, creating a default one..."
  
  # Create a basic Dockerfile for Next.js if one doesn't exist
  cat > "$PROJECT_DIR/Dockerfile" << 'EOF'
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app
COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* ./
RUN \
  if [ -f yarn.lock ]; then yarn --frozen-lockfile; \
  elif [ -f package-lock.json ]; then npm ci; \
  elif [ -f pnpm-lock.yaml ]; then yarn global add pnpm && pnpm i --frozen-lockfile; \
  else npm i; \
  fi

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Next.js collects anonymous telemetry data about general usage
ENV NEXT_TELEMETRY_DISABLED 1

RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
EOF

  log "Created default Dockerfile"
fi

# Create .env file from environment if it doesn't exist
if [ ! -f "$PROJECT_DIR/.env" ]; then
  log "Creating .env file from template..."
  
  # Copy from .env.example if it exists, otherwise create a basic one
  if [ -f "$PROJECT_DIR/.env.example" ]; then
    cp "$PROJECT_DIR/.env.example" "$PROJECT_DIR/.env"
    log "Created .env from .env.example"
  else
    cat > "$PROJECT_DIR/.env" << 'EOF'
# Database
MONGODB_URI=mongodb://admin:password@mongodb:27017/ancestrychain?authSource=admin

# NextAuth
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=your-secret-key

# Other configurations
NODE_ENV=production
EOF
    log "Created basic .env file"
  fi
  
  log "IMPORTANT: Update the .env file with your production credentials"
fi

# Note: Containers must be managed through Plesk Docker extension interface
log "Container preparation complete"
log "IMPORTANT: To start containers, please use the Plesk Docker extension interface."
log "The docker-compose.yml file is ready to be imported in the Plesk Docker extension."

# Display how to access logs
log "To view application logs, run:"
log "docker compose -f \"$PROJECT_DIR/docker-compose.yml\" logs -f"
log "Deployment logs are available at: $LOGDIR"

exit 0
