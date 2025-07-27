# Use Node.js LTS version
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Create data directory for SQLite database
RUN mkdir -p /app/data

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev dependencies for build)
RUN npm install

# Copy source code
COPY src/ ./src/
COPY tsconfig*.json ./

# Build TypeScript application
RUN npm run build:railway

# Remove dev dependencies to reduce image size
RUN npm install --production

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs
RUN adduser -S coffee-tracker -u 1001

# Change ownership of data directory
RUN chown -R coffee-tracker:nodejs /app/data

# Switch to non-root user
USER coffee-tracker

# Expose port
EXPOSE 3001

# Health check using Railway's dynamic port
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD node -e "const http = require('http'); \
  const port = process.env.PORT || 3001; \
  const options = { host: '0.0.0.0', port: port, path: '/', timeout: 2000 }; \
  const req = http.request(options, (res) => { \
    process.exit(res.statusCode === 200 ? 0 : 1); \
  }); \
  req.on('error', () => process.exit(1)); \
  req.end();"

# Start command
CMD ["npm", "start"]