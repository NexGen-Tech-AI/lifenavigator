import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { FinancialHealthService } from '@/lib/services/financialHealthService';

// GET /api/v1/finance/health-score - Get current health score or calculate new one
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Demo mode - use a fixed user ID
    const demoUserId = 'demo-user-001';

    // Check for force recalculation parameter
    const { searchParams } = new URL(request.url);
    const forceRecalculate = searchParams.get('recalculate') === 'true';

    // Get current score if not forcing recalculation
    if (!forceRecalculate) {
      const { data: currentScore } = await supabase
        .from('financial_health_scores')
        .select('*')
        .eq('user_id', demoUserId)
        .eq('is_current', true)
        .single();

      if (currentScore) {
        // Check if score is less than 24 hours old
        const scoreAge = Date.now() - new Date(currentScore.calculated_at).getTime();
        const oneDayMs = 24 * 60 * 60 * 1000;

        if (scoreAge < oneDayMs) {
          // Get history
          const { data: history } = await supabase
            .from('financial_health_scores')
            .select('*')
            .eq('user_id', demoUserId)
            .order('calculated_at', { ascending: false })
            .limit(12);

          return NextResponse.json({
            score: {
              score: currentScore.score,
              grade: currentScore.grade,
              components: {
                emergencyFund: currentScore.emergency_fund_score,
                debtToIncome: currentScore.debt_to_income_score,
                creditUtilization: currentScore.credit_utilization_score,
                investmentRatio: currentScore.investment_ratio_score,
                incomeConsistency: currentScore.income_consistency_score,
                retirementContribution: currentScore.retirement_contribution_score,
                budgetCompliance: currentScore.budget_compliance_score,
              },
              recommendations: currentScore.recommendations || [],
              benchmarks: {
                nationalAverage: currentScore.national_average_score,
                ageGroupAverage: currentScore.age_group_average_score,
                peerPercentile: currentScore.peer_percentile,
              }
            },
            history: history || [],
            lastCalculated: currentScore.calculated_at
          });
        }
      }
    }

    // Calculate new score
    const healthService = new FinancialHealthService(supabase);
    const score = await healthService.calculateHealthScore(demoUserId);
    const history = await healthService.getScoreHistory(demoUserId);

    return NextResponse.json({
      score,
      history,
      lastCalculated: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error in GET /api/v1/finance/health-score:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/v1/finance/health-score - Force recalculation
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Demo mode - use a fixed user ID
    const demoUserId = 'demo-user-001';

    // Calculate new score
    const healthService = new FinancialHealthService(supabase);
    const score = await healthService.calculateHealthScore(demoUserId);
    const history = await healthService.getScoreHistory(demoUserId);

    return NextResponse.json({
      score,
      history,
      lastCalculated: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error in POST /api/v1/finance/health-score:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}