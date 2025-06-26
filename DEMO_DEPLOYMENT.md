# Demo Deployment Guide

This guide explains how to deploy Life Navigator in demo mode on Vercel.

## What is Demo Mode?

Demo mode allows users to explore the Life Navigator dashboard without logging in. It shows pre-populated demo data for a fictional user (Alex Johnson) and bypasses all authentication requirements.

## Setting Up Demo Mode on Vercel

### 1. Set Environment Variables

In your Vercel project settings, add these environment variables:

```bash
NEXT_PUBLIC_DEMO_MODE=true
NEXT_PUBLIC_SKIP_AUTH=true

# Add your Supabase credentials (even if not used in demo mode)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 2. Deploy to Vercel

```bash
vercel --prod
```

### 3. Enable Password Protection (Recommended)

Since the demo bypasses authentication, protect your deployment with Vercel's password protection:

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Advanced** → **Password Protection**
3. Enable password protection
4. Set a password (e.g., `demo2024`)
5. Share this password with people who need access to the demo

## Demo Mode Features

- **No Login Required**: Users go straight to the dashboard
- **Pre-populated Data**: Shows realistic financial, health, career, and education data
- **Read-Only**: All data modifications are disabled
- **Demo Banner**: Shows a yellow banner indicating demo mode
- **Mock API Responses**: API routes return demo data without database queries

## Demo User Profile

- **Name**: Alex Johnson
- **Age**: 35
- **Occupation**: Senior Software Engineer
- **Location**: Austin, TX
- **Family**: Married, 1 child
- **Financial Profile**: 
  - Net Worth: ~$500,000
  - Annual Income: $200,000 (household)
  - Various accounts (checking, savings, investment, retirement)

## Switching Between Modes

### To Enable Demo Mode:
Set environment variables:
```
NEXT_PUBLIC_DEMO_MODE=true
NEXT_PUBLIC_SKIP_AUTH=true
```

### To Disable Demo Mode:
Remove or set to false:
```
NEXT_PUBLIC_DEMO_MODE=false
NEXT_PUBLIC_SKIP_AUTH=false
```

## Security Considerations

1. **Always use password protection** on demo deployments
2. Demo mode bypasses all authentication
3. No real user data is accessible in demo mode
4. API routes return only mock data
5. Consider using a separate Vercel project for demos

## Troubleshooting

### Blank Screen
- Ensure all environment variables are set correctly
- Check Vercel function logs for errors
- Verify the deployment completed successfully

### Authentication Issues
- Make sure `NEXT_PUBLIC_DEMO_MODE` and `NEXT_PUBLIC_SKIP_AUTH` are both `true`
- Clear browser cache and cookies
- Try incognito/private browsing mode

### API Errors
- Check that demo mode checks are in place in API routes
- Verify mock data is being returned instead of database queries