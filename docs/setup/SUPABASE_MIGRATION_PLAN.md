# Supabase Migration Plan for LifeNavigator

## Overview
This document outlines the migration from Vercel PostgreSQL + NextAuth to Supabase for a more integrated solution.

## Benefits of Migration
1. **Simplified Architecture** - Replace NextAuth + custom auth with Supabase Auth
2. **Built-in Security** - Row Level Security (RLS) for multi-tenant data isolation
3. **Real-time Features** - Live updates for financial data changes
4. **File Storage** - Built-in storage for financial documents
5. **Better DX** - Auto-generated APIs, TypeScript SDK, built-in admin panel

## Migration Steps

### Phase 1: Setup Supabase Project
```bash
# 1. Create Supabase project at https://app.supabase.com
# 2. Install Supabase CLI
npm install -g supabase

# 3. Initialize Supabase in project
supabase init

# 4. Link to your project
supabase link --project-ref your-project-ref
```

### Phase 2: Update Environment Variables
```env
# Replace current database URLs with:
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-key

# Remove NextAuth variables
# NEXTAUTH_SECRET (no longer needed)
# DATABASE_URL (replaced by Supabase)
```

### Phase 3: Schema Migration
```sql
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view own data" ON users
  FOR ALL USING (auth.uid() = id);

CREATE POLICY "Users can view own accounts" ON financial_accounts
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own transactions" ON transactions
  FOR ALL USING (auth.uid() = user_id);

-- Storage buckets for documents
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('financial-documents', 'financial-documents', false),
  ('profile-images', 'profile-images', false);

-- Storage policies
CREATE POLICY "Users can upload own documents" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'financial-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view own documents" ON storage.objects
  FOR SELECT USING (bucket_id = 'financial-documents' AND auth.uid()::text = (storage.foldername(name))[1]);
```

### Phase 4: Update Authentication
```typescript
// lib/supabase/client.ts
import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/supabase'

export const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    }
  }
)

// lib/supabase/server.ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export function createSupabaseServer() {
  const cookieStore = cookies()
  
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          cookieStore.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          cookieStore.set({ name, value: '', ...options })
        },
      },
    }
  )
}
```

### Phase 5: Update API Routes
```typescript
// app/api/v1/accounts/route.ts
import { createSupabaseServer } from '@/lib/supabase/server'

export async function GET() {
  const supabase = createSupabaseServer()
  
  // Get authenticated user
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (!user) return new Response('Unauthorized', { status: 401 })
  
  // Fetch accounts - RLS automatically filters by user
  const { data: accounts, error } = await supabase
    .from('financial_accounts')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (error) return new Response(error.message, { status: 500 })
  
  return Response.json(accounts)
}
```

### Phase 6: Plaid Integration with Supabase
```typescript
// lib/plaid/supabase-integration.ts
export async function storePlaidAccounts(
  userId: string,
  plaidAccounts: PlaidAccount[],
  accessToken: string
) {
  const supabase = createSupabaseServer()
  
  // Store encrypted access token
  const { data: plaidItem } = await supabase
    .from('plaid_items')
    .insert({
      user_id: userId,
      access_token: encrypt(accessToken), // Use Supabase Vault for encryption
      institution_id: plaidAccounts[0].institution_id,
      institution_name: plaidAccounts[0].institution_name,
    })
    .select()
    .single()
  
  // Store accounts
  const accounts = plaidAccounts.map(account => ({
    user_id: userId,
    plaid_item_id: plaidItem.id,
    account_name: account.name,
    account_type: account.type,
    current_balance: account.balances.current,
    available_balance: account.balances.available,
    plaid_account_id: account.account_id,
    data_source: 'PLAID'
  }))
  
  await supabase.from('financial_accounts').insert(accounts)
}
```

### Phase 7: Document Storage
```typescript
// lib/documents/storage.ts
export async function uploadDocument(
  file: File,
  userId: string,
  documentType: string
) {
  const supabase = createSupabaseServer()
  
  // Upload to Supabase Storage
  const filePath = `${userId}/${Date.now()}-${file.name}`
  const { data, error } = await supabase.storage
    .from('financial-documents')
    .upload(filePath, file)
  
  if (error) throw error
  
  // Store metadata in database
  const { data: document } = await supabase
    .from('documents')
    .insert({
      user_id: userId,
      file_name: file.name,
      file_type: file.type,
      file_size: file.size,
      storage_path: data.path,
      document_type: documentType,
    })
    .select()
    .single()
  
  return document
}
```

### Phase 8: Real-time Updates
```typescript
// hooks/useRealtimeAccounts.ts
export function useRealtimeAccounts() {
  const [accounts, setAccounts] = useState<FinancialAccount[]>([])
  
  useEffect(() => {
    // Initial fetch
    fetchAccounts()
    
    // Subscribe to changes
    const subscription = supabase
      .channel('account-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'financial_accounts',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setAccounts(prev => [...prev, payload.new])
          } else if (payload.eventType === 'UPDATE') {
            setAccounts(prev => 
              prev.map(acc => acc.id === payload.new.id ? payload.new : acc)
            )
          } else if (payload.eventType === 'DELETE') {
            setAccounts(prev => prev.filter(acc => acc.id !== payload.old.id))
          }
        }
      )
      .subscribe()
    
    return () => {
      subscription.unsubscribe()
    }
  }, [user.id])
  
  return accounts
}
```

## Timeline
- **Week 1**: Setup Supabase project, migrate schema
- **Week 2**: Replace NextAuth with Supabase Auth
- **Week 3**: Migrate API routes to use Supabase client
- **Week 4**: Implement document storage and real-time features
- **Week 5**: Testing and optimization

## Key Considerations
1. **Data Migration**: Export existing data from Vercel PostgreSQL and import to Supabase
2. **User Migration**: Migrate existing user passwords (may require reset)
3. **Testing**: Thoroughly test auth flows and data access
4. **Monitoring**: Set up Supabase dashboard alerts

## Cost Comparison
### Current (Vercel + Various Services)
- Vercel PostgreSQL: $20/month (minimum)
- File storage: Additional cost
- Real-time: Would need Pusher/Ably

### Supabase
- Free tier: 500MB database, 1GB storage, 50K MAU
- Pro tier: $25/month (8GB database, 100GB storage, 100K MAU)
- Better value with integrated services