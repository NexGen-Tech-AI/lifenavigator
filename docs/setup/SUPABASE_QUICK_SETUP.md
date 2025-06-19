# Supabase Quick Setup Guide

## Option 1: Local Development (Recommended)

Run this command:
```bash
./scripts/setup-local-supabase.sh
```

## Option 2: Cloud Supabase (Free tier)

1. **Create Supabase Account**
   - Go to https://supabase.com
   - Sign up for free account

2. **Create New Project**
   - Click "New Project"
   - Name: `lifenavigator`
   - Database Password: (save this!)
   - Region: Choose closest to you
   - Click "Create new project"

3. **Get Your Credentials**
   - Go to Settings → API
   - Copy these values:
     - Project URL (looks like: https://abcdefghijk.supabase.co)
     - anon public key
     - service_role secret key

4. **Update .env.local**
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
   ```

5. **Run Migrations**
   - Go to SQL Editor in Supabase Dashboard
   - Copy and run contents of:
     - `supabase/migrations/001_initial_schema.sql`
     - `supabase/migrations/002_usage_tracking_and_tiers.sql`

6. **Create Demo Account**
   ```bash
   npx tsx scripts/create-demo-account.ts
   ```

## Option 3: Use Mock Client (No Database)

If you just want to test the UI without a database:

1. Keep the placeholder values in `.env.local`
2. The app will automatically use the mock client
3. Login with any email/password (it will accept anything)

## Troubleshooting

- **"fetch failed" error**: Your Supabase URL is not configured
- **"Auth user already exists"**: The demo account was partially created, run the script again
- **"Invalid API key"**: Check that you copied the keys correctly

## Next Steps

Once setup is complete:
1. Start the app: `npm run dev`
2. Login with demo account: `demo@lifenavigator.ai` / `demo123`
3. Or create a new account via signup