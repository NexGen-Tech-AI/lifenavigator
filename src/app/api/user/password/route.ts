import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { compare, hash } from 'bcrypt';
import { createSecureHandlers } from '@/lib/auth/route-helpers';

async function handlePasswordUpdate(request: NextRequest, session: any) {
  try {
    // Get user ID from session
    const userId = session.user.id;

    // Parse request body
    const body = await request.json();
    const { currentPassword, newPassword } = body;

    // Validate required fields
    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { message: 'Current password and new password are required' },
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

    // Verify current password
    const isPasswordValid = await compare(currentPassword, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { message: 'Current password is incorrect' },
        { status: 401 }
      );
    }

    // Validate new password strength
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      return NextResponse.json(
        { message: 'Password must be at least 8 characters and include both letters and numbers' },
        { status: 400 }
      );
    }

    // Hash new password
    const hashedPassword = await hash(newPassword, 10);

    // Update user's password
    await prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedPassword,
      },
    });

    return NextResponse.json(
      { message: 'Password updated successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating password:', error);
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// Export secure handlers with CSRF protection
export const { PUT } = createSecureHandlers({
  PUT: handlePasswordUpdate
});