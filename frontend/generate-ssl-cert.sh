#!/bin/bash
# Generate self-signed SSL certificate for local development
# This script creates SSL certificates for HTTPS support in nginx

set -e

SSL_DIR="./ssl"
CERT_FILE="$SSL_DIR/nginx.crt"
KEY_FILE="$SSL_DIR/nginx.key"

echo "🔐 Generating self-signed SSL certificate for local development..."

# Create SSL directory if it doesn't exist
mkdir -p "$SSL_DIR"

# Generate self-signed certificate
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout "$KEY_FILE" \
  -out "$CERT_FILE" \
  -subj "/C=US/ST=State/L=City/O=PerkAsm/OU=Development/CN=localhost" \
  -addext "subjectAltName=DNS:localhost,DNS:*.localhost,IP:127.0.0.1"

echo "✅ SSL certificate generated successfully!"
echo "   Certificate: $CERT_FILE"
echo "   Private Key: $KEY_FILE"
echo ""
echo "⚠️  Note: This is a self-signed certificate for development only."
echo "   Your browser will show a security warning - this is expected."
echo ""
echo "To use with Docker, make sure to mount the ssl directory:"
echo "   docker run -v \$(pwd)/ssl:/etc/nginx/ssl ..."
