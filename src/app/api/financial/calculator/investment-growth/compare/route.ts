import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/NextAuth';
import { ScenarioComparisonRequest } from '@/types/calculator';

/**
 * API route handler for comparing investment scenarios
 */
export async function POST(request: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse request body
    const data: ScenarioComparisonRequest = await request.json();

    // Validate request
    if (!data.scenarios || !Array.isArray(data.scenarios) || data.scenarios.length < 1) {
      return NextResponse.json(
        { error: 'At least one scenario is required' }, 
        { status: 400 }
      );
    }

    // Forward request to the Python API
    const apiUrl = `${process.env.BACKEND_API_URL}/api/v1/calculator/investment-growth/compare`;
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
        { error: errorData.detail || 'Failed to compare investment scenarios' }, 
        { status: response.status }
      );
    }

    const result = await response.json();
    return NextResponse.json(result);
  } catch (error) {
    console.error('Investment scenario comparison error:', error);
    return NextResponse.json(
      { error: 'Failed to process investment scenario comparison' }, 
      { status: 500 }
    );
  }
}