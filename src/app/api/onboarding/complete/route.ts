import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId } = body;
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }
    
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    // Mark setup as completed
    await prisma.user.update({
      where: { id: userId },
      data: {
        setupCompleted: true,
      },
    });
    
    // Generate initial roadmaps based on goals and risk profile
    // This would typically involve more complex logic to create roadmaps based on the collected data
    // For now, we'll create a simple placeholder roadmap for each domain
    const domains = ['financial', 'career', 'education', 'health'];
    
    for (const domain of domains) {
      await prisma.roadmap.create({
        data: {
          userId,
          title: `Your ${domain.charAt(0).toUpperCase() + domain.slice(1)} Roadmap`,
          description: `A personalized roadmap for your ${domain} journey`,
          domain,
          status: 'active',
          milestones: {
            create: [
              {
                title: `Initial ${domain} assessment`,
                description: 'Complete a detailed assessment of your current status',
                status: 'not_started',
                priority: 1,
                targetDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
              },
              {
                title: `Develop ${domain} strategy`,
                description: 'Create a strategic plan based on your goals',
                status: 'not_started',
                priority: 2,
                targetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 1 month from now
              },
              {
                title: `Implement ${domain} action items`,
                description: 'Take specific actions to move toward your goals',
                status: 'not_started',
                priority: 3,
                targetDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 3 months from now
              },
            ],
          },
        },
      });
    }
    
    return NextResponse.json(
      { message: 'Onboarding completed successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error completing onboarding:', error);
    return NextResponse.json(
      { error: 'An error occurred while completing onboarding' },
      { status: 500 }
    );
  }
}