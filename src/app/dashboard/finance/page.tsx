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
import { 
  AlertTriangle, 
  TrendingUp, 
  Shield, 
  Home, 
  Calendar,
  DollarSign,
  Info,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react';

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
  const { data, isLoading, refetch } = useAccounts({ includeSummary: true });
  const [showAddAccountModal, setShowAddAccountModal] = useState(false);
  
const financialData = data?.summary;

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

  // Tax bracket calculation (simplified for demo)
  const calculateTaxBracket = (income: number) => {
    if (income <= 11000) return { rate: 10, bracket: '$0 - $11,000' };
    if (income <= 44725) return { rate: 12, bracket: '$11,001 - $44,725' };
    if (income <= 95375) return { rate: 22, bracket: '$44,726 - $95,375' };
    if (income <= 182050) return { rate: 24, bracket: '$95,376 - $182,050' };
    if (income <= 231250) return { rate: 32, bracket: '$182,051 - $231,250' };
    if (income <= 578125) return { rate: 35, bracket: '$231,251 - $578,125' };
    return { rate: 37, bracket: '$578,126+' };
  };

  const estimatedIncome = 200000; // Total household income from demo data
  const taxInfo = calculateTaxBracket(estimatedIncome);

  // Upcoming events
  const upcomingEvents = [
    { id: 1, title: 'Quarterly Tax Payment Due', date: '2024-01-15', type: 'tax', priority: 'high' },
    { id: 2, title: 'Insurance Premium Due', date: '2024-01-20', type: 'payment', priority: 'medium' },
    { id: 3, title: 'Investment Review Meeting', date: '2024-01-25', type: 'meeting', priority: 'low' },
    { id: 4, title: '401(k) Contribution Deadline', date: '2024-01-31', type: 'deadline', priority: 'high' }
  ];

  // Financial insights and warnings
  const insights = [
    {
      id: 1,
      type: 'warning',
      title: 'Reassess Insurance Coverage',
      description: 'Your home value has increased 15% since last review. Consider updating coverage.',
      icon: Shield,
      action: 'Review Policy',
      priority: 'high'
    },
    {
      id: 2,
      type: 'opportunity',
      title: 'Refinance Potential',
      description: 'Current rates are 1.2% lower than your mortgage. Potential savings: $340/month.',
      icon: Home,
      action: 'Calculate Savings',
      priority: 'medium'
    },
    {
      id: 3,
      type: 'info',
      title: 'Tax Optimization',
      description: 'You have $8,000 remaining in 401(k) contribution room for tax benefits.',
      icon: DollarSign,
      action: 'Maximize Contribution',
      priority: 'medium'
    },
    {
      id: 4,
      type: 'success',
      title: 'Emergency Fund Goal Met',
      description: 'Congratulations! Your emergency fund now covers 6 months of expenses.',
      icon: CheckCircle,
      action: 'View Details',
      priority: 'low'
    }
  ];

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'tax': return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/30';
      case 'payment': return 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/30';
      case 'meeting': return 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30';
      case 'deadline': return 'text-purple-600 bg-purple-100 dark:text-purple-400 dark:bg-purple-900/30';
      default: return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900/30';
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'warning': return 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20';
      case 'opportunity': return 'border-green-500 bg-green-50 dark:bg-green-900/20';
      case 'info': return 'border-blue-500 bg-blue-50 dark:bg-blue-900/20';
      case 'success': return 'border-green-500 bg-green-50 dark:bg-green-900/20';
      default: return 'border-gray-500 bg-gray-50 dark:bg-gray-900/20';
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

        {/* Summary Cards with Tax Info */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
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

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex flex-col h-full">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Tax Bracket</h3>
              <div className="flex-1 flex flex-col justify-center">
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {taxInfo.rate}%
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  {taxInfo.bracket}
                </p>
              </div>
              <div className="flex items-center gap-1 mt-2">
                <Info className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Federal tax rate
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Full Width Net Worth Trend Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Net Worth Trend</h3>
          <div className="h-80">
            <Line data={chartData} options={chartOptions} />
          </div>
        </div>

        {/* Insights and Warnings */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Financial Insights & Recommendations</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {insights.map((insight) => {
              const Icon = insight.icon;
              return (
                <div key={insight.id} className={`p-4 rounded-lg border-l-4 ${getInsightColor(insight.type)}`}>
                  <div className="flex items-start">
                    <Icon className="w-5 h-5 mr-3 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 dark:text-white">{insight.title}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{insight.description}</p>
                      <button className="mt-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline">
                        {insight.action} →
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Upcoming Events */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Upcoming Events</h3>
              <Calendar className="w-5 h-5 text-gray-400" />
            </div>
            <div className="space-y-3">
              {upcomingEvents.map((event) => (
                <div key={event.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center">
                    <div className={`p-2 rounded-full mr-3 ${getEventTypeColor(event.type)}`}>
                      <Clock className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white text-sm">{event.title}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                  {event.priority === 'high' && (
                    <AlertCircle className="w-4 h-4 text-red-500" />
                  )}
                </div>
              ))}
            </div>
            <button className="mt-4 w-full text-center text-sm text-blue-600 dark:text-blue-400 hover:underline">
              View All Events →
            </button>
          </div>

          {/* Quick Actions */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 gap-3">
              <button 
                onClick={() => setShowAddAccountModal(true)}
                className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left"
              >
                <h4 className="font-medium text-gray-900 dark:text-white">Add Account</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Connect a new financial account</p>
              </button>
              
              <Link href="/dashboard/finance/budgets" className="block p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <h4 className="font-medium text-gray-900 dark:text-white">Create Budget</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Set up monthly spending limits</p>
              </Link>
              
              <Link href="/dashboard/finance/investments" className="block p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <h4 className="font-medium text-gray-900 dark:text-white">Investment Analysis</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Review portfolio performance</p>
              </Link>

              <Link href="/dashboard/finance/taxes" className="block p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <h4 className="font-medium text-gray-900 dark:text-white">Tax Planning</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Optimize your tax strategy</p>
              </Link>
            </div>
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