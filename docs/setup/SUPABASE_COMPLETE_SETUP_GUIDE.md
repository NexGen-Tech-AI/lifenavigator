# Complete Supabase Setup Guide for LifeNavigator

## Prerequisites
- Node.js 18+ and pnpm installed
- A GitHub account (for OAuth setup)
- Google Cloud Console access (for Google OAuth)
- Azure AD access (for Microsoft OAuth)
- LinkedIn Developer account (for LinkedIn OAuth)

## Step 1: Create Supabase Project

1. **Go to [https://supabase.com](https://supabase.com) and sign up/login**

2. **Create a new project:**
   - Click "New project"
   - Choose your organization
   - Project name: `lifenavigator`
   - Database password: Generate a strong password (save this!)
   - Region: Choose closest to your users
   - Click "Create new project"

3. **Wait for project to be ready** (takes 2-3 minutes)

## Step 2: Get Your Supabase Credentials

1. **Go to Settings > API in your Supabase dashboard**

2. **Copy these values to your `.env.local` file:**
   ```bash
   # Create .env.local if it doesn't exist
   cp .env.local.example .env.local
   ```

3. **Update `.env.local` with your values:**
   ```env
   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL="https://YOUR_PROJECT_REF.supabase.co"
   NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key-here"
   SUPABASE_SERVICE_ROLE_KEY="your-service-role-key-here"
   ```

## Step 3: Run Database Migrations

1. **Install Supabase CLI (if not already installed):**
   ```bash
   npm install -g supabase
   ```

2. **Link your project:**
   ```bash
   supabase link --project-ref YOUR_PROJECT_REF
   ```

3. **Run the migrations:**
   ```bash
   # Option 1: Use the provided migration file
   supabase db push --file supabase/migrations/001_initial_schema.sql

   # Option 2: Use the TypeScript setup script
   tsx scripts/setup-supabase-db.ts
   ```

## Step 4: Configure Authentication Providers

### Enable Email/Password Authentication (Already enabled by default)

1. Go to **Authentication > Providers** in Supabase dashboard
2. Ensure **Email** is enabled

### Configure Google OAuth

1. **Go to [Google Cloud Console](https://console.cloud.google.com/)**

2. **Create a new project or select existing**

3. **Enable Google+ API:**
   - Go to "APIs & Services" > "Library"
   - Search for "Google+ API"
   - Click "Enable"

4. **Create OAuth 2.0 credentials:**
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth client ID"
   - Application type: "Web application"
   - Name: "LifeNavigator"
   - Authorized JavaScript origins:
     ```
     http://localhost:3000
     https://YOUR_PROJECT_REF.supabase.co
     ```
   - Authorized redirect URIs:
     ```
     https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback
     ```
   - Click "Create"

5. **Copy the Client ID and Client Secret**

6. **In Supabase Dashboard:**
   - Go to Authentication > Providers
   - Find Google
   - Enable it
   - Paste your Client ID and Client Secret
   - Click "Save"

### Configure Microsoft (Azure AD) OAuth

1. **Go to [Azure Portal](https://portal.azure.com/)**

2. **Register an application:**
   - Go to "Azure Active Directory" > "App registrations"
   - Click "New registration"
   - Name: "LifeNavigator"
   - Supported account types: "Accounts in any organizational directory and personal Microsoft accounts"
   - Redirect URI: 
     - Platform: "Web"
     - URI: `https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback`
   - Click "Register"

3. **Get credentials:**
   - Copy the "Application (client) ID"
   - Go to "Certificates & secrets"
   - Click "New client secret"
   - Add a description and expiry
   - Copy the secret value immediately

4. **In Supabase Dashboard:**
   - Go to Authentication > Providers
   - Find Azure (Microsoft)
   - Enable it
   - Paste your Client ID and Client Secret
   - Click "Save"

### Configure LinkedIn OAuth

1. **Go to [LinkedIn Developers](https://www.linkedin.com/developers/)**

2. **Create an app:**
   - Click "Create app"
   - App name: "LifeNavigator"
   - LinkedIn Page: Select or create one
   - App logo: Upload your logo
   - Click "Create app"

3. **Configure OAuth:**
   - Go to "Auth" tab
   - Add redirect URL: `https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback`
   - Copy Client ID and Client Secret

4. **Request OAuth 2.0 scopes:**
   - Under "OAuth 2.0 scopes"
   - Add: `r_emailaddress`, `r_liteprofile`

5. **In Supabase Dashboard:**
   - Go to Authentication > Providers
   - Find LinkedIn
   - Enable it
   - Paste your Client ID and Client Secret
   - Click "Save"

## Step 5: Configure Redirect URLs

1. **In Supabase Dashboard, go to Authentication > URL Configuration**

2. **Add these URLs:**
   - Site URL: `http://localhost:3000` (for development)
   - Redirect URLs:
     ```
     http://localhost:3000/auth/callback
     http://localhost:3000/dashboard
     https://your-production-domain.com/auth/callback
     https://your-production-domain.com/dashboard
     ```

## Step 6: Create Demo Account

1. **Run the demo account creation script:**
   ```bash
   tsx scripts/create-supabase-demo.ts
   ```

   This will create a demo user with:
   - Email: `demo@lifenavigator.tech`
   - Password: `DemoPassword123`
   - Sample data for testing

## Step 7: Test Your Setup

1. **Start the development server:**
   ```bash
   pnpm run dev
   ```

2. **Test each authentication method:**
   - Email/Password login with demo account
   - Google OAuth
   - Microsoft OAuth
   - LinkedIn OAuth

3. **Verify database connection:**
   - Login should redirect to dashboard
   - User profile should be created
   - Check Supabase dashboard > Table Editor > users table

## Step 8: Security Configuration

1. **Enable Row Level Security (RLS):**
   ```sql
   -- This is already included in the migration, but verify it's enabled
   ALTER TABLE users ENABLE ROW LEVEL SECURITY;
   ALTER TABLE financial_accounts ENABLE ROW LEVEL SECURITY;
   -- ... etc for all tables
   ```

2. **Configure email templates** (optional):
   - Go to Authentication > Email Templates
   - Customize confirmation, reset password, etc.

3. **Set up custom domain** (optional):
   - Go to Settings > Custom Domains
   - Add your domain for branded auth emails

## Troubleshooting

### Common Issues:

1. **"Invalid API key" error:**
   - Double-check your `.env.local` values
   - Ensure no extra spaces or quotes
   - Restart dev server after changing env vars

2. **OAuth redirect errors:**
   - Verify redirect URLs match exactly
   - Check provider is enabled in Supabase
   - Ensure credentials are correct

3. **Database connection issues:**
   - Check if migrations ran successfully
   - Verify RLS policies are correct
   - Check Supabase logs for errors

4. **Demo account not working:**
   - Run the demo creation script again
   - Check if user exists in Supabase dashboard
   - Verify password is correct

### Useful Commands:

```bash
# Check Supabase status
supabase status

# View migration status
supabase db migrations list

# Reset database (WARNING: deletes all data)
supabase db reset

# View logs
supabase db logs
```

## Next Steps

1. **Configure additional features:**
   - Set up Plaid for financial integration
   - Configure AWS S3 for document storage
   - Set up email notifications

2. **Deploy to production:**
   - Update environment variables in Vercel/hosting platform
   - Add production domain to Supabase redirect URLs
   - Enable additional security features

## Support

- Supabase Documentation: https://supabase.com/docs
- LifeNavigator Issues: https://github.com/your-repo/issues
- Supabase Discord: https://discord.supabase.com/