# API Documentation

**PerkAsm Frontend API Integration Guide**

This document describes all API endpoints used by the frontend application and how to integrate with them.

---

## Table of Contents

- [Overview](#overview)
- [Authentication](#authentication)
- [Endpoints](#endpoints)
  - [Auth Endpoints](#auth-endpoints)
  - [Cards Endpoints](#cards-endpoints)
  - [Dashboard Endpoints](#dashboard-endpoints)
  - [Recommendations Endpoints](#recommendations-endpoints)
  - [Chat Endpoints](#chat-endpoints)
- [Error Handling](#error-handling)
- [Rate Limiting](#rate-limiting)
- [Type Definitions](#type-definitions)

---

## Overview

### Base URL

```
Development: http://localhost:8001/api/v1
Production: https://api.perkasm.com/api/v1
```

### Request Format

All requests use JSON:

```typescript
headers: {
  'Content-Type': 'application/json',
  'Authorization': 'Bearer <token>' // For authenticated requests
}
```

### Response Format

Standard successful response:

```json
{
  "data": { ... },
  "message": "Success"
}
```

Standard error response:

```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": { ... }
}
```

---

## Authentication

### Google OAuth Flow

1. **Initiate Login**
   ```typescript
   // Redirect to Google OAuth
   window.location.href = '/api/auth/google/login';
   ```

2. **Handle Callback**
   ```typescript
   // Google redirects to: /api/auth/google/callback?code=...
   // Backend exchanges code for tokens and redirects to frontend
   ```

3. **Store Token**
   ```typescript
   localStorage.setItem('perkasm_auth_token', token);
   setAuthToken(token); // Add to API client headers
   ```

### Token Management

```typescript
import { setAuthToken } from '@/services/api';

// Set token
setAuthToken('eyJhbGciOiJIUzI1NiIs...');

// Remove token (logout)
setAuthToken(null);
```

---

## Endpoints

### Auth Endpoints

#### POST `/auth/login`

**Description**: Email/password login (if enabled)

**Request**:
```typescript
{
  email: string;
  password: string;
}
```

**Response**:
```typescript
{
  access_token: string;
  user: {
    id: number;
    email: string;
    full_name: string;
    created_at: string;
  };
}
```

**Usage**:
```typescript
import { post } from '@/services/api';

const response = await post<LoginResponse>('/auth/login', {
  email: 'user@example.com',
  password: 'password123'
});
```

---

#### GET `/auth/me`

**Description**: Get current user information

**Request**: None (token in header)

**Response**:
```typescript
{
  id: number;
  email: string;
  full_name: string;
  created_at: string;
}
```

**Usage**:
```typescript
import { get } from '@/services/api';

const user = await get<User>('/auth/me');
```

---

#### POST `/auth/logout`

**Description**: Logout current user

**Request**: None

**Response**: `{ message: "Logged out successfully" }`

**Usage**:
```typescript
import { post } from '@/services/api';

await post('/auth/logout');
```

---

### Cards Endpoints

#### GET `/cards`

**Description**: Get all credit cards for the current user

**Query Parameters**:
- `active_only` (boolean, optional): Only return active cards (default: true)

**Response**:
```typescript
{
  cards: Array<{
    id: number;
    name: string;
    card_type: string;
    issuer: string;
    network: string | null;
    credit_limit: number;
    available_credit: number;
    current_balance: number;
    current_points: number;
    annual_fee: number;
    is_active: boolean;
    last_four: string | null;
    expiration_date: string | null;
    created_at: string;
  }>;
  total: number;
}
```

**Usage**:
```typescript
import { cardsService } from '@/services/cards.service';

// Get active cards only
const activeCards = await cardsService.getCards(true);

// Get all cards
const allCards = await cardsService.getCards(false);
```

---

#### GET `/cards/:id`

**Description**: Get a specific credit card by ID

**URL Parameters**:
- `id` (number): Card ID

**Response**:
```typescript
{
  id: number;
  name: string;
  card_type: string;
  issuer: string;
  // ... (same as cards list item)
}
```

**Usage**:
```typescript
import { cardsService } from '@/services/cards.service';

const card = await cardsService.getCard(123);
```

---

#### POST `/cards`

**Description**: Create a new credit card

**Request**:
```typescript
{
  name: string;
  card_type: string;
  issuer: string;
  network?: string;
  credit_limit: number;
  annual_fee?: number;
  last_four?: string;
  expiration_date?: string;
  has_welcome_bonus?: boolean;
  welcome_bonus_required?: number;
  welcome_bonus_deadline?: string;
}
```

**Response**: Created card object

**Usage**:
```typescript
import { cardsService } from '@/services/cards.service';

const newCard = await cardsService.createCard({
  name: 'Chase Sapphire Reserve',
  card_type: 'Travel Rewards',
  issuer: 'Chase',
  credit_limit: 10000,
  annual_fee: 550
});
```

---

#### PUT `/cards/:id`

**Description**: Update an existing credit card

**URL Parameters**:
- `id` (number): Card ID

**Request**:
```typescript
{
  name?: string;
  current_balance?: number;
  current_points?: number;
  is_active?: boolean;
  // ... any updatable field
}
```

**Response**: Updated card object

**Usage**:
```typescript
import { cardsService } from '@/services/cards.service';

const updated = await cardsService.updateCard(123, {
  current_balance: 1500,
  current_points: 25000
});
```

---

#### DELETE `/cards/:id`

**Description**: Delete (deactivate) a credit card

**URL Parameters**:
- `id` (number): Card ID

**Response**: `{ message: "Card deleted successfully" }`

**Usage**:
```typescript
import { cardsService } from '@/services/cards.service';

await cardsService.deleteCard(123);
```

---

### Dashboard Endpoints

#### GET `/dashboard`

**Description**: Get complete dashboard data (metrics, alerts, actions)

**Response**:
```typescript
{
  metrics: {
    total_points: number;
    total_rewards_value: number;
    monthly_spending: number;
    active_cards: number;
    best_performing_card: string;
  };
  alerts: Array<{
    id: number;
    type: 'info' | 'warning' | 'error';
    message: string;
    action?: string;
    created_at: string;
  }>;
  recommended_actions: Array<{
    id: number;
    title: string;
    description: string;
    impact: 'high' | 'medium' | 'low';
    effort: 'high' | 'medium' | 'low';
  }>;
}
```

**Usage**:
```typescript
import { dashboardService } from '@/services/dashboard.service';

const dashboard = await dashboardService.getDashboard();
```

---

#### GET `/dashboard/metrics`

**Description**: Get only dashboard metrics

**Response**:
```typescript
{
  total_points: number;
  total_rewards_value: number;
  monthly_spending: number;
  active_cards: number;
  best_performing_card: string;
}
```

**Usage**:
```typescript
import { dashboardService } from '@/services/dashboard.service';

const metrics = await dashboardService.getMetrics();
```

---

#### GET `/dashboard/alerts`

**Description**: Get only active alerts

**Response**:
```typescript
Array<{
  id: number;
  type: 'info' | 'warning' | 'error';
  message: string;
  action?: string;
  created_at: string;
}>
```

**Usage**:
```typescript
import { dashboardService } from '@/services/dashboard.service';

const alerts = await dashboardService.getAlerts();
```

---

### Recommendations Endpoints

#### GET `/recommendations`

**Description**: Get personalized card recommendations

**Query Parameters**:
- `limit` (number, optional): Maximum recommendations to return (default: 3)

**Response**:
```typescript
{
  recommendations: Array<{
    id: number;
    card_name: string;
    issuer: string;
    card_type: string;
    reason: string;
    estimated_value: number;
    annual_fee: number;
    match_score: number;
  }>;
  analysis: {
    spending_patterns: object;
    optimization_opportunities: string[];
  };
}
```

**Usage**:
```typescript
import { recommendationsService } from '@/services/recommendations.service';

// Get top 3 recommendations
const recs = await recommendationsService.getRecommendations();

// Get top 5 recommendations
const moreRecs = await recommendationsService.getRecommendations(5);
```

---

### Chat Endpoints

#### POST `/chat`

**Description**: Send a message to the AI assistant

**Request**:
```typescript
{
  message: string;
  conversation_id?: string;
  include_context?: boolean; // default: true
}
```

**Response**:
```typescript
{
  message: string;
  conversation_id: string;
  suggestions?: string[];
  metadata?: {
    cards_referenced?: number[];
    actions_suggested?: string[];
  };
}
```

**Usage**:
```typescript
import { chatService } from '@/services/chat.service';

const response = await chatService.sendMessage(
  'What are the best rewards cards?',
  'conv-123',
  true
);
```

---

## Error Handling

### HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (invalid/missing token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `429` - Too Many Requests (rate limit exceeded)
- `500` - Internal Server Error

### Error Response Format

```typescript
{
  error: string;           // Human-readable error message
  code?: string;           // Error code for programmatic handling
  details?: object;        // Additional error context
  validation_errors?: {    // For 400 errors
    field: string;
    message: string;
  }[];
}
```

### Frontend Error Handling

All API errors are automatically caught and handled:

```typescript
// In API interceptor
try {
  const response = await apiCall();
  return response.data;
} catch (error) {
  // Automatically tracked in Sentry
  // User-friendly toast notification shown
  throw new ApiError(message, status, data);
}
```

### Retry Logic

Failed requests are automatically retried with exponential backoff:

```typescript
// In React Query
useQuery({
  queryKey: ['resource'],
  queryFn: fetchResource,
  retry: 3,
  retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000)
});
```

---

## Rate Limiting

### Client-Side Rate Limits

The frontend implements client-side rate limiting:

| Endpoint Type | Limit | Window |
|--------------|-------|--------|
| API Requests | 100 requests | 1 minute |
| Chat Messages | 10 messages | 1 minute |
| Form Submissions | 5 submissions | 1 minute |
| Auth Attempts | 3 attempts | 5 minutes |

### Handling Rate Limits

```typescript
import { apiRateLimiter } from '@/utils/rate-limiter';

if (!apiRateLimiter.isAllowed('endpoint-key')) {
  throw new Error('Rate limit exceeded');
}
```

### Server-Side Rate Limits

The backend also implements rate limiting. When exceeded, you'll receive:

```typescript
{
  status: 429,
  error: 'Too Many Requests',
  retry_after: 60 // seconds
}
```

---

## Type Definitions

### User Types

```typescript
interface User {
  id: number;
  email: string;
  full_name: string;
  created_at: string;
}
```

### Card Types

```typescript
interface CreditCard {
  id: number;
  name: string;
  card_type: string;
  issuer: string;
  network: string | null;
  credit_limit: number;
  available_credit: number;
  current_balance: number;
  current_points: number;
  annual_fee: number;
  is_active: boolean;
  last_four: string | null;
  expiration_date: string | null;
  created_at: string;
}

interface CreditCardCreate {
  name: string;
  card_type: string;
  issuer: string;
  network?: string;
  credit_limit: number;
  annual_fee?: number;
  last_four?: string;
  expiration_date?: string;
  has_welcome_bonus?: boolean;
  welcome_bonus_required?: number;
  welcome_bonus_deadline?: string;
}

interface CreditCardUpdate {
  name?: string;
  card_type?: string;
  current_balance?: number;
  current_points?: number;
  is_active?: boolean;
  // ... any field can be optional
}
```

### Dashboard Types

```typescript
interface DashboardMetrics {
  total_points: number;
  total_rewards_value: number;
  monthly_spending: number;
  active_cards: number;
  best_performing_card: string;
}

interface Alert {
  id: number;
  type: 'info' | 'warning' | 'error';
  message: string;
  action?: string;
  created_at: string;
}

interface RecommendedAction {
  id: number;
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  effort: 'high' | 'medium' | 'low';
}
```

### Chat Types

```typescript
interface ChatRequest {
  message: string;
  conversation_id?: string;
  include_context?: boolean;
}

interface ChatResponse {
  message: string;
  conversation_id: string;
  suggestions?: string[];
  metadata?: {
    cards_referenced?: number[];
    actions_suggested?: string[];
  };
}
```

---

## Testing API Integration

### Mock API Responses

```typescript
// In tests
import { rest } from 'msw';
import { server } from '@/test/server';

server.use(
  rest.get('/api/v1/cards', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        cards: [{ id: 1, name: 'Test Card' }],
        total: 1
      })
    );
  })
);
```

### Integration Testing

```typescript
import { renderHook } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

it('should fetch cards', async () => {
  const queryClient = new QueryClient();
  const wrapper = ({ children }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );

  const { result } = renderHook(() => useCards(), { wrapper });
  
  await waitFor(() => {
    expect(result.current.data).toBeDefined();
  });
});
```

---

## Additional Resources

- [Backend API Repository](https://github.com/perkasm/platform/tree/main/backend)
- [OpenAPI Specification](./openapi.yaml) (if available)
- [Postman Collection](./postman/) (if available)

---

*Last Updated: September 30, 2025*
