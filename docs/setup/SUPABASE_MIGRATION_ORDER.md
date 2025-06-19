# Supabase Migration Order & Complete Schema

## Migration Files Created

### Core Infrastructure
1. **001_base_schema.sql** - Base tables and functions (from initial setup)
2. **006_user_profiles_preferences.sql** - User profiles, preferences, sessions, consents

### Domain-Specific Tables
3. **002_complete_financial_domain.sql** - Financial accounts, crypto, investments, DeFi
4. **003_healthcare_domain.sql** - Health records, wearables, insurance, appointments
5. **004_integrations_sync.sql** - External service integrations, webhooks, sync logs
6. **005_crypto_custody_security.sql** - Secure crypto wallet management

### Monitoring & Security
7. **007_infrastructure_monitoring.sql** - System logs, security events, performance metrics

## Complete Table List

### User Management (006)
- `user_profiles` - Extended user information
- `user_preferences` - Settings and preferences
- `user_sessions` - Active sessions tracking
- `user_activities` - Activity logs (partitioned)
- `user_consents` - GDPR consent tracking
- `user_feature_flags` - Feature rollout control
- `user_api_keys` - API key management
- `user_notifications` - Notification queue
- `user_data_exports` - GDPR data export requests

### Financial Domain (002)
- `financial_accounts_extended` - All account types including crypto
- `transactions_extended` - Transactions with ML categorization (partitioned)
- `crypto_holdings` - Cryptocurrency portfolio
- `defi_positions` - DeFi protocol positions
- `investment_portfolios` - Investment accounts
- `investment_holdings` - Individual securities
- `budgets_advanced` - Budget tracking with ML
- `financial_goals_advanced` - Financial goals with AI
- `transaction_categories` - Category hierarchy
- `merchants` - Merchant enrichment data
- `recurring_transactions` - Detected recurring payments

### Healthcare Domain (003)
- `health_profiles` - Basic health info and genetics
- `health_records` - EHR/FHIR resources
- `medical_conditions` - Condition tracking
- `medications` - Medication management
- `allergies` - Allergy tracking
- `lab_results` - Lab test results
- `immunizations` - Vaccination records
- `healthcare_appointments` - Medical appointments
- `wearable_data` - Device data (partitioned)
- `health_metrics_summary` - Aggregated health metrics
- `mental_health_logs` - Mental wellness tracking
- `nutrition_logs` - Food and nutrition tracking

### Integration Infrastructure (004)
- `integration_credentials` - OAuth/API credentials
- `integration_sync_logs` - Sync history
- `webhook_events` - Incoming webhooks
- `api_rate_limits` - Rate limit tracking
- `data_mappings` - Field mapping configs
- `integration_health` - Integration monitoring
- `integration_providers` - Provider configurations
- `integration_permissions` - Data access permissions
- `integration_queue` - Async processing queue

### Crypto Security (005)
- `crypto_custody_wallets` - Wallet management (no private keys!)
- `hd_wallet_accounts` - HD wallet structure
- `crypto_addresses` - Address management
- `key_shares` - Shamir's Secret Sharing
- `hardware_wallet_devices` - Hardware wallet integration
- `multisig_participants` - Multi-signature setup
- `crypto_pending_transactions` - Transaction approval workflow
- `crypto_transaction_approvals` - Approval logs
- `crypto_whitelist_addresses` - Whitelisted addresses
- `cold_storage_vaults` - Cold storage tracking
- `paper_wallets` - Paper wallet metadata
- `crypto_inheritance` - Inheritance planning
- `defi_protocol_connections` - DeFi connections
- `smart_contract_interactions` - Contract interaction logs
- `nft_custody` - NFT management
- `address_monitoring` - Blockchain monitoring
- `crypto_security_incidents` - Security events
- `crypto_insurance_policies` - Insurance tracking
- `crypto_backup_registry` - Backup metadata
- `recovery_guardians` - Social recovery setup

### Infrastructure Monitoring (007)
- `system_access_logs` - All API requests (partitioned)
- `security_events` - Security incidents
- `performance_metrics` - Performance data (partitioned)
- `error_logs` - Application errors
- `api_usage_stats` - API usage analytics
- `health_checks` - Service health checks
- `traffic_analytics` - Traffic analysis
- `ddos_protection_logs` - DDoS attack logs
- `compliance_audit_logs` - Compliance tracking
- `monitoring_alerts` - Alert configurations

## Migration Execution Order

```bash
# 1. Set environment variables
export DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@[YOUR-PROJECT].supabase.co:5432/postgres"

# 2. Run migrations in order
cd /home/vboxuser/lifenavigator

# Core setup
psql $DATABASE_URL -f supabase/migrations/001_base_schema.sql
psql $DATABASE_URL -f supabase/migrations/006_user_profiles_preferences.sql

# Domain tables
psql $DATABASE_URL -f supabase/migrations/002_complete_financial_domain.sql
psql $DATABASE_URL -f supabase/migrations/003_healthcare_domain.sql
psql $DATABASE_URL -f supabase/migrations/004_integrations_sync.sql
psql $DATABASE_URL -f supabase/migrations/005_crypto_custody_security.sql

# Monitoring
psql $DATABASE_URL -f supabase/migrations/007_infrastructure_monitoring.sql
```

## Key Security Features Implemented

### Encryption
- Field-level encryption for PII/PHI/Financial data
- Separate encryption keys for different data types
- All sensitive fields encrypted at rest

### Row Level Security (RLS)
- All tables have RLS enabled
- Users can only access their own data
- Admin roles defined for support access

### Audit Logging
- Comprehensive audit trail for all actions
- 10-year retention for compliance
- Partitioned tables for performance

### Compliance
- HIPAA compliant health data handling
- GDPR consent management and data exports
- SOC2 audit trail and access controls
- PCI DSS for payment data

### Performance Optimization
- Table partitioning for time-series data
- Materialized views for dashboards
- Strategic indexes on all foreign keys and common queries
- JSONB for flexible schema evolution

## Next Steps

1. **Run all migrations** in the order specified above
2. **Create demo accounts** using the setup scripts
3. **Configure Supabase security**:
   - Enable RLS in Supabase dashboard
   - Set up encryption keys in environment
   - Configure backup policies
4. **Test the setup**:
   - Verify RLS policies work correctly
   - Test encryption/decryption
   - Check audit logging
5. **Set up monitoring**:
   - Configure alerts for security events
   - Set up performance monitoring
   - Enable compliance reporting

## Missing Domains (Future Migrations)

The following domains from the original requirements are not yet implemented:
- Automotive & Maintenance (vehicles, telemetry, maintenance)
- Real Estate & Smart Home (properties, IoT devices)
- Career & Employment (jobs, skills, networking)
- Education & Learning (courses, certifications)
- Family & Relationships (family members, events)
- Goals & Life Planning (goals, milestones)
- Risk Management (insurance, emergency planning)
- Legal & Compliance (documents, contracts)
- Environmental Impact (carbon tracking, sustainability)
- AI/ML Predictions (models, insights, recommendations)

These can be added as needed following the same pattern established in the existing migrations.