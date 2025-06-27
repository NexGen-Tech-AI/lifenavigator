/**
 * React hooks for financial accounts
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/lib/utils/toast';
import {
  getAccounts,
  getAccount,
  createAccount,
  updateAccount,
  deleteAccount
} from '@/lib/api/financial-client';
import { CreateAccountInput } from '@/types/database';

/**
 * Hook to fetch all accounts
 */
export function useAccounts(params?: {
  type?: string;
  institution?: string;
  active?: boolean;
  includeSummary?: boolean;
}) {
  // Always fetch in demo mode - no auth required
  return useQuery({
    queryKey: ['accounts', params],
    queryFn: () => getAccounts(params),
    enabled: true,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook to fetch single account
 */
export function useAccount(id: string) {
  // Always fetch in demo mode - no auth required
  return useQuery({
    queryKey: ['account', id],
    queryFn: () => getAccount(id),
    enabled: !!id,
  });
}

/**
 * Hook to create account
 */
export function useCreateAccount() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateAccountInput) => {
      // In demo mode, just simulate success
      return createAccount(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      toast.success('Account created successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create account');
    },
  });
}

/**
 * Hook to update account
 */
export function useUpdateAccount() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateAccountInput> }) => {
      // In demo mode, just simulate success
      return updateAccount(id, data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      queryClient.invalidateQueries({ queryKey: ['account', variables.id] });
      toast.success('Account updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update account');
    },
  });
}

/**
 * Hook to delete account
 */
export function useDeleteAccount() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => {
      // In demo mode, just simulate success
      return deleteAccount(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      toast.success('Account deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete account');
    },
  });
}