import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/NextAuth';
import { prisma } from '@/lib/db';

/**
 * POST /api/financial/tax/profile
 * Create a new tax profile
 */
export async function POST(request: Request) {
  try {
    // Get the authenticated user
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }
    
    const userId = session.user.id;
    
    // Parse the request body
    const body = await request.json();
    const { taxYear, w4, income, deductions, credits } = body;
    
    // Validate required parameters
    if (!taxYear || !w4 || !income || !deductions || !credits) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }
    
    // Check if a profile already exists for this tax year
    const existingProfile = await prisma.taxProfile.findFirst({
      where: {
        userId,
        taxYear: taxYear
      }
    });
    
    if (existingProfile) {
      return NextResponse.json(
        { error: `A tax profile already exists for ${taxYear}. Use the update endpoint.` },
        { status: 400 }
      );
    }
    
    // Create a new tax profile
    const taxProfile = await prisma.taxProfile.create({
      data: {
        userId,
        taxYear,
        w4: JSON.stringify(w4),
        income: JSON.stringify(income),
        deductions: JSON.stringify(deductions),
        credits: JSON.stringify(credits)
      }
    });
    
    // Transform data for response
    const response = {
      ...taxProfile,
      w4: JSON.parse(taxProfile.w4 as string),
      income: JSON.parse(taxProfile.income as string),
      deductions: JSON.parse(taxProfile.deductions as string),
      credits: JSON.parse(taxProfile.credits as string)
    };
    
    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error('Error creating tax profile:', error);
    return NextResponse.json(
      { error: 'An error occurred while creating tax profile' },
      { status: 500 }
    );
  }
}