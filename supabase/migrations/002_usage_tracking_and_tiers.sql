-- Update subscription_tier enum to include PILOT tier
ALTER TYPE subscription_tier ADD VALUE IF NOT EXISTS 'PILOT' AFTER 'FREE';
ALTER TYPE subscription_tier ADD VALUE IF NOT EXISTS 'BASIC' AFTER 'PILOT';
ALTER TYPE subscription_tier ADD VALUE IF NOT EXISTS 'PREMIUM' AFTER 'PRO';
ALTER TYPE subscription_tier ADD VALUE IF NOT EXISTS 'ENTERPRISE' AFTER 'FAMILY';

-- Add tier management fields to users table
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS subscription_start_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT,


ADD COLUMN IF NOT EXISTS pilot_program BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS referral_code TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS referred_by UUID REFERENCES public.users(id);

-- Create feature_usage table for tracking limits
CREATE TABLE IF NOT EXISTS public.feature_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  feature_key TEXT NOT NULL,
  usage_count INTEGER DEFAULT 0,
  usage_limit INTEGER,
  period_start TIMESTAMPTZ NOT NULL,
  period_end TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, feature_key, period_start)
);

-- Create subscription_history table
CREATE TABLE IF NOT EXISTS public.subscription_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  from_tier subscription_tier,
  to_tier subscription_tier NOT NULL,
  change_reason TEXT,
  changed_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'
);

-- Create pilot_applications table
CREATE TABLE IF NOT EXISTS public.pilot_applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  company TEXT,
  use_case TEXT NOT NULL,
  expected_users INTEGER DEFAULT 1,
  status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED', 'WAITLIST')),
  application_date TIMESTAMPTZ DEFAULT NOW(),
  review_date TIMESTAMPTZ,
  reviewer_notes TEXT,
  access_code TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create user_preferences table for onboarding
CREATE TABLE IF NOT EXISTS public.user_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE UNIQUE,
  theme TEXT DEFAULT 'system' CHECK (theme IN ('light', 'dark', 'system')),
  notifications JSONB DEFAULT '{"email": true, "push": false, "sms": false}',
  privacy JSONB DEFAULT '{"shareDataForInsights": true, "allowAnonymousAnalytics": true}',
  onboarding_data JSONB DEFAULT '{}',
  feature_flags JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create referral_rewards table
CREATE TABLE IF NOT EXISTS public.referral_rewards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  referrer_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  referred_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  reward_type TEXT NOT NULL,
  reward_value DECIMAL(10,2),
  status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'CREDITED', 'EXPIRED')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  credited_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_feature_usage_user_period ON public.feature_usage(user_id, period_start);
CREATE INDEX IF NOT EXISTS idx_subscription_history_user ON public.subscription_history(user_id);
CREATE INDEX IF NOT EXISTS idx_pilot_applications_status ON public.pilot_applications(status);
CREATE INDEX IF NOT EXISTS idx_users_referral_code ON public.users(referral_code);

-- Create function to reset usage counts monthly
CREATE OR REPLACE FUNCTION reset_monthly_usage() RETURNS void AS $$
BEGIN
  -- Archive old usage data
  INSERT INTO public.feature_usage (user_id, feature_key, usage_count, usage_limit, period_start, period_end)
  SELECT user_id, feature_key, 0, usage_limit, 
         date_trunc('month', CURRENT_DATE), 
         date_trunc('month', CURRENT_DATE) + interval '1 month' - interval '1 day'
  FROM public.feature_usage
  WHERE period_end < CURRENT_DATE;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_feature_usage_updated_at BEFORE UPDATE ON public.feature_usage
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at BEFORE UPDATE ON public.user_preferences
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security policies
ALTER TABLE public.feature_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pilot_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_rewards ENABLE ROW LEVEL SECURITY;

-- Feature usage policies
CREATE POLICY "Users can view own feature usage" ON public.feature_usage
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can manage feature usage" ON public.feature_usage
    FOR ALL USING (auth.uid() = user_id);

-- Subscription history policies
CREATE POLICY "Users can view own subscription history" ON public.subscription_history
    FOR SELECT USING (auth.uid() = user_id);

-- User preferences policies
CREATE POLICY "Users can manage own preferences" ON public.user_preferences
    FOR ALL USING (auth.uid() = user_id);

-- Pilot applications policies (public insert, admin only for other operations)
CREATE POLICY "Anyone can apply for pilot" ON public.pilot_applications
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view own application" ON public.pilot_applications
    FOR SELECT USING (email = current_setting('request.jwt.claims', true)::json->>'email');

-- Referral rewards policies
CREATE POLICY "Users can view own referral rewards" ON public.referral_rewards
    FOR SELECT USING (auth.uid() = referrer_id OR auth.uid() = referred_id);