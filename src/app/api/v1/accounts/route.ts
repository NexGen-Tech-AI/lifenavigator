/**
 * Financial accounts management API - Supabase version
 * GET /api/v1/accounts - List all accounts
 * POST /api/v1/accounts - Create manual account
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import {
  withErrorHandler,
  requireAuth,
  validateRequest,
  successResponse,
  getPaginationParams,
  getQueryParams,
  ConflictError
} from '@/lib/api/supabase-route-helpers';

// Define AccountType enum
export enum AccountType {
  CHECKING = 'CHECKING',
  SAVINGS = 'SAVINGS',
  INVESTMENT = 'INVESTMENT',
  CREDIT_CARD = 'CREDIT_CARD',
  LOAN = 'LOAN',
  MORTGAGE = 'MORTGAGE'
}

// Validation schemas
const createAccountSchema = z.object({
  accountName: z.string().min(1).max(100),
  accountType: z.nativeEnum(AccountType),
  institutionName: z.string().min(1).max(100),
  currentBalance: z.number(),
  availableBalance: z.number().optional(),
  creditLimit: z.number().optional(),
  minimumPayment: z.number().optional(),
  apr: z.number().min(0).max(100).optional(),
  accountNumber: z.string().max(4).optional(), // Last 4 digits only
  currency: z.string().length(3).default('USD')
});

/**
 * GET /api/v1/accounts
 * List user's financial accounts
 */
export const GET = withErrorHandler(async (request: NextRequest) => {
  // Check if we're in demo mode - multiple detection methods
  const url = new URL(request.url);
  const isDemoMode = url.hostname.includes('demo') || 
                     url.hostname.includes('mrxm1q5s5') ||
                     url.searchParams.get('demo') === 'true' ||
                     process.env.NEXT_PUBLIC_DEMO_MODE === 'true';
  
  // In demo mode, return mock data
  if (isDemoMode) {
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
        }
      ],
      summary: {
        totalAssets: 145000,
        totalLiabilities: 0,
        netWorth: 145000
      },
      metadata: { 
        summary: {
          totalAssets: 145000,
          totalLiabilities: 0,
          netWorth: 145000
        }
      },
      pagination: {
        page: 1,
        pageSize: 20,
        total: 3,
        totalPages: 1,
        hasMore: false
      }
    });
  }
  
  const user = await requireAuth(request);
  const supabase = await createClient();
  
  // Get query parameters
  const { search } = getQueryParams(request);
  const { page, pageSize, skip } = getPaginationParams(request);
  
  // Build query
  let query = supabase
    .from('financial_accounts')
    .select('*', { count: 'exact' })
    .eq('user_id', user.id)
    .eq('is_active', true)
    .order('created_at', { ascending: false });
  
  // Add search filter if provided
  if (search) {
    query = query.or(`account_name.ilike.%${search}%,institution_name.ilike.%${search}%`);
  }
  
  // Add pagination
  query = query.range(skip, skip + pageSize - 1);
  
  const { data: accounts, error, count } = await query;
  
  if (error) throw error;
  
  // Calculate account summaries
  const summary = accounts?.reduce((acc: any, account: any) => {
    const balance = account.current_balance || 0;
    
    if (account.account_type === 'CREDIT_CARD' || account.account_type === 'LOAN' || account.account_type === 'MORTGAGE') {
      acc.totalLiabilities += balance;
    } else {
      acc.totalAssets += balance;
    }
    
    acc.netWorth = acc.totalAssets - acc.totalLiabilities;
    return acc;
  }, { totalAssets: 0, totalLiabilities: 0, netWorth: 0 }) || { totalAssets: 0, totalLiabilities: 0, netWorth: 0 };
  
  // Return response with both data formats for compatibility
  return NextResponse.json({
    data: accounts || [],
    summary,
    metadata: { summary },
    pagination: {
      page,
      pageSize,
      total: count || 0,
      totalPages: Math.ceil((count || 0) / pageSize),
      hasMore: page < Math.ceil((count || 0) / pageSize)
    }
  });
});

/**
 * POST /api/v1/accounts
 * Create a manual financial account
 */
export const POST = withErrorHandler(async (request: NextRequest) => {
  const user = await requireAuth(request);
  const supabase = await createClient();
  
  // Validate request body
  const data = await validateRequest(request, createAccountSchema) as z.infer<typeof createAccountSchema>;
  
  // Check for duplicate accounts
  const { data: existing } = await supabase
    .from('financial_accounts')
    .select('id')
    .eq('user_id', user.id)
    .eq('account_name', data.accountName)
    .eq('institution_name', data.institutionName)
    .eq('is_active', true)
    .single();
  
  if (existing) {
    throw new ConflictError('An account with this name already exists at this institution');
  }
  
  // Create the account
  const { data: account, error } = await supabase
    .from('financial_accounts')
    .insert({
      user_id: user.id,
      account_name: data.accountName,
      account_type: data.accountType,
      institution_name: data.institutionName,
      current_balance: data.currentBalance,
      available_balance: data.availableBalance || data.currentBalance,
      credit_limit: data.creditLimit,
      minimum_payment: data.minimumPayment,
      apr: data.apr,
      account_number: data.accountNumber,
      currency: data.currency,
      data_source: 'MANUAL',
      is_active: true
    })
    .select()
    .single();
  
  if (error) throw error;
  
  return successResponse(account, 'Account created successfully', 201);
});