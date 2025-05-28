/**
 * Financial API client functions
 * Handles all API calls for financial data
 */

import { 
  FinancialAccount, 
  Transaction, 
  CreateAccountInput, 
  CreateTransactionInput,
  AccountsSummary,
  ApiResponse,
  PaginatedResponse
} from '@/types/database';

const API_BASE = '/api/v1';

/**
 * Generic fetch wrapper with error handling
 */
async function apiFetch<T>(
  endpoint: string, 
  options?: RequestInit
): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
}

// ==================== ACCOUNTS API ====================

/**
 * Get all financial accounts
 */
export async function getAccounts(params?: {
  type?: string;
  institution?: string;
  active?: boolean;
  includeSummary?: boolean;
}): Promise<PaginatedResponse<FinancialAccount> & { summary?: AccountsSummary }> {
  const searchParams = new URLSearchParams();
  
  if (params?.type) searchParams.append('type', params.type);
  if (params?.institution) searchParams.append('institution', params.institution);
  if (params?.active !== undefined) searchParams.append('active', String(params.active));
  if (params?.includeSummary) searchParams.append('includeSummary', 'true');
  
  const query = searchParams.toString();
  return apiFetch(`/accounts${query ? `?${query}` : ''}`);
}

/**
 * Get single account details
 */
export async function getAccount(id: string): Promise<ApiResponse<FinancialAccount>> {
  return apiFetch(`/accounts/${id}`);
}

/**
 * Create new manual account
 */
export async function createAccount(data: CreateAccountInput): Promise<ApiResponse<FinancialAccount>> {
  return apiFetch('/accounts', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * Update account
 */
export async function updateAccount(
  id: string, 
  data: Partial<CreateAccountInput>
): Promise<ApiResponse<FinancialAccount>> {
  return apiFetch(`/accounts/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

/**
 * Delete/deactivate account
 */
export async function deleteAccount(id: string): Promise<ApiResponse<{ id: string; status: string }>> {
  return apiFetch(`/accounts/${id}`, {
    method: 'DELETE',
  });
}

// ==================== TRANSACTIONS API ====================

/**
 * Get transactions with filtering
 */
export async function getTransactions(params?: {
  accountId?: string;
  startDate?: string;
  endDate?: string;
  categoryId?: string;
  search?: string;
  page?: number;
  pageSize?: number;
  includeSummary?: boolean;
}): Promise<PaginatedResponse<Transaction>> {
  const searchParams = new URLSearchParams();
  
  Object.entries(params || {}).forEach(([key, value]) => {
    if (value !== undefined) {
      searchParams.append(key, String(value));
    }
  });
  
  const query = searchParams.toString();
  return apiFetch(`/transactions${query ? `?${query}` : ''}`);
}

/**
 * Create manual transaction
 */
export async function createTransaction(data: CreateTransactionInput): Promise<ApiResponse<Transaction>> {
  return apiFetch('/transactions', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * Bulk import transactions
 */
export async function bulkImportTransactions(data: {
  accountId: string;
  transactions: Array<{
    date: string;
    description: string;
    amount: number;
    category?: string;
    notes?: string;
  }>;
}): Promise<ApiResponse<{ imported: number; failed: number; errors: any[] }>> {
  return apiFetch('/transactions/bulk', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// ==================== PLAID API ====================

/**
 * Create Plaid link token (paid users only)
 */
export async function createPlaidLinkToken(): Promise<ApiResponse<{ linkToken: string; expiration: string }>> {
  return apiFetch('/plaid/link', {
    method: 'POST',
    body: JSON.stringify({}),
  });
}

/**
 * Exchange Plaid public token
 */
export async function exchangePlaidToken(publicToken: string, metadata: {
  institutionId: string;
  institutionName: string;
  accounts?: any[];
}): Promise<ApiResponse<{ accounts: any[]; message: string }>> {
  return apiFetch('/plaid/exchange', {
    method: 'POST',
    body: JSON.stringify({
      publicToken,
      ...metadata
    }),
  });
}

// ==================== DOCUMENTS API ====================

/**
 * Upload document
 */
export async function uploadDocument(file: File, documentType: string, accountId?: string): Promise<ApiResponse<any>> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('documentType', documentType);
  if (accountId) {
    formData.append('accountId', accountId);
  }

  const response = await fetch(`${API_BASE}/documents`, {
    method: 'POST',
    body: formData,
    // Don't set Content-Type header - browser will set it with boundary
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Upload failed' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
}

/**
 * Get user's documents
 */
export async function getDocuments(params?: {
  type?: string;
  status?: string;
  page?: number;
  pageSize?: number;
}): Promise<PaginatedResponse<any>> {
  const searchParams = new URLSearchParams();
  
  Object.entries(params || {}).forEach(([key, value]) => {
    if (value !== undefined) {
      searchParams.append(key, String(value));
    }
  });
  
  const query = searchParams.toString();
  return apiFetch(`/documents${query ? `?${query}` : ''}`);
}

// ==================== USER API ====================

/**
 * Get current user profile
 */
export async function getUserProfile(): Promise<ApiResponse<any>> {
  return apiFetch('/user');
}

/**
 * Update user profile
 */
export async function updateUserProfile(data: {
  name?: string;
  image?: string;
  preferences?: any;
}): Promise<ApiResponse<any>> {
  return apiFetch('/user', {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}