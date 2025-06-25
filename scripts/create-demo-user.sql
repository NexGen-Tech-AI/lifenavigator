-- Create demo user in Supabase
-- Run this in your Supabase SQL editor

-- First, create the auth user (this will create an entry in auth.users)
-- Note: You'll need to use Supabase Dashboard or their API to create the auth user
-- as direct SQL insertion into auth.users is not recommended

-- After creating the auth user with email: demo@lifenavigator.tech and password: DemoPassword123
-- Get the user ID and replace 'YOUR_USER_ID_HERE' below

-- Create the profile for the demo user
INSERT INTO public.profiles (
  id,
  email,
  username,
  full_name,
  onboarding_completed,
  created_at,
  updated_at
) VALUES (
  'YOUR_USER_ID_HERE', -- Replace with actual user ID from auth.users
  'demo@lifenavigator.tech',
  'demo_user',
  'Demo User',
  true,
  now(),
  now()
) ON CONFLICT (id) DO UPDATE SET
  onboarding_completed = true,
  updated_at = now();