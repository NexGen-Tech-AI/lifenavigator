-- Tax Planning Tables

-- Tax profiles table
CREATE TABLE IF NOT EXISTS tax_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tax_year INTEGER NOT NULL,
  filing_status VARCHAR(50) DEFAULT 'single',
  dependents INTEGER DEFAULT 0,
  estimated_income DECIMAL(12, 2),
  total_deductions DECIMAL(12, 2),
  total_credits DECIMAL(12, 2),
  estimated_tax DECIMAL(12, 2),
  estimated_refund DECIMAL(12, 2),
  has_hsa BOOLEAN DEFAULT false,
  has_fsa BOOLEAN DEFAULT false,
  is_self_employed BOOLEAN DEFAULT false,
  state_of_residence VARCHAR(2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, tax_year)
);

-- Tax deductions table
CREATE TABLE IF NOT EXISTS tax_deductions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tax_year INTEGER NOT NULL,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100),
  amount DECIMAL(12, 2) NOT NULL,
  eligible BOOLEAN DEFAULT true,
  documentation BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tax credits table
CREATE TABLE IF NOT EXISTS tax_credits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tax_year INTEGER NOT NULL,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) CHECK (type IN ('refundable', 'non-refundable')),
  amount DECIMAL(12, 2) NOT NULL,
  qualified BOOLEAN DEFAULT false,
  requirements JSONB,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tax documents metadata (extends documents table)
CREATE TABLE IF NOT EXISTS tax_document_metadata (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  tax_year INTEGER NOT NULL,
  document_type VARCHAR(100), -- W-2, 1099, 1098, etc.
  employer_name VARCHAR(255),
  form_number VARCHAR(50),
  status VARCHAR(50) DEFAULT 'pending', -- pending, verified, missing
  verified_at TIMESTAMPTZ,
  verified_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(document_id)
);

-- Tax strategy implementations
CREATE TABLE IF NOT EXISTS tax_strategy_implementations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  strategy_id VARCHAR(100) NOT NULL,
  implemented BOOLEAN DEFAULT false,
  implementation_date TIMESTAMPTZ,
  potential_savings DECIMAL(12, 2),
  actual_savings DECIMAL(12, 2),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, strategy_id)
);

-- Tax payments and withholdings
CREATE TABLE IF NOT EXISTS tax_payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tax_year INTEGER NOT NULL,
  payment_type VARCHAR(50), -- quarterly, withholding, estimated
  payment_date DATE NOT NULL,
  amount DECIMAL(12, 2) NOT NULL,
  payment_method VARCHAR(50),
  confirmation_number VARCHAR(100),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tax planning scenarios
CREATE TABLE IF NOT EXISTS tax_planning_scenarios (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  tax_year INTEGER NOT NULL,
  scenario_data JSONB NOT NULL, -- income changes, deduction changes, etc.
  estimated_tax DECIMAL(12, 2),
  estimated_refund DECIMAL(12, 2),
  is_active BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_tax_profiles_user_year ON tax_profiles(user_id, tax_year);
CREATE INDEX idx_tax_deductions_user_year ON tax_deductions(user_id, tax_year);
CREATE INDEX idx_tax_credits_user_year ON tax_credits(user_id, tax_year);
CREATE INDEX idx_tax_document_metadata_year ON tax_document_metadata(tax_year);
CREATE INDEX idx_tax_payments_user_year ON tax_payments(user_id, tax_year);
CREATE INDEX idx_tax_planning_scenarios_user ON tax_planning_scenarios(user_id);

-- Enable RLS
ALTER TABLE tax_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE tax_deductions ENABLE ROW LEVEL SECURITY;
ALTER TABLE tax_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE tax_document_metadata ENABLE ROW LEVEL SECURITY;
ALTER TABLE tax_strategy_implementations ENABLE ROW LEVEL SECURITY;
ALTER TABLE tax_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE tax_planning_scenarios ENABLE ROW LEVEL SECURITY;

-- RLS Policies for tax_profiles
CREATE POLICY "Users can view own tax profiles" ON tax_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own tax profiles" ON tax_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tax profiles" ON tax_profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own tax profiles" ON tax_profiles
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for tax_deductions
CREATE POLICY "Users can view own tax deductions" ON tax_deductions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own tax deductions" ON tax_deductions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tax deductions" ON tax_deductions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own tax deductions" ON tax_deductions
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for tax_credits
CREATE POLICY "Users can view own tax credits" ON tax_credits
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own tax credits" ON tax_credits
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tax credits" ON tax_credits
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own tax credits" ON tax_credits
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for tax_document_metadata
CREATE POLICY "Users can view own tax documents" ON tax_document_metadata
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM documents
      WHERE documents.id = tax_document_metadata.document_id
      AND documents.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create own tax document metadata" ON tax_document_metadata
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM documents
      WHERE documents.id = tax_document_metadata.document_id
      AND documents.user_id = auth.uid()
    )
  );

-- RLS Policies for tax_strategy_implementations
CREATE POLICY "Users can view own tax strategies" ON tax_strategy_implementations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own tax strategies" ON tax_strategy_implementations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tax strategies" ON tax_strategy_implementations
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for tax_payments
CREATE POLICY "Users can view own tax payments" ON tax_payments
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own tax payments" ON tax_payments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for tax_planning_scenarios
CREATE POLICY "Users can view own tax scenarios" ON tax_planning_scenarios
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own tax scenarios" ON tax_planning_scenarios
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tax scenarios" ON tax_planning_scenarios
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own tax scenarios" ON tax_planning_scenarios
  FOR DELETE USING (auth.uid() = user_id);

-- Function to calculate estimated quarterly payments
CREATE OR REPLACE FUNCTION calculate_quarterly_payments(
  user_id_param UUID,
  tax_year_param INTEGER
)
RETURNS TABLE (
  quarter INTEGER,
  due_date DATE,
  amount DECIMAL(12, 2)
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  annual_tax DECIMAL(12, 2);
  quarterly_amount DECIMAL(12, 2);
BEGIN
  -- Get estimated annual tax
  SELECT estimated_tax INTO annual_tax
  FROM tax_profiles
  WHERE user_id = user_id_param AND tax_year = tax_year_param;
  
  IF annual_tax IS NULL THEN
    annual_tax := 0;
  END IF;
  
  -- Calculate quarterly amount
  quarterly_amount := annual_tax / 4;
  
  -- Return quarterly payment schedule
  RETURN QUERY
  SELECT 
    1 AS quarter,
    DATE(tax_year_param || '-04-15') AS due_date,
    quarterly_amount AS amount
  UNION ALL
  SELECT 
    2 AS quarter,
    DATE(tax_year_param || '-06-15') AS due_date,
    quarterly_amount AS amount
  UNION ALL
  SELECT 
    3 AS quarter,
    DATE(tax_year_param || '-09-15') AS due_date,
    quarterly_amount AS amount
  UNION ALL
  SELECT 
    4 AS quarter,
    DATE((tax_year_param + 1) || '-01-15') AS due_date,
    quarterly_amount AS amount;
END;
$$;