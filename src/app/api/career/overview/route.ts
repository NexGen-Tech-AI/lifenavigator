import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from "@/app/api/auth/NextAuth"; // Update the path to the correct module
import { careerService } from '@/lib/services/careerService';

// Get career overview for current user
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
    
    // Get career data
    const careerRecord = await careerService.getCareerRecord(userId);
    
    if (!careerRecord) {
      return NextResponse.json(
        { message: 'No career record found' },
        { status: 404 }
      );
    }
    
    // Prepare response data
    const skills = careerRecord.skills || [];
    const jobApplications = careerRecord.jobApplications || [];
    const networkingEvents = careerRecord.networkingEvents || [];
    
    // Calculate some stats
    const topSkills = [...skills]
      .sort((a, b) => b.proficiency - a.proficiency)
      .slice(0, 5);
      
    const activeApplications = jobApplications.filter(
      app => app.status === 'applied' || app.status === 'interview'
    );
    
    const upcomingEvents = networkingEvents
      .filter(event => new Date(event.date) >= new Date())
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    return NextResponse.json({
      careerRecord,
      stats: {
        topSkills,
        activeApplicationsCount: activeApplications.length,
        upcomingEventsCount: upcomingEvents.length,
        nextEvent: upcomingEvents[0] || null,
      }
    });
  } catch (error) {
    console.error('Error fetching career overview:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching career data' },
      { status: 500 }
    );
  }
}