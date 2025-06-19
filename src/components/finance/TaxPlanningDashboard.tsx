'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import {
  CalculatorIcon,
  DocumentTextIcon,
  CalendarIcon,
  ClockIcon,
  BanknotesIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  InformationCircleIcon,
  DocumentArrowDownIcon,
  UserGroupIcon,
  HomeIcon,
  BriefcaseIcon,
  HeartIcon,
  AcademicCapIcon,
  ShieldCheckIcon,
  CurrencyDollarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  SparklesIcon,
  LightBulbIcon,
  DocumentPlusIcon,
  PaperAirplaneIcon,
  CloudArrowUpIcon,
  FolderOpenIcon,
  MagnifyingGlassIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';

interface TaxSummary {
  estimatedTaxOwed: number;
  effectiveTaxRate: number;
  marginalTaxRate: number;
  totalDeductions: number;
  totalCredits: number;
  estimatedRefund: number;
  quarterlyPayments: number[];
  filingStatus: string;
  dependents: number;
}

interface TaxBracket {
  min: number;
  max: number;
  rate: number;
  taxOwed: number;
  income: number;
}

interface TaxDeduction {
  name: string;
  amount: number;
  category: string;
  eligible: boolean;
  documentation: boolean;
}

interface TaxCredit {
  name: string;
  amount: number;
  type: 'refundable' | 'non-refundable';
  qualified: boolean;
  requirements: string[];
}

interface TaxDocument {
  id: string;
  name: string;
  type: string;
  uploadedAt: Date;
  status: 'pending' | 'verified' | 'missing';
  year: number;
  category: string;
}

interface TaxStrategy {
  id: string;
  title: string;
  description: string;
  potentialSavings: number;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  deadline?: Date;
  implemented: boolean;
}

const COLORS = {
  primary: '#3b82f6',
  secondary: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  purple: '#8b5cf6',
  pink: '#ec4899',
  indigo: '#6366f1',
  teal: '#14b8a6'
};

export function TaxPlanningDashboard() {
  const [taxSummary, setTaxSummary] = useState<TaxSummary | null>(null);
  const [taxBrackets, setTaxBrackets] = useState<TaxBracket[]>([]);
  const [deductions, setDeductions] = useState<TaxDeduction[]>([]);
  const [credits, setCredits] = useState<TaxCredit[]>([]);
  const [documents, setDocuments] = useState<TaxDocument[]>([]);
  const [strategies, setStrategies] = useState<TaxStrategy[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'deductions' | 'documents' | 'strategies'>('overview');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    fetchTaxData();
  }, [selectedYear]);

  const fetchTaxData = async () => {
    setIsLoading(true);
    try {
      // Fetch tax summary
      const summaryResponse = await fetch(`/api/v1/tax/summary?year=${selectedYear}`);
      if (summaryResponse.ok) {
        const summaryData = await summaryResponse.json();
        setTaxSummary(summaryData);
      }

      // Fetch deductions and credits
      const deductionsResponse = await fetch(`/api/v1/tax/deductions?year=${selectedYear}`);
      if (deductionsResponse.ok) {
        const deductionsData = await deductionsResponse.json();
        setDeductions(deductionsData.deductions || []);
        setCredits(deductionsData.credits || []);
      }

      // Fetch documents
      const documentsResponse = await fetch(`/api/v1/tax/documents?year=${selectedYear}`);
      if (documentsResponse.ok) {
        const documentsData = await documentsResponse.json();
        setDocuments(documentsData.documents || []);
      }

      // Fetch strategies
      const strategiesResponse = await fetch('/api/v1/tax/strategies');
      if (strategiesResponse.ok) {
        const strategiesData = await strategiesResponse.json();
        setStrategies(strategiesData.strategies || []);
      }

      // Calculate tax brackets
      calculateTaxBrackets();
    } catch (error) {
      console.error('Error fetching tax data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateTaxBrackets = () => {
    // Simplified tax bracket calculation for demonstration
    const income = 85000; // This would come from actual data
    const brackets2024 = [
      { min: 0, max: 11600, rate: 0.10 },
      { min: 11600, max: 47150, rate: 0.12 },
      { min: 47150, max: 100525, rate: 0.22 },
      { min: 100525, max: 191950, rate: 0.24 },
      { min: 191950, max: 243725, rate: 0.32 },
      { min: 243725, max: 609350, rate: 0.35 },
      { min: 609350, max: Infinity, rate: 0.37 }
    ];

    const calculatedBrackets: TaxBracket[] = [];
    let remainingIncome = income;
    let totalTax = 0;

    brackets2024.forEach((bracket, index) => {
      if (remainingIncome > 0) {
        const taxableInBracket = Math.min(
          remainingIncome,
          bracket.max - bracket.min
        );
        const taxOwed = taxableInBracket * bracket.rate;
        totalTax += taxOwed;
        
        calculatedBrackets.push({
          ...bracket,
          income: taxableInBracket,
          taxOwed
        });
        
        remainingIncome -= taxableInBracket;
      }
    });

    setTaxBrackets(calculatedBrackets);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatPercent = (value: number) => {
    return `${(value * 100).toFixed(1)}%`;
  };

  const getDocumentStatusColor = (status: string) => {
    switch (status) {
      case 'verified': return 'text-green-600 bg-green-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'missing': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'hard': return 'text-orange-600 bg-orange-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  // Mock data for demonstration
  if (!taxSummary) {
    setTaxSummary({
      estimatedTaxOwed: 12500,
      effectiveTaxRate: 0.147,
      marginalTaxRate: 0.22,
      totalDeductions: 25900,
      totalCredits: 3200,
      estimatedRefund: 0,
      quarterlyPayments: [3125, 3125, 3125, 3125],
      filingStatus: 'Single',
      dependents: 0
    });
  }

  const deductionsByCategory = deductions.reduce((acc, deduction) => {
    const category = deduction.category;
    if (!acc[category]) {
      acc[category] = { name: category, value: 0 };
    }
    acc[category].value += deduction.amount;
    return acc;
  }, {} as Record<string, { name: string; value: number }>);

  const deductionChartData = Object.values(deductionsByCategory);

  const monthlyTaxData = [
    { month: 'Jan', income: 7000, withheld: 1050, owed: 1029 },
    { month: 'Feb', income: 7000, withheld: 1050, owed: 1029 },
    { month: 'Mar', income: 7000, withheld: 1050, owed: 1029 },
    { month: 'Apr', income: 7500, withheld: 1125, owed: 1103 },
    { month: 'May', income: 7500, withheld: 1125, owed: 1103 },
    { month: 'Jun', income: 7500, withheld: 1125, owed: 1103 },
    { month: 'Jul', income: 7500, withheld: 1125, owed: 1103 },
    { month: 'Aug', income: 7500, withheld: 1125, owed: 1103 },
    { month: 'Sep', income: 7500, withheld: 1125, owed: 1103 },
    { month: 'Oct', income: 7500, withheld: 1125, owed: 1103 },
    { month: 'Nov', income: 7500, withheld: 1125, owed: 1103 },
    { month: 'Dec', income: 8500, withheld: 1275, owed: 1250 }
  ];

  const optimizationRadarData = [
    { category: 'Retirement', current: 60, optimal: 100 },
    { category: 'Deductions', current: 75, optimal: 100 },
    { category: 'Credits', current: 40, optimal: 100 },
    { category: 'Timing', current: 85, optimal: 100 },
    { category: 'Investments', current: 50, optimal: 100 },
    { category: 'Business', current: 30, optimal: 100 }
  ];

  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* Tax Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <BanknotesIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <span className="text-sm text-gray-500">2024 Tax Year</span>
          </div>
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Estimated Tax</h3>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {formatCurrency(taxSummary?.estimatedTaxOwed || 0)}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Due April 15, 2025
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
              <ChartBarIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <span className={`text-sm ${taxSummary?.effectiveTaxRate > 0.15 ? 'text-orange-600' : 'text-green-600'}`}>
              {taxSummary?.effectiveTaxRate > 0.15 ? <ArrowTrendingUpIcon className="h-4 w-4" /> : <ArrowTrendingDownIcon className="h-4 w-4" />}
            </span>
          </div>
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Effective Rate</h3>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {formatPercent(taxSummary?.effectiveTaxRate || 0)}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Marginal: {formatPercent(taxSummary?.marginalTaxRate || 0)}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <DocumentTextIcon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <CheckCircleIcon className="h-5 w-5 text-green-600" />
          </div>
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Deductions</h3>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {formatCurrency(taxSummary?.totalDeductions || 0)}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {deductions.length} items claimed
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-pink-100 dark:bg-pink-900 rounded-lg">
              <SparklesIcon className="h-6 w-6 text-pink-600 dark:text-pink-400" />
            </div>
            <span className="text-sm font-semibold text-green-600">
              +{formatCurrency(taxSummary?.totalCredits || 0)}
            </span>
          </div>
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Tax Credits</h3>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {credits.length}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Credits applied
          </p>
        </motion.div>
      </div>

      {/* Tax Bracket Visualization */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Tax Bracket Breakdown
          </h3>
          <div className="space-y-3">
            {taxBrackets.map((bracket, index) => (
              <div key={index} className="relative">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {formatPercent(bracket.rate)} on {formatCurrency(bracket.income)}
                  </span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {formatCurrency(bracket.taxOwed)}
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-blue-400 to-blue-600 h-2 rounded-full"
                    style={{ width: `${(bracket.income / 85000) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Deductions by Category
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={deductionChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${formatCurrency(value)}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {deductionChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={Object.values(COLORS)[index % Object.values(COLORS).length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Monthly Tax Tracking */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-white dark:bg-gray-800 rounded-lg shadow p-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Monthly Tax Tracking
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={monthlyTaxData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" />
              <YAxis tickFormatter={(value) => `$${value}`} />
              <Tooltip formatter={(value: number) => formatCurrency(value)} />
              <Legend />
              <Line
                type="monotone"
                dataKey="income"
                stroke={COLORS.primary}
                strokeWidth={2}
                name="Monthly Income"
              />
              <Line
                type="monotone"
                dataKey="withheld"
                stroke={COLORS.secondary}
                strokeWidth={2}
                name="Tax Withheld"
              />
              <Line
                type="monotone"
                dataKey="owed"
                stroke={COLORS.warning}
                strokeWidth={2}
                strokeDasharray="5 5"
                name="Tax Owed"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Tax Optimization Radar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="bg-white dark:bg-gray-800 rounded-lg shadow p-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Tax Optimization Score
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={optimizationRadarData}>
                <PolarGrid stroke="#e5e7eb" />
                <PolarAngleAxis dataKey="category" tick={{ fontSize: 12 }} />
                <PolarRadiusAxis angle={90} domain={[0, 100]} />
                <Radar
                  name="Current"
                  dataKey="current"
                  stroke={COLORS.primary}
                  fill={COLORS.primary}
                  fillOpacity={0.6}
                />
                <Radar
                  name="Optimal"
                  dataKey="optimal"
                  stroke={COLORS.secondary}
                  fill={COLORS.secondary}
                  fillOpacity={0.3}
                />
                <Legend />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900 dark:text-white">Optimization Opportunities</h4>
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <LightBulbIcon className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    Maximize Retirement Contributions
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    You can contribute ${6500 - 3000} more to your IRA this year
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <LightBulbIcon className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    Review Tax Credits
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    3 potential credits worth ${2500} identified
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <LightBulbIcon className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    Optimize Investment Timing
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Consider tax-loss harvesting opportunities
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Quarterly Payment Schedule */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="bg-white dark:bg-gray-800 rounded-lg shadow p-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Quarterly Payment Schedule
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {taxSummary?.quarterlyPayments.map((payment, index) => (
            <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Q{index + 1} 2024
                </span>
                <CalendarIcon className="h-5 w-5 text-gray-400" />
              </div>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(payment)}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Due {index === 0 ? 'Apr 15' : index === 1 ? 'Jun 15' : index === 2 ? 'Sep 15' : 'Jan 15'}
              </p>
              {index < 2 && (
                <span className="inline-flex items-center gap-1 text-xs text-green-600 mt-2">
                  <CheckCircleIcon className="h-3 w-3" />
                  Paid
                </span>
              )}
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );

  const renderDeductionsTab = () => (
    <div className="space-y-6">
      {/* Deductions Summary */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Deductions Overview
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Standard Deduction</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(13850)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Itemized Deductions</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {formatCurrency(taxSummary?.totalDeductions || 0)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Recommendation</p>
            <p className="text-2xl font-bold text-green-600">
              {(taxSummary?.totalDeductions || 0) > 13850 ? 'Itemize' : 'Standard'}
            </p>
          </div>
        </div>
      </div>

      {/* Available Deductions */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Available Deductions
          </h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {[
              { name: 'Mortgage Interest', amount: 12000, category: 'Housing', eligible: true, documentation: true },
              { name: 'State and Local Taxes', amount: 10000, category: 'Taxes', eligible: true, documentation: true },
              { name: 'Charitable Donations', amount: 3500, category: 'Charity', eligible: true, documentation: false },
              { name: 'Medical Expenses', amount: 2800, category: 'Medical', eligible: false, documentation: true },
              { name: 'Home Office', amount: 1800, category: 'Business', eligible: true, documentation: true },
              { name: 'Student Loan Interest', amount: 2500, category: 'Education', eligible: true, documentation: true }
            ].map((deduction, index) => (
              <div key={index} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-lg ${
                    deduction.eligible ? 'bg-green-100 dark:bg-green-900/20' : 'bg-gray-100 dark:bg-gray-900/20'
                  }`}>
                    {deduction.category === 'Housing' && <HomeIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" />}
                    {deduction.category === 'Taxes' && <BanknotesIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" />}
                    {deduction.category === 'Charity' && <HeartIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" />}
                    {deduction.category === 'Medical' && <ShieldCheckIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" />}
                    {deduction.category === 'Business' && <BriefcaseIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" />}
                    {deduction.category === 'Education' && <AcademicCapIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" />}
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">{deduction.name}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{deduction.category}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {formatCurrency(deduction.amount)}
                  </span>
                  <div className="flex gap-2">
                    {deduction.eligible ? (
                      <CheckCircleIcon className="h-5 w-5 text-green-600" />
                    ) : (
                      <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600" />
                    )}
                    {deduction.documentation ? (
                      <DocumentTextIcon className="h-5 w-5 text-blue-600" />
                    ) : (
                      <DocumentPlusIcon className="h-5 w-5 text-gray-400" />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tax Credits */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Tax Credits
          </h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { 
                name: 'Child Tax Credit', 
                amount: 2000, 
                type: 'refundable' as const, 
                qualified: true,
                requirements: ['Child under 17', 'Valid SSN', 'Income under $200k']
              },
              { 
                name: 'Earned Income Credit', 
                amount: 0, 
                type: 'refundable' as const, 
                qualified: false,
                requirements: ['Income below threshold', 'Earned income', 'Valid SSN']
              },
              { 
                name: 'Education Credit', 
                amount: 1200, 
                type: 'non-refundable' as const, 
                qualified: true,
                requirements: ['Enrolled in eligible program', 'Qualified expenses', 'Not claimed for 4 years']
              },
              { 
                name: 'Energy Efficiency Credit', 
                amount: 0, 
                type: 'non-refundable' as const, 
                qualified: false,
                requirements: ['Qualifying improvements', 'Primary residence', 'Meeting efficiency standards']
              }
            ].map((credit, index) => (
              <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">{credit.name}</h4>
                    <span className={`inline-flex px-2 py-1 text-xs rounded-full mt-1 ${
                      credit.type === 'refundable' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                        : 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                    }`}>
                      {credit.type}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-gray-900 dark:text-white">
                      {formatCurrency(credit.amount)}
                    </p>
                    {credit.qualified ? (
                      <span className="text-xs text-green-600 flex items-center gap-1 justify-end">
                        <CheckCircleIcon className="h-3 w-3" />
                        Qualified
                      </span>
                    ) : (
                      <span className="text-xs text-gray-500">Not eligible</span>
                    )}
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Requirements:</p>
                  {credit.requirements.map((req, idx) => (
                    <p key={idx} className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-1">
                      <span className={credit.qualified ? 'text-green-600' : 'text-gray-400'}>•</span>
                      {req}
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderDocumentsTab = () => (
    <div className="space-y-6">
      {/* Document Upload Area */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Tax Document Vault
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Securely store and organize your tax documents
            </p>
          </div>
          <button
            onClick={() => setShowUploadModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <CloudArrowUpIcon className="h-5 w-5" />
            Upload Documents
          </button>
        </div>

        {/* Document Status Summary */}
        <div className="grid grid-cols-3 gap-4 mt-4">
          <div className="text-center">
            <p className="text-3xl font-bold text-green-600">12</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Verified</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-yellow-600">3</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Pending</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-red-600">5</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Missing</p>
          </div>
        </div>
      </div>

      {/* Document Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { category: 'Income', icon: <CurrencyDollarIcon />, docs: ['W-2', '1099-INT', '1099-DIV'], count: 4 },
          { category: 'Deductions', icon: <DocumentTextIcon />, docs: ['Mortgage 1098', 'Property Tax', 'Donations'], count: 6 },
          { category: 'Healthcare', icon: <ShieldCheckIcon />, docs: ['1095-A', 'Medical Bills', 'HSA'], count: 3 },
          { category: 'Education', icon: <AcademicCapIcon />, docs: ['1098-T', 'Student Loan'], count: 2 },
          { category: 'Business', icon: <BriefcaseIcon />, docs: ['Schedule C', 'Receipts'], count: 4 },
          { category: 'Investments', icon: <ChartBarIcon />, docs: ['1099-B', 'K-1'], count: 3 }
        ].map((category, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 cursor-pointer hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                <div className="h-6 w-6 text-gray-600 dark:text-gray-400">
                  {category.icon}
                </div>
              </div>
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                {category.count}
              </span>
            </div>
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">
              {category.category}
            </h4>
            <div className="space-y-1">
              {category.docs.map((doc, idx) => (
                <p key={idx} className="text-sm text-gray-600 dark:text-gray-400">
                  • {doc}
                </p>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Recent Documents */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Recent Documents
          </h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {[
              { name: 'W-2 - Employer Inc.', type: 'Income', uploadedAt: new Date('2024-01-15'), status: 'verified' as const, year: 2024 },
              { name: '1099-INT - Bank Account', type: 'Income', uploadedAt: new Date('2024-01-20'), status: 'verified' as const, year: 2024 },
              { name: 'Property Tax Statement', type: 'Deduction', uploadedAt: new Date('2024-01-25'), status: 'pending' as const, year: 2024 },
              { name: 'Charitable Donations Receipt', type: 'Deduction', uploadedAt: new Date('2024-02-01'), status: 'pending' as const, year: 2024 },
              { name: '1098 - Mortgage Interest', type: 'Deduction', uploadedAt: new Date('2024-02-05'), status: 'missing' as const, year: 2024 }
            ].map((doc, index) => (
              <div key={index} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div className="flex items-center gap-4">
                  <DocumentTextIcon className="h-8 w-8 text-gray-400" />
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">{doc.name}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {doc.type} • {doc.year} • Uploaded {doc.uploadedAt.toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`inline-flex px-3 py-1 text-xs rounded-full ${getDocumentStatusColor(doc.status)}`}>
                    {doc.status}
                  </span>
                  <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                    <DocumentArrowDownIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderStrategiesTab = () => (
    <div className="space-y-6">
      {/* Strategy Overview */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Tax Optimization Strategies
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Implement these strategies to reduce your tax liability
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Potential Savings</p>
            <p className="text-2xl font-bold text-green-600">{formatCurrency(8500)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Implemented</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">3 of 12</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Time Remaining</p>
            <p className="text-2xl font-bold text-orange-600">45 days</p>
          </div>
        </div>
      </div>

      {/* Active Strategies */}
      <div className="space-y-4">
        {[
          {
            title: 'Max Out 401(k) Contributions',
            description: 'Contribute the maximum $22,500 to reduce taxable income',
            potentialSavings: 4950,
            difficulty: 'easy' as const,
            category: 'Retirement',
            deadline: new Date('2024-12-31'),
            implemented: false
          },
          {
            title: 'Contribute to HSA',
            description: 'Triple tax advantage: deductible, tax-free growth, tax-free withdrawals',
            potentialSavings: 825,
            difficulty: 'easy' as const,
            category: 'Healthcare',
            deadline: new Date('2025-04-15'),
            implemented: true
          },
          {
            title: 'Tax Loss Harvesting',
            description: 'Sell underperforming investments to offset capital gains',
            potentialSavings: 1200,
            difficulty: 'medium' as const,
            category: 'Investments',
            deadline: new Date('2024-12-31'),
            implemented: false
          },
          {
            title: 'Bunch Charitable Donations',
            description: 'Combine 2 years of donations to exceed standard deduction',
            potentialSavings: 800,
            difficulty: 'medium' as const,
            category: 'Charity',
            deadline: new Date('2024-12-31'),
            implemented: false
          },
          {
            title: 'Start a Side Business',
            description: 'Deduct business expenses and qualify for QBI deduction',
            potentialSavings: 1500,
            difficulty: 'hard' as const,
            category: 'Business',
            implemented: false
          }
        ].map((strategy, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`bg-white dark:bg-gray-800 rounded-lg shadow p-6 ${
              strategy.implemented ? 'border-l-4 border-green-500' : ''
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                    {strategy.title}
                  </h4>
                  <span className={`inline-flex px-2 py-1 text-xs rounded-full ${getDifficultyColor(strategy.difficulty)}`}>
                    {strategy.difficulty}
                  </span>
                  {strategy.implemented && (
                    <CheckCircleIcon className="h-5 w-5 text-green-600" />
                  )}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  {strategy.description}
                </p>
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-gray-600 dark:text-gray-400">
                    Category: {strategy.category}
                  </span>
                  {strategy.deadline && (
                    <span className="text-gray-600 dark:text-gray-400 flex items-center gap-1">
                      <ClockIcon className="h-4 w-4" />
                      Due: {strategy.deadline.toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
              <div className="text-right ml-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">Potential Savings</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(strategy.potentialSavings)}
                </p>
                {!strategy.implemented && (
                  <button className="mt-2 px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
                    Start
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Year-End Planning Checklist */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Year-End Tax Planning Checklist
        </h3>
        <div className="space-y-3">
          {[
            { task: 'Review and adjust W-4 withholdings', completed: true },
            { task: 'Estimate Q4 quarterly payment', completed: true },
            { task: 'Gather all tax documents', completed: false },
            { task: 'Schedule appointment with tax advisor', completed: false },
            { task: 'Review investment portfolio for tax efficiency', completed: false },
            { task: 'Make final retirement contributions', completed: false },
            { task: 'Document all charitable donations', completed: true },
            { task: 'Organize business expense receipts', completed: false }
          ].map((item, index) => (
            <label key={index} className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={item.completed}
                onChange={() => {}}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className={`text-sm ${
                item.completed ? 'text-gray-500 line-through' : 'text-gray-900 dark:text-white'
              }`}>
                {item.task}
              </span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <CalculatorIcon className="h-8 w-8" />
              Tax Planning Dashboard
            </h1>
            <p className="mt-2 text-indigo-100">
              Optimize your taxes and maximize your savings
            </p>
          </div>
          <div className="flex items-center gap-4">
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="px-4 py-2 bg-white/20 border border-white/30 rounded-lg text-white backdrop-blur-sm"
            >
              <option value={2024}>2024 Tax Year</option>
              <option value={2023}>2023 Tax Year</option>
              <option value={2022}>2022 Tax Year</option>
            </select>
            <button className="flex items-center gap-2 px-4 py-2 bg-white text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors">
              <PaperAirplaneIcon className="h-5 w-5" />
              File Taxes
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex -mb-px">
            {[
              { id: 'overview', label: 'Overview', icon: <ChartBarIcon className="h-5 w-5" /> },
              { id: 'deductions', label: 'Deductions & Credits', icon: <DocumentTextIcon className="h-5 w-5" /> },
              { id: 'documents', label: 'Documents', icon: <FolderOpenIcon className="h-5 w-5" /> },
              { id: 'strategies', label: 'Tax Strategies', icon: <LightBulbIcon className="h-5 w-5" /> }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-6 py-4 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'overview' && renderOverviewTab()}
          {activeTab === 'deductions' && renderDeductionsTab()}
          {activeTab === 'documents' && renderDocumentsTab()}
          {activeTab === 'strategies' && renderStrategiesTab()}
        </motion.div>
      </AnimatePresence>

      {/* Upload Modal */}
      <AnimatePresence>
        {showUploadModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6"
            >
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Upload Tax Documents
              </h2>
              
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
                <CloudArrowUpIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Drag and drop your files here, or click to browse
                </p>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  Choose Files
                </button>
              </div>

              <div className="mt-4 space-y-2">
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  • Accepted formats: PDF, JPG, PNG
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  • Maximum file size: 10MB
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  • Files are encrypted and stored securely
                </p>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  Upload
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}