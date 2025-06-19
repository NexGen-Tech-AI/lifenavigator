-- =============================================
-- ONBOARDING ENHANCEMENTS
-- =============================================
-- Comprehensive onboarding data capture and document management

-- Extend user_profiles table with onboarding-specific fields
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS onboarding_data JSONB;
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS onboarding_step TEXT;
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS onboarding_started_at TIMESTAMPTZ;
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS onboarding_completed_at TIMESTAMPTZ;

-- Create onboarding progress tracking
CREATE TABLE IF NOT EXISTS public.onboarding_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  
  -- Progress tracking
  current_step TEXT NOT NULL DEFAULT 'welcome',
  steps_completed TEXT[] DEFAULT '{}',
  total_steps INTEGER DEFAULT 7,
  
  -- Step data
  personal_info JSONB,
  financial_profile JSONB,
  health_profile JSONB,
  career_profile JSONB,
  education_profile JSONB,
  documents_uploaded INTEGER DEFAULT 0,
  
  -- Completion tracking
  personal_info_completed BOOLEAN DEFAULT FALSE,
  financial_profile_completed BOOLEAN DEFAULT FALSE,
  health_profile_completed BOOLEAN DEFAULT FALSE,
  career_profile_completed BOOLEAN DEFAULT FALSE,
  education_profile_completed BOOLEAN DEFAULT FALSE,
  documents_completed BOOLEAN DEFAULT FALSE,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id)
);

-- Enhanced documents table for onboarding uploads
CREATE TABLE IF NOT EXISTS public.user_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  
  -- File information
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  file_url TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  mime_type TEXT,
  
  -- Document categorization
  document_category TEXT NOT NULL CHECK (document_category IN (
    'FINANCIAL', 'TAX', 'INSURANCE', 'MEDICAL', 'LEGAL', 
    'EMPLOYMENT', 'EDUCATION', 'IDENTIFICATION', 'OTHER'
  )),
  document_type TEXT NOT NULL,
  document_subtype TEXT,
  
  -- Document metadata
  document_date DATE,
  expiry_date DATE,
  issuer TEXT,
  reference_number TEXT,
  
  -- Processing
  processing_status TEXT DEFAULT 'PENDING' CHECK (processing_status IN (
    'PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'REQUIRES_REVIEW'
  )),
  processed_at TIMESTAMPTZ,
  processing_error TEXT,
  
  -- Extracted data
  extracted_data JSONB,
  extracted_text TEXT,
  ocr_confidence DECIMAL(3,2),
  
  -- Security
  is_encrypted BOOLEAN DEFAULT TRUE,
  encryption_key_id TEXT,
  
  -- Onboarding specific
  uploaded_during_onboarding BOOLEAN DEFAULT FALSE,
  
  -- Metadata
  tags TEXT[],
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create onboarding templates for data collection
CREATE TABLE IF NOT EXISTS public.onboarding_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Template info
  template_name TEXT NOT NULL,
  template_type TEXT NOT NULL CHECK (template_type IN (
    'PERSONAL', 'FINANCIAL', 'HEALTH', 'CAREER', 'EDUCATION'
  )),
  
  -- Fields configuration
  fields JSONB NOT NULL,
  required_fields TEXT[],
  optional_fields TEXT[],
  
  -- Display
  display_order INTEGER,
  is_active BOOLEAN DEFAULT TRUE,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User data collection table for freemium features
CREATE TABLE IF NOT EXISTS public.user_collected_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  
  -- Data categorization
  data_category TEXT NOT NULL,
  data_type TEXT NOT NULL,
  
  -- Flexible data storage
  data_value JSONB NOT NULL,
  
  -- Validation
  is_validated BOOLEAN DEFAULT FALSE,
  validation_errors JSONB,
  
  -- Source tracking
  source TEXT CHECK (source IN (
    'ONBOARDING', 'MANUAL_ENTRY', 'IMPORT', 'API', 'DOCUMENT'
  )),
  source_document_id UUID REFERENCES public.user_documents(id),
  
  -- Versioning
  version INTEGER DEFAULT 1,
  previous_version_id UUID,
  
  -- Metadata
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Feature usage tracking for freemium
CREATE TABLE IF NOT EXISTS public.feature_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  
  -- Feature tracking
  feature_name TEXT NOT NULL,
  feature_category TEXT NOT NULL,
  
  -- Usage metrics
  usage_count INTEGER DEFAULT 0,
  last_used_at TIMESTAMPTZ,
  
  -- Limits
  monthly_limit INTEGER,
  current_month_usage INTEGER DEFAULT 0,
  limit_reset_date DATE,
  
  -- Tier restrictions
  requires_tier TEXT CHECK (requires_tier IN (
    'FREE', 'PRO', 'AI_AGENT', 'FAMILY'
  )),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, feature_name)
);

-- Create indexes
CREATE INDEX idx_onboarding_progress_user ON public.onboarding_progress(user_id);
CREATE INDEX idx_user_documents_user ON public.user_documents(user_id);
CREATE INDEX idx_user_documents_category ON public.user_documents(document_category);
CREATE INDEX idx_user_documents_processing ON public.user_documents(processing_status) 
  WHERE processing_status IN ('PENDING', 'PROCESSING');
CREATE INDEX idx_user_collected_data_user ON public.user_collected_data(user_id);
CREATE INDEX idx_user_collected_data_category ON public.user_collected_data(data_category, data_type);
CREATE INDEX idx_feature_usage_user ON public.feature_usage(user_id);

-- Enable RLS
ALTER TABLE public.onboarding_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.onboarding_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_collected_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feature_usage ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can manage own onboarding" ON public.onboarding_progress
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own documents" ON public.user_documents
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view templates" ON public.onboarding_templates
  FOR SELECT USING (is_active = TRUE);

CREATE POLICY "Users can manage own data" ON public.user_collected_data
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own usage" ON public.feature_usage
  FOR ALL USING (auth.uid() = user_id);

-- Create triggers
CREATE TRIGGER update_onboarding_progress_updated_at 
  BEFORE UPDATE ON public.onboarding_progress
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_documents_updated_at 
  BEFORE UPDATE ON public.user_documents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_collected_data_updated_at 
  BEFORE UPDATE ON public.user_collected_data
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default onboarding templates
INSERT INTO public.onboarding_templates (template_name, template_type, fields, required_fields, display_order) VALUES
('Personal Information', 'PERSONAL', 
  '{
    "sections": [
      {
        "name": "basic_info",
        "fields": ["first_name", "last_name", "date_of_birth", "phone", "address"]
      },
      {
        "name": "emergency_contact",
        "fields": ["emergency_name", "emergency_phone", "emergency_relationship"]
      }
    ]
  }',
  '{"first_name", "last_name"}',
  1
),
('Financial Profile', 'FINANCIAL',
  '{
    "sections": [
      {
        "name": "income",
        "fields": ["monthly_income", "income_source", "employment_status"]
      },
      {
        "name": "expenses",
        "fields": ["monthly_expenses", "housing_cost", "debt_payments"]
      },
      {
        "name": "goals",
        "fields": ["savings_goal", "retirement_goal", "investment_experience"]
      }
    ]
  }',
  '{"monthly_income"}',
  2
),
('Health Profile', 'HEALTH',
  '{
    "sections": [
      {
        "name": "medical_info",
        "fields": ["primary_doctor", "insurance_provider", "medications"]
      },
      {
        "name": "health_conditions",
        "fields": ["chronic_conditions", "allergies", "blood_type"]
      }
    ]
  }',
  '{}',
  3
);

-- Function to check feature access based on tier
CREATE OR REPLACE FUNCTION check_feature_access(
  p_user_id UUID,
  p_feature_name TEXT
) RETURNS BOOLEAN AS $$
DECLARE
  v_user_tier TEXT;
  v_feature_tier TEXT;
  v_usage_count INTEGER;
  v_monthly_limit INTEGER;
BEGIN
  -- Get user tier
  SELECT subscription_tier INTO v_user_tier 
  FROM users WHERE id = p_user_id;
  
  -- Get feature requirements
  SELECT requires_tier, current_month_usage, monthly_limit 
  INTO v_feature_tier, v_usage_count, v_monthly_limit
  FROM feature_usage 
  WHERE user_id = p_user_id AND feature_name = p_feature_name;
  
  -- Check tier access
  IF v_feature_tier IS NOT NULL THEN
    IF v_user_tier = 'FREE' AND v_feature_tier != 'FREE' THEN
      RETURN FALSE;
    END IF;
  END IF;
  
  -- Check usage limits
  IF v_monthly_limit IS NOT NULL AND v_usage_count >= v_monthly_limit THEN
    RETURN FALSE;
  END IF;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Function to track feature usage
CREATE OR REPLACE FUNCTION track_feature_usage(
  p_user_id UUID,
  p_feature_name TEXT,
  p_feature_category TEXT
) RETURNS VOID AS $$
BEGIN
  INSERT INTO feature_usage (
    user_id, feature_name, feature_category, 
    usage_count, current_month_usage, last_used_at
  ) VALUES (
    p_user_id, p_feature_name, p_feature_category,
    1, 1, NOW()
  )
  ON CONFLICT (user_id, feature_name) DO UPDATE SET
    usage_count = feature_usage.usage_count + 1,
    current_month_usage = feature_usage.current_month_usage + 1,
    last_used_at = NOW();
END;
$$ LANGUAGE plpgsql;