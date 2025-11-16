# Multi-stage build for optimized production image
# Using node:20-slim (81MB) instead of node:20 (920MB) for smaller, faster deployments
# Note: Minor vulnerabilities in base image are acceptable for this application
# Production deployments should use WAF and network security

FROM node:20-slim AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --only=production && npm cache clean --force

# Production stage
FROM node:20-slim

WORKDIR /app

# Copy optimized node_modules from builder
COPY --from=builder /app/node_modules /app/node_modules

# Copy application code
COPY . .

# Security: Run as non-root user
RUN useradd -m -u 1001 nodejs
USER nodejs

# Expose application port
EXPOSE 5000

# Start Node.js application
CMD ["node", "app.js"]
