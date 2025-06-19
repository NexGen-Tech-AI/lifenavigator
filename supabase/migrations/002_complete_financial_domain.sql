-- =============================================
-- COMPLETE FINANCIAL DOMAIN SCHEMA
-- =============================================
-- This migration creates all financial tables including
-- traditional banking, investments, and cryptocurrency

-- Enhanced financial accounts with crypto support
CREATE TABLE IF NOT EXISTS public.financial_accounts_extended (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  
  -- Account identification
  account_name TEXT NOT NULL,
  account_type TEXT NOT NULL CHECK (account_type IN (
    'CHECKING', 'SAVINGS', 'CREDIT_CARD', 'INVESTMENT', 
    'CRYPTO', 'LOAN', 'MORTGAGE', 'RETIREMENT', 'HSA'
  )),
  account_subtype TEXT, -- '401k', 'roth_ira', 'bitcoin', etc.
  
  -- Institution details
  institution_name TEXT NOT NULL,
  institution_id TEXT,
  institution_logo_url TEXT,
  
  -- Account numbers (encrypted)
  account_number TEXT,
  routing_number TEXT,
  wallet_address TEXT, -- for crypto
  
  -- Balances (support crypto decimals)
  current_balance DECIMAL(20,8) NOT NULL DEFAULT 0,
  available_balance DECIMAL(20,8),
  pending_balance DECIMAL(20,8),
  
  -- Credit specific
  credit_limit DECIMAL(15,2),
  minimum_payment DECIMAL(15,2),
  payment_due_date DATE,
  apr DECIMAL(5,2),
  
  -- Investment specific
  cash_balance DECIMAL(15,2),
  investment_value DECIMAL(15,2),
  total_return DECIMAL(15,2),
  total_return_percentage DECIMAL(5,2),
  
  -- Data source
  data_source TEXT DEFAULT 'MANUAL' CHECK (data_source IN (
    'MANUAL', 'PLAID', 'YODLEE', 'COINBASE', 'DIRECT_API'
  )),
  external_account_id TEXT,
  
  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  is_hidden BOOLEAN DEFAULT FALSE,
  is_primary BOOLEAN DEFAULT FALSE,
  verification_status TEXT DEFAULT 'UNVERIFIED' CHECK (verification_status IN (
    'UNVERIFIED', 'PENDING', 'VERIFIED'
  )),
  
  -- Sync info
  last_synced_at TIMESTAMPTZ,
  sync_error TEXT,
  requires_reconnect BOOLEAN DEFAULT FALSE,
  
  -- Additional metadata
  currency TEXT DEFAULT 'USD',
  opening_date DATE,
  closing_date DATE,
  interest_rate DECIMAL(5,3),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Cryptocurrency holdings
CREATE TABLE IF NOT EXISTS public.crypto_holdings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  account_id UUID REFERENCES public.financial_accounts_extended(id) ON DELETE CASCADE,
  
  -- Asset details
  symbol TEXT NOT NULL,
  name TEXT NOT NULL,
  token_type TEXT CHECK (token_type IN ('COIN', 'TOKEN', 'NFT')),
  network TEXT, -- 'bitcoin', 'ethereum', 'solana'
  contract_address TEXT,
  
  -- Holdings
  quantity DECIMAL(30,18) NOT NULL, -- High precision
  cost_basis DECIMAL(20,2),
  cost_basis_currency TEXT DEFAULT 'USD',
  acquisition_date DATE,
  acquisition_price DECIMAL(20,8),
  
  -- Current values
  current_price DECIMAL(20,8),
  current_value DECIMAL(20,2),
  price_change_24h DECIMAL(10,2),
  price_change_percentage_24h DECIMAL(8,4),
  
  -- Staking/Yield
  is_staked BOOLEAN DEFAULT FALSE,
  staking_rewards DECIMAL(30,18),
  apy DECIMAL(8,4),
  
  -- Storage
  storage_type TEXT CHECK (storage_type IN (
    'EXCHANGE', 'HOT_WALLET', 'COLD_WALLET', 'DEFI'
  )),
  wallet_address TEXT, -- encrypted
  exchange_name TEXT,
  
  -- Metadata
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- DeFi positions
CREATE TABLE IF NOT EXISTS public.defi_positions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  
  -- Protocol details
  protocol_name TEXT NOT NULL,
  protocol_type TEXT NOT NULL CHECK (protocol_type IN (
    'DEX', 'LENDING', 'YIELD', 'DERIVATIVES'
  )),
  chain TEXT NOT NULL,
  
  -- Position details
  position_type TEXT NOT NULL CHECK (position_type IN (
    'LIQUIDITY', 'LENDING', 'BORROWING', 'FARMING'
  )),
  position_id TEXT,
  
  -- Assets involved
  assets JSONB NOT NULL, -- [{symbol, amount, value}]
  
  -- Values
  total_value_usd DECIMAL(20,2),
  cost_basis_usd DECIMAL(20,2),
  unrealized_pnl DECIMAL(20,2),
  
  -- Yield metrics
  apy DECIMAL(8,4),
  rewards_earned JSONB, -- {token: amount}
  fees_earned DECIMAL(20,2),
  
  -- Risk metrics
  impermanent_loss DECIMAL(20,2),
  liquidation_risk DECIMAL(5,2),
  health_factor DECIMAL(10,2),
  
  -- Status
  status TEXT DEFAULT 'ACTIVE' CHECK (status IN (
    'ACTIVE', 'CLOSED', 'LIQUIDATED'
  )),
  opened_at TIMESTAMPTZ DEFAULT NOW(),
  closed_at TIMESTAMPTZ,
  last_updated TIMESTAMPTZ DEFAULT NOW()
);

-- Investment portfolios
CREATE TABLE IF NOT EXISTS public.investment_portfolios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  account_id UUID REFERENCES public.financial_accounts_extended(id),
  
  portfolio_name TEXT NOT NULL,
  portfolio_type TEXT CHECK (portfolio_type IN (
    'RETIREMENT', 'TAXABLE', 'EDUCATION', 'TRUST'
  )),
  
  -- Holdings summary
  total_value DECIMAL(20,2),
  cash_value DECIMAL(20,2),
  securities_value DECIMAL(20,2),
  
  -- Performance metrics
  total_return DECIMAL(20,2),
  total_return_percentage DECIMAL(10,4),
  daily_change DECIMAL(20,2),
  daily_change_percentage DECIMAL(10,4),
  
  -- Risk metrics
  beta DECIMAL(5,3),
  sharpe_ratio DECIMAL(5,3),
  standard_deviation DECIMAL(5,3),
  
  -- Allocation
  asset_allocation JSONB, -- {stocks: %, bonds: %, cash: %}
  sector_allocation JSONB,
  geographic_allocation JSONB,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Individual investment holdings
CREATE TABLE IF NOT EXISTS public.investment_holdings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  portfolio_id UUID NOT NULL REFERENCES public.investment_portfolios(id) ON DELETE CASCADE,
  
  -- Security details
  symbol TEXT NOT NULL,
  security_name TEXT,
  security_type TEXT CHECK (security_type IN (
    'STOCK', 'BOND', 'ETF', 'MUTUAL_FUND', 'OPTION', 'COMMODITY'
  )),
  exchange TEXT,
  cusip TEXT,
  
  -- Position
  quantity DECIMAL(20,8),
  average_cost DECIMAL(20,8),
  total_cost DECIMAL(20,2),
  
  -- Current values
  current_price DECIMAL(20,8),
  current_value DECIMAL(20,2),
  unrealized_gain_loss DECIMAL(20,2),
  unrealized_gain_loss_percentage DECIMAL(10,4),
  
  -- Income
  annual_dividend DECIMAL(20,2),
  dividend_yield DECIMAL(6,4),
  last_dividend_date DATE,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enhanced budgets with ML predictions
CREATE TABLE IF NOT EXISTS public.budgets_advanced (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  
  -- Budget details
  name TEXT NOT NULL,
  description TEXT,
  
  -- Amount and period
  amount DECIMAL(15,2) NOT NULL,
  period TEXT NOT NULL CHECK (period IN (
    'DAILY', 'WEEKLY', 'BIWEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY'
  )),
  
  -- Category and account
  category_id UUID,
  account_id UUID REFERENCES public.financial_accounts_extended(id),
  
  -- Date range
  start_date DATE NOT NULL,
  end_date DATE,
  
  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  
  -- Tracking
  current_spent DECIMAL(15,2) DEFAULT 0,
  projected_spent DECIMAL(15,2), -- ML prediction
  
  -- Alerts
  alert_enabled BOOLEAN DEFAULT TRUE,
  alert_threshold DECIMAL(3,2) DEFAULT 0.8, -- 80% default
  alert_sent BOOLEAN DEFAULT FALSE,
  
  -- ML insights
  recommended_amount DECIMAL(15,2),
  confidence_score DECIMAL(3,2),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Financial goals with AI recommendations
CREATE TABLE IF NOT EXISTS public.financial_goals_advanced (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  
  -- Goal details
  name TEXT NOT NULL,
  description TEXT,
  goal_type TEXT NOT NULL CHECK (goal_type IN (
    'SAVINGS', 'DEBT_PAYOFF', 'INVESTMENT', 'PURCHASE', 
    'EMERGENCY_FUND', 'RETIREMENT', 'EDUCATION', 'OTHER'
  )),
  
  -- Target
  target_amount DECIMAL(15,2) NOT NULL,
  current_amount DECIMAL(15,2) DEFAULT 0,
  monthly_contribution DECIMAL(15,2),
  
  -- Timeline
  target_date DATE NOT NULL,
  expected_completion_date DATE, -- ML prediction
  
  -- Priority and status
  priority TEXT DEFAULT 'MEDIUM' CHECK (priority IN (
    'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'
  )),
  status TEXT DEFAULT 'ACTIVE' CHECK (status IN (
    'ACTIVE', 'PAUSED', 'COMPLETED', 'ABANDONED'
  )),
  
  -- Associated accounts
  funding_account_ids UUID[],
  
  -- AI insights
  recommended_monthly_amount DECIMAL(15,2),
  feasibility_score DECIMAL(3,2),
  risk_assessment TEXT,
  
  -- Milestones
  milestones JSONB, -- [{date, amount, description}]
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Transaction categories with ML
CREATE TABLE IF NOT EXISTS public.transaction_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Category hierarchy
  name TEXT NOT NULL,
  parent_category_id UUID REFERENCES public.transaction_categories(id),
  
  -- Display
  icon TEXT,
  color TEXT,
  
  -- Rules
  keywords TEXT[], -- For ML categorization
  merchant_patterns TEXT[],
  
  -- User customization
  is_system BOOLEAN DEFAULT TRUE,
  user_id UUID REFERENCES public.users(id),
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Merchant enrichment data
CREATE TABLE IF NOT EXISTS public.merchants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Merchant info
  name TEXT NOT NULL,
  clean_name TEXT,
  category_code TEXT,
  
  -- Categorization
  default_category_id UUID REFERENCES public.transaction_categories(id),
  
  -- Location
  website TEXT,
  logo_url TEXT,
  
  -- Metadata
  is_subscription BOOLEAN DEFAULT FALSE,
  is_recurring BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Recurring transaction detection
CREATE TABLE IF NOT EXISTS public.recurring_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  account_id UUID NOT NULL REFERENCES public.financial_accounts_extended(id),
  
  -- Pattern details
  merchant_name TEXT NOT NULL,
  amount DECIMAL(15,2),
  amount_variance DECIMAL(5,2), -- Allowed variance %
  
  -- Frequency
  frequency TEXT CHECK (frequency IN (
    'DAILY', 'WEEKLY', 'BIWEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY'
  )),
  
  -- Next occurrence
  next_expected_date DATE,
  
  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  confidence_score DECIMAL(3,2),
  
  -- History
  first_seen_date DATE,
  last_seen_date DATE,
  occurrence_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.financial_accounts_extended ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crypto_holdings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.defi_positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investment_portfolios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investment_holdings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budgets_advanced ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_goals_advanced ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recurring_transactions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can manage own financial accounts" ON public.financial_accounts_extended
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own crypto holdings" ON public.crypto_holdings
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own DeFi positions" ON public.defi_positions
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own portfolios" ON public.investment_portfolios
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage portfolio holdings" ON public.investment_holdings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.investment_portfolios p
      WHERE p.id = portfolio_id AND p.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage own budgets" ON public.budgets_advanced
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own goals" ON public.financial_goals_advanced
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own recurring transactions" ON public.recurring_transactions
  FOR ALL USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_financial_accounts_user_type ON public.financial_accounts_extended(user_id, account_type);
CREATE INDEX idx_financial_accounts_active ON public.financial_accounts_extended(user_id) WHERE is_active = TRUE;
CREATE INDEX idx_crypto_holdings_user_symbol ON public.crypto_holdings(user_id, symbol);
CREATE INDEX idx_defi_positions_user_status ON public.defi_positions(user_id, status);
CREATE INDEX idx_investment_portfolios_user ON public.investment_portfolios(user_id);
CREATE INDEX idx_investment_holdings_portfolio ON public.investment_holdings(portfolio_id);
CREATE INDEX idx_budgets_user_active ON public.budgets_advanced(user_id) WHERE is_active = TRUE;
CREATE INDEX idx_goals_user_status ON public.financial_goals_advanced(user_id, status);
CREATE INDEX idx_recurring_trans_user_active ON public.recurring_transactions(user_id) WHERE is_active = TRUE;

-- Create update triggers
CREATE TRIGGER update_financial_accounts_updated_at 
  BEFORE UPDATE ON public.financial_accounts_extended
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_crypto_holdings_updated_at 
  BEFORE UPDATE ON public.crypto_holdings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_defi_positions_updated_at 
  BEFORE UPDATE ON public.defi_positions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_portfolios_updated_at 
  BEFORE UPDATE ON public.investment_portfolios
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_holdings_updated_at 
  BEFORE UPDATE ON public.investment_holdings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_budgets_updated_at 
  BEFORE UPDATE ON public.budgets_advanced
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_goals_updated_at 
  BEFORE UPDATE ON public.financial_goals_advanced
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();