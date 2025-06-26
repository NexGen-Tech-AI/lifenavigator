import { NextRequest, NextResponse } from 'next/server';

// GET /api/v1/accounts - Return demo financial accounts
export async function GET() {
  return NextResponse.json({
    data: [
      {
        id: '1',
        account_name: 'Demo Checking',
        account_type: 'CHECKING',
        institution_name: 'Demo Bank',
        current_balance: 15000,
        available_balance: 15000,
        currency: 'USD'
      },
      {
        id: '2',
        account_name: 'Demo Savings',
        account_type: 'SAVINGS',
        institution_name: 'Demo Bank',
        current_balance: 45000,
        available_balance: 45000,
        currency: 'USD'
      },
      {
        id: '3',
        account_name: 'Demo Investment',
        account_type: 'INVESTMENT',
        institution_name: 'Demo Brokerage',
        current_balance: 85000,
        available_balance: 85000,
        currency: 'USD'
      },
      {
        id: '4',
        account_name: 'Demo Credit Card',
        account_type: 'CREDIT_CARD',
        institution_name: 'Demo Bank',
        current_balance: -2500,
        available_balance: 7500,
        credit_limit: 10000,
        currency: 'USD'
      }
    ],
    summary: {
      totalAssets: 145000,
      totalLiabilities: 2500,
      netWorth: 142500
    },
    metadata: { 
      summary: {
        totalAssets: 145000,
        totalLiabilities: 2500,
        netWorth: 142500
      }
    },
    pagination: {
      page: 1,
      pageSize: 20,
      total: 4,
      totalPages: 1,
      hasMore: false
    }
  });
}

// POST - No-op for demo
export async function POST() {
  return NextResponse.json({ 
    success: false, 
    message: 'Demo mode - read only' 
  }, { status: 403 });
}