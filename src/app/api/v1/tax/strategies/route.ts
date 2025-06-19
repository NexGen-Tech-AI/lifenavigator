import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET /api/v1/tax/strategies - Get tax optimization strategies
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch user's financial data to personalize strategies
    const { data: accounts } = await supabase
      .from('accounts')
      .select('*')
      .eq('user_id', user.id);

    const { data: taxProfile } = await supabase
      .from('tax_profiles')
      .select('*')
      .eq('user_id', user.id)
      .eq('tax_year', new Date().getFullYear())
      .single();

    // Generate personalized strategies
    const strategies = [
      {
        id: '1',
        title: 'Max Out 401(k) Contributions',
        description: 'Contribute the maximum $22,500 to reduce taxable income',
        potentialSavings: 4950,
        difficulty: 'easy',
        category: 'Retirement',
        deadline: new Date('2024-12-31').toISOString(),
        implemented: false,
        priority: 'high',
        actionItems: [
          'Contact HR to increase contribution percentage',
          'Review current contribution rate',
          'Calculate impact on take-home pay'
        ]
      },
      {
        id: '2',
        title: 'Contribute to HSA',
        description: 'Triple tax advantage: deductible, tax-free growth, tax-free withdrawals',
        potentialSavings: 825,
        difficulty: 'easy',
        category: 'Healthcare',
        deadline: new Date('2025-04-15').toISOString(),
        implemented: taxProfile?.has_hsa || false,
        priority: 'high',
        actionItems: [
          'Verify HSA eligibility',
          'Open HSA account',
          'Set up automatic contributions'
        ]
      },
      {
        id: '3',
        title: 'Tax Loss Harvesting',
        description: 'Sell underperforming investments to offset capital gains',
        potentialSavings: 1200,
        difficulty: 'medium',
        category: 'Investments',
        deadline: new Date('2024-12-31').toISOString(),
        implemented: false,
        priority: 'medium',
        actionItems: [
          'Review investment portfolio',
          'Identify loss positions',
          'Calculate wash sale implications'
        ]
      },
      {
        id: '4',
        title: 'Bunch Charitable Donations',
        description: 'Combine 2 years of donations to exceed standard deduction',
        potentialSavings: 800,
        difficulty: 'medium',
        category: 'Charity',
        deadline: new Date('2024-12-31').toISOString(),
        implemented: false,
        priority: 'medium',
        actionItems: [
          'Calculate total planned donations',
          'Research donor-advised funds',
          'Get donation receipts'
        ]
      },
      {
        id: '5',
        title: 'Start a Side Business',
        description: 'Deduct business expenses and qualify for QBI deduction',
        potentialSavings: 1500,
        difficulty: 'hard',
        category: 'Business',
        deadline: null,
        implemented: false,
        priority: 'low',
        actionItems: [
          'Research business structure options',
          'Track business expenses',
          'Open business bank account'
        ]
      },
      {
        id: '6',
        title: 'Maximize Education Credits',
        description: 'Claim American Opportunity or Lifetime Learning Credit',
        potentialSavings: 2500,
        difficulty: 'easy',
        category: 'Education',
        deadline: new Date('2025-04-15').toISOString(),
        implemented: false,
        priority: 'high',
        actionItems: [
          'Gather education expense receipts',
          'Verify eligibility requirements',
          'Complete Form 8863'
        ]
      }
    ];

    // Filter and sort strategies based on user profile
    const applicableStrategies = strategies
      .filter(strategy => {
        // Filter based on user's situation
        if (strategy.category === 'Retirement' && !accounts?.some(a => a.subtype === '401k')) {
          return false;
        }
        return true;
      })
      .sort((a, b) => {
        // Sort by priority and potential savings
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
        if (priorityDiff !== 0) return priorityDiff;
        return b.potentialSavings - a.potentialSavings;
      });

    return NextResponse.json({
      strategies: applicableStrategies,
      totalPotentialSavings: applicableStrategies
        .filter(s => !s.implemented)
        .reduce((sum, s) => sum + s.potentialSavings, 0)
    });
  } catch (error) {
    console.error('Error in GET /api/v1/tax/strategies:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/v1/tax/strategies/:id/implement - Mark strategy as implemented
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { strategyId, implemented, notes } = body;

    // Record strategy implementation
    const { data, error } = await supabase
      .from('tax_strategy_implementations')
      .upsert({
        user_id: user.id,
        strategy_id: strategyId,
        implemented,
        implementation_date: implemented ? new Date().toISOString() : null,
        notes,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Error updating strategy:', error);
      return NextResponse.json({ error: 'Failed to update strategy' }, { status: 500 });
    }

    return NextResponse.json({ success: true, implementation: data });
  } catch (error) {
    console.error('Error in POST /api/v1/tax/strategies/:id/implement:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}