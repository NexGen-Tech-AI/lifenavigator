import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const AssetAllocationSchema = z.object({
  age: z.number().min(18).max(100),
  riskTolerance: z.enum(['conservative', 'moderate', 'aggressive', 'very_aggressive']),
  timeHorizon: z.number().min(1).max(50),
  currentAllocation: z.object({
    stocks: z.number().min(0).max(100),
    bonds: z.number().min(0).max(100),
    realEstate: z.number().min(0).max(100),
    commodities: z.number().min(0).max(100),
    cash: z.number().min(0).max(100),
  }).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const params = AssetAllocationSchema.parse(body);
    
    const { age, riskTolerance, timeHorizon, currentAllocation } = params;
    
    // Base allocations by risk tolerance
    const baseAllocations = {
      conservative: { stocks: 30, bonds: 60, realEstate: 5, commodities: 0, cash: 5 },
      moderate: { stocks: 50, bonds: 35, realEstate: 10, commodities: 0, cash: 5 },
      aggressive: { stocks: 70, bonds: 20, realEstate: 5, commodities: 0, cash: 5 },
      very_aggressive: { stocks: 85, bonds: 10, realEstate: 0, commodities: 0, cash: 5 }
    };
    
    // Age-based adjustments (rule of thumb: 100 - age = stock percentage)
    const ageBasedStockPercentage = Math.max(20, Math.min(80, 100 - age));
    const baseAllocation = baseAllocations[riskTolerance];
    
    // Adjust for age
    const ageFactor = (ageBasedStockPercentage - baseAllocation.stocks) / 100;
    const ageAdjustedAllocation = {
      stocks: baseAllocation.stocks + (ageFactor * 20),
      bonds: baseAllocation.bonds - (ageFactor * 15),
      realEstate: baseAllocation.realEstate,
      commodities: baseAllocation.commodities,
      cash: baseAllocation.cash - (ageFactor * 5)
    };
    
    // Time horizon adjustments
    const timeHorizonFactor = Math.min(1, timeHorizon / 20);
    const recommendedAllocation = {
      stocks: Math.round(ageAdjustedAllocation.stocks * timeHorizonFactor),
      bonds: Math.round(ageAdjustedAllocation.bonds + (1 - timeHorizonFactor) * 10),
      realEstate: Math.round(ageAdjustedAllocation.realEstate),
      commodities: Math.round(ageAdjustedAllocation.commodities),
      cash: Math.round(ageAdjustedAllocation.cash)
    };
    
    // Normalize to 100%
    const total = Object.values(recommendedAllocation).reduce((sum, val) => sum + val, 0);
    Object.keys(recommendedAllocation).forEach(key => {
      recommendedAllocation[key as keyof typeof recommendedAllocation] = 
        Math.round((recommendedAllocation[key as keyof typeof recommendedAllocation] / total) * 100);
    });
    
    // Calculate rebalancing suggestions if current allocation provided
    let rebalancingSuggestions = null;
    if (currentAllocation) {
      const currentTotal = Object.values(currentAllocation).reduce((sum, val) => sum + val, 0);
      if (Math.abs(currentTotal - 100) < 1) {
        rebalancingSuggestions = {
          stocks: recommendedAllocation.stocks - currentAllocation.stocks,
          bonds: recommendedAllocation.bonds - currentAllocation.bonds,
          realEstate: recommendedAllocation.realEstate - currentAllocation.realEstate,
          commodities: recommendedAllocation.commodities - currentAllocation.commodities,
          cash: recommendedAllocation.cash - currentAllocation.cash
        };
      }
    }
    
    // Asset class descriptions
    const assetClassInfo = {
      stocks: {
        description: 'Equity investments for growth',
        expectedReturn: 0.10,
        volatility: 0.20,
        examples: ['Index funds', 'ETFs', 'Individual stocks']
      },
      bonds: {
        description: 'Fixed income for stability',
        expectedReturn: 0.05,
        volatility: 0.05,
        examples: ['Government bonds', 'Corporate bonds', 'Bond funds']
      },
      realEstate: {
        description: 'Real estate for diversification',
        expectedReturn: 0.08,
        volatility: 0.15,
        examples: ['REITs', 'Real estate funds', 'Direct property']
      },
      commodities: {
        description: 'Commodities for inflation hedge',
        expectedReturn: 0.06,
        volatility: 0.25,
        examples: ['Gold', 'Silver', 'Commodity funds']
      },
      cash: {
        description: 'Cash for liquidity and safety',
        expectedReturn: 0.02,
        volatility: 0.01,
        examples: ['Savings accounts', 'Money market funds', 'CDs']
      }
    };
    
    return NextResponse.json({
      success: true,
      recommendedAllocation,
      rebalancingSuggestions,
      assetClassInfo,
      rationale: {
        age: `At age ${age}, a ${100 - age}% stock allocation is a common starting point`,
        riskTolerance: `Your ${riskTolerance} risk tolerance suggests ${riskTolerance === 'conservative' ? 'lower' : 'higher'} equity exposure`,
        timeHorizon: `With a ${timeHorizon}-year time horizon, you ${timeHorizon > 10 ? 'can afford more risk' : 'should be more conservative'}`
      }
    });
    
  } catch (error) {
    console.error('Asset allocation error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to calculate asset allocation' },
      { status: 500 }
    );
  }
}