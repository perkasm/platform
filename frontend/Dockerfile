# Multi-stage Dockerfile for PerkAsm Frontend
# Following best practices for production builds with security and optimization

# Stage 1: Build Stage
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Install dependencies first (better layer caching)
# Copy package files
COPY package*.json ./

# Install dependencies with clean install for reproducible builds
RUN npm install

# Copy source code
COPY . .

# Build arguments for environment-specific builds
ARG VITE_API_URL
ARG VITE_ENVIRONMENT=production
ARG VITE_GOOGLE_CLIENT_ID
ARG VITE_TELLER_APPLICATION_ID

# Set environment variables for build
ENV VITE_API_URL=${VITE_API_URL}
ENV VITE_ENVIRONMENT=${VITE_ENVIRONMENT}
ENV VITE_GOOGLE_CLIENT_ID=${VITE_GOOGLE_CLIENT_ID}
ENV VITE_TELLER_APPLICATION_ID=${VITE_TELLER_APPLICATION_ID}

# Build the application
RUN npm run build

# Stage 2: Production Stage
FROM nginx:1.27-alpine AS production

# Install curl and openssl for health checks and SSL certificate generation
RUN apk add --no-cache curl openssl

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Create SSL directory and generate self-signed certificate
RUN mkdir -p /etc/nginx/ssl && \
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout /etc/nginx/ssl/nginx.key \
    -out /etc/nginx/ssl/nginx.crt \
    -subj "/C=US/ST=State/L=City/O=PerkAsm/OU=Development/CN=localhost" \
    -addext "subjectAltName=DNS:localhost,DNS:*.localhost,IP:127.0.0.1"

# Create non-root user for security
RUN addgroup -g 1001 -S appuser && \
    adduser -S -D -H -u 1001 -h /usr/share/nginx/html -s /sbin/nologin -G appuser -g appuser appuser && \
    chown -R appuser:appuser /usr/share/nginx/html && \
    chown -R appuser:appuser /var/cache/nginx && \
    chown -R appuser:appuser /var/log/nginx && \
    chown -R appuser:appuser /etc/nginx/conf.d && \
    chown -R appuser:appuser /etc/nginx/ssl && \
    touch /var/run/nginx.pid && \
    chown -R appuser:appuser /var/run/nginx.pid

# Switch to non-root user
USER appuser

# Expose ports 8080 (HTTP redirect) and 8443 (HTTPS)
EXPOSE 8080 8443

# Health check (using HTTPS)
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -k -f https://localhost:8443/health || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
