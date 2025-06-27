import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const AdvancedRetirementSchema = z.object({
  currentAge: z.number().min(18).max(100),
  retirementAge: z.number().min(50).max(100),
  currentSavings: z.number().min(0),
  monthlyContribution: z.number().min(0),
  expectedAnnualReturn: z.number().min(-0.1).max(0.5),
  riskTolerance: z.number().min(1).max(3),
  inflationRate: z.number().min(0).max(0.2),
  socialSecurityIncome: z.number().min(0),
  currentAnnualIncome: z.number().min(0),
  incomeReplacementGoal: z.number().min(0.1).max(2),
  contributionIncreaseRate: z.number().min(0).max(0.2),
  withdrawalRate: z.number().min(0.01).max(0.1),
  taxRate: z.number().min(0).max(0.5),
  compoundingFrequency: z.number().min(1).max(365),
  volatility: z.number().min(0).max(0.5),
  riskFreeRate: z.number().min(0).max(0.1),
  downSideDeviation: z.number().min(0).max(0.3),
  healthcareCosts: z.number().min(0),
  healthcareInflation: z.number().min(0).max(0.2),
  emergencyFund: z.number().min(0),
  otherRetirementAccounts: z.number().min(0),
  pensionIncome: z.number().min(0),
  partTimeIncomeYears: z.number().min(0).max(20),
  partTimeIncome: z.number().min(0),
  lifeExpectancy: z.number().min(65).max(120).optional().default(90),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const inputs = AdvancedRetirementSchema.parse(body);
    
    // Validate ages
    if (inputs.retirementAge <= inputs.currentAge) {
      return NextResponse.json(
        { error: 'Retirement age must be greater than current age' },
        { status: 400 }
      );
    }
    
    const calculations = calculateAdvancedRetirement(inputs);
    
    return NextResponse.json({
      success: true,
      calculations,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Advanced retirement calculation error:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to calculate retirement projections', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

function calculateAdvancedRetirement(inputs: z.infer<typeof AdvancedRetirementSchema>) {
  const {
    currentAge, retirementAge, currentSavings, monthlyContribution,
    expectedAnnualReturn, riskTolerance, inflationRate, socialSecurityIncome,
    currentAnnualIncome, incomeReplacementGoal, contributionIncreaseRate,
    withdrawalRate, taxRate, compoundingFrequency, volatility, riskFreeRate,
    downSideDeviation, healthcareCosts, healthcareInflation, pensionIncome, lifeExpectancy
  } = inputs;

  const yearsToRetirement = retirementAge - currentAge;
  const yearsInRetirement = lifeExpectancy - retirementAge;
  const adjustedReturn = adjustReturnForRisk(expectedAnnualReturn, riskTolerance);
  
  // Enhanced compounding calculation
  const compoundingRate = adjustedReturn / compoundingFrequency;
  const compoundingPeriods = compoundingFrequency * yearsToRetirement;
  
  // Future value of current savings with selected compounding frequency
  const futureValueCurrentSavings = currentSavings * Math.pow(1 + compoundingRate, compoundingPeriods);
  
  // Future value of contributions with growth
  let futureValueContributions = 0;
  let currentMonthlyContrib = monthlyContribution;
  
  for (let year = 0; year < yearsToRetirement; year++) {
    const annualContrib = currentMonthlyContrib * 12;
    const yearsRemaining = yearsToRetirement - year;
    const compoundingPeriodsRemaining = compoundingFrequency * yearsRemaining;
    const futureValueThisYear = annualContrib * Math.pow(1 + compoundingRate, compoundingPeriodsRemaining);
    
    futureValueContributions += futureValueThisYear;
    currentMonthlyContrib *= (1 + contributionIncreaseRate);
  }

  const totalAtRetirement = futureValueCurrentSavings + futureValueContributions;
  
  // Income calculations
  const annualWithdrawal = totalAtRetirement * withdrawalRate;
  const monthlyWithdrawal = annualWithdrawal / 12;
  const afterTaxMonthlyIncome = monthlyWithdrawal * (1 - taxRate);
  const totalMonthlyIncome = afterTaxMonthlyIncome + (socialSecurityIncome / 12) + (pensionIncome / 12);
  
  // Risk metrics calculations
  const excessReturn = adjustedReturn - riskFreeRate;
  const sharpeRatio = volatility > 0 ? excessReturn / volatility : 0;
  const sortinoRatio = downSideDeviation > 0 ? excessReturn / downSideDeviation : 0;
  const portfolioBeta = volatility / 0.15; // Assuming market volatility of 15%
  
  // Value at Risk (5% worst case) - using normal distribution approximation
  const valueAtRisk = ((adjustedReturn - 1.645 * volatility) * 100);
  const maxDrawdown = volatility * 2.5 * 100; // Simplified max drawdown estimate
  
  // Portfolio longevity calculation with inflation
  const portfolioLongevity = calculatePortfolioLongevity(
    totalAtRetirement, 
    annualWithdrawal, 
    adjustedReturn, 
    inflationRate,
    healthcareCosts,
    healthcareInflation
  );
  
  // Income replacement calculation
  const inflationAdjustedCurrentIncome = currentAnnualIncome * Math.pow(1 + inflationRate, yearsToRetirement);
  const incomeReplacementRatio = (totalMonthlyIncome * 12 / inflationAdjustedCurrentIncome) * 100;
  
  // Additional risk metrics
  const calmarRatio = maxDrawdown > 0 ? (adjustedReturn * 100) / maxDrawdown : 0;
  const treynorRatio = portfolioBeta > 0 ? excessReturn / portfolioBeta : 0;
  const informationRatio = sharpeRatio * 0.8; // Simplified approximation
  
  // Monte Carlo simulation results
  const monteCarloResults = runMonteCarloSimulation(
    currentSavings,
    monthlyContribution,
    contributionIncreaseRate,
    yearsToRetirement,
    adjustedReturn,
    volatility,
    compoundingFrequency
  );
  
  // Generate yearly projections
  const projections = generateProjections(inputs, adjustedReturn);
  
  // Generate insights
  const insights = generateInsights({
    totalAtRetirement,
    incomeReplacementRatio,
    incomeReplacementGoal: incomeReplacementGoal * 100,
    portfolioLongevity,
    sharpeRatio,
    valueAtRisk,
    yearsToRetirement,
    monthlyContribution,
    currentSavings
  });

  // Advanced metrics for table
  const advancedMetrics = [
    { 
      name: 'Sharpe Ratio', 
      value: sharpeRatio.toFixed(2), 
      interpretation: sharpeRatio > 1 ? 'Excellent risk-adjusted returns' : sharpeRatio > 0.5 ? 'Good risk-adjusted returns' : 'Poor risk-adjusted returns' 
    },
    { 
      name: 'Sortino Ratio', 
      value: sortinoRatio.toFixed(2), 
      interpretation: sortinoRatio > 1 ? 'Excellent downside protection' : 'Moderate downside protection' 
    },
    { 
      name: 'Information Ratio', 
      value: informationRatio.toFixed(2), 
      interpretation: 'Measures active return vs tracking error' 
    },
    { 
      name: 'Calmar Ratio', 
      value: calmarRatio.toFixed(2), 
      interpretation: 'Annual return vs maximum drawdown' 
    },
    { 
      name: 'Treynor Ratio', 
      value: treynorRatio.toFixed(2), 
      interpretation: 'Excess return per unit of systematic risk' 
    },
    {
      name: 'Portfolio Beta',
      value: portfolioBeta.toFixed(2),
      interpretation: portfolioBeta > 1 ? 'More volatile than market' : 'Less volatile than market'
    },
    {
      name: 'Real Return Rate',
      value: ((adjustedReturn - inflationRate) * 100).toFixed(2) + '%',
      interpretation: 'Return after inflation adjustment'
    },
    {
      name: 'Success Probability',
      value: monteCarloResults.successRate.toFixed(1) + '%',
      interpretation: 'Chance of meeting retirement goals'
    }
  ];

  return {
    totalAtRetirement: Math.round(totalAtRetirement),
    monthlyIncome: Math.round(totalMonthlyIncome),
    annualIncome: Math.round(totalMonthlyIncome * 12),
    incomeReplacementRatio: Math.round(incomeReplacementRatio * 10) / 10,
    meetsIncomeGoal: incomeReplacementRatio >= (incomeReplacementGoal * 100),
    portfolioLongevity,
    futureValueCurrentSavings: Math.round(futureValueCurrentSavings),
    futureValueContributions: Math.round(futureValueContributions),
    adjustedAnnualReturn: Math.round(adjustedReturn * 1000) / 10,
    sharpeRatio: Math.round(sharpeRatio * 100) / 100,
    sortinoRatio: Math.round(sortinoRatio * 100) / 100,
    portfolioBeta: Math.round(portfolioBeta * 100) / 100,
    valueAtRisk: Math.round(valueAtRisk * 10) / 10,
    maxDrawdown: Math.round(maxDrawdown * 10) / 10,
    calmarRatio: Math.round(calmarRatio * 100) / 100,
    treynorRatio: Math.round(treynorRatio * 100) / 100,
    informationRatio: Math.round(informationRatio * 100) / 100,
    monteCarloResults,
    projections,
    insights,
    advancedMetrics,
    compoundingEffect: calculateCompoundingEffect(inputs),
    sensitivityAnalysis: performSensitivityAnalysis(inputs)
  };
}

function adjustReturnForRisk(expectedReturn: number, riskTolerance: number): number {
  const riskAdjustments: Record<number, number> = { 1: -0.015, 2: 0, 3: 0.01 };
  return Math.max(0.01, expectedReturn + (riskAdjustments[riskTolerance] || 0));
}

function calculatePortfolioLongevity(
  initialAmount: number, 
  annualWithdrawal: number, 
  returnRate: number, 
  inflationRate: number,
  healthcareCosts: number,
  healthcareInflation: number
): number {
  let portfolio = initialAmount;
  let years = 0;
  let currentWithdrawal = annualWithdrawal;
  let currentHealthcareCosts = healthcareCosts;
  
  while (portfolio > 0 && years < 50) {
    portfolio = portfolio * (1 + returnRate) - currentWithdrawal - currentHealthcareCosts;
    currentWithdrawal *= (1 + inflationRate);
    currentHealthcareCosts *= (1 + healthcareInflation);
    years++;
  }
  
  return years >= 50 ? 50 : years;
}

function runMonteCarloSimulation(
  currentSavings: number,
  monthlyContribution: number,
  contributionIncreaseRate: number,
  yearsToRetirement: number,
  expectedReturn: number,
  volatility: number,
  compoundingFrequency: number
): any {
  const simulations = 1000;
  const outcomes: number[] = [];
  let successCount = 0;
  const targetAmount = currentSavings * 25; // 4% withdrawal rate rule
  
  for (let sim = 0; sim < simulations; sim++) {
    let balance = currentSavings;
    let currentContribution = monthlyContribution;
    
    for (let year = 0; year < yearsToRetirement; year++) {
      // Generate random return using normal distribution
      const randomFactor = Math.sqrt(-2.0 * Math.log(Math.random())) * Math.cos(2.0 * Math.PI * Math.random());
      const annualReturn = expectedReturn + volatility * randomFactor;
      
      // Apply compounding
      const compoundingRate = annualReturn / compoundingFrequency;
      balance *= Math.pow(1 + compoundingRate, compoundingFrequency);
      
      // Add contributions
      balance += currentContribution * 12;
      currentContribution *= (1 + contributionIncreaseRate);
    }
    
    outcomes.push(balance);
    if (balance >= targetAmount) successCount++;
  }
  
  // Sort outcomes for percentile calculations
  outcomes.sort((a, b) => a - b);
  
  const percentiles = [];
  for (let i = 5; i <= 95; i += 5) {
    const index = Math.floor((i / 100) * simulations);
    percentiles.push({
      percentile: `${i}th`,
      value: Math.round(outcomes[index])
    });
  }
  
  return {
    percentiles,
    successRate: (successCount / simulations) * 100,
    median: outcomes[Math.floor(simulations / 2)],
    mean: outcomes.reduce((a, b) => a + b, 0) / simulations,
    standardDeviation: Math.sqrt(
      outcomes.reduce((sq, n) => sq + Math.pow(n - outcomes.reduce((a, b) => a + b, 0) / simulations, 2), 0) / simulations
    )
  };
}

function generateProjections(inputs: any, adjustedReturn: number): any[] {
  const projections = [];
  let balance = inputs.currentSavings;
  let monthlyContrib = inputs.monthlyContribution;
  let totalContributions = inputs.currentSavings;
  
  for (let year = 0; year <= inputs.lifeExpectancy - inputs.currentAge; year++) {
    const age = inputs.currentAge + year;
    const isRetired = age >= inputs.retirementAge;
    
    if (year > 0) {
      if (!isRetired) {
        // Apply returns and add contributions
        const compoundingRate = adjustedReturn / inputs.compoundingFrequency;
        balance *= Math.pow(1 + compoundingRate, inputs.compoundingFrequency);
        
        const annualContrib = monthlyContrib * 12;
        balance += annualContrib;
        totalContributions += annualContrib;
        
        monthlyContrib *= (1 + inputs.contributionIncreaseRate);
      } else {
        // In retirement - withdrawals
        balance *= (1 + adjustedReturn);
        
        const inflationFactor = Math.pow(1 + inputs.inflationRate, year - (inputs.retirementAge - inputs.currentAge));
        const requiredIncome = inputs.currentAnnualIncome * inputs.incomeReplacementGoal * inflationFactor;
        const totalIncome = (inputs.socialSecurityIncome + inputs.pensionIncome) * inflationFactor;
        const withdrawal = Math.max(0, requiredIncome - totalIncome);
        
        balance -= withdrawal;
      }
    }
    
    // Only include every 5 years plus retirement age
    if (year % 5 === 0 || age === inputs.retirementAge || age === inputs.lifeExpectancy) {
      projections.push({
        age,
        year,
        balance: Math.max(0, Math.round(balance)),
        totalContributions: Math.round(totalContributions),
        growth: Math.round(Math.max(0, balance - totalContributions)),
        isRetired
      });
    }
    
    if (balance <= 0) break;
  }
  
  return projections;
}

function calculateCompoundingEffect(inputs: any): any[] {
  const frequencies = [1, 4, 12, 365];
  const years = inputs.retirementAge - inputs.currentAge;
  
  return frequencies.map(freq => {
    const rate = inputs.expectedAnnualReturn / freq;
    const periods = freq * years;
    const futureValue = inputs.currentSavings * Math.pow(1 + rate, periods);
    
    return {
      frequency: freq === 1 ? 'Annual' : freq === 4 ? 'Quarterly' : freq === 12 ? 'Monthly' : 'Daily',
      frequencyValue: freq,
      value: Math.round(futureValue),
      difference: Math.round(futureValue - (inputs.currentSavings * Math.pow(1 + inputs.expectedAnnualReturn, years)))
    };
  });
}

function performSensitivityAnalysis(inputs: any): any[] {
  const baseReturn = inputs.expectedAnnualReturn;
  const variations = [-0.02, -0.01, 0, 0.01, 0.02];
  const years = inputs.retirementAge - inputs.currentAge;
  
  return variations.map(variation => {
    const adjustedReturn = baseReturn + variation;
    const futureValue = inputs.currentSavings * Math.pow(1 + adjustedReturn, years);
    
    // Add contribution growth
    let contribValue = 0;
    let monthlyContrib = inputs.monthlyContribution;
    for (let year = 0; year < years; year++) {
      contribValue += monthlyContrib * 12 * Math.pow(1 + adjustedReturn, years - year);
      monthlyContrib *= (1 + inputs.contributionIncreaseRate);
    }
    
    return {
      returnRate: (adjustedReturn * 100).toFixed(1) + '%',
      value: Math.round(futureValue + contribValue),
      difference: Math.round((futureValue + contribValue) - (inputs.currentSavings * Math.pow(1 + baseReturn, years)))
    };
  });
}

function generateInsights(data: any): string[] {
  const insights: string[] = [];
  
  // Income replacement insight
  if (data.incomeReplacementRatio >= data.incomeReplacementGoal) {
    insights.push(`✅ You're on track to meet your income replacement goal of ${data.incomeReplacementGoal}%!`);
  } else {
    const shortfall = data.incomeReplacementGoal - data.incomeReplacementRatio;
    const additionalNeeded = Math.round(shortfall * data.monthlyContribution / 10);
    insights.push(`⚠️ You're ${shortfall.toFixed(1)}% short of your income goal. Consider increasing monthly contributions by $${additionalNeeded}.`);
  }
  
  // Portfolio longevity insight
  if (data.portfolioLongevity >= 30) {
    insights.push("✅ Your portfolio should last through a typical retirement.");
  } else {
    insights.push(`⚠️ Your portfolio may only last ${data.portfolioLongevity} years. Consider reducing withdrawal rate or increasing savings.`);
  }
  
  // Risk-adjusted return insight
  if (data.sharpeRatio > 1) {
    insights.push("✅ Excellent risk-adjusted returns expected based on your portfolio.");
  } else if (data.sharpeRatio > 0.5) {
    insights.push("👍 Good risk-adjusted returns expected from your investment strategy.");
  } else {
    insights.push("⚠️ Consider adjusting your risk/return profile for better outcomes.");
  }
  
  // Value at risk insight
  if (data.valueAtRisk < -20) {
    insights.push("⚠️ High portfolio volatility detected - consider diversification to reduce risk.");
  }
  
  // Savings rate insight
  const savingsRate = (data.monthlyContribution * 12) / (data.currentSavings > 0 ? data.currentSavings : 1) * 100;
  if (savingsRate > 20) {
    insights.push("🌟 Excellent savings rate! You're aggressively building wealth.");
  } else if (savingsRate < 10) {
    insights.push("💡 Consider increasing your savings rate to accelerate retirement readiness.");
  }
  
  // Time to retirement insight
  if (data.yearsToRetirement <= 10) {
    insights.push("⏰ With retirement approaching soon, consider shifting to more conservative investments.");
  } else if (data.yearsToRetirement >= 30) {
    insights.push("🎯 You have time on your side - consider maximizing growth-oriented investments.");
  }
  
  // Milestone insight
  if (data.totalAtRetirement > 2000000) {
    insights.push("🎉 You're projected to be a multi-millionaire in retirement!");
  } else if (data.totalAtRetirement > 1000000) {
    insights.push("🎊 You're on track to join the millionaire's club by retirement!");
  }
  
  return insights;
}

export async function GET() {
  return NextResponse.json({
    message: 'Advanced Retirement Calculator API',
    endpoints: {
      calculate: {
        method: 'POST',
        path: '/api/financial/retirement-calculator/advanced',
        description: 'Calculate advanced retirement projections with risk metrics'
      }
    },
    requiredFields: [
      'currentAge', 'retirementAge', 'currentSavings', 'monthlyContribution',
      'expectedAnnualReturn', 'riskTolerance', 'inflationRate', 'currentAnnualIncome'
    ],
    optionalFields: [
      'socialSecurityIncome', 'incomeReplacementGoal', 'contributionIncreaseRate',
      'withdrawalRate', 'taxRate', 'compoundingFrequency', 'volatility',
      'riskFreeRate', 'downSideDeviation', 'healthcareCosts', 'healthcareInflation',
      'emergencyFund', 'otherRetirementAccounts', 'pensionIncome', 'partTimeIncomeYears',
      'partTimeIncome', 'lifeExpectancy'
    ]
  });
}