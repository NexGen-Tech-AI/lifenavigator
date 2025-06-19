# Development Login Guide

This document provides information on using the development login system for LifeNavigator.

## Demo Account

For testing and development purposes, you can use the following credentials:

- **Email**: `demo@example.com`
- **Password**: `password`

This demo account has a completed setup and full access to all features.

## Alternative Test Account

An alternative testing account is also available:

- **Email**: `test@example.com`
- **Password**: `password`

This account can be useful for testing different user permissions and scenarios.

## Login Methods

### 1. Normal Login Form

Enter the demo credentials in the login form at `/auth/login`

### 2. "Try Demo Account" Button

Click the "Try Demo Account" button on the login page for a one-click login experience.

### 3. OAuth Providers (Mocked)

In development, the OAuth providers (Google, Twitter, Facebook) are configured but will not connect to real providers.

## Development Environment

The application is configured to use a mock database in development, which includes:

- Hardcoded demo users
- No actual database connection required
- In-memory data storage (resets on application restart)

## Important Notes

1. Do not use real credentials in the development environment
2. The mock database does not persist data between application restarts
3. For production deployment, a real database connection will be required

## Troubleshooting

If you encounter issues with the login system:

1. Check console logs for detailed error messages
2. Ensure you're using the exact credentials as specified above
3. Try clearing browser cookies and storage if login state persists incorrectly
4. Restart the development server if you suspect stale state