import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const ContributionStrategySchema = z.object({
  name: z.string(),
  initial_amount: z.number().min(0),
  frequency: z.enum(['monthly', 'quarterly', 'annually']),
  increase_type: z.enum(['fixed', 'percentage', 'none']),
  annual_increase_amount: z.number().min(0).optional(),
  annual_increase_percentage: z.number().min(0).max(1).optional(),
  max_contribution_limit: z.number().min(0).optional(),
  start_age: z.number().min(18).max(100).optional(),
  end_age: z.number().min(18).max(100).optional(),
});

const DetailedRetirementSchema = z.object({
  current_age: z.number().min(18).max(100),
  retirement_age: z.number().min(50).max(100),
  current_savings: z.number().min(0),
  current_annual_income: z.number().min(0),
  contribution_strategies: z.array(ContributionStrategySchema),
  expected_return_rate: z.number().min(-0.1).max(0.3).optional().default(0.07),
  inflation_rate: z.number().min(0).max(0.1).optional().default(0.025),
  retirement_income_replacement: z.number().min(0.1).max(1.5).optional().default(0.8),
  life_expectancy: z.number().min(65).max(120).optional().default(90),
  risk_tolerance: z.enum(['conservative', 'moderate', 'aggressive']).optional().default('moderate'),
  include_social_security: z.boolean().optional().default(true),
  estimated_social_security_benefit: z.number().min(0).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const params = DetailedRetirementSchema.parse(body);
    
    const {
      current_age,
      retirement_age,
      current_savings,
      current_annual_income,
      contribution_strategies,
      expected_return_rate,
      inflation_rate,
      retirement_income_replacement,
      life_expectancy,
      risk_tolerance,
      include_social_security,
      estimated_social_security_benefit
    } = params;
    
    // Validate ages
    if (retirement_age <= current_age) {
      return NextResponse.json(
        { error: 'Retirement age must be greater than current age' },
        { status: 400 }
      );
    }
    
    // Adjust return rate based on risk tolerance
    const riskAdjustments = {
      conservative: -0.02,
      moderate: 0,
      aggressive: 0.02
    };
    const adjustedReturnRate = expected_return_rate + riskAdjustments[risk_tolerance];
    
    // Calculate years to retirement and in retirement
    const yearsToRetirement = retirement_age - current_age;
    const yearsInRetirement = life_expectancy - retirement_age;
    
    // Generate detailed yearly projections
    const projections = [];
    let currentBalance = current_savings;
    let totalContributions = current_savings;
    
    for (let year = 0; year <= yearsToRetirement + yearsInRetirement; year++) {
      const age = current_age + year;
      const isRetired = age >= retirement_age;
      
      // Calculate contributions for this year
      let yearlyContribution = 0;
      
      if (!isRetired) {
        contribution_strategies.forEach(strategy => {
          const strategyStartAge = strategy.start_age || current_age;
          const strategyEndAge = strategy.end_age || retirement_age;
          
          if (age >= strategyStartAge && age < strategyEndAge) {
            // Calculate contribution amount with increases
            let contributionAmount = strategy.initial_amount;
            const yearsInStrategy = age - strategyStartAge;
            
            if (strategy.increase_type === 'fixed' && strategy.annual_increase_amount) {
              contributionAmount += strategy.annual_increase_amount * yearsInStrategy;
            } else if (strategy.increase_type === 'percentage' && strategy.annual_increase_percentage) {
              contributionAmount *= Math.pow(1 + strategy.annual_increase_percentage, yearsInStrategy);
            }
            
            // Apply contribution limit if specified
            if (strategy.max_contribution_limit) {
              contributionAmount = Math.min(contributionAmount, strategy.max_contribution_limit);
            }
            
            // Convert to yearly based on frequency
            const frequencyMultiplier = {
              monthly: 12,
              quarterly: 4,
              annually: 1
            };
            
            yearlyContribution += contributionAmount * frequencyMultiplier[strategy.frequency];
          }
        });
      }
      
      // Apply returns
      if (year > 0) {
        currentBalance *= (1 + adjustedReturnRate);
      }
      
      // Add contributions or withdrawals
      if (!isRetired) {
        currentBalance += yearlyContribution;
        totalContributions += yearlyContribution;
      } else {
        // Calculate withdrawal amount
        const inflationFactor = Math.pow(1 + inflation_rate, year - yearsToRetirement);
        const requiredIncome = current_annual_income * retirement_income_replacement * inflationFactor;
        
        // Subtract Social Security if included
        let withdrawal = requiredIncome;
        if (include_social_security) {
          const ssAmount = estimated_social_security_benefit || (current_annual_income * 0.4);
          withdrawal -= ssAmount * inflationFactor;
        }
        
        currentBalance -= Math.max(0, withdrawal);
      }
      
      projections.push({
        age,
        year,
        isRetired,
        balance: Math.round(currentBalance),
        contribution: Math.round(yearlyContribution),
        totalContributions: Math.round(totalContributions),
        growth: Math.round(currentBalance - totalContributions)
      });
      
      // Stop if balance goes negative
      if (currentBalance < 0) break;
    }
    
    // Calculate key metrics
    const retirementBalance = projections.find(p => p.age === retirement_age)?.balance || 0;
    const finalProjection = projections[projections.length - 1];
    const ranOutOfMoney = finalProjection.balance < 0;
    const ageWhenMoneyRunsOut = ranOutOfMoney ? finalProjection.age : null;
    
    // Monte Carlo simulation for confidence intervals
    const simulations = 1000;
    const outcomes = [];
    
    for (let sim = 0; sim < simulations; sim++) {
      let simBalance = current_savings;
      const returnVolatility = 0.15; // 15% standard deviation
      
      for (let year = 0; year < yearsToRetirement; year++) {
        // Random return based on normal distribution
        const randomReturn = adjustedReturnRate + (Math.random() - 0.5) * returnVolatility;
        simBalance *= (1 + randomReturn);
        
        // Add contributions (simplified)
        const avgYearlyContribution = totalContributions / yearsToRetirement;
        simBalance += avgYearlyContribution;
      }
      
      outcomes.push(simBalance);
    }
    
    outcomes.sort((a, b) => a - b);
    const percentile10 = outcomes[Math.floor(simulations * 0.1)];
    const percentile50 = outcomes[Math.floor(simulations * 0.5)];
    const percentile90 = outcomes[Math.floor(simulations * 0.9)];
    
    return NextResponse.json({
      success: true,
      summary: {
        currentAge: current_age,
        retirementAge: retirement_age,
        yearsToRetirement,
        projectedRetirementBalance: Math.round(retirementBalance),
        totalContributions: Math.round(totalContributions),
        totalGrowth: Math.round(retirementBalance - totalContributions),
        monthsRetirementWillLast: ranOutOfMoney ? (ageWhenMoneyRunsOut - retirement_age) * 12 : (life_expectancy - retirement_age) * 12,
        ageWhenMoneyRunsOut,
        hasShortfall: ranOutOfMoney,
        confidenceIntervals: {
          low: Math.round(percentile10),
          median: Math.round(percentile50),
          high: Math.round(percentile90)
        }
      },
      projections: projections.filter((p, i) => i === 0 || i % 5 === 0 || p.age === retirement_age || p === finalProjection),
      contributionStrategies: contribution_strategies,
      assumptions: {
        expectedReturnRate: adjustedReturnRate * 100,
        inflationRate: inflation_rate * 100,
        retirementIncomeReplacement: retirement_income_replacement * 100,
        lifeExpectancy: life_expectancy,
        riskTolerance: risk_tolerance,
        includeSocialSecurity: include_social_security
      }
    });
    
  } catch (error) {
    console.error('Detailed retirement calculation error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to calculate retirement projections' },
      { status: 500 }
    );
  }
}