'use client';

import React, { useState } from 'react';
import { AccountType } from '@/types/financial';
import AccountTypeFilter from '@/components/financial/accounts/AccountTypeFilter';
import NetWorthSummary from '@/components/financial/accounts/NetWorthSummary';
import InstitutionGroup from '@/components/financial/accounts/InstitutionGroup';
import AddAccountButton from '@/components/financial/accounts/AddAccountButton';
import ConnectAccountModal from '@/components/financial/accounts/ConnectAccountModal';
import { mockAccounts, getAccountsByType, getAccountsByInstitution } from '@/lib/mock/financialAccounts';

export default function AccountsPage() {
  const [selectedType, setSelectedType] = useState<AccountType | 'all'>('all');
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  
  // Filter accounts based on selected type
  const filteredAccounts = selectedType === 'all' 
    ? mockAccounts 
    : getAccountsByType(mockAccounts, selectedType);
  
  // Group accounts by institution
  const accountGroups = getAccountsByInstitution(filteredAccounts);
  
  // Handle account click
  const handleAccountClick = (accountId: string) => {
    // In a real implementation, this would navigate to the account details page
    console.log('Account clicked:', accountId);
  };
  
  // Handle institution connect
  const handleConnectAccount = (institutionId: string) => {
    console.log('Connecting to institution:', institutionId);
    // In a real implementation, this would initiate the OAuth flow or manual account entry
    setIsConnectModalOpen(false);
  };

  return (
    <div className="container mx-auto py-6 px-4 md:px-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white mb-4 md:mb-0">Financial Accounts</h1>
        <button
          onClick={() => setIsConnectModalOpen(true)}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-2"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
              clipRule="evenodd"
            />
          </svg>
          Connect Account
        </button>
      </div>
      
      {/* Net Worth Summary */}
      <NetWorthSummary accounts={mockAccounts} />
      
      {/* Account Type Filter */}
      <AccountTypeFilter selectedType={selectedType} onChange={setSelectedType} />
      
      {/* Institution Groups */}
      {accountGroups.length > 0 ? (
        accountGroups.map((group) => (
          <InstitutionGroup
            key={group.institution.id}
            accountGroup={group}
            onAccountClick={handleAccountClick}
          />
        ))
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 text-center">
          <p className="text-gray-500 dark:text-gray-400 mb-4">No accounts found for this filter.</p>
          <div className="w-1/2 mx-auto">
            <AddAccountButton onClick={() => setIsConnectModalOpen(true)} />
          </div>
        </div>
      )}
      
      {/* Connect Account Modal */}
      <ConnectAccountModal
        isOpen={isConnectModalOpen}
        onClose={() => setIsConnectModalOpen(false)}
        onConnect={handleConnectAccount}
      />
    </div>
  );
}