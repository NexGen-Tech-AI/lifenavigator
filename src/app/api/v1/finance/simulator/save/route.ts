import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { FinancialSimulatorService } from '@/lib/services/financialSimulatorService';
import { z } from 'zod';

// Validation schema for saving scenario
const saveScenarioSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  scenarioType: z.string(),
  parameters: z.record(z.any()),
  result: z.object({
    snapshots: z.array(z.any()),
    impactOnNetWorth: z.number(),
    impactOnCashFlow: z.number(),
    newHealthScore: z.number(),
    riskLevel: z.enum(['LOW', 'MODERATE', 'HIGH', 'CRITICAL']),
    warnings: z.array(z.string()),
    opportunities: z.array(z.string()),
  }),
  tags: z.array(z.string()).optional(),
});

// POST /api/v1/finance/simulator/save - Save a scenario
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
    const validationResult = saveScenarioSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validationResult.error.errors },
        { status: 400 }
      );
    }

    const { name, description, scenarioType, parameters, result, tags } = validationResult.data;

    // Save scenario
    const simulatorService = new FinancialSimulatorService(supabase);
    const scenarioId = await simulatorService.saveScenario(
      user.id,
      name,
      description || '',
      scenarioType,
      parameters,
      result,
      tags || []
    );

    return NextResponse.json({
      success: true,
      scenarioId
    });
  } catch (error) {
    console.error('Error saving scenario:', error);
    return NextResponse.json({ error: 'Failed to save scenario' }, { status: 500 });
  }
}