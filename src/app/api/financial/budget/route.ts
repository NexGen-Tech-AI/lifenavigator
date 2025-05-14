import { NextRequest, NextResponse } from 'next/server';
import { financialService } from '@/lib/services/financialService';
import { createSecureHandlers } from '@/lib/auth/route-helpers';

// Handler for GET request - get all budgets for the current user
async function getHandler(request: NextRequest) {
  try {
    // User is guaranteed to be available by withAuth middleware
    const userId = (request as any).user.id;
    
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

// Handler for POST request - create a new budget
async function postHandler(request: NextRequest) {
  try {
    // User is guaranteed to be available by withAuth middleware
    const userId = (request as any).user.id;
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

// Create secure route handlers
export const { GET, POST } = createSecureHandlers(
  { GET: getHandler, POST: postHandler },
  { requireSetupComplete: true }
);