'use client';

import React from 'react';
import { FinancialAccount } from '@/types/database';
import AccountCard from './AccountCard';

interface InstitutionGroupProps {
  institutionName: string;
  accounts: FinancialAccount[];
  onAccountClick?: (accountId: string) => void;
}

export default function InstitutionGroup({ 
  institutionName, 
  accounts, 
  onAccountClick 
}: InstitutionGroupProps) {
  // Calculate the total balance for the institution
  const totalBalance = accounts.reduce((sum, account) => sum + account.currentBalance, 0);
  
  // Format the total balance
  const formattedTotalBalance = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(totalBalance);

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-md flex items-center justify-center mr-3">
            <div className="text-sm font-bold text-gray-600 dark:text-gray-400">
              {institutionName.charAt(0)}
            </div>
          </div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {institutionName}
          </h2>
        </div>
        <div className="text-right">
          <span className="text-sm text-gray-500 dark:text-gray-400">Total balance</span>
          <p className={`font-medium ${
            totalBalance >= 0 
              ? 'text-emerald-600 dark:text-emerald-400' 
              : 'text-rose-600 dark:text-rose-400'
          }`}>
            {formattedTotalBalance}
          </p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {accounts.map((account) => (
          <AccountCard 
            key={account.id} 
            account={{
              id: account.id,
              name: account.accountName,
              type: account.accountType,
              balance: account.currentBalance,
              mask: account.accountNumber || undefined,
              isConnected: account.dataSource !== 'MANUAL'
            }}
            onClick={() => onAccountClick && onAccountClick(account.id)}
          />
        ))}
      </div>
    </div>
  );
}