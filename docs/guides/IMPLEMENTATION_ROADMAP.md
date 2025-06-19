# LifeNavigator Implementation Roadmap
## Supabase, Google Integrations, and Security Setup

### Current Status
- ✅ Code architecture converted to Supabase
- ✅ Database migrations created
- ✅ API endpoints implemented
- ⏳ Supabase project setup needed
- ⏳ Google OAuth configuration needed
- ⏳ Production encryption implementation needed

---

## Phase 1: Supabase Database Setup (Day 1-2)

### 1.1 Create Supabase Project
```bash
# Steps:
1. Go to https://app.supabase.com
2. Create new project
3. Choose region closest to users
4. Set strong database password
5. Save connection details
```

### 1.2 Environment Configuration
```bash
# Add to .env file:
NEXT_PUBLIC_SUPABASE_URL=https://[PROJECT_ID].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT_ID].supabase.co:5432/postgres
```

### 1.3 Run Database Migrations
```bash
# Using Supabase CLI
npm install -g supabase
supabase login
supabase link --project-ref [PROJECT_ID]

# Run migrations in order
supabase db push --file supabase/migrations/001_initial_schema.sql
supabase db push --file supabase/migrations/002_integrations_and_appointments.sql
```

### 1.4 Create Storage Buckets
```sql
-- Run in Supabase SQL Editor
INSERT INTO storage.buckets (id, name, public) VALUES 
  ('financial-documents', 'financial-documents', false),
  ('profile-images', 'profile-images', false);

-- Set up storage policies
CREATE POLICY "Users can upload own documents" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'financial-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view own documents" ON storage.objects
  FOR SELECT USING (bucket_id = 'financial-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete own documents" ON storage.objects
  FOR DELETE USING (bucket_id = 'financial-documents' AND auth.uid()::text = (storage.foldername(name))[1]);
```

### 1.5 Enable Required Extensions
```sql
-- Enable additional extensions for security
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pgjwt";
```

---

## Phase 2: Advanced Security Implementation (Day 2-3)

### 2.1 Set Up Supabase Vault for Encryption
```sql
-- Enable Vault
CREATE EXTENSION IF NOT EXISTS "vault";

-- Create encryption keys for sensitive data
SELECT vault.create_secret('plaid_encryption_key', 'aes-256-gcm');
SELECT vault.create_secret('pii_encryption_key', 'aes-256-gcm');
```

### 2.2 Implement Field-Level Encryption Functions
```sql
-- Function to encrypt sensitive data
CREATE OR REPLACE FUNCTION encrypt_sensitive_data(data text, key_name text)
RETURNS text AS $$
DECLARE
  key_id uuid;
  encrypted text;
BEGIN
  SELECT id INTO key_id FROM vault.secrets WHERE name = key_name;
  SELECT vault.encrypt(data::bytea, key_id) INTO encrypted;
  RETURN encrypted;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to decrypt sensitive data
CREATE OR REPLACE FUNCTION decrypt_sensitive_data(encrypted_data text, key_name text)
RETURNS text AS $$
DECLARE
  key_id uuid;
  decrypted text;
BEGIN
  SELECT id INTO key_id FROM vault.secrets WHERE name = key_name;
  SELECT convert_from(vault.decrypt(encrypted_data, key_id), 'UTF8') INTO decrypted;
  RETURN decrypted;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### 2.3 Update Tables for Encryption
```sql
-- Add encrypted columns for sensitive data
ALTER TABLE plaid_items ADD COLUMN access_token_encrypted text;
ALTER TABLE financial_accounts ADD COLUMN account_number_encrypted text;
ALTER TABLE financial_accounts ADD COLUMN routing_number_encrypted text;

-- Create triggers for automatic encryption
CREATE OR REPLACE FUNCTION encrypt_plaid_token()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.access_token IS NOT NULL THEN
    NEW.access_token_encrypted = encrypt_sensitive_data(NEW.access_token, 'plaid_encryption_key');
    NEW.access_token = NULL; -- Don't store plain text
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER encrypt_plaid_token_trigger
BEFORE INSERT OR UPDATE ON plaid_items
FOR EACH ROW EXECUTE FUNCTION encrypt_plaid_token();
```

### 2.4 Configure Row Level Security (RLS)
```sql
-- Ensure RLS is enabled on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE plaid_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE integrations ENABLE ROW LEVEL SECURITY;

-- Add additional security policies
CREATE POLICY "Service role can manage all data" ON public.users
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Users can only see their own encrypted data" ON public.plaid_items
  FOR SELECT USING (auth.uid() = user_id AND auth.role() = 'authenticated');
```

---

## Phase 3: Google OAuth Setup (Day 3-4)

### 3.1 Google Cloud Console Setup
```
1. Go to https://console.cloud.google.com
2. Create new project or select existing
3. Enable APIs:
   - Gmail API
   - Google Calendar API
   - Google OAuth2 API

4. Create OAuth 2.0 credentials:
   - Application type: Web application
   - Authorized JavaScript origins:
     - http://localhost:3000 (dev)
     - https://yourdomain.com (production)
   - Authorized redirect URIs:
     - http://localhost:3000/api/v1/integrations/google/callback
     - https://yourdomain.com/api/v1/integrations/google/callback

5. Download credentials JSON
```

### 3.2 Environment Variables for Google
```bash
# Add to .env
GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_REDIRECT_URI=http://localhost:3000/api/v1/integrations/google/callback

# Scopes needed
GOOGLE_SCOPES=https://www.googleapis.com/auth/gmail.readonly,https://www.googleapis.com/auth/calendar.events,https://www.googleapis.com/auth/userinfo.email
```

### 3.3 Update OAuth Implementation
Create a more secure OAuth handler:

```typescript
// src/lib/integrations/google-oauth-secure.ts
import { google } from 'googleapis'
import { createClient } from '@/lib/supabase/server'

export async function getSecureOAuthClient() {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  )
  
  return oauth2Client
}

export async function storeEncryptedTokens(
  userId: string,
  tokens: any
) {
  const supabase = await createClient()
  
  // Encrypt tokens before storage
  const { data: encrypted } = await supabase.rpc('encrypt_sensitive_data', {
    data: JSON.stringify(tokens),
    key_name: 'google_oauth_key'
  })
  
  // Store encrypted tokens
  const { error } = await supabase
    .from('integrations')
    .upsert({
      user_id: userId,
      provider: 'google',
      access_token: encrypted.access_token,
      refresh_token: encrypted.refresh_token,
      expires_at: new Date(Date.now() + tokens.expiry_date),
      is_active: true
    })
    
  if (error) throw error
}
```

---

## Phase 4: Gmail Integration Testing (Day 4-5)

### 4.1 Test Email Scanning
```typescript
// scripts/test-gmail-integration.js
const testGmailIntegration = async () => {
  console.log('Testing Gmail Integration...')
  
  // 1. Test OAuth flow
  const authUrl = await getAuthUrl()
  console.log('Visit this URL to authorize:', authUrl)
  
  // 2. Test email scanning
  const emails = await scanFinancialEmails(userId, {
    daysBack: 30,
    categories: ['bills', 'statements']
  })
  
  console.log('Found emails:', emails.length)
  
  // 3. Test attachment detection
  const attachments = await findFinancialAttachments(emails)
  console.log('Financial documents found:', attachments.length)
}
```

### 4.2 Security Considerations for Email
- Never store email content in plain text
- Encrypt attachment metadata
- Use least privilege scopes
- Implement rate limiting
- Log all access for audit

---

## Phase 5: Google Calendar Integration Testing (Day 5-6)

### 5.1 Calendar Sync Implementation
```typescript
// Enhanced calendar sync with encryption
export async function syncCalendarEvents(userId: string) {
  const integration = await getGoogleIntegration(userId)
  if (!integration) throw new Error('No Google integration')
  
  // Decrypt tokens
  const tokens = await decryptTokens(integration)
  const calendar = google.calendar({ version: 'v3', auth })
  
  // Sync events with healthcare appointments
  const events = await calendar.events.list({
    calendarId: 'primary',
    timeMin: new Date().toISOString(),
    maxResults: 100,
    singleEvents: true,
    orderBy: 'startTime'
  })
  
  // Store events with encryption for sensitive data
  for (const event of events.data.items || []) {
    await storeCalendarEvent(userId, event, {
      encryptLocation: true,
      encryptDescription: true
    })
  }
}
```

### 5.2 Appointment Integration
- Two-way sync with calendar
- Automatic reminder creation
- Conflict detection
- Privacy-preserving sync

---

## Phase 6: Production Security Hardening (Day 6-7)

### 6.1 Enable Additional Security Features
```sql
-- Enable audit logging
CREATE TABLE security_audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  resource TEXT NOT NULL,
  ip_address INET,
  user_agent TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create audit function
CREATE OR REPLACE FUNCTION log_security_event()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO security_audit_logs (user_id, action, resource, metadata)
  VALUES (
    auth.uid(),
    TG_OP,
    TG_TABLE_NAME,
    to_jsonb(NEW)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### 6.2 Set Up Monitoring
```typescript
// src/lib/monitoring/security-monitor.ts
export class SecurityMonitor {
  static async logDataAccess(
    userId: string,
    resource: string,
    action: string,
    metadata?: any
  ) {
    const supabase = await createClient()
    
    await supabase.from('security_audit_logs').insert({
      user_id: userId,
      action,
      resource,
      ip_address: getClientIP(),
      user_agent: getUserAgent(),
      metadata
    })
  }
  
  static async detectAnomalies(userId: string) {
    // Check for suspicious patterns
    const recentLogs = await getRecentLogs(userId)
    
    if (detectUnusualActivity(recentLogs)) {
      await triggerSecurityAlert(userId)
    }
  }
}
```

### 6.3 Implement Zero-Trust Architecture
- Verify every request
- Encrypt all data in transit
- Use short-lived tokens
- Implement rate limiting
- Monitor all access

---

## Phase 7: Testing and Validation (Day 7-8)

### 7.1 Security Testing Checklist
- [ ] Test encryption/decryption of all sensitive fields
- [ ] Verify RLS policies prevent unauthorized access
- [ ] Test OAuth flow with token refresh
- [ ] Validate audit logging captures all events
- [ ] Test data deletion compliance
- [ ] Verify backup encryption
- [ ] Test key rotation procedures

### 7.2 Integration Testing
```bash
# Run comprehensive tests
npm run test:security
npm run test:integrations
npm run test:encryption
```

---

## Phase 8: Production Deployment Prep (Day 8-9)

### 8.1 Production Environment Variables
```bash
# Production .env
NODE_ENV=production
NEXT_PUBLIC_SUPABASE_URL=https://[PROD_ID].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Security headers
SECURITY_HEADERS_CSP="default-src 'self'; ..."
SECURITY_HEADERS_HSTS="max-age=31536000; includeSubDomains"
```

### 8.2 Pre-Launch Checklist
- [ ] All sensitive data encrypted
- [ ] RLS policies tested
- [ ] Audit logging enabled
- [ ] Monitoring configured
- [ ] Backup strategy implemented
- [ ] Incident response plan ready
- [ ] Security documentation complete

---

## Next Steps After Google Integration

### Microsoft Integration Prep
- Azure AD app registration
- Microsoft Graph API setup
- Outlook/OneDrive integration

### Additional Integrations
- Banking (beyond Plaid)
- Healthcare providers
- Insurance companies
- Investment platforms

### Compliance Certifications
- SOC 2 Type II
- ISO 27001
- HIPAA (for healthcare data)
- PCI DSS (if handling cards)

---

## Support and Resources

### Documentation
- Supabase Docs: https://supabase.com/docs
- Google API: https://developers.google.com/apis
- Security Best Practices: Internal wiki

### Monitoring Dashboards
- Supabase Dashboard: [URL]
- Security Monitoring: [URL]
- Performance Metrics: [URL]

### Emergency Contacts
- Security Team: security@lifenavigator.ai
- DevOps On-Call: [Phone]
- Privacy Officer: privacy@lifenavigator.ai