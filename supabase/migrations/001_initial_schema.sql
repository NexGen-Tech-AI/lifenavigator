-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE subscription_tier AS ENUM ('FREE', 'PRO', 'AI_AGENT', 'FAMILY');
CREATE TYPE subscription_status AS ENUM ('ACTIVE', 'PAST_DUE', 'CANCELED', 'PAUSED', 'TRIALING');
CREATE TYPE account_type AS ENUM ('CHECKING', 'SAVINGS', 'CREDIT_CARD', 'INVESTMENT', 'LOAN', 'MORTGAGE', 'OTHER');
CREATE TYPE data_source AS ENUM ('MANUAL', 'PLAID', 'DOCUMENT', 'CSV_IMPORT');
CREATE TYPE document_type AS ENUM ('BANK_STATEMENT', 'CREDIT_CARD_STATEMENT', 'INVESTMENT_STATEMENT', 'TAX_DOCUMENT', 'RECEIPT', 'INVOICE', 'OTHER');
CREATE TYPE processing_status AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'MANUAL_REVIEW');
CREATE TYPE budget_period AS ENUM ('DAILY', 'WEEKLY', 'BIWEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY');
CREATE TYPE goal_type AS ENUM ('SAVINGS', 'DEBT_PAYOFF', 'INVESTMENT', 'PURCHASE', 'EMERGENCY_FUND', 'RETIREMENT', 'OTHER');
CREATE TYPE goal_priority AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- Create users table (extends Supabase auth.users)
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  avatar_url TEXT,
  subscription_tier subscription_tier DEFAULT 'FREE',
  subscription_status subscription_status DEFAULT 'ACTIVE',
  subscription_expiry TIMESTAMPTZ,
  is_demo_account BOOLEAN DEFAULT FALSE,
  onboarding_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create financial_accounts table
CREATE TABLE public.financial_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  account_name TEXT NOT NULL,
  account_type account_type NOT NULL,
  institution_name TEXT NOT NULL,
  institution_id TEXT,
  account_number TEXT, -- Encrypted, last 4 digits only
  routing_number TEXT, -- Encrypted
  current_balance DECIMAL(15,2) NOT NULL DEFAULT 0,
  available_balance DECIMAL(15,2),
  credit_limit DECIMAL(15,2),
  minimum_payment DECIMAL(15,2),
  apr DECIMAL(5,2),
  data_source data_source DEFAULT 'MANUAL',
  plaid_item_id UUID,
  plaid_account_id TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  is_hidden BOOLEAN DEFAULT FALSE,
  last_synced TIMESTAMPTZ,
  sync_error TEXT,
  currency TEXT DEFAULT 'USD',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create transactions table
CREATE TABLE public.transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  account_id UUID NOT NULL REFERENCES public.financial_accounts(id) ON DELETE CASCADE,
  transaction_date DATE NOT NULL,
  post_date DATE,
  amount DECIMAL(15,2) NOT NULL,
  description TEXT NOT NULL,
  original_description TEXT,
  category_id UUID,
  subcategory TEXT,
  merchant_id UUID,
  data_source data_source DEFAULT 'MANUAL',
  plaid_transaction_id TEXT UNIQUE,
  document_id UUID,
  is_pending BOOLEAN DEFAULT FALSE,
  is_recurring BOOLEAN DEFAULT FALSE,
  recurring_transaction_id UUID,
  notes TEXT,
  tags TEXT[] DEFAULT '{}',
  location TEXT,
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create plaid_items table
CREATE TABLE public.plaid_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  access_token TEXT NOT NULL, -- Encrypted
  item_id TEXT UNIQUE NOT NULL,
  institution_id TEXT NOT NULL,
  institution_name TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  last_successful_sync TIMESTAMPTZ,
  last_sync_error TEXT,
  webhook_url TEXT,
  consent_expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create documents table
CREATE TABLE public.documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  file_url TEXT NOT NULL,
  storage_key TEXT UNIQUE NOT NULL,
  document_type document_type NOT NULL,
  uploaded_at TIMESTAMPTZ DEFAULT NOW(),
  processing_status processing_status DEFAULT 'PENDING',
  processed_at TIMESTAMPTZ,
  processing_error TEXT,
  extracted_data JSONB,
  confidence DECIMAL(3,2),
  page_count INTEGER,
  parsed_accounts JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create budgets table
CREATE TABLE public.budgets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  period budget_period NOT NULL,
  category_id UUID,
  account_id UUID REFERENCES public.financial_accounts(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE,
  is_active BOOLEAN DEFAULT TRUE,
  current_spent DECIMAL(15,2) DEFAULT 0,
  last_calculated TIMESTAMPTZ,
  alert_enabled BOOLEAN DEFAULT TRUE,
  alert_threshold DECIMAL(3,2) DEFAULT 0.8,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create goals table
CREATE TABLE public.goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  target_amount DECIMAL(15,2) NOT NULL,
  current_amount DECIMAL(15,2) DEFAULT 0,
  target_date DATE NOT NULL,
  goal_type goal_type NOT NULL,
  priority goal_priority DEFAULT 'MEDIUM',
  account_id UUID REFERENCES public.financial_accounts(id) ON DELETE CASCADE,
  is_completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  last_calculated TIMESTAMPTZ,
  milestones JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_financial_accounts_user_id ON public.financial_accounts(user_id);
CREATE INDEX idx_financial_accounts_plaid ON public.financial_accounts(plaid_item_id, plaid_account_id);
CREATE INDEX idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX idx_transactions_account_id ON public.transactions(account_id);
CREATE INDEX idx_transactions_date ON public.transactions(transaction_date);
CREATE INDEX idx_plaid_items_user_id ON public.plaid_items(user_id);
CREATE INDEX idx_documents_user_id ON public.documents(user_id);
CREATE INDEX idx_budgets_user_id ON public.budgets(user_id);
CREATE INDEX idx_goals_user_id ON public.goals(user_id);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plaid_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can only see their own data
CREATE POLICY "Users can view own profile" ON public.users
  FOR ALL USING (auth.uid() = id);

CREATE POLICY "Users can view own accounts" ON public.financial_accounts
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own transactions" ON public.transactions
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own plaid items" ON public.plaid_items
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own documents" ON public.documents
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own budgets" ON public.budgets
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own goals" ON public.goals
  FOR ALL USING (auth.uid() = user_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_financial_accounts_updated_at BEFORE UPDATE ON public.financial_accounts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON public.transactions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_plaid_items_updated_at BEFORE UPDATE ON public.plaid_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON public.documents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_budgets_updated_at BEFORE UPDATE ON public.budgets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_goals_updated_at BEFORE UPDATE ON public.goals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Security audit logs table
CREATE TABLE IF NOT EXISTS public.security_audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  event TEXT NOT NULL,
  event_type TEXT NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_security_audit_logs_user_id ON public.security_audit_logs(user_id);
CREATE INDEX idx_security_audit_logs_event_type ON public.security_audit_logs(event_type);
CREATE INDEX idx_security_audit_logs_created_at ON public.security_audit_logs(created_at);

ALTER TABLE public.security_audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own audit logs" ON public.security_audit_logs
  FOR SELECT USING (auth.uid() = user_id);

-- Create function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create user profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create storage buckets (run in Supabase dashboard)
-- INSERT INTO storage.buckets (id, name, public) VALUES 
--   ('financial-documents', 'financial-documents', false),
--   ('profile-images', 'profile-images', false);

-- Storage policies
-- CREATE POLICY "Users can upload own documents" ON storage.objects
--   FOR INSERT WITH CHECK (bucket_id = 'financial-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

-- CREATE POLICY "Users can view own documents" ON storage.objects
--   FOR SELECT USING (bucket_id = 'financial-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

-- CREATE POLICY "Users can delete own documents" ON storage.objects
--   FOR DELETE USING (bucket_id = 'financial-documents' AND auth.uid()::text = (storage.foldername(name))[1]);