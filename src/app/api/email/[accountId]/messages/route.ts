import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/NextAuth';
import prisma from '@/lib/db';

export async function GET(
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

    // Parse query parameters
    const url = new URL(request.url);
    const folder = url.searchParams.get('folder') || 'inbox';
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const search = url.searchParams.get('search') || '';

    // In a real implementation, you would fetch actual emails from the email provider's API
    // For now, return mock data

    // Generate mock emails
    const mockEmails = [
      {
        id: '1',
        subject: 'Weekly Team Meeting - Agenda',
        from: { name: 'John Smith', email: 'john@example.com' },
        to: [{ name: 'Me', email: emailConnection.email }],
        date: '2025-05-13T10:30:00Z',
        body: 'Hello team, here is the agenda for our weekly meeting. Please review and let me know if you have any topics to add.',
        read: false,
        starred: true,
        hasAttachments: true,
        folder,
      },
      {
        id: '2',
        subject: 'Your invoice from Spotify Premium',
        from: { name: 'Spotify', email: 'noreply@spotify.com' },
        to: [{ name: 'Me', email: emailConnection.email }],
        date: '2025-05-12T08:15:00Z',
        body: 'Thank you for your payment. Here is your monthly invoice for Spotify Premium.',
        read: true,
        starred: false,
        hasAttachments: true,
        folder,
      },
      {
        id: '3',
        subject: 'Project deadline extension',
        from: { name: 'Sarah Johnson', email: 'sarah@company.com' },
        to: [{ name: 'Me', email: emailConnection.email }, { name: 'Team', email: 'team@company.com' }],
        date: '2025-05-11T16:45:00Z',
        body: 'Hi everyone, I wanted to inform you that we have extended the project deadline by one week.',
        read: true,
        starred: false,
        hasAttachments: false,
        folder,
      },
      {
        id: '4',
        subject: 'Weekend plans',
        from: { name: 'Alex Green', email: 'alex@friend.com' },
        to: [{ name: 'Me', email: emailConnection.email }],
        date: '2025-05-10T19:20:00Z',
        body: 'Hey! Are you free this weekend? I was thinking we could go hiking if the weather is nice.',
        read: true,
        starred: true,
        hasAttachments: false,
        folder,
      },
      {
        id: '5',
        subject: 'Your flight confirmation',
        from: { name: 'Airlines Booking', email: 'bookings@airline.com' },
        to: [{ name: 'Me', email: emailConnection.email }],
        date: '2025-05-09T12:00:00Z',
        body: 'Thank you for booking with us. Here is your flight confirmation and boarding pass.',
        read: false,
        starred: false,
        hasAttachments: true,
        folder,
      },
    ];

    // Filter emails based on folder and search
    let filteredEmails = mockEmails.filter(email => email.folder === folder);
    
    if (search) {
      const searchLower = search.toLowerCase();
      filteredEmails = filteredEmails.filter(email => 
        email.subject.toLowerCase().includes(searchLower) ||
        email.from.name.toLowerCase().includes(searchLower) ||
        email.from.email.toLowerCase().includes(searchLower) ||
        email.body.toLowerCase().includes(searchLower)
      );
    }

    // Paginate results
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedEmails = filteredEmails.slice(startIndex, endIndex);

    return NextResponse.json({
      messages: paginatedEmails,
      total: filteredEmails.length,
      page,
      limit,
      totalPages: Math.ceil(filteredEmails.length / limit),
    });

  } catch (error) {
    console.error('Error fetching emails:', error);
    return NextResponse.json({ error: 'Failed to fetch emails' }, { status: 500 });
  }
}