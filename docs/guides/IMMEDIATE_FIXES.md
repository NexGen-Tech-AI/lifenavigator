# Immediate Fixes Required - Action Plan

## 🚨 TOP 5 CRITICAL FIXES (Do This Week)

### 1. Fix Authentication System (Day 1-2)

**Problem**: Mixed NextAuth + Supabase causing conflicts

**Fix Steps**:
```bash
# Step 1: Remove NextAuth
rm -rf src/app/api/auth/[...nextauth]
rm src/lib/auth/NextAuth.ts
npm uninstall next-auth @next-auth/prisma-adapter

# Step 2: Update middleware to use only Supabase
```

```typescript
// src/middleware.ts - REPLACE ENTIRE FILE
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const response = NextResponse.next()
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          response.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // Protect routes
  if (request.nextUrl.pathname.startsWith('/dashboard') && !user) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  return response
}

export const config = {
  matcher: ['/dashboard/:path*', '/api/:path*']
}
```

### 2. Connect Real Database (Day 2)

**Remove Mock Database**:
```bash
rm src/lib/db.ts
rm src/lib/db-production.ts
```

**Update All Database Calls**:
```typescript
// BEFORE (using mock):
import { db } from '@/lib/db'
const user = await db.user.findUnique({...})

// AFTER (using Supabase):
import { createClient } from '@/lib/supabase/server'
const supabase = await createClient()
const { data: user } = await supabase
  .from('users')
  .select('*')
  .eq('id', userId)
  .single()
```

### 3. Environment Variable Validation (Day 3)

**Create Validation**:
```typescript
// src/lib/env.ts
import { z } from 'zod'

const envSchema = z.object({
  // Database
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  
  // AWS S3
  AWS_REGION: z.string().default('us-east-1'),
  AWS_ACCESS_KEY_ID: z.string().min(1),
  AWS_SECRET_ACCESS_KEY: z.string().min(1),
  AWS_VAULT_BUCKET: z.string().min(1),
  AWS_KMS_KEY_ID: z.string().min(1),
  
  // Integrations
  PLAID_CLIENT_ID: z.string().optional(),
  PLAID_SECRET: z.string().optional(),
  PLAID_ENV: z.enum(['sandbox', 'development', 'production']).default('sandbox'),
  
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  
  // App
  NEXT_PUBLIC_APP_URL: z.string().url().default('http://localhost:3000'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
})

// Validate on startup
export const env = envSchema.parse(process.env)

// Type-safe env access
export type Env = z.infer<typeof envSchema>
```

**Use in App**:
```typescript
// src/app/layout.tsx - Add at top
import { env } from '@/lib/env' // This validates on import
```

### 4. Implement Encryption (Day 3-4)

**Update Plaid Token Storage**:
```typescript
// src/app/api/v1/plaid/exchange/route.ts
import { encrypt } from '@/lib/encryption/simple'

// In the token exchange function:
const encryptedToken = await encrypt(accessToken)

const { data: plaidItem } = await supabase
  .from('plaid_items')
  .insert({
    user_id: user.id,
    access_token: encryptedToken, // Encrypted!
    item_id: itemId,
    institution_id: data.institutionId,
    institution_name: data.institutionName,
  })
```

**Create Encryption Helper**:
```typescript
// src/lib/encryption/supabase.ts
export async function encryptForStorage(data: string): Promise<string> {
  // Use Supabase Vault when available
  // For now, use your existing encryption
  return encrypt(data)
}

export async function decryptFromStorage(encrypted: string): Promise<string> {
  return decrypt(encrypted)
}
```

### 5. Add Input Validation (Day 4-5)

**Create Validation Middleware**:
```typescript
// src/lib/api/validation.ts
import { z } from 'zod'
import { NextRequest, NextResponse } from 'next/server'

export function validateRequest<T>(schema: z.ZodSchema<T>) {
  return async (request: NextRequest): Promise<T> => {
    try {
      const body = await request.json()
      return schema.parse(body)
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error(`Validation error: ${error.errors.map(e => e.message).join(', ')}`)
      }
      throw error
    }
  }
}
```

**Apply to All API Routes**:
```typescript
// Example: src/app/api/v1/accounts/route.ts
import { validateRequest } from '@/lib/api/validation'

const createAccountSchema = z.object({
  name: z.string().min(1).max(100),
  type: z.enum(['checking', 'savings', 'credit']),
  balance: z.number().min(0)
})

export async function POST(request: NextRequest) {
  const data = await validateRequest(createAccountSchema)(request)
  // Now data is validated and typed!
}
```

---

## 🔧 QUICK FIX SCRIPT

Create and run this script to fix common issues:

```bash
#!/bin/bash
# fix-critical-issues.sh

echo "🔧 Fixing LifeNavigator Critical Issues"

# 1. Remove NextAuth
echo "Removing NextAuth..."
rm -rf src/app/api/auth/[...nextauth]
rm -f src/lib/auth/NextAuth.ts

# 2. Update imports
echo "Updating imports..."
find src -type f -name "*.ts" -o -name "*.tsx" | xargs sed -i 's/import.*next-auth.*//g'
find src -type f -name "*.ts" -o -name "*.tsx" | xargs sed -i 's/getServerSession/createClient/g'

# 3. Create env validation
echo "Creating environment validation..."
cat > src/lib/env.ts << 'EOF'
import { z } from 'zod'

const envSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
})

export const env = envSchema.parse(process.env)
EOF

# 4. Add to package.json scripts
echo "Adding validation script..."
npm pkg set scripts.validate:env="ts-node src/lib/env.ts"

echo "✅ Critical fixes applied!"
echo "Next steps:"
echo "1. Update all auth checks to use Supabase"
echo "2. Test authentication flow"
echo "3. Run: npm run validate:env"
```

---

## 📋 VALIDATION CHECKLIST

Before proceeding with integrations, verify:

### Authentication
- [ ] NextAuth completely removed
- [ ] All routes use Supabase auth
- [ ] Login/logout working
- [ ] Session persistence working
- [ ] Protected routes working

### Database
- [ ] Mock database removed
- [ ] All queries use Supabase
- [ ] Data persists correctly
- [ ] RLS policies active
- [ ] Migrations run successfully

### Security
- [ ] Environment variables validated
- [ ] Sensitive data encrypted
- [ ] Input validation on all APIs
- [ ] Rate limiting active
- [ ] Security headers set

### API
- [ ] Consistent error handling
- [ ] All endpoints tested
- [ ] Webhook verification ready
- [ ] CORS configured properly
- [ ] Response formats standardized

---

## 🚀 AFTER FIXES COMPLETE

Only after ALL critical fixes are done:

1. **Test Everything**
   ```bash
   npm run test
   npm run test:e2e
   ```

2. **Security Audit**
   ```bash
   npm audit
   npm run security:check
   ```

3. **Then Add Integrations**
   - Plaid (financial accounts)
   - Google (calendar/email)
   - AWS S3 (documents)
   - Others as needed

**Remember**: These fixes prevent security breaches and data loss. Don't skip them!