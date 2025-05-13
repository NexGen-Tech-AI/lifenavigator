import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/NextAuth';
import { prisma } from '@/lib/db';
import { compare } from 'bcrypt';

export async function POST(request: NextRequest) {
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

    // Parse request body
    const body = await request.json();
    const { password, confirmText } = body;

    // Validate confirmation text
    if (confirmText !== 'DELETE') {
      return NextResponse.json(
        { message: 'Please type DELETE to confirm account deletion' },
        { status: 400 }
      );
    }

    // Get user with password
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        password: true,
      },
    });

    if (!user || !user.password) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    // Verify password
    const isPasswordValid = await compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { message: 'Incorrect password' },
        { status: 401 }
      );
    }

    // Begin transaction to delete user and all related data
    await prisma.$transaction(async (prisma) => {
      // Delete user-related records first (respecting foreign key constraints)
      
      // Delete integrations
      await prisma.integrationToken.deleteMany({
        where: {
          integration: {
            userId,
          },
        },
      });
      
      await prisma.integrationSync.deleteMany({
        where: {
          integration: {
            userId,
          },
        },
      });
      
      await prisma.integration.deleteMany({
        where: { userId },
      });
      
      // Delete secure documents
      await prisma.documentTag.deleteMany({
        where: {
          secureDocument: {
            healthRecord: {
              userId,
            },
          },
        },
      });
      
      await prisma.documentShare.deleteMany({
        where: {
          secureDocument: {
            healthRecord: {
              userId,
            },
          },
        },
      });
      
      await prisma.documentAccessLog.deleteMany({
        where: {
          secureDocument: {
            healthRecord: {
              userId,
            },
          },
        },
      });
      
      await prisma.secureDocument.deleteMany({
        where: {
          healthRecord: {
            userId,
          },
        },
      });
      
      // Delete health records
      await prisma.medicalAppointment.deleteMany({
        where: {
          healthRecord: {
            userId,
          },
        },
      });
      
      await prisma.vitalSign.deleteMany({
        where: {
          healthRecord: {
            userId,
          },
        },
      });
      
      await prisma.healthRecord.deleteMany({
        where: { userId },
      });
      
      // Delete education records
      await prisma.certification.deleteMany({
        where: {
          educationRecord: {
            userId,
          },
        },
      });
      
      await prisma.course.deleteMany({
        where: {
          educationRecord: {
            userId,
          },
        },
      });
      
      await prisma.educationRecord.deleteMany({
        where: { userId },
      });
      
      // Delete career records
      await prisma.networkingEvent.deleteMany({
        where: {
          careerRecord: {
            userId,
          },
        },
      });
      
      await prisma.jobApplication.deleteMany({
        where: {
          careerRecord: {
            userId,
          },
        },
      });
      
      await prisma.skill.deleteMany({
        where: {
          careerRecord: {
            userId,
          },
        },
      });
      
      await prisma.careerRecord.deleteMany({
        where: { userId },
      });
      
      // Delete financial records
      await prisma.budgetCategory.deleteMany({
        where: {
          budget: {
            userId,
          },
        },
      });
      
      await prisma.budget.deleteMany({
        where: { userId },
      });
      
      await prisma.investment.deleteMany({
        where: { userId },
      });
      
      await prisma.financialRecord.deleteMany({
        where: { userId },
      });
      
      // Delete roadmaps
      await prisma.milestone.deleteMany({
        where: {
          roadmap: {
            userId,
          },
        },
      });
      
      await prisma.roadmap.deleteMany({
        where: { userId },
      });
      
      // Delete user goals and profiles
      await prisma.userGoals.deleteMany({
        where: { userId },
      });
      
      await prisma.riskProfile.deleteMany({
        where: { userId },
      });
      
      await prisma.userSettings.deleteMany({
        where: { userId },
      });
      
      await prisma.taxProfile.deleteMany({
        where: { userId },
      });
      
      // Delete auth-related records
      await prisma.session.deleteMany({
        where: { userId },
      });
      
      await prisma.account.deleteMany({
        where: { userId },
      });
      
      // Finally, delete the user
      await prisma.user.delete({
        where: { id: userId },
      });
    });

    return NextResponse.json(
      { message: 'Account deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting account:', error);
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}