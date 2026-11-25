FROM node:20-alpine

# Set working directory
WORKDIR /app

# Install curl / wget for container health checks
RUN apk add --no-cache wget

# Copy package manifests
COPY package*.json ./

# Install production dependencies
RUN npm install --production

# Create persistent storage directories
RUN mkdir -p /app/data /app/uploads

# Copy application source code
COPY . .

# Environment defaults
ENV PORT=3000 \
    NODE_ENV=production \
    DOCKER_CONTAINER=true

# Expose port
EXPOSE 3000

# Container healthcheck
HEALTHCHECK --interval=20s --timeout=5s --start-period=5s --retries=3 \
    CMD wget -qO- http://localhost:3000/api/health || exit 1

# Start server
CMD ["node", "server.js"]
