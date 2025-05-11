// src/app/api/integrations/services/[id]/disconnect/route.ts
import { NextResponse } from 'next/server';
import { disconnectIntegration } from '@/lib/services/integrationService';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/NextAuth';
import { prisma } from '@/lib/db';

interface RouteParams {
  params: {
    id: string;
  };
}

export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    // Get authenticated user
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const userId = session.user.id;
    const integrationId = params.id;
    
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
    
    // Disconnect the integration
    await disconnectIntegration(integrationId);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Integration disconnected successfully'
    });
  } catch (error) {
    console.error('Error disconnecting integration:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}