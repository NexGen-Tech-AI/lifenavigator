// FILE: src/app/dashboard/finance/overview/page.tsx
'use client';

import { useEffect, useState } from "react";
import { AccountsSummary } from "@/components/domain/finance/overview/AccountsSummary";
import { SpendingTrends } from "@/components/domain/finance/overview/SpendingTrends";
import { UpcomingBills } from "@/components/domain/finance/overview/UpcomingBills";
import { FinancialInsights } from "@/components/domain/finance/overview/FinancialInsights";
import { CashFlow } from "@/components/domain/finance/overview/CashFlow";
import { LoadingSpinner } from "@/components/ui/loaders/LoadingSpinner";
import { FinancialHealthScore } from "@/components/finance/FinancialHealthScore";
import { useFinancialHealth } from "@/hooks/useFinancialHealth";
import { useAccounts } from "@/hooks/useAccounts";
import { BeakerIcon, ChartBarIcon } from "@heroicons/react/24/outline";
import Link from "next/link";

interface FinancialSummary {
  totalAssets: number;
  totalLiabilities: number;
  netWorth: number;
}

export default function OverviewPage() {
  const { summary: financialData, isLoading, error: accountsError } = useAccounts();
  const { score, history, isLoading: scoreLoading, refreshScore, error: scoreError } = useFinancialHealth();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  // Show loading state while data is being fetched
  if (isLoading || scoreLoading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner size="large" />
        </div>
      </div>
    );
  }

  // Show error state if there are any errors
  if (accountsError || scoreError) {
    return (
      <div className="container mx-auto py-6">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 text-center">
          <h2 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">
            Error Loading Financial Data
          </h2>
          <p className="text-red-600 dark:text-red-300">
            {accountsError || scoreError || 'Failed to load financial information'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Financial Overview</h1>
        <div className="flex gap-3">
          <Link
            href="/dashboard/finance/simulator"
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <BeakerIcon className="h-5 w-5" />
            Simulator
          </Link>
          <Link
            href="/dashboard/finance/tax"
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <ChartBarIcon className="h-5 w-5" />
            Tax Planning
          </Link>
        </div>
      </div>

      {/* Financial Health Score */}
      {score && (
        <div className="mb-8">
          <FinancialHealthScore 
            score={score} 
            history={history}
            isLoading={false}
            onRefresh={refreshScore}
          />
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow dark:bg-slate-800 p-6">
          <div className="flex flex-col h-full">
            <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Total Assets</h2>
            <div className="flex-1 flex items-center">
              <p className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
                {isLoading ? (
                  <span className="animate-pulse">...</span>
                ) : (
                  formatCurrency(financialData?.totalAssets || 0)
                )}
              </p>
            </div>
            <div className="flex items-center gap-1 mt-2">
              <span className="text-green-600 dark:text-green-400">↑</span>
              <p className="text-sm text-gray-600 dark:text-gray-400">5.2%</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow dark:bg-slate-800 p-6">
          <div className="flex flex-col h-full">
            <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Total Liabilities</h2>
            <div className="flex-1 flex items-center">
              <p className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
                {isLoading ? (
                  <span className="animate-pulse">...</span>
                ) : (
                  formatCurrency(financialData?.totalLiabilities || 0)
                )}
              </p>
            </div>
            <div className="flex items-center gap-1 mt-2">
              <span className="text-red-600 dark:text-red-400">↓</span>
              <p className="text-sm text-gray-600 dark:text-gray-400">2.3%</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow dark:bg-slate-800 p-6">
          <div className="flex flex-col h-full">
            <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Net Worth</h2>
            <div className="flex-1 flex items-center">
              <p className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
                {isLoading ? (
                  <span className="animate-pulse">...</span>
                ) : (
                  formatCurrency(financialData?.netWorth || 0)
                )}
              </p>
            </div>
            <div className="flex items-center gap-1 mt-2">
              <span className="text-green-600 dark:text-green-400">↑</span>
              <p className="text-sm text-gray-600 dark:text-gray-400">8.7%</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow dark:bg-slate-800 p-6">
          <div className="flex flex-col h-full">
            <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Monthly Cash Flow</h2>
            <div className="flex-1 flex items-center">
              <p className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
                {/* This would come from transactions API */}
                +$2,834.12
              </p>
            </div>
            <div className="flex items-center gap-1 mt-2">
              <span className="text-green-600 dark:text-green-400">↑</span>
              <p className="text-sm text-gray-600 dark:text-gray-400">12.4%</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <AccountsSummary />
        <SpendingTrends />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <UpcomingBills />
        <CashFlow />
        <FinancialInsights />
      </div>
    </div>
  );
}