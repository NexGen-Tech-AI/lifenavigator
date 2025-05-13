import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/NextAuth';

/**
 * API route handler for getting historical returns data
 */
export async function GET(request: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Forward request to the Python API
    const apiUrl = `${process.env.BACKEND_API_URL}/api/v1/calculator/historical-returns`;
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${session.accessToken}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { error: errorData.detail || 'Failed to get historical returns data' }, 
        { status: response.status }
      );
    }

    const result = await response.json();
    return NextResponse.json(result);
  } catch (error) {
    console.error('Historical returns data error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve historical returns data' }, 
      { status: 500 }
    );
  }
}