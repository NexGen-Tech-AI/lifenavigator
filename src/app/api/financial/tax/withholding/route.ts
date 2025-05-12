import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/NextAuth';
import { taxService } from '@/lib/services/taxService';
import { W4FormData, IncomeDetails } from '@/types/tax';

/**
 * POST /api/financial/tax/withholding
 * Calculate tax withholding based on W-4, income details
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
    const { w4Data, incomeDetails } = body;
    
    // Validate required parameters
    if (!w4Data || !incomeDetails) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }
    
    // Calculate withholding
    const result = taxService.calculateWithholding(
      w4Data as W4FormData,
      incomeDetails as IncomeDetails
    );
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error calculating tax withholding:', error);
    return NextResponse.json(
      { error: 'An error occurred while calculating tax withholding' },
      { status: 500 }
    );
  }
}