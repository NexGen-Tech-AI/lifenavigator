# Life Navigator Implementation Guide

This document outlines the comprehensive implementation plan for initializing the Life Navigator project according to "Expert Level 7" quality standards.

## Core Architecture

### Web MVP Architecture
- **Frontend**: Next.js 15 with React 19, TypeScript, and TailwindCSS
- **Backend**: Next.js App Router API routes (with future transition to FastAPI microservices)
- **Database**: PostgreSQL with Prisma ORM, pgvector for embeddings
- **Authentication**: NextAuth.js with multiple provider support
- **State Management**: React Query for server state, Zustand for client state
- **Deployment**: AWS ECS with CloudFront CDN

### Desktop Edition (Future Phase)
- **Framework**: Tauri with React, TypeScript, and Rust backend
- **Local Storage**: SQLite with encryption
- **AI Processing**: Local PyO3 bindings with cloud fallback
- **Security**: Sandboxed execution environments

## 1. Development Environment Configuration

### Environment Variables
Create a comprehensive environment setup that supports multiple deployment environments:

```bash
# .env.example
# Core Configuration
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
APP_ENV=local  # local, dev, staging, prod

# Database
DATABASE_URL=postgresql://lifenavigator:lifenavigator_password@localhost:5432/lifenavigator
SHADOW_DATABASE_URL=postgresql://lifenavigator:lifenavigator_password@localhost:5432/lifenavigator_shadow

# Authentication
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Integrations - Financial
PLAID_CLIENT_ID=your-plaid-client-id
PLAID_CLIENT_SECRET=your-plaid-client-secret
PLAID_ENV=sandbox
COINBASE_CLIENT_ID=your-coinbase-client-id
COINBASE_CLIENT_SECRET=your-coinbase-client-secret

# Integrations - Education
CANVAS_CLIENT_ID=your-canvas-client-id
CANVAS_CLIENT_SECRET=your-canvas-client-secret
CLASSROOM_CLIENT_ID=your-google-classroom-client-id
CLASSROOM_CLIENT_SECRET=your-google-classroom-client-secret

# Integrations - Healthcare
EPIC_CLIENT_ID=your-epic-client-id
EPIC_CLIENT_SECRET=your-epic-client-secret
FHIR_BASE_URL=https://fhir-sandbox.example.com

# Integrations - Career
LINKEDIN_CLIENT_ID=your-linkedin-client-id
LINKEDIN_CLIENT_SECRET=your-linkedin-client-secret

# Integrations - Smart Home & Automotive
SMARTCAR_CLIENT_ID=your-smartcar-client-id
SMARTCAR_CLIENT_SECRET=your-smartcar-client-secret
GOOGLE_HOME_CLIENT_ID=your-google-home-client-id
GOOGLE_HOME_CLIENT_SECRET=your-google-home-client-secret

# Security & Monitoring
SENTRY_DSN=your-sentry-dsn
HONEYBADGER_API_KEY=your-honeybadger-api-key
POSTHOG_API_KEY=your-posthog-api-key
```

### Docker Configuration
Enhance the current Docker setup to include all required services:

```yaml
# docker-compose.yml
version: '3.8'

services:
  # Database
  postgres:
    image: postgres:16
    container_name: lifenavigator-postgres
    restart: always
    ports:
      - "5432:5432"
    environment:
      POSTGRES_USER: lifenavigator
      POSTGRES_PASSWORD: lifenavigator_password
      POSTGRES_DB: lifenavigator
    volumes:
      - postgres_data:/var/lib/postgresql/data
    command: postgres -c 'max_connections=1000' -c 'shared_buffers=256MB'
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U lifenavigator"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Redis for caching and session storage
  redis:
    image: redis:7-alpine
    container_name: lifenavigator-redis
    restart: always
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

  # MinIO for local S3-compatible storage
  minio:
    image: minio/minio
    container_name: lifenavigator-minio
    ports:
      - "9000:9000"
      - "9001:9001"
    volumes:
      - minio_data:/data
    environment:
      MINIO_ROOT_USER: minioadmin
      MINIO_ROOT_PASSWORD: minioadmin
    command: server /data --console-address ":9001"
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:9000/minio/health/live"]
      interval: 30s
      timeout: 20s
      retries: 3

  # LocalStack for AWS services emulation
  localstack:
    image: localstack/localstack
    container_name: lifenavigator-localstack
    ports:
      - "4566:4566"
    environment:
      SERVICES: s3,dynamodb,secretsmanager,lambda,apigateway
      DEBUG: 1
      DATA_DIR: /tmp/localstack/data
    volumes:
      - localstack_data:/tmp/localstack

  # Web application (optional - can also run with npm run dev)
  app:
    build:
      context: .
      dockerfile: Dockerfile.dev
    container_name: lifenavigator-app
    depends_on:
      - postgres
      - redis
    ports:
      - "3000:3000"
    volumes:
      - .:/app
      - /app/node_modules
    environment:
      DATABASE_URL: postgresql://lifenavigator:lifenavigator_password@postgres:5432/lifenavigator
      REDIS_URL: redis://redis:6379
      NEXT_PUBLIC_APP_URL: http://localhost:3000
    command: npm run dev

volumes:
  postgres_data:
  redis_data:
  minio_data:
  localstack_data:
```

### Development Dockerfile
Create a development Dockerfile:

```dockerfile
# Dockerfile.dev
FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json ./
RUN npm ci

# Copy application code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Expose port
EXPOSE 3000

# Start development server
CMD ["npm", "run", "dev"]
```

### Production Dockerfile
Create a production Dockerfile with multi-stage builds:

```dockerfile
# Dockerfile
# Builder stage
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json ./
RUN npm ci

# Copy application code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build the application
RUN npm run build

# Runner stage
FROM node:20-alpine AS runner

WORKDIR /app

# Set production environment
ENV NODE_ENV=production

# Copy necessary files from builder
COPY --from=builder /app/package.json /app/package-lock.json ./
COPY --from=builder /app/next.config.ts ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma

# Expose port
EXPOSE 3000

# Start application
CMD ["npm", "run", "start"]
```

## 2. Authentication and Security Implementation

### Enhanced NextAuth Configuration
Improve the current NextAuth configuration:

```typescript
// src/app/api/auth/[...nextauth]/route.ts
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { NextAuthOptions } from "next-auth";
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcrypt";
import { prisma } from "@/lib/db";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
        };
      },
    }),
    // Credentials provider for username/password authentication
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid credentials");
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email,
          },
        });

        if (!user || !user.password) {
          throw new Error("Invalid credentials");
        }

        const isPasswordValid = await compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          throw new Error("Invalid credentials");
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
        };
      },
    }),
    // Education providers configured in NextAuth.ts
    // Add integration with LinkedIn, EPIC, etc.
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role || "user";
      }
      
      // Store connection tokens
      if (account) {
        if (!token.connections) {
          token.connections = {};
        }
        token.connections[account.provider] = {
          accessToken: account.access_token,
          refreshToken: account.refresh_token,
          expiresAt: account.expires_at,
        };
      }
      
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        
        // Add connected providers info (but not tokens)
        if (token.connections) {
          session.user.connectedProviders = Object.keys(token.connections);
        }
      }
      
      return session;
    },
  },
  pages: {
    signIn: "/auth/login",
    signOut: "/auth/logout",
    error: "/auth/error",
    newUser: "/auth/register",
  },
  debug: process.env.NODE_ENV === "development",
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
```

### Token Management Service
Create a secure token management service to handle integration tokens:

```typescript
// src/lib/services/tokenService.ts
import { prisma } from "@/lib/db";
import { encrypt, decrypt } from "@/lib/utils/encryption";

interface IntegrationToken {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: number;
  tokenType?: string;
  scope?: string;
}

export const tokenService = {
  /**
   * Store an integration token for a user
   */
  async storeToken(
    userId: string,
    provider: string, 
    token: IntegrationToken
  ): Promise<void> {
    // Encrypt tokens before storing
    const encryptedAccessToken = encrypt(token.accessToken);
    const encryptedRefreshToken = token.refreshToken 
      ? encrypt(token.refreshToken)
      : null;
    
    // Store in database with upsert (update or insert)
    await prisma.account.upsert({
      where: {
        provider_providerAccountId: {
          provider,
          providerAccountId: userId,
        },
      },
      update: {
        access_token: encryptedAccessToken,
        refresh_token: encryptedRefreshToken,
        expires_at: token.expiresAt,
        token_type: token.tokenType,
        scope: token.scope,
      },
      create: {
        userId,
        provider,
        providerAccountId: userId,
        access_token: encryptedAccessToken,
        refresh_token: encryptedRefreshToken,
        expires_at: token.expiresAt,
        token_type: token.tokenType,
        scope: token.scope,
        type: "oauth",
      },
    });
  },
  
  /**
   * Retrieve an integration token for a user
   */
  async getToken(
    userId: string,
    provider: string
  ): Promise<IntegrationToken | null> {
    const account = await prisma.account.findFirst({
      where: {
        userId,
        provider,
      },
    });
    
    if (!account || !account.access_token) {
      return null;
    }
    
    return {
      accessToken: decrypt(account.access_token),
      refreshToken: account.refresh_token ? decrypt(account.refresh_token) : undefined,
      expiresAt: account.expires_at || undefined,
      tokenType: account.token_type || undefined,
      scope: account.scope || undefined,
    };
  },
  
  /**
   * Check if token is expired
   */
  isTokenExpired(expiresAt?: number): boolean {
    if (!expiresAt) return false;
    
    // Add buffer of 5 minutes
    const expirationTime = expiresAt * 1000 - 5 * 60 * 1000;
    return Date.now() >= expirationTime;
  },
  
  /**
   * Delete a token
   */
  async deleteToken(userId: string, provider: string): Promise<void> {
    await prisma.account.deleteMany({
      where: {
        userId,
        provider,
      },
    });
  }
};
```

### Encryption Utility
Create a secure encryption utility:

```typescript
// src/lib/utils/encryption.ts
import crypto from 'crypto';

// Use environment variables for the encryption keys
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'your-32-character-secret-key-here';
const IV_LENGTH = 16; // For AES, this is always 16

/**
 * Encrypt a string using AES-256-CBC
 */
export function encrypt(text: string): string {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(
    'aes-256-cbc', 
    Buffer.from(ENCRYPTION_KEY), 
    iv
  );
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  // Return iv + encrypted data
  return `${iv.toString('hex')}:${encrypted}`;
}

/**
 * Decrypt a string encrypted with AES-256-CBC
 */
export function decrypt(text: string): string {
  const [ivHex, encryptedText] = text.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  const decipher = crypto.createDecipheriv(
    'aes-256-cbc', 
    Buffer.from(ENCRYPTION_KEY), 
    iv
  );
  
  let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}

/**
 * Generate a secure random string
 */
export function generateSecureToken(length = 32): string {
  return crypto.randomBytes(length).toString('hex');
}
```

## 3. Integration Framework

### Improved OAuth Configuration
Enhance the OAuth configuration:

```typescript
// src/lib/integrations/oauth-config.ts
export interface OAuthProviderConfig {
  id: string;
  name: string;
  clientId: string;
  clientSecret: string;
  authorizationUrl: string;
  tokenUrl: string;
  scopes: string[];
  refreshTokenUrl?: string;
  userInfoUrl?: string;
  revokeUrl?: string;
  pkce?: boolean;
  state?: boolean;
  additionalParams?: Record<string, string>;
  callbackPath?: string;
}

// Loading configs from environment variables
export const OAUTH_CONFIGS: Record<string, OAuthProviderConfig> = {
  // Financial providers
  plaid: {
    id: 'plaid',
    name: 'Plaid',
    clientId: process.env.PLAID_CLIENT_ID || '',
    clientSecret: process.env.PLAID_CLIENT_SECRET || '',
    authorizationUrl: 'https://cdn.plaid.com/link/v2/stable/link.html',
    tokenUrl: 'https://sandbox.plaid.com/item/public_token/exchange',
    scopes: ['transactions', 'investments', 'auth', 'identity', 'liabilities'],
    additionalParams: {
      product: 'transactions',
      env: process.env.PLAID_ENV || 'sandbox',
    },
  },
  coinbase: {
    id: 'coinbase',
    name: 'Coinbase',
    clientId: process.env.COINBASE_CLIENT_ID || '',
    clientSecret: process.env.COINBASE_CLIENT_SECRET || '',
    authorizationUrl: 'https://www.coinbase.com/oauth/authorize',
    tokenUrl: 'https://api.coinbase.com/oauth/token',
    scopes: ['wallet:accounts:read', 'wallet:transactions:read', 'wallet:buys:read', 'wallet:sells:read'],
    userInfoUrl: 'https://api.coinbase.com/v2/user',
    refreshTokenUrl: 'https://api.coinbase.com/oauth/token',
    revokeUrl: 'https://api.coinbase.com/oauth/revoke',
    state: true,
  },
  
  // Healthcare providers with SMART on FHIR
  epic_mychart: {
    id: 'epic_mychart',
    name: 'Epic MyChart',
    clientId: process.env.EPIC_CLIENT_ID || '',
    clientSecret: process.env.EPIC_CLIENT_SECRET || '',
    authorizationUrl: 'https://fhir.epic.com/interconnect-fhir-oauth/oauth2/authorize',
    tokenUrl: 'https://fhir.epic.com/interconnect-fhir-oauth/oauth2/token',
    scopes: ['patient/Patient.read', 'patient/Observation.read', 'patient/Appointment.read', 'patient/MedicationRequest.read'],
    pkce: true,
    state: true,
    additionalParams: {
      aud: process.env.FHIR_BASE_URL || '',
    },
  },
  
  // Add other providers...
};

/**
 * Get configuration for a specific OAuth provider
 */
export function getOAuthConfig(providerId: string): OAuthProviderConfig | undefined {
  return OAUTH_CONFIGS[providerId];
}

/**
 * Generate authorization URL for an OAuth provider
 */
export function generateAuthUrl(providerId: string, userId: string): string {
  const config = OAUTH_CONFIGS[providerId];
  if (!config) throw new Error(`Unknown provider: ${providerId}`);
  
  const url = new URL(config.authorizationUrl);
  url.searchParams.append('client_id', config.clientId);
  url.searchParams.append('response_type', 'code');
  
  // Determine redirect URI
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/integrations/oauth/init/callback/${providerId}`;
  url.searchParams.append('redirect_uri', redirectUri);
  
  // Add scopes
  if (config.scopes && config.scopes.length > 0) {
    url.searchParams.append('scope', config.scopes.join(' '));
  }
  
  // Add state for CSRF protection
  if (config.state) {
    // Generate and store a state parameter
    const state = crypto.randomBytes(16).toString('hex');
    // Here you would store this state in a database or redis with the userId
    url.searchParams.append('state', state);
  }
  
  // Add any additional parameters
  if (config.additionalParams) {
    Object.entries(config.additionalParams).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });
  }
  
  return url.toString();
}
```

### Integration Service
Create a service to handle integrations:

```typescript
// src/lib/services/integrationService.ts
import { prisma } from "@/lib/db";
import { tokenService } from "./tokenService";
import { getOAuthConfig, generateAuthUrl } from "../integrations/oauth-config";
import { Provider } from "@/types/integration";
import { PROVIDER_CONFIG } from "../integrations/providers";

export const integrationService = {
  /**
   * Get all available providers
   */
  async getProviders(userId: string): Promise<Provider[]> {
    // Get user's connected accounts
    const accounts = await prisma.account.findMany({
      where: {
        userId,
      },
      select: {
        provider: true,
      },
    });
    
    const connectedProviders = new Set(accounts.map(a => a.provider));
    
    // Return the providers with connection status
    return PROVIDER_CONFIG.map(provider => ({
      ...provider,
      connected: connectedProviders.has(provider.id),
    }));
  },
  
  /**
   * Start OAuth flow for a provider
   */
  async initiateOAuth(userId: string, providerId: string): Promise<string> {
    // Check if provider exists
    const config = getOAuthConfig(providerId);
    if (!config) {
      throw new Error(`Unknown provider: ${providerId}`);
    }
    
    // Generate the OAuth URL
    const authUrl = generateAuthUrl(providerId, userId);
    
    // Store the OAuth state
    // This would include tracking the state parameter for CSRF protection
    
    return authUrl;
  },
  
  /**
   * Handle OAuth callback and token exchange
   */
  async handleOAuthCallback(
    providerId: string,
    code: string,
    userId: string,
    state?: string
  ): Promise<boolean> {
    const config = getOAuthConfig(providerId);
    if (!config) {
      throw new Error(`Unknown provider: ${providerId}`);
    }
    
    // Exchange code for token - would use node-fetch or similar
    // Verify state if provided
    
    // Mock successful token response for now
    const tokenResponse = {
      access_token: "mock_access_token",
      refresh_token: "mock_refresh_token",
      expires_in: 3600,
      token_type: "Bearer",
    };
    
    // Store the tokens securely
    await tokenService.storeToken(userId, providerId, {
      accessToken: tokenResponse.access_token,
      refreshToken: tokenResponse.refresh_token,
      expiresAt: Math.floor(Date.now() / 1000) + tokenResponse.expires_in,
      tokenType: tokenResponse.token_type,
    });
    
    return true;
  },
  
  /**
   * Disconnect a provider
   */
  async disconnectProvider(userId: string, providerId: string): Promise<boolean> {
    // Remove token
    await tokenService.deleteToken(userId, providerId);
    
    return true;
  },
  
  /**
   * Check if a provider is connected
   */
  async isProviderConnected(userId: string, providerId: string): Promise<boolean> {
    const token = await tokenService.getToken(userId, providerId);
    return !!token && !tokenService.isTokenExpired(token.expiresAt);
  },
};
```

### API Client Implementation
Enhance the API client for third-party services:

```typescript
// src/lib/api/integrations.ts
import { apiClient } from './client';

export interface InitiateOAuthResponse {
  authUrl: string;
}

export interface OAuthCallbackParams {
  code: string;
  state?: string;
  providerId: string;
}

export interface ProviderConnectionStatus {
  connected: boolean;
  lastSynced?: string;
}

export const integrationsApi = {
  /**
   * Get all available integration providers with connection status
   */
  getProviders: () => 
    apiClient.get<Provider[]>('/integrations/services'),
  
  /**
   * Initiate OAuth flow for a provider
   */
  initiateOAuth: (providerId: string) => 
    apiClient.post<InitiateOAuthResponse>('/integrations/oauth/init', { providerId }),
  
  /**
   * Disconnect a provider
   */
  disconnectProvider: (providerId: string) => 
    apiClient.delete(`/integrations/services/${providerId}`),
  
  /**
   * Get connection status for a provider
   */
  getConnectionStatus: (providerId: string) => 
    apiClient.get<ProviderConnectionStatus>(`/integrations/services/${providerId}/status`),
  
  /**
   * Trigger a manual sync for a provider
   */
  syncProvider: (providerId: string) => 
    apiClient.post(`/integrations/services/${providerId}/sync`, {}),
  
  /**
   * Get sync status for all providers
   */
  getSyncStatus: () => 
    apiClient.get('/integrations/sync-status'),
};
```

## 4. Testing and Quality Framework

### Jest Configuration
Set up automated testing with Jest:

```typescript
// jest.config.ts
import type { Config } from 'jest';
import nextJest from 'next/jest';

const createJestConfig = nextJest({
  dir: './',
});

const config: Config = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  testEnvironment: 'jest-environment-jsdom',
  preset: 'ts-jest',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testMatch: [
    '**/__tests__/**/*.test.[jt]s?(x)',
    '**/?(*.)+(spec|test).[jt]s?(x)',
  ],
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{js,jsx,ts,tsx}',
    '!src/mock/**',
    '!**/*.config.*',
    '!**/node_modules/**',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};

export default createJestConfig(config);
```

### Example Test
Create a sample test for the API client:

```typescript
// src/lib/api/__tests__/client.test.ts
import { apiClient, ApiError } from '../client';
import fetchMock from 'jest-fetch-mock';

fetchMock.enableMocks();

describe('API Client', () => {
  beforeEach(() => {
    fetchMock.resetMocks();
  });

  it('should make a GET request successfully', async () => {
    const mockData = { success: true };
    fetchMock.mockResponseOnce(JSON.stringify(mockData));

    const result = await apiClient.get('/test');
    
    expect(result).toEqual(mockData);
    expect(fetchMock).toHaveBeenCalledWith('/api/test', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
  });

  it('should throw ApiError when response is not ok', async () => {
    fetchMock.mockResponseOnce(JSON.stringify({ message: 'Not found' }), { status: 404 });

    await expect(apiClient.get('/test')).rejects.toThrow(ApiError);
    await expect(apiClient.get('/test')).rejects.toMatchObject({
      status: 404,
      message: 'Not found',
    });
  });

  it('should make a POST request with correct body', async () => {
    const mockData = { id: 1 };
    const postData = { name: 'Test' };
    fetchMock.mockResponseOnce(JSON.stringify(mockData));

    const result = await apiClient.post('/test', postData);
    
    expect(result).toEqual(mockData);
    expect(fetchMock).toHaveBeenCalledWith('/api/test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(postData),
    });
  });
});
```

### E2E Testing with Playwright
Configure E2E testing with Playwright:

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html'],
    ['junit', { outputFile: 'test-results/e2e-junit.xml' }],
  ],
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 13'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

## 5. CI/CD Pipeline

### GitHub Actions Workflow
Set up a comprehensive CI/CD pipeline:

```yaml
# .github/workflows/ci.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main, master]
  pull_request:
    branches: [main, master]

jobs:
  lint:
    name: Lint Code
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - name: Install dependencies
        run: npm ci
      - name: Run ESLint
        run: npm run lint
        
  typecheck:
    name: Type Check
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - name: Install dependencies
        run: npm ci
      - name: Run TypeScript Check
        run: npm run typecheck
        
  test:
    name: Run Tests
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_USER: postgres
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: test_db
        ports:
          - 5432:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - name: Install dependencies
        run: npm ci
      - name: Generate Prisma Client
        run: npx prisma generate
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test_db
      - name: Run unit tests
        run: npm test -- --coverage
      - name: Upload coverage reports
        uses: codecov/codecov-action@v3
        
  e2e-tests:
    name: E2E Tests
    runs-on: ubuntu-latest
    needs: [lint, typecheck, test]
    if: ${{ github.event_name == 'pull_request' || github.ref == 'refs/heads/main' || github.ref == 'refs/heads/master' }}
    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_USER: postgres
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: test_db
        ports:
          - 5432:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - name: Install dependencies
        run: npm ci
      - name: Install Playwright
        run: npx playwright install --with-deps
      - name: Generate Prisma Client
        run: npx prisma generate
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test_db
      - name: Run Playwright tests
        run: npx playwright test
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test_db
          NEXTAUTH_SECRET: test_secret
          NEXTAUTH_URL: http://localhost:3000
      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 30
          
  security-scan:
    name: Security Scan
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run Snyk to check for vulnerabilities
        uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
        with:
          args: --severity-threshold=high
      - name: Run OWASP Dependency-Check
        uses: dependency-check/Dependency-Check_Action@main
        with:
          project: 'Life Navigator'
          path: '.'
          format: 'HTML'
          out: 'reports'
          args: >
            --enableRetired
            --enableExperimental
      - name: Upload dependency check report
        uses: actions/upload-artifact@v3
        with:
          name: dependency-check-report
          path: reports
          
  build:
    name: Build Application
    needs: [lint, typecheck, test]
    if: ${{ github.event_name == 'push' && (github.ref == 'refs/heads/main' || github.ref == 'refs/heads/master') }}
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - name: Install dependencies
        run: npm ci
      - name: Generate Prisma Client
        run: npx prisma generate
      - name: Build Application
        run: npm run build
      - name: Upload build artifact
        uses: actions/upload-artifact@v3
        with:
          name: build-output
          path: .next/
          retention-days: 7
          
  deploy-dev:
    name: Deploy to Development
    needs: [build, e2e-tests, security-scan]
    if: ${{ github.event_name == 'push' && github.ref == 'refs/heads/main' }}
    runs-on: ubuntu-latest
    environment: development
    steps:
      - uses: actions/checkout@v4
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1
      - name: Download build artifact
        uses: actions/download-artifact@v3
        with:
          name: build-output
          path: .next/
      - name: Deploy to AWS
        run: |
          cd terraform
          terraform init
          terraform apply -auto-approve -var="environment=dev"
```

## 6. Multi-Agent Architecture

### Agent Configuration
Set up the foundation for a multi-agent system:

```typescript
// src/lib/agents/agent-config.ts
export interface AgentConfig {
  id: string;
  name: string;
  description: string;
  domain: 'finance' | 'career' | 'education' | 'health' | 'comprehensive';
  capabilities: string[];
  requiresSubscription: boolean;
  isLocalOnly: boolean;
}

export const AGENT_CONFIG: AgentConfig[] = [
  {
    id: 'financial-advisor',
    name: 'Financial Advisor',
    description: 'Analyzes financial data and provides personalized advice',
    domain: 'finance',
    capabilities: [
      'Budget analysis',
      'Investment recommendations',
      'Expense categorization',
      'Savings projections'
    ],
    requiresSubscription: false,
    isLocalOnly: false,
  },
  {
    id: 'career-coach',
    name: 'Career Coach',
    description: 'Provides guidance on career development and job search',
    domain: 'career',
    capabilities: [
      'Skills gap analysis',
      'Resume optimization',
      'Job market trends',
      'Networking strategies'
    ],
    requiresSubscription: false,
    isLocalOnly: false,
  },
  {
    id: 'education-planner',
    name: 'Education Planner',
    description: 'Helps plan educational goals and track progress',
    domain: 'education',
    capabilities: [
      'Course recommendations',
      'Study schedule optimization',
      'Learning path creation',
      'Certification tracking'
    ],
    requiresSubscription: false,
    isLocalOnly: false,
  },
  {
    id: 'health-monitor',
    name: 'Health Monitor',
    description: 'Tracks health metrics and provides wellness recommendations',
    domain: 'health',
    capabilities: [
      'Health metrics analysis',
      'Preventive care reminders',
      'Wellness recommendations',
      'Medication tracking'
    ],
    requiresSubscription: false,
    isLocalOnly: true, // Health data is processed locally
  },
  {
    id: 'life-coordinator',
    name: 'Life Coordinator',
    description: 'Coordinates across all life domains for comprehensive planning',
    domain: 'comprehensive',
    capabilities: [
      'Cross-domain analysis',
      'Life milestone planning',
      'Dependency tracking',
      'Decision support'
    ],
    requiresSubscription: true,
    isLocalOnly: false,
  }
];
```

### Agent Base Interface
Create the base agent interface:

```typescript
// src/lib/agents/base-agent.ts
import { User } from '@prisma/client';

export interface AgentContext {
  userId: string;
  userProfile?: Partial<User>;
  domain: string;
  timezone: string;
  language: string;
  sessionId: string;
}

export interface AgentRequest {
  prompt: string;
  context?: Record<string, any>;
}

export interface AgentResponse {
  message: string;
  data?: Record<string, any>;
  actions?: AgentAction[];
}

export interface AgentAction {
  type: 'navigate' | 'notification' | 'task' | 'download' | 'external';
  payload: Record<string, any>;
}

export interface BaseAgent {
  initialize(context: AgentContext): Promise<boolean>;
  process(request: AgentRequest): Promise<AgentResponse>;
  terminate(): Promise<void>;
}
```

### Agent Factory
Create a factory to instantiate agents based on domain:

```typescript
// src/lib/agents/agent-factory.ts
import { BaseAgent, AgentContext } from './base-agent';
import { AGENT_CONFIG } from './agent-config';
import { FinancialAgent } from './financial-agent';
import { CareerAgent } from './career-agent';
import { EducationAgent } from './education-agent';
import { HealthAgent } from './health-agent';
import { LifeCoordinatorAgent } from './life-coordinator-agent';

export class AgentFactory {
  static async createAgent(agentId: string, context: AgentContext): Promise<BaseAgent> {
    const config = AGENT_CONFIG.find(agent => agent.id === agentId);
    
    if (!config) {
      throw new Error(`Unknown agent: ${agentId}`);
    }
    
    let agent: BaseAgent;
    
    switch (agentId) {
      case 'financial-advisor':
        agent = new FinancialAgent();
        break;
      case 'career-coach':
        agent = new CareerAgent();
        break;
      case 'education-planner':
        agent = new EducationAgent();
        break;
      case 'health-monitor':
        agent = new HealthAgent();
        break;
      case 'life-coordinator':
        agent = new LifeCoordinatorAgent();
        break;
      default:
        throw new Error(`Agent implementation not found: ${agentId}`);
    }
    
    // Initialize the agent with context
    await agent.initialize({
      ...context,
      domain: config.domain,
    });
    
    return agent;
  }
}
```

## 7. Further Steps and Recommendations

### Environment Setup
1. Create `.env.example` and `.env.local` files with all required variables
2. Document required API keys and credentials for each integration
3. Set up secrets management for production using AWS Secrets Manager or HashiCorp Vault

### Security Enhancements
1. Implement Content Security Policy (CSP) headers
2. Set up CORS configuration with appropriate origins
3. Configure rate limiting for all API endpoints
4. Add input validation on all API routes using a schema validation library

### Testing Improvements
1. Create comprehensive test suites for all major components
2. Set up integration tests for service interactions
3. Implement visual regression testing for UI components
4. Create mock services for third-party integrations

### Infrastructure
1. Complete Terraform configuration for AWS resources
2. Set up monitoring and alerting with CloudWatch
3. Configure auto-scaling for handling variable loads
4. Implement database backups and disaster recovery plans

### Documentation
1. Create comprehensive API documentation with Swagger/OpenAPI
2. Document all data models and relationships
3. Add integration guides for third-party services
4. Create developer onboarding documentation

## Next Steps for Implementation

1. Implement environment configuration system
2. Set up authentication with proper token handling
3. Establish integration framework for third-party services
4. Implement automated testing with coverage requirements
5. Set up CI/CD pipeline with quality gates
6. Configure database migrations and seeding
7. Implement base agent framework
8. Create comprehensive documentation