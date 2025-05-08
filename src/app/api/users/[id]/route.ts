import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { prisma } from '@/lib/db';
import { authOptions } from '../../auth/NextAuth';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Get user ID from params
    const userId = params.id;
    
    // Check if the request is authenticated or comes from the server
    const session = await getServerSession(authOptions);
    const isServerRequest = request.headers.get('x-auth-token') === process.env.API_SECRET_KEY;
    
    // Only allow if authenticated as the requested user or if it's a server request
    if (!isServerRequest && (!session || session.user.id !== userId)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    
    // Get user data
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        setupCompleted: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    return NextResponse.json({ user }, { status: 200 });
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching user data' },
      { status: 500 }
    );
  }
}