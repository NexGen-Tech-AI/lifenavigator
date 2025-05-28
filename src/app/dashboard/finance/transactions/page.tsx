'use client';

import React, { useState, useEffect, useMemo } from 'react';
import TransactionFilters from '@/components/financial/transactions/TransactionFilters';
import TransactionList from '@/components/financial/transactions/TransactionList';
import { useTransactions, useIsDemoAccount } from '@/hooks/useTransactions';
import { useAccounts } from '@/hooks/useAccounts';
import { LoadingSpinner } from '@/components/ui/loaders/LoadingSpinner';
// Adjust the import to match the actual export from Alert.tsx
import { Alert } from '@/components/ui/feedback/Alert';
import { Button } from '@/components/ui/buttons/Button';
import { PlusIcon, ArrowUpTrayIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';

export default function TransactionsPage() {
  // Initialize with last 30 days as default
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 30);
    return date;
  });
  
  const [endDate, setEndDate] = useState(new Date());
  const [selectedAccountIds, setSelectedAccountIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const isDemoAccount = useIsDemoAccount();

  // Fetch accounts
  const { data: accountsData, isLoading: accountsLoading } = useAccounts();
  const accounts = accountsData?.data || [];

  // Initialize by selecting all accounts
  useEffect(() => {
    if (accounts.length > 0 && selectedAccountIds.length === 0) {
      setSelectedAccountIds(accounts.map(account => account.id));
    }
  }, [accounts]);

  // Build query params
  const queryParams = useMemo(() => ({
    startDate: format(startDate, 'yyyy-MM-dd'),
    endDate: format(endDate, 'yyyy-MM-dd'),
    accountId: selectedAccountIds.length === 1 ? selectedAccountIds[0] : undefined,
    search: searchQuery || undefined,
    page: currentPage,
    pageSize: 50,
    includeSummary: true
  }), [startDate, endDate, selectedAccountIds, searchQuery, currentPage]);

  // Fetch transactions
  const { 
    data: transactionsData, 
    isLoading: transactionsLoading, 
    error 
  } = useTransactions(queryParams);

  const transactions = transactionsData?.data || [];
  // Adjust this line based on the actual structure of PaginatedResponse<Transaction>
  // For example, if totalPages is at the root level:
  const totalPages = transactionsData?.totalPages || 1;

  // Filter transactions by selected accounts (if multiple selected)
  const filteredTransactions = useMemo(() => {
    if (selectedAccountIds.length === 0 || selectedAccountIds.length === 1) {
      return transactions;
    }
    return transactions.filter(txn => selectedAccountIds.includes(txn.accountId));
  }, [transactions, selectedAccountIds]);

  // Calculate totals
  const { totalIncome, totalExpenses, netAmount } = useMemo(() => {
    const income = filteredTransactions
      .filter(txn => txn.amount > 0)
      .reduce((sum, txn) => sum + txn.amount, 0);
    
    const expenses = filteredTransactions
      .filter(txn => txn.amount < 0)
      .reduce((sum, txn) => sum + Math.abs(txn.amount), 0);
    
    return {
      totalIncome: income,
      totalExpenses: expenses,
      netAmount: income - expenses
    };
  }, [filteredTransactions]);

  // Handle date range change
  const handleDateRangeChange = (start: Date, end: Date) => {
    setStartDate(start);
    setEndDate(end);
    setCurrentPage(1); // Reset to first page
  };

  // Handle search
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Math.abs(amount));
  };

  const isLoading = accountsLoading || transactionsLoading;

  return (
    <div className="container mx-auto py-6 px-4 md:px-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
          Transactions
        </h1>
        
        {!isDemoAccount && (
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <ArrowUpTrayIcon className="h-4 w-4 mr-2" />
              Import
            </Button>
            <Button size="sm">
              <PlusIcon className="h-4 w-4 mr-2" />
              Add Transaction
            </Button>
          </div>
        )}
      </div>

      {/* Demo Account Notice */}
      {isDemoAccount && (
        <Alert 
          variant="info" 
          title="Demo Account"
          description="You're viewing sample transaction data. Create a free account to track your own transactions."
          className="mb-6"
        />
      )}

      {/* Error State */}
      {error && (
        <Alert 
          variant="destructive" 
          title="Error loading transactions"
          description={error.message || 'Failed to load transactions. Please try again.'}
          className="mb-6"
        />
      )}

      {/* Loading State */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner />
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
              <h3 className="text-sm text-gray-500 dark:text-gray-400 mb-1">Income</h3>
              <p className="text-xl font-semibold text-emerald-600 dark:text-emerald-400">
                {formatCurrency(totalIncome)}
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
              <h3 className="text-sm text-gray-500 dark:text-gray-400 mb-1">Expenses</h3>
              <p className="text-xl font-semibold text-rose-600 dark:text-rose-400">
                {formatCurrency(totalExpenses)}
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
              <h3 className="text-sm text-gray-500 dark:text-gray-400 mb-1">Net</h3>
              <p className={`text-xl font-semibold ${netAmount >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                {formatCurrency(netAmount)}
              </p>
            </div>
          </div>
          
          {/* Filters */}
          <TransactionFilters
            accounts={accounts}
            selectedAccountIds={selectedAccountIds}
            startDate={startDate}
            endDate={endDate}
            onAccountChange={setSelectedAccountIds}
            onDateRangeChange={handleDateRangeChange}
            onSearch={handleSearch}
          />
          
          {/* Transaction List */}
          <TransactionList
            transactions={filteredTransactions}
            accounts={accounts}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
          
          {/* Empty State */}
          {filteredTransactions.length === 0 && !isLoading && (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                No transactions found for the selected filters.
              </p>
              {!isDemoAccount && (
                <Button>
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Add Your First Transaction
                </Button>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}