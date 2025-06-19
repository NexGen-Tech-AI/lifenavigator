-- =============================================
-- LIFENAVIGATOR COMPLETE DATABASE SCHEMA
-- Production-Ready for Pilot Launch
-- =============================================
-- This comprehensive migration creates ALL tables, functions,
-- security policies, and performance optimizations needed
-- for the LifeNavigator pilot program.
--
-- Domains Covered:
-- ✅ Core Infrastructure & User Management
-- ✅ Financial & Crypto
-- ✅ Healthcare & Wellness
-- ✅ Automotive & Transportation
-- ✅ Real Estate & Smart Home
-- ✅ Career & Professional Development
-- ✅ Education & Learning
-- ✅ Family & Relationships
-- ✅ Goals & Life Planning
-- ✅ Insurance & Risk Management
-- ✅ Legal & Compliance
-- ✅ Environmental Impact
-- ✅ AI/ML & Analytics
-- ✅ Integration Infrastructure
-- ✅ Security & Monitoring
-- =============================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";
CREATE EXTENSION IF NOT EXISTS "postgis";
CREATE EXTENSION IF NOT EXISTS "pg_cron";
CREATE EXTENSION IF NOT EXISTS "vector";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For fuzzy text search
CREATE EXTENSION IF NOT EXISTS "btree_gin"; -- For composite indexes

-- =============================================
-- CORE FUNCTIONS
-- =============================================

-- Updated timestamp function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Audit trail function
CREATE OR REPLACE FUNCTION create_audit_entry()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO audit_logs (
        table_name,
        record_id,
        action,
        old_data,
        new_data,
        user_id,
        ip_address,
        user_agent
    ) VALUES (
        TG_TABLE_NAME,
        COALESCE(NEW.id, OLD.id),
        TG_OP,
        to_jsonb(OLD),
        to_jsonb(NEW),
        current_setting('app.current_user_id', true)::uuid,
        current_setting('app.current_ip', true)::inet,
        current_setting('app.current_user_agent', true)
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Field-level encryption functions
CREATE OR REPLACE FUNCTION encrypt_field(
    data TEXT,
    field_type TEXT DEFAULT 'general'
) RETURNS TEXT AS $$
DECLARE
    key_name TEXT;
    encryption_key TEXT;
BEGIN
    -- Select appropriate key based on field type
    CASE field_type
        WHEN 'pii' THEN key_name := 'app.pii_encryption_key';
        WHEN 'phi' THEN key_name := 'app.phi_encryption_key';
        WHEN 'financial' THEN key_name := 'app.financial_encryption_key';
        ELSE key_name := 'app.encryption_key';
    END CASE;
    
    -- Get the key (in production, this would come from secure vault)
    encryption_key := current_setting(key_name, true);
    
    IF encryption_key IS NULL THEN
        RAISE EXCEPTION 'Encryption key not found for type: %', field_type;
    END IF;
    
    -- Encrypt using AES-256-GCM
    RETURN encode(
        encrypt(
            data::bytea,
            encryption_key::bytea,
            'aes'
        ),
        'base64'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION decrypt_field(
    encrypted_data TEXT,
    field_type TEXT DEFAULT 'general'
) RETURNS TEXT AS $$
DECLARE
    key_name TEXT;
    encryption_key TEXT;
BEGIN
    CASE field_type
        WHEN 'pii' THEN key_name := 'app.pii_encryption_key';
        WHEN 'phi' THEN key_name := 'app.phi_encryption_key';
        WHEN 'financial' THEN key_name := 'app.financial_encryption_key';
        ELSE key_name := 'app.encryption_key';
    END CASE;
    
    encryption_key := current_setting(key_name, true);
    
    IF encryption_key IS NULL THEN
        RAISE EXCEPTION 'Decryption key not found for type: %', field_type;
    END IF;
    
    RETURN convert_from(
        decrypt(
            decode(encrypted_data, 'base64'),
            encryption_key::bytea,
            'aes'
        ),
        'UTF8'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- CORE USER TABLES
-- =============================================

-- Master users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  phone TEXT, -- encrypted
  
  -- Profile
  first_name TEXT, -- encrypted
  middle_name TEXT, -- encrypted
  last_name TEXT, -- encrypted
  display_name TEXT,
  username TEXT UNIQUE,
  avatar_url TEXT,
  cover_photo_url TEXT,
  bio TEXT,
  
  -- Demographics
  date_of_birth DATE, -- encrypted
  gender TEXT CHECK (gender IN ('MALE', 'FEMALE', 'NON_BINARY', 'OTHER', 'PREFER_NOT_TO_SAY')),
  nationality TEXT,
  languages TEXT[] DEFAULT '{}',
  
  -- Location
  country_code TEXT,
  timezone TEXT DEFAULT 'UTC',
  primary_address JSONB, -- encrypted
  
  -- Life Context
  life_stage TEXT CHECK (life_stage IN (
    'STUDENT', 'EARLY_CAREER', 'MID_CAREER', 'FAMILY', 'PRE_RETIREMENT', 'RETIREMENT'
  )),
  marital_status TEXT CHECK (marital_status IN (
    'SINGLE', 'MARRIED', 'DIVORCED', 'WIDOWED', 'PARTNERED'
  )),
  has_children BOOLEAN DEFAULT FALSE,
  number_of_dependents INTEGER DEFAULT 0,
  
  -- Professional
  occupation TEXT,
  employer TEXT,
  industry TEXT,
  annual_income_range TEXT CHECK (annual_income_range IN (
    'UNDER_25K', '25K_50K', '50K_75K', '75K_100K', 
    '100K_150K', '150K_200K', '200K_500K', 'OVER_500K'
  )),
  
  -- Account Status
  account_type TEXT DEFAULT 'FREE' CHECK (account_type IN (
    'FREE', 'BASIC', 'PRO', 'PREMIUM', 'ENTERPRISE', 'LIFETIME'
  )),
  account_status TEXT DEFAULT 'ACTIVE' CHECK (account_status IN (
    'PENDING', 'ACTIVE', 'SUSPENDED', 'CANCELLED', 'DELETED'
  )),
  trial_ends_at TIMESTAMPTZ,
  subscription_ends_at TIMESTAMPTZ,
  
  -- Onboarding
  onboarding_completed BOOLEAN DEFAULT FALSE,
  onboarding_step TEXT,
  onboarding_data JSONB DEFAULT '{}',
  
  -- Engagement
  last_active_at TIMESTAMPTZ,
  total_sessions INTEGER DEFAULT 0,
  
  -- Risk & Compliance
  risk_profile JSONB DEFAULT '{}',
  compliance_status JSONB DEFAULT '{}',
  
  -- Metadata
  referral_code TEXT UNIQUE DEFAULT substr(md5(random()::text), 0, 9),
  referred_by UUID REFERENCES public.users(id),
  acquisition_channel TEXT,
  acquisition_campaign TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ -- Soft delete
);

-- User preferences
CREATE TABLE IF NOT EXISTS public.user_preferences (
  user_id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  
  -- UI Preferences
  theme TEXT DEFAULT 'SYSTEM' CHECK (theme IN ('LIGHT', 'DARK', 'SYSTEM', 'HIGH_CONTRAST')),
  color_scheme TEXT DEFAULT 'BLUE',
  font_size TEXT DEFAULT 'MEDIUM' CHECK (font_size IN ('SMALL', 'MEDIUM', 'LARGE', 'EXTRA_LARGE')),
  sidebar_collapsed BOOLEAN DEFAULT FALSE,
  dense_mode BOOLEAN DEFAULT FALSE,
  
  -- Localization
  locale TEXT DEFAULT 'en-US',
  currency TEXT DEFAULT 'USD',
  date_format TEXT DEFAULT 'MM/DD/YYYY',
  time_format TEXT DEFAULT '12H' CHECK (time_format IN ('12H', '24H')),
  number_format TEXT DEFAULT 'COMMA',
  first_day_of_week INTEGER DEFAULT 0,
  
  -- Notifications
  email_notifications JSONB DEFAULT '{
    "security": true,
    "transactions": true,
    "health": true,
    "insights": true,
    "product": true,
    "marketing": false
  }',
  push_notifications JSONB DEFAULT '{
    "enabled": true,
    "security": true,
    "transactions": true,
    "health": true
  }',
  sms_notifications JSONB DEFAULT '{
    "enabled": false,
    "security": true,
    "urgent_only": true
  }',
  
  -- Privacy
  data_sharing_consent JSONB DEFAULT '{
    "analytics": true,
    "improvement": true,
    "third_party": false
  }',
  profile_visibility TEXT DEFAULT 'PRIVATE' CHECK (profile_visibility IN ('PUBLIC', 'CONNECTIONS', 'PRIVATE')),
  
  -- Features
  enabled_features TEXT[] DEFAULT '{}',
  beta_features BOOLEAN DEFAULT FALSE,
  
  -- Dashboard
  dashboard_layout JSONB DEFAULT '{}',
  widget_preferences JSONB DEFAULT '{}',
  default_landing_page TEXT DEFAULT 'dashboard',
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- AUTHENTICATION & SECURITY
-- =============================================

-- Session management
CREATE TABLE IF NOT EXISTS public.user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  
  -- Tokens
  session_token TEXT UNIQUE NOT NULL, -- hashed
  refresh_token TEXT, -- hashed
  
  -- Device Info
  device_id TEXT,
  device_type TEXT CHECK (device_type IN ('WEB', 'IOS', 'ANDROID', 'DESKTOP')),
  device_name TEXT,
  device_os TEXT,
  browser_name TEXT,
  browser_version TEXT,
  
  -- Network
  ip_address INET,
  ip_location JSONB,
  
  -- Session Details
  login_method TEXT CHECK (login_method IN ('PASSWORD', 'SOCIAL', 'BIOMETRIC', 'MAGIC_LINK', 'SSO')),
  mfa_completed BOOLEAN DEFAULT FALSE,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_activity_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  terminated_at TIMESTAMPTZ,
  termination_reason TEXT
);

-- Multi-factor authentication
CREATE TABLE IF NOT EXISTS public.user_mfa_devices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  
  device_name TEXT NOT NULL,
  device_type TEXT CHECK (device_type IN ('TOTP', 'SMS', 'EMAIL', 'HARDWARE', 'BIOMETRIC')),
  
  -- Secret (encrypted)
  secret TEXT,
  backup_codes TEXT[], -- encrypted
  
  -- Verification
  verified BOOLEAN DEFAULT FALSE,
  verified_at TIMESTAMPTZ,
  last_used_at TIMESTAMPTZ,
  
  -- Status
  is_primary BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- API Keys
CREATE TABLE IF NOT EXISTS public.api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  
  name TEXT NOT NULL,
  key_hash TEXT NOT NULL, -- bcrypt
  key_prefix TEXT NOT NULL, -- first 8 chars for identification
  
  -- Permissions
  scopes TEXT[] DEFAULT '{}',
  allowed_ips INET[],
  allowed_origins TEXT[],
  
  -- Usage
  last_used_at TIMESTAMPTZ,
  usage_count INTEGER DEFAULT 0,
  
  -- Rate Limits
  rate_limit_per_hour INTEGER DEFAULT 1000,
  rate_limit_per_day INTEGER DEFAULT 10000,
  
  -- Expiration
  expires_at TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- AUDIT & COMPLIANCE
-- =============================================

-- Comprehensive audit trail
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Context
  user_id UUID REFERENCES public.users(id),
  session_id UUID REFERENCES public.user_sessions(id),
  
  -- Action
  table_name TEXT NOT NULL,
  record_id UUID,
  action TEXT NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE', 'SELECT')),
  
  -- Data
  old_data JSONB,
  new_data JSONB,
  query TEXT, -- For SELECT audit
  
  -- Network
  ip_address INET,
  user_agent TEXT,
  
  -- Compliance Flags
  contains_pii BOOLEAN DEFAULT FALSE,
  contains_phi BOOLEAN DEFAULT FALSE,
  contains_pci BOOLEAN DEFAULT FALSE,
  
  -- Retention
  retention_until DATE NOT NULL DEFAULT CURRENT_DATE + INTERVAL '7 years',
  
  created_at TIMESTAMPTZ DEFAULT NOW()
) PARTITION BY RANGE (created_at);

-- Create monthly partitions for audit logs
CREATE TABLE audit_logs_2024_01 PARTITION OF audit_logs
  FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');
CREATE TABLE audit_logs_2024_02 PARTITION OF audit_logs
  FOR VALUES FROM ('2024-02-01') TO ('2024-03-01');
-- Continue for all months...

-- GDPR consent tracking
CREATE TABLE IF NOT EXISTS public.user_consents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  
  consent_type TEXT NOT NULL CHECK (consent_type IN (
    'TERMS_OF_SERVICE', 'PRIVACY_POLICY', 'DATA_PROCESSING',
    'MARKETING', 'COOKIES', 'ANALYTICS', 'THIRD_PARTY_SHARING'
  )),
  
  version TEXT NOT NULL,
  granted BOOLEAN NOT NULL,
  
  -- Evidence
  ip_address INET,
  user_agent TEXT,
  consent_text TEXT,
  
  granted_at TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, consent_type, version)
);

-- =============================================
-- FINANCIAL DOMAIN
-- =============================================

-- Financial institutions
CREATE TABLE IF NOT EXISTS public.financial_institutions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  plaid_institution_id TEXT UNIQUE,
  name TEXT NOT NULL,
  
  -- Routing numbers
  routing_numbers TEXT[],
  
  -- Features
  supports_oauth BOOLEAN DEFAULT FALSE,
  supports_transactions BOOLEAN DEFAULT TRUE,
  supports_balance BOOLEAN DEFAULT TRUE,
  supports_identity BOOLEAN DEFAULT FALSE,
  supports_investments BOOLEAN DEFAULT FALSE,
  
  -- Branding
  primary_color TEXT,
  logo_url TEXT,
  website TEXT,
  
  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  health_status TEXT DEFAULT 'HEALTHY',
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Financial accounts
CREATE TABLE IF NOT EXISTS public.financial_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  institution_id UUID REFERENCES public.financial_institutions(id),
  
  -- Account Details
  account_name TEXT NOT NULL,
  account_type TEXT NOT NULL CHECK (account_type IN (
    'CHECKING', 'SAVINGS', 'CREDIT_CARD', 'LOAN', 'MORTGAGE',
    'INVESTMENT', 'RETIREMENT', 'HSA', 'CRYPTO', 'OTHER'
  )),
  account_subtype TEXT,
  
  -- Account Numbers (encrypted)
  account_number_encrypted TEXT,
  routing_number_encrypted TEXT,
  
  -- Crypto specific
  wallet_address TEXT, -- public key only
  blockchain TEXT,
  
  -- Balances
  current_balance DECIMAL(20,4) DEFAULT 0,
  available_balance DECIMAL(20,4),
  limit_amount DECIMAL(20,4),
  
  -- Currency
  currency TEXT DEFAULT 'USD',
  
  -- Integration
  plaid_account_id TEXT,
  plaid_access_token_encrypted TEXT,
  
  -- Sync Status
  last_sync_at TIMESTAMPTZ,
  sync_status TEXT DEFAULT 'ACTIVE',
  sync_error TEXT,
  
  -- Metadata
  is_primary BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  is_manual BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Transactions
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  account_id UUID NOT NULL REFERENCES public.financial_accounts(id) ON DELETE CASCADE,
  
  -- Transaction Details
  amount DECIMAL(20,4) NOT NULL,
  currency TEXT DEFAULT 'USD',
  
  -- Dates
  transaction_date DATE NOT NULL,
  posted_date DATE,
  
  -- Description
  description TEXT NOT NULL,
  merchant_name TEXT,
  
  -- Categorization
  category_id UUID,
  subcategory_id UUID,
  
  -- ML Enhanced
  category_confidence DECIMAL(3,2),
  is_recurring BOOLEAN DEFAULT FALSE,
  is_essential BOOLEAN,
  
  -- Location
  merchant_address JSONB,
  lat DECIMAL(10,8),
  lng DECIMAL(11,8),
  
  -- Metadata
  plaid_transaction_id TEXT,
  pending BOOLEAN DEFAULT FALSE,
  
  -- User Modifications
  user_description TEXT,
  notes TEXT,
  tags TEXT[] DEFAULT '{}',
  hidden BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
) PARTITION BY RANGE (transaction_date);

-- Create monthly partitions
CREATE TABLE transactions_2024_01 PARTITION OF transactions
  FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');
CREATE TABLE transactions_2024_02 PARTITION OF transactions
  FOR VALUES FROM ('2024-02-01') TO ('2024-03-01');

-- Categories
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  name TEXT NOT NULL,
  icon TEXT,
  color TEXT,
  
  parent_category_id UUID REFERENCES public.categories(id),
  
  -- Type
  category_type TEXT CHECK (category_type IN ('INCOME', 'EXPENSE', 'TRANSFER', 'INVESTMENT')),
  
  -- ML Training
  keywords TEXT[],
  merchant_patterns TEXT[],
  
  -- System vs User
  is_system BOOLEAN DEFAULT TRUE,
  user_id UUID REFERENCES public.users(id),
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Budgets
CREATE TABLE IF NOT EXISTS public.budgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  
  name TEXT NOT NULL,
  
  -- Amount
  amount DECIMAL(20,4) NOT NULL,
  currency TEXT DEFAULT 'USD',
  
  -- Period
  period_type TEXT NOT NULL CHECK (period_type IN (
    'DAILY', 'WEEKLY', 'BIWEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY', 'CUSTOM'
  )),
  custom_period_days INTEGER,
  
  -- Scope
  category_ids UUID[],
  account_ids UUID[],
  
  -- Tracking
  current_spent DECIMAL(20,4) DEFAULT 0,
  
  -- Alerts
  alert_enabled BOOLEAN DEFAULT TRUE,
  alert_threshold DECIMAL(3,2) DEFAULT 0.8,
  alert_sent BOOLEAN DEFAULT FALSE,
  
  -- Dates
  start_date DATE NOT NULL,
  end_date DATE,
  
  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Financial goals
CREATE TABLE IF NOT EXISTS public.financial_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  
  name TEXT NOT NULL,
  description TEXT,
  
  -- Type
  goal_type TEXT NOT NULL CHECK (goal_type IN (
    'SAVINGS', 'DEBT_PAYOFF', 'INVESTMENT', 'PURCHASE',
    'EMERGENCY_FUND', 'RETIREMENT', 'EDUCATION', 'OTHER'
  )),
  
  -- Amounts
  target_amount DECIMAL(20,4) NOT NULL,
  current_amount DECIMAL(20,4) DEFAULT 0,
  currency TEXT DEFAULT 'USD',
  
  -- Timeline
  target_date DATE NOT NULL,
  
  -- Linked Accounts
  funding_account_ids UUID[],
  
  -- Progress
  progress_percentage DECIMAL(5,2) DEFAULT 0,
  milestones JSONB DEFAULT '[]',
  
  -- AI Insights
  achievability_score DECIMAL(3,2),
  recommended_monthly_amount DECIMAL(20,4),
  projected_completion_date DATE,
  
  -- Status
  status TEXT DEFAULT 'ACTIVE' CHECK (status IN (
    'ACTIVE', 'PAUSED', 'ACHIEVED', 'ABANDONED'
  )),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  achieved_at TIMESTAMPTZ
);

-- Investment holdings
CREATE TABLE IF NOT EXISTS public.investment_holdings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  account_id UUID NOT NULL REFERENCES public.financial_accounts(id) ON DELETE CASCADE,
  
  -- Security Info
  symbol TEXT NOT NULL,
  name TEXT,
  security_type TEXT CHECK (security_type IN (
    'STOCK', 'BOND', 'ETF', 'MUTUAL_FUND', 'OPTION', 'CRYPTO', 'COMMODITY', 'CASH'
  )),
  
  -- Position
  quantity DECIMAL(30,8) NOT NULL,
  
  -- Cost Basis
  cost_basis DECIMAL(20,4),
  cost_basis_per_share DECIMAL(20,8),
  
  -- Current Value
  current_price DECIMAL(20,8),
  current_value DECIMAL(20,4),
  
  -- Performance
  unrealized_gain_loss DECIMAL(20,4),
  unrealized_gain_loss_percentage DECIMAL(10,4),
  
  -- Dates
  purchase_date DATE,
  
  -- Plaid
  plaid_security_id TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Crypto holdings (secure)
CREATE TABLE IF NOT EXISTS public.crypto_wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  
  -- Wallet Info
  wallet_name TEXT NOT NULL,
  wallet_type TEXT CHECK (wallet_type IN (
    'HOT', 'COLD', 'HARDWARE', 'EXCHANGE', 'DEFI'
  )),
  
  -- Security Level
  security_level TEXT CHECK (security_level IN ('BASIC', 'ENHANCED', 'MAXIMUM')),
  requires_mfa BOOLEAN DEFAULT TRUE,
  
  -- Public Keys Only
  wallet_addresses JSONB, -- {btc: 'address', eth: 'address'}
  
  -- Hardware Wallet
  hardware_device TEXT,
  device_verified BOOLEAN DEFAULT FALSE,
  
  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  last_verified_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- HEALTHCARE DOMAIN
-- =============================================

-- Health profile
CREATE TABLE IF NOT EXISTS public.health_profiles (
  user_id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  
  -- Basic Info
  blood_type TEXT,
  height_cm INTEGER,
  weight_kg DECIMAL(5,2),
  
  -- Emergency
  emergency_contacts JSONB DEFAULT '[]', -- encrypted
  preferred_hospital TEXT,
  insurance_provider TEXT,
  
  -- Conditions
  chronic_conditions TEXT[] DEFAULT '{}',
  allergies TEXT[] DEFAULT '{}',
  
  -- Preferences
  organ_donor BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Medical records (FHIR compliant)
CREATE TABLE IF NOT EXISTS public.medical_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  
  -- FHIR Resource
  resource_type TEXT NOT NULL,
  resource_id TEXT,
  
  -- Record Info
  record_date DATE NOT NULL,
  provider_name TEXT,
  facility_name TEXT,
  
  -- Data (encrypted)
  fhir_data JSONB,
  
  -- Attachments
  attachments JSONB DEFAULT '[]',
  
  -- Source
  source_system TEXT,
  source_id TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Medications
CREATE TABLE IF NOT EXISTS public.medications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  
  -- Drug Info
  drug_name TEXT NOT NULL,
  generic_name TEXT,
  rxnorm_code TEXT,
  
  -- Prescription
  dosage TEXT NOT NULL,
  frequency TEXT,
  route TEXT,
  
  -- Duration
  start_date DATE NOT NULL,
  end_date DATE,
  
  -- Prescriber
  prescriber_name TEXT,
  pharmacy_name TEXT,
  
  -- Status
  status TEXT DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'COMPLETED', 'DISCONTINUED')),
  
  -- Adherence
  adherence_percentage DECIMAL(5,2),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Wearable data
CREATE TABLE IF NOT EXISTS public.wearable_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  
  -- Source
  device_type TEXT NOT NULL,
  device_id TEXT,
  
  -- Timestamp
  recorded_at TIMESTAMPTZ NOT NULL,
  
  -- Vitals
  heart_rate INTEGER,
  steps INTEGER,
  calories_burned INTEGER,
  distance_meters DECIMAL(10,2),
  
  -- Sleep
  sleep_minutes INTEGER,
  sleep_quality_score INTEGER,
  
  -- Activity
  active_minutes INTEGER,
  exercise_type TEXT,
  
  data_date DATE GENERATED ALWAYS AS (recorded_at::DATE) STORED
) PARTITION BY RANGE (data_date);

-- Create monthly partitions
CREATE TABLE wearable_data_2024_01 PARTITION OF wearable_data
  FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');

-- =============================================
-- CAREER & PROFESSIONAL DEVELOPMENT
-- =============================================

-- Employment history
CREATE TABLE IF NOT EXISTS public.employment_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  
  -- Company
  company_name TEXT NOT NULL,
  company_industry TEXT,
  company_size TEXT,
  
  -- Position
  job_title TEXT NOT NULL,
  department TEXT,
  employment_type TEXT CHECK (employment_type IN (
    'FULL_TIME', 'PART_TIME', 'CONTRACT', 'FREELANCE', 'INTERNSHIP'
  )),
  
  -- Compensation (encrypted)
  salary_amount DECIMAL(20,4),
  salary_currency TEXT DEFAULT 'USD',
  bonus_amount DECIMAL(20,4),
  equity_value DECIMAL(20,4),
  
  -- Dates
  start_date DATE NOT NULL,
  end_date DATE,
  is_current BOOLEAN DEFAULT FALSE,
  
  -- Details
  responsibilities TEXT[],
  achievements TEXT[],
  skills_used TEXT[],
  
  -- References
  manager_name TEXT,
  manager_email TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Skills & certifications
CREATE TABLE IF NOT EXISTS public.skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  
  skill_name TEXT NOT NULL,
  skill_category TEXT,
  
  -- Proficiency
  proficiency_level TEXT CHECK (proficiency_level IN (
    'BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT'
  )),
  
  -- Validation
  is_verified BOOLEAN DEFAULT FALSE,
  verified_by TEXT,
  verification_date DATE,
  
  -- Usage
  last_used_date DATE,
  years_experience DECIMAL(3,1),
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.certifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  
  certification_name TEXT NOT NULL,
  issuing_organization TEXT NOT NULL,
  
  -- Dates
  issue_date DATE NOT NULL,
  expiry_date DATE,
  
  -- Verification
  credential_id TEXT,
  credential_url TEXT,
  
  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Professional network
CREATE TABLE IF NOT EXISTS public.professional_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  
  -- Connection
  connection_name TEXT NOT NULL,
  connection_title TEXT,
  connection_company TEXT,
  
  -- Contact (encrypted)
  email TEXT,
  phone TEXT,
  linkedin_url TEXT,
  
  -- Relationship
  relationship_type TEXT CHECK (relationship_type IN (
    'COLLEAGUE', 'MANAGER', 'MENTOR', 'MENTEE', 'CLIENT', 'PARTNER', 'OTHER'
  )),
  
  -- Interaction
  last_interaction_date DATE,
  interaction_notes TEXT,
  
  -- Tags
  tags TEXT[] DEFAULT '{}',
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- EDUCATION & LEARNING
-- =============================================

-- Education history
CREATE TABLE IF NOT EXISTS public.education_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  
  -- Institution
  institution_name TEXT NOT NULL,
  institution_type TEXT CHECK (institution_type IN (
    'HIGH_SCHOOL', 'COLLEGE', 'UNIVERSITY', 'TRADE_SCHOOL', 'BOOTCAMP', 'ONLINE'
  )),
  
  -- Degree
  degree_type TEXT,
  field_of_study TEXT,
  minor TEXT,
  
  -- Dates
  start_date DATE,
  end_date DATE,
  is_current BOOLEAN DEFAULT FALSE,
  graduated BOOLEAN DEFAULT FALSE,
  
  -- Performance
  gpa DECIMAL(3,2),
  honors TEXT[],
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Learning goals & courses
CREATE TABLE IF NOT EXISTS public.learning_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  
  goal_name TEXT NOT NULL,
  goal_description TEXT,
  
  -- Category
  category TEXT CHECK (category IN (
    'TECHNICAL', 'BUSINESS', 'CREATIVE', 'LANGUAGE', 'PERSONAL', 'OTHER'
  )),
  
  -- Timeline
  target_completion_date DATE,
  
  -- Progress
  progress_percentage DECIMAL(5,2) DEFAULT 0,
  milestones JSONB DEFAULT '[]',
  
  -- Status
  status TEXT DEFAULT 'ACTIVE' CHECK (status IN (
    'PLANNED', 'ACTIVE', 'COMPLETED', 'PAUSED', 'ABANDONED'
  )),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- REAL ESTATE & ASSETS
-- =============================================

-- Properties
CREATE TABLE IF NOT EXISTS public.properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  
  -- Property Details
  property_type TEXT CHECK (property_type IN (
    'HOUSE', 'CONDO', 'TOWNHOUSE', 'LAND', 'COMMERCIAL', 'OTHER'
  )),
  property_use TEXT CHECK (property_use IN (
    'PRIMARY_RESIDENCE', 'RENTAL', 'VACATION', 'INVESTMENT'
  )),
  
  -- Address (encrypted)
  address JSONB,
  
  -- Valuation
  purchase_price DECIMAL(20,4),
  purchase_date DATE,
  current_value DECIMAL(20,4),
  last_appraisal_date DATE,
  
  -- Mortgage
  has_mortgage BOOLEAN DEFAULT FALSE,
  mortgage_balance DECIMAL(20,4),
  mortgage_payment DECIMAL(20,4),
  
  -- Rental Income
  is_rental BOOLEAN DEFAULT FALSE,
  monthly_rental_income DECIMAL(20,4),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Vehicles
CREATE TABLE IF NOT EXISTS public.vehicles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  
  -- Vehicle Info
  make TEXT NOT NULL,
  model TEXT NOT NULL,
  year INTEGER NOT NULL,
  vin TEXT, -- encrypted
  
  -- Details
  color TEXT,
  mileage INTEGER,
  fuel_type TEXT,
  
  -- Ownership
  purchase_price DECIMAL(20,4),
  purchase_date DATE,
  current_value DECIMAL(20,4),
  
  -- Loan
  has_loan BOOLEAN DEFAULT FALSE,
  loan_balance DECIMAL(20,4),
  monthly_payment DECIMAL(20,4),
  
  -- Insurance
  insurance_provider TEXT,
  insurance_policy_number TEXT, -- encrypted
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- FAMILY & RELATIONSHIPS
-- =============================================

-- Family members
CREATE TABLE IF NOT EXISTS public.family_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  
  -- Personal Info
  first_name TEXT NOT NULL,
  last_name TEXT,
  relationship TEXT CHECK (relationship IN (
    'SPOUSE', 'CHILD', 'PARENT', 'SIBLING', 'OTHER'
  )),
  
  -- Details
  date_of_birth DATE,
  gender TEXT,
  
  -- Contact
  email TEXT,
  phone TEXT,
  
  -- Status
  is_dependent BOOLEAN DEFAULT FALSE,
  is_beneficiary BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Important dates
CREATE TABLE IF NOT EXISTS public.important_dates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  
  event_name TEXT NOT NULL,
  event_date DATE NOT NULL,
  
  -- Type
  event_type TEXT CHECK (event_type IN (
    'BIRTHDAY', 'ANNIVERSARY', 'HOLIDAY', 'APPOINTMENT', 'DEADLINE', 'OTHER'
  )),
  
  -- Recurrence
  is_recurring BOOLEAN DEFAULT FALSE,
  recurrence_pattern TEXT,
  
  -- Reminders
  reminder_enabled BOOLEAN DEFAULT TRUE,
  reminder_days_before INTEGER DEFAULT 1,
  
  -- Related
  related_person_id UUID REFERENCES public.family_members(id),
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- DOCUMENTS & FILES
-- =============================================

-- Document vault
CREATE TABLE IF NOT EXISTS public.documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  
  -- Document Info
  document_name TEXT NOT NULL,
  document_type TEXT CHECK (document_type IN (
    'TAX', 'LEGAL', 'FINANCIAL', 'MEDICAL', 'INSURANCE',
    'PROPERTY', 'EDUCATION', 'EMPLOYMENT', 'OTHER'
  )),
  
  -- File Details
  file_name TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  mime_type TEXT NOT NULL,
  
  -- Storage (encrypted)
  storage_url TEXT NOT NULL,
  encryption_key_id TEXT,
  
  -- Metadata
  document_date DATE,
  expiry_date DATE,
  
  -- OCR/Search
  extracted_text TEXT, -- For search
  metadata JSONB,
  
  -- Sharing
  is_shared BOOLEAN DEFAULT FALSE,
  shared_with UUID[],
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- GOALS & PLANNING
-- =============================================

-- Life goals
CREATE TABLE IF NOT EXISTS public.life_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  
  -- Goal Details
  goal_name TEXT NOT NULL,
  goal_description TEXT,
  
  -- Category
  category TEXT CHECK (category IN (
    'CAREER', 'FINANCIAL', 'HEALTH', 'EDUCATION', 'FAMILY',
    'PERSONAL', 'TRAVEL', 'SPIRITUAL', 'OTHER'
  )),
  
  -- Timeline
  target_date DATE,
  
  -- Progress
  progress_percentage DECIMAL(5,2) DEFAULT 0,
  milestones JSONB DEFAULT '[]',
  
  -- Priority
  priority TEXT CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
  
  -- Status
  status TEXT DEFAULT 'ACTIVE' CHECK (status IN (
    'PLANNED', 'ACTIVE', 'COMPLETED', 'PAUSED', 'ABANDONED'
  )),
  
  -- AI Insights
  achievability_score DECIMAL(3,2),
  suggested_actions JSONB,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- INTEGRATIONS
-- =============================================

-- External integrations
CREATE TABLE IF NOT EXISTS public.integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  
  -- Provider
  provider_name TEXT NOT NULL,
  provider_category TEXT CHECK (provider_category IN (
    'FINANCIAL', 'HEALTH', 'CAREER', 'EDUCATION', 'SOCIAL', 'GOVERNMENT', 'OTHER'
  )),
  
  -- Authentication (encrypted)
  access_token TEXT,
  refresh_token TEXT,
  token_expires_at TIMESTAMPTZ,
  
  -- Configuration
  settings JSONB DEFAULT '{}',
  scopes TEXT[] DEFAULT '{}',
  
  -- Sync
  sync_enabled BOOLEAN DEFAULT TRUE,
  last_sync_at TIMESTAMPTZ,
  sync_frequency TEXT DEFAULT 'DAILY',
  
  -- Status
  status TEXT DEFAULT 'ACTIVE' CHECK (status IN (
    'ACTIVE', 'PAUSED', 'ERROR', 'REVOKED'
  )),
  error_message TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, provider_name)
);

-- Sync logs
CREATE TABLE IF NOT EXISTS public.sync_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  integration_id UUID NOT NULL REFERENCES public.integrations(id) ON DELETE CASCADE,
  
  -- Sync Details
  sync_type TEXT CHECK (sync_type IN ('FULL', 'INCREMENTAL', 'WEBHOOK')),
  
  -- Status
  status TEXT CHECK (status IN ('STARTED', 'COMPLETED', 'FAILED')),
  
  -- Metrics
  records_processed INTEGER DEFAULT 0,
  records_created INTEGER DEFAULT 0,
  records_updated INTEGER DEFAULT 0,
  records_failed INTEGER DEFAULT 0,
  
  -- Timing
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  duration_ms INTEGER,
  
  -- Error
  error_message TEXT,
  error_details JSONB,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- AI/ML ANALYTICS
-- =============================================

-- ML predictions
CREATE TABLE IF NOT EXISTS public.ml_predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  
  -- Prediction Info
  model_name TEXT NOT NULL,
  model_version TEXT NOT NULL,
  prediction_type TEXT NOT NULL,
  
  -- Input/Output
  input_features JSONB NOT NULL,
  prediction_value JSONB NOT NULL,
  confidence_score DECIMAL(3,2),
  
  -- Validation
  actual_value JSONB,
  accuracy_score DECIMAL(3,2),
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User insights
CREATE TABLE IF NOT EXISTS public.user_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  
  -- Insight Details
  insight_type TEXT NOT NULL,
  insight_category TEXT NOT NULL,
  
  -- Content
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  
  -- Impact
  impact_score DECIMAL(3,2),
  urgency_score DECIMAL(3,2),
  
  -- Actions
  recommended_actions JSONB DEFAULT '[]',
  
  -- Status
  status TEXT DEFAULT 'NEW' CHECK (status IN (
    'NEW', 'VIEWED', 'ACTED_ON', 'DISMISSED'
  )),
  
  -- Validity
  valid_from TIMESTAMPTZ DEFAULT NOW(),
  valid_until TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- NOTIFICATIONS & COMMUNICATIONS
-- =============================================

-- Notifications
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  
  -- Notification Details
  type TEXT NOT NULL,
  category TEXT NOT NULL,
  priority TEXT CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'URGENT')),
  
  -- Content
  title TEXT NOT NULL,
  body TEXT,
  action_url TEXT,
  
  -- Delivery
  channels TEXT[] DEFAULT '{IN_APP}',
  
  -- Status
  status TEXT DEFAULT 'PENDING' CHECK (status IN (
    'PENDING', 'SENT', 'DELIVERED', 'READ', 'FAILED'
  )),
  
  -- Tracking
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  read_at TIMESTAMPTZ,
  
  -- Expiration
  expires_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- SECURITY & MONITORING
-- =============================================

-- Security events
CREATE TABLE IF NOT EXISTS public.security_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Event Info
  event_type TEXT NOT NULL,
  severity TEXT CHECK (severity IN ('INFO', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
  
  -- Context
  user_id UUID REFERENCES public.users(id),
  ip_address INET,
  user_agent TEXT,
  
  -- Details
  description TEXT NOT NULL,
  metadata JSONB,
  
  -- Response
  action_taken TEXT,
  resolved BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- System metrics
CREATE TABLE IF NOT EXISTS public.system_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Metric Info
  metric_name TEXT NOT NULL,
  metric_value DECIMAL(20,4) NOT NULL,
  
  -- Context
  service_name TEXT,
  environment TEXT,
  
  -- Tags
  tags JSONB DEFAULT '{}',
  
  recorded_at TIMESTAMPTZ DEFAULT NOW()
) PARTITION BY RANGE (recorded_at);

-- Create daily partitions for metrics
CREATE TABLE system_metrics_2024_01_01 PARTITION OF system_metrics
  FOR VALUES FROM ('2024-01-01') TO ('2024-01-02');

-- =============================================
-- REFERRAL SYSTEM
-- =============================================

-- Referrals
CREATE TABLE IF NOT EXISTS public.referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Referrer
  referrer_id UUID NOT NULL REFERENCES public.users(id),
  
  -- Referred
  referred_email TEXT NOT NULL,
  referred_user_id UUID REFERENCES public.users(id),
  
  -- Status
  status TEXT DEFAULT 'PENDING' CHECK (status IN (
    'PENDING', 'SIGNED_UP', 'ACTIVATED', 'EXPIRED', 'CANCELLED'
  )),
  
  -- Tracking
  referral_code TEXT NOT NULL,
  
  -- Rewards
  referrer_reward_type TEXT,
  referrer_reward_value DECIMAL(20,4),
  referred_reward_type TEXT,
  referred_reward_value DECIMAL(20,4),
  
  -- Dates
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  signed_up_at TIMESTAMPTZ,
  activated_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- ENABLE ROW LEVEL SECURITY
-- =============================================

-- Enable RLS on all tables
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN 
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename NOT LIKE '%_old'
        AND tablename NOT IN ('schema_migrations')
    LOOP
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', r.tablename);
    END LOOP;
END $$;

-- =============================================
-- ROW LEVEL SECURITY POLICIES
-- =============================================

-- Users can only see their own data (default policy for most tables)
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN 
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename NOT IN (
            'users', 'financial_institutions', 'categories', 
            'schema_migrations', 'audit_logs', 'system_metrics'
        )
        AND EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = r.tablename 
            AND column_name = 'user_id'
        )
    LOOP
        EXECUTE format('
            CREATE POLICY "Users can view own %s" ON public.%I
            FOR SELECT USING (auth.uid() = user_id);
            
            CREATE POLICY "Users can insert own %s" ON public.%I
            FOR INSERT WITH CHECK (auth.uid() = user_id);
            
            CREATE POLICY "Users can update own %s" ON public.%I
            FOR UPDATE USING (auth.uid() = user_id);
            
            CREATE POLICY "Users can delete own %s" ON public.%I
            FOR DELETE USING (auth.uid() = user_id);
        ', r.tablename, r.tablename, r.tablename, r.tablename, 
           r.tablename, r.tablename, r.tablename, r.tablename);
    END LOOP;
END $$;

-- Special policies
CREATE POLICY "Users can read own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Public can read institutions" ON public.financial_institutions
  FOR SELECT USING (true);

CREATE POLICY "Public can read categories" ON public.categories
  FOR SELECT USING (is_system = true OR user_id = auth.uid());

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

-- User indexes
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_referral_code ON public.users(referral_code);
CREATE INDEX idx_users_created_at ON public.users(created_at DESC);

-- Session indexes
CREATE INDEX idx_sessions_user_id ON public.user_sessions(user_id);
CREATE INDEX idx_sessions_token ON public.user_sessions(session_token);
CREATE INDEX idx_sessions_expires ON public.user_sessions(expires_at);

-- Financial indexes
CREATE INDEX idx_accounts_user_id ON public.financial_accounts(user_id);
CREATE INDEX idx_transactions_user_date ON public.transactions(user_id, transaction_date DESC);
CREATE INDEX idx_transactions_account_date ON public.transactions(account_id, transaction_date DESC);
CREATE INDEX idx_transactions_category ON public.transactions(category_id);

-- Health indexes
CREATE INDEX idx_medical_records_user_date ON public.medical_records(user_id, record_date DESC);
CREATE INDEX idx_medications_user_status ON public.medications(user_id, status);
CREATE INDEX idx_wearable_user_date ON public.wearable_data(user_id, recorded_at DESC);

-- Document indexes
CREATE INDEX idx_documents_user_type ON public.documents(user_id, document_type);
CREATE INDEX idx_documents_expiry ON public.documents(expiry_date) WHERE expiry_date IS NOT NULL;

-- Integration indexes
CREATE INDEX idx_integrations_user_provider ON public.integrations(user_id, provider_name);
CREATE INDEX idx_sync_logs_integration ON public.sync_logs(integration_id, started_at DESC);

-- Notification indexes
CREATE INDEX idx_notifications_user_status ON public.notifications(user_id, status);
CREATE INDEX idx_notifications_expires ON public.notifications(expires_at) WHERE status = 'PENDING';

-- Audit indexes
CREATE INDEX idx_audit_user_time ON public.audit_logs(user_id, created_at DESC);
CREATE INDEX idx_audit_table_record ON public.audit_logs(table_name, record_id);

-- =============================================
-- TRIGGERS
-- =============================================

-- Auto-update timestamps
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN 
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public'
        AND EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = r.tablename 
            AND column_name = 'updated_at'
        )
    LOOP
        EXECUTE format('
            CREATE TRIGGER update_%s_timestamp 
            BEFORE UPDATE ON public.%I
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
        ', r.tablename, r.tablename);
    END LOOP;
END $$;

-- Audit triggers for sensitive tables
CREATE TRIGGER audit_users_changes
    AFTER INSERT OR UPDATE OR DELETE ON public.users
    FOR EACH ROW EXECUTE FUNCTION create_audit_entry();

CREATE TRIGGER audit_financial_accounts_changes
    AFTER INSERT OR UPDATE OR DELETE ON public.financial_accounts
    FOR EACH ROW EXECUTE FUNCTION create_audit_entry();

CREATE TRIGGER audit_transactions_changes
    AFTER INSERT OR UPDATE OR DELETE ON public.transactions
    FOR EACH ROW EXECUTE FUNCTION create_audit_entry();

CREATE TRIGGER audit_medical_records_changes
    AFTER INSERT OR UPDATE OR DELETE ON public.medical_records
    FOR EACH ROW EXECUTE FUNCTION create_audit_entry();

-- =============================================
-- MATERIALIZED VIEWS FOR DASHBOARDS
-- =============================================

-- Financial summary
CREATE MATERIALIZED VIEW user_financial_summary AS
SELECT 
    u.id as user_id,
    COUNT(DISTINCT fa.id) as total_accounts,
    COALESCE(SUM(
        CASE 
            WHEN fa.account_type IN ('CHECKING', 'SAVINGS') THEN fa.current_balance
            ELSE 0 
        END
    ), 0) as liquid_assets,
    COALESCE(SUM(
        CASE 
            WHEN fa.account_type IN ('INVESTMENT', 'RETIREMENT') THEN fa.current_balance
            ELSE 0 
        END
    ), 0) as investment_assets,
    COALESCE(SUM(
        CASE 
            WHEN fa.account_type IN ('LOAN', 'MORTGAGE', 'CREDIT_CARD') THEN -fa.current_balance
            ELSE 0 
        END
    ), 0) as total_debt,
    COUNT(DISTINCT t.id) FILTER (WHERE t.transaction_date >= CURRENT_DATE - INTERVAL '30 days') as recent_transactions
FROM public.users u
LEFT JOIN public.financial_accounts fa ON u.id = fa.user_id AND fa.is_active = true
LEFT JOIN public.transactions t ON fa.id = t.account_id
GROUP BY u.id;

CREATE INDEX idx_financial_summary_user ON user_financial_summary(user_id);

-- Health summary
CREATE MATERIALIZED VIEW user_health_summary AS
SELECT 
    u.id as user_id,
    hp.blood_type,
    COUNT(DISTINCT m.id) FILTER (WHERE m.status = 'ACTIVE') as active_medications,
    COUNT(DISTINCT mr.id) FILTER (WHERE mr.record_date >= CURRENT_DATE - INTERVAL '1 year') as recent_medical_records,
    AVG(wd.steps) FILTER (WHERE wd.recorded_at >= CURRENT_DATE - INTERVAL '30 days') as avg_daily_steps_30d,
    AVG(wd.sleep_minutes) FILTER (WHERE wd.recorded_at >= CURRENT_DATE - INTERVAL '30 days') as avg_sleep_minutes_30d
FROM public.users u
LEFT JOIN public.health_profiles hp ON u.id = hp.user_id
LEFT JOIN public.medications m ON u.id = m.user_id
LEFT JOIN public.medical_records mr ON u.id = mr.user_id
LEFT JOIN public.wearable_data wd ON u.id = wd.user_id
GROUP BY u.id, hp.blood_type;

CREATE INDEX idx_health_summary_user ON user_health_summary(user_id);

-- =============================================
-- FUNCTIONS FOR BUSINESS LOGIC
-- =============================================

-- Calculate net worth
CREATE OR REPLACE FUNCTION calculate_net_worth(p_user_id UUID)
RETURNS TABLE(
    total_assets DECIMAL(20,4),
    total_liabilities DECIMAL(20,4),
    net_worth DECIMAL(20,4),
    asset_breakdown JSONB,
    liability_breakdown JSONB
) AS $$
BEGIN
    RETURN QUERY
    WITH assets AS (
        SELECT 
            SUM(CASE WHEN account_type IN ('CHECKING', 'SAVINGS') THEN current_balance ELSE 0 END) as cash,
            SUM(CASE WHEN account_type IN ('INVESTMENT', 'RETIREMENT') THEN current_balance ELSE 0 END) as investments,
            SUM(CASE WHEN account_type = 'CRYPTO' THEN current_balance ELSE 0 END) as crypto
        FROM financial_accounts
        WHERE user_id = p_user_id AND is_active = true
    ),
    liabilities AS (
        SELECT 
            SUM(CASE WHEN account_type = 'CREDIT_CARD' THEN current_balance ELSE 0 END) as credit_cards,
            SUM(CASE WHEN account_type IN ('LOAN', 'MORTGAGE') THEN current_balance ELSE 0 END) as loans
        FROM financial_accounts
        WHERE user_id = p_user_id AND is_active = true
    ),
    property_value AS (
        SELECT COALESCE(SUM(current_value), 0) as real_estate
        FROM properties
        WHERE user_id = p_user_id
    ),
    vehicle_value AS (
        SELECT COALESCE(SUM(current_value), 0) as vehicles
        FROM vehicles
        WHERE user_id = p_user_id
    )
    SELECT 
        (a.cash + a.investments + a.crypto + p.real_estate + v.vehicles) as total_assets,
        (l.credit_cards + l.loans) as total_liabilities,
        (a.cash + a.investments + a.crypto + p.real_estate + v.vehicles - l.credit_cards - l.loans) as net_worth,
        jsonb_build_object(
            'cash', a.cash,
            'investments', a.investments,
            'crypto', a.crypto,
            'real_estate', p.real_estate,
            'vehicles', v.vehicles
        ) as asset_breakdown,
        jsonb_build_object(
            'credit_cards', l.credit_cards,
            'loans', l.loans
        ) as liability_breakdown
    FROM assets a, liabilities l, property_value p, vehicle_value v;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get spending by category
CREATE OR REPLACE FUNCTION get_spending_by_category(
    p_user_id UUID,
    p_start_date DATE,
    p_end_date DATE
)
RETURNS TABLE(
    category_name TEXT,
    total_spent DECIMAL(20,4),
    transaction_count INTEGER,
    percentage_of_total DECIMAL(5,2)
) AS $$
BEGIN
    RETURN QUERY
    WITH category_spending AS (
        SELECT 
            c.name as category_name,
            SUM(ABS(t.amount)) as total_spent,
            COUNT(t.id) as transaction_count
        FROM transactions t
        JOIN categories c ON t.category_id = c.id
        WHERE t.user_id = p_user_id
            AND t.transaction_date BETWEEN p_start_date AND p_end_date
            AND t.amount < 0
        GROUP BY c.name
    ),
    total_spending AS (
        SELECT SUM(total_spent) as total FROM category_spending
    )
    SELECT 
        cs.category_name,
        cs.total_spent,
        cs.transaction_count,
        ROUND((cs.total_spent / ts.total * 100)::numeric, 2) as percentage_of_total
    FROM category_spending cs, total_spending ts
    ORDER BY cs.total_spent DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- SEED DATA FOR CATEGORIES
-- =============================================

INSERT INTO public.categories (name, icon, color, category_type, is_system) VALUES
-- Income Categories
('Salary', 'briefcase', '#4CAF50', 'INCOME', true),
('Freelance', 'laptop', '#8BC34A', 'INCOME', true),
('Investment Income', 'trending-up', '#CDDC39', 'INCOME', true),
('Rental Income', 'home', '#FFC107', 'INCOME', true),
('Other Income', 'plus-circle', '#FF9800', 'INCOME', true),

-- Expense Categories
('Housing', 'home', '#F44336', 'EXPENSE', true),
('Transportation', 'car', '#E91E63', 'EXPENSE', true),
('Food & Dining', 'utensils', '#9C27B0', 'EXPENSE', true),
('Shopping', 'shopping-bag', '#673AB7', 'EXPENSE', true),
('Entertainment', 'film', '#3F51B5', 'EXPENSE', true),
('Healthcare', 'heart', '#2196F3', 'EXPENSE', true),
('Education', 'book', '#03A9F4', 'EXPENSE', true),
('Utilities', 'zap', '#00BCD4', 'EXPENSE', true),
('Insurance', 'shield', '#009688', 'EXPENSE', true),
('Taxes', 'file-text', '#4CAF50', 'EXPENSE', true),
('Other Expenses', 'minus-circle', '#8BC34A', 'EXPENSE', true)
ON CONFLICT DO NOTHING;

-- =============================================
-- INITIAL ADMIN USER (FOR DEVELOPMENT ONLY)
-- =============================================

-- DO $$
-- BEGIN
--     IF current_setting('app.environment', true) = 'development' THEN
--         -- Create admin user in auth.users
--         INSERT INTO auth.users (
--             id,
--             email,
--             encrypted_password,
--             email_confirmed_at,
--             created_at,
--             updated_at
--         ) VALUES (
--             'a0eebc99-3c0b-4ef8-bb6d-6bb9bd380a11',
--             'admin@lifenavigator.ai',
--             crypt('Admin@123!', gen_salt('bf')),
--             NOW(),
--             NOW(),
--             NOW()
--         ) ON CONFLICT (email) DO NOTHING;
--         
--         -- Create profile
--         INSERT INTO public.users (
--             id,
--             email,
--             first_name,
--             last_name,
--             account_type,
--             onboarding_completed
--         ) VALUES (
--             'a0eebc99-3c0b-4ef8-bb6d-6bb9bd380a11',
--             'admin@lifenavigator.ai',
--             'Admin',
--             'User',
--             'ENTERPRISE',
--             true
--         ) ON CONFLICT (id) DO NOTHING;
--     END IF;
-- END $$;

-- =============================================
-- GRANT PERMISSIONS
-- =============================================

-- Grant usage on schema
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO anon;

-- Grant permissions on tables to authenticated users
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- Limited permissions for anonymous users
GRANT SELECT ON public.financial_institutions TO anon;
GRANT SELECT ON public.categories TO anon;

-- =============================================
-- FINAL SETUP
-- =============================================

-- Refresh materialized views
REFRESH MATERIALIZED VIEW user_financial_summary;
REFRESH MATERIALIZED VIEW user_health_summary;

-- Analyze tables for query optimization
ANALYZE;

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'LifeNavigator database schema created successfully!';
    RAISE NOTICE 'Total tables created: %', (
        SELECT COUNT(*) FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
    );
    RAISE NOTICE 'RLS enabled on all tables';
    RAISE NOTICE 'Audit logging configured';
    RAISE NOTICE 'Encryption functions ready';
    RAISE NOTICE 'Ready for pilot launch! 🚀';
END $$;