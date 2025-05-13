import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/NextAuth';
import { prisma } from '@/lib/db';
import { userService } from '@/lib/services/userService';

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

    // Fetch user data from the database
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        userGoals: true,
        riskProfile: true,
        settings: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    // Return user data (excluding sensitive information)
    return NextResponse.json({
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
      setupCompleted: user.setupCompleted,
      goals: user.userGoals,
      riskProfile: user.riskProfile,
      settings: user.settings,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
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
    const { name, email } = body;

    // Validate required fields
    if (!name || !email) {
      return NextResponse.json(
        { message: 'Name and email are required' },
        { status: 400 }
      );
    }

    // Check if email is already in use by another user
    if (email !== session.user.email) {
      const existingUser = await userService.getUserByEmail(email);
      if (existingUser && existingUser.id !== userId) {
        return NextResponse.json(
          { message: 'Email is already in use' },
          { status: 409 }
        );
      }
    }

    // Update user data
    const updatedUser = await userService.updateUser(userId, { name, email });

    // Return updated user data (excluding sensitive information)
    return NextResponse.json({
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      image: updatedUser.image,
      createdAt: updatedUser.createdAt,
      updatedAt: updatedUser.updatedAt,
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}