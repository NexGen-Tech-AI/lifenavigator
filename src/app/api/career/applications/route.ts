import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/NextAuth';
import { prisma } from '@/lib/db';
import { JobApplication, JobApplicationCreate } from '@/types/career';

// Mock data for job applications
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

// Generate a unique ID for new applications
function generateId(): string {
  return Math.random().toString(36).substring(2, 15);
}

/**
 * GET /api/career/applications
 * Get all job applications for the current user
 */
export async function GET(request: Request) {
  try {
    // Get the authenticated user
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }
    
    const userId = session.user.id;
    
    // For now, return mock data
    // In production, we would fetch from database
    const userApplications = mockApplications.filter(app => app.userId === userId);
    
    return NextResponse.json(userApplications);
  } catch (error) {
    console.error('Error fetching job applications:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching job applications' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/career/applications
 * Create a new job application
 */
export async function POST(request: Request) {
  try {
    // Get the authenticated user
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }
    
    const userId = session.user.id;
    
    // Parse the request body
    const body: JobApplicationCreate = await request.json();
    
    // Validate required fields
    if (!body.companyName || !body.jobTitle || !body.applicationDate || !body.status) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // In a real app, we would store in database
    // For now, create a mock entry
    const newApplication: JobApplication = {
      id: generateId(),
      userId,
      ...body
    };
    
    // In production, we would push to database
    // For demo, we'll just return the new application
    
    return NextResponse.json(newApplication, { status: 201 });
  } catch (error) {
    console.error('Error creating job application:', error);
    return NextResponse.json(
      { error: 'An error occurred while creating job application' },
      { status: 500 }
    );
  }
}