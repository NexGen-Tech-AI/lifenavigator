import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

// GET /api/v1/tax/summary - Get tax summary for a specific year
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const year = searchParams.get('year') || new Date().getFullYear().toString();

    // Fetch user's tax profile
    const { data: taxProfile, error: profileError } = await supabase
      .from('tax_profiles')
      .select('*')
      .eq('user_id', user.id)
      .eq('tax_year', year)
      .single();

    if (profileError && profileError.code !== 'PGRST116') {
      console.error('Error fetching tax profile:', profileError);
      return NextResponse.json({ error: 'Failed to fetch tax profile' }, { status: 500 });
    }

    // Fetch income data
    const { data: accounts } = await supabase
      .from('accounts')
      .select('*')
      .eq('user_id', user.id);

    // Calculate tax summary (simplified calculation)
    const annualIncome = 85000; // This would be calculated from actual income data
    const standardDeduction = taxProfile?.filing_status === 'married_filing_jointly' ? 27700 : 13850;
    const taxableIncome = Math.max(0, annualIncome - standardDeduction);
    
    // Calculate tax based on 2024 brackets
    let tax = 0;
    const brackets = [
      { min: 0, max: 11600, rate: 0.10 },
      { min: 11600, max: 47150, rate: 0.12 },
      { min: 47150, max: 100525, rate: 0.22 },
      { min: 100525, max: 191950, rate: 0.24 }
    ];

    let remainingIncome = taxableIncome;
    for (const bracket of brackets) {
      if (remainingIncome > 0) {
        const taxableInBracket = Math.min(remainingIncome, bracket.max - bracket.min);
        tax += taxableInBracket * bracket.rate;
        remainingIncome -= taxableInBracket;
      }
    }

    const effectiveTaxRate = annualIncome > 0 ? tax / annualIncome : 0;
    const marginalTaxRate = taxableIncome > 47150 ? 0.22 : taxableIncome > 11600 ? 0.12 : 0.10;

    // Mock quarterly payments
    const quarterlyPayment = Math.round(tax / 4);
    const quarterlyPayments = [quarterlyPayment, quarterlyPayment, quarterlyPayment, quarterlyPayment];

    return NextResponse.json({
      estimatedTaxOwed: Math.round(tax),
      effectiveTaxRate,
      marginalTaxRate,
      totalDeductions: taxProfile?.total_deductions || standardDeduction,
      totalCredits: taxProfile?.total_credits || 0,
      estimatedRefund: taxProfile?.estimated_refund || 0,
      quarterlyPayments,
      filingStatus: taxProfile?.filing_status || 'single',
      dependents: taxProfile?.dependents || 0
    });
  } catch (error) {
    console.error('Error in GET /api/v1/tax/summary:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/v1/tax/summary - Update tax profile
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { year, filingStatus, dependents, estimatedIncome } = body;

    // Upsert tax profile
    const { data, error } = await supabase
      .from('tax_profiles')
      .upsert({
        user_id: user.id,
        tax_year: year,
        filing_status: filingStatus,
        dependents,
        estimated_income: estimatedIncome,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Error updating tax profile:', error);
      return NextResponse.json({ error: 'Failed to update tax profile' }, { status: 500 });
    }

    return NextResponse.json({ success: true, profile: data });
  } catch (error) {
    console.error('Error in POST /api/v1/tax/summary:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}