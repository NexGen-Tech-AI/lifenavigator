import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';
import { roadmapService } from '@/lib/services/roadmapService';

// Get all roadmaps for the current user
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const userId = session.user.id;
    
    // Get domain filter from query params if exists
    const searchParams = request.nextUrl.searchParams;
    const domain = searchParams.get('domain');
    
    // Get roadmaps
    let roadmaps;
    if (domain) {
      roadmaps = await roadmapService.getRoadmapsByDomain(userId, domain);
    } else {
      roadmaps = await roadmapService.getRoadmaps(userId);
    }
    
    // Calculate progress for each roadmap
    const roadmapsWithProgress = roadmaps.map(roadmap => {
      const totalMilestones = roadmap.milestones.length;
      const completedMilestones = roadmap.milestones.filter(m => m.status === 'completed').length;
      const progress = totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0;
      
      return {
        ...roadmap,
        progress,
        totalMilestones,
        completedMilestones,
      };
    });
    
    return NextResponse.json({ roadmaps: roadmapsWithProgress });
  } catch (error) {
    console.error('Error fetching roadmaps:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching roadmaps' },
      { status: 500 }
    );
  }
}

// Create a new roadmap
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const userId = session.user.id;
    const body = await request.json();
    
    // Validate input
    const { title, description, domain, status } = body;
    
    if (!title || !domain) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Create roadmap
    const roadmap = await roadmapService.createRoadmap({
      userId,
      title,
      description,
      domain,
      status: status || 'draft',
    });
    
    return NextResponse.json(
      { message: 'Roadmap created successfully', roadmap },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating roadmap:', error);
    return NextResponse.json(
      { error: 'An error occurred while creating the roadmap' },
      { status: 500 }
    );
  }
}