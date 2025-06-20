import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const InvestmentGrowthSchema = z.object({
  initialAmount: z.number().min(0),
  monthlyContribution: z.number().min(0),
  annualReturn: z.number().min(-1).max(1),
  years: z.number().min(1).max(100),
  inflationRate: z.number().min(0).max(0.2).optional().default(0.025),
  compoundingFrequency: z.enum(['monthly', 'quarterly', 'annually']).optional().default('monthly'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const params = InvestmentGrowthSchema.parse(body);
    
    const {
      initialAmount,
      monthlyContribution,
      annualReturn,
      years,
      inflationRate,
      compoundingFrequency
    } = params;
    
    // Calculate compound frequency
    const compoundsPerYear = compoundingFrequency === 'monthly' ? 12 : 
                            compoundingFrequency === 'quarterly' ? 4 : 1;
    
    // Monthly calculations
    const monthlyReturn = annualReturn / 12;
    const totalMonths = years * 12;
    
    // Arrays to store results
    const projections = [];
    let currentValue = initialAmount;
    let totalContributions = initialAmount;
    
    for (let month = 0; month <= totalMonths; month++) {
      // Add monthly contribution (except for month 0)
      if (month > 0) {
        currentValue += monthlyContribution;
        totalContributions += monthlyContribution;
      }
      
      // Calculate returns
      if (month > 0) {
        currentValue *= (1 + monthlyReturn);
      }
      
      // Store yearly snapshots
      if (month % 12 === 0) {
        const year = month / 12;
        const inflationFactor = Math.pow(1 + inflationRate, year);
        
        projections.push({
          year,
          nominalValue: Math.round(currentValue * 100) / 100,
          realValue: Math.round((currentValue / inflationFactor) * 100) / 100,
          totalContributions: Math.round(totalContributions * 100) / 100,
          totalGrowth: Math.round((currentValue - totalContributions) * 100) / 100,
          inflationImpact: Math.round((currentValue - (currentValue / inflationFactor)) * 100) / 100
        });
      }
    }
    
    // Calculate summary statistics
    const finalValue = projections[projections.length - 1];
    const totalReturn = ((finalValue.nominalValue - totalContributions) / totalContributions) * 100;
    const annualizedReturn = (Math.pow(finalValue.nominalValue / initialAmount, 1 / years) - 1) * 100;
    
    return NextResponse.json({
      success: true,
      projections,
      summary: {
        finalNominalValue: finalValue.nominalValue,
        finalRealValue: finalValue.realValue,
        totalContributions: finalValue.totalContributions,
        totalGrowth: finalValue.totalGrowth,
        totalReturnPercentage: Math.round(totalReturn * 100) / 100,
        annualizedReturnPercentage: Math.round(annualizedReturn * 100) / 100,
        inflationImpact: finalValue.inflationImpact
      }
    });
    
  } catch (error) {
    console.error('Investment growth calculation error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to calculate investment growth' },
      { status: 500 }
    );
  }
}