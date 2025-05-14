import { NextRequest, NextResponse } from 'next/server';
import { financialService } from '@/lib/services/financialService';
import { withAuth } from '@/lib/auth/session';

// Handler for the GET request
async function handler(request: NextRequest) {
  try {
    // User is guaranteed to be available by withAuth middleware
    const userId = (request as any).user.id;
    
    // Get financial data
    const financialRecord = await financialService.getFinancialRecord(userId);
    
    // Get budgets
    const budgets = await financialService.getBudgets(userId);
    
    // Get investments
    const investments = await financialService.getInvestments(userId);
    
    // Get active budget
    const activeBudget = budgets.find(budget => budget.isActive);
    
    return NextResponse.json({
      financialRecord,
      activeBudget,
      budgetCount: budgets.length,
      investmentCount: investments.length,
      totalInvestments: investments.reduce((sum, inv) => sum + inv.value, 0),
    });
  } catch (error) {
    console.error('Error fetching financial overview:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching financial data' },
      { status: 500 }
    );
  }
}

// Apply the withAuth middleware to the GET handler
export const GET = withAuth(handler, {
  allowedMethods: ['GET'],
  requireSetupComplete: true,
});