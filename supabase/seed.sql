-- Create demo user (password: DemoPassword123)
-- Note: This uses Supabase Auth, so we'll create it via the API
-- The user ID will be created by Supabase Auth

-- Demo user profile data (will be inserted after auth user is created)
DO $$
DECLARE
  demo_user_id UUID := 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
BEGIN
  -- Insert demo user profile
  INSERT INTO public.users (id, email, name, subscription_tier, subscription_status, is_demo_account, onboarding_completed)
  VALUES (
    demo_user_id,
    'demo@lifenavigator.tech',
    'Demo User',
    'PRO',
    'ACTIVE',
    true,
    true
  ) ON CONFLICT (id) DO NOTHING;

  -- Insert demo financial accounts
  INSERT INTO public.financial_accounts (id, user_id, account_name, account_type, institution_name, current_balance, available_balance)
  VALUES
    (uuid_generate_v4(), demo_user_id, 'Primary Checking', 'CHECKING', 'Chase Bank', 5234.67, 5234.67),
    (uuid_generate_v4(), demo_user_id, 'High Yield Savings', 'SAVINGS', 'Marcus by Goldman Sachs', 25000.00, 25000.00),
    (uuid_generate_v4(), demo_user_id, 'Sapphire Reserve', 'CREDIT_CARD', 'Chase', -1234.56, 8765.44),
    (uuid_generate_v4(), demo_user_id, 'Investment Account', 'INVESTMENT', 'Vanguard', 45678.90, 45678.90),
    (uuid_generate_v4(), demo_user_id, 'Auto Loan', 'LOAN', 'Toyota Financial', -12345.67, NULL),
    (uuid_generate_v4(), demo_user_id, 'Home Mortgage', 'MORTGAGE', 'Wells Fargo', -234567.89, NULL);

  -- Get account IDs for transactions
  WITH account_ids AS (
    SELECT 
      id,
      account_type
    FROM public.financial_accounts
    WHERE user_id = demo_user_id
  )
  -- Insert demo transactions
  INSERT INTO public.transactions (user_id, account_id, transaction_date, amount, description)
  SELECT 
    demo_user_id,
    CASE 
      WHEN random() < 0.4 THEN (SELECT id FROM account_ids WHERE account_type = 'CHECKING' LIMIT 1)
      WHEN random() < 0.7 THEN (SELECT id FROM account_ids WHERE account_type = 'CREDIT_CARD' LIMIT 1)
      ELSE (SELECT id FROM account_ids WHERE account_type = 'SAVINGS' LIMIT 1)
    END,
    CURRENT_DATE - (random() * 90)::int,
    CASE 
      WHEN random() < 0.7 THEN -(random() * 200 + 10)::numeric(10,2)
      ELSE (random() * 1000 + 100)::numeric(10,2)
    END,
    CASE (random() * 20)::int
      WHEN 0 THEN 'Whole Foods Market'
      WHEN 1 THEN 'Amazon.com'
      WHEN 2 THEN 'Starbucks'
      WHEN 3 THEN 'Target'
      WHEN 4 THEN 'Shell Gas Station'
      WHEN 5 THEN 'Netflix Subscription'
      WHEN 6 THEN 'Spotify Premium'
      WHEN 7 THEN 'Direct Deposit - Salary'
      WHEN 8 THEN 'Uber'
      WHEN 9 THEN 'Restaurant - Chipotle'
      WHEN 10 THEN 'CVS Pharmacy'
      WHEN 11 THEN 'Home Depot'
      WHEN 12 THEN 'Electric Bill - ConEd'
      WHEN 13 THEN 'Internet - Verizon'
      WHEN 14 THEN 'Mobile Phone - AT&T'
      WHEN 15 THEN 'Gym Membership'
      WHEN 16 THEN 'Trader Joes'
      WHEN 17 THEN 'Delta Airlines'
      WHEN 18 THEN 'Hotel - Marriott'
      WHEN 19 THEN 'Apple Store'
      ELSE 'Miscellaneous Purchase'
    END
  FROM generate_series(1, 100);

  -- Insert demo budgets
  INSERT INTO public.budgets (user_id, name, amount, period, start_date, is_active)
  VALUES
    (demo_user_id, 'Groceries', 600, 'MONTHLY', CURRENT_DATE, true),
    (demo_user_id, 'Dining Out', 400, 'MONTHLY', CURRENT_DATE, true),
    (demo_user_id, 'Transportation', 300, 'MONTHLY', CURRENT_DATE, true),
    (demo_user_id, 'Entertainment', 200, 'MONTHLY', CURRENT_DATE, true),
    (demo_user_id, 'Shopping', 500, 'MONTHLY', CURRENT_DATE, true),
    (demo_user_id, 'Utilities', 250, 'MONTHLY', CURRENT_DATE, true);

  -- Insert demo goals
  INSERT INTO public.goals (user_id, name, description, target_amount, current_amount, target_date, goal_type, priority)
  VALUES
    (demo_user_id, 'Emergency Fund', 'Build 6 months of expenses', 30000, 25000, '2024-12-31', 'SAVINGS', 'HIGH'),
    (demo_user_id, 'Vacation to Japan', 'Two week trip to Japan', 8000, 3200, '2024-07-01', 'SAVINGS', 'MEDIUM'),
    (demo_user_id, 'Pay Off Credit Cards', 'Eliminate all credit card debt', 5000, 1234.56, '2024-06-30', 'DEBT_PAYOFF', 'HIGH'),
    (demo_user_id, 'New Car Down Payment', 'Save for Tesla Model 3', 10000, 2500, '2025-01-01', 'PURCHASE', 'LOW'),
    (demo_user_id, 'Retirement Fund', 'Reach $100k in retirement savings', 100000, 45678.90, '2025-12-31', 'RETIREMENT', 'CRITICAL');

END $$;