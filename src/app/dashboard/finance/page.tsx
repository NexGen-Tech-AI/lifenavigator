'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAccounts } from '@/hooks/useAccounts';
import Link from 'next/link';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface FinancialSummary {
  totalAssets: number;
  totalLiabilities: number;
  netWorth: number;
}

function FinancePageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const message = searchParams.get('message');
  const { summary: financialData, isLoading, refetch } = useAccounts();
  const [showAddAccountModal, setShowAddAccountModal] = useState(false);

  useEffect(() => {
    // Check if we should open the add account modal
    const params = new URLSearchParams(window.location.search);
    if (params.get('action') === 'add-account') {
      setShowAddAccountModal(true);
      // Remove the action param from URL
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  // Format currency
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  // Chart data for net worth trend
  const chartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Net Worth',
        data: [
          financialData?.netWorth ? financialData.netWorth * 0.85 : 0,
          financialData?.netWorth ? financialData.netWorth * 0.88 : 0,
          financialData?.netWorth ? financialData.netWorth * 0.92 : 0,
          financialData?.netWorth ? financialData.netWorth * 0.95 : 0,
          financialData?.netWorth ? financialData.netWorth * 0.98 : 0,
          financialData?.netWorth || 0
        ],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4
      }
    ]
  };

  const chartOptions: ChartOptions<'line'> = {
    responsive: true,
    plugins: {
      legend: {
        display: false
      },
      title: {
        display: false
      }
    },
    scales: {
      y: {
        beginAtZero: false,
        ticks: {
          callback: function(value) {
            return '$' + Number(value).toLocaleString();
          }
        }
      }
    }
  };

  return (
    <div className="p-8">
        {message && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-800 rounded-lg">
            {message}
          </div>
        )}

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Financial Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Track your wealth, manage investments, and plan for your financial future
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Link href="/dashboard/finance/assets" className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer">
            <div className="flex flex-col h-full">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Total Assets</h3>
              <div className="flex-1 flex flex-col justify-center">
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {isLoading ? (
                    <span className="animate-pulse">...</span>
                  ) : (
                    formatCurrency(financialData?.totalAssets || 0)
                  )}
                </p>
              </div>
              <div className="flex items-center gap-1 mt-2">
                <span className="text-green-600 dark:text-green-400">↑</span>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  5.2% from last month
                </p>
              </div>
            </div>
          </Link>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex flex-col h-full">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Total Liabilities</h3>
              <div className="flex-1 flex flex-col justify-center">
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {isLoading ? (
                    <span className="animate-pulse">...</span>
                  ) : (
                    formatCurrency(financialData?.totalLiabilities || 0)
                  )}
                </p>
              </div>
              <div className="flex items-center gap-1 mt-2">
                <span className="text-red-600 dark:text-red-400">↓</span>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  2.3% from last month
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex flex-col h-full">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Net Worth</h3>
              <div className="flex-1 flex flex-col justify-center">
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {isLoading ? (
                    <span className="animate-pulse">...</span>
                  ) : (
                    formatCurrency(financialData?.netWorth || 0)
                  )}
                </p>
              </div>
              <div className="flex items-center gap-1 mt-2">
                <span className="text-green-600 dark:text-green-400">↑</span>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  8.7% from last month
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Net Worth Trend Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Net Worth Trend</h3>
          <div className="h-64">
            <Line data={chartData} options={chartOptions} />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button 
              onClick={() => setShowAddAccountModal(true)}
              className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <div className="text-left">
                <h4 className="font-medium text-gray-900 dark:text-white">Add Account</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Connect a new financial account</p>
              </div>
            </button>
            
            <Link href="/dashboard/finance/budgets" className="block p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <div className="text-left">
                <h4 className="font-medium text-gray-900 dark:text-white">Create Budget</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Set up monthly spending limits</p>
              </div>
            </Link>
            
            <Link href="/dashboard/finance/investments" className="block p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <div className="text-left">
                <h4 className="font-medium text-gray-900 dark:text-white">Investment Analysis</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Review portfolio performance</p>
              </div>
            </Link>
          </div>
        </div>

        {/* Add Account Modal */}
        {showAddAccountModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Add Financial Account</h2>
              
              <form onSubmit={async (e) => {
                e.preventDefault();
                const form = e.target as HTMLFormElement;
                const formData = new FormData(form);
                
                try {
                  const response = await fetch('/api/v1/accounts', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                      accountName: formData.get('accountName'),
                      accountType: formData.get('accountType'),
                      institutionName: formData.get('institutionName'),
                      currentBalance: parseFloat(formData.get('currentBalance') as string),
                    }),
                  });
                  
                  if (response.ok) {
                    setShowAddAccountModal(false);
                    refetch(); // Refresh data
                  }
                } catch (error) {
                  console.error('Error adding account:', error);
                }
              }}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Account Name
                    </label>
                    <input
                      type="text"
                      name="accountName"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="e.g., Chase Checking"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Account Type
                    </label>
                    <select
                      name="accountType"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    >
                      <option value="CHECKING">Checking</option>
                      <option value="SAVINGS">Savings</option>
                      <option value="CREDIT_CARD">Credit Card</option>
                      <option value="INVESTMENT">Investment</option>
                      <option value="LOAN">Loan</option>
                      <option value="MORTGAGE">Mortgage</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Institution Name
                    </label>
                    <input
                      type="text"
                      name="institutionName"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="e.g., Chase Bank"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Current Balance
                    </label>
                    <input
                      type="number"
                      name="currentBalance"
                      required
                      step="0.01"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="0.00"
                    />
                  </div>
                </div>
                
                <div className="flex gap-3 mt-6">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Add Account
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddAccountModal(false)}
                    className="flex-1 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 py-2 rounded-md hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
    </div>
  );
}

export default function FinancePage() {
  return (
    <Suspense fallback={<div className="p-8">Loading...</div>}>
      <FinancePageContent />
    </Suspense>
  );
}