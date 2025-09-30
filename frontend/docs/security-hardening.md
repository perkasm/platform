# Security Hardening Documentation

**PerkAsm Platform Frontend**  
*Security Implementation Guide*

---

## Overview

This document outlines the security measures implemented in the PerkAsm frontend application to protect against common web vulnerabilities and attacks.

## Table of Contents

1. [HTTPS Enforcement](#https-enforcement)
2. [Security Headers](#security-headers)
3. [CORS Configuration](#cors-configuration)
4. [XSS Protection](#xss-protection)
5. [Rate Limiting](#rate-limiting)
6. [SSL/TLS Configuration](#ssltls-configuration)
7. [Security Testing](#security-testing)

---

## HTTPS Enforcement

### Implementation

The application enforces HTTPS connections with automatic redirection from HTTP to HTTPS.

**nginx.conf Configuration:**
```nginx
# HTTP server - redirect to HTTPS
server {
    listen 8080;
    server_name localhost;
    return 301 https://$host:8443$request_uri;
}

# HTTPS server
server {
    listen 8443 ssl http2;
    ...
}
```

### Self-Signed Certificates

For development and testing, self-signed SSL certificates are generated automatically.

**Generate Certificates Manually:**
```bash
./generate-ssl-cert.sh
```

**In Docker:**
Certificates are automatically generated during the Docker build process.

**In Kubernetes:**
For production, use cert-manager or your cloud provider's certificate management service.

---

## Security Headers

The application implements comprehensive security headers to protect against various attacks.

### Implemented Headers

#### 1. **Strict-Transport-Security (HSTS)**
```nginx
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
```
- Enforces HTTPS connections for 1 year
- Applies to all subdomains

#### 2. **X-Frame-Options**
```nginx
add_header X-Frame-Options "SAMEORIGIN" always;
```
- Prevents clickjacking attacks
- Only allows framing from the same origin

#### 3. **X-Content-Type-Options**
```nginx
add_header X-Content-Type-Options "nosniff" always;
```
- Prevents MIME-sniffing attacks
- Forces browsers to respect Content-Type headers

#### 4. **X-XSS-Protection**
```nginx
add_header X-XSS-Protection "1; mode=block" always;
```
- Enables browser XSS filtering
- Blocks page rendering on XSS detection

#### 5. **Referrer-Policy**
```nginx
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
```
- Controls referrer information sent with requests
- Sends only origin for cross-origin requests

#### 6. **Content-Security-Policy (CSP)**
```nginx
add_header Content-Security-Policy "
  default-src 'self';
  script-src 'self' 'unsafe-inline' 'unsafe-eval';
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https:;
  font-src 'self' data:;
  connect-src 'self' https://api.perkasm.com https://*.sentry.io;
  frame-ancestors 'self';
  base-uri 'self';
  form-action 'self';
" always;
```

#### 7. **Permissions-Policy**
```nginx
add_header Permissions-Policy "
  geolocation=(),
  microphone=(),
  camera=(),
  payment=(),
  usb=(),
  magnetometer=(),
  gyroscope=(),
  speaker=()
" always;
```

---

## CORS Configuration

Cross-Origin Resource Sharing (CORS) is configured to allow secure API communication.

```nginx
add_header Access-Control-Allow-Origin "https://api.perkasm.com" always;
add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS" always;
add_header Access-Control-Allow-Headers "Authorization, Content-Type, X-Requested-With" always;
add_header Access-Control-Allow-Credentials "true" always;
add_header Access-Control-Max-Age "86400" always;
```

### Configuration for Production

Update `nginx.conf` with your production API domain:
```nginx
add_header Access-Control-Allow-Origin "https://your-api-domain.com" always;
```

---

## XSS Protection

The application implements comprehensive XSS protection utilities.

### Usage

```typescript
import {
  escapeHtml,
  sanitizeUserInput,
  validateAndSanitize,
  detectXssPatterns,
} from '@/utils/xss-protection';

// Escape HTML entities
const safe = escapeHtml(userInput);

// Sanitize user input with max length
const sanitized = sanitizeUserInput(userInput, 1000);

// Comprehensive validation
const result = validateAndSanitize(userInput, {
  maxLength: 2000,
  allowHtml: false,
  checkXssPatterns: true,
});

if (!result.isValid) {
  console.error(result.errors);
}
```

### Features

- **HTML Entity Escaping**: Escapes `<`, `>`, `&`, `"`, `'`, `/`
- **HTML Tag Stripping**: Removes all HTML tags
- **URL Validation**: Blocks `javascript:`, `data:`, `vbscript:`, `file:` protocols
- **XSS Pattern Detection**: Detects common XSS attack patterns
- **Input Sanitization**: Validates and sanitizes user input

### Protected Components

The following services use XSS protection:
- `chat.service.ts` - All chat messages are sanitized
- Any component accepting user input

---

## Rate Limiting

Client-side rate limiting protects against excessive requests and abuse.

### Pre-configured Rate Limiters

#### 1. **API Rate Limiter**
```typescript
import { apiRateLimiter } from '@/utils/rate-limiter';

// 10 requests per minute
if (!apiRateLimiter.isAllowed(`endpoint-key`)) {
  throw new Error(apiRateLimiter.getErrorMessage());
}
```

#### 2. **Chat Rate Limiter**
```typescript
import { chatRateLimiter } from '@/utils/rate-limiter';

// 5 messages per 10 seconds
if (!chatRateLimiter.isAllowed(userId)) {
  throw new Error(chatRateLimiter.getErrorMessage());
}
```

#### 3. **Form Rate Limiter**
```typescript
import { formRateLimiter } from '@/utils/rate-limiter';

// 3 submissions per minute
if (!formRateLimiter.isAllowed('form-id')) {
  throw new Error(formRateLimiter.getErrorMessage());
}
```

#### 4. **Auth Rate Limiter**
```typescript
import { authRateLimiter } from '@/utils/rate-limiter';

// 5 attempts per 5 minutes
if (!authRateLimiter.isAllowed(username)) {
  throw new Error(authRateLimiter.getErrorMessage());
}
```

### Custom Rate Limiter

```typescript
import { RateLimiter } from '@/utils/rate-limiter';

const customLimiter = new RateLimiter({
  maxRequests: 100,
  windowMs: 60 * 1000, // 1 minute
  errorMessage: 'Custom rate limit exceeded',
});

if (!customLimiter.isAllowed('key')) {
  // Handle rate limit exceeded
}
```

### API Integration

All API methods (`get`, `post`, `put`, `del`) in `services/api.ts` automatically apply rate limiting.

---

## SSL/TLS Configuration

### TLS Protocols

Only secure TLS versions are enabled:
```nginx
ssl_protocols TLSv1.2 TLSv1.3;
```

### Cipher Suites

Strong cipher suites with forward secrecy:
```nginx
ssl_ciphers 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:...';
ssl_prefer_server_ciphers off;
```

### Session Configuration

```nginx
ssl_session_cache shared:SSL:10m;
ssl_session_timeout 10m;
ssl_session_tickets off;
```

---

## Security Testing

### Manual Testing Checklist

#### HTTPS Configuration
- [ ] HTTP redirects to HTTPS
- [ ] HTTPS certificate is valid (or self-signed for dev)
- [ ] TLS 1.2/1.3 are enabled
- [ ] Weak ciphers are disabled

#### Security Headers
```bash
# Test security headers
curl -I https://localhost:8443

# Expected headers:
# - Strict-Transport-Security
# - X-Frame-Options
# - X-Content-Type-Options
# - Content-Security-Policy
# - Permissions-Policy
```

#### XSS Protection
```bash
# Test XSS input sanitization
# Try submitting:
<script>alert('xss')</script>
javascript:alert('xss')
<img src=x onerror=alert('xss')>
```

#### Rate Limiting
```bash
# Test API rate limiting
# Make rapid requests to the same endpoint
for i in {1..15}; do curl https://localhost:8443/api/test; done
```

### Automated Testing

Run the security-focused tests:
```bash
# Run XSS protection tests
npm test -- xss-protection.test.ts

# Run rate limiter tests
npm test -- rate-limiter.test.ts

# Run all tests with coverage
npm run test:coverage
```

### Security Audit Tools

#### 1. **OWASP ZAP**
```bash
# Install OWASP ZAP
# Point it to https://localhost:8443
# Run automated security scan
```

#### 2. **Mozilla Observatory**
Visit: https://observatory.mozilla.org/
Enter your domain for security analysis

#### 3. **SSL Labs**
Visit: https://www.ssllabs.com/ssltest/
Test your SSL/TLS configuration

#### 4. **Security Headers**
Visit: https://securityheaders.com/
Analyze your security headers

---

## Docker Security

### Container Security

1. **Non-root user**: Container runs as user `appuser` (UID 1001)
2. **Minimal base image**: Using Alpine Linux
3. **No privileged escalation**: `allowPrivilegeEscalation: false`
4. **Read-only root filesystem**: Where possible
5. **Dropped capabilities**: All unnecessary capabilities dropped

### Build the Secure Docker Image

```bash
cd frontend
docker build -t perkasm/frontend:latest .
```

### Run with Security Options

```bash
docker run -d \
  --name perkasm-frontend \
  -p 8080:8080 \
  -p 8443:8443 \
  --security-opt=no-new-privileges \
  --cap-drop=ALL \
  --read-only \
  perkasm/frontend:latest
```

---

## Kubernetes Security

### Pod Security Context

```yaml
securityContext:
  runAsNonRoot: true
  runAsUser: 1001
  runAsGroup: 1001
  fsGroup: 1001
  seccompProfile:
    type: RuntimeDefault
```

### Container Security Context

```yaml
securityContext:
  allowPrivilegeEscalation: false
  readOnlyRootFilesystem: false
  runAsNonRoot: true
  runAsUser: 1001
  capabilities:
    drop:
      - ALL
```

### Deploy to Kubernetes

```bash
kubectl apply -f k8s/
```

---

## Best Practices

### Development

1. **Always use HTTPS in development** to match production environment
2. **Test with self-signed certificates** to catch SSL/TLS issues early
3. **Run security tests** before committing code
4. **Use ESLint security plugins** to catch vulnerabilities

### Production

1. **Use valid SSL certificates** (Let's Encrypt, commercial CA)
2. **Enable all security headers**
3. **Configure proper CORS** for your API domain
4. **Monitor security logs** for suspicious activity
5. **Keep dependencies updated** for security patches
6. **Regular security audits** using automated tools

### Code Review Checklist

- [ ] All user input is sanitized
- [ ] No inline JavaScript in HTML
- [ ] No `eval()` or `Function()` constructors
- [ ] No `dangerouslySetInnerHTML` without sanitization
- [ ] Rate limiting on sensitive operations
- [ ] Proper error handling without information leakage
- [ ] No sensitive data in client-side code
- [ ] HTTPS enforced for all requests

---

## Troubleshooting

### Browser Shows SSL Warning

**For Development:**
This is expected with self-signed certificates. Click "Advanced" and proceed.

**For Production:**
Ensure you have a valid SSL certificate from a trusted CA.

### CORS Errors

1. Check that API domain is correctly configured in `nginx.conf`
2. Verify `Access-Control-Allow-Origin` header
3. Ensure credentials are enabled if using cookies

### Rate Limiting Too Strict

Adjust the rate limiter configuration in `src/utils/rate-limiter.ts`:
```typescript
export const apiRateLimiter = new RateLimiter({
  maxRequests: 20, // Increase limit
  windowMs: 60 * 1000,
});
```

---

## References

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Mozilla Web Security Guidelines](https://infosec.mozilla.org/guidelines/web_security)
- [Content Security Policy Reference](https://content-security-policy.com/)
- [Security Headers Reference](https://securityheaders.com/)

---

*Last Updated: September 30, 2025*
