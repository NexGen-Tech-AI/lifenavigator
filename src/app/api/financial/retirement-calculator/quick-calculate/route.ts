import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const QuickRetirementSchema = z.object({
  current_age: z.number().min(18).max(100),
  retirement_age: z.number().min(50).max(100),
  current_savings: z.number().min(0),
  monthly_contribution: z.number().min(0),
  current_annual_income: z.number().min(0),
  expected_return_rate: z.number().min(0).max(0.3).optional().default(0.07),
  inflation_rate: z.number().min(0).max(0.1).optional().default(0.025),
  retirement_income_replacement: z.number().min(0.1).max(1.5).optional().default(0.8),
  life_expectancy: z.number().min(65).max(120).optional().default(90),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const params = QuickRetirementSchema.parse(body);
    
    const {
      current_age,
      retirement_age,
      current_savings,
      monthly_contribution,
      current_annual_income,
      expected_return_rate,
      inflation_rate,
      retirement_income_replacement,
      life_expectancy
    } = params;
    
    // Validate ages
    if (retirement_age <= current_age) {
      return NextResponse.json(
        { error: 'Retirement age must be greater than current age' },
        { status: 400 }
      );
    }
    
    // Calculate years to retirement and in retirement
    const yearsToRetirement = retirement_age - current_age;
    const yearsInRetirement = life_expectancy - retirement_age;
    
    // Monthly calculations
    const monthlyReturn = expected_return_rate / 12;
    const monthsToRetirement = yearsToRetirement * 12;
    
    // Calculate future value of current savings and monthly contributions
    let futureValueSavings = current_savings * Math.pow(1 + expected_return_rate, yearsToRetirement);
    
    // Future value of monthly contributions (annuity formula)
    let futureValueContributions = 0;
    if (monthlyReturn > 0) {
      futureValueContributions = monthly_contribution * 
        ((Math.pow(1 + monthlyReturn, monthsToRetirement) - 1) / monthlyReturn);
    } else {
      futureValueContributions = monthly_contribution * monthsToRetirement;
    }
    
    const totalRetirementSavings = futureValueSavings + futureValueContributions;
    
    // Calculate required retirement income (adjusted for inflation)
    const inflationFactor = Math.pow(1 + inflation_rate, yearsToRetirement);
    const requiredAnnualIncome = current_annual_income * retirement_income_replacement * inflationFactor;
    const requiredMonthlyIncome = requiredAnnualIncome / 12;
    
    // Calculate how long savings will last (using present value of annuity)
    const realReturnRate = ((1 + expected_return_rate) / (1 + inflation_rate)) - 1;
    const monthlyRealReturn = realReturnRate / 12;
    
    let monthsSavingsWillLast = 0;
    if (monthlyRealReturn > 0) {
      monthsSavingsWillLast = Math.log(
        1 / (1 - (totalRetirementSavings * monthlyRealReturn) / requiredMonthlyIncome)
      ) / Math.log(1 + monthlyRealReturn);
    } else {
      monthsSavingsWillLast = totalRetirementSavings / requiredMonthlyIncome;
    }
    
    const yearsSavingsWillLast = monthsSavingsWillLast / 12;
    
    // Calculate if there's a shortfall
    const hasShortfall = yearsSavingsWillLast < yearsInRetirement;
    const shortfallYears = hasShortfall ? yearsInRetirement - yearsSavingsWillLast : 0;
    
    // Calculate required additional monthly savings to meet goal
    let requiredAdditionalMonthlySavings = 0;
    if (hasShortfall) {
      const requiredTotalSavings = requiredAnnualIncome * yearsInRetirement * 0.8; // Rough estimate
      const additionalNeeded = requiredTotalSavings - totalRetirementSavings;
      
      if (monthlyReturn > 0) {
        requiredAdditionalMonthlySavings = additionalNeeded * monthlyReturn / 
          (Math.pow(1 + monthlyReturn, monthsToRetirement) - 1);
      } else {
        requiredAdditionalMonthlySavings = additionalNeeded / monthsToRetirement;
      }
    }
    
    // Generate yearly projections
    const projections = [];
    let currentBalance = current_savings;
    
    for (let year = 0; year <= yearsToRetirement; year++) {
      if (year > 0) {
        currentBalance = currentBalance * (1 + expected_return_rate) + (monthly_contribution * 12);
      }
      
      projections.push({
        age: current_age + year,
        year,
        balance: Math.round(currentBalance),
        contributions: Math.round((current_savings + monthly_contribution * 12 * year)),
        growth: Math.round(currentBalance - (current_savings + monthly_contribution * 12 * year))
      });
    }
    
    return NextResponse.json({
      success: true,
      summary: {
        yearsToRetirement,
        monthlyContribution: Math.round(monthly_contribution),
        projectedRetirementSavings: Math.round(totalRetirementSavings),
        requiredMonthlyIncome: Math.round(requiredMonthlyIncome),
        yearsSavingsWillLast: Math.round(yearsSavingsWillLast * 10) / 10,
        hasShortfall,
        shortfallYears: Math.round(shortfallYears * 10) / 10,
        requiredAdditionalMonthlySavings: Math.round(requiredAdditionalMonthlySavings),
        totalRequiredMonthlySavings: Math.round(monthly_contribution + requiredAdditionalMonthlySavings)
      },
      projections,
      assumptions: {
        expectedReturnRate: expected_return_rate * 100,
        inflationRate: inflation_rate * 100,
        retirementIncomeReplacement: retirement_income_replacement * 100,
        lifeExpectancy: life_expectancy
      }
    });
    
  } catch (error) {
    console.error('Retirement calculation error:', error);
    
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