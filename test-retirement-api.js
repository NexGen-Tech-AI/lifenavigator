// Test script for Advanced Retirement Calculator API

async function testRetirementCalculator() {
  const testInputs = {
    currentAge: 30,
    retirementAge: 65,
    currentSavings: 50000,
    monthlyContribution: 1000,
    expectedAnnualReturn: 0.07,
    riskTolerance: 2,
    inflationRate: 0.025,
    socialSecurityIncome: 24000,
    currentAnnualIncome: 75000,
    incomeReplacementGoal: 0.8,
    contributionIncreaseRate: 0.03,
    withdrawalRate: 0.04,
    taxRate: 0.22,
    compoundingFrequency: 12,
    volatility: 0.15,
    riskFreeRate: 0.025,
    downSideDeviation: 0.12,
    healthcareCosts: 5000,
    healthcareInflation: 0.05,
    emergencyFund: 25000,
    otherRetirementAccounts: 0,
    pensionIncome: 0,
    partTimeIncomeYears: 0,
    partTimeIncome: 0
  };

  try {
    const response = await fetch('http://localhost:3001/api/financial/retirement-calculator/advanced', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testInputs)
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('API Error:', error);
      return;
    }

    const result = await response.json();
    
    console.log('=== Advanced Retirement Calculator Test Results ===\n');
    console.log('Input Parameters:');
    console.log(`- Current Age: ${testInputs.currentAge}`);
    console.log(`- Retirement Age: ${testInputs.retirementAge}`);
    console.log(`- Years to Retirement: ${testInputs.retirementAge - testInputs.currentAge}`);
    console.log(`- Current Savings: $${testInputs.currentSavings.toLocaleString()}`);
    console.log(`- Monthly Contribution: $${testInputs.monthlyContribution.toLocaleString()}`);
    console.log(`- Expected Return: ${(testInputs.expectedAnnualReturn * 100).toFixed(1)}%`);
    console.log(`- Compounding Frequency: ${testInputs.compoundingFrequency === 12 ? 'Monthly' : testInputs.compoundingFrequency}`);
    
    console.log('\n=== Calculation Results ===\n');
    console.log('Core Metrics:');
    console.log(`- Total at Retirement: $${result.calculations.totalAtRetirement.toLocaleString()}`);
    console.log(`- Monthly Income in Retirement: $${result.calculations.monthlyIncome.toLocaleString()}`);
    console.log(`- Income Replacement Ratio: ${result.calculations.incomeReplacementRatio}%`);
    console.log(`- Portfolio Longevity: ${result.calculations.portfolioLongevity} years`);
    console.log(`- Meets Income Goal: ${result.calculations.meetsIncomeGoal ? 'Yes ✅' : 'No ❌'}`);
    
    console.log('\nContribution Breakdown:');
    console.log(`- Future Value of Current Savings: $${result.calculations.futureValueCurrentSavings.toLocaleString()}`);
    console.log(`- Future Value of Contributions: $${result.calculations.futureValueContributions.toLocaleString()}`);
    
    console.log('\nRisk Metrics:');
    console.log(`- Sharpe Ratio: ${result.calculations.sharpeRatio}`);
    console.log(`- Sortino Ratio: ${result.calculations.sortinoRatio}`);
    console.log(`- Portfolio Beta: ${result.calculations.portfolioBeta}`);
    console.log(`- Value at Risk (5%): ${result.calculations.valueAtRisk}%`);
    console.log(`- Max Drawdown: ${result.calculations.maxDrawdown}%`);
    
    console.log('\nMonte Carlo Simulation:');
    console.log(`- Success Rate: ${result.calculations.monteCarloResults.successRate.toFixed(1)}%`);
    console.log(`- Median Outcome: $${result.calculations.monteCarloResults.median.toLocaleString()}`);
    
    console.log('\nCompounding Effect Analysis:');
    result.calculations.compoundingEffect.forEach(effect => {
      console.log(`- ${effect.frequency}: $${effect.value.toLocaleString()} (${effect.difference >= 0 ? '+' : ''}$${effect.difference.toLocaleString()} vs annual)`);
    });
    
    console.log('\nKey Insights:');
    result.calculations.insights.forEach(insight => {
      console.log(`- ${insight}`);
    });
    
    console.log('\n=== Test Verification ===\n');
    
    // Verify compounding calculation
    const years = testInputs.retirementAge - testInputs.currentAge;
    const compoundingRate = testInputs.expectedAnnualReturn / testInputs.compoundingFrequency;
    const periods = testInputs.compoundingFrequency * years;
    const expectedFutureValue = testInputs.currentSavings * Math.pow(1 + compoundingRate, periods);
    
    console.log('Compounding Verification:');
    console.log(`- Expected FV of Current Savings: $${Math.round(expectedFutureValue).toLocaleString()}`);
    console.log(`- Calculated FV of Current Savings: $${result.calculations.futureValueCurrentSavings.toLocaleString()}`);
    console.log(`- Match: ${Math.abs(expectedFutureValue - result.calculations.futureValueCurrentSavings) < 1 ? 'Yes ✅' : 'No ❌'}`);
    
    // Verify total calculation
    const total = result.calculations.futureValueCurrentSavings + result.calculations.futureValueContributions;
    console.log('\nTotal Verification:');
    console.log(`- Sum of components: $${Math.round(total).toLocaleString()}`);
    console.log(`- Reported total: $${result.calculations.totalAtRetirement.toLocaleString()}`);
    console.log(`- Match: ${Math.abs(total - result.calculations.totalAtRetirement) < 1 ? 'Yes ✅' : 'No ❌'}`);

  } catch (error) {
    console.error('Test failed:', error);
  }
}

// Run the test
testRetirementCalculator();