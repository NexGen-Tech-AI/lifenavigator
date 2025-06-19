#!/bin/bash

# Advanced Security Implementation Script
# Rapidly implements missing security features

echo "🔐 Advanced Security Implementation"
echo "=================================="
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Step 1: Create security headers middleware
echo -e "${BLUE}Step 1: Implementing Security Headers${NC}"
cat > src/lib/security/headers.ts << 'EOF'
import { NextResponse } from 'next/server'

export const securityHeaders = {
  'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'X-XSS-Protection': '1; mode=block',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://apis.google.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https: blob:",
    "connect-src 'self' https://*.supabase.co https://api.plaid.com wss://*.supabase.co",
    "frame-src 'self' https://cdn.plaid.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "block-all-mixed-content",
    "upgrade-insecure-requests"
  ].join('; ')
}

export function applySecurityHeaders(response: NextResponse): NextResponse {
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value)
  })
  return response
}
EOF

echo -e "${GREEN}✅ Security headers created${NC}"

# Step 2: Create Supabase Vault setup SQL
echo -e "\n${BLUE}Step 2: Creating Supabase Vault Configuration${NC}"
cat > supabase/migrations/004_vault_security.sql << 'EOF'
-- Enable Vault extension for production-grade encryption
CREATE EXTENSION IF NOT EXISTS vault;

-- Create master encryption keys
DO $$
BEGIN
  -- OAuth tokens encryption key
  IF NOT EXISTS (SELECT 1 FROM vault.secrets WHERE name = 'oauth_encryption_key') THEN
    PERFORM vault.create_secret('oauth_encryption_key', 'aes-256-gcm');
  END IF;
  
  -- PII data encryption key
  IF NOT EXISTS (SELECT 1 FROM vault.secrets WHERE name = 'pii_encryption_key') THEN
    PERFORM vault.create_secret('pii_encryption_key', 'aes-256-gcm');
  END IF;
  
  -- Financial data encryption key
  IF NOT EXISTS (SELECT 1 FROM vault.secrets WHERE name = 'financial_encryption_key') THEN
    PERFORM vault.create_secret('financial_encryption_key', 'aes-256-gcm');
  END IF;
  
  -- Healthcare data encryption key
  IF NOT EXISTS (SELECT 1 FROM vault.secrets WHERE name = 'healthcare_encryption_key') THEN
    PERFORM vault.create_secret('healthcare_encryption_key', 'aes-256-gcm');
  END IF;
END $$;

-- Secure encryption functions
CREATE OR REPLACE FUNCTION encrypt_oauth_token(token text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  key_id uuid;
  encrypted text;
BEGIN
  SELECT id INTO key_id FROM vault.secrets WHERE name = 'oauth_encryption_key';
  encrypted := encode(vault.encrypt(token::bytea, key_id, 'aes-256-gcm'), 'base64');
  RETURN encrypted;
END;
$$;

CREATE OR REPLACE FUNCTION decrypt_oauth_token(encrypted_token text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  key_id uuid;
  decrypted text;
BEGIN
  SELECT id INTO key_id FROM vault.secrets WHERE name = 'oauth_encryption_key';
  decrypted := convert_from(vault.decrypt(decode(encrypted_token, 'base64'), key_id, 'aes-256-gcm'), 'UTF8');
  RETURN decrypted;
END;
$$;

-- Update integrations table for vault encryption
ALTER TABLE integrations 
  ADD COLUMN IF NOT EXISTS access_token_vault text,
  ADD COLUMN IF NOT EXISTS refresh_token_vault text;

-- Migrate existing tokens to vault encryption
UPDATE integrations 
SET 
  access_token_vault = encrypt_oauth_token(access_token),
  refresh_token_vault = encrypt_oauth_token(refresh_token)
WHERE access_token IS NOT NULL;

-- Create secure view for integrations
CREATE OR REPLACE VIEW secure_integrations AS
SELECT 
  id,
  user_id,
  provider,
  provider_account_id,
  provider_email,
  decrypt_oauth_token(access_token_vault) as access_token,
  decrypt_oauth_token(refresh_token_vault) as refresh_token,
  expires_at,
  is_active,
  last_synced,
  created_at,
  updated_at
FROM integrations
WHERE auth.uid() = user_id;

-- Grant permissions
GRANT SELECT ON secure_integrations TO authenticated;
EOF

echo -e "${GREEN}✅ Vault configuration created${NC}"

# Step 3: Enhanced monitoring setup
echo -e "\n${BLUE}Step 3: Setting Up Security Monitoring${NC}"
cat > src/lib/monitoring/security-monitor.ts << 'EOF'
import { createClient } from '@/lib/supabase/server'

interface SecurityEvent {
  userId: string
  event: string
  severity: 'info' | 'warning' | 'critical'
  metadata?: any
}

export class SecurityMonitor {
  private static THRESHOLDS = {
    failedLogins: 3,
    apiRateLimit: 100,
    unusualAccessTime: { start: 0, end: 6 }, // 12am-6am
    suspiciousIPs: ['tor-exit-nodes', 'vpn-servers']
  }

  static async logSecurityEvent(event: SecurityEvent) {
    const supabase = await createClient()
    
    await supabase.from('security_audit_logs').insert({
      user_id: event.userId,
      event: event.event,
      event_type: event.severity,
      metadata: event.metadata,
      ip_address: event.metadata?.ip,
      user_agent: event.metadata?.userAgent
    })

    // Check for critical events
    if (event.severity === 'critical') {
      await this.triggerAlert(event)
    }

    // Check for patterns
    await this.detectAnomalies(event.userId)
  }

  static async detectAnomalies(userId: string) {
    const supabase = await createClient()
    
    // Check failed login attempts
    const { data: failedLogins } = await supabase
      .from('security_audit_logs')
      .select('*')
      .eq('user_id', userId)
      .eq('event', 'LOGIN_FAILED')
      .gte('created_at', new Date(Date.now() - 15 * 60 * 1000).toISOString())
    
    if (failedLogins && failedLogins.length >= this.THRESHOLDS.failedLogins) {
      await this.lockAccount(userId)
    }

    // Check unusual access patterns
    const hour = new Date().getHours()
    if (hour >= this.THRESHOLDS.unusualAccessTime.start && 
        hour <= this.THRESHOLDS.unusualAccessTime.end) {
      await this.flagSuspiciousActivity(userId, 'UNUSUAL_ACCESS_TIME')
    }
  }

  private static async lockAccount(userId: string) {
    const supabase = await createClient()
    
    await supabase
      .from('users')
      .update({ 
        account_locked: true,
        locked_until: new Date(Date.now() + 15 * 60 * 1000).toISOString()
      })
      .eq('id', userId)
    
    await this.logSecurityEvent({
      userId,
      event: 'ACCOUNT_LOCKED',
      severity: 'warning',
      metadata: { reason: 'Multiple failed login attempts' }
    })
  }

  private static async triggerAlert(event: SecurityEvent) {
    // In production, integrate with PagerDuty, Slack, etc.
    console.error('SECURITY ALERT:', event)
    
    // Send email to security team
    // await sendSecurityAlert(event)
  }

  private static async flagSuspiciousActivity(userId: string, type: string) {
    await this.logSecurityEvent({
      userId,
      event: 'SUSPICIOUS_ACTIVITY',
      severity: 'warning',
      metadata: { type }
    })
  }
}
EOF

echo -e "${GREEN}✅ Security monitoring created${NC}"

# Step 4: Input validation schemas
echo -e "\n${BLUE}Step 4: Creating Input Validation Schemas${NC}"
cat > src/lib/validation/schemas.ts << 'EOF'
import { z } from 'zod'

// Sanitization helpers
const sanitizeString = (str: string) => str.trim().replace(/[<>]/g, '')

// Common schemas
export const emailSchema = z.string().email().transform(sanitizeString)
export const uuidSchema = z.string().uuid()
export const dateSchema = z.string().datetime()

// Security-focused schemas
export const passwordSchema = z.string()
  .min(12, 'Password must be at least 12 characters')
  .regex(/[A-Z]/, 'Password must contain uppercase letter')
  .regex(/[a-z]/, 'Password must contain lowercase letter')
  .regex(/[0-9]/, 'Password must contain number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain special character')

// Financial data schemas
export const financialAccountSchema = z.object({
  account_name: z.string().min(1).max(100).transform(sanitizeString),
  account_type: z.enum(['CHECKING', 'SAVINGS', 'CREDIT_CARD', 'INVESTMENT', 'LOAN', 'MORTGAGE', 'OTHER']),
  institution_name: z.string().min(1).max(100).transform(sanitizeString),
  account_number: z.string().regex(/^\d{4}$/, 'Only last 4 digits allowed'),
  routing_number: z.string().regex(/^\d{9}$/).optional()
})

// Integration schemas
export const oauthCallbackSchema = z.object({
  code: z.string().min(1),
  state: z.string().min(32), // CSRF token
  error: z.string().optional(),
  error_description: z.string().optional()
})

// Plaid schemas
export const plaidExchangeSchema = z.object({
  publicToken: z.string().regex(/^public-[a-zA-Z0-9-]+$/),
  institutionId: z.string(),
  institutionName: z.string().transform(sanitizeString),
  accounts: z.array(z.object({
    id: z.string(),
    name: z.string().transform(sanitizeString),
    type: z.string(),
    subtype: z.string(),
    mask: z.string().regex(/^\d{4}$/).optional()
  }))
})

// Healthcare schemas
export const appointmentSchema = z.object({
  provider_name: z.string().min(1).max(100).transform(sanitizeString),
  provider_type: z.enum(['DOCTOR', 'DENTIST', 'SPECIALIST', 'THERAPIST', 'LAB', 'OTHER']),
  appointment_date: dateSchema,
  appointment_time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/),
  duration_minutes: z.number().min(15).max(480),
  location: z.string().max(200).transform(sanitizeString).optional(),
  reason: z.string().min(1).max(500).transform(sanitizeString),
  notes: z.string().max(1000).transform(sanitizeString).optional()
})

// API request validation
export const paginationSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(1).max(100).default(20),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc')
})

// Export validation helper
export function validateRequest<T>(data: unknown, schema: z.ZodSchema<T>): T {
  try {
    return schema.parse(data)
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(`Validation error: ${error.errors.map(e => e.message).join(', ')}`)
    }
    throw error
  }
}
EOF

echo -e "${GREEN}✅ Input validation schemas created${NC}"

# Step 5: Update middleware for comprehensive security
echo -e "\n${BLUE}Step 5: Updating Middleware${NC}"
cat > src/middleware.enhanced.ts << 'EOF'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/middleware'
import { applySecurityHeaders } from '@/lib/security/headers'
import { SecurityMonitor } from '@/lib/monitoring/security-monitor'

// Rate limiting store (use Redis in production)
const rateLimitStore = new Map<string, { count: number; resetAt: number }>()

async function rateLimit(identifier: string, limit: number = 100): Promise<boolean> {
  const now = Date.now()
  const window = 60 * 1000 // 1 minute
  
  const record = rateLimitStore.get(identifier)
  
  if (!record || record.resetAt < now) {
    rateLimitStore.set(identifier, { count: 1, resetAt: now + window })
    return true
  }
  
  if (record.count >= limit) {
    return false
  }
  
  record.count++
  return true
}

export async function middleware(request: NextRequest) {
  const response = NextResponse.next()
  
  // Apply security headers
  applySecurityHeaders(response)
  
  // Get client IP
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 
             request.headers.get('x-real-ip') || 
             'unknown'
  
  // Rate limiting
  const rateLimitKey = `${ip}:${request.nextUrl.pathname}`
  const allowed = await rateLimit(rateLimitKey)
  
  if (!allowed) {
    return new NextResponse('Too Many Requests', { status: 429 })
  }
  
  // Supabase auth check
  const { supabase } = createClient(request, response)
  const { data: { user } } = await supabase.auth.getUser()
  
  // Protected routes
  const isProtectedPath = request.nextUrl.pathname.startsWith('/dashboard') ||
                         request.nextUrl.pathname.startsWith('/api/v1')
  
  if (isProtectedPath && !user) {
    // Log unauthorized access attempt
    await SecurityMonitor.logSecurityEvent({
      userId: 'anonymous',
      event: 'UNAUTHORIZED_ACCESS_ATTEMPT',
      severity: 'warning',
      metadata: {
        ip,
        path: request.nextUrl.pathname,
        userAgent: request.headers.get('user-agent')
      }
    })
    
    if (request.nextUrl.pathname.startsWith('/api')) {
      return new NextResponse('Unauthorized', { status: 401 })
    }
    
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }
  
  // Log API access for audit
  if (user && request.nextUrl.pathname.startsWith('/api/v1')) {
    await SecurityMonitor.logSecurityEvent({
      userId: user.id,
      event: 'API_ACCESS',
      severity: 'info',
      metadata: {
        ip,
        path: request.nextUrl.pathname,
        method: request.method
      }
    })
  }
  
  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
EOF

echo -e "${GREEN}✅ Enhanced middleware created${NC}"

# Step 6: Create MFA implementation
echo -e "\n${BLUE}Step 6: Implementing MFA Components${NC}"
mkdir -p src/components/auth/mfa

cat > src/components/auth/mfa/MFASetup.tsx << 'EOF'
'use client'

import { useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { authenticator } from 'otplib'

export function MFASetup({ userId }: { userId: string }) {
  const [secret, setSecret] = useState('')
  const [qrCode, setQrCode] = useState('')
  const [verificationCode, setVerificationCode] = useState('')
  const [isEnabled, setIsEnabled] = useState(false)

  const generateSecret = async () => {
    const newSecret = authenticator.generateSecret()
    setSecret(newSecret)
    
    const otpauth = authenticator.keyuri(
      userId,
      'LifeNavigator',
      newSecret
    )
    setQrCode(otpauth)
  }

  const verifyAndEnable = async () => {
    const isValid = authenticator.verify({
      token: verificationCode,
      secret: secret
    })

    if (isValid) {
      // Save secret to database (encrypted)
      const response = await fetch('/api/auth/mfa/enable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ secret })
      })

      if (response.ok) {
        setIsEnabled(true)
      }
    }
  }

  return (
    <div className="max-w-md mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">Enable Two-Factor Authentication</h2>
      
      {!secret && (
        <button
          onClick={generateSecret}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Set Up 2FA
        </button>
      )}

      {secret && !isEnabled && (
        <div className="space-y-4">
          <div className="p-4 bg-gray-100 rounded">
            <p className="text-sm mb-2">Scan this QR code with your authenticator app:</p>
            <QRCodeSVG value={qrCode} size={200} />
          </div>
          
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded">
            <p className="text-sm font-semibold">Manual entry:</p>
            <code className="text-xs">{secret}</code>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Enter verification code:
            </label>
            <input
              type="text"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              className="w-full px-3 py-2 border rounded"
              placeholder="000000"
              maxLength={6}
            />
          </div>

          <button
            onClick={verifyAndEnable}
            className="w-full bg-green-500 text-white px-4 py-2 rounded"
          >
            Verify and Enable
          </button>
        </div>
      )}

      {isEnabled && (
        <div className="p-4 bg-green-50 border border-green-200 rounded">
          <p className="text-green-800">✅ Two-factor authentication is enabled!</p>
        </div>
      )}
    </div>
  )
}
EOF

echo -e "${GREEN}✅ MFA components created${NC}"

# Step 7: Create deployment security checklist
echo -e "\n${BLUE}Step 7: Creating Security Checklist${NC}"
cat > SECURITY_DEPLOYMENT_CHECKLIST.md << 'EOF'
# Security Deployment Checklist

## Pre-Deployment Security Verification

### ✅ Encryption
- [ ] All OAuth tokens encrypted with Vault
- [ ] PII data encrypted at field level
- [ ] Database encryption at rest enabled
- [ ] TLS 1.3 configured for all endpoints
- [ ] Certificate pinning implemented (mobile)

### ✅ Authentication & Authorization
- [ ] MFA enabled for all users
- [ ] RLS policies tested and verified
- [ ] Session timeout configured (15 min)
- [ ] Account lockout working (5 attempts)
- [ ] CSRF protection enabled

### ✅ API Security
- [ ] Rate limiting configured per endpoint
- [ ] Input validation on all endpoints
- [ ] SQL injection prevention tested
- [ ] XSS protection verified
- [ ] CORS properly configured

### ✅ Monitoring & Logging
- [ ] Security event logging enabled
- [ ] Real-time alerting configured
- [ ] Audit trail retention set (90 days)
- [ ] SIEM integration tested
- [ ] Anomaly detection active

### ✅ Infrastructure
- [ ] WAF rules configured
- [ ] DDoS protection enabled
- [ ] Security headers implemented
- [ ] Backup encryption verified
- [ ] Disaster recovery tested

### ✅ Compliance
- [ ] GDPR compliance verified
- [ ] CCPA compliance verified
- [ ] Data retention policies enforced
- [ ] Privacy policy updated
- [ ] Security documentation complete

## Production Launch Criteria
All items must be checked before production deployment.

Verified by: _________________ Date: _________
Approved by: _________________ Date: _________
EOF

echo -e "${GREEN}✅ Security checklist created${NC}"

# Final summary
echo -e "\n${GREEN}🎉 Advanced Security Implementation Complete!${NC}"
echo ""
echo "📋 Created Files:"
echo "  - src/lib/security/headers.ts"
echo "  - supabase/migrations/004_vault_security.sql"
echo "  - src/lib/monitoring/security-monitor.ts"
echo "  - src/lib/validation/schemas.ts"
echo "  - src/middleware.enhanced.ts"
echo "  - src/components/auth/mfa/MFASetup.tsx"
echo "  - SECURITY_DEPLOYMENT_CHECKLIST.md"
echo ""
echo "🚀 Next Steps:"
echo "1. Run Supabase migration: supabase db push < supabase/migrations/004_vault_security.sql"
echo "2. Replace middleware.ts with middleware.enhanced.ts"
echo "3. Test security headers: curl -I http://localhost:3000"
echo "4. Configure MFA for user accounts"
echo "5. Set up monitoring alerts"
echo ""
echo "⚡ Quick Test Commands:"
echo "  npm run test:security"
echo "  npm run audit:dependencies"
echo "  npm run scan:vulnerabilities"
echo ""
echo -e "${YELLOW}⚠️  Important: Test all security features in staging before production!${NC}"