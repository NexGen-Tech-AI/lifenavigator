import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { FinancialSimulatorService } from '@/lib/services/financialSimulatorService';
import { z } from 'zod';

// Validation schema for simulation request
const simulationSchema = z.object({
  scenarioType: z.enum([
    'JOB_LOSS', 'MARKET_DOWNTURN', 'HOME_PURCHASE', 'VEHICLE_PURCHASE',
    'MARRIAGE', 'NEW_BABY', 'START_BUSINESS', 'RETIREMENT',
    'EDUCATION', 'MEDICAL_EMERGENCY', 'CUSTOM'
  ]),
  parameters: z.object({
    // Job Loss
    incomeReduction: z.number().min(0).max(100).optional(),
    unemploymentBenefits: z.boolean().optional(),
    severanceMonths: z.number().min(0).optional(),
    
    // Market Downturn
    portfolioDropPercent: z.number().min(0).max(100).optional(),
    recoveryMonths: z.number().min(1).optional(),
    
    // Home Purchase
    homePrice: z.number().positive().optional(),
    downPaymentPercent: z.number().min(0).max(100).optional(),
    mortgageRate: z.number().positive().optional(),
    mortgageYears: z.number().positive().optional(),
    propertyTax: z.number().min(0).optional(),
    homeInsurance: z.number().min(0).optional(),
    hoa: z.number().min(0).optional(),
    
    // Vehicle Purchase
    vehiclePrice: z.number().positive().optional(),
    vehicleDownPayment: z.number().min(0).optional(),
    loanRate: z.number().positive().optional(),
    loanTermMonths: z.number().positive().optional(),
    
    // Marriage
    spouseIncome: z.number().min(0).optional(),
    spouseExpenses: z.number().min(0).optional(),
    weddingCost: z.number().min(0).optional(),
    
    // New Baby
    monthlyChildcare: z.number().min(0).optional(),
    medicalCosts: z.number().min(0).optional(),
    parentalLeaveWeeks: z.number().min(0).optional(),
    reducedIncomePercent: z.number().min(0).max(100).optional(),
    
    // Start Business
    startupCosts: z.number().min(0).optional(),
    monthlyBusinessExpenses: z.number().min(0).optional(),
    projectedRevenue: z.array(z.number()).optional(),
    salaryReduction: z.number().min(0).max(100).optional(),
    
    // Custom
    monthlyIncomeChange: z.number().optional(),
    monthlyExpenseChange: z.number().optional(),
    oneTimeCost: z.number().min(0).optional(),
    oneTimeIncome: z.number().min(0).optional(),
  }),
  startDate: z.string().optional(),
  durationMonths: z.number().min(1).max(360).default(60),
});

// POST /api/v1/finance/simulator - Run a simulation
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = simulationSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validationResult.error.errors },
        { status: 400 }
      );
    }

    const { scenarioType, parameters, startDate, durationMonths } = validationResult.data;

    // Run simulation
    const simulatorService = new FinancialSimulatorService(supabase);
    const result = await simulatorService.runSimulation(
      user.id,
      scenarioType,
      parameters,
      startDate ? new Date(startDate) : new Date(),
      durationMonths
    );

    return NextResponse.json({
      success: true,
      result
    });
  } catch (error) {
    console.error('Error in POST /api/v1/finance/simulator:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// GET /api/v1/finance/simulator/scenarios - Get saved scenarios
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    const simulatorService = new FinancialSimulatorService(supabase);

    if (action === 'templates') {
      // Get scenario templates
      const templates = await simulatorService.getScenarioTemplates();
      return NextResponse.json({ templates });
    } else {
      // Get saved scenarios
      const scenarios = await simulatorService.getSavedScenarios(user.id);
      return NextResponse.json({ scenarios });
    }
  } catch (error) {
    console.error('Error in GET /api/v1/finance/simulator:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}