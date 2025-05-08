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
        educationGoals: goals,
      },
      update: {
        educationGoals: goals,
      },
    });
    
    // Create initial education record if it doesn't exist
    const educationRecord = await prisma.educationRecord.upsert({
      where: { userId },
      create: {
        userId,
        highestDegree: goals.highestDegree || null,
        fieldOfStudy: goals.fieldOfStudy || null,
      },
      update: {
        highestDegree: goals.highestDegree || null,
        fieldOfStudy: goals.fieldOfStudy || null,
      },
    });
    
    return NextResponse.json(
      { message: 'Education goals saved successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error saving education goals:', error);
    return NextResponse.json(
      { error: 'An error occurred while saving education goals' },
      { status: 500 }
    );
  }
}