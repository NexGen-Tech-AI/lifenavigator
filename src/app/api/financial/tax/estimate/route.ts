import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/NextAuth';
import { taxService } from '@/lib/services/taxService';
import { 
  IncomeDetails, 
  DeductionDetails, 
  CreditDetails, 
  FilingStatus 
} from '@/types/tax';

/**
 * POST /api/financial/tax/estimate
 * Calculate comprehensive tax estimate
 */
export async function POST(request: Request) {
  try {
    // Get the authenticated user
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }
    
    // Parse the request body
    const body = await request.json();
    const { 
      income, 
      deductions, 
      credits, 
      filingStatus,
      taxYear = new Date().getFullYear(),
      withholdingToDate = 0
    } = body;
    
    // Validate required parameters
    if (!income || !deductions || !credits || !filingStatus) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }
    
    // Calculate tax estimate
    const result = taxService.calculateTaxEstimate(
      income as IncomeDetails,
      deductions as DeductionDetails,
      credits as CreditDetails,
      filingStatus as FilingStatus,
      taxYear,
      withholdingToDate
    );
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error calculating tax estimate:', error);
    return NextResponse.json(
      { error: 'An error occurred while calculating tax estimate' },
      { status: 500 }
    );
  }
}