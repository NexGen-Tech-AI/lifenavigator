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
        healthGoals: goals,
      },
      update: {
        healthGoals: goals,
      },
    });
    
    // Create initial health record if it doesn't exist
    const healthRecord = await prisma.healthRecord.upsert({
      where: { userId },
      create: {
        userId,
        height: goals.height ? parseFloat(goals.height) : null,
        weight: goals.weight ? parseFloat(goals.weight) : null,
        allergies: (goals.medicalConditions || []).join(', ') || null,
      },
      update: {
        height: goals.height ? parseFloat(goals.height) : null,
        weight: goals.weight ? parseFloat(goals.weight) : null,
        allergies: (goals.medicalConditions || []).join(', ') || null,
      },
    });
    
    return NextResponse.json(
      { message: 'Health goals saved successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error saving health goals:', error);
    return NextResponse.json(
      { error: 'An error occurred while saving health goals' },
      { status: 500 }
    );
  }
}