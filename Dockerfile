# Build stage
FROM node:20-alpine AS builder

# Install build dependencies
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    && rm -rf /var/cache/apk/*

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

    # Install all dependencies (including dev dependencies for build)
    RUN npm ci

# Copy application code
COPY . .

# Build the Next.js application
RUN npm run build

# Production stage
FROM node:20-alpine AS production

# Install runtime dependencies for health checks
RUN apk add --no-cache \
    wget \
    && rm -rf /var/cache/apk/*

# Create app user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy built application from builder stage
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/electron ./electron
COPY --from=builder --chown=nextjs:nodejs /app/scripts ./scripts
COPY --from=builder --chown=nextjs:nodejs /app/init-db-docker.js ./init-db-docker.js
COPY --from=builder --chown=nextjs:nodejs /app/next.config.ts ./next.config.ts
COPY --from=builder --chown=nextjs:nodejs /app/tailwind.config.ts ./tailwind.config.ts

# Create data directory for SQLite database
RUN mkdir -p /app/data

# Create a startup script that initializes database if needed
RUN echo '#!/bin/sh' > /app/start.sh && \
    echo 'echo "Starting CLC Finance application..."' >> /app/start.sh && \
    echo '# Check if database exists, if not populate it' >> /app/start.sh && \
    echo 'if [ ! -f /app/data/database.sqlite ]; then' >> /app/start.sh && \
    echo '  echo "Database not found, populating with initial data..."' >> /app/start.sh && \
    echo '  node init-db-docker.js' >> /app/start.sh && \
    echo 'fi' >> /app/start.sh && \
    echo '# Start the Next.js server' >> /app/start.sh && \
    echo 'npm start' >> /app/start.sh && \
    chmod +x /app/start.sh

# Change ownership of app directory to nextjs user
RUN chown -R nextjs:nodejs /app

# Switch to non-root user
USER nextjs

# Expose port for web interface
EXPOSE 3000

# Set environment variables
ENV NODE_ENV=production
ENV ELECTRON_DISABLE_SECURITY_WARNINGS=true

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/api/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) }).on('error', () => process.exit(1))"

# Default command - run startup script
CMD ["/app/start.sh"]
