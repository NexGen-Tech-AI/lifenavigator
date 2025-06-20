import React from 'react';
import { motion } from 'framer-motion';
import {
  ExclamationTriangleIcon,
  ShieldCheckIcon,
  LightBulbIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon
} from '@heroicons/react/24/outline';
import { RiskAnalysis, RiskScore, Recommendation } from '@/lib/services/riskAnalysisService';

// Utility function
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

interface RiskDashboardProps {
  analysis: RiskAnalysis;
  onGenerateReport?: () => void;
}

export const RiskDashboard: React.FC<RiskDashboardProps> = ({ 
  analysis,
  onGenerateReport 
}) => {
  const getRiskColor = (level: string) => {
    switch (level) {
      case 'CRITICAL': return 'red';
      case 'HIGH': return 'orange';
      case 'MODERATE': return 'yellow';
      case 'LOW': return 'green';
      default: return 'gray';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'IMMEDIATE': return 'red';
      case 'HIGH': return 'orange';
      case 'MEDIUM': return 'yellow';
      case 'LOW': return 'green';
      default: return 'gray';
    }
  };

  return (
    <div className="space-y-6">
      {/* Overall Risk Score */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Financial Risk Analysis
          </h2>
          <button
            onClick={onGenerateReport}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <DocumentTextIcon className="h-5 w-5" />
            Generate PDF Report
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Overall Score */}
          <div className="text-center">
            <div className="relative inline-flex items-center justify-center">
              <svg className="w-32 h-32 transform -rotate-90">
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  className="text-gray-200 dark:text-gray-700"
                />
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 56}`}
                  strokeDashoffset={`${2 * Math.PI * 56 * (1 - analysis.overallRiskScore / 100)}`}
                  className={`text-${getRiskColor(analysis.riskLevel)}-500 transition-all duration-1000`}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div>
                  <div className="text-3xl font-bold text-gray-900 dark:text-white">
                    {analysis.overallRiskScore}
                  </div>
                  <div className="text-sm text-gray-500">Score</div>
                </div>
              </div>
            </div>
            <div className={`mt-4 text-lg font-semibold text-${getRiskColor(analysis.riskLevel)}-600`}>
              {analysis.riskLevel} RISK
            </div>
          </div>

          {/* Risk Breakdown */}
          <div className="col-span-2 space-y-3">
            {analysis.risks.map((risk, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {risk.category}
                    </span>
                    <span className={`text-sm font-semibold text-${getRiskColor(risk.level)}-600`}>
                      {risk.score}/100
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className={`bg-${getRiskColor(risk.level)}-500 h-2 rounded-full transition-all duration-500`}
                      style={{ width: `${risk.score}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Critical Warnings */}
      {analysis.warnings.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6"
        >
          <div className="flex items-start gap-3">
            <ExclamationTriangleIcon className="h-6 w-6 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-red-900 dark:text-red-200 mb-3">
                Critical Warnings
              </h3>
              <ul className="space-y-2">
                {analysis.warnings.map((warning, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-red-800 dark:text-red-300">
                    <XCircleIcon className="h-4 w-4 flex-shrink-0 mt-0.5" />
                    <span>{warning}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </motion.div>
      )}

      {/* Recommendations */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6"
      >
        <div className="flex items-center gap-3 mb-6">
          <ShieldCheckIcon className="h-6 w-6 text-blue-600" />
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            Recommended Actions
          </h3>
        </div>

        <div className="space-y-4">
          {analysis.recommendations.map((rec) => (
            <motion.div
              key={rec.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full 
                      bg-${getPriorityColor(rec.priority)}-100 text-${getPriorityColor(rec.priority)}-800
                      dark:bg-${getPriorityColor(rec.priority)}-900/30 dark:text-${getPriorityColor(rec.priority)}-400`}>
                      {rec.priority}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {rec.category}
                    </span>
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {rec.title}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                    {rec.description}
                  </p>
                </div>
                {rec.estimatedSavings && (
                  <div className="text-right ml-4">
                    <div className="text-sm text-gray-500">Potential Savings</div>
                    <div className="text-lg font-semibold text-green-600">
                      {formatCurrency(rec.estimatedSavings)}
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                <div className="flex items-center gap-2 text-sm">
                  <ArrowTrendingUpIcon className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600 dark:text-gray-300">
                    <strong>Impact:</strong> {rec.impact}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircleIcon className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600 dark:text-gray-300">
                    <strong>Timeline:</strong> {rec.timeline}
                  </span>
                </div>
              </div>

              <details className="mt-3">
                <summary className="cursor-pointer text-sm font-medium text-blue-600 hover:text-blue-700">
                  View Implementation Steps
                </summary>
                <ul className="mt-3 space-y-2 pl-5">
                  {rec.implementation.map((step, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300">
                      <span className="text-blue-600 font-medium">{index + 1}.</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
              </details>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Opportunities */}
      {analysis.opportunities.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6"
        >
          <div className="flex items-start gap-3">
            <LightBulbIcon className="h-6 w-6 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-green-900 dark:text-green-200 mb-3">
                Opportunities
              </h3>
              <ul className="space-y-2">
                {analysis.opportunities.map((opportunity, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-green-800 dark:text-green-300">
                    <ArrowTrendingUpIcon className="h-4 w-4 flex-shrink-0 mt-0.5" />
                    <span>{opportunity}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </motion.div>
      )}

      {/* Risk Details */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6"
      >
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
          Risk Factor Details
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {analysis.risks.map((risk, index) => (
            <div
              key={index}
              className={`border-l-4 border-${getRiskColor(risk.level)}-500 pl-4`}
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-gray-900 dark:text-white">
                  {risk.category}
                </h4>
                <span className={`text-sm font-bold text-${getRiskColor(risk.level)}-600`}>
                  {risk.level}
                </span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                {risk.impact}
              </p>
              <div className="space-y-1">
                {risk.factors.map((factor, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <span className="text-gray-400">•</span>
                    <span>{factor}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};