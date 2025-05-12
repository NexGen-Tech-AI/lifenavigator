import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/NextAuth';
import { prisma } from '@/lib/db';

interface RouteParams {
  params: {
    id: string;
  };
}

/**
 * GET /api/financial/tax/profile/:id
 * Get a specific tax profile by ID
 */
export async function GET(request: Request, { params }: RouteParams) {
  try {
    // Get the authenticated user
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }
    
    const userId = session.user.id;
    const profileId = params.id;
    
    // Fetch the tax profile
    const taxProfile = await prisma.taxProfile.findFirst({
      where: {
        id: profileId,
        userId: userId // Ensure the profile belongs to the authenticated user
      }
    });
    
    if (!taxProfile) {
      return NextResponse.json(
        { error: 'Tax profile not found' },
        { status: 404 }
      );
    }
    
    // Transform data for response
    const response = {
      ...taxProfile,
      w4: JSON.parse(taxProfile.w4 as string),
      income: JSON.parse(taxProfile.income as string),
      deductions: JSON.parse(taxProfile.deductions as string),
      credits: JSON.parse(taxProfile.credits as string)
    };
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching tax profile:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching tax profile' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/financial/tax/profile/:id
 * Update an existing tax profile
 */
export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    // Get the authenticated user
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }
    
    const userId = session.user.id;
    const profileId = params.id;
    
    // Verify the profile exists and belongs to the user
    const existingProfile = await prisma.taxProfile.findFirst({
      where: {
        id: profileId,
        userId: userId
      }
    });
    
    if (!existingProfile) {
      return NextResponse.json(
        { error: 'Tax profile not found' },
        { status: 404 }
      );
    }
    
    // Parse the request body
    const body = await request.json();
    const { w4, income, deductions, credits, taxYear } = body;
    
    // Prepare update data
    const updateData: any = {};
    
    if (w4) updateData.w4 = JSON.stringify(w4);
    if (income) updateData.income = JSON.stringify(income);
    if (deductions) updateData.deductions = JSON.stringify(deductions);
    if (credits) updateData.credits = JSON.stringify(credits);
    if (taxYear) updateData.taxYear = taxYear;
    
    // Update the profile
    const updatedProfile = await prisma.taxProfile.update({
      where: { id: profileId },
      data: updateData
    });
    
    // Transform data for response
    const response = {
      ...updatedProfile,
      w4: JSON.parse(updatedProfile.w4 as string),
      income: JSON.parse(updatedProfile.income as string),
      deductions: JSON.parse(updatedProfile.deductions as string),
      credits: JSON.parse(updatedProfile.credits as string)
    };
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error updating tax profile:', error);
    return NextResponse.json(
      { error: 'An error occurred while updating tax profile' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/financial/tax/profile/:id
 * Delete a tax profile
 */
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    // Get the authenticated user
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }
    
    const userId = session.user.id;
    const profileId = params.id;
    
    // Verify the profile exists and belongs to the user
    const existingProfile = await prisma.taxProfile.findFirst({
      where: {
        id: profileId,
        userId: userId
      }
    });
    
    if (!existingProfile) {
      return NextResponse.json(
        { error: 'Tax profile not found' },
        { status: 404 }
      );
    }
    
    // Delete the profile
    await prisma.taxProfile.delete({
      where: { id: profileId }
    });
    
    return NextResponse.json({ message: 'Tax profile deleted successfully' });
  } catch (error) {
    console.error('Error deleting tax profile:', error);
    return NextResponse.json(
      { error: 'An error occurred while deleting tax profile' },
      { status: 500 }
    );
  }
}