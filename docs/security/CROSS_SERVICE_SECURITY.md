# Cross-Service Communication Security

This document details the secure communication patterns between different services in the LifeNavigator application.

## Architecture Overview

LifeNavigator consists of multiple services:

1. **Next.js Frontend**: The main user-facing web application
2. **Python Backend API**: Core business logic implementation (FastAPI)
3. **Analytics Service**: Handles data processing and analysis
4. **Other microservices**: Specialized services for specific functionality

## Security Implementation

### 1. Request Authentication

All cross-service requests are authenticated using:

- **HMAC Request Signing**: Using SHA-256 with service-specific API keys
- **Request Timestamps**: To prevent replay attacks (5-minute validity)
- **Unique Request IDs**: For tracing and preventing duplicate requests
- **Service Identification**: Clear identification of the requesting service

### 2. Data Protection

- **TLS Encryption**: All service-to-service communication uses TLS 1.3
- **Field-level Encryption**: Sensitive data is encrypted before transmission
- **Minimal Data Transfer**: Only necessary data is shared between services

### 3. Authorization

- **Service-based Access Control**: Each service has specific permissions
- **Fine-grained API Endpoints**: Access limited to required functionality
- **Environment-based Restrictions**: Different rules for dev/staging/production

## Implementation Components

### Secure Service Client

The `SecureServiceClient` in `src/lib/api/secure-service-client.ts` provides:

- Automatic request signing
- Retry logic with exponential backoff
- Timeout handling
- Error normalization

```typescript
// Example usage
import { financialService } from '@/lib/api/backend-services';

// Make an authenticated request to the financial service
const result = await financialService.get('/accounts');
```

### Cross-Service Authentication Middleware

The `withCrossServiceAuth` middleware in `src/lib/middleware/cross-service-auth.ts`:

- Verifies incoming requests from other services
- Validates request signatures
- Checks timestamps to prevent replay attacks
- Enforces service-based access control

```typescript
// Apply to route handlers
export const GET = withCrossServiceAuth(handler, {
  strict: true,
  requiredServices: ['financial-service', 'analytics-service']
});
```

### Environment Configuration

Service endpoints and authentication keys are configured in environment variables:

```
INTERNAL_API_KEY=your-internal-api-key
FINANCIAL_API_URL=https://api.example.com/financial
FINANCIAL_API_KEY=your-financial-api-key
```

## Security Headers

Each cross-service request includes these security headers:

| Header Name | Purpose |
|-------------|---------|
| X-Request-ID | Unique identifier for request tracing |
| X-Timestamp | Unix timestamp when request was initiated |
| X-Service-Name | Identifier of the requesting service |
| X-Signature | HMAC-SHA256 signature of request components |

## Request Signing Algorithm

Requests are signed using this algorithm:

1. Create a string containing: `HTTP_METHOD + "\n" + REQUEST_PATH + "\n" + TIMESTAMP + "\n" + REQUEST_BODY`
2. Generate an HMAC-SHA256 signature using the service's API key
3. Include the signature in the `X-Signature` header

## Security Best Practices

1. **API Key Rotation**: Service API keys should be rotated regularly
2. **Logging and Monitoring**: All cross-service requests are logged and monitored
3. **Rate Limiting**: Prevents abuse and DoS attacks
4. **Fault Tolerance**: Circuit breakers prevent cascading failures
5. **Minimal Trust**: Each service has the minimum permissions needed

## Testing Cross-Service Security

Use the included test utility to verify secure communication:

```bash
# Test a service-to-service request
npm run test:cross-service -- --from=frontend --to=financial-api --endpoint=/health-check
```

## Troubleshooting

Common issues:

1. **Signature Verification Failed**: Check that the API keys match between services
2. **Timestamp Too Old**: Ensure server clocks are synchronized
3. **Service Not Authorized**: Verify the service is in the allowed list
4. **Network Timeouts**: Check connectivity between services