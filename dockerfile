# Development Dockerfile for Next.js (Debian-slim base to avoid common alpine native-build issues)
FROM node:20-bullseye-slim

WORKDIR /app

ENV NODE_ENV=development
ENV NEXT_TELEMETRY_DISABLED=1

# Install basic build tools (for packages that need compilation)
RUN apt-get update && \
    apt-get install -y --no-install-recommends python3 make g++ ca-certificates && \
    rm -rf /var/lib/apt/lists/*

# Copy package files first to leverage cache
COPY package*.json ./

# Use npm ci when lockfile exists, else fallback to npm install
RUN if [ -f package-lock.json ]; then npm ci --silent; else npm install --silent; fi

# Copy app source
COPY . .

# Expose dev port
EXPOSE 3000

# Default dev command (hot reload)
CMD ["npm", "run", "dev"]