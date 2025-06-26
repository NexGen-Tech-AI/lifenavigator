import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET /api/v1/tax/deductions - Get deductions and credits
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Demo mode - use hardcoded user ID
    const demoUserId = 'demo-user-001';

    const { searchParams } = new URL(request.url);
    const year = searchParams.get('year') || new Date().getFullYear().toString();

    // Fetch deductions
    const { data: deductions, error: deductionsError } = await supabase
      .from('tax_deductions')
      .select('*')
      .eq('user_id', demoUserId)
      .eq('tax_year', year);

    if (deductionsError) {
      console.error('Error fetching deductions:', deductionsError);
    }

    // Fetch credits
    const { data: credits, error: creditsError } = await supabase
      .from('tax_credits')
      .select('*')
      .eq('user_id', demoUserId)
      .eq('tax_year', year);

    if (creditsError) {
      console.error('Error fetching credits:', creditsError);
    }

    // Mock data if no records exist
    const mockDeductions = deductions?.length ? deductions : [
      { 
        id: '1',
        name: 'Mortgage Interest',
        amount: 12000,
        category: 'Housing',
        eligible: true,
        documentation: true,
        tax_year: year
      },
      { 
        id: '2',
        name: 'State and Local Taxes',
        amount: 10000,
        category: 'Taxes',
        eligible: true,
        documentation: true,
        tax_year: year
      },
      { 
        id: '3',
        name: 'Charitable Donations',
        amount: 3500,
        category: 'Charity',
        eligible: true,
        documentation: false,
        tax_year: year
      }
    ];

    const mockCredits = credits?.length ? credits : [
      {
        id: '1',
        name: 'Child Tax Credit',
        amount: 2000,
        type: 'refundable',
        qualified: true,
        requirements: ['Child under 17', 'Valid SSN', 'Income under $200k'],
        tax_year: year
      },
      {
        id: '2',
        name: 'Education Credit',
        amount: 1200,
        type: 'non-refundable',
        qualified: true,
        requirements: ['Enrolled in eligible program', 'Qualified expenses', 'Not claimed for 4 years'],
        tax_year: year
      }
    ];

    return NextResponse.json({
      deductions: mockDeductions,
      credits: mockCredits
    });
  } catch (error) {
    console.error('Error in GET /api/v1/tax/deductions:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/v1/tax/deductions - Add or update deduction
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Demo mode - use hardcoded user ID
    const demoUserId = 'demo-user-001';

    const body = await request.json();
    const { name, amount, category, taxYear, documentation } = body;

    const { data, error } = await supabase
      .from('tax_deductions')
      .insert({
        user_id: demoUserId,
        name,
        amount,
        category,
        tax_year: taxYear,
        documentation,
        eligible: true,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding deduction:', error);
      return NextResponse.json({ error: 'Failed to add deduction' }, { status: 500 });
    }

    return NextResponse.json({ success: true, deduction: data });
  } catch (error) {
    console.error('Error in POST /api/v1/tax/deductions:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}