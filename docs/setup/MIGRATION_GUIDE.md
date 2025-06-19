# Database Migration Guide for LifeNavigator

## Current Application Status Report 📊

### 🔐 Security Protocols: **EXCELLENT**
- ✅ **Authentication**: Fully migrated to Supabase Auth (NextAuth removed)
- ✅ **Row Level Security**: Comprehensive RLS policies on all tables
- ✅ **Rate Limiting**: Implemented on auth, API, and upload endpoints
- ✅ **Security Headers**: CSP, HSTS, X-Frame-Options, etc. all configured
- ✅ **Input Validation**: Zod schemas on all API routes
- ✅ **CSRF Protection**: Built into Supabase Auth
- ✅ **Webhook Security**: Signature verification implemented

### 🔒 Encryption Status: **PRODUCTION-READY**
- ✅ **Field-Level Encryption**: AES-256-GCM with AWS KMS
- ✅ **Encrypted Fields**:
  - User: MFA secrets, phone numbers
  - Financial: Account numbers, routing numbers, Plaid tokens
  - Integrations: OAuth tokens, webhook secrets
  - Health: Medical records (entire details object)
- ✅ **Document Encryption**: S3 with KMS server-side encryption
- ✅ **Token Storage**: All sensitive tokens encrypted before storage
- ✅ **Audit Logging**: All encryption operations logged

### 👤 Demo Account Status: **READY TO DEPLOY**
- ✅ Schema includes demo account creation function
- ✅ Demo user ID: `11111111-1111-1111-1111-111111111111`
- ✅ Demo email: `demo@lifenavigator.ai`
- ✅ Demo password: `demo123`
- ✅ Pre-populated with sample data
- ✅ Protected from modifications via RLS

## Step 1: Set Up Supabase Project

1. **Create a Supabase account** (if you don't have one):
   ```
   https://app.supabase.com
   ```

2. **Create a new project**:
   - Project name: `lifenavigator`
   - Database password: Choose a strong password
   - Region: Choose closest to your users
   - Pricing plan: Free tier is fine for pilot

3. **Get your credentials**:
   - Go to Settings → API
   - Copy these values:
     - Project URL (looks like: https://xxxxx.supabase.co)
     - Anon public key
     - Service role key (keep this secret!)

## Step 2: Configure Environment Variables

Create or update your `.env.local` file:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000

# AWS (for document storage)
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_VAULT_BUCKET=lifenavigator-vault-dev
AWS_KMS_KEY_ID=your_kms_key_id

# Plaid (optional for now)
PLAID_CLIENT_ID=your_plaid_client_id
PLAID_SECRET=your_plaid_secret
PLAID_ENV=sandbox
PLAID_WEBHOOK_SECRET=your_webhook_secret

# Encryption
ENCRYPTION_KEY=generate_32_char_random_string_here
JWT_SECRET=another_32_char_random_string_here
```

## Step 3: Apply Database Migration

### Option A: Using Supabase Dashboard (Recommended)

1. **Open your Supabase project dashboard**
2. **Go to SQL Editor** (left sidebar)
3. **Create a new query**
4. **Copy the entire contents** of:
   ```
   supabase/migrations/20250108_initial_schema.sql
   ```
5. **Paste into the SQL Editor**
6. **Click "Run"** (or press Ctrl+Enter)
7. **Check for success** - should see "Success. No rows returned"

### Option B: Using Supabase CLI

```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Link your project
supabase link --project-ref your-project-ref

# Apply migration
supabase db push
```

## Step 4: Verify Migration Success

Run this query in the SQL Editor to verify all tables were created:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE'
ORDER BY table_name;
```

You should see:
- audit_logs
- career_profiles
- documents
- financial_accounts
- health_records
- integrations
- transactions
- users

## Step 5: Verify Demo Account

Run this query to check if the demo account was created:

```sql
SELECT id, email, name, is_demo_account, subscription_tier 
FROM public.users 
WHERE email = 'demo@lifenavigator.ai';
```

If not created, run:

```sql
SELECT create_demo_account();
```

## Step 6: Test Authentication

1. **Start the development server**:
   ```bash
   npm run dev
   ```

2. **Test demo login**:
   - Go to http://localhost:3000/auth/login
   - Email: `demo@lifenavigator.ai`
   - Password: `demo123`
   - Should redirect to dashboard

## Step 7: Configure AWS (Optional for Document Storage)

1. **Create S3 bucket** for document storage
2. **Create KMS key** for encryption
3. **Set up IAM user** with appropriate permissions
4. **Update `.env.local`** with AWS credentials

## Troubleshooting

### "Permission denied" errors
- Ensure you're using the service role key for admin operations
- Check that RLS policies were created

### Demo login fails
- Verify demo account exists in both auth.users and public.users
- Check Supabase logs for auth errors
- Ensure NEXT_PUBLIC_SUPABASE_URL is correct

### Migration fails
- Check for existing tables (migration is idempotent)
- Run in smaller chunks if needed
- Check Supabase logs for detailed errors

## Security Checklist ✅

- [ ] Service role key is NOT exposed to client
- [ ] Environment variables are in `.env.local` (not committed)
- [ ] AWS credentials are properly secured
- [ ] Plaid credentials are in sandbox mode for testing
- [ ] All production URLs use HTTPS
- [ ] Database password is strong and unique

## Next Steps

1. **Configure Plaid** for financial account connections
2. **Set up AWS S3** for document storage
3. **Configure email** for notifications (optional)
4. **Set up monitoring** for production
5. **Deploy to Vercel** with production env vars

## Production Deployment

When ready for production:
1. Create a production Supabase project
2. Use production AWS credentials
3. Switch Plaid to development/production mode
4. Update all URLs to use HTTPS
5. Enable additional security features in Supabase