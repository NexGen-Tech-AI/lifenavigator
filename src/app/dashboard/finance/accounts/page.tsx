'use client';

import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import { PlusIcon } from '@heroicons/react/24/outline';
import { AccountType } from '@/types/database';
import AccountTypeFilter from '@/components/financial/accounts/AccountTypeFilter';
import NetWorthSummary from '@/components/financial/accounts/NetWorthSummary';
import InstitutionGroup from '@/components/financial/accounts/InstitutionGroup-new';
import ConnectAccountModal from '@/components/financial/accounts/ConnectAccountModal';
import CreateAccountModal from '@/components/financial/accounts/CreateAccountModal';
import { useAccounts } from '@/hooks/useAccounts';
import { LoadingSpinner } from '@/components/ui/loaders/LoadingSpinner';
import { toast } from '@/components/ui/toaster';

export default function AccountsPage() {
  const { data: session } = useSession();
  const [selectedType, setSelectedType] = useState<AccountType | 'all'>('all');
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  
  // Fetch accounts with summary
  const { data, isLoading, error } = useAccounts({
    type: selectedType === 'all' ? undefined : selectedType,
    includeSummary: true,
    active: true
  });

  // Handle loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    );
  }

  // Handle error state
  if (error) {
    return (
      <div className="container mx-auto py-6 px-4 md:px-6">
        <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
          <p className="text-red-800 dark:text-red-200">
            Failed to load accounts. Please try again later.
          </p>
        </div>
      </div>
    );
  }

  const accounts = data?.data || [];
  const summary = data?.summary;

  // Group accounts by institution
  const accountGroups = accounts.reduce((groups, account) => {
    const institution = account.institutionName;
    if (!groups[institution]) {
      groups[institution] = {
        institutionName: institution,
        accounts: []
      };
    }
    groups[institution].accounts.push(account);
    return groups;
  }, {} as Record<string, { institutionName: string; accounts: typeof accounts }>);

  // Handle account click
  const handleAccountClick = (accountId: string) => {
    // Navigate to account details
    window.location.href = `/dashboard/finance/accounts/${accountId}`;
  };

  // Handle institution connect
  const handleConnectAccount = () => {
    if (session?.user?.isDemoAccount) {
      toast.error('Demo account cannot connect external accounts');
      return;
    }
    setIsConnectModalOpen(true);
  };

  return (
    <div className="container mx-auto py-6 px-4 md:px-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white mb-4 md:mb-0">
          Financial Accounts
        </h1>
        <button
          onClick={handleConnectAccount}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={session?.user?.isDemoAccount}
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Add Account
        </button>
      </div>

      {/* Net Worth Summary */}
      {summary && (
        <NetWorthSummary
          totalAssets={summary.totalAssets}
          totalLiabilities={summary.totalLiabilities}
          netWorth={summary.netWorth}
          accountsByType={summary.accountsByType}
        />
      )}

      {/* Account Type Filter */}
      <div className="mb-6">
        <AccountTypeFilter
          selectedType={selectedType}
          onChange={(type: AccountType | 'all') => setSelectedType(type)}
          accountCounts={
            summary?.accountsByType.reduce((counts, item) => ({
              ...counts,
              [item.type]: item.count
            }), {} as Record<AccountType, number>) 
          }
        />
      </div>

      {/* Accounts List */}
      {accounts.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8 text-center">
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            No accounts found. Add your first account to get started.
          </p>
          <button
            onClick={handleConnectAccount}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            disabled={session?.user?.isDemoAccount}
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Add Your First Account
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {Object.values(accountGroups).map((group) => (
            <InstitutionGroup
              key={group.institutionName}
              institutionName={group.institutionName}
              accounts={group.accounts}
              onAccountClick={handleAccountClick}
            />
          ))}
        </div>
      )}

      {/* Connect Account Modal */}
      <ConnectAccountModal
        isOpen={isConnectModalOpen}
        onClose={() => setIsConnectModalOpen(false)}
        onConnect={(institutionId) => {
          if (institutionId === 'manual') {
            setIsConnectModalOpen(false);
            setIsCreateModalOpen(true);
          } else {
            console.log('Connecting to:', institutionId);
            setIsConnectModalOpen(false);
            // This will be implemented with Plaid integration
            toast.info('Plaid integration coming soon!');
          }
        }}
      />

      {/* Create Account Modal */}
      <CreateAccountModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />

      {/* Demo Account Notice */}
      {session?.user?.isDemoAccount && (
        <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            You're using a demo account. Data is read-only and cannot be modified.
            Create a free account to manage your own financial data.
          </p>
        </div>
      )}
    </div>
  );
}