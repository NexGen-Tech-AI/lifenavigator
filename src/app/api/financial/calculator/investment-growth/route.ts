import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/NextAuth';
import { InvestmentGrowthRequest } from '@/types/calculator';

/**
 * API route handler for calculating investment growth
 */
export async function POST(request: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse request body
    const data: InvestmentGrowthRequest = await request.json();

    // Validate required fields
    if (data.initial_investment === undefined || 
        data.annual_return_rate === undefined || 
        data.time_horizon_years === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: initial_investment, annual_return_rate, time_horizon_years' }, 
        { status: 400 }
      );
    }

    // Forward request to the Python API
    const apiUrl = `${process.env.BACKEND_API_URL}/api/v1/calculator/investment-growth`;
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.accessToken}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { error: errorData.detail || 'Failed to calculate investment growth' }, 
        { status: response.status }
      );
    }

    const result = await response.json();
    return NextResponse.json(result);
  } catch (error) {
    console.error('Investment growth calculation error:', error);
    return NextResponse.json(
      { error: 'Failed to process investment growth calculation' }, 
      { status: 500 }
    );
  }
}