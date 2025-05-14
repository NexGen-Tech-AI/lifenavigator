import { NextRequest, NextResponse } from 'next/server';
import { financialService } from '@/lib/services/financialService';
import { createSecureHandlers } from '@/lib/auth/route-helpers';

// Handler for GET request - gets all investments for the current user
async function getHandler(request: NextRequest) {
  try {
    // User is guaranteed to be available by withAuth middleware
    const userId = (request as any).user.id;
    
    // Get investments
    const investments = await financialService.getInvestments(userId);
    
    // Calculate total value and return
    const totalValue = investments.reduce((sum, inv) => sum + inv.value, 0);
    const totalCost = investments.reduce((sum, inv) => sum + inv.purchasePrice, 0);
    
    return NextResponse.json({
      investments,
      stats: {
        totalValue,
        totalCost,
        totalReturn: totalValue - totalCost,
        returnPercentage: totalCost > 0 ? ((totalValue - totalCost) / totalCost) * 100 : 0,
      }
    });
  } catch (error) {
    console.error('Error fetching investments:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching investments' },
      { status: 500 }
    );
  }
}

// Handler for POST request - creates a new investment
async function postHandler(request: NextRequest) {
  try {
    // User is guaranteed to be available by withAuth middleware
    const userId = (request as any).user.id;
    const body = await request.json();
    
    // Validate input
    const { name, type, value, purchasePrice, purchaseDate, notes } = body;
    
    if (!name || !type || value == null || purchasePrice == null || !purchaseDate) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Create investment
    const investment = await financialService.createInvestment({
      userId,
      name,
      type,
      value,
      purchasePrice,
      purchaseDate: new Date(purchaseDate),
      notes,
    });
    
    return NextResponse.json(
      { message: 'Investment created successfully', investment },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating investment:', error);
    return NextResponse.json(
      { error: 'An error occurred while creating the investment' },
      { status: 500 }
    );
  }
}

// Create secure route handlers
export const { GET, POST } = createSecureHandlers(
  { GET: getHandler, POST: postHandler },
  { requireSetupComplete: true }
);