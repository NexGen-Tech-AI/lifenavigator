import { NextRequest, NextResponse } from 'next/server';
import { careerService } from '@/lib/services/careerService';
import { createSecureHandlers } from '@/lib/auth/route-helpers';

// Handler for GET request - get career overview for current user
async function getHandler(request: NextRequest) {
  try {
    // User is guaranteed to be available by withAuth middleware
    const userId = (request as any).user.id;
    
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

// Create secure route handlers
export const { GET } = createSecureHandlers(
  { GET: getHandler },
  { requireSetupComplete: true }
);