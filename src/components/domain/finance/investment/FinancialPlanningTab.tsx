'use client';

import { useState } from 'react';
import { Calculator, Target, TrendingUp, DollarSign, Calendar, AlertCircle, CheckCircle } from 'lucide-react';
import dynamic from 'next/dynamic';

const Chart = dynamic(() => import('recharts').then(mod => mod.AreaChart), { ssr: false });
const Line = dynamic(() => import('recharts').then(mod => mod.Line), { ssr: false });
const XAxis = dynamic(() => import('recharts').then(mod => mod.XAxis), { ssr: false });
const YAxis = dynamic(() => import('recharts').then(mod => mod.YAxis), { ssr: false });
const CartesianGrid = dynamic(() => import('recharts').then(mod => mod.CartesianGrid), { ssr: false });
const Tooltip = dynamic(() => import('recharts').then(mod => mod.Tooltip), { ssr: false });
const Area = dynamic(() => import('recharts').then(mod => mod.Area), { ssr: false });
const ResponsiveContainer = dynamic(() => import('recharts').then(mod => mod.ResponsiveContainer), { ssr: false });

interface FinancialPlanningTabProps {
  portfolio: any;
}

export default function FinancialPlanningTab({ portfolio }: FinancialPlanningTabProps) {
  const [activeScenario, setActiveScenario] = useState('moderate');
  const [planningHorizon, setPlanningHorizon] = useState(30);

  // Financial planning scenarios
  const scenarios = {
    conservative: {
      name: 'Conservative',
      returnRate: 5.5,
      inflationRate: 2.5,
      monthlyContribution: 2000,
      color: '#10B981'
    },
    moderate: {
      name: 'Moderate',
      returnRate: 7.5,
      inflationRate: 2.5,
      monthlyContribution: 2500,
      color: '#3B82F6'
    },
    aggressive: {
      name: 'Aggressive',
      returnRate: 9.5,
      inflationRate: 2.5,
      monthlyContribution: 3000,
      color: '#EF4444'
    }
  };

  // Generate projection data
  const generateProjectionData = (scenario: any) => {
    const data = [];
    let currentValue = portfolio?.totalValue || 385000;
    const monthlyReturn = scenario.returnRate / 100 / 12;
    
    for (let year = 0; year <= planningHorizon; year++) {
      const age = 35 + year; // Assuming current age is 35
      data.push({
        year,
        age,
        value: Math.round(currentValue),
        contribution: year * 12 * scenario.monthlyContribution
      });
      
      // Calculate next year's value
      for (let month = 0; month < 12; month++) {
        currentValue = currentValue * (1 + monthlyReturn) + scenario.monthlyContribution;
      }
    }
    
    return data;
  };

  const projectionData = generateProjectionData(scenarios[activeScenario as keyof typeof scenarios]);

  // Financial milestones
  const milestones = [
    {
      id: 1,
      name: 'Emergency Fund',
      target: 50000,
      current: 15420,
      deadline: '2025',
      status: 'in_progress',
      priority: 'High'
    },
    {
      id: 2,
      name: 'House Down Payment',
      target: 100000,
      current: 35000,
      deadline: '2027',
      status: 'on_track',
      priority: 'Medium'
    },
    {
      id: 3,
      name: 'Children\'s Education',
      target: 200000,
      current: 45000,
      deadline: '2035',
      status: 'on_track',
      priority: 'High'
    },
    {
      id: 4,
      name: 'Retirement',
      target: 2000000,
      current: portfolio?.totalValue || 385000,
      deadline: '2055',
      status: 'on_track',
      priority: 'High'
    }
  ];

  // Cash flow analysis
  const cashFlow = {
    monthlyIncome: 12000,
    monthlyExpenses: 7500,
    monthlySavings: 4500,
    savingsRate: 37.5,
    breakdown: {
      housing: 2500,
      transportation: 800,
      food: 1200,
      utilities: 400,
      insurance: 600,
      entertainment: 500,
      other: 1500
    }
  };

  // Tax optimization strategies
  const taxStrategies = [
    {
      strategy: '401(k) Maximization',
      currentContribution: 15000,
      maxContribution: 23000,
      taxSavings: 2400,
      implemented: true
    },
    {
      strategy: 'Backdoor Roth IRA',
      currentContribution: 0,
      maxContribution: 7000,
      taxSavings: 1890,
      implemented: false
    },
    {
      strategy: 'HSA Triple Tax Advantage',
      currentContribution: 3000,
      maxContribution: 4150,
      taxSavings: 310,
      implemented: true
    },
    {
      strategy: 'Tax Loss Harvesting',
      currentContribution: 0,
      maxContribution: 0,
      taxSavings: 1200,
      implemented: false
    }
  ];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatPercent = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'on_track':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'at_risk':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  return (
    <div className="space-y-6">
      {/* Financial Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-6 border border-blue-100 dark:border-blue-800">
          <div className="flex items-center justify-between mb-2">
            <DollarSign className="w-8 h-8 text-blue-600" />
            <span className="text-sm text-blue-600 dark:text-blue-400">+12.5%</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(portfolio?.totalValue || 385000)}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Net Worth</p>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg p-6 border border-green-100 dark:border-green-800">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-8 h-8 text-green-600" />
            <span className="text-sm text-green-600 dark:text-green-400">{formatPercent(cashFlow.savingsRate)}</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(cashFlow.monthlySavings)}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Monthly Savings</p>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg p-6 border border-purple-100 dark:border-purple-800">
          <div className="flex items-center justify-between mb-2">
            <Target className="w-8 h-8 text-purple-600" />
            <span className="text-sm text-purple-600 dark:text-purple-400">4 Goals</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(2350000)}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Total Goals</p>
        </div>
        <div className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-lg p-6 border border-yellow-100 dark:border-yellow-800">
          <div className="flex items-center justify-between mb-2">
            <Calendar className="w-8 h-8 text-yellow-600" />
            <span className="text-sm text-yellow-600 dark:text-yellow-400">30 Years</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(projectionData[projectionData.length - 1].value)}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Projected Value</p>
        </div>
      </div>

      {/* Scenario Planning */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Wealth Projection Scenarios</h3>
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600 dark:text-gray-400">Horizon:</label>
            <select
              value={planningHorizon}
              onChange={(e) => setPlanningHorizon(Number(e.target.value))}
              className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
            >
              <option value={10}>10 Years</option>
              <option value={20}>20 Years</option>
              <option value={30}>30 Years</option>
              <option value={40}>40 Years</option>
            </select>
          </div>
        </div>
        
        {/* Scenario Buttons */}
        <div className="flex gap-2 mb-4">
          {Object.entries(scenarios).map(([key, scenario]) => (
            <button
              key={key}
              onClick={() => setActiveScenario(key)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeScenario === key
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {scenario.name}
            </button>
          ))}
        </div>

        {/* Projection Chart */}
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <Chart data={projectionData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="age" label={{ value: 'Age', position: 'insideBottom', offset: -5 }} />
              <YAxis tickFormatter={(value) => `$${(value / 1000000).toFixed(1)}M`} />
              <Tooltip 
                formatter={(value: number) => formatCurrency(value)}
                labelFormatter={(label) => `Age: ${label}`}
              />
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke={scenarios[activeScenario as keyof typeof scenarios].color}
                fill={scenarios[activeScenario as keyof typeof scenarios].color}
                fillOpacity={0.6}
                name="Portfolio Value"
              />
            </Chart>
          </ResponsiveContainer>
        </div>

        {/* Scenario Details */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400">Expected Return</p>
            <p className="font-semibold text-gray-900 dark:text-white">
              {formatPercent(scenarios[activeScenario as keyof typeof scenarios].returnRate)}
            </p>
          </div>
          <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400">Monthly Contribution</p>
            <p className="font-semibold text-gray-900 dark:text-white">
              {formatCurrency(scenarios[activeScenario as keyof typeof scenarios].monthlyContribution)}
            </p>
          </div>
          <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400">Final Value</p>
            <p className="font-semibold text-gray-900 dark:text-white">
              {formatCurrency(projectionData[projectionData.length - 1].value)}
            </p>
          </div>
        </div>
      </div>

      {/* Financial Milestones */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Financial Milestones</h3>
          <div className="space-y-4">
            {milestones.map((milestone) => (
              <div key={milestone.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">{milestone.name}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Target: {milestone.deadline}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(milestone.status)}`}>
                    {milestone.status.replace(/_/g, ' ')}
                  </span>
                </div>
                <div className="mb-2">
                  <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
                    <span>Progress</span>
                    <span>{formatCurrency(milestone.current)} / {formatCurrency(milestone.target)}</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                      style={{ width: `${(milestone.current / milestone.target) * 100}%` }}
                    />
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className={`text-xs px-2 py-1 rounded ${
                    milestone.priority === 'High' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                    'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                  }`}>
                    {milestone.priority} Priority
                  </span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {((milestone.current / milestone.target) * 100).toFixed(1)}% Complete
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Cash Flow Analysis */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Monthly Cash Flow</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <span className="font-medium text-green-800 dark:text-green-200">Income</span>
              <span className="font-bold text-green-800 dark:text-green-200">{formatCurrency(cashFlow.monthlyIncome)}</span>
            </div>
            <div className="space-y-2">
              {Object.entries(cashFlow.breakdown).map(([category, amount]) => (
                <div key={category} className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400 capitalize">{category}</span>
                  <span className="text-gray-900 dark:text-white">{formatCurrency(amount)}</span>
                </div>
              ))}
            </div>
            <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <span className="font-medium text-red-800 dark:text-red-200">Total Expenses</span>
                <span className="font-bold text-red-800 dark:text-red-200">{formatCurrency(cashFlow.monthlyExpenses)}</span>
              </div>
            </div>
            <div className="flex justify-between items-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <span className="font-medium text-blue-800 dark:text-blue-200">Net Savings</span>
              <span className="font-bold text-blue-800 dark:text-blue-200">{formatCurrency(cashFlow.monthlySavings)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tax Optimization */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <Calculator className="w-5 h-5 mr-2 text-green-600" />
          Tax Optimization Strategies
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {taxStrategies.map((strategy, index) => (
            <div key={index} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
              <div className="flex justify-between items-start mb-3">
                <h4 className="font-semibold text-gray-900 dark:text-white">{strategy.strategy}</h4>
                {strategy.implemented ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-yellow-600" />
                )}
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Current</span>
                  <span className="text-gray-900 dark:text-white">{formatCurrency(strategy.currentContribution)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Maximum</span>
                  <span className="text-gray-900 dark:text-white">{formatCurrency(strategy.maxContribution)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Tax Savings</span>
                  <span className="font-semibold text-green-600 dark:text-green-400">{formatCurrency(strategy.taxSavings)}</span>
                </div>
              </div>
              {!strategy.implemented && (
                <button className="mt-3 w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
                  Implement Strategy
                </button>
              )}
            </div>
          ))}
        </div>
        <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="font-medium text-green-800 dark:text-green-200">Total Potential Tax Savings</span>
            <span className="font-bold text-green-800 dark:text-green-200">
              {formatCurrency(taxStrategies.reduce((sum, s) => sum + s.taxSavings, 0))}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}