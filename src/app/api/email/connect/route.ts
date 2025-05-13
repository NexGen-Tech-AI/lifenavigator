import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/NextAuth';
import prisma from '@/lib/db';

type EmailConnectionRequest = {
  provider: string;
  email: string;
  credentials?: {
    password?: string;
    imapServer?: string;
    imapPort?: string;
    smtpServer?: string;
    smtpPort?: string;
    useSSL?: boolean;
  };
};

export async function POST(request: NextRequest) {
  try {
    // Check if user is authenticated
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user ID from session
    const userId = session.user.id;

    // Parse request body
    const body = await request.json() as EmailConnectionRequest;
    const { provider, email, credentials } = body;

    // Validate request
    if (!provider || !email) {
      return NextResponse.json({ error: 'Provider and email are required' }, { status: 400 });
    }

    // For manual IMAP/SMTP setup, validate additional fields
    if (provider === 'other' && credentials) {
      if (!credentials.password || !credentials.imapServer || !credentials.smtpServer) {
        return NextResponse.json({ error: 'Missing required credentials for manual setup' }, { status: 400 });
      }
    }

    // Check if this email is already connected
    const existingConnection = await prisma.emailConnection.findFirst({
      where: {
        userId,
        email,
      },
    });

    if (existingConnection) {
      return NextResponse.json({ error: 'This email is already connected to your account' }, { status: 400 });
    }

    // Create new email connection
    const emailConnection = await prisma.emailConnection.create({
      data: {
        userId,
        provider,
        email,
        connected: true,
        lastSync: new Date(),
        // Store credentials securely if manual setup
        // In production, you should encrypt sensitive data
        credentials: provider === 'other' ? JSON.stringify(credentials) : null,
        // Auto-connect calendar
        calendarConnected: true,
      },
    });

    // If provider allows calendar sync, create calendar connection as well
    await prisma.calendarConnection.create({
      data: {
        userId,
        provider: provider === 'other' ? 'custom' : provider,
        name: `${email.split('@')[0]}'s Calendar`,
        email,
        connected: true,
        lastSync: new Date(),
        emailConnectionId: emailConnection.id,
      },
    });

    return NextResponse.json({
      message: 'Email connected successfully',
      emailConnection: {
        id: emailConnection.id,
        provider,
        email,
        connected: true,
        calendarConnected: true,
      },
    });

  } catch (error) {
    console.error('Error connecting email:', error);
    return NextResponse.json({ error: 'Failed to connect email account' }, { status: 500 });
  }
}