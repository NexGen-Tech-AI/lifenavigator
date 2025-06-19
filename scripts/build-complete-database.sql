-- =============================================
-- COMPLETE DATABASE BUILD SCRIPT
-- Run this in Supabase SQL Editor
-- =============================================

-- Start fresh by dropping existing policies (if they exist)
DO $$ 
BEGIN
    -- Drop existing policies if they exist
    DROP POLICY IF EXISTS "Users can manage own preferences" ON public.user_preferences;
    DROP POLICY IF EXISTS "Users can manage own profile" ON public.user_profiles;
    DROP POLICY IF EXISTS "Users can view own sessions" ON public.user_sessions;
    DROP POLICY IF EXISTS "Users can view own activities" ON public.user_activities;
    DROP POLICY IF EXISTS "Users can manage own consents" ON public.user_consents;
    DROP POLICY IF EXISTS "Users can view own feature flags" ON public.user_feature_flags;
    DROP POLICY IF EXISTS "Users can manage own API keys" ON public.user_api_keys;
    DROP POLICY IF EXISTS "Users can manage own notifications" ON public.user_notifications;
    DROP POLICY IF EXISTS "Users can manage own data exports" ON public.user_data_exports;
EXCEPTION
    WHEN undefined_table THEN
        NULL; -- Table doesn't exist yet, that's fine
END $$;

-- Check if update_updated_at_column function exists
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Now run the migrations in order
-- 1. First check what tables already exist
DO $$ 
BEGIN
    -- Migration 001 should already be done
    -- Migration 002 should already be done
    
    -- Check if user_profiles exists, if not create it
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_profiles') THEN
        -- Run migration 006 content here (without the duplicate user_preferences table)
        RAISE NOTICE 'Creating user_profiles table...';
    END IF;
END $$;

-- Create user_profiles if it doesn't exist
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  
  -- Basic Information
  first_name TEXT,
  middle_name TEXT,
  last_name TEXT,
  display_name TEXT,
  username TEXT UNIQUE,
  
  -- Contact Information
  primary_email TEXT,
  secondary_email TEXT,
  primary_phone TEXT, -- encrypted
  secondary_phone TEXT, -- encrypted
  preferred_contact_method TEXT CHECK (preferred_contact_method IN (
    'EMAIL', 'SMS', 'PUSH', 'IN_APP'
  )),
  
  -- Demographics
  date_of_birth DATE, -- encrypted
  gender TEXT CHECK (gender IN (
    'MALE', 'FEMALE', 'NON_BINARY', 'OTHER', 'PREFER_NOT_TO_SAY'
  )),
  nationality TEXT,
  languages TEXT[], -- ['en', 'es', 'fr']
  
  -- Location
  primary_address JSONB, -- encrypted
  billing_address JSONB, -- encrypted
  shipping_address JSONB, -- encrypted
  timezone TEXT DEFAULT 'UTC',
  country_code TEXT,
  
  -- Professional Information
  occupation TEXT,
  employer TEXT,
  industry TEXT,
  annual_income_range TEXT CHECK (annual_income_range IN (
    'UNDER_25K', '25K_50K', '50K_75K', '75K_100K', 
    '100K_150K', '150K_200K', '200K_500K', 'OVER_500K'
  )),
  
  -- Life Stage & Family
  marital_status TEXT CHECK (marital_status IN (
    'SINGLE', 'MARRIED', 'DIVORCED', 'WIDOWED', 'PARTNERED'
  )),
  has_children BOOLEAN DEFAULT FALSE,
  number_of_dependents INTEGER DEFAULT 0,
  life_stage TEXT CHECK (life_stage IN (
    'STUDENT', 'EARLY_CAREER', 'MID_CAREER', 'FAMILY', 
    'PRE_RETIREMENT', 'RETIREMENT'
  )),
  
  -- Profile Media
  avatar_url TEXT,
  cover_photo_url TEXT,
  bio TEXT,
  
  -- Verification Status
  email_verified BOOLEAN DEFAULT FALSE,
  phone_verified BOOLEAN DEFAULT FALSE,
  identity_verified BOOLEAN DEFAULT FALSE,
  identity_verification_date DATE,
  kyc_status TEXT CHECK (kyc_status IN (
    'NOT_STARTED', 'PENDING', 'VERIFIED', 'FAILED'
  )),
  
  -- Account Status
  is_active BOOLEAN DEFAULT TRUE,
  is_premium BOOLEAN DEFAULT FALSE,
  account_tier TEXT DEFAULT 'FREE' CHECK (account_tier IN (
    'FREE', 'BASIC', 'PRO', 'PREMIUM', 'ENTERPRISE'
  )),
  
  -- Metadata
  profile_completion_percentage INTEGER DEFAULT 0,
  last_profile_update TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add missing columns to user_preferences if table already exists
DO $$ 
BEGIN
    -- Check if user_preferences table exists and add missing columns
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_preferences') THEN
        -- Add missing columns one by one (if they don't exist)
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_preferences' AND column_name = 'theme') THEN
            ALTER TABLE public.user_preferences ADD COLUMN theme TEXT DEFAULT 'SYSTEM' CHECK (theme IN ('LIGHT', 'DARK', 'SYSTEM', 'HIGH_CONTRAST'));
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_preferences' AND column_name = 'language') THEN
            ALTER TABLE public.user_preferences ADD COLUMN language TEXT DEFAULT 'en';
        END IF;
        
        -- Add other missing columns as needed...
    END IF;
END $$;

-- User sessions tracking
CREATE TABLE IF NOT EXISTS public.user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  
  -- Session Details
  session_token TEXT UNIQUE NOT NULL, -- encrypted
  refresh_token TEXT, -- encrypted
  
  -- Device Information
  device_id TEXT,
  device_type TEXT CHECK (device_type IN (
    'WEB', 'IOS', 'ANDROID', 'DESKTOP', 'TABLET', 'WEARABLE'
  )),
  device_name TEXT,
  device_os TEXT,
  device_os_version TEXT,
  app_version TEXT,
  
  -- Browser Information (for web)
  browser_name TEXT,
  browser_version TEXT,
  user_agent TEXT,
  
  -- Location
  ip_address INET,
  country TEXT,
  region TEXT,
  city TEXT,
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),
  
  -- Session Activity
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_activity_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  
  -- Security
  is_active BOOLEAN DEFAULT TRUE,
  login_method TEXT CHECK (login_method IN (
    'PASSWORD', 'SOCIAL', 'BIOMETRIC', 'MAGIC_LINK', 'SSO'
  )),
  mfa_verified BOOLEAN DEFAULT FALSE,
  risk_score INTEGER DEFAULT 0,
  
  -- Termination
  terminated_at TIMESTAMPTZ,
  termination_reason TEXT CHECK (termination_reason IN (
    'LOGOUT', 'TIMEOUT', 'REVOKED', 'EXPIRED', 'SECURITY'
  ))
);

-- User activity tracking (simplified without partitioning for now)
CREATE TABLE IF NOT EXISTS public.user_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  session_id UUID REFERENCES public.user_sessions(id),
  
  -- Activity Details
  activity_type TEXT NOT NULL CHECK (activity_type IN (
    'LOGIN', 'LOGOUT', 'VIEW', 'CREATE', 'UPDATE', 'DELETE', 
    'EXPORT', 'SHARE', 'SYNC', 'SETTINGS_CHANGE'
  )),
  activity_category TEXT NOT NULL,
  activity_description TEXT,
  
  -- Resource
  resource_type TEXT,
  resource_id TEXT,
  resource_name TEXT,
  
  -- Context
  ip_address INET,
  user_agent TEXT,
  referrer TEXT,
  
  -- Performance
  duration_ms INTEGER,
  
  -- Status
  status TEXT CHECK (status IN ('SUCCESS', 'FAILURE', 'PARTIAL')),
  error_message TEXT,
  
  activity_timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- User consent management (GDPR)
CREATE TABLE IF NOT EXISTS public.user_consents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  
  -- Consent Type
  consent_type TEXT NOT NULL CHECK (consent_type IN (
    'TERMS_OF_SERVICE', 'PRIVACY_POLICY', 'DATA_PROCESSING',
    'MARKETING', 'COOKIES', 'ANALYTICS', 'THIRD_PARTY_SHARING'
  )),
  
  -- Consent Details
  version TEXT NOT NULL,
  granted BOOLEAN NOT NULL,
  granted_at TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ,
  
  -- Method
  consent_method TEXT CHECK (consent_method IN (
    'CHECKBOX', 'BUTTON', 'IMPLICIT', 'EMAIL', 'VERBAL'
  )),
  
  -- Evidence
  ip_address INET,
  user_agent TEXT,
  consent_text TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, consent_type, version)
);

-- User feature flags
CREATE TABLE IF NOT EXISTS public.user_feature_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  
  -- Feature Details
  feature_name TEXT NOT NULL,
  enabled BOOLEAN DEFAULT FALSE,
  
  -- Rollout
  variant TEXT,
  rollout_percentage INTEGER,
  
  -- Metadata
  enabled_at TIMESTAMPTZ,
  disabled_at TIMESTAMPTZ,
  metadata JSONB,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, feature_name)
);

-- User API keys
CREATE TABLE IF NOT EXISTS public.user_api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  
  -- Key Details
  key_name TEXT NOT NULL,
  key_hash TEXT NOT NULL, -- bcrypt hash of the key
  key_prefix TEXT NOT NULL, -- First 8 chars for identification
  
  -- Permissions
  scopes TEXT[] DEFAULT '{}',
  allowed_ips INET[],
  allowed_origins TEXT[],
  
  -- Rate Limiting
  rate_limit_per_minute INTEGER DEFAULT 60,
  rate_limit_per_hour INTEGER DEFAULT 1000,
  
  -- Usage
  last_used_at TIMESTAMPTZ,
  usage_count INTEGER DEFAULT 0,
  
  -- Expiration
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT TRUE,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  revoked_at TIMESTAMPTZ
);

-- User notifications queue
CREATE TABLE IF NOT EXISTS public.user_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  
  -- Notification Details
  type TEXT NOT NULL,
  category TEXT NOT NULL,
  priority TEXT DEFAULT 'MEDIUM' CHECK (priority IN (
    'LOW', 'MEDIUM', 'HIGH', 'URGENT'
  )),
  
  -- Content
  title TEXT NOT NULL,
  body TEXT,
  data JSONB,
  action_url TEXT,
  
  -- Delivery
  channels TEXT[] DEFAULT '{"IN_APP"}', -- ['EMAIL', 'SMS', 'PUSH', 'IN_APP']
  
  -- Status
  status TEXT DEFAULT 'PENDING' CHECK (status IN (
    'PENDING', 'SENT', 'DELIVERED', 'READ', 'FAILED', 'EXPIRED'
  )),
  
  -- Tracking
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  read_at TIMESTAMPTZ,
  
  -- Expiration
  expires_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User data export requests (GDPR)
CREATE TABLE IF NOT EXISTS public.user_data_exports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  
  -- Request Details
  export_type TEXT NOT NULL CHECK (export_type IN (
    'FULL', 'FINANCIAL', 'HEALTH', 'PARTIAL'
  )),
  format TEXT DEFAULT 'JSON' CHECK (format IN (
    'JSON', 'CSV', 'PDF', 'ZIP'
  )),
  
  -- Scope
  date_from DATE,
  date_to DATE,
  included_data_types TEXT[],
  
  -- Status
  status TEXT DEFAULT 'PENDING' CHECK (status IN (
    'PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'EXPIRED'
  )),
  
  -- File Details
  file_url TEXT, -- S3 URL
  file_size_bytes BIGINT,
  file_hash TEXT,
  
  -- Processing
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  
  -- Security
  download_count INTEGER DEFAULT 0,
  max_downloads INTEGER DEFAULT 3,
  password_protected BOOLEAN DEFAULT TRUE,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_consents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_feature_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_data_exports ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (drop first if they exist)
DROP POLICY IF EXISTS "Users can manage own profile" ON public.user_profiles;
CREATE POLICY "Users can manage own profile" ON public.user_profiles
  FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own preferences" ON public.user_preferences;
CREATE POLICY "Users can manage own preferences" ON public.user_preferences
  FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own sessions" ON public.user_sessions;
CREATE POLICY "Users can view own sessions" ON public.user_sessions
  FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own activities" ON public.user_activities;
CREATE POLICY "Users can view own activities" ON public.user_activities
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own consents" ON public.user_consents;
CREATE POLICY "Users can manage own consents" ON public.user_consents
  FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own feature flags" ON public.user_feature_flags;
CREATE POLICY "Users can view own feature flags" ON public.user_feature_flags
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own API keys" ON public.user_api_keys;
CREATE POLICY "Users can manage own API keys" ON public.user_api_keys
  FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own notifications" ON public.user_notifications;
CREATE POLICY "Users can manage own notifications" ON public.user_notifications
  FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own data exports" ON public.user_data_exports;
CREATE POLICY "Users can manage own data exports" ON public.user_data_exports
  FOR ALL USING (auth.uid() = user_id);

-- Create indexes for performance (IF NOT EXISTS)
CREATE INDEX IF NOT EXISTS idx_user_profiles_user ON public.user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_username ON public.user_profiles(username) WHERE username IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_user_preferences_user ON public.user_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_active ON public.user_sessions(user_id, is_active) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON public.user_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_user_activities_user_timestamp ON public.user_activities(user_id, activity_timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_user_consents_user_type ON public.user_consents(user_id, consent_type);
CREATE INDEX IF NOT EXISTS idx_user_notifications_user_status ON public.user_notifications(user_id, status) WHERE status IN ('PENDING', 'SENT');
CREATE INDEX IF NOT EXISTS idx_user_api_keys_prefix ON public.user_api_keys(key_prefix);

-- Create triggers
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON public.user_profiles;
CREATE TRIGGER update_user_profiles_updated_at 
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_preferences_updated_at ON public.user_preferences;
CREATE TRIGGER update_user_preferences_updated_at 
  BEFORE UPDATE ON public.user_preferences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Final status
DO $$ 
BEGIN
    RAISE NOTICE 'Database build complete!';
    RAISE NOTICE 'Tables created/updated:';
    RAISE NOTICE '- user_profiles';
    RAISE NOTICE '- user_preferences (extended)';
    RAISE NOTICE '- user_sessions';
    RAISE NOTICE '- user_activities';
    RAISE NOTICE '- user_consents';
    RAISE NOTICE '- user_feature_flags';
    RAISE NOTICE '- user_api_keys';
    RAISE NOTICE '- user_notifications';
    RAISE NOTICE '- user_data_exports';
END $$;