# Supabase Database Setup Guide

## Overview

This guide walks you through setting up the LifeNavigator database schema in Supabase. The schema includes:

- **User management** with subscription tiers
- **Financial accounts** and transactions
- **Document storage** with encryption metadata
- **Health records** with encrypted data
- **Career profiles** and goals
- **Integration tokens** (encrypted)
- **Comprehensive audit logging**
- **Row Level Security (RLS)** policies

## Prerequisites

1. A Supabase project ([create one here](https://app.supabase.com))
2. Environment variables configured:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

## Setup Instructions

### Option 1: Using Supabase Dashboard (Recommended)

1. **Open your Supabase project** at [app.supabase.com](https://app.supabase.com)

2. **Navigate to SQL Editor** in the left sidebar

3. **Copy the migration SQL** from:
   ```
   supabase/migrations/20250108_initial_schema.sql
   ```

4. **Paste into the SQL Editor** and click "Run"

5. **Verify the setup** by checking the Table Editor - you should see:
   - users
   - financial_accounts
   - transactions
   - documents
   - health_records
   - career_profiles
   - integrations
   - audit_logs

### Option 2: Using Supabase CLI

1. **Install Supabase CLI**:
   ```bash
   npm install -g supabase
   ```

2. **Login to Supabase**:
   ```bash
   supabase login
   ```

3. **Link your project**:
   ```bash
   supabase link --project-ref <your-project-ref>
   ```

4. **Run the migration**:
   ```bash
   supabase db push
   ```

### Option 3: Using the Setup Script

1. **Make the script executable**:
   ```bash
   chmod +x scripts/setup-supabase-db.ts
   ```

2. **Run the setup script**:
   ```bash
   npm run setup:db
   # or
   tsx scripts/setup-supabase-db.ts
   ```

## Database Schema

### Core Tables

#### `users`
- Extends Supabase auth.users
- Stores user profile, preferences, subscription info
- Includes security fields (MFA, lockout)

#### `financial_accounts`
- Bank accounts, credit cards, investments
- Encrypted Plaid tokens
- Balance tracking

#### `transactions`
- Financial transactions with categorization
- Full-text search support
- User modifications and tags

#### `documents`
- Metadata for S3-stored documents
- Encryption key references
- OCR text for search
- Sharing capabilities

#### `health_records`
- Medical appointments, lab results, prescriptions
- Encrypted health data
- Links to document storage

#### `career_profiles`
- Employment status and goals
- Skills and certifications
- Resume storage

#### `integrations`
- OAuth tokens (encrypted)
- Webhook configurations
- Sync status tracking

#### `audit_logs`
- Comprehensive activity logging
- Change tracking
- Security event recording

### Security Features

1. **Row Level Security (RLS)**
   - Users can only access their own data
   - Document sharing with expiration
   - Read-only audit logs

2. **Encryption**
   - Sensitive fields marked for encryption
   - Integration with AWS KMS
   - Field-level encryption for PII

3. **Audit Logging**
   - Automatic triggers for sensitive operations
   - IP address and user agent tracking
   - Before/after value comparison

4. **Demo Account Protection**
   - Demo account cannot be modified
   - Special handling in RLS policies
   - Pre-populated with sample data

## Demo Account

The setup automatically creates a demo account:

- **Email**: demo@lifenavigator.ai
- **Password**: demo123
- **Features**: 
  - Pre-populated financial data
  - Sample transactions
  - Example health records
  - Career profile

## Verification

After setup, verify everything is working:

1. **Check Tables**: All 8 main tables should exist
2. **Test RLS**: Try to query as different users
3. **Demo Login**: Test the demo account
4. **Audit Logs**: Perform actions and check logs

## Troubleshooting

### "Permission denied" errors
- Ensure RLS policies are created
- Check that the user is authenticated
- Verify the service role key for admin operations

### Migration fails
- Check for existing tables/types
- Run in smaller chunks if needed
- Check Supabase logs for details

### Demo account issues
- Ensure auth.users entry exists
- Check that user ID matches
- Verify email is 'demo@lifenavigator.ai'

## Next Steps

1. **Configure S3** for document storage
2. **Set up Plaid** for financial connections
3. **Configure email** for notifications
4. **Set up monitoring** for the audit logs
5. **Test the application** end-to-end

## Security Considerations

- Never expose service role key to clients
- Implement field-level encryption for sensitive data
- Regular audit log reviews
- Monitor failed login attempts
- Set up alerts for suspicious activity