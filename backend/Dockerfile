# Use Node.js LTS version
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Create data directory for SQLite database
RUN mkdir -p /app/data

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy built application
COPY dist/ ./dist/

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs
RUN adduser -S coffee-tracker -u 1001

# Change ownership of data directory
RUN chown -R coffee-tracker:nodejs /app/data

# Switch to non-root user
USER coffee-tracker

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "const http = require('http'); \
  const options = { host: 'localhost', port: 3001, path: '/', timeout: 2000 }; \
  const req = http.request(options, (res) => { \
    process.exit(res.statusCode === 200 ? 0 : 1); \
  }); \
  req.on('error', () => process.exit(1)); \
  req.end();"

# Start command
CMD ["npm", "start"]