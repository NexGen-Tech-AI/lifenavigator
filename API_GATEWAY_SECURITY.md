# API Gateway Security & CORS Policy

This document outlines the API gateway security measures and CORS policy implemented in the LifeNavigator application.

## CORS (Cross-Origin Resource Sharing)

CORS is a security feature implemented by browsers that restricts web pages from making requests to a different domain than the one that served the page. Our implementation provides:

### CORS Configuration

1. **Environment-Based Origins**: Different allowed origins for local, dev, staging, and prod environments
2. **Endpoint-Specific Policies**: Different rules based on the type of endpoint:
   - Standard API endpoints: Restricted to application domains
   - Admin endpoints: Strictly limited to admin domains
   - Public endpoints: More permissive
   - Auth endpoints: Accessible from multiple origins

### Implementation

CORS is implemented at two levels:

1. **Global Middleware**: Applied to all API routes via Next.js middleware
2. **Route-Specific Middleware**: More granular control at the route level

Configuration can be found in `src/lib/middleware/cors-config.ts`.

## API Gateway Security

The API gateway provides a comprehensive security layer for all API endpoints, including:

### Rate Limiting

- Per-endpoint limits with customizable windows
- IP-based rate limiting with configurable thresholds
- Different limits for different endpoints (higher for admin, lower for public)
- Stricter rate limits for sensitive operations (auth, registration, etc.)
- User-based rate limiting for authenticated requests
- Progressive rate limiting with longer windows for sensitive operations
- Rate limit headers for client awareness
- Configurable via environment variables

### IP Filtering

- Allowlist and blocklist support
- CIDR notation support for IP ranges
- Special handling for private IPs
- Environment-specific configurations

### API Key Validation

- Header and query parameter options
- Key-to-role mapping
- Granular permissions based on API key
- Automatic key validation

### Request Logging

- Detailed logs of all API requests (optional)
- Performance tracking
- Security event monitoring
- Configurable verbosity

## Endpoint Security Tiers

### Public Endpoints (`/api/public/*`)

- Accessible from any origin
- Basic rate limiting (50 requests per minute)
- No credentials required in CORS
- No IP restrictions

```typescript
// Example usage
export const GET = apiGateways.public(handler);
```

### Standard API Endpoints (`/api/*`)

- Restricted to application domains
- Moderate rate limiting (100 requests per minute)
- Credentials allowed in CORS
- CSRF protection for mutations

```typescript
// Example usage
export const GET = apiGateways.standard(handler);
```

### Authentication Endpoints (`/api/auth/*`)

- IP-based rate limiting to prevent brute force attacks
- Moderate rate limits (20 requests per minute)
- Special handling for authentication cookies
- CSRF protection

```typescript
// Example usage
export const POST = apiGateways.auth(handler);
```

### Registration Endpoint (`/api/auth/register`)

- Very strict rate limiting (5 requests per 30 minutes)
- IP-based tracking to prevent abuse
- Extended cooldown period after multiple attempts

```typescript
// Example usage
export const POST = apiGateways.register(handler);
```

### Password and MFA Operations

- Strict limits (5 requests per 15 minutes)
- User-based tracking when authenticated
- IP-based when not authenticated
- Progressive cooldown periods

```typescript
// Example usage
export const POST = apiGateways.passwordOps(handler);
```

### User Account Operations

- Operations like account deletion, data export
- Moderate limits (10 requests per hour)
- User-based tracking when authenticated

```typescript
// Example usage
export const POST = apiGateways.userAccountOps(handler);
```

### Document Operations

- Document uploads, downloads, and sharing
- Higher limits (20 requests per 10 minutes)
- User-based tracking for authenticated requests

```typescript
// Example usage
export const POST = apiGateways.documentOps(handler);
```

### OAuth Operations

- OAuth initialization and token management
- Moderate limits (10 requests per 5 minutes)
- User-based tracking when authenticated

```typescript
// Example usage
export const POST = apiGateways.oauth(handler);
```

### Admin Endpoints (`/api/admin/*`)

- Strictly limited to admin domains
- Higher rate limits (300 requests per minute)
- API key required
- IP restrictions can be applied
- Strict origin checking

```typescript
// Example usage
export const GET = apiGateways.admin(handler);
```

### Internal Endpoints (`/api/internal/*`)

- For service-to-service communication
- Highest rate limits (500 requests per minute)
- Service API key required
- Strict security validation

```typescript
// Example usage
export const GET = apiGateways.internal(handler);
```

## Configuration

Configuration values are stored in environment variables:

```
# CORS Configuration
CORS_ALLOWED_ORIGINS=https://app.example.com,https://admin.example.com
ADMIN_ALLOWED_ORIGINS=https://admin.example.com
INTERNAL_ALLOWED_ORIGINS=http://localhost:8000,http://localhost:8001
ADMIN_ALLOWED_IPS=127.0.0.1,::1

# API Gateway Security
API_LOGGING=true
ADMIN_API_KEYS=admin-key-1,admin-key-2

# Rate Limiting Configuration (format: requests:window_ms)
RATE_LIMIT_STANDARD=100:60000       # 100 requests per minute for standard API endpoints
RATE_LIMIT_PUBLIC=50:60000          # 50 requests per minute for public API endpoints
RATE_LIMIT_AUTH=20:60000            # 20 requests per minute for auth endpoints
RATE_LIMIT_ADMIN=300:60000          # 300 requests per minute for admin endpoints
RATE_LIMIT_INTERNAL=500:60000       # 500 requests per minute for internal services

# Sensitive Endpoint Rate Limiting
RATE_LIMIT_REGISTER=5:1800000       # 5 requests per 30 minutes for registration
RATE_LIMIT_PASSWORD_OPS=5:900000    # 5 requests per 15 minutes for password/MFA operations
RATE_LIMIT_USER_ACCOUNT_OPS=10:3600000  # 10 requests per hour for account operations
RATE_LIMIT_DOCUMENT_OPS=20:600000   # 20 requests per 10 minutes for document operations
RATE_LIMIT_OAUTH=10:300000          # 10 requests per 5 minutes for OAuth operations
```

## Implementation Details

### Middleware Composition

Security middleware is designed to be composable, allowing multiple layers to be combined:

```typescript
// Example of combined middleware
const handler = withAuth(
  withCors(
    apiGateways.admin(
      yourRouteHandler
    )
  )
);
```

### Default Headers

Security-related headers are automatically included in responses:

- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `Content-Security-Policy: default-src 'self'`
- `Strict-Transport-Security: max-age=31536000; includeSubDomains`
- `X-XSS-Protection: 1; mode=block`

## Testing

To test the API gateway security and CORS policy:

1. Use browser dev tools to observe CORS headers
2. Test rate limiting with concurrent requests
3. Test IP filtering by accessing from different IPs
4. Test API key validation with valid and invalid keys

## Best Practices

1. Always use the most restrictive security tier appropriate for the endpoint
2. Keep API keys secret and rotate them regularly
3. Add new origins to allowlists with caution
4. Monitor logs for suspicious activity
5. Regularly review and update security configurations
6. Adjust rate limits based on production traffic patterns
7. Set stricter limits for sensitive operations
8. Use progressive rate limiting for authentication endpoints
9. Implement both IP-based and user-based rate limiting
10. Consider persistent storage for rate limiting in distributed environments

## Rate Limiting Architecture

The rate limiting implementation in LifeNavigator follows a layered approach:

1. **Memory-Based Storage**: In-memory rate limiter for single-instance deployments
2. **Configurable Thresholds**: Environment-specific rate limits
3. **Path-Based Rules**: Different limits based on endpoint sensitivity
4. **Progressive Limits**: Stricter limits for sensitive operations
5. **Hybrid Tracking**: IP-based for unauthenticated requests, user-based for authenticated
6. **Header Feedback**: Rate limit headers to help clients adapt

For production deployment with multiple server instances, the in-memory rate limiter can be replaced with a Redis-based implementation sharing the same interface. This ensures consistent rate limiting across a distributed environment.