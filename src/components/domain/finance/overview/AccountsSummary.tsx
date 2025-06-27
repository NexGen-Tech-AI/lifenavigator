// FILE: src/components/finance/overview/AccountsSummary.tsx
'use client';

import React, { useState } from "react";
import { 
  BuildingLibraryIcon, 
  CreditCardIcon, 
  HomeIcon, 
  CurrencyDollarIcon 
} from "@heroicons/react/24/outline";
import { useAccounts } from "@/hooks/useAccountsContext";

export function AccountsSummary() {
  const [filter, setFilter] = useState<string>("all");
  const { accounts, isLoading } = useAccounts();
  
  const getIconForType = (type: string) => {
    switch (type) {
      case 'CREDIT_CARD':
        return <CreditCardIcon className="w-5 h-5" />;
      case 'MORTGAGE':
      case 'LOAN':
        return <HomeIcon className="w-5 h-5" />;
      case 'INVESTMENT':
        return <CurrencyDollarIcon className="w-5 h-5" />;
      default:
        return <BuildingLibraryIcon className="w-5 h-5" />;
    }
  };
  
  // Transform the data to match the component's expected format
  const accountsData = (accounts || []).map((account: any) => ({
    id: account.id,
    name: account.account_name,
    type: account.account_type.toLowerCase(),
    balance: account.current_balance,
    icon: getIconForType(account.account_type)
  }));
  
  // Filter accounts based on selected type
  const filteredAccounts = filter === "all" 
    ? accountsData 
    : accountsData.filter(account => {
        if (filter === 'credit') return account.type === 'credit_card';
        return account.type === filter;
      });

  // Calculate totals
  const totalAssets = accountsData
    .filter(account => account.balance > 0)
    .reduce((sum, account) => sum + account.balance, 0);
    
  const totalLiabilities = accountsData
    .filter(account => account.balance < 0)
    .reduce((sum, account) => sum + Math.abs(account.balance), 0);

  return (
    <div className="bg-white rounded-lg shadow dark:bg-slate-800 p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Accounts Summary</h2>
        <div className="flex space-x-2">
          <select
            aria-label="Filter accounts"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-1 text-sm rounded border border-slate-300 bg-white dark:bg-slate-700 dark:border-slate-600 dark:text-white"
          >
            <option value="all">All Accounts</option>
            <option value="checking">Checking</option>
            <option value="savings">Savings</option>
            <option value="credit">Credit Cards</option>
            <option value="loan">Loans</option>
            <option value="investment">Investments</option>
          </select>
        </div>
      </div>
      
      <div className="space-y-4 mb-6">
        {isLoading ? (
          <div className="text-center py-8">
            <p className="text-gray-500">Loading accounts...</p>
          </div>
        ) : filteredAccounts.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No accounts found</p>
          </div>
        ) : (
          filteredAccounts.map((account) => (
            <div 
              key={account.id}
              className="flex items-center justify-between py-3 border-b border-slate-100 dark:border-slate-700"
            >
              <div className="flex items-center">
                <div className="bg-slate-100 dark:bg-slate-700 p-2 rounded-full mr-3">
                  {account.icon}
                </div>
                <div>
                  <p className="font-medium">{account.name}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400 capitalize">{account.type}</p>
                </div>
              </div>
              <div className={`text-right font-medium ${account.balance < 0 ? 'text-red-500' : 'text-green-600 dark:text-green-400'}`}>
                {account.balance < 0 ? "-" : ""}${Math.abs(account.balance).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>
          ))
        )}
      </div>
      
      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-200 dark:border-slate-700">
        <div>
          <p className="text-sm text-slate-500 dark:text-slate-400">Total Assets</p>
          <p className="text-lg font-medium text-green-600 dark:text-green-400">
            ${totalAssets.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>
        <div>
          <p className="text-sm text-slate-500 dark:text-slate-400">Total Liabilities</p>
          <p className="text-lg font-medium text-red-500">
            ${totalLiabilities.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>
      </div>
    </div>
  );
}