'use client';

import { useState, useEffect } from "react";
import { InvestmentPortfolioAnalysis } from "@/components/domain/finance/investment/InvestmentPortfolioAnalysis";
import { PortfolioPerformance } from "@/components/domain/finance/investment/PortfolioPerformance";
import { AssetAllocation } from "@/components/domain/finance/investment/AssetAllocation";
import { InvestmentCalculator } from "@/components/domain/finance/investment/InvestmentCalculator";
import { PortfolioRiskAnalysis } from "@/components/domain/finance/investment/PortfolioRiskAnalysis";
import { InvestmentInsights } from "@/components/domain/finance/investment/InvestmentInsights";
import { LoadingSpinner } from "@/components/ui/loaders/LoadingSpinner";
import { useInvestmentPortfolio } from "@/hooks/useInvestments";

export default function InvestmentPage() {
  const { portfolio, isLoading, error } = useInvestmentPortfolio();
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
      setSummaryData({
        portfolioValue: portfolio.totalValue,
        ytdReturn: 8.24, // In a real app, calculate from performance data
        ytdReturnValue: 32450.12, // In a real app, calculate from performance data
        dailyChange: 2134.15, // In a real app, get from daily price change
        dailyChangePercent: 0.5, // In a real app, calculate from daily price change
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

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Investment Portfolio</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Track and manage your investment performance</p>
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          Add Investment
        </button>
      </div>

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
    </div>
  );
}