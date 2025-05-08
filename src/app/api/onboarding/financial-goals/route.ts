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
        financialGoals: goals,
      },
      update: {
        financialGoals: goals,
      },
    });
    
    // Create initial financial record if it doesn't exist
    // This is just a placeholder record, actual data will be filled in later
    const financialRecord = await prisma.financialRecord.upsert({
      where: { userId },
      create: {
        userId,
        totalNetWorth: null,
        totalAssets: null,
        totalLiabilities: null,
      },
      update: {},
    });
    
    return NextResponse.json(
      { message: 'Financial goals saved successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error saving financial goals:', error);
    return NextResponse.json(
      { error: 'An error occurred while saving financial goals' },
      { status: 500 }
    );
  }
}