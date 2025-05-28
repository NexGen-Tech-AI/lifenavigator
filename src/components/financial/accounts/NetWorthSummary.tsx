'use client';

import React from 'react';

interface NetWorthSummaryProps {
  totalAssets: number;
  totalLiabilities: number;
  netWorth: number;
  accountsByType: {
    type: string;
    count: number;
    totalBalance: number;
  }[];
}

export default function NetWorthSummary({ 
  totalAssets, 
  totalLiabilities, 
  netWorth,
  accountsByType 
}: NetWorthSummaryProps) {
  // Formatter for currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  // Determine net worth status
  const netWorthStatus = netWorth >= 0 ? 'positive' : 'negative';
  const netWorthColor = netWorth >= 0 
    ? 'text-emerald-600 dark:text-emerald-400' 
    : 'text-rose-600 dark:text-rose-400';

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Net Worth Summary</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Assets */}
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Total Assets</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {formatCurrency(totalAssets)}
          </p>
        </div>

        {/* Total Liabilities */}
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Total Liabilities</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {formatCurrency(totalLiabilities)}
          </p>
        </div>

        {/* Net Worth */}
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Net Worth</p>
          <p className={`text-2xl font-bold ${netWorthColor}`}>
            {formatCurrency(netWorth)}
          </p>
        </div>
      </div>

      {/* Account Type Breakdown */}
      {accountsByType && accountsByType.length > 0 && (
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Breakdown by Account Type</h3>
          <div className="space-y-2">
            {accountsByType.map((item) => (
              <div key={item.type} className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">
                  {item.type} ({item.count})
                </span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {formatCurrency(item.totalBalance)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}