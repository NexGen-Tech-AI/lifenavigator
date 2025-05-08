import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, riskTheta, financialRiskTolerance, careerRiskTolerance, healthRiskTolerance, educationRiskTolerance, assessmentResponses } = body;
    
    if (!userId || riskTheta === undefined) {
      return NextResponse.json(
        { error: 'User ID and risk theta are required' },
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
    
    // Upsert risk profile (create if doesn't exist, update if exists)
    const riskProfile = await prisma.riskProfile.upsert({
      where: { userId },
      create: {
        userId,
        riskTheta,
        financialRiskTolerance: financialRiskTolerance || null,
        careerRiskTolerance: careerRiskTolerance || null,
        healthRiskTolerance: healthRiskTolerance || null,
        educationRiskTolerance: educationRiskTolerance || null,
        assessmentResponses: assessmentResponses || {},
      },
      update: {
        riskTheta,
        financialRiskTolerance: financialRiskTolerance || null,
        careerRiskTolerance: careerRiskTolerance || null,
        healthRiskTolerance: healthRiskTolerance || null,
        educationRiskTolerance: educationRiskTolerance || null,
        assessmentResponses: assessmentResponses || {},
      },
    });
    
    return NextResponse.json(
      { message: 'Risk profile saved successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error saving risk profile:', error);
    return NextResponse.json(
      { error: 'An error occurred while saving risk profile' },
      { status: 500 }
    );
  }
}