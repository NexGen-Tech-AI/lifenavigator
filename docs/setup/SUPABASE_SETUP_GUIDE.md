# Supabase Setup Guide for LifeNavigator

This guide will help you set up LifeNavigator with Supabase as the backend.

## Prerequisites

- Node.js 18+ installed
- A Supabase account (free tier works great)
- Git installed

## Step 1: Create a Supabase Project

1. Go to [app.supabase.com](https://app.supabase.com)
2. Click "New project"
3. Fill in the project details:
   - Project name: `lifenavigator`
   - Database password: Choose a strong password (save this!)
   - Region: Choose the closest to your users
   - Pricing plan: Free tier is perfect for starting

## Step 2: Get Your Supabase Credentials

1. Once your project is created, go to Settings → API
2. Copy these values:
   - `Project URL` → This is your `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → This is your `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → This is your `SUPABASE_SERVICE_ROLE_KEY` (keep this secret!)

## Step 3: Set Up Environment Variables

1. Copy the example environment file:
```bash
cp .env.supabase.example .env.local
```

2. Edit `.env.local` and add your Supabase credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## Step 4: Run Database Migrations

1. Go to your Supabase dashboard
2. Click on "SQL Editor" in the sidebar
3. Click "New query"
4. Copy the contents of `supabase/migrations/001_initial_schema.sql`
5. Paste it into the SQL editor and click "Run"

## Step 5: Create Storage Buckets

In the Supabase SQL editor, run:

```sql
-- Create storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES 
  ('financial-documents', 'financial-documents', false),
  ('profile-images', 'profile-images', false);

-- Create storage policies
CREATE POLICY "Users can upload own documents" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'financial-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view own documents" ON storage.objects
  FOR SELECT USING (bucket_id = 'financial-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete own documents" ON storage.objects
  FOR DELETE USING (bucket_id = 'financial-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Profile images policies
CREATE POLICY "Users can upload own profile image" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'profile-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Anyone can view profile images" ON storage.objects
  FOR SELECT USING (bucket_id = 'profile-images');

CREATE POLICY "Users can update own profile image" ON storage.objects
  FOR UPDATE USING (bucket_id = 'profile-images' AND auth.uid()::text = (storage.foldername(name))[1]);
```

## Step 6: Create Demo Account

1. Make sure you have the required dependencies:
```bash
pnpm install
```

2. Run the demo account creation script:
```bash
npx tsx scripts/create-supabase-demo.ts
```

This will create a demo account with:
- Email: `demo@lifenavigator.ai`
- Password: `demo123456`
- Pre-populated financial data

## Step 7: Configure Authentication

1. In Supabase dashboard, go to Authentication → Settings
2. Configure the following:
   - **Email Auth**: Enable email/password authentication
   - **Email Templates**: Customize the confirmation and password reset emails
   - **URL Configuration**:
     - Site URL: `http://localhost:3000` (for development)
     - Redirect URLs: Add `http://localhost:3000/auth/callback`

## Step 8: Start the Development Server

```bash
pnpm dev
```

Visit `http://localhost:3000` and you should see the login page!

## Step 9: Test the Application

1. Click "Try Demo Account" on the login page
2. Or create a new account with your email
3. Explore the dashboard with pre-populated data

## Optional: Set Up Plaid Integration

If you want to enable bank account connections:

1. Sign up for a [Plaid account](https://dashboard.plaid.com/signup)
2. Get your Plaid credentials from the dashboard
3. Add them to `.env.local`:
```env
PLAID_CLIENT_ID=your-plaid-client-id
PLAID_SECRET=your-plaid-secret
PLAID_ENV=sandbox
ENABLE_PLAID_INTEGRATION=true
```

## Deployment to Production

### Vercel Deployment (Recommended)

1. Push your code to GitHub
2. Import your project to Vercel
3. Add all environment variables from `.env.local` to Vercel
4. Update Supabase Authentication settings:
   - Site URL: `https://your-app.vercel.app`
   - Redirect URLs: Add `https://your-app.vercel.app/auth/callback`
5. Deploy!

### Other Platforms

The app can be deployed to any platform that supports Next.js:
- Netlify
- AWS Amplify
- Digital Ocean App Platform
- Self-hosted with Docker

## Troubleshooting

### "Unauthorized" errors
- Check that your Supabase keys are correctly set in `.env.local`
- Ensure cookies are enabled in your browser
- Try clearing your browser cache

### Database errors
- Verify all migrations have been run
- Check RLS policies are correctly set up
- Ensure your database password is correct

### Authentication issues
- Verify email templates are configured in Supabase
- Check that redirect URLs are correctly set
- Ensure your site URL matches your actual domain

## Security Best Practices

1. **Never commit `.env.local`** - It contains sensitive keys
2. **Use RLS policies** - All tables have Row Level Security enabled
3. **Validate all inputs** - The API routes validate data before saving
4. **Keep service role key secret** - Only use it on the server side
5. **Enable 2FA** - For production Supabase dashboard access

## Next Steps

1. Customize the UI theme in `tailwind.config.js`
2. Add more integrations (email, calendar, etc.)
3. Implement additional features from the roadmap
4. Set up monitoring with Supabase's built-in analytics

## Support

- Supabase Documentation: https://supabase.com/docs
- LifeNavigator Issues: https://github.com/yourusername/lifenavigator/issues
- Supabase Discord: https://discord.supabase.com