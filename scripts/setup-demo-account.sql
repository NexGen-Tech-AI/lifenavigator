-- Setup Demo Account for Life Navigator
-- Run this in your Supabase SQL Editor

-- 1. First, check if the demo user exists
SELECT id, email FROM auth.users WHERE email = 'demo@lifenavigator.tech';

-- 2. If the user exists, ensure they have a profile
-- Get the user ID from the above query and replace 'USER_ID_HERE' with the actual ID
-- Example: If the user ID is '123e4567-e89b-12d3-a456-426614174000', use that

-- INSERT INTO public.profiles (id, email, username, full_name, onboarding_completed)
-- VALUES (
--   'USER_ID_HERE',  -- Replace with actual user ID from above query
--   'demo@lifenavigator.tech',
--   'demo_user',
--   'Demo User',
--   true  -- Set to true so they skip onboarding
-- )
-- ON CONFLICT (id) 
-- DO UPDATE SET 
--   onboarding_completed = true,
--   username = COALESCE(profiles.username, 'demo_user'),
--   full_name = COALESCE(profiles.full_name, 'Demo User');

-- 3. Create sample data for the demo account (optional)
-- This will make the demo more impressive for visitors

-- Example: Create sample goals
-- INSERT INTO public.goals (user_id, title, description, category, status, target_date)
-- VALUES 
--   ('USER_ID_HERE', 'Launch My Startup', 'Build and launch my SaaS product', 'career', 'in_progress', '2025-06-01'),
--   ('USER_ID_HERE', 'Emergency Fund', 'Save $10,000 for emergencies', 'finance', 'in_progress', '2025-12-31'),
--   ('USER_ID_HERE', 'Learn Spanish', 'Become conversational in Spanish', 'education', 'not_started', '2025-09-01');

-- 4. Verify everything is set up
-- SELECT * FROM public.profiles WHERE email = 'demo@lifenavigator.tech';