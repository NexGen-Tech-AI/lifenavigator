-- Fix demo account in Supabase
-- Run this in your Supabase SQL editor after creating the auth user

-- First, get the user ID for demo@lifenavigator.tech
-- Replace 'YOUR_USER_ID_HERE' with the actual ID from auth.users table

-- Create or update the user profile
INSERT INTO public.users (
  id,
  email,
  name,
  subscription_tier,
  is_demo_account,
  onboarding_completed,
  created_at,
  updated_at
) VALUES (
  'YOUR_USER_ID_HERE', -- Replace with actual user ID
  'demo@lifenavigator.tech',
  'Demo User',
  'PRO', -- Give demo user PRO access
  true,
  true,
  now(),
  now()
) ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  name = EXCLUDED.name,
  subscription_tier = EXCLUDED.subscription_tier,
  is_demo_account = EXCLUDED.is_demo_account,
  onboarding_completed = EXCLUDED.onboarding_completed,
  updated_at = now();

-- Create or update the profile (if you have a separate profiles table)
INSERT INTO public.profiles (
  id,
  email,
  username,
  full_name,
  onboarding_completed,
  created_at,
  updated_at
) VALUES (
  'YOUR_USER_ID_HERE', -- Replace with actual user ID
  'demo@lifenavigator.tech',
  'demo_user',
  'Demo User',
  true,
  now(),
  now()
) ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  username = EXCLUDED.username,
  full_name = EXCLUDED.full_name,
  onboarding_completed = EXCLUDED.onboarding_completed,
  updated_at = now();

-- Create demo financial accounts
INSERT INTO public.financial_accounts (
  user_id,
  account_name,
  account_type,
  institution_name,
  current_balance,
  available_balance,
  currency,
  data_source,
  is_active,
  created_at,
  updated_at
) VALUES 
  ('YOUR_USER_ID_HERE', 'Demo Checking', 'CHECKING', 'Demo Bank', 15000, 15000, 'USD', 'MANUAL', true, now(), now()),
  ('YOUR_USER_ID_HERE', 'Demo Savings', 'SAVINGS', 'Demo Bank', 45000, 45000, 'USD', 'MANUAL', true, now(), now()),
  ('YOUR_USER_ID_HERE', 'Demo Investment', 'INVESTMENT', 'Demo Brokerage', 85000, 85000, 'USD', 'MANUAL', true, now(), now()),
  ('YOUR_USER_ID_HERE', 'Demo Credit Card', 'CREDIT_CARD', 'Demo Bank', -2500, 7500, 'USD', 'MANUAL', true, now(), now())
ON CONFLICT DO NOTHING;

-- Verify the setup
SELECT 'Auth User:' as check_type, count(*) as count FROM auth.users WHERE email = 'demo@lifenavigator.tech'
UNION ALL
SELECT 'User Profile:' as check_type, count(*) as count FROM public.users WHERE email = 'demo@lifenavigator.tech'
UNION ALL
SELECT 'Profile:' as check_type, count(*) as count FROM public.profiles WHERE email = 'demo@lifenavigator.tech'
UNION ALL
SELECT 'Financial Accounts:' as check_type, count(*) as count FROM public.financial_accounts WHERE user_id = 'YOUR_USER_ID_HERE';