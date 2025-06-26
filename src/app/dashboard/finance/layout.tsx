'use client';

import React, { ReactNode } from 'react';
import { FinanceSidebar } from '@/components/domain/finance/FinanceSidebar';
import { AccountsProvider } from '@/hooks/useAccounts';

interface FinanceLayoutProps {
  children: ReactNode;
}

export default function FinanceLayout({ children }: FinanceLayoutProps) {
  return (
    <AccountsProvider>
      <div className="flex h-full bg-gray-50 dark:bg-gray-900">
        {/* Finance Sidebar */}
        <FinanceSidebar />
        
        {/* Main content */}
        <div className="flex-1 overflow-auto">
          {children}
        </div>
      </div>
    </AccountsProvider>
  );
}