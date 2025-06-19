/**
 * Financial accounts management API - Individual account operations
 * GET /api/v1/accounts/[id] - Get account details
 * PUT /api/v1/accounts/[id] - Update account
 * DELETE /api/v1/accounts/[id] - Delete account
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import {
  withErrorHandler,
  requireAuth,
  validateRequest,
  successResponse,
  NotFoundError,
  ForbiddenError
} from '@/lib/api/supabase-route-helpers';

// Update account schema
const updateAccountSchema = z.object({
  accountName: z.string().min(1).max(100).optional(),
  accountType: z.enum(['CHECKING', 'SAVINGS', 'INVESTMENT', 'CREDIT_CARD', 'LOAN', 'MORTGAGE']).optional(),
  institutionName: z.string().min(1).max(100).optional(),
  currentBalance: z.number().optional(),
  availableBalance: z.number().optional(),
  creditLimit: z.number().optional(),
  minimumPayment: z.number().optional(),
  apr: z.number().min(0).max(100).optional(),
  accountNumber: z.string().max(4).optional(),
  currency: z.string().length(3).optional()
});

interface RouteParams {
  params: {
    id: string;
  };
}

/**
 * GET /api/v1/accounts/[id]
 * Get individual account details
 */
export const GET = withErrorHandler(async (request: NextRequest, { params }: RouteParams) => {
  const user = await requireAuth(request);
  const supabase = await createClient();
  
  const { data: account, error } = await supabase
    .from('financial_accounts')
    .select('*')
    .eq('id', params.id)
    .eq('user_id', user.id)
    .single();
  
  if (error || !account) {
    throw new NotFoundError('Account not found');
  }
  
  return successResponse(account);
});

/**
 * PUT /api/v1/accounts/[id]
 * Update account details
 */
export const PUT = withErrorHandler(async (request: NextRequest, { params }: RouteParams) => {
  const user = await requireAuth(request);
  const supabase = await createClient();
  
  // First check if account exists and belongs to user
  const { data: existing } = await supabase
    .from('financial_accounts')
    .select('id, data_source')
    .eq('id', params.id)
    .eq('user_id', user.id)
    .single();
  
  if (!existing) {
    throw new NotFoundError('Account not found');
  }
  
  // Validate request body
  const data = await validateRequest(request, updateAccountSchema) as z.infer<typeof updateAccountSchema>;
  
  // Build update object
  const updateData: any = {};
  if (data.accountName !== undefined) updateData.account_name = data.accountName;
  if (data.accountType !== undefined) updateData.account_type = data.accountType;
  if (data.institutionName !== undefined) updateData.institution_name = data.institutionName;
  if (data.currentBalance !== undefined) updateData.current_balance = data.currentBalance;
  if (data.availableBalance !== undefined) updateData.available_balance = data.availableBalance;
  if (data.creditLimit !== undefined) updateData.credit_limit = data.creditLimit;
  if (data.minimumPayment !== undefined) updateData.minimum_payment = data.minimumPayment;
  if (data.apr !== undefined) updateData.apr = data.apr;
  if (data.accountNumber !== undefined) updateData.account_number = data.accountNumber;
  if (data.currency !== undefined) updateData.currency = data.currency;
  
  // Update the account
  const { data: account, error } = await supabase
    .from('financial_accounts')
    .update({
      ...updateData,
      updated_at: new Date().toISOString()
    })
    .eq('id', params.id)
    .eq('user_id', user.id)
    .select()
    .single();
  
  if (error) throw error;
  
  return successResponse(account, 'Account updated successfully');
});

/**
 * DELETE /api/v1/accounts/[id]
 * Soft delete account (sets is_active to false)
 */
export const DELETE = withErrorHandler(async (request: NextRequest, { params }: RouteParams) => {
  const user = await requireAuth(request);
  const supabase = await createClient();
  
  // Check if account exists and belongs to user
  const { data: existing } = await supabase
    .from('financial_accounts')
    .select('id')
    .eq('id', params.id)
    .eq('user_id', user.id)
    .single();
  
  if (!existing) {
    throw new NotFoundError('Account not found');
  }
  
  // Soft delete by setting is_active to false
  const { error } = await supabase
    .from('financial_accounts')
    .update({
      is_active: false,
      updated_at: new Date().toISOString()
    })
    .eq('id', params.id)
    .eq('user_id', user.id);
  
  if (error) throw error;
  
  return successResponse(null, 'Account deleted successfully');
});