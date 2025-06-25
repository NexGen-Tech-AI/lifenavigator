# Supabase Quick Start - 5 Minutes

## 1. Create Supabase Project (2 min)
1. Go to [supabase.com](https://supabase.com) → Sign up/Login
2. Click "New project" → Name it `lifenavigator`
3. Save the database password!
4. Wait for setup to complete

## 2. Get Credentials (1 min)
1. Go to **Settings → API**
2. Copy these to `.env.local`:
```bash
NEXT_PUBLIC_SUPABASE_URL="https://YOUR_PROJECT.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
```

## 3. Run Setup Script (2 min)
```bash
# Install dependencies
pnpm install

# Run database setup
tsx scripts/setup-supabase-db.ts

# Start the app
pnpm run dev
```

## 4. Test Login
- Visit http://localhost:3000
- Use demo account: `demo@lifenavigator.tech` / `DemoPassword123`

## OAuth Setup (Optional - 10 min each)

### Google OAuth
1. [Google Cloud Console](https://console.cloud.google.com/) → Create project
2. Enable Google+ API
3. Create OAuth 2.0 credentials
4. Add to Supabase: Authentication → Providers → Google

### Microsoft OAuth  
1. [Azure Portal](https://portal.azure.com/) → App registrations
2. New registration → "LifeNavigator"
3. Create client secret
4. Add to Supabase: Authentication → Providers → Azure

### LinkedIn OAuth
1. [LinkedIn Developers](https://www.linkedin.com/developers/) → Create app
2. Add OAuth 2.0 redirect URL
3. Request scopes: `r_emailaddress`, `r_liteprofile`
4. Add to Supabase: Authentication → Providers → LinkedIn

## Troubleshooting

**"Invalid API key" error:**
- Check `.env.local` has correct values
- No extra spaces/quotes
- Restart dev server

**OAuth not working:**
- Enable provider in Supabase dashboard
- Check redirect URLs match exactly
- Verify credentials are correct

**Need help?** See [SUPABASE_COMPLETE_SETUP_GUIDE.md](./SUPABASE_COMPLETE_SETUP_GUIDE.md)