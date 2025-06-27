'use client';

import { useState } from 'react';
import { Shield, Heart, Users, FileText, Calculator, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';

interface InsuranceLegacyTabProps {
  portfolio: any;
}

export default function InsuranceLegacyTab({ portfolio }: InsuranceLegacyTabProps) {
  const [activeSection, setActiveSection] = useState('overview');

  // Insurance data
  const insuranceCoverage = {
    life: {
      current: 500000,
      recommended: 1500000,
      gap: 1000000,
      type: 'Term Life',
      premium: 125,
      provider: 'Guardian Life'
    },
    disability: {
      current: 5000,
      recommended: 8000,
      gap: 3000,
      type: 'Long-term',
      premium: 180,
      provider: 'MetLife'
    },
    health: {
      deductible: 2500,
      outOfPocketMax: 6000,
      premium: 450,
      provider: 'Blue Cross Blue Shield'
    },
    umbrella: {
      current: 1000000,
      recommended: 2000000,
      gap: 1000000,
      premium: 380,
      provider: 'State Farm'
    }
  };

  // Estate planning data
  const estatePlanning = {
    netWorth: portfolio?.totalValue || 385000,
    estateTax: {
      federal: 0,
      state: 12500,
      total: 12500
    },
    documents: [
      { name: 'Will', status: 'completed', lastUpdated: '2023-06-15' },
      { name: 'Living Trust', status: 'in_progress', lastUpdated: '2024-01-10' },
      { name: 'Power of Attorney', status: 'completed', lastUpdated: '2023-06-15' },
      { name: 'Healthcare Directive', status: 'completed', lastUpdated: '2023-06-15' },
      { name: 'Beneficiary Designations', status: 'review_needed', lastUpdated: '2022-03-20' }
    ],
    beneficiaries: [
      { name: 'Spouse', percentage: 50, type: 'Primary' },
      { name: 'Children (Equal)', percentage: 40, type: 'Primary' },
      { name: 'Charity', percentage: 10, type: 'Primary' },
      { name: 'Siblings (Equal)', percentage: 100, type: 'Contingent' }
    ]
  };

  // Legacy goals
  const legacyGoals = [
    { id: 1, goal: 'Children\'s Education Fund', target: 300000, current: 125000, progress: 41.7 },
    { id: 2, goal: 'Charitable Foundation', target: 100000, current: 25000, progress: 25 },
    { id: 3, goal: 'Family Trust', target: 500000, current: 185000, progress: 37 },
    { id: 4, goal: 'Grandchildren\'s Fund', target: 200000, current: 50000, progress: 25 }
  ];

  const calculateLifeInsuranceNeeds = () => {
    const annualIncome = 120000;
    const yearsToReplace = 10;
    const outstandingDebts = 250000;
    const futureCosts = 300000; // Education, etc.
    const existingAssets = portfolio?.totalValue || 385000;
    
    const totalNeeds = (annualIncome * yearsToReplace) + outstandingDebts + futureCosts;
    const insuranceNeeded = Math.max(0, totalNeeds - existingAssets);
    
    return {
      totalNeeds,
      existingAssets,
      insuranceNeeded,
      currentCoverage: insuranceCoverage.life.current,
      gap: Math.max(0, insuranceNeeded - insuranceCoverage.life.current)
    };
  };

  const lifeInsuranceCalc = calculateLifeInsuranceNeeds();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30';
      case 'in_progress':
        return 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/30';
      case 'review_needed':
        return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/30';
      default:
        return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900/30';
    }
  };

  return (
    <div className="space-y-6">
      {/* Section Navigation */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
        <div className="flex space-x-4 overflow-x-auto">
          {['overview', 'insurance', 'estate', 'legacy'].map((section) => (
            <button
              key={section}
              onClick={() => setActiveSection(section)}
              className={`px-4 py-2 rounded-lg font-medium capitalize whitespace-nowrap transition-colors ${
                activeSection === section
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {section === 'overview' ? 'Overview' : section === 'estate' ? 'Estate Planning' : section}
            </button>
          ))}
        </div>
      </div>

      {/* Overview Section */}
      {activeSection === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Insurance Summary */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <Shield className="w-5 h-5 mr-2 text-blue-600" />
              Insurance Coverage Summary
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Life Insurance</span>
                <div className="text-right">
                  <p className="font-semibold text-gray-900 dark:text-white">{formatCurrency(insuranceCoverage.life.current)}</p>
                  {insuranceCoverage.life.gap > 0 && (
                    <p className="text-sm text-red-600 dark:text-red-400">Gap: {formatCurrency(insuranceCoverage.life.gap)}</p>
                  )}
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Disability Insurance</span>
                <div className="text-right">
                  <p className="font-semibold text-gray-900 dark:text-white">${insuranceCoverage.disability.current}/month</p>
                  {insuranceCoverage.disability.gap > 0 && (
                    <p className="text-sm text-red-600 dark:text-red-400">Gap: ${insuranceCoverage.disability.gap}/mo</p>
                  )}
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Umbrella Policy</span>
                <div className="text-right">
                  <p className="font-semibold text-gray-900 dark:text-white">{formatCurrency(insuranceCoverage.umbrella.current)}</p>
                  {insuranceCoverage.umbrella.gap > 0 && (
                    <p className="text-sm text-yellow-600 dark:text-yellow-400">Consider: {formatCurrency(insuranceCoverage.umbrella.gap)}</p>
                  )}
                </div>
              </div>
              <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Total Monthly Premiums</span>
                  <p className="font-bold text-gray-900 dark:text-white">
                    ${insuranceCoverage.life.premium + insuranceCoverage.disability.premium + insuranceCoverage.health.premium + insuranceCoverage.umbrella.premium}/mo
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Estate Planning Status */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <FileText className="w-5 h-5 mr-2 text-purple-600" />
              Estate Planning Status
            </h3>
            <div className="space-y-3">
              {estatePlanning.documents.map((doc) => (
                <div key={doc.name} className="flex items-center justify-between">
                  <span className="text-gray-700 dark:text-gray-300">{doc.name}</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(doc.status)}`}>
                    {doc.status.replace(/_/g, ' ')}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Estimated Estate Tax</span>
                <p className="font-semibold text-gray-900 dark:text-white">{formatCurrency(estatePlanning.estateTax.total)}</p>
              </div>
            </div>
          </div>

          {/* Legacy Goals Progress */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 lg:col-span-2">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <Heart className="w-5 h-5 mr-2 text-red-600" />
              Legacy Goals Progress
            </h3>
            <div className="space-y-4">
              {legacyGoals.map((goal) => (
                <div key={goal.id}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-700 dark:text-gray-300">{goal.goal}</span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {formatCurrency(goal.current)} / {formatCurrency(goal.target)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                      style={{ width: `${goal.progress}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Insurance Analysis Section */}
      {activeSection === 'insurance' && (
        <div className="space-y-6">
          {/* Life Insurance Calculator */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <Calculator className="w-5 h-5 mr-2 text-blue-600" />
              Life Insurance Needs Analysis
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Income Replacement (10 years)</p>
                  <p className="text-xl font-semibold text-gray-900 dark:text-white">{formatCurrency(120000 * 10)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Outstanding Debts</p>
                  <p className="text-xl font-semibold text-gray-900 dark:text-white">{formatCurrency(250000)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Future Expenses</p>
                  <p className="text-xl font-semibold text-gray-900 dark:text-white">{formatCurrency(300000)}</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Insurance Needed</p>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{formatCurrency(lifeInsuranceCalc.insuranceNeeded)}</p>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Current Coverage</p>
                  <p className="text-xl font-semibold text-gray-900 dark:text-white">{formatCurrency(lifeInsuranceCalc.currentCoverage)}</p>
                </div>
                {lifeInsuranceCalc.gap > 0 && (
                  <div className="p-4 bg-red-50 dark:bg-red-900/30 rounded-lg">
                    <p className="text-sm text-red-600 dark:text-red-400 mb-1">Coverage Gap</p>
                    <p className="text-xl font-bold text-red-600 dark:text-red-400">{formatCurrency(lifeInsuranceCalc.gap)}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Insurance Recommendations */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <AlertCircle className="w-5 h-5 mr-2 text-yellow-600" />
              Insurance Recommendations
            </h3>
            <div className="space-y-4">
              <div className="p-4 border-l-4 border-red-500 bg-red-50 dark:bg-red-900/20">
                <h4 className="font-semibold text-red-800 dark:text-red-200 mb-2">Life Insurance Gap</h4>
                <p className="text-sm text-red-700 dark:text-red-300">
                  You need an additional {formatCurrency(insuranceCoverage.life.gap)} in life insurance coverage.
                  Consider a 20-year term policy to protect your family.
                </p>
              </div>
              <div className="p-4 border-l-4 border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20">
                <h4 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">Disability Insurance</h4>
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  Your disability coverage should be increased by ${insuranceCoverage.disability.gap}/month
                  to replace 60-70% of your income.
                </p>
              </div>
              <div className="p-4 border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-900/20">
                <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">Umbrella Policy</h4>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Consider increasing your umbrella policy to {formatCurrency(insuranceCoverage.umbrella.recommended)}
                  to better protect your growing assets.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Estate Planning Section */}
      {activeSection === 'estate' && (
        <div className="space-y-6">
          {/* Document Checklist */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <FileText className="w-5 h-5 mr-2 text-purple-600" />
              Estate Planning Documents
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {estatePlanning.documents.map((doc) => (
                <div key={doc.name} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white">{doc.name}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Last updated: {new Date(doc.lastUpdated).toLocaleDateString()}
                      </p>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(doc.status)}`}>
                      {doc.status === 'completed' && <CheckCircle className="w-4 h-4" />}
                      {doc.status === 'in_progress' && '⏳'}
                      {doc.status === 'review_needed' && <AlertCircle className="w-4 h-4" />}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Beneficiary Designations */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <Users className="w-5 h-5 mr-2 text-green-600" />
              Beneficiary Designations
            </h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Primary Beneficiaries</h4>
                <div className="space-y-2">
                  {estatePlanning.beneficiaries.filter(b => b.type === 'Primary').map((beneficiary, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <span className="text-gray-700 dark:text-gray-300">{beneficiary.name}</span>
                      <span className="font-semibold text-gray-900 dark:text-white">{beneficiary.percentage}%</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Contingent Beneficiaries</h4>
                <div className="space-y-2">
                  {estatePlanning.beneficiaries.filter(b => b.type === 'Contingent').map((beneficiary, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <span className="text-gray-700 dark:text-gray-300">{beneficiary.name}</span>
                      <span className="font-semibold text-gray-900 dark:text-white">{beneficiary.percentage}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Estate Tax Calculator */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-indigo-600" />
              Estate Tax Estimate
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Net Worth</p>
                <p className="text-xl font-semibold text-gray-900 dark:text-white">{formatCurrency(estatePlanning.netWorth)}</p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Federal Estate Tax</p>
                <p className="text-xl font-semibold text-gray-900 dark:text-white">{formatCurrency(estatePlanning.estateTax.federal)}</p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">State Estate Tax</p>
                <p className="text-xl font-semibold text-gray-900 dark:text-white">{formatCurrency(estatePlanning.estateTax.state)}</p>
              </div>
            </div>
            <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Based on current estate tax laws and exemptions. Consider strategies like trusts, gifting, and charitable
                donations to minimize estate taxes.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Legacy Goals Section */}
      {activeSection === 'legacy' && (
        <div className="space-y-6">
          {/* Legacy Goals Management */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <Heart className="w-5 h-5 mr-2 text-red-600" />
              Legacy Goals & Charitable Giving
            </h3>
            <div className="space-y-6">
              {legacyGoals.map((goal) => (
                <div key={goal.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div className="flex justify-between items-start mb-3">
                    <h4 className="font-semibold text-gray-900 dark:text-white">{goal.goal}</h4>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      goal.progress >= 75 ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                      goal.progress >= 50 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                      'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                    }`}>
                      {goal.progress.toFixed(1)}% Complete
                    </span>
                  </div>
                  <div className="mb-3">
                    <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
                      <span>Progress</span>
                      <span>{formatCurrency(goal.current)} / {formatCurrency(goal.target)}</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                      <div
                        className="bg-gradient-to-r from-red-500 to-pink-500 h-3 rounded-full"
                        style={{ width: `${goal.progress}%` }}
                      />
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Need {formatCurrency(goal.target - goal.current)} more
                    </p>
                    <button className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
                      Update Goal
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <button className="mt-4 w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Add New Legacy Goal
            </button>
          </div>

          {/* Charitable Giving Strategies */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <Heart className="w-5 h-5 mr-2 text-purple-600" />
              Charitable Giving Strategies
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <h4 className="font-semibold text-purple-800 dark:text-purple-200 mb-2">Donor-Advised Fund</h4>
                <p className="text-sm text-purple-700 dark:text-purple-300 mb-3">
                  Contribute assets now, receive immediate tax deduction, and recommend grants over time.
                </p>
                <p className="text-lg font-semibold text-purple-900 dark:text-purple-100">
                  Potential Tax Savings: {formatCurrency(15000)}
                </p>
              </div>
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <h4 className="font-semibold text-green-800 dark:text-green-200 mb-2">Charitable Remainder Trust</h4>
                <p className="text-sm text-green-700 dark:text-green-300 mb-3">
                  Receive income for life while supporting your favorite causes.
                </p>
                <p className="text-lg font-semibold text-green-900 dark:text-green-100">
                  Annual Income: {formatCurrency(8000)}
                </p>
              </div>
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">Direct Stock Donation</h4>
                <p className="text-sm text-blue-700 dark:text-blue-300 mb-3">
                  Donate appreciated stocks to avoid capital gains tax.
                </p>
                <p className="text-lg font-semibold text-blue-900 dark:text-blue-100">
                  Tax Benefit: {formatCurrency(5000)}
                </p>
              </div>
              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <h4 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">Qualified Charitable Distribution</h4>
                <p className="text-sm text-yellow-700 dark:text-yellow-300 mb-3">
                  Direct IRA distributions to charity (age 70½+).
                </p>
                <p className="text-lg font-semibold text-yellow-900 dark:text-yellow-100">
                  RMD Satisfied: {formatCurrency(10000)}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}