# LifeNavigator Demo Accounts

## Available Demo Accounts

The application is currently running in **mock authentication mode** (no Supabase configured). You can login with any of these accounts:

### 1. Default Demo Account
- **Email:** demo@lifenavigator.ai
- **Password:** demo123
- **Purpose:** General demo and exploration

### 2. Timothy's Account
- **Email:** timothy@riffeandassociates.com  
- **Password:** Sushi!$#1
- **Purpose:** Personal testing account

### 3. Plaid Integration Demo Account
- **Email:** plaid-demo@lifenavigator.ai
- **Password:** plaid-demo-2024
- **Purpose:** Testing Plaid bank integration features

## How to Login

1. Navigate to http://localhost:3001/auth/login
2. Enter one of the email/password combinations above
3. Click "Sign in"
4. You'll be redirected to the dashboard

## Quick Login Options

- Click "Try Demo Account" button for instant access with the default demo account
- Use the login form for specific accounts

## Troubleshooting

If login fails:
1. Make sure the dev server is running (`pnpm run dev`)
2. Clear browser cache/cookies
3. Check the browser console for errors

## Production Setup

To use custom email addresses in production:
1. Set up Supabase (`pnpm run setup:supabase`)
2. Create users in Supabase Auth dashboard
3. Update `.env.local` with Supabase credentials