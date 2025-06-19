-- Fix Demo Account Setup
-- Run this in Supabase SQL Editor after the main database script

-- First, check if the demo user exists in auth.users
DO $$
DECLARE
    demo_user_id UUID := '11111111-1111-1111-1111-111111111111';
    demo_email TEXT := 'demo@lifenavigator.ai';
    existing_user_id UUID;
BEGIN
    -- Check if demo user exists with our ID
    SELECT id INTO existing_user_id 
    FROM auth.users 
    WHERE id = demo_user_id;
    
    IF existing_user_id IS NULL THEN
        -- Check if demo email exists with different ID
        SELECT id INTO existing_user_id 
        FROM auth.users 
        WHERE email = demo_email;
        
        IF existing_user_id IS NOT NULL THEN
            -- Use the existing user's ID
            demo_user_id := existing_user_id;
            RAISE NOTICE 'Found existing demo user with ID: %', demo_user_id;
        ELSE
            RAISE NOTICE 'Demo user does not exist in auth.users';
            RAISE NOTICE 'Please create it using Supabase dashboard or wait for script fix';
            RETURN;
        END IF;
    END IF;
    
    -- Create or update user profile
    INSERT INTO public.users (
        id,
        email,
        name,
        subscription_tier,
        subscription_status,
        is_demo_account,
        onboarding_completed,
        pilot_program,
        referral_code,
        created_at,
        updated_at
    ) VALUES (
        demo_user_id,
        demo_email,
        'Demo User',
        'PILOT',
        'ACTIVE',
        true,
        true,
        true,
        'DEMO2024',
        NOW(),
        NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
        subscription_tier = 'PILOT',
        pilot_program = true,
        is_demo_account = true,
        onboarding_completed = true,
        updated_at = NOW();
    
    -- Create user preferences
    INSERT INTO public.user_preferences (
        user_id,
        theme,
        notifications,
        privacy,
        onboarding_data
    ) VALUES (
        demo_user_id,
        'system',
        '{"email": true, "push": false, "sms": false}',
        '{"shareDataForInsights": true, "allowAnonymousAnalytics": false}',
        '{"completedSteps": ["welcome", "profile", "preferences", "connect_accounts"], "skippedSteps": []}'
    )
    ON CONFLICT (user_id) DO UPDATE SET
        updated_at = NOW();
    
    -- Create demo financial accounts
    INSERT INTO public.financial_accounts (
        user_id,
        account_name,
        account_type,
        institution_name,
        current_balance,
        available_balance,
        data_source,
        is_active
    ) VALUES 
    (demo_user_id, 'Demo Checking', 'CHECKING', 'Demo Bank', 5432.10, 5432.10, 'MANUAL', true),
    (demo_user_id, 'Demo Savings', 'SAVINGS', 'Demo Bank', 12500.00, 12500.00, 'MANUAL', true),
    (demo_user_id, 'Demo Credit Card', 'CREDIT_CARD', 'Demo Card Co', -1234.56, 3765.44, 'MANUAL', true)
    ON CONFLICT DO NOTHING;
    
    -- Create some demo transactions
    INSERT INTO public.transactions (
        user_id,
        account_id,
        transaction_date,
        amount,
        description,
        category,
        data_source
    )
    SELECT 
        demo_user_id,
        fa.id,
        CURRENT_DATE - (random() * 30)::int,
        (random() * 200 - 100)::decimal(10,2),
        CASE 
            WHEN random() < 0.3 THEN 'Grocery Store'
            WHEN random() < 0.6 THEN 'Restaurant'
            WHEN random() < 0.8 THEN 'Gas Station'
            ELSE 'Online Purchase'
        END,
        CASE 
            WHEN random() < 0.3 THEN 'FOOD'
            WHEN random() < 0.6 THEN 'ENTERTAINMENT'
            WHEN random() < 0.8 THEN 'TRANSPORTATION'
            ELSE 'SHOPPING'
        END,
        'MANUAL'
    FROM public.financial_accounts fa
    WHERE fa.user_id = demo_user_id
    CROSS JOIN generate_series(1, 10) AS i
    ON CONFLICT DO NOTHING;
    
    -- Set feature usage limits
    INSERT INTO public.feature_usage (
        user_id,
        feature_key,
        usage_count,
        usage_limit,
        period_start,
        period_end
    ) VALUES
    (demo_user_id, 'plaid_integration', 0, 3, date_trunc('month', CURRENT_DATE), date_trunc('month', CURRENT_DATE) + interval '1 month' - interval '1 day'),
    (demo_user_id, 'ai_insights', 0, 10, date_trunc('month', CURRENT_DATE), date_trunc('month', CURRENT_DATE) + interval '1 month' - interval '1 day'),
    (demo_user_id, 'document_upload', 0, 100, date_trunc('month', CURRENT_DATE), date_trunc('month', CURRENT_DATE) + interval '1 month' - interval '1 day')
    ON CONFLICT (user_id, feature_key, period_start) DO UPDATE SET
        usage_limit = EXCLUDED.usage_limit;
    
    RAISE NOTICE '';
    RAISE NOTICE '✅ Demo account setup complete!';
    RAISE NOTICE '📧 Email: %', demo_email;
    RAISE NOTICE '🔐 Password: demo123';
    RAISE NOTICE '🎯 Tier: PILOT';
    RAISE NOTICE '💰 Created demo financial accounts with transactions';
    
END $$;