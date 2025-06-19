/**
 * Transactions API - Supabase version
 * GET /api/v1/transactions - List transactions
 * POST /api/v1/transactions - Create transaction
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'
import {
  withErrorHandler,
  requireAuth,
  validateRequest,
  getPaginationParams,
  getQueryParams,
  paginatedResponse,
  successResponse
} from '@/lib/api/supabase-route-helpers'

// Validation schema
const createTransactionSchema = z.object({
  account_id: z.string().uuid(),
  transaction_date: z.string(),
  amount: z.number(),
  description: z.string(),
  category_id: z.string().uuid().optional(),
  notes: z.string().optional(),
  tags: z.array(z.string()).optional()
})

// GET /api/v1/transactions
export const GET = withErrorHandler(async (request: NextRequest) => {
  const user = await requireAuth(request)
  const supabase = await createClient()
  
  const { page, pageSize, skip } = getPaginationParams(request)
  const params = getQueryParams(request)
  
  // Build query
  let query = supabase
    .from('transactions')
    .select('*, financial_accounts!inner(*)', { count: 'exact' })
    .eq('user_id', user.id)
  
  // Apply filters
  if (params.account_id) {
    query = query.eq('account_id', params.account_id)
  }
  
  if (params.start_date) {
    query = query.gte('transaction_date', params.start_date)
  }
  
  if (params.end_date) {
    query = query.lte('transaction_date', params.end_date)
  }
  
  if (params.min_amount) {
    query = query.gte('amount', parseFloat(params.min_amount))
  }
  
  if (params.max_amount) {
    query = query.lte('amount', parseFloat(params.max_amount))
  }
  
  if (params.search) {
    query = query.ilike('description', `%${params.search}%`)
  }
  
  // Execute query with pagination
  const { data: transactions, error, count } = await query
    .order('transaction_date', { ascending: false })
    .order('created_at', { ascending: false })
    .range(skip, skip + pageSize - 1)
  
  if (error) {
    console.error('Error fetching transactions:', error)
    return NextResponse.json({ error: 'Failed to fetch transactions' }, { status: 500 })
  }
  
  // Calculate summary if requested
  if (params.include_summary === 'true') {
    const { data: summaryData } = await supabase
      .from('transactions')
      .select('amount')
      .eq('user_id', user.id)
      .gte('transaction_date', params.start_date || new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString())
      .lte('transaction_date', params.end_date || new Date().toISOString())
    
    const summary = {
      totalIncome: summaryData?.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0) || 0,
      totalExpenses: summaryData?.filter(t => t.amount < 0).reduce((sum, t) => sum + Math.abs(t.amount), 0) || 0,
      transactionCount: count || 0
    }
    
    return NextResponse.json({
      transactions: transactions || [],
      summary,
      pagination: {
        page,
        pageSize,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / pageSize),
        hasMore: page < Math.ceil((count || 0) / pageSize)
      }
    })
  }
  
  return paginatedResponse(transactions || [], page, pageSize, count || 0)
})

// POST /api/v1/transactions
export const POST = withErrorHandler(async (request: NextRequest) => {
  const user = await requireAuth(request)
  const supabase = await createClient()
  const data = await validateRequest<z.infer<typeof createTransactionSchema>>(request, createTransactionSchema)
  
  // Verify account ownership
  const { data: account } = await supabase
    .from('financial_accounts')
    .select('id, current_balance')
    .eq('id', data.account_id)
    .eq('user_id', user.id)
    .single()
  
  if (!account) {
    return NextResponse.json({ error: 'Account not found' }, { status: 404 })
  }
  
  // Create transaction
  const { data: transaction, error } = await supabase
    .from('transactions')
    .insert({
      user_id: user.id,
      ...data,
      data_source: 'MANUAL'
    })
    .select()
    .single()
  
  if (error) {
    console.error('Error creating transaction:', error)
    return NextResponse.json({ error: 'Failed to create transaction' }, { status: 500 })
  }
  
  // Update account balance if requested
  const params = getQueryParams(request)
  if (params.update_balance === 'true') {
    const { error: updateError } = await supabase
      .from('financial_accounts')
      .update({
        current_balance: account.current_balance + data.amount,
        last_synced: new Date().toISOString()
      })
      .eq('id', data.account_id)
    
    if (updateError) {
      console.error('Error updating account balance:', updateError)
    }
  }
  
  return successResponse(transaction, 'Transaction created successfully', 201)
})