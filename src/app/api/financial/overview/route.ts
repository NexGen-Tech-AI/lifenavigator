import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';
import { financialService } from '@/lib/services/financialService';

// Get financial overview for current user
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