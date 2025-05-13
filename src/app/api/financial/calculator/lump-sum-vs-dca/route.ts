import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/NextAuth';
import { LumpSumVsDcaRequest } from '@/types/calculator';

/**
 * API route handler for comparing lump sum vs DCA investment strategies
 */
export async function POST(request: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse request body
    const data: LumpSumVsDcaRequest = await request.json();

    // Validate request
    if (data.total_amount === undefined || 
        data.time_horizon_years === undefined || 
        !data.risk_level) {
      return NextResponse.json(
        { error: 'Missing required fields: total_amount, time_horizon_years, risk_level' }, 
        { status: 400 }
      );
    }

    // Forward request to the Python API
    const apiUrl = `${process.env.BACKEND_API_URL}/api/v1/calculator/lump-sum-vs-dca`;
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
        { error: errorData.detail || 'Failed to compare lump sum vs DCA strategies' }, 
        { status: response.status }
      );
    }

    const result = await response.json();
    return NextResponse.json(result);
  } catch (error) {
    console.error('Lump sum vs DCA comparison error:', error);
    return NextResponse.json(
      { error: 'Failed to process lump sum vs DCA comparison' }, 
      { status: 500 }
    );
  }
}