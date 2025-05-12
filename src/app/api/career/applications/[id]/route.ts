import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/NextAuth';
import { JobApplication, JobApplicationUpdate } from '@/types/career';

// Reuse the mock data from the main applications route
// In a real application, this would be fetched from a database
const mockApplications: JobApplication[] = [
  {
    id: '1',
    userId: 'user1',
    companyName: 'Tech Innovations Inc.',
    jobTitle: 'Senior Frontend Developer',
    jobDescription: 'Looking for an experienced frontend developer to join our team.',
    applicationDate: '2025-05-01',
    status: 'applied',
    contactName: 'Jane Smith',
    contactEmail: 'jane.smith@techinnovations.com',
    notes: 'Had a great initial call with the recruiter.',
  },
  {
    id: '2',
    userId: 'user1',
    companyName: 'Digital Solutions LLC',
    jobTitle: 'Full Stack Engineer',
    jobDescription: 'Building modern web applications using React, Node.js, and AWS.',
    applicationDate: '2025-05-05',
    status: 'interview',
    contactName: 'Michael Johnson',
    contactEmail: 'michael.j@digitalsolutions.com',
    notes: 'Technical interview scheduled for next week.',
  },
  {
    id: '3',
    userId: 'user1',
    companyName: 'Horizon Software',
    jobTitle: 'UI/UX Developer',
    jobDescription: 'Creating beautiful and intuitive user interfaces for our products.',
    applicationDate: '2025-04-28',
    status: 'rejected',
    contactName: 'Sarah Williams',
    contactEmail: 'sarah@horizonsoftware.com',
    notes: 'They went with someone with more specific experience in their industry.',
  },
  {
    id: '4',
    userId: 'user1',
    companyName: 'InnoTech Corp',
    jobTitle: 'React Developer',
    jobDescription: 'Building and maintaining React-based applications.',
    applicationDate: '2025-05-10',
    status: 'offered',
    contactName: 'David Chen',
    contactEmail: 'david.chen@innotech.com',
    notes: '$120k offer, considering negotiation for more equity.',
  },
];

/**
 * GET /api/career/applications/[id]
 * Get a specific job application by ID
 */
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    
    // Get the authenticated user
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }
    
    const userId = session.user.id;
    
    // Find the application in mock data
    // In production, this would query the database
    const application = mockApplications.find(app => app.id === id && app.userId === userId);
    
    if (!application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(application);
  } catch (error) {
    console.error('Error fetching job application:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching job application' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/career/applications/[id]
 * Update a specific job application
 */
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    
    // Get the authenticated user
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }
    
    const userId = session.user.id;
    
    // Find the application in mock data
    // In production, this would query the database
    const applicationIndex = mockApplications.findIndex(app => app.id === id && app.userId === userId);
    
    if (applicationIndex === -1) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      );
    }
    
    // Parse the request body
    const updates: JobApplicationUpdate = await request.json();
    
    // In a real app, we would update the database
    // For now, we'll create an updated mock object
    const updatedApplication: JobApplication = {
      ...mockApplications[applicationIndex],
      ...updates
    };
    
    // Return the updated application
    return NextResponse.json(updatedApplication);
  } catch (error) {
    console.error('Error updating job application:', error);
    return NextResponse.json(
      { error: 'An error occurred while updating job application' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/career/applications/[id]
 * Delete a specific job application
 */
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    
    // Get the authenticated user
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }
    
    const userId = session.user.id;
    
    // Find the application in mock data
    // In production, this would query the database
    const applicationIndex = mockApplications.findIndex(app => app.id === id && app.userId === userId);
    
    if (applicationIndex === -1) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      );
    }
    
    // In a real app, we would delete from the database
    // For now, we'll just acknowledge the deletion
    
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting job application:', error);
    return NextResponse.json(
      { error: 'An error occurred while deleting job application' },
      { status: 500 }
    );
  }
}