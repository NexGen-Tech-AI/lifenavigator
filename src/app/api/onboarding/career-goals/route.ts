import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, goals } = body;
    
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
    
    // Upsert user goals (create if doesn't exist, update if exists)
    const userGoals = await prisma.userGoals.upsert({
      where: { userId },
      create: {
        userId,
        careerGoals: goals,
      },
      update: {
        careerGoals: goals,
      },
    });
    
    // Create initial career record if it doesn't exist
    const careerRecord = await prisma.careerRecord.upsert({
      where: { userId },
      create: {
        userId,
        currentRole: goals.currentRole || null,
        industry: goals.industry || null,
        yearsExperience: goals.yearsExperience ? parseInt(goals.yearsExperience.split('-')[0]) : null,
        salaryRange: goals.salaryRange || null,
      },
      update: {
        currentRole: goals.currentRole || null,
        industry: goals.industry || null,
        yearsExperience: goals.yearsExperience ? parseInt(goals.yearsExperience.split('-')[0]) : null,
        salaryRange: goals.salaryRange || null,
      },
    });
    
    return NextResponse.json(
      { message: 'Career goals saved successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error saving career goals:', error);
    return NextResponse.json(
      { error: 'An error occurred while saving career goals' },
      { status: 500 }
    );
  }
}