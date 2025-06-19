# Static Deployment for LifeNavigator with Authentication

This guide outlines how to deploy LifeNavigator as a static site that maintains authentication capabilities.

## Architecture Overview

For a static deployment with authentication, we'll use:

1. **Static Frontend**: Deployed to S3/CloudFront
2. **Authentication API**: Deployed as serverless functions
3. **Database**: PostgreSQL instance for user data
4. **Client-side Authentication**: JWT-based auth with secure storage

## Implementation Steps

### 1. API Deployment

First, deploy a minimal API to handle authentication and database operations:

```
/api
  /auth    # Authentication endpoints
  /data    # Data endpoints that require auth
```

This API can be deployed as:
- AWS Lambda functions behind API Gateway
- Firebase Functions
- Vercel Serverless Functions (just for API routes)

### 2. Static Site Generation

Configure Next.js to export the site as static HTML:

1. Create a script to build static site:

```bash
#!/bin/bash
# /home/vboxuser/lifenavigator/scripts/build-static.sh

# Build the static site
NEXT_PUBLIC_API_URL=https://api.yourservice.com next build && next export -o out
```

2. Update CloudFront to:
   - Serve the static files from S3
   - Route `/api/*` to your API Gateway/Lambda
   - Configure error pages to handle client-side routing

### 3. Authentication Approach

For authentication in a static site:

1. **JWT-based Token Authentication**:
   - The API issues JWT tokens upon successful login
   - Tokens are stored in localStorage/cookies
   - All API requests include the JWT for authentication

2. **Client-side Authentication**:
   - The static app checks for valid tokens
   - If token exists, user is authenticated
   - Protected routes check auth status client-side
   - API requests verify tokens server-side

### 4. Implementation Changes

#### Update Auth Components

1. Modify the auth system to use token-based auth:

```typescript
// src/lib/auth/static-auth.ts
export async function loginUser(email: string, password: string) {
  const response = await fetch('https://api.yourservice.com/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });

  if (!response.ok) throw new Error('Login failed');
  
  const { token, user } = await response.json();
  localStorage.setItem('auth_token', token);
  return user;
}

export function getAuthToken() {
  return localStorage.getItem('auth_token');
}

export function isAuthenticated() {
  const token = getAuthToken();
  if (!token) return false;
  
  // Check if token is expired (optional)
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 > Date.now();
  } catch (e) {
    return false;
  }
}

export function logout() {
  localStorage.removeItem('auth_token');
  window.location.href = '/login';
}
```

2. Create an API client that includes auth tokens:

```typescript
// src/lib/api-client.ts
import { getAuthToken } from './auth/static-auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

export async function fetchApi(endpoint: string, options: RequestInit = {}) {
  const token = getAuthToken();
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers
  };
  
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers
  });
  
  // Handle 401 Unauthorized
  if (response.status === 401) {
    localStorage.removeItem('auth_token');
    window.location.href = '/login?session=expired';
    return null;
  }
  
  return response;
}
```

#### Protect Routes Client-side

Create a higher-order component to protect routes:

```typescript
// src/components/auth/ProtectedRoute.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated } from '@/lib/auth/static-auth';
import LoadingSpinner from '@/components/ui/loaders/LoadingSpinner';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
    } else {
      setLoading(false);
    }
  }, [router]);
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="large" />
      </div>
    );
  }
  
  return <>{children}</>;
}
```

Use the ProtectedRoute component for dashboard and other protected pages:

```typescript
// src/app/dashboard/layout.tsx
'use client';

import ProtectedRoute from '@/components/auth/ProtectedRoute';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      {children}
    </ProtectedRoute>
  );
}
```

### 5. API Serverless Functions

Create serverless functions for authentication:

```typescript
// api/auth/login.js (AWS Lambda or similar)
export async function handler(event) {
  // Parse request
  const { email, password } = JSON.parse(event.body);
  
  // Connect to database and validate credentials
  // ...
  
  // Generate JWT token
  const token = jwt.sign(
    { userId: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );
  
  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, user: { id: user.id, email, name: user.name } })
  };
}
```

### 6. CloudFront Configuration

Configure CloudFront to handle client-side routing:

1. Set default root object to `index.html`
2. Create a custom error response:
   - Error code: 403 (Access Denied)
   - Response page path: `/index.html`
   - Response code: 200
3. Set up Origin behavior:
   - For `/api/*`: API Gateway/Lambda endpoint
   - For everything else: S3 bucket

## Testing and Deployment

1. Test locally by running against the API:
   ```bash
   NEXT_PUBLIC_API_URL=https://api.yourservice.com npm run dev
   ```

2. Build and deploy:
   ```bash
   # Build static site
   ./scripts/build-static.sh
   
   # Deploy to S3
   aws s3 sync out s3://your-bucket-name --delete
   
   # Invalidate CloudFront cache
   aws cloudfront create-invalidation --distribution-id YOUR_CF_DISTRIBUTION_ID --paths "/*"
   ```

## Security Considerations

1. Use HTTPS for all API endpoints
2. Set proper CORS headers on API
3. Implement token refresh logic for long sessions
4. Consider using HttpOnly cookies if possible
5. Add rate limiting to authentication endpoints
6. Implement IP-based blocking for suspicious activities

## Limitations

This approach has some limitations:

1. No server-side rendering (SSR) for protected content
2. All data loading happens client-side
3. Initial page load may be slower due to auth checks
4. SEO is limited for protected content
5. Must manually handle auth state across pages