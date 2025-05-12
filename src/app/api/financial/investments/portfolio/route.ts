import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/NextAuth';
import { prisma } from '@/lib/db';
import { getPortfolioMockData } from '../mockData';

/**
 * GET /api/financial/investments/portfolio
 * Get the complete investment portfolio
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
      const mockPortfolio = getPortfolioMockData();
      return NextResponse.json(mockPortfolio);
    }
    
    // If we have real data, we'd need to transform it and calculate allocations, risk metrics, etc.
    // This would be much more complex and would likely involve multiple database queries
    // For now, we'll still return mock data even if there are investments
    const mockPortfolio = getPortfolioMockData();
    return NextResponse.json(mockPortfolio);
  } catch (error) {
    console.error('Error getting investment portfolio:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}