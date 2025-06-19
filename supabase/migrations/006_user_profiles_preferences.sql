-- =============================================
-- USER PROFILES & PREFERENCES
-- =============================================
-- Core user profile and preference management

-- Enhanced user profiles with comprehensive personal data
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

-- User preferences with comprehensive settings
CREATE TABLE IF NOT EXISTS public.user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  
  -- Display Preferences
  theme TEXT DEFAULT 'SYSTEM' CHECK (theme IN (
    'LIGHT', 'DARK', 'SYSTEM', 'HIGH_CONTRAST'
  )),
  color_scheme TEXT DEFAULT 'BLUE',
  font_size TEXT DEFAULT 'MEDIUM' CHECK (font_size IN (
    'SMALL', 'MEDIUM', 'LARGE', 'EXTRA_LARGE'
  )),
  reduced_motion BOOLEAN DEFAULT FALSE,
  high_contrast BOOLEAN DEFAULT FALSE,
  
  -- Language & Regional
  language TEXT DEFAULT 'en',
  locale TEXT DEFAULT 'en-US',
  date_format TEXT DEFAULT 'MM/DD/YYYY',
  time_format TEXT DEFAULT '12H' CHECK (time_format IN ('12H', '24H')),
  currency TEXT DEFAULT 'USD',
  number_format TEXT DEFAULT 'COMMA', -- 1,000.00 vs 1.000,00
  first_day_of_week INTEGER DEFAULT 0, -- 0=Sunday, 1=Monday
  
  -- Notification Preferences
  email_notifications BOOLEAN DEFAULT TRUE,
  sms_notifications BOOLEAN DEFAULT FALSE,
  push_notifications BOOLEAN DEFAULT TRUE,
  in_app_notifications BOOLEAN DEFAULT TRUE,
  
  -- Notification Types
  notification_settings JSONB DEFAULT '{
    "security_alerts": true,
    "transaction_alerts": true,
    "health_reminders": true,
    "appointment_reminders": true,
    "goal_updates": true,
    "insights_recommendations": true,
    "product_updates": false,
    "marketing": false
  }',
  
  -- Notification Schedule
  quiet_hours_enabled BOOLEAN DEFAULT FALSE,
  quiet_hours_start TIME,
  quiet_hours_end TIME,
  weekend_notifications BOOLEAN DEFAULT TRUE,
  
  -- Privacy Settings
  profile_visibility TEXT DEFAULT 'PRIVATE' CHECK (profile_visibility IN (
    'PUBLIC', 'FRIENDS', 'PRIVATE'
  )),
  show_online_status BOOLEAN DEFAULT TRUE,
  allow_data_sharing BOOLEAN DEFAULT FALSE,
  allow_analytics BOOLEAN DEFAULT TRUE,
  
  -- Security Preferences
  two_factor_enabled BOOLEAN DEFAULT FALSE,
  biometric_login_enabled BOOLEAN DEFAULT FALSE,
  session_timeout_minutes INTEGER DEFAULT 30,
  require_password_change_days INTEGER,
  
  -- Data & Sync Preferences
  auto_sync_enabled BOOLEAN DEFAULT TRUE,
  sync_frequency TEXT DEFAULT 'DAILY' CHECK (sync_frequency IN (
    'REALTIME', 'HOURLY', 'DAILY', 'WEEKLY', 'MANUAL'
  )),
  wifi_only_sync BOOLEAN DEFAULT FALSE,
  
  -- Dashboard Customization
  dashboard_layout JSONB DEFAULT '{}',
  favorite_widgets TEXT[],
  hidden_features TEXT[],
  
  -- Financial Preferences
  default_currency TEXT DEFAULT 'USD',
  show_cents BOOLEAN DEFAULT TRUE,
  round_to_nearest TEXT DEFAULT 'NONE' CHECK (round_to_nearest IN (
    'NONE', 'DOLLAR', 'FIVE', 'TEN'
  )),
  
  -- Health Preferences
  units_system TEXT DEFAULT 'IMPERIAL' CHECK (units_system IN (
    'METRIC', 'IMPERIAL'
  )),
  calorie_goal INTEGER,
  step_goal INTEGER DEFAULT 10000,
  water_goal_ml INTEGER DEFAULT 2000,
  
  -- AI & Recommendations
  ai_suggestions_enabled BOOLEAN DEFAULT TRUE,
  personalization_level TEXT DEFAULT 'BALANCED' CHECK (personalization_level IN (
    'MINIMAL', 'BALANCED', 'MAXIMUM'
  )),
  data_retention_days INTEGER DEFAULT 365,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

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

-- User activity tracking
CREATE TABLE IF NOT EXISTS public.user_activities (
  id UUID DEFAULT gen_random_uuid(),
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
  
  activity_timestamp TIMESTAMPTZ DEFAULT NOW(),
  
  -- Use id as primary key for partitioned table
  PRIMARY KEY (id, activity_timestamp)
) PARTITION BY RANGE (activity_timestamp);

-- Create monthly partitions for activities
CREATE TABLE user_activities_2024_01 PARTITION OF user_activities
  FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');
CREATE TABLE user_activities_2024_02 PARTITION OF user_activities
  FOR VALUES FROM ('2024-02-01') TO ('2024-03-01');

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

-- Create RLS policies
CREATE POLICY "Users can manage own profile" ON public.user_profiles
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own preferences" ON public.user_preferences
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own sessions" ON public.user_sessions
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own activities" ON public.user_activities
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own consents" ON public.user_consents
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own feature flags" ON public.user_feature_flags
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own API keys" ON public.user_api_keys
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own notifications" ON public.user_notifications
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own data exports" ON public.user_data_exports
  FOR ALL USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_user_profiles_user ON public.user_profiles(user_id);
CREATE INDEX idx_user_profiles_username ON public.user_profiles(username) WHERE username IS NOT NULL;
CREATE INDEX idx_user_preferences_user ON public.user_preferences(user_id);
CREATE INDEX idx_user_sessions_user_active ON public.user_sessions(user_id, is_active) WHERE is_active = TRUE;
CREATE INDEX idx_user_sessions_token ON public.user_sessions(session_token);
CREATE INDEX idx_user_activities_user_timestamp ON public.user_activities(user_id, activity_timestamp DESC);
CREATE INDEX idx_user_consents_user_type ON public.user_consents(user_id, consent_type);
CREATE INDEX idx_user_notifications_user_status ON public.user_notifications(user_id, status) WHERE status IN ('PENDING', 'SENT');
CREATE INDEX idx_user_api_keys_prefix ON public.user_api_keys(key_prefix);

-- Create triggers
CREATE TRIGGER update_user_profiles_updated_at 
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at 
  BEFORE UPDATE ON public.user_preferences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to update profile completion
CREATE OR REPLACE FUNCTION calculate_profile_completion(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  completion_score INTEGER := 0;
  profile RECORD;
BEGIN
  SELECT * INTO profile FROM user_profiles WHERE user_id = p_user_id;
  
  -- Basic info (40%)
  IF profile.first_name IS NOT NULL THEN completion_score := completion_score + 5; END IF;
  IF profile.last_name IS NOT NULL THEN completion_score := completion_score + 5; END IF;
  IF profile.date_of_birth IS NOT NULL THEN completion_score := completion_score + 10; END IF;
  IF profile.primary_phone IS NOT NULL THEN completion_score := completion_score + 10; END IF;
  IF profile.primary_address IS NOT NULL THEN completion_score := completion_score + 10; END IF;
  
  -- Professional info (20%)
  IF profile.occupation IS NOT NULL THEN completion_score := completion_score + 10; END IF;
  IF profile.annual_income_range IS NOT NULL THEN completion_score := completion_score + 10; END IF;
  
  -- Verification (20%)
  IF profile.email_verified THEN completion_score := completion_score + 10; END IF;
  IF profile.phone_verified THEN completion_score := completion_score + 10; END IF;
  
  -- Profile media (10%)
  IF profile.avatar_url IS NOT NULL THEN completion_score := completion_score + 10; END IF;
  
  -- Life stage (10%)
  IF profile.life_stage IS NOT NULL THEN completion_score := completion_score + 10; END IF;
  
  RETURN LEAST(completion_score, 100);
END;
$$ LANGUAGE plpgsql;

-- Auto-update profile completion
CREATE OR REPLACE FUNCTION update_profile_completion()
RETURNS TRIGGER AS $$
BEGIN
  NEW.profile_completion_percentage := calculate_profile_completion(NEW.user_id);
  NEW.last_profile_update := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER calculate_profile_completion_trigger
  BEFORE INSERT OR UPDATE ON public.user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_profile_completion();