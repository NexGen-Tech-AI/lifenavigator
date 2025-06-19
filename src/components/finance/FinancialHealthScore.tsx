'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import { 
  ChartBarIcon, 
  LightBulbIcon, 
  ArrowTrendingUpIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import { FinancialHealthScore as IFinancialHealthScore } from '@/lib/services/financialHealthService';

interface FinancialHealthScoreProps {
  score?: IFinancialHealthScore;
  history?: any[];
  onRefresh?: () => void;
  isLoading?: boolean;
}

export function FinancialHealthScore({ 
  score, 
  history = [], 
  onRefresh,
  isLoading = false 
}: FinancialHealthScoreProps) {
  const [selectedComponent, setSelectedComponent] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);

  // Prepare data for radar chart
  const radarData = score ? [
    { metric: 'Emergency Fund', value: score.components.emergencyFund, fullMark: 100 },
    { metric: 'Debt Management', value: score.components.debtToIncome, fullMark: 100 },
    { metric: 'Credit Usage', value: score.components.creditUtilization, fullMark: 100 },
    { metric: 'Investments', value: score.components.investmentRatio, fullMark: 100 },
    { metric: 'Income Stability', value: score.components.incomeConsistency, fullMark: 100 },
    { metric: 'Retirement', value: score.components.retirementContribution, fullMark: 100 },
    { metric: 'Budget', value: score.components.budgetCompliance, fullMark: 100 },
  ] : [];

  // Prepare history data for line chart
  const historyData = history.map((item, index) => ({
    month: new Date(item.calculated_at).toLocaleDateString('en-US', { month: 'short' }),
    score: item.score,
    national: item.national_average_score || 73,
    peer: item.age_group_average_score || 75
  })).reverse();

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 dark:text-green-400';
    if (score >= 80) return 'text-blue-600 dark:text-blue-400';
    if (score >= 70) return 'text-yellow-600 dark:text-yellow-400';
    if (score >= 60) return 'text-orange-600 dark:text-orange-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getGradeColor = (grade: string) => {
    const colors: Record<string, string> = {
      'A': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      'B': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      'C': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      'D': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      'F': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
    };
    return colors[grade] || colors['C'];
  };

  const getComponentIcon = (value: number) => {
    if (value >= 80) return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
    if (value >= 60) return <InformationCircleIcon className="h-5 w-5 text-yellow-500" />;
    return <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />;
  };

  const componentDescriptions: Record<string, string> = {
    emergencyFund: "Emergency fund coverage based on monthly expenses",
    debtToIncome: "Total debt payments relative to income",
    creditUtilization: "Credit card balance vs available credit",
    investmentRatio: "Investment assets as percentage of total assets",
    incomeConsistency: "Stability and predictability of income",
    retirementContribution: "Retirement savings rate",
    budgetCompliance: "Actual spending vs planned budget"
  };

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
          <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  if (!score) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 text-center">
        <p className="text-gray-500 dark:text-gray-400">No financial health score available</p>
        <button
          onClick={onRefresh}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Calculate Score
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Main Score Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-lg shadow p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Financial Health Score
          </h2>
          <button
            onClick={onRefresh}
            className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400"
          >
            Refresh Score
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Score Display */}
          <div className="text-center">
            <div className="relative inline-flex items-center justify-center">
              <svg className="w-32 h-32">
                <circle
                  className="text-gray-200 dark:text-gray-700"
                  strokeWidth="10"
                  stroke="currentColor"
                  fill="transparent"
                  r="56"
                  cx="64"
                  cy="64"
                />
                <circle
                  className={getScoreColor(score.score)}
                  strokeWidth="10"
                  strokeDasharray={`${(score.score / 100) * 351.86} 351.86`}
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="transparent"
                  r="56"
                  cx="64"
                  cy="64"
                  transform="rotate(-90 64 64)"
                />
              </svg>
              <div className="absolute">
                <span className={`text-4xl font-bold ${getScoreColor(score.score)}`}>
                  {score.score}
                </span>
              </div>
            </div>
            <div className="mt-4">
              <span className={`inline-flex px-3 py-1 rounded-full text-lg font-semibold ${getGradeColor(score.grade)}`}>
                Grade: {score.grade}
              </span>
            </div>
          </div>

          {/* Benchmarks */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Benchmarks</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">National Average</span>
                <span className="font-medium">{score.benchmarks.nationalAverage}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Your Age Group</span>
                <span className="font-medium">{score.benchmarks.ageGroupAverage}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Peer Percentile</span>
                <span className="font-medium">{score.benchmarks.peerPercentile}%</span>
              </div>
            </div>
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                You're in the top {100 - score.benchmarks.peerPercentile}% of your peer group!
              </p>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Key Metrics</h3>
            <div className="space-y-2">
              {Object.entries(score.components).slice(0, 3).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                  <div className="flex items-center gap-2">
                    {getComponentIcon(value)}
                    <span className="font-medium">{value}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Component Breakdown */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white dark:bg-gray-800 rounded-lg shadow p-6"
      >
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
          Score Breakdown
        </h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Radar Chart */}
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="#e5e7eb" />
                <PolarAngleAxis 
                  dataKey="metric" 
                  tick={{ fontSize: 12 }}
                  className="text-gray-600 dark:text-gray-400"
                />
                <PolarRadiusAxis 
                  angle={90} 
                  domain={[0, 100]} 
                  tick={{ fontSize: 10 }}
                  className="text-gray-500"
                />
                <Radar
                  name="Your Score"
                  dataKey="value"
                  stroke="#3b82f6"
                  fill="#3b82f6"
                  fillOpacity={0.6}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Component Details */}
          <div className="space-y-3">
            {Object.entries(score.components).map(([key, value]) => (
              <motion.div
                key={key}
                whileHover={{ scale: 1.02 }}
                className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer"
                onClick={() => setSelectedComponent(selectedComponent === key ? null : key)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getComponentIcon(value)}
                    <span className="font-medium text-gray-900 dark:text-white capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </span>
                  </div>
                  <span className={`font-bold ${getScoreColor(value)}`}>{value}</span>
                </div>
                <AnimatePresence>
                  {selectedComponent === key && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-2 text-sm text-gray-600 dark:text-gray-400"
                    >
                      {componentDescriptions[key as keyof typeof componentDescriptions]}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Recommendations */}
      {score.recommendations.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <LightBulbIcon className="h-6 w-6 text-yellow-500" />
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              Recommendations
            </h3>
          </div>
          <div className="space-y-3">
            {score.recommendations.map((recommendation, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg"
              >
                <ArrowTrendingUpIcon className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-gray-800 dark:text-gray-200">{recommendation}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* History Chart */}
      {history.length > 1 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              Score History
            </h3>
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400"
            >
              {showHistory ? 'Hide' : 'Show'} Details
            </button>
          </div>
          
          <AnimatePresence>
            {showHistory && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="h-64"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={historyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis 
                      dataKey="month" 
                      tick={{ fontSize: 12 }}
                      stroke="#6b7280"
                    />
                    <YAxis 
                      domain={[0, 100]}
                      tick={{ fontSize: 12 }}
                      stroke="#6b7280"
                    />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="score" 
                      stroke="#3b82f6" 
                      strokeWidth={2}
                      name="Your Score"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="national" 
                      stroke="#ef4444" 
                      strokeDasharray="5 5"
                      name="National Avg"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="peer" 
                      stroke="#10b981" 
                      strokeDasharray="5 5"
                      name="Peer Avg"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}