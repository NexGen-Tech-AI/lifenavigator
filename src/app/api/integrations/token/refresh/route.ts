// src/app/api/integrations/token/refresh/route.ts
import { NextResponse } from 'next/server';
import { refreshAccessToken } from '@/lib/services/integrationService';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/NextAuth';
import { prisma } from '@/lib/db';

export async function POST(request: Request) {
  try {
    // Get authenticated user
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const userId = session.user.id;
    const { integrationId } = await request.json();
    
    if (!integrationId) {
      return NextResponse.json({ error: 'Integration ID is required' }, { status: 400 });
    }
    
    // Verify that this integration belongs to the authenticated user
    const integration = await prisma.integration.findUnique({
      where: { id: integrationId },
    });
    
    if (!integration) {
      return NextResponse.json({ error: 'Integration not found' }, { status: 404 });
    }
    
    if (integration.userId !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    
    // Refresh the access token
    await refreshAccessToken(integrationId);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Token refreshed successfully'
    });
  } catch (error) {
    console.error('Error refreshing access token:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}