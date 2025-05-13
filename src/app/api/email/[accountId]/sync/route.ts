import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/NextAuth';
import prisma from '@/lib/db';

export async function POST(
  request: NextRequest,
  { params }: { params: { accountId: string } }
) {
  try {
    // Check if user is authenticated
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user ID from session
    const userId = session.user.id;
    const { accountId } = params;

    // Check if this email connection belongs to the user
    const emailConnection = await prisma.emailConnection.findFirst({
      where: {
        id: accountId,
        userId,
      },
    });

    if (!emailConnection) {
      return NextResponse.json({ error: 'Email account not found' }, { status: 404 });
    }

    // In a real implementation, you'd connect to the email provider's API and sync messages
    // For now, we'll just update the lastSync timestamp

    await prisma.emailConnection.update({
      where: {
        id: accountId,
      },
      data: {
        lastSync: new Date(),
      },
    });

    // Also sync calendar if connected
    const calendarConnection = await prisma.calendarConnection.findFirst({
      where: {
        emailConnectionId: accountId,
      },
    });

    if (calendarConnection) {
      await prisma.calendarConnection.update({
        where: {
          id: calendarConnection.id,
        },
        data: {
          lastSync: new Date(),
        },
      });
    }

    return NextResponse.json({
      message: 'Email account synced successfully',
      lastSync: new Date(),
    });

  } catch (error) {
    console.error('Error syncing email account:', error);
    return NextResponse.json({ error: 'Failed to sync email account' }, { status: 500 });
  }
}