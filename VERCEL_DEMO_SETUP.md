# Quick Vercel Demo Setup

## Option 1: Using Vercel Dashboard (RECOMMENDED)

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add these variables for **Production**:

| Variable Name | Value | 
|--------------|-------|
| `NEXT_PUBLIC_DEMO_MODE` | `true` |
| `NEXT_PUBLIC_SKIP_AUTH` | `true` |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://demo.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `demo-key-not-used` |

4. Redeploy your project:
   - Go to **Deployments** tab
   - Click the three dots on the latest deployment
   - Select **Redeploy**

## Option 2: Using Vercel CLI

```bash
# Add environment variables
vercel env add NEXT_PUBLIC_DEMO_MODE production
# Enter: true

vercel env add NEXT_PUBLIC_SKIP_AUTH production  
# Enter: true

vercel env add NEXT_PUBLIC_SUPABASE_URL production
# Enter: https://demo.supabase.co

vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
# Enter: demo-key-not-used

# Deploy with new variables
vercel --prod
```

## Option 3: Deploy with Environment File

```bash
# Deploy using the demo environment file
vercel --prod --env-file .env.production.demo
```

## Verification

After deployment, you should see:
1. No login screen - goes straight to dashboard
2. Demo data for "Alex Johnson"
3. Yellow banner indicating demo mode
4. Console logs showing demo mode is active

## Enable Password Protection

1. Go to **Settings** → **Advanced** → **Password Protection**
2. Enable and set a password
3. Share password with demo viewers

## Troubleshooting

If still seeing login screen:
1. Check deployment logs for demo mode status
2. Ensure all 4 environment variables are set
3. Try clearing browser cache
4. Check Vercel function logs for errors