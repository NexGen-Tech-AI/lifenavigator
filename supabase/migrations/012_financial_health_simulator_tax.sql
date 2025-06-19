-- =============================================
-- FINANCIAL HEALTH SCORE, SIMULATOR & TAX PLANNING
-- =============================================
-- This migration adds advanced financial features including
-- health scoring, scenario simulation, and tax planning
-- =============================================

-- =============================================
-- FINANCIAL HEALTH SCORES
-- =============================================

-- Financial health score history
CREATE TABLE IF NOT EXISTS public.financial_health_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  
  -- Overall score
  score INTEGER NOT NULL CHECK (score >= 0 AND score <= 100),
  grade TEXT CHECK (grade IN ('A', 'B', 'C', 'D', 'F')),
  
  -- Component scores (0-100)
  emergency_fund_score INTEGER,
  debt_to_income_score INTEGER,
  credit_utilization_score INTEGER,
  investment_ratio_score INTEGER,
  income_consistency_score INTEGER,
  retirement_contribution_score INTEGER,
  budget_compliance_score INTEGER,
  
  -- Calculation details
  calculation_details JSONB NOT NULL DEFAULT '{}',
  
  -- Benchmarks
  national_average_score INTEGER,
  age_group_average_score INTEGER,
  peer_percentile INTEGER,
  
  -- Recommendations
  recommendations JSONB DEFAULT '[]',
  improvement_areas TEXT[],
  
  -- Metadata
  calculated_at TIMESTAMPTZ DEFAULT NOW(),
  is_current BOOLEAN DEFAULT TRUE,
  
  CONSTRAINT unique_current_score UNIQUE (user_id, is_current) WHERE is_current = TRUE
);

-- Financial health score benchmarks
CREATE TABLE IF NOT EXISTS public.financial_benchmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Demographics
  age_group TEXT CHECK (age_group IN ('18-24', '25-34', '35-44', '45-54', '55-64', '65+')),
  income_bracket TEXT CHECK (income_bracket IN (
    'UNDER_25K', '25K_50K', '50K_75K', '75K_100K', 
    '100K_150K', '150K_200K', '200K_500K', 'OVER_500K'
  )),
  region TEXT,
  
  -- Benchmark values
  avg_emergency_months DECIMAL(4,2),
  avg_debt_to_income_ratio DECIMAL(5,2),
  avg_credit_utilization DECIMAL(5,2),
  avg_investment_ratio DECIMAL(5,2),
  avg_retirement_rate DECIMAL(5,2),
  avg_health_score INTEGER,
  
  -- Sample size
  sample_size INTEGER,
  last_updated TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- FINANCIAL SIMULATOR
-- =============================================

-- Simulation scenarios
CREATE TABLE IF NOT EXISTS public.financial_scenarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  
  -- Scenario info
  name TEXT NOT NULL,
  description TEXT,
  scenario_type TEXT CHECK (scenario_type IN (
    'JOB_LOSS', 'MARKET_DOWNTURN', 'HOME_PURCHASE', 'VEHICLE_PURCHASE',
    'MARRIAGE', 'NEW_BABY', 'START_BUSINESS', 'RETIREMENT',
    'EDUCATION', 'MEDICAL_EMERGENCY', 'CUSTOM'
  )),
  
  -- Parameters
  parameters JSONB NOT NULL DEFAULT '{}',
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE NOT NULL,
  
  -- Results
  simulation_results JSONB,
  impact_on_net_worth DECIMAL(12,2),
  impact_on_cash_flow DECIMAL(12,2),
  new_health_score INTEGER,
  risk_level TEXT CHECK (risk_level IN ('LOW', 'MODERATE', 'HIGH', 'CRITICAL')),
  
  -- Status
  is_saved BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT FALSE,
  tags TEXT[] DEFAULT '{}',
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Simulation snapshots (for timeline view)
CREATE TABLE IF NOT EXISTS public.simulation_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scenario_id UUID NOT NULL REFERENCES public.financial_scenarios(id) ON DELETE CASCADE,
  
  -- Timeline point
  snapshot_date DATE NOT NULL,
  months_from_start INTEGER NOT NULL,
  
  -- Financial state
  net_worth DECIMAL(12,2),
  total_assets DECIMAL(12,2),
  total_liabilities DECIMAL(12,2),
  monthly_income DECIMAL(10,2),
  monthly_expenses DECIMAL(10,2),
  cash_flow DECIMAL(10,2),
  emergency_fund_months DECIMAL(4,2),
  
  -- Key metrics
  debt_to_income_ratio DECIMAL(5,2),
  investment_balance DECIMAL(12,2),
  retirement_balance DECIMAL(12,2),
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Scenario templates
CREATE TABLE IF NOT EXISTS public.scenario_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  template_type TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  
  -- Default parameters
  default_parameters JSONB NOT NULL DEFAULT '{}',
  
  -- Impact ranges
  typical_duration_months INTEGER,
  typical_cost_range JSONB,
  typical_income_impact JSONB,
  
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- TAX PLANNING
-- =============================================

-- Tax profiles
CREATE TABLE IF NOT EXISTS public.tax_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  tax_year INTEGER NOT NULL,
  
  -- Filing status
  filing_status TEXT CHECK (filing_status IN (
    'SINGLE', 'MARRIED_FILING_JOINTLY', 'MARRIED_FILING_SEPARATELY',
    'HEAD_OF_HOUSEHOLD', 'QUALIFYING_WIDOW'
  )),
  
  -- Income
  gross_income DECIMAL(12,2),
  adjusted_gross_income DECIMAL(12,2),
  taxable_income DECIMAL(12,2),
  
  -- Tax calculations
  federal_tax_estimate DECIMAL(10,2),
  state_tax_estimate DECIMAL(10,2),
  local_tax_estimate DECIMAL(10,2),
  fica_tax DECIMAL(10,2),
  
  -- Rates
  marginal_tax_rate DECIMAL(5,2),
  effective_tax_rate DECIMAL(5,2),
  federal_bracket TEXT,
  state_bracket TEXT,
  
  -- Withholdings & payments
  total_withholdings DECIMAL(10,2),
  estimated_payments DECIMAL(10,2),
  refund_or_due DECIMAL(10,2),
  
  -- Deductions & credits
  standard_deduction DECIMAL(10,2),
  itemized_deductions DECIMAL(10,2),
  total_credits DECIMAL(10,2),
  
  -- Status
  preparation_status TEXT CHECK (preparation_status IN (
    'NOT_STARTED', 'IN_PROGRESS', 'READY_TO_FILE', 'FILED', 'AMENDED'
  )) DEFAULT 'NOT_STARTED',
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT unique_user_tax_year UNIQUE (user_id, tax_year)
);

-- Tax documents
CREATE TABLE IF NOT EXISTS public.tax_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  tax_year INTEGER NOT NULL,
  
  -- Document info
  document_type TEXT NOT NULL CHECK (document_type IN (
    'W2', '1099_MISC', '1099_INT', '1099_DIV', '1099_NEC', '1099_K',
    'K1', '1098', '1095_A', '1095_B', '1095_C', '5498', '8889',
    'OTHER_INCOME', 'OTHER_DEDUCTION', 'OTHER'
  )),
  issuer_name TEXT NOT NULL,
  issuer_ein TEXT,
  
  -- Document data
  form_data JSONB DEFAULT '{}',
  
  -- File reference
  document_id UUID REFERENCES public.documents(id),
  
  -- Processing
  is_processed BOOLEAN DEFAULT FALSE,
  ocr_extracted_data JSONB,
  validation_status TEXT CHECK (validation_status IN (
    'PENDING', 'VALID', 'NEEDS_REVIEW', 'INVALID'
  )) DEFAULT 'PENDING',
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tax calendar events
CREATE TABLE IF NOT EXISTS public.tax_calendar_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  
  event_name TEXT NOT NULL,
  event_type TEXT CHECK (event_type IN (
    'FILING_DEADLINE', 'ESTIMATED_PAYMENT', 'EXTENSION_DEADLINE',
    'DOCUMENT_EXPECTED', 'CUSTOM'
  )),
  
  due_date DATE NOT NULL,
  tax_year INTEGER,
  
  -- Reminder settings
  reminder_enabled BOOLEAN DEFAULT TRUE,
  reminder_days_before INTEGER[] DEFAULT '{30, 7, 1}',
  
  -- Status
  is_completed BOOLEAN DEFAULT FALSE,
  completed_date DATE,
  
  notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Professional advisors
CREATE TABLE IF NOT EXISTS public.financial_advisors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  
  -- Advisor info
  advisor_type TEXT CHECK (advisor_type IN (
    'CPA', 'TAX_PREPARER', 'FINANCIAL_PLANNER', 'INVESTMENT_ADVISOR',
    'ESTATE_PLANNER', 'INSURANCE_AGENT', 'OTHER'
  )),
  
  -- Contact info
  name TEXT NOT NULL,
  firm_name TEXT,
  email TEXT,
  phone TEXT,
  address JSONB,
  
  -- Professional details
  license_number TEXT,
  specializations TEXT[],
  
  -- Access permissions
  has_view_access BOOLEAN DEFAULT FALSE,
  access_granted_at TIMESTAMPTZ,
  access_expires_at TIMESTAMPTZ,
  access_scope TEXT[] DEFAULT '{}', -- ['TAX', 'INVESTMENTS', 'ALL']
  
  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  last_contact_date DATE,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- INDEXES
-- =============================================

-- Financial health scores
CREATE INDEX IF NOT EXISTS idx_health_scores_user_id ON public.financial_health_scores(user_id);
CREATE INDEX IF NOT EXISTS idx_health_scores_calculated_at ON public.financial_health_scores(calculated_at DESC);
CREATE INDEX IF NOT EXISTS idx_health_scores_current ON public.financial_health_scores(user_id) WHERE is_current = TRUE;

-- Scenarios
CREATE INDEX IF NOT EXISTS idx_scenarios_user_id ON public.financial_scenarios(user_id);
CREATE INDEX IF NOT EXISTS idx_scenarios_type ON public.financial_scenarios(scenario_type);
CREATE INDEX IF NOT EXISTS idx_scenarios_saved ON public.financial_scenarios(user_id, is_saved);
CREATE INDEX IF NOT EXISTS idx_simulation_snapshots_scenario ON public.simulation_snapshots(scenario_id, snapshot_date);

-- Tax
CREATE INDEX IF NOT EXISTS idx_tax_profiles_user_year ON public.tax_profiles(user_id, tax_year);
CREATE INDEX IF NOT EXISTS idx_tax_documents_user_year ON public.tax_documents(user_id, tax_year);
CREATE INDEX IF NOT EXISTS idx_tax_documents_type ON public.tax_documents(document_type);
CREATE INDEX IF NOT EXISTS idx_tax_calendar_user_date ON public.tax_calendar_events(user_id, due_date);
CREATE INDEX IF NOT EXISTS idx_advisors_user ON public.financial_advisors(user_id);

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================

-- Enable RLS
ALTER TABLE public.financial_health_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_scenarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.simulation_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tax_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tax_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tax_calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_advisors ENABLE ROW LEVEL SECURITY;

-- Policies for financial_health_scores
CREATE POLICY "Users can view their own health scores" ON public.financial_health_scores
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own health scores" ON public.financial_health_scores
  FOR ALL USING (auth.uid() = user_id);

-- Policies for scenarios
CREATE POLICY "Users can manage their own scenarios" ON public.financial_scenarios
  FOR ALL USING (auth.uid() = user_id);

-- Policies for simulation snapshots
CREATE POLICY "Users can view their scenario snapshots" ON public.simulation_snapshots
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.financial_scenarios 
      WHERE financial_scenarios.id = simulation_snapshots.scenario_id 
      AND financial_scenarios.user_id = auth.uid()
    )
  );

-- Policies for tax data
CREATE POLICY "Users can manage their own tax profiles" ON public.tax_profiles
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own tax documents" ON public.tax_documents
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own tax calendar" ON public.tax_calendar_events
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own advisors" ON public.financial_advisors
  FOR ALL USING (auth.uid() = user_id);

-- Advisor view access
CREATE POLICY "Advisors can view permitted data" ON public.tax_profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.financial_advisors fa
      WHERE fa.user_id = tax_profiles.user_id
      AND fa.has_view_access = TRUE
      AND fa.access_expires_at > NOW()
      AND 'TAX' = ANY(fa.access_scope)
      AND auth.uid() = fa.id -- This would need adjustment for advisor auth
    )
  );

-- =============================================
-- TRIGGERS
-- =============================================

-- Update triggers
CREATE TRIGGER update_financial_scenarios_updated_at 
  BEFORE UPDATE ON public.financial_scenarios 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tax_profiles_updated_at 
  BEFORE UPDATE ON public.tax_profiles 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tax_documents_updated_at 
  BEFORE UPDATE ON public.tax_documents 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_financial_advisors_updated_at 
  BEFORE UPDATE ON public.financial_advisors 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- FUNCTIONS
-- =============================================

-- Calculate financial health score
CREATE OR REPLACE FUNCTION calculate_financial_health_score(
  user_id_param UUID
)
RETURNS TABLE (
  score INTEGER,
  grade TEXT,
  component_scores JSONB,
  recommendations TEXT[]
) AS $$
DECLARE
  v_emergency_score INTEGER;
  v_debt_score INTEGER;
  v_credit_score INTEGER;
  v_investment_score INTEGER;
  v_income_score INTEGER;
  v_retirement_score INTEGER;
  v_budget_score INTEGER;
  v_total_score INTEGER;
  v_grade TEXT;
  v_recommendations TEXT[];
BEGIN
  -- This is a simplified version - real implementation would be more complex
  
  -- Calculate component scores (0-100 each)
  -- Emergency fund score
  SELECT 
    CASE 
      WHEN emergency_fund_months >= 6 THEN 100
      WHEN emergency_fund_months >= 3 THEN 70 + (emergency_fund_months - 3) * 10
      ELSE emergency_fund_months * 23
    END INTO v_emergency_score
  FROM (
    SELECT 
      COALESCE(
        (SELECT SUM(current_balance) FROM public.accounts 
         WHERE user_id = user_id_param AND account_type = 'SAVINGS'),
        0
      ) / NULLIF(
        (SELECT SUM(amount) FROM public.transactions 
         WHERE user_id = user_id_param 
         AND category IN ('BILLS', 'GROCERIES', 'TRANSPORTATION')
         AND date >= CURRENT_DATE - INTERVAL '3 months') / 3,
        0
      ) AS emergency_fund_months
  ) calc;
  
  -- Debt-to-income score
  -- ... additional calculations ...
  
  -- For demo, use random scores
  v_emergency_score := COALESCE(v_emergency_score, 75);
  v_debt_score := 80;
  v_credit_score := 85;
  v_investment_score := 65;
  v_income_score := 90;
  v_retirement_score := 70;
  v_budget_score := 75;
  
  -- Calculate total score (weighted average)
  v_total_score := (
    v_emergency_score * 0.20 +
    v_debt_score * 0.20 +
    v_credit_score * 0.15 +
    v_investment_score * 0.15 +
    v_income_score * 0.10 +
    v_retirement_score * 0.15 +
    v_budget_score * 0.05
  )::INTEGER;
  
  -- Assign grade
  v_grade := CASE
    WHEN v_total_score >= 90 THEN 'A'
    WHEN v_total_score >= 80 THEN 'B'
    WHEN v_total_score >= 70 THEN 'C'
    WHEN v_total_score >= 60 THEN 'D'
    ELSE 'F'
  END;
  
  -- Generate recommendations
  v_recommendations := ARRAY[]::TEXT[];
  
  IF v_emergency_score < 70 THEN
    v_recommendations := array_append(v_recommendations, 'Build emergency fund to 3-6 months of expenses');
  END IF;
  
  IF v_debt_score < 70 THEN
    v_recommendations := array_append(v_recommendations, 'Focus on reducing high-interest debt');
  END IF;
  
  IF v_retirement_score < 70 THEN
    v_recommendations := array_append(v_recommendations, 'Increase retirement contributions to at least 10% of income');
  END IF;
  
  RETURN QUERY SELECT 
    v_total_score,
    v_grade,
    jsonb_build_object(
      'emergency_fund', v_emergency_score,
      'debt_to_income', v_debt_score,
      'credit_utilization', v_credit_score,
      'investment_ratio', v_investment_score,
      'income_consistency', v_income_score,
      'retirement_contribution', v_retirement_score,
      'budget_compliance', v_budget_score
    ),
    v_recommendations;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- SAMPLE DATA - Scenario Templates
-- =============================================

INSERT INTO public.scenario_templates (template_type, name, description, default_parameters, typical_duration_months, typical_cost_range, typical_income_impact) VALUES
('JOB_LOSS', 'Job Loss', 'Simulate unemployment period', 
 '{"income_reduction": 100, "unemployment_benefits": true, "severance_months": 2}', 
 6, '{"min": 0, "max": 0}', '{"min": -100, "max": -60}'),
 
('HOME_PURCHASE', 'Home Purchase', 'Simulate buying a home',
 '{"home_price": 400000, "down_payment_percent": 20, "mortgage_rate": 6.5, "mortgage_years": 30}',
 360, '{"min": 300000, "max": 800000}', '{"min": -5, "max": 5}'),
 
('NEW_BABY', 'New Baby', 'Simulate having a child',
 '{"monthly_childcare": 1500, "medical_costs": 5000, "parental_leave_weeks": 12}',
 216, '{"min": 150000, "max": 300000}', '{"min": -20, "max": 0}'),
 
('MARKET_DOWNTURN', 'Market Crash', 'Simulate investment losses',
 '{"portfolio_drop_percent": 25, "recovery_months": 18}',
 24, '{"min": 0, "max": 0}', '{"min": -10, "max": 0}')
ON CONFLICT DO NOTHING;