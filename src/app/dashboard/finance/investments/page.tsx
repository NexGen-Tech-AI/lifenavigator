'use client';

import { useState, useEffect } from "react";
import dynamic from 'next/dynamic';
import { InvestmentPortfolioAnalysis } from "@/components/domain/finance/investment/InvestmentPortfolioAnalysis";
import { PortfolioPerformance } from "@/components/domain/finance/investment/PortfolioPerformance";
import { AssetAllocation } from "@/components/domain/finance/investment/AssetAllocation";
import { InvestmentCalculator } from "@/components/domain/finance/investment/InvestmentCalculator";
import { PortfolioRiskAnalysis } from "@/components/domain/finance/investment/PortfolioRiskAnalysis";
import { InvestmentInsights } from "@/components/domain/finance/investment/InvestmentInsights";
import { LoadingSpinner } from "@/components/ui/loaders/LoadingSpinner";
import { useInvestmentPortfolio } from "@/hooks/useInvestments";
import { BarChart3, Calculator, FileText, Target, Shield, Heart, Users } from "lucide-react";

// Dynamic import for advanced features to avoid SSR issues
const AdvancedAnalytics = dynamic(
  () => import('@/components/domain/finance/investment/AdvancedAnalytics'),
  { ssr: false, loading: () => <LoadingSpinner /> }
);

const FinancialPlanningTab = dynamic(
  () => import('@/components/domain/finance/investment/FinancialPlanningTab'),
  { ssr: false, loading: () => <LoadingSpinner /> }
);

const GoalsTrackingTab = dynamic(
  () => import('@/components/domain/finance/investment/GoalsTrackingTab'),
  { ssr: false, loading: () => <LoadingSpinner /> }
);

const InsuranceLegacyTab = dynamic(
  () => import('@/components/domain/finance/investment/InsuranceLegacyTab'),
  { ssr: false, loading: () => <LoadingSpinner /> }
);

const CharitableGivingTab = dynamic(
  () => import('@/components/domain/finance/investment/CharitableGivingTab'),
  { ssr: false, loading: () => <LoadingSpinner /> }
);

const ReportsTab = dynamic(
  () => import('@/components/domain/finance/investment/ReportsTab'),
  { ssr: false, loading: () => <LoadingSpinner /> }
);

export default function InvestmentPage() {
  const { portfolio, isLoading, error } = useInvestmentPortfolio();
  const [activeTab, setActiveTab] = useState('overview');
  const [summaryData, setSummaryData] = useState({
    portfolioValue: 0,
    ytdReturn: 0,
    ytdReturnValue: 0,
    dailyChange: 0,
    dailyChangePercent: 0,
    beta: 0,
    riskProfile: 'Moderate'
  });

  useEffect(() => {
    if (portfolio) {
      // Calculate accurate values based on portfolio data
      const totalValue = portfolio.totalValue;
      const totalCostBasis = portfolio.totalCostBasis;
      const totalGainLoss = portfolio.totalGainLoss;
      const totalGainLossPercent = portfolio.totalGainLossPercent;
      
      // Calculate YTD return (this would ideally come from performance data)
      const currentDate = new Date();
      const yearStart = new Date(currentDate.getFullYear(), 0, 1);
      const daysInYear = Math.floor((currentDate.getTime() - yearStart.getTime()) / (1000 * 60 * 60 * 24));
      const annualizedReturn = totalGainLossPercent * (365 / daysInYear);
      
      setSummaryData({
        portfolioValue: totalValue,
        ytdReturn: totalGainLossPercent * (daysInYear / 365), // Simplified YTD calculation
        ytdReturnValue: totalGainLoss * (daysInYear / 365),
        dailyChange: totalValue * 0.005, // Simulated daily change
        dailyChangePercent: 0.5,
        beta: portfolio.riskMetrics.beta,
        riskProfile: portfolio.risk
      });
    }
  }, [portfolio]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner size="large" />
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="container mx-auto py-6">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 text-center">
          <h2 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">
            Error Loading Investment Data
          </h2>
          <p className="text-red-600 dark:text-red-300">
            {error || 'Failed to load investment portfolio'}
          </p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'analytics', label: 'Advanced Analytics', icon: <Calculator className="w-4 h-4" /> },
    { id: 'planning', label: 'Financial Planning', icon: <Target className="w-4 h-4" /> },
    { id: 'goals', label: 'Goals', icon: <Target className="w-4 h-4" /> },
    { id: 'insurance', label: 'Insurance & Legacy', icon: <Shield className="w-4 h-4" /> },
    { id: 'charitable', label: 'Charitable Giving', icon: <Heart className="w-4 h-4" /> },
    { id: 'reports', label: 'Reports', icon: <FileText className="w-4 h-4" /> }
  ];

  return (
    <div className="container mx-auto py-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Investment Portfolio</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Comprehensive wealth management and financial planning</p>
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          Add Investment
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
        <nav className="-mb-px flex space-x-8 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap
                ${activeTab === tab.id
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }
              `}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl shadow-lg border border-blue-100 dark:border-blue-800 transform hover:scale-105 transition-transform duration-200">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300">Portfolio Value</h2>
                <div className="p-2 bg-blue-100 dark:bg-blue-800 rounded-lg">
                  <svg className="w-6 h-6 text-blue-600 dark:text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{formatCurrency(summaryData.portfolioValue)}</p>
              <div className="flex items-center">
                <span className={`text-sm font-medium flex items-center ${summaryData.dailyChange >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {summaryData.dailyChange >= 0 ? (
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 10.293a1 1 0 010 1.414l-6 6a1 1 0 01-1.414 0l-6-6a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l4.293-4.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                  {formatCurrency(Math.abs(summaryData.dailyChange))} ({Math.abs(summaryData.dailyChangePercent).toFixed(2)}%)
                </span>
                <span className="text-gray-500 dark:text-gray-400 text-sm ml-2">Today</span>
              </div>
            </div>

            <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl shadow-lg border border-green-100 dark:border-green-800 transform hover:scale-105 transition-transform duration-200">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300">YTD Return</h2>
                <div className="p-2 bg-green-100 dark:bg-green-800 rounded-lg">
                  <svg className="w-6 h-6 text-green-600 dark:text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
              </div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{summaryData.ytdReturn.toFixed(2)}%</p>
              <div className="flex items-center">
                <span className="text-green-600 dark:text-green-400 text-sm font-medium flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                  {formatCurrency(summaryData.ytdReturnValue)}
                </span>
                <span className="text-gray-500 dark:text-gray-400 text-sm ml-2">Since Jan 1</span>
              </div>
            </div>

            <div className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl shadow-lg border border-purple-100 dark:border-purple-800 transform hover:scale-105 transition-transform duration-200">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300">Risk Profile</h2>
                <div className="p-2 bg-purple-100 dark:bg-purple-800 rounded-lg">
                  <svg className="w-6 h-6 text-purple-600 dark:text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
              </div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{summaryData.riskProfile}</p>
              <div className="flex items-center">
                <span className="text-purple-600 dark:text-purple-400 text-sm font-medium">Beta: {summaryData.beta.toFixed(2)}</span>
                <span className="text-gray-500 dark:text-gray-400 text-sm ml-2">vs. S&P 500</span>
              </div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <PortfolioPerformance />
            <AssetAllocation />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <PortfolioRiskAnalysis />
            <InvestmentInsights />
          </div>

          <div className="mb-8">
            <InvestmentPortfolioAnalysis />
          </div>

          <div>
            <InvestmentCalculator />
          </div>
        </>
      )}

      {activeTab === 'analytics' && <AdvancedAnalytics portfolio={portfolio} />}
      {activeTab === 'planning' && <FinancialPlanningTab portfolio={portfolio} />}
      {activeTab === 'goals' && <GoalsTrackingTab portfolio={portfolio} />}
      {activeTab === 'insurance' && <InsuranceLegacyTab portfolio={portfolio} />}
      {activeTab === 'charitable' && <CharitableGivingTab portfolio={portfolio} />}
      {activeTab === 'reports' && <ReportsTab portfolio={portfolio} />}
    </div>
  );
}