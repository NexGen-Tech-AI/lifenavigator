'use client';

import { useState, useEffect, useCallback, createContext, useContext, ReactNode } from 'react';

export interface Account {
  id: string;
  account_name: string;
  account_type: string;
  institution_name?: string;
  currency: string;
  current_balance: number;
  available_balance?: number;
  credit_limit?: number;
  interest_rate?: number;
  is_active: boolean;
  last_synced?: string;
  created_at: string;
  updated_at: string;
}

interface AccountsSummary {
  totalAssets: number;
  totalLiabilities: number;
  netWorth: number;
}

interface AccountsContextType {
  accounts: Account[];
  summary: AccountsSummary | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

const AccountsContext = createContext<AccountsContextType | undefined>(undefined);

export function AccountsProvider({ children }: { children: ReactNode }) {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [summary, setSummary] = useState<AccountsSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAccounts = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/v1/accounts');
      
      if (!response.ok) {
        // In demo mode, return mock data if auth fails
        if (response.status === 401) {
          const mockAccounts: Account[] = [
            {
              id: '1',
              account_name: 'Main Checking',
              account_type: 'CHECKING',
              institution_name: 'Demo Bank',
              currency: 'USD',
              current_balance: 5250.50,
              available_balance: 5250.50,
              is_active: true,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
            {
              id: '2',
              account_name: 'Savings Account',
              account_type: 'SAVINGS',
              institution_name: 'Demo Bank',
              currency: 'USD',
              current_balance: 15750.00,
              available_balance: 15750.00,
              is_active: true,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
            {
              id: '3',
              account_name: 'Credit Card',
              account_type: 'CREDIT_CARD',
              institution_name: 'Demo Card Co',
              currency: 'USD',
              current_balance: -2150.25,
              credit_limit: 10000,
              is_active: true,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
          ];

          const mockSummary: AccountsSummary = {
            totalAssets: 21000.50,
            totalLiabilities: 2150.25,
            netWorth: 18850.25,
          };

          setAccounts(mockAccounts);
          setSummary(mockSummary);
          return;
        }
        
        throw new Error(`Failed to fetch accounts: ${response.status}`);
      }

      const data = await response.json();
      setAccounts(data.data || []);
      setSummary(data.summary || data.metadata?.summary || null);
    } catch (err) {
      console.error('Error fetching accounts:', err);
      setError(err instanceof Error ? err.message : 'Failed to load accounts');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  const value: AccountsContextType = {
    accounts,
    summary,
    isLoading,
    error,
    refetch: fetchAccounts,
  };

  return (
    <AccountsContext.Provider value={value}>
      {children}
    </AccountsContext.Provider>
  );
}

export function useAccounts() {
  const context = useContext(AccountsContext);
  if (context === undefined) {
    throw new Error('useAccounts must be used within an AccountsProvider');
  }
  return context;
}