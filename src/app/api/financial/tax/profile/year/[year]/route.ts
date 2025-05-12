import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/NextAuth';
import { prisma } from '@/lib/db';

interface RouteParams {
  params: {
    year: string;
  };
}

/**
 * GET /api/financial/tax/profile/year/:year
 * Get tax profile for a specific tax year
 */
export async function GET(request: Request, { params }: RouteParams) {
  try {
    // Get the authenticated user
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }
    
    const userId = session.user.id;
    const taxYear = parseInt(params.year, 10);
    
    if (isNaN(taxYear)) {
      return NextResponse.json(
        { error: 'Invalid tax year parameter' },
        { status: 400 }
      );
    }
    
    // Fetch the tax profile
    const taxProfile = await prisma.taxProfile.findFirst({
      where: {
        userId,
        taxYear
      }
    });
    
    if (!taxProfile) {
      return NextResponse.json(
        { error: `No tax profile found for ${taxYear}` },
        { status: 404 }
      );
    }
    
    // Transform data for response
    const response = {
      ...taxProfile,
      w4: JSON.parse(taxProfile.w4 as string),
      income: JSON.parse(taxProfile.income as string),
      deductions: JSON.parse(taxProfile.deductions as string),
      credits: JSON.parse(taxProfile.credits as string)
    };
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching tax profile:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching tax profile' },
      { status: 500 }
    );
  }
}