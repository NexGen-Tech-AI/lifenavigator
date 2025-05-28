'use client';

import React from 'react';
import { AccountType } from '@/types/database';

interface AccountTypeFilterProps {
  selectedType: AccountType | 'all';
  onChange: (type: AccountType | 'all') => void;
  accountCounts?: Record<AccountType, number>;
}

const accountTypeOptions: { value: AccountType | 'all'; label: string; icon: string }[] = [
  { value: 'all', label: 'All Accounts', icon: '💰' },
  { value: 'CHECKING', label: 'Checking', icon: '🏦' },
  { value: 'SAVINGS', label: 'Savings', icon: '💵' },
  { value: 'CREDIT_CARD', label: 'Credit Card', icon: '💳' },
  { value: 'INVESTMENT', label: 'Investment', icon: '📈' },
  { value: 'LOAN', label: 'Loan', icon: '📝' },
  { value: 'MORTGAGE', label: 'Mortgage', icon: '🏠' },
  { value: 'OTHER', label: 'Other', icon: '🔄' },
];

export default function AccountTypeFilter({ selectedType, onChange }: AccountTypeFilterProps) {
  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {accountTypeOptions.map((option) => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          className={`flex items-center py-2 px-4 rounded-full text-sm font-medium transition-colors ${
            selectedType === option.value
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
          }`}
        >
          <span className="mr-2">{option.icon}</span>
          {option.label}
        </button>
      ))}
    </div>
  );
}