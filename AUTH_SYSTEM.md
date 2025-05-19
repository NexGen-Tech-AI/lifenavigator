# LifeNavigator Authentication System

This document explains the authentication system architecture, implementation details, and deployment considerations for the LifeNavigator application.

## Overview

The LifeNavigator auth system is built on NextAuth.js and uses a combination of JWT tokens and database sessions for authentication. It supports both credential-based authentication (email/password) and is prepared for OAuth integration with providers like Google, Facebook, and Twitter.

## System Architecture

The authentication system has the following components:

1. **NextAuth.js Configuration**: Central configuration in `/src/app/api/auth/NextAuth.ts`
2. **Auth API Routes**: Endpoints for login, registration, and session management in `/src/app/api/auth/`
3. **Database Models**: User, Account, Session, and other auth-related models in Prisma schema
4. **Authentication Components**: Login and registration forms in `/src/components/auth/`
5. **Middleware**: Protects routes and handles rate limiting in `/src/middleware.ts`

## Authentication Flow

### Login Flow

1. User enters credentials on the login form
2. Credentials are sent to the NextAuth API route (`/api/auth/[...nextauth]/route.ts`)
3. NextAuth validates credentials against the database
4. If valid, NextAuth issues a JWT token and sets cookies
5. User is redirected to the dashboard or other protected page

### Registration Flow

1. User fills out the registration form
2. Form data is validated on the client side
3. Data is submitted to the registration API (`/api/auth/register/route.ts`)
4. API validates the data and creates a new user in the database
5. User is redirected to the login page to sign in with their new credentials

### Demo Account

The system includes a special demo account that always works, even if the database connection fails:

- Email: `demo@example.com`
- Password: `password`

This account is hardcoded in both the frontend and backend to ensure it's always accessible for demonstration purposes. In a real database deployment, this account will be automatically created if it doesn't exist.

## Database Configuration

The system can work with either:

1. **Real PostgreSQL Database**: For production and full-featured development
2. **Mock Database**: An in-memory database for development and testing

To use the mock database, set `USE_MOCK_DB=true` in your `.env.local` file.

## Security Features

The authentication system includes several security features:

1. **Password Hashing**: All passwords are hashed using bcrypt
2. **CSRF Protection**: Forms include CSRF tokens for protection
3. **Rate Limiting**: API endpoints have rate limiting to prevent brute force attacks
4. **Token Rotation**: JWTs are rotated regularly
5. **Secure Cookies**: Cookies are set with HttpOnly and secure flags in production

## Deployment Considerations

When deploying to production:

1. Set `NEXTAUTH_SECRET` with a strong, unique value
2. Configure `NEXTAUTH_URL` to match your deployment URL
3. Set up the PostgreSQL database and provide connection details
4. Configure OAuth providers if needed
5. Set `NODE_ENV=production` to enable enhanced security features

## Fallback Mechanisms

The system includes fallback mechanisms to ensure authentication works even in degraded states:

1. **Database Fallback**: If the PostgreSQL connection fails, the system can fall back to the mock database
2. **Demo Account Fallback**: The demo account always works, even without database access
3. **Error Handling**: All authentication operations have proper error handling

## Troubleshooting

If you encounter authentication issues:

1. Check database connectivity using `/api/db-test`
2. Ensure environment variables are correctly set
3. Try using the mock database by setting `USE_MOCK_DB=true`
4. Reset and ensure the demo account exists with `/api/auth/ensure-demo`
5. Run the auth repair script: `node scripts/fix-auth.js`

## OAuth Integration (Future)

The system is prepared for OAuth integration with:

- Google
- Facebook
- Twitter

To enable these providers, you'll need to:

1. Register your application with each provider
2. Add client IDs and secrets to your environment variables
3. Configure the callback URLs for each provider

## Multi-factor Authentication (MFA)

The database schema includes tables for MFA, but the feature is not fully implemented yet. Future versions will support:

- TOTP-based authentication
- Recovery codes
- Device remembering

## Database Schema

The authentication system uses the following tables:

- `users`: User accounts
- `accounts`: OAuth provider accounts linked to users
- `sessions`: Session data
- `verificationTokens`: Email verification tokens
- `mfaSetup`, `mfaSecret`, `mfaRecoveryCode`: MFA implementation (future)
- `revokedToken`: Tracks revoked JWTs
- `securityAuditLog`: Audit trail for security events

## Future Enhancements

Planned enhancements to the authentication system include:

1. Complete MFA implementation
2. OAuth provider integration
3. Email verification
4. Password reset functionality
5. Enhanced session management
6. IP-based security controls

## Local Development

For local development, you can use the mock database by setting `USE_MOCK_DB=true` in your `.env.local` file. This allows you to develop without needing a PostgreSQL database.

To test with a real database, ensure your PostgreSQL instance is running and correctly configured in your environment variables.