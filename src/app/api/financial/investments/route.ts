import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';
import { financialService } from '@/lib/services/financialService';

// Get all investments for the current user
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

// Create a new investment
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