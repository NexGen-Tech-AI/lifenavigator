import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/NextAuth';
import prisma from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    // Check if user is authenticated
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user ID from session
    const userId = session.user.id;

    // Get all email connections for this user
    const emailConnections = await prisma.emailConnection.findMany({
      where: {
        userId,
      },
      orderBy: {
        lastSync: 'desc',
      },
    });

    // Get associated calendar connections
    const calendarConnections = await prisma.calendarConnection.findMany({
      where: {
        userId,
        emailConnectionId: {
          in: emailConnections.map(conn => conn.id),
        },
      },
    });

    // Map calendar connections to email connections
    const emailAccountsWithCalendars = emailConnections.map(email => {
      const calendar = calendarConnections.find(cal => cal.emailConnectionId === email.id);
      
      return {
        id: email.id,
        provider: email.provider,
        email: email.email,
        connected: email.connected,
        lastSync: email.lastSync,
        calendarConnected: !!calendar?.connected,
        calendarId: calendar?.id,
      };
    });

    return NextResponse.json({
      accounts: emailAccountsWithCalendars,
    });

  } catch (error) {
    console.error('Error fetching email accounts:', error);
    return NextResponse.json({ error: 'Failed to fetch email accounts' }, { status: 500 });
  }
}

// Disconnect email account
export async function DELETE(request: NextRequest) {
  try {
    // Check if user is authenticated
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user ID from session
    const userId = session.user.id;

    // Get account ID from query params
    const url = new URL(request.url);
    const id = url.searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Email account ID is required' }, { status: 400 });
    }

    // Check if this email connection belongs to the user
    const emailConnection = await prisma.emailConnection.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!emailConnection) {
      return NextResponse.json({ error: 'Email account not found' }, { status: 404 });
    }

    // First disconnect associated calendar connections
    await prisma.calendarConnection.updateMany({
      where: {
        emailConnectionId: id,
      },
      data: {
        connected: false,
      },
    });

    // Now disconnect email
    await prisma.emailConnection.update({
      where: {
        id,
      },
      data: {
        connected: false,
      },
    });

    return NextResponse.json({
      message: 'Email account disconnected successfully',
    });

  } catch (error) {
    console.error('Error disconnecting email account:', error);
    return NextResponse.json({ error: 'Failed to disconnect email account' }, { status: 500 });
  }
}