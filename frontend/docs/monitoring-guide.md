# Monitoring & Observability Guide

**PerkAsm Frontend - Production Monitoring**

---

## 🎯 Quick Start

### 1. Configure Sentry

Create a Sentry account at [sentry.io](https://sentry.io) and get your DSN.

```bash
# Update .env.local
VITE_SENTRY_DSN=https://your-key@your-org.ingest.sentry.io/your-project-id
VITE_SENTRY_ENVIRONMENT=development
VITE_ENABLE_ERROR_TRACKING=true
```

### 2. Test Error Tracking

```typescript
// In your component or console:
import { captureException, captureMessage } from '@/config/sentry';

// Test error
captureException(new Error('Test error from frontend'));

// Test message
captureMessage('Test message', 'info');
```

### 3. View Dashboard

Visit your Sentry dashboard to see:
- Real-time errors
- Performance traces
- Session replays
- User impact

---

## 📊 Monitoring Features

### Error Tracking

**What's Tracked:**
- ✅ Unhandled exceptions
- ✅ React component errors (Error Boundary)
- ✅ API errors (5xx, 401, 403)
- ✅ Console errors and warnings
- ✅ Network failures

**Error Context Includes:**
- User information (if authenticated)
- Browser and OS details
- Breadcrumb trail (user actions)
- Component stack trace
- Request/response data

**Example:**
```typescript
import * as Sentry from '@sentry/react';

try {
  // Your code
} catch (error) {
  Sentry.captureException(error, {
    tags: { section: 'checkout' },
    extra: { orderId: '12345' }
  });
}
```

### Performance Monitoring

**What's Tracked:**
- ✅ Page load times
- ✅ API request duration
- ✅ Component render times
- ✅ Navigation transitions
- ✅ Resource loading

**Slow Request Detection:**
- Automatically flags API requests >3 seconds
- Captures stack trace and context
- Sent to Sentry as warning

**Example:**
```typescript
import { startTransaction } from '@/config/sentry';

const span = startTransaction('checkout-flow', 'user-action');
// Your code here
span?.finish();
```

### Web Vitals Tracking

**Core Web Vitals Monitored:**
1. **LCP** (Largest Contentful Paint)
   - Good: < 2.5s
   - Needs Improvement: 2.5s - 4s
   - Poor: > 4s

2. **INP** (Interaction to Next Paint)
   - Good: < 200ms
   - Needs Improvement: 200ms - 500ms
   - Poor: > 500ms

3. **CLS** (Cumulative Layout Shift)
   - Good: < 0.1
   - Needs Improvement: 0.1 - 0.25
   - Poor: > 0.25

4. **FCP** (First Contentful Paint)
   - Good: < 1.8s
   - Needs Improvement: 1.8s - 3s
   - Poor: > 3s

5. **TTFB** (Time to First Byte)
   - Good: < 800ms
   - Needs Improvement: 800ms - 1.8s
   - Poor: > 1.8s

**Viewing Web Vitals:**
- Development: Check browser console
- Production: View in Sentry dashboard
- Poor metrics trigger automatic alerts

### API Request Tracking

**What's Tracked:**
- ✅ Request method and URL
- ✅ Response status code
- ✅ Request duration (ms)
- ✅ Request/response size
- ✅ Error messages

**Automatic Breadcrumbs:**
Every API call creates a breadcrumb with:
- Timestamp
- HTTP method
- Endpoint URL
- Status code
- Duration

**Example Log:**
```
API Request: GET /api/v1/cards
API Response: GET /api/v1/cards (200) - 245ms
```

---

## 🔧 Configuration

### Environment Variables

**Required:**
```bash
VITE_SENTRY_DSN=<your-sentry-dsn>
```

**Optional:**
```bash
VITE_SENTRY_ENVIRONMENT=production
VITE_SENTRY_TRACES_SAMPLE_RATE=1.0
VITE_SENTRY_REPLAYS_SESSION_SAMPLE_RATE=0.1
VITE_SENTRY_REPLAYS_ON_ERROR_SAMPLE_RATE=1.0
VITE_ENABLE_ERROR_TRACKING=true
VITE_ENABLE_ANALYTICS=true
```

**Build Time (for source maps):**
```bash
SENTRY_ORG=your-organization
SENTRY_PROJECT=your-project
SENTRY_AUTH_TOKEN=your-auth-token
```

### Sample Rates Explained

**Traces Sample Rate** (`VITE_SENTRY_TRACES_SAMPLE_RATE`)
- `1.0` = Track 100% of transactions (development)
- `0.1` = Track 10% of transactions (production)
- `0.01` = Track 1% of transactions (high traffic)

**Session Replay Sample Rate** (`VITE_SENTRY_REPLAYS_SESSION_SAMPLE_RATE`)
- `0.1` = Record 10% of normal sessions
- Lower for production to save quota

**Replay On Error Sample Rate** (`VITE_SENTRY_REPLAYS_ON_ERROR_SAMPLE_RATE`)
- `1.0` = Always record when errors occur
- Recommended to keep at 1.0

---

## 🚨 Alert Configuration

### Recommended Alerts in Sentry

1. **Error Rate Alert**
   - Trigger: >10 errors in 5 minutes
   - Severity: Critical

2. **Performance Degradation**
   - Trigger: P95 response time >3 seconds
   - Severity: Warning

3. **Poor Web Vitals**
   - Trigger: LCP >4s or CLS >0.25
   - Severity: Warning

4. **API Failures**
   - Trigger: >5 5xx errors in 5 minutes
   - Severity: Critical

### Setting Up Alerts

1. Go to Sentry → Alerts → Create Alert
2. Choose metric type (errors, performance, etc.)
3. Set threshold and time window
4. Configure notification channel (email, Slack, PagerDuty)

---

## 📈 Dashboard Metrics

### Key Metrics to Monitor

**Error Metrics:**
- Error count (last 24h)
- Error rate (errors/minute)
- Affected users
- Most common errors

**Performance Metrics:**
- Average response time
- P50, P75, P95, P99 latencies
- Slowest endpoints
- Throughput (requests/second)

**Web Vitals:**
- LCP distribution
- INP distribution
- CLS distribution
- Browser breakdown

**User Metrics:**
- Active sessions
- User journey (breadcrumbs)
- Session replays
- Geographic distribution

---

## 🔍 Debugging with Sentry

### Using Breadcrumbs

Breadcrumbs show the trail of events leading to an error:

```typescript
import { addBreadcrumb } from '@/config/sentry';

addBreadcrumb('User clicked checkout', 'user-action', {
  cartTotal: 99.99,
  itemCount: 3
});
```

### Session Replay

Watch user sessions to understand errors:

1. Go to Sentry → Issues → Select an error
2. Click on "Replay" tab
3. Watch the video of user's session
4. See exact steps that led to the error

**Privacy:**
- All text is masked by default
- Media is blocked
- Sensitive fields excluded

### Source Maps

For readable stack traces:

1. Build with `npm run build`
2. Source maps automatically uploaded (if configured)
3. Sentry shows original TypeScript code in stack traces

---

## 🧪 Testing Monitoring

### Test Error Tracking

```bash
# In browser console
window.Sentry.captureException(new Error('Test error'));
```

### Test Performance Tracking

```bash
# Make a slow API call
fetch('/api/v1/slow-endpoint');
# Should appear in Sentry performance dashboard
```

### Test Web Vitals

1. Open browser DevTools
2. Go to Lighthouse tab
3. Run audit
4. Check Core Web Vitals scores
5. Compare with Sentry dashboard

---

## 📊 Production Checklist

Before deploying to production:

- [ ] Sentry DSN configured
- [ ] Environment set to "production"
- [ ] Sample rates adjusted for traffic
- [ ] Source maps uploading correctly
- [ ] Alerts configured
- [ ] Team invited to Sentry project
- [ ] Sensitive data filtering verified
- [ ] Session replay privacy settings reviewed
- [ ] Integration tests passing
- [ ] Dashboard monitors created

---

## 🛠 Troubleshooting

### Sentry Not Initializing

**Problem:** No errors appear in Sentry

**Solutions:**
1. Check `VITE_SENTRY_DSN` is set correctly
2. Verify `VITE_ENABLE_ERROR_TRACKING=true`
3. Check browser console for Sentry errors
4. Ensure Sentry is initialized before app renders

### Source Maps Not Working

**Problem:** Stack traces show minified code

**Solutions:**
1. Verify `SENTRY_AUTH_TOKEN` is set
2. Check build includes `sourcemap: true`
3. Ensure Vite plugin is configured
4. Upload maps manually: `sentry-cli sourcemaps upload`

### High Event Volume

**Problem:** Sentry quota exceeded

**Solutions:**
1. Lower `VITE_SENTRY_TRACES_SAMPLE_RATE`
2. Reduce `VITE_SENTRY_REPLAYS_SESSION_SAMPLE_RATE`
3. Add more `ignoreErrors` patterns
4. Use `beforeSend` to filter events

### Web Vitals Not Appearing

**Problem:** No Web Vitals in dashboard

**Solutions:**
1. Check `web-vitals` package is installed
2. Verify `initWebVitals()` is called
3. Check browser console for logs
4. Ensure page has meaningful content (for LCP)

---

## 🔗 Resources

**Documentation:**
- [Sentry React Docs](https://docs.sentry.io/platforms/javascript/guides/react/)
- [Web Vitals Guide](https://web.dev/vitals/)
- [Core Web Vitals](https://web.dev/articles/vitals)

**Tools:**
- [Sentry Dashboard](https://sentry.io)
- [PageSpeed Insights](https://pagespeed.web.dev/)
- [Chrome DevTools](https://developer.chrome.com/docs/devtools/)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)

**Internal Docs:**
- `/frontend/docs/sprint-3-completion-summary.md`
- `/frontend/README.md`
- `/frontend/src/config/sentry.ts`
- `/frontend/src/utils/webVitals.ts`

---

## 💡 Best Practices

1. **Always capture context with errors**
   ```typescript
   Sentry.captureException(error, {
     tags: { feature: 'checkout' },
     extra: { userId, orderId }
   });
   ```

2. **Use breadcrumbs for user journey**
   ```typescript
   Sentry.addBreadcrumb({
     message: 'User action',
     category: 'ui',
     data: { action: 'click', target: 'submit-button' }
   });
   ```

3. **Set user context after authentication**
   ```typescript
   import { setSentryUser } from '@/config/sentry';
   
   setSentryUser({
     id: user.id,
     email: user.email,
     username: user.username
   });
   ```

4. **Clear user context on logout**
   ```typescript
   import { clearSentryUser } from '@/config/sentry';
   
   clearSentryUser();
   ```

5. **Filter sensitive data**
   - Authorization headers automatically removed
   - Use `beforeSend` for custom filtering
   - Mask PII in breadcrumbs

6. **Monitor Web Vitals trends**
   - Set up weekly reports
   - Track improvements over time
   - Focus on "poor" ratings

---

**Last Updated:** September 30, 2025  
**Sprint:** 3 - DevOps & Monitoring
