import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/NextAuth';
import prisma from '@/lib/db';

/**
 * Syncs calendar events from connected email accounts
 * This endpoint would be called after connecting a new email account
 * or manually when a user wants to force a sync
 */
export async function POST(request: NextRequest) {
  try {
    // Check if user is authenticated
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user ID from session
    const userId = session.user.id;

    // Get email connection ID from request body
    const { emailConnectionId } = await request.json();

    // If no specific email connection is provided, sync all
    let emailConnections;
    
    if (emailConnectionId) {
      // Check if this specific email connection exists and belongs to the user
      emailConnections = await prisma.emailConnection.findMany({
        where: {
          id: emailConnectionId,
          userId,
          connected: true,
        },
      });
      
      if (emailConnections.length === 0) {
        return NextResponse.json({ error: 'Email connection not found' }, { status: 404 });
      }
    } else {
      // Get all connected email accounts for this user
      emailConnections = await prisma.emailConnection.findMany({
        where: {
          userId,
          connected: true,
        },
      });
    }

    // For each email connection, sync calendar events
    const syncResults = [];

    for (const connection of emailConnections) {
      // Check if there's already a calendar connection for this email
      let calendarConnection = await prisma.calendarConnection.findFirst({
        where: {
          emailConnectionId: connection.id,
        },
      });

      // If no calendar connection exists, create one
      if (!calendarConnection) {
        calendarConnection = await prisma.calendarConnection.create({
          data: {
            userId,
            provider: connection.provider === 'other' ? 'custom' : connection.provider,
            name: `${connection.email.split('@')[0]}'s Calendar`,
            email: connection.email,
            connected: true,
            lastSync: new Date(),
            emailConnectionId: connection.id,
          },
        });
      } else {
        // Update the existing calendar connection
        calendarConnection = await prisma.calendarConnection.update({
          where: {
            id: calendarConnection.id,
          },
          data: {
            connected: true,
            lastSync: new Date(),
          },
        });
      }

      // In a real implementation, you'd fetch and sync actual calendar events
      // from the email provider's API here
      
      // For now, just add a mock event for demo purposes
      const mockEvent = await prisma.calendarEvent.create({
        data: {
          userId,
          calendarId: calendarConnection.id,
          title: 'New Meeting from Email Sync',
          description: 'This event was automatically created from your email calendar sync',
          startTime: new Date(Date.now() + 86400000), // Tomorrow
          endTime: new Date(Date.now() + 86400000 + 3600000), // 1 hour duration
          location: 'Virtual Meeting',
          isAllDay: false,
          recurrence: null,
          color: '#4285F4',
        },
      });

      syncResults.push({
        email: connection.email,
        calendarId: calendarConnection.id,
        success: true,
        eventsAdded: 1,
      });
    }

    return NextResponse.json({
      message: 'Calendar synced successfully from email accounts',
      results: syncResults,
    });

  } catch (error) {
    console.error('Error syncing calendar from email:', error);
    return NextResponse.json({ error: 'Failed to sync calendar events' }, { status: 500 });
  }
}