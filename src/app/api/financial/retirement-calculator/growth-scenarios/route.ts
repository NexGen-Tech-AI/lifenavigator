import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const growthScenarios = {
    conservative: {
      name: 'Conservative',
      description: 'Lower risk with stable returns',
      expectedReturn: 0.05,
      standardDeviation: 0.08,
      assetAllocation: {
        stocks: 30,
        bonds: 60,
        cash: 10
      }
    },
    moderate: {
      name: 'Moderate',
      description: 'Balanced risk and return',
      expectedReturn: 0.07,
      standardDeviation: 0.12,
      assetAllocation: {
        stocks: 50,
        bonds: 40,
        cash: 10
      }
    },
    aggressive: {
      name: 'Aggressive',
      description: 'Higher risk for potentially higher returns',
      expectedReturn: 0.09,
      standardDeviation: 0.18,
      assetAllocation: {
        stocks: 70,
        bonds: 25,
        cash: 5
      }
    },
    veryAggressive: {
      name: 'Very Aggressive',
      description: 'Maximum growth potential with high volatility',
      expectedReturn: 0.11,
      standardDeviation: 0.25,
      assetAllocation: {
        stocks: 85,
        bonds: 10,
        cash: 5
      }
    }
  };
  
  return NextResponse.json({
    success: true,
    scenarios: growthScenarios,
    historicalContext: {
      sp500AverageReturn: 0.10,
      bondAverageReturn: 0.05,
      inflationAverage: 0.025,
      note: 'Historical returns do not guarantee future performance'
    }
  });
}