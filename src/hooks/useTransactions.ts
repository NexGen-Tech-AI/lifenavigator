/**
 * React hooks for transactions
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { toast } from '@/lib/utils/toast';
import {
  getTransactions,
  createTransaction,
  bulkImportTransactions
} from '@/lib/api/financial-client';
import { CreateTransactionInput } from '@/types/database';

/**
 * Hook to fetch transactions
 */
export function useTransactions(params?: {
  accountId?: string;
  startDate?: string;
  endDate?: string;
  categoryId?: string;
  search?: string;
  page?: number;
  pageSize?: number;
  includeSummary?: boolean;
}) {
  const { data: session } = useSession();
  
  return useQuery({
    queryKey: ['transactions', params],
    queryFn: () => getTransactions(params),
    enabled: !!session?.user,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

/**
 * Hook to create transaction
 */
export function useCreateTransaction() {
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  
  return useMutation({
    mutationFn: (data: CreateTransactionInput) => {
      // Prevent demo account from creating transactions
      if (session?.user?.email === 'demo@example.com') {
        throw new Error('Demo account cannot create transactions');
      }
      return createTransaction(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['accounts'] }); // Update account balances
      toast({
        title: 'Success',
        description: 'Transaction created successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create transaction',
        variant: 'destructive',
      });
    },
  });
}

/**
 * Hook for bulk transaction import
 */
export function useBulkImportTransactions() {
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  
  return useMutation({
    mutationFn: (data: Parameters<typeof bulkImportTransactions>[0]) => {
      // Prevent demo account from importing
      if (session?.user?.email === 'demo@example.com') {
        throw new Error('Demo account cannot import transactions');
      }
      return bulkImportTransactions(data);
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      
      const { imported = 0, failed = 0 } = response.data || {};
      if (imported > 0 && failed === 0) {
        toast({
          title: 'Success',
          description: `Successfully imported ${imported} transactions`,
        });
      } else if (imported > 0 && failed > 0) {
        toast({
          title: 'Warning',
          description: `Imported ${imported} transactions, ${failed} failed`,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Error',
          description: 'Failed to import transactions',
          variant: 'destructive',
        });
      }
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to import transactions',
        variant: 'destructive',
      });
    },
  });
}

/**
 * Hook to check if user is demo account
 */
export function useIsDemoAccount() {
  const { data: session } = useSession();
  return session?.user?.email === 'demo@example.com';
}