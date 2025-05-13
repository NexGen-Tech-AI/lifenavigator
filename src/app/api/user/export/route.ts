import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/NextAuth';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    // Get the session
    const session = await getServerSession(authOptions);

    // Check if user is authenticated
    if (!session || !session.user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user ID from session
    const userId = session.user.id;

    // Query all user data
    const userData = await prisma.$transaction(async (prisma) => {
      // Get user profile
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          createdAt: true,
          updatedAt: true,
          setupCompleted: true,
        },
      });

      if (!user) {
        throw new Error('User not found');
      }

      // Get user settings
      const settings = await prisma.userSettings.findUnique({
        where: { userId },
      });

      // Get risk profile
      const riskProfile = await prisma.riskProfile.findUnique({
        where: { userId },
      });

      // Get user goals
      const goals = await prisma.userGoals.findUnique({
        where: { userId },
      });

      // Get financial records
      const financialRecords = await prisma.financialRecord.findMany({
        where: { userId },
      });

      // Get budgets
      const budgets = await prisma.budget.findMany({
        where: { userId },
        include: {
          categories: true,
        },
      });

      // Get investments
      const investments = await prisma.investment.findMany({
        where: { userId },
      });

      // Get career records
      const careerRecords = await prisma.careerRecord.findMany({
        where: { userId },
        include: {
          skills: true,
          jobApplications: true,
          networkingEvents: true,
        },
      });

      // Get education records
      const educationRecords = await prisma.educationRecord.findMany({
        where: { userId },
        include: {
          courses: true,
          certifications: true,
        },
      });

      // Get health records
      const healthRecords = await prisma.healthRecord.findMany({
        where: { userId },
        include: {
          vitalSigns: true,
          appointments: true,
        },
      });

      // Get roadmaps
      const roadmaps = await prisma.roadmap.findMany({
        where: { userId },
        include: {
          milestones: true,
        },
      });

      // Get tax profiles
      const taxProfiles = await prisma.taxProfile.findMany({
        where: { userId },
      });

      // Get integrations
      const integrations = await prisma.integration.findMany({
        where: { userId },
        include: {
          syncHistory: true,
        },
      });

      // Return all user data
      return {
        user,
        settings,
        riskProfile,
        goals,
        financialRecords,
        budgets,
        investments,
        careerRecords,
        educationRecords,
        healthRecords,
        roadmaps,
        taxProfiles,
        integrations,
      };
    });

    // Format the data as JSON
    const exportData = {
      exportDate: new Date().toISOString(),
      userData,
    };

    // Return the data
    return NextResponse.json(exportData, {
      headers: {
        'Content-Disposition': 'attachment; filename="life-navigator-data-export.json"',
      },
    });
  } catch (error) {
    console.error('Error exporting user data:', error);
    return NextResponse.json(
      { message: 'Failed to export user data' },
      { status: 500 }
    );
  }
}