import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/NextAuth';
import { AssetAllocationRequest } from '@/types/calculator';

/**
 * API route handler for calculating asset allocation
 */
export async function POST(request: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse request body
    const data: AssetAllocationRequest = await request.json();

    // Validate request
    if (!data.risk_level) {
      return NextResponse.json(
        { error: 'Risk level is required' }, 
        { status: 400 }
      );
    }

    // Forward request to the Python API
    const apiUrl = `${process.env.BACKEND_API_URL}/api/v1/calculator/asset-allocation`;
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
        { error: errorData.detail || 'Failed to calculate asset allocation' }, 
        { status: response.status }
      );
    }

    const result = await response.json();
    return NextResponse.json(result);
  } catch (error) {
    console.error('Asset allocation calculation error:', error);
    return NextResponse.json(
      { error: 'Failed to process asset allocation calculation' }, 
      { status: 500 }
    );
  }
}