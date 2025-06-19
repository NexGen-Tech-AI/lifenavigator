# Plaid Integration Setup Guide

## Overview
This guide covers the complete setup and testing of Plaid integration in LifeNavigator, including sandbox testing, production setup, and security best practices.

## Prerequisites

### 1. Plaid Account Setup
1. Sign up for a Plaid account at https://dashboard.plaid.com/signup
2. Get your sandbox credentials:
   - Client ID
   - Sandbox secret
   - Note: Production secret requires approval

### 2. Environment Variables
Add these to your `.env` file:

```bash
# Plaid Configuration
PLAID_CLIENT_ID=your_plaid_client_id
PLAID_SECRET=your_plaid_sandbox_secret
PLAID_ENV=sandbox  # Options: sandbox, development, production

# Plaid Products (comma-separated)
PLAID_PRODUCTS=transactions,accounts,liabilities,investments
PLAID_COUNTRY_CODES=US,CA
```

### 3. Supabase Setup
Ensure you have Supabase configured:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## Database Setup

### 1. Run Migrations
Execute these migrations in order:

```bash
# Initial schema with financial tables
supabase db push --file supabase/migrations/001_initial_schema.sql

# Integration tables for Plaid
supabase db push --file supabase/migrations/002_integrations_and_appointments.sql
```

### 2. Verify Tables
Check that these tables exist:
- `plaid_items` - Stores encrypted access tokens
- `financial_accounts` - User's connected accounts
- `transactions` - Transaction data
- `plaid_webhook_events` - Webhook event logs

## Implementation Overview

### API Endpoints

1. **Link Token Creation** - `/api/v1/plaid/link`
   - Creates a Link token for Plaid Link initialization
   - Requires authenticated user with PRO subscription

2. **Token Exchange** - `/api/v1/plaid/exchange`
   - Exchanges public token for access token
   - Stores encrypted token and creates accounts
   - Triggers initial transaction sync

3. **Webhook Handler** - `/api/v1/plaid/webhook`
   - Handles Plaid webhooks for real-time updates
   - Processes transaction updates, errors, and item events

### Security Features

1. **Token Encryption**
   - Access tokens are encrypted before storage
   - Production should use Supabase Vault or AWS KMS

2. **Row Level Security**
   - Users can only access their own financial data
   - Enforced at database level

3. **Webhook Verification**
   - Validates webhook signatures
   - Prevents unauthorized webhook calls

## Testing Guide

### 1. Sandbox Testing

#### A. Manual Testing
1. Start the development server:
   ```bash
   npm run dev
   ```

2. Create or login to a test account

3. Navigate to Dashboard > Finance > Accounts

4. Click "Connect Bank Account"

5. In Plaid Link sandbox:
   - Select any institution (e.g., "First Platypus Bank")
   - Use test credentials:
     - Username: `user_good`
     - Password: `pass_good`
   - For custom scenarios:
     - `user_custom` - Select account types
     - `user_error` - Trigger errors

6. Select accounts and complete connection

7. Verify:
   - Accounts appear in dashboard
   - Balances are displayed
   - Transaction history loads

#### B. Automated Testing
Run the test script:
```bash
node scripts/test-plaid-simple.js
```

This checks:
- Environment variables
- Required files
- Database connectivity
- API endpoint availability

### 2. Webhook Testing

#### Local Development with ngrok
1. Install ngrok: https://ngrok.com/download

2. Start ngrok tunnel:
   ```bash
   ngrok http 3000
   ```

3. Update `.env`:
   ```bash
   NEXT_PUBLIC_APP_URL=https://your-subdomain.ngrok.io
   ```

4. Restart dev server

5. Connect a bank account - webhooks will now work

#### Testing Webhook Events
1. Use Plaid's sandbox to trigger events:
   ```javascript
   // In Plaid dashboard or via API
   POST /sandbox/item/fire_webhook
   {
     "access_token": "access-sandbox-xxx",
     "webhook_code": "DEFAULT_UPDATE"
   }
   ```

2. Monitor webhook logs:
   ```sql
   SELECT * FROM plaid_webhook_events 
   ORDER BY created_at DESC;
   ```

### 3. Error Scenarios

Test these scenarios:

1. **Invalid Credentials**
   - Username: `user_bad`
   - Password: any
   - Should show error in Link

2. **Insufficient Permissions**
   - Connect with limited account access
   - Verify graceful handling

3. **Webhook Failures**
   - Disconnect internet during sync
   - Check retry logic

4. **Token Expiration**
   - Use expired token
   - Should prompt re-authentication

## Production Checklist

### 1. Security
- [ ] Enable production encryption for tokens
- [ ] Set up Supabase Vault for key management
- [ ] Configure webhook URL allowlist
- [ ] Enable rate limiting
- [ ] Set up monitoring and alerts

### 2. Plaid Configuration
- [ ] Get production API keys
- [ ] Configure production redirect URIs
- [ ] Set up production webhook URL
- [ ] Enable required products
- [ ] Configure OAuth if needed

### 3. Database
- [ ] Enable point-in-time backups
- [ ] Set up read replicas
- [ ] Configure connection pooling
- [ ] Enable query performance monitoring

### 4. Compliance
- [ ] Review Plaid's security requirements
- [ ] Implement data retention policies
- [ ] Set up audit logging
- [ ] Configure PII encryption
- [ ] Submit security documentation

## Monitoring

### Key Metrics
1. **Connection Success Rate**
   ```sql
   SELECT 
     COUNT(*) FILTER (WHERE is_active = true) as active,
     COUNT(*) FILTER (WHERE is_active = false) as inactive,
     COUNT(*) as total
   FROM plaid_items
   WHERE created_at > NOW() - INTERVAL '30 days';
   ```

2. **Sync Performance**
   ```sql
   SELECT 
     AVG(EXTRACT(EPOCH FROM (processed_at - created_at))) as avg_processing_time,
     COUNT(*) as total_events
   FROM plaid_webhook_events
   WHERE created_at > NOW() - INTERVAL '24 hours';
   ```

3. **Error Tracking**
   ```sql
   SELECT 
     webhook_code,
     COUNT(*) as count
   FROM plaid_webhook_events
   WHERE error IS NOT NULL
   GROUP BY webhook_code
   ORDER BY count DESC;
   ```

### Alerts to Configure
1. High webhook failure rate
2. Sync delays > 5 minutes
3. Access token errors
4. Rate limit warnings

## Troubleshooting

### Common Issues

1. **"Institution not supported"**
   - Check PLAID_COUNTRY_CODES
   - Verify product access

2. **"Invalid public token"**
   - Token expired (5 minutes)
   - Already exchanged
   - Wrong environment

3. **Webhook not receiving**
   - Check webhook URL
   - Verify SSL certificate
   - Check firewall rules

4. **Transactions missing**
   - Initial sync pending
   - Account permissions
   - Date range limits

### Debug Commands

```bash
# Check Plaid item status
curl -X POST https://sandbox.plaid.com/item/get \
  -H 'Content-Type: application/json' \
  -d '{
    "client_id": "$PLAID_CLIENT_ID",
    "secret": "$PLAID_SECRET",
    "access_token": "access-sandbox-xxx"
  }'

# Force webhook
curl -X POST https://sandbox.plaid.com/sandbox/item/fire_webhook \
  -H 'Content-Type: application/json' \
  -d '{
    "client_id": "$PLAID_CLIENT_ID",
    "secret": "$PLAID_SECRET",
    "access_token": "access-sandbox-xxx",
    "webhook_code": "DEFAULT_UPDATE"
  }'
```

## Support Resources

- Plaid Docs: https://plaid.com/docs/
- API Reference: https://plaid.com/docs/api/
- Error Codes: https://plaid.com/docs/errors/
- Postman Collection: https://github.com/plaid/plaid-postman

## Next Steps

1. Complete sandbox testing
2. Apply for production access
3. Implement advanced features:
   - Investment tracking
   - Liability monitoring
   - Identity verification
   - Payment initiation
4. Set up monitoring dashboard
5. Create user documentation