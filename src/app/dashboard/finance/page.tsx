
// src/components/domain/financial/FinancialDashboard.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, ResponsiveContainer, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, Cell
} from 'recharts';
import { ArrowUpRight, ArrowDownRight, DollarSign, Briefcase, CreditCard, Bitcoin, AlertTriangle, TrendingUp } from 'lucide-react';
// Import lodash with type definitions
import { get, sum, groupBy } from 'lodash';
import type { get as GetType, sum as SumType, groupBy as GroupByType } from 'lodash';
// Remove @types/lodash import since types are included in lodash-es

// Main dashboard component
const FinancialDashboard = () => {
  // State for financial data with proper typing
  const [accounts, setAccounts] = useState<{
    id: string;
    name: string;
    type: 'banking' | 'investment' | 'credit';
    balance: number;
    institution: string;
  }[]>([]);
  const [transactions, setTransactions] = useState<{
    dailySpending: Array<{
      date: string;
      amount: number;
      category: string;
    }>;
    categorySpending: Array<{
      category: string;
      amount: number;
    }>;
    recentTransactions: Array<{
      id: string;
      date: string;
      description: string;
      amount: number;
      category: string;
    }>;
  } | null>(null);
  const [investments, setInvestments] = useState<{
    portfolioPerformance: Array<{
      date: string;
      value: number;
    }>;
    assetAllocation: Array<{
      name: string;
      value: number;
    }>;
    holdings: Array<{
      symbol: string;
      name: string;
      shares: number;
      price: number;
      value: number;
    }>;
    totalValue: number;
    dayChange: number;
    dayChangePercent: number;
  } | null>(null);
  const [cryptoAssets, setCryptoAssets] = useState<{
    symbol: string;
    name: string;
    quantity: number;
    price: number;
    value: number;
    change24h: number;
  }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeframe, setTimeframe] = useState('month'); // week, month, year
  const [selectedAccount, setSelectedAccount] = useState('all');
  
  // Colors for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];
  
  // Fetch data on component mount
  useEffect(() => {
    const fetchFinancialData = async () => {
      try {
        setLoading(true);
        
        // In a real app, these would be API calls to your backend
        // which would then fetch data from Plaid, Coinbase, etc.
        const accountsData = await fetchAccounts();
        const transactionsData = await fetchTransactions(timeframe as 'week' | 'month' | 'year');
        const investmentsData = await fetchInvestments();
        const cryptoData = await fetchCryptoAssets();
        
        setAccounts(accountsData as { id: string; name: string; type: 'banking' | 'investment' | 'credit'; balance: number; institution: string; }[]);
        setTransactions(transactionsData);
        setInvestments(investmentsData);
        setCryptoAssets(cryptoData);
        setLoading(false);
      } catch (err) {
        setError(err as null);
        setLoading(false);
        console.error(err);
      }
    };
    
    fetchFinancialData();
  }, [timeframe, selectedAccount]);
  
  // Mock data fetching functions - these would call your backend API
  const fetchAccounts = async () => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Mock account data
    return [
      { id: 'acc1', name: 'Chase Checking', type: 'banking', balance: 4238.42, institution: 'Chase' },
      { id: 'acc2', name: 'Chase Savings', type: 'banking', balance: 12750.33, institution: 'Chase' },
      { id: 'acc3', name: 'Fidelity 401k', type: 'investment', balance: 87432.19, institution: 'Fidelity' },
      { id: 'acc4', name: 'Vanguard IRA', type: 'investment', balance: 43210.55, institution: 'Vanguard' },
      { id: 'acc5', name: 'Chase Credit Card', type: 'credit', balance: -2314.92, institution: 'Chase' },
      { id: 'acc6', name: 'Amex Platinum', type: 'credit', balance: -4532.11, institution: 'American Express' },
    ];
  };
  
  const fetchTransactions = async (timeframe: 'week' | 'month' | 'year') => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 700));
    
    // Generate some realistic mock transaction data
    const categories = ['Groceries', 'Dining', 'Transportation', 'Housing', 'Entertainment', 'Shopping', 'Healthcare', 'Travel'];
    const daysInPeriod = timeframe === 'week' ? 7 : timeframe === 'month' ? 30 : 365;
    
    // Generate daily spending data
    const dailySpending = Array.from({ length: daysInPeriod }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (daysInPeriod - i));
      
      return {
        date: date.toISOString().split('T')[0],
        amount: Math.round(Math.random() * 200 + 10) / 10,
        category: categories[Math.floor(Math.random() * categories.length)],
      };
    });
    
    // Generate category spending data
    const categorySpending = categories.map(category => {
      return {
        category,
        amount: Math.round(Math.random() * 2000 + 100) / 10,
      };
    });
    
    // Generate some recent transactions
    const recentTransactions = Array.from({ length: 10 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      return {
        id: `tx${i}`,
        date: date.toISOString().split('T')[0],
        description: [
          'Whole Foods Market', 'Amazon', 'Uber', 'Netflix', 'Starbucks', 
          'Target', 'Shell Gas', 'Spotify', 'Apple', 'Trader Joe\'s'
        ][i],
        amount: Math.round(Math.random() * 200 - 100) / 10,
        category: categories[Math.floor(Math.random() * categories.length)],
      };
    });
    
    return {
      dailySpending,
      categorySpending,
      recentTransactions,
    };
  };
  
  const fetchInvestments = async () => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 600));
    
    // Mock investment data
    const portfolioPerformance = Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (30 - i));
      
      return {
        date: date.toISOString().split('T')[0],
        value: 130000 + Math.sin(i / 3) * 5000 + i * 200,
      };
    });
    
    const assetAllocation = [
      { name: 'US Stocks', value: 45 },
      { name: 'International Stocks', value: 25 },
      { name: 'Bonds', value: 15 },
      { name: 'Cash', value: 10 },
      { name: 'Real Estate', value: 5 }
    ];
    
    // Holdings would come from Plaid Investments API in a real app
    const holdings = [
      { symbol: 'VTI', name: 'Vanguard Total Stock Market ETF', shares: 42.5, price: 257.34, value: 10937.18 },
      { symbol: 'VXUS', name: 'Vanguard Total International Stock ETF', shares: 78.2, price: 58.93, value: 4608.36 },
      { symbol: 'BND', name: 'Vanguard Total Bond Market ETF', shares: 35.6, price: 72.45, value: 2580.17 },
      { symbol: 'VNQ', name: 'Vanguard Real Estate ETF', shares: 12.3, price: 84.56, value: 1040.15 },
      { symbol: 'AAPL', name: 'Apple Inc.', shares: 15, price: 182.34, value: 2735.10 },
      { symbol: 'MSFT', name: 'Microsoft Corporation', shares: 8, price: 335.78, value: 2686.24 },
    ];
    
    return {
      portfolioPerformance,
      assetAllocation,
      holdings,
      totalValue: 130587.20,
      dayChange: 1432.45,
      dayChangePercent: 1.11,
    };
  };
  
  const fetchCryptoAssets = async () => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Mock crypto data (would come from Coinbase OAuth in a real app)
    return [
      { symbol: 'BTC', name: 'Bitcoin', quantity: 0.75, price: 71243.82, value: 53432.87, change24h: 2.3 },
      { symbol: 'ETH', name: 'Ethereum', quantity: 3.25, price: 3482.91, value: 11319.46, change24h: -1.2 },
      { symbol: 'SOL', name: 'Solana', quantity: 24.5, price: 159.33, value: 3903.59, change24h: 5.7 },
    ];
  };
  
  // Calculate total assets and liabilities
  const calculateTotals = () => {
    const bankingTotal = accounts
      .filter(account => account.type === 'banking')
      .reduce((sum, account) => sum + account.balance, 0);
    
    const investmentTotal = accounts
      .filter(account => account.type === 'investment')
      .reduce((sum, account) => sum + account.balance, 0);
    
    const creditTotal = accounts
      .filter(account => account.type === 'credit')
      .reduce((sum, account) => sum + account.balance, 0);
    
    const cryptoTotal = cryptoAssets.reduce((sum, asset) => sum + asset.value, 0);
    
    const netWorth = bankingTotal + investmentTotal + cryptoTotal + creditTotal;
    
    return {
      bankingTotal,
      investmentTotal,
      creditTotal,
      cryptoTotal,
      netWorth
    };
  };
  
  // Format currency
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };
  
  // Group transactions by category
  const transactionsByCategory = transactions?.categorySpending?.map(item => ({
    name: item.category,
    value: item.amount
  })) || [];
  
  // Format date for charts
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl font-semibold">Loading financial data...</div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl font-semibold text-red-500">{error}</div>
      </div>
    );
  }
  
  const totals = calculateTotals();
  
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Financial Dashboard</h1>
        <p className="text-gray-600">Your complete financial picture</p>
      </header>
      
      {/* Time period selector */}
      <div className="mb-6 flex space-x-4">
        <button 
          className={`px-4 py-2 rounded-md ${timeframe === 'week' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'}`}
          onClick={() => setTimeframe('week')}
        >
          This Week
        </button>
        <button 
          className={`px-4 py-2 rounded-md ${timeframe === 'month' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'}`}
          onClick={() => setTimeframe('month')}
        >
          This Month
        </button>
        <button 
          className={`px-4 py-2 rounded-md ${timeframe === 'year' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'}`}
          onClick={() => setTimeframe('year')}
        >
          This Year
        </button>
      </div>
      
      {/* Financial summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-700">Net Worth</h2>
            <DollarSign className="text-blue-600" size={24} />
          </div>
          <div className="text-2xl font-bold text-gray-900">{formatCurrency(totals.netWorth)}</div>
          <div className="text-sm text-gray-500 mt-2">Total assets minus liabilities</div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-700">Bank Accounts</h2>
            <CreditCard className="text-green-600" size={24} />
          </div>
          <div className="text-2xl font-bold text-gray-900">{formatCurrency(totals.bankingTotal)}</div>
          <div className="text-sm text-gray-500 mt-2">Total balance across all accounts</div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-700">Investments</h2>
            <Briefcase className="text-purple-600" size={24} />
          </div>
          <div className="text-2xl font-bold text-gray-900">{formatCurrency(totals.investmentTotal)}</div>
          <div className="flex items-center text-sm text-green-600 mt-2">
            <ArrowUpRight size={16} className="mr-1" />
            <span>{investments?.dayChangePercent ?? 0}% today</span>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-700">Crypto</h2>
            <Bitcoin className="text-yellow-600" size={24} />
          </div>
          <div className="text-2xl font-bold text-gray-900">{formatCurrency(totals.cryptoTotal)}</div>
          <div className="text-sm text-gray-500 mt-2">{cryptoAssets.length} assets</div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Connected accounts */}
        <div className="bg-white p-6 rounded-lg shadow-md lg:col-span-1">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Connected Accounts</h2>
          <div className="space-y-4">
            {accounts.map(account => (
              <div key={account.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-md">
                <div>
                  <div className="font-medium">{account.name}</div>
                  <div className="text-sm text-gray-500">{account.institution}</div>
                </div>
                <div className={`font-semibold ${account.balance < 0 ? 'text-red-600' : 'text-gray-900'}`}>
                  {formatCurrency(account.balance)}
                </div>
              </div>
            ))}
          </div>
          <button className="mt-4 w-full py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
            Connect New Account
          </button>
        </div>
        
        {/* Monthly spending */}
        <div className="bg-white p-6 rounded-lg shadow-md lg:col-span-2">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Spending Trends</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart
              data={transactions?.dailySpending ?? []}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tickFormatter={formatDate}
                interval={timeframe === 'week' ? 0 : timeframe === 'month' ? 5 : 30}
              />
              <YAxis tickFormatter={(value) => `$${value}`} />
              <Tooltip 
                formatter={(value) => [`$${value}`, 'Spent']}
                labelFormatter={(value) => `Date: ${formatDate(value)}`}
              />
              <Line type="monotone" dataKey="amount" stroke="#3b82f6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Spending by category */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Spending by Category</h2>
          <div className="flex items-center justify-center h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={transactionsByCategory}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {transactionsByCategory.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`$${value}`, 'Spent']} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* Investment performance */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Investment Performance</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart
              data={investments?.portfolioPerformance ?? []}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tickFormatter={formatDate} 
                interval={5}
              />
              <YAxis tickFormatter={(value) => `$${value.toLocaleString()}`} />
              <Tooltip
                formatter={(value) => [`$${value.toLocaleString()}`, 'Portfolio Value']}
                labelFormatter={(value) => `Date: ${formatDate(value)}`}
              />
              <Line type="monotone" dataKey="value" stroke="#8884d8" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      {/* Recent transactions */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Recent Transactions</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {transactions?.recentTransactions?.map(transaction => (
                <tr key={transaction.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(transaction.date)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {transaction.description}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {transaction.category}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                    transaction.amount < 0 ? 'text-red-600' : 'text-green-600'
                  }`}>
                    {formatCurrency(transaction.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 text-center">
          <button className="text-blue-600 hover:text-blue-800 font-medium">
            View All Transactions
          </button>
        </div>
      </div>
      
      {/* Financial insights */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Financial Insights</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
            <div className="flex items-start">
              <AlertTriangle className="text-yellow-600 mr-3" size={20} />
              <div>
                <p className="font-medium text-yellow-800">Credit Card Payment Due</p>
                <p className="text-sm text-yellow-700">Your Chase credit card payment of $2,314.92 is due in 3 days.</p>
              </div>
            </div>
          </div>
          
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
            <div className="flex items-start">
              <TrendingUp className="text-blue-600 mr-3" size={20} />
              <div>
                <p className="font-medium text-blue-800">Savings Opportunity</p>
                <p className="text-sm text-blue-700">You've spent $543 on dining this month, 32% more than last month.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinancialDashboard;