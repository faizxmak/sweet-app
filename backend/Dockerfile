# Build stage with Alpine for minimal dependencies
FROM alpine:3.18 AS builder

WORKDIR /app

# Install Node.js and npm with security updates
RUN apk add --no-cache nodejs=18.18.2-r0 npm=9.6.7-r0

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --only=production && npm cache clean --force

# Production stage - using minimal distroless image
FROM gcr.io/distroless/nodejs18-debian11:nonroot

WORKDIR /app

# Copy app code and dependencies from builder
COPY --from=builder --chown=nonroot:nonroot /app/node_modules /app/node_modules
COPY --chown=nonroot:nonroot . .

# Expose port
EXPOSE 5000

# Run as non-root user (distroless default)
# Start Node.js application
CMD ["app.js"]
