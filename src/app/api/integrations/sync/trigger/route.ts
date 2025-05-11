// src/app/api/integrations/sync/trigger/route.ts
import { NextResponse } from 'next/server';
import { recordSyncStart, recordSyncCompletion, updateLastSyncedAt } from '@/lib/services/integrationService';
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
      include: {
        token: true,
      },
    });
    
    if (!integration) {
      return NextResponse.json({ error: 'Integration not found' }, { status: 404 });
    }
    
    if (integration.userId !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    
    // Record sync start
    const syncRecord = await recordSyncStart(integrationId);
    
    try {
      // This is where we would implement provider-specific data synchronization
      // For example, fetching data from the provider's API
      
      // For demo purposes, we'll simulate a successful sync
      const syncResult = {
        syncedItems: 25,
        lastSyncTimestamp: new Date().toISOString(),
      };
      
      // Record successful sync completion
      await recordSyncCompletion(syncRecord.id, true, syncResult);
      
      // Update last synced timestamp
      await updateLastSyncedAt(integrationId);
      
      return NextResponse.json({ 
        success: true, 
        message: 'Data synchronized successfully',
        syncId: syncRecord.id,
        result: syncResult,
      });
    } catch (syncError) {
      // Record failed sync
      const errorMessage = syncError instanceof Error ? syncError.message : 'Sync operation failed';
      await recordSyncCompletion(syncRecord.id, false, null, errorMessage);
      
      throw syncError;
    }
  } catch (error) {
    console.error('Error triggering data sync:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}