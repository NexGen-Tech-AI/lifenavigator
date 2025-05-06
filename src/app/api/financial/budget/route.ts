import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';
import { financialService } from '@/lib/services/financialService';

// Get all budgets for the current user
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const userId = session.user.id;
    
    // Get budgets
    const budgets = await financialService.getBudgets(userId);
    
    return NextResponse.json({ budgets });
  } catch (error) {
    console.error('Error fetching budgets:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching budgets' },
      { status: 500 }
    );
  }
}

// Create a new budget
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const userId = session.user.id;
    const body = await request.json();
    
    // Validate input
    const { name, totalBudget, startDate, endDate, categories } = body;
    
    if (!name || !totalBudget || !startDate) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Create budget
    const budget = await financialService.createBudget({
      userId,
      name,
      totalBudget,
      startDate: new Date(startDate),
      endDate: endDate ? new Date(endDate) : undefined,
      categories,
    });
    
    return NextResponse.json(
      { message: 'Budget created successfully', budget },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating budget:', error);
    return NextResponse.json(
      { error: 'An error occurred while creating the budget' },
      { status: 500 }
    );
  }
}