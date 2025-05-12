import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/NextAuth';
import { prisma } from '@/lib/db';
import { getHoldingsMockData } from '../mockData';

/**
 * GET /api/financial/investments/holdings
 * Get investment holdings
 */
export async function GET(request: Request) {
  try {
    // Get the authenticated user
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }
    
    const userId = session.user.id;
    
    // Check if we have real investment data
    const investments = await prisma.investment.findMany({
      where: {
        userId,
      },
    });
    
    // If there's no real data, return mock data
    if (investments.length === 0) {
      const mockHoldings = getHoldingsMockData();
      return NextResponse.json(mockHoldings);
    }
    
    // For now, we'll still return mock data even if there are investments
    // In a real implementation, we would transform the actual investment data
    const mockHoldings = getHoldingsMockData();
    return NextResponse.json(mockHoldings);
  } catch (error) {
    console.error('Error getting investment holdings:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}