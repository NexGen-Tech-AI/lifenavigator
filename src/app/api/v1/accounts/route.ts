import { NextRequest, NextResponse } from 'next/server';

// GET /api/v1/accounts - Return demo financial accounts
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const includeSummary = searchParams.get('includeSummary') === 'true';
  
  const accounts = [
    {
      id: '1',
      account_name: 'Primary Checking',
      account_type: 'CHECKING',
      institution_name: 'Chase Bank',
      current_balance: 15000,
      available_balance: 15000,
      currency: 'USD'
    },
    {
      id: '2',
      account_name: 'Emergency Savings',
      account_type: 'SAVINGS',
      institution_name: 'Ally Bank',
      current_balance: 45000,
      available_balance: 45000,
      currency: 'USD'
    },
    {
      id: '3',
      account_name: 'Brokerage Account',
      account_type: 'INVESTMENT',
      institution_name: 'Vanguard',
      current_balance: 85000,
      available_balance: 85000,
      currency: 'USD'
    },
    {
      id: '4',
      account_name: '401(k) - Primary',
      account_type: 'INVESTMENT',
      institution_name: 'Fidelity',
      current_balance: 225000,
      available_balance: 225000,
      currency: 'USD'
    },
    {
      id: '5',
      account_name: '401(k) - Spouse',
      account_type: 'INVESTMENT',
      institution_name: 'Vanguard',
      current_balance: 125000,
      available_balance: 125000,
      currency: 'USD'
    },
    {
      id: '6',
      account_name: 'Roth IRA',
      account_type: 'INVESTMENT',
      institution_name: 'Charles Schwab',
      current_balance: 45000,
      available_balance: 45000,
      currency: 'USD'
    },
    {
      id: '7',
      account_name: '529 College Fund',
      account_type: 'INVESTMENT',
      institution_name: 'Texas 529',
      current_balance: 25000,
      available_balance: 25000,
      currency: 'USD'
    },
    {
      id: '8',
      account_name: 'Chase Sapphire Reserve',
      account_type: 'CREDIT_CARD',
      institution_name: 'Chase Bank',
      current_balance: -2500,
      available_balance: 17500,
      credit_limit: 20000,
      currency: 'USD'
    },
    {
      id: '9',
      account_name: 'Home Mortgage',
      account_type: 'MORTGAGE',
      institution_name: 'Wells Fargo',
      current_balance: -320000,
      available_balance: 0,
      currency: 'USD',
      property_value: 450000
    },
    {
      id: '10',
      account_name: 'Auto Loan',
      account_type: 'LOAN',
      institution_name: 'Toyota Financial',
      current_balance: -15000,
      available_balance: 0,
      currency: 'USD'
    }
  ];

  // Calculate summary from accounts
  const totalAssets = accounts
    .filter(acc => acc.current_balance > 0)
    .reduce((sum, acc) => sum + acc.current_balance, 0);
  
  const totalLiabilities = Math.abs(accounts
    .filter(acc => acc.current_balance < 0)
    .reduce((sum, acc) => sum + acc.current_balance, 0));
  
  const netWorth = totalAssets - totalLiabilities;
  
  // Debug logging
  console.log('Accounts API Summary:', {
    totalAssets,
    totalLiabilities,
    netWorth,
    accountCount: accounts.length,
    includeSummary
  });

  const response: any = {
    data: accounts,
    pagination: {
      page: 1,
      pageSize: 20,
      total: accounts.length,
      totalPages: 1,
      hasMore: false
    }
  };

  if (includeSummary) {
    response.summary = {
      totalAssets,
      totalLiabilities,
      netWorth
    };
  }

  return NextResponse.json(response);
}

// POST - No-op for demo
export async function POST() {
  return NextResponse.json({ 
    success: false, 
    message: 'Demo mode - read only' 
  }, { status: 403 });
}