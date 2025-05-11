import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/NextAuth';

export async function POST(request: Request) {
  try {
    // Verify authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { userId, persona, prioritizedGoals } = await request.json();

    // Validate input
    if (!userId || !persona) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Find existing user goals or create new record
    const userGoals = await prisma.userGoals.upsert({
      where: { userId },
      update: {},
      create: {
        userId,
        financialGoals: {},
        careerGoals: {},
        educationGoals: {},
        healthGoals: {},
      },
    });

    // Update user metadata to include persona and prioritized goals
    await prisma.user.update({
      where: { id: userId },
      data: {
        metadata: {
          persona,
          prioritizedGoals
        } as any,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving persona and goals:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}