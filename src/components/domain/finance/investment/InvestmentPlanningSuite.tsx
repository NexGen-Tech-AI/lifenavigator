'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, ComposedChart, Scatter, ScatterChart } from 'recharts';
import { TrendingUp, Download, Target, BarChart3, Settings, AlertCircle, CheckCircle, ArrowUp, ArrowDown, DollarSign, Briefcase, FileText, Calendar, Zap, Filter, RefreshCw, Circle, X } from 'lucide-react';
import { useInvestmentPortfolio, useInvestmentHoldings, useAssetAllocation, useSectorAllocation } from '@/hooks/useInvestments';

// Advanced Analytics Components
const CorrelationMatrix = ({ correlations }: { correlations: number[][] }) => (
  <div className="grid grid-cols-4 gap-1 text-xs">
    {correlations.map((row, i) => 
      row.map((corr, j) => (
        <div 
          key={`${i}-${j}`}
          className={`p-2 text-center rounded ${
            corr > 0.7 ? 'bg-red-100 text-red-800' : 
            corr > 0.3 ? 'bg-yellow-100 text-yellow-800' : 
            'bg-green-100 text-green-800'
          }`}
        >
          {corr.toFixed(2)}
        </div>
      ))
    )}
  </div>
);

const MonteCarloChart = ({ portfolioAnalytics }: { portfolioAnalytics: any }) => {
  const simulationData = [
    { percentile: '10th', value: 350000 },
    { percentile: '25th', value: 420000 },
    { percentile: '50th', value: 487250 },
    { percentile: '75th', value: 560000 },
    { percentile: '90th', value: 650000 }
  ];

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={simulationData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="percentile" />
        <YAxis tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`} />
        <Tooltip formatter={(value) => [`$${Number(value).toLocaleString()}`, 'Portfolio Value']} />
        <Bar dataKey="value" fill="#3B82F6" />
      </BarChart>
    </ResponsiveContainer>
  );
};

const RebalancingCard = ({ portfolioAnalytics }: { portfolioAnalytics: any }) => (
  <ChartCard title="Rebalancing Needed" className="h-80">
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <span>Stocks</span>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-red-600">-5%</span>
          <div className="w-16 h-2 bg-gray-200 rounded">
            <div className="w-12 h-2 bg-red-500 rounded"></div>
          </div>
        </div>
      </div>
      <div className="flex justify-between items-center">
        <span>Bonds</span>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-green-600">+3%</span>
          <div className="w-16 h-2 bg-gray-200 rounded">
            <div className="w-8 h-2 bg-green-500 rounded"></div>
          </div>
        </div>
      </div>
      <div className="flex justify-between items-center">
        <span>REITs</span>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-green-600">+2%</span>
          <div className="w-16 h-2 bg-gray-200 rounded">
            <div className="w-6 h-2 bg-green-500 rounded"></div>
          </div>
        </div>
      </div>
      <button className="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
        Execute Rebalancing
      </button>
    </div>
  </ChartCard>
);

const AdvancedAnalyticsSection = ({ portfolioAnalytics }: { portfolioAnalytics: any }) => (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
    <ChartCard title="Efficient Frontier" className="h-96">
      <div className="text-center text-gray-500 mt-20">
        <BarChart3 className="w-12 h-12 mx-auto mb-4" />
        <p>Efficient frontier analysis would be displayed here</p>
      </div>
    </ChartCard>
    
    <ChartCard title="Factor Analysis" className="h-96">
      <div className="space-y-4">
        {['Market Beta', 'Size Factor', 'Value Factor', 'Momentum', 'Quality'].map((factor, index) => (
          <div key={factor} className="flex justify-between items-center">
            <span className="text-sm">{factor}</span>
            <div className="flex items-center space-x-2">
              <div className="w-24 h-2 bg-gray-200 rounded">
                <div 
                  className="h-2 bg-blue-600 rounded" 
                  style={{ width: `${Math.random() * 100}%` }}
                ></div>
              </div>
              <span className="text-xs text-gray-600">{(Math.random() * 2 - 1).toFixed(2)}</span>
            </div>
          </div>
        ))}
      </div>
    </ChartCard>
  </div>
);

const PlanningStepContent = ({ step, portfolioData, goalsData, riskProfile }: any) => {
  const stepContent: Record<number, { title: string; content: React.ReactNode }> = {
    1: {
      title: "Current Financial Situation",
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-semibold mb-2">Assets</h4>
            <p className="text-2xl font-bold">${portfolioData.totalValue.toLocaleString()}</p>
            <p className="text-sm text-gray-600">Total investment portfolio</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="font-semibold mb-2">Monthly Savings</h4>
            <p className="text-2xl font-bold">${goalsData.reduce((sum: number, goal: any) => sum + goal.monthlyContribution, 0).toLocaleString()}</p>
            <p className="text-sm text-gray-600">Current total contributions</p>
          </div>
        </div>
      )
    },
    2: {
      title: "Goal Analysis",
      content: (
        <div className="space-y-4">
          {goalsData.map((goal: any) => (
            <div key={goal.id} className="p-4 border rounded-lg">
              <div className="flex justify-between items-center">
                <h4 className="font-semibold">{goal.name}</h4>
                <span className={`px-2 py-1 rounded text-xs ${
                  goal.priority === 'High' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {goal.priority}
                </span>
              </div>
              <div className="mt-2">
                <div className="flex justify-between text-sm">
                  <span>Progress: {goal.progress}%</span>
                  <span>${goal.currentAmount.toLocaleString()} / ${goal.targetAmount.toLocaleString()}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${goal.progress}%` }}></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )
    },
    3: {
      title: "Risk Assessment",
      content: (
        <div className="space-y-6">
          <div className="bg-purple-50 p-4 rounded-lg">
            <h4 className="font-semibold mb-2">Risk Profile</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Risk Tolerance</p>
                <p className="text-xl font-bold">{riskProfile.riskTolerance}/10</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Time Horizon</p>
                <p className="text-xl font-bold">{riskProfile.timeHorizon} years</p>
              </div>
            </div>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg">
            <h4 className="font-semibold mb-2">Recommended Allocation</h4>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{riskProfile.recommendedAllocation.stocks}%</p>
                <p className="text-sm">Stocks</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{riskProfile.recommendedAllocation.bonds}%</p>
                <p className="text-sm">Bonds</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600">{riskProfile.recommendedAllocation.alternatives}%</p>
                <p className="text-sm">Alternatives</p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    4: {
      title: "Strategy Development",
      content: (
        <div className="space-y-4">
          <div className="p-4 border-l-4 border-blue-500 bg-blue-50">
            <h4 className="font-semibold">Investment Strategy</h4>
            <p className="text-sm text-gray-600 mt-1">
              Based on your risk profile and goals, we recommend a diversified growth strategy with periodic rebalancing.
            </p>
          </div>
          <div className="p-4 border-l-4 border-green-500 bg-green-50">
            <h4 className="font-semibold">Tax Optimization</h4>
            <p className="text-sm text-gray-600 mt-1">
              Maximize tax-advantaged accounts and implement tax-loss harvesting strategies.
            </p>
          </div>
          <div className="p-4 border-l-4 border-purple-500 bg-purple-50">
            <h4 className="font-semibold">Savings Plan</h4>
            <p className="text-sm text-gray-600 mt-1">
              Increase monthly contributions by 3% annually to stay on track for retirement goals.
            </p>
          </div>
        </div>
      )
    },
    5: {
      title: "Plan Review",
      content: (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-lg">
            <h4 className="font-semibold text-lg mb-4">Your Financial Plan Summary</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Goal Attainment Probability</p>
                <p className="text-3xl font-bold text-green-600">78%</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Projected Retirement Income</p>
                <p className="text-3xl font-bold text-blue-600">$8,500</p>
                <p className="text-xs text-gray-500">per month</p>
              </div>
            </div>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <h4 className="font-semibold flex items-center">
              <AlertCircle className="w-5 h-5 mr-2 text-yellow-600" />
              Key Recommendations
            </h4>
            <ul className="mt-2 space-y-1 text-sm">
              <li>• Increase international equity allocation by 5%</li>
              <li>• Maximize Roth IRA contributions</li>
              <li>• Review and rebalance quarterly</li>
            </ul>
          </div>
        </div>
      )
    }
  };

  const { title, content } = stepContent[step] || { title: '', content: null };
  
  return (
    <div>
      <h3 className="text-xl font-semibold mb-4">{title}</h3>
      {content}
    </div>
  );
};

const FinancialPlanView = ({ plan }: { plan: any }) => (
  <div className="space-y-6">
    <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-6 rounded-xl">
      <h2 className="text-2xl font-bold mb-4">Your Comprehensive Financial Plan</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <p className="text-blue-200">Current Net Worth</p>
          <p className="text-2xl font-bold">${plan.executiveSummary.currentNetWorth.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-blue-200">Projected Net Worth</p>
          <p className="text-2xl font-bold">${plan.executiveSummary.projectedNetWorth.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-blue-200">Success Probability</p>
          <p className="text-2xl font-bold">{plan.executiveSummary.goalAttainmentProbability}%</p>
        </div>
      </div>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <ChartCard title="Key Recommendations">
        <div className="space-y-4">
          {plan.recommendations.map((rec: any, index: number) => (
            <div key={index} className="p-4 border rounded-lg">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-semibold">{rec.category}</h4>
                <span className={`px-2 py-1 rounded text-xs ${
                  rec.priority === 'High' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {rec.priority}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-2">{rec.action}</p>
              <p className="text-xs text-green-600">{rec.impact}</p>
            </div>
          ))}
        </div>
      </ChartCard>

      <ChartCard title="Scenario Analysis">
        <div className="space-y-3">
          {plan.scenarios.map((scenario: any, index: number) => (
            <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded">
              <div>
                <p className="font-medium">{scenario.name}</p>
                <p className="text-sm text-gray-600">{scenario.outcome}</p>
              </div>
              <div className="text-right">
                <p className="font-bold">{scenario.probability}%</p>
                <p className="text-xs text-gray-500">probability</p>
              </div>
            </div>
          ))}
        </div>
      </ChartCard>
    </div>

    <div className="flex justify-center">
      <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2">
        <Download className="w-5 h-5" />
        <span>Download Complete Plan</span>
      </button>
    </div>
  </div>
);

const GoalCard = ({ goal, portfolioData, riskProfile }: { goal: any; portfolioData: any; riskProfile: any }) => {
  const monthsToTarget = Math.ceil((new Date(goal.targetDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24 * 30));
  const onTrack = goal.progress >= (100 - (monthsToTarget / 120) * 100);

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold">{goal.name}</h3>
          <p className="text-sm text-gray-600">Target: {new Date(goal.targetDate).toLocaleDateString()}</p>
        </div>
        <div className="text-right">
          <div className={`inline-flex items-center px-2 py-1 rounded text-xs ${
            onTrack ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {onTrack ? <CheckCircle className="w-3 h-3 mr-1" /> : <AlertCircle className="w-3 h-3 mr-1" />}
            {onTrack ? 'On Track' : 'Behind'}
          </div>
        </div>
      </div>
      
      <div className="mb-4">
        <div className="flex justify-between text-sm mb-1">
          <span>Progress: {goal.progress}%</span>
          <span>${goal.currentAmount.toLocaleString()} / ${goal.targetAmount.toLocaleString()}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div 
            className={`h-3 rounded-full ${onTrack ? 'bg-green-500' : 'bg-red-500'}`}
            style={{ width: `${Math.min(goal.progress, 100)}%` }}
          ></div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 text-center">
        <div>
          <p className="text-lg font-bold">${goal.monthlyContribution.toLocaleString()}</p>
          <p className="text-xs text-gray-500">Monthly</p>
        </div>
        <div>
          <p className="text-lg font-bold">{monthsToTarget}</p>
          <p className="text-xs text-gray-500">Months left</p>
        </div>
        <div>
          <p className="text-lg font-bold">${(goal.targetAmount - goal.currentAmount).toLocaleString()}</p>
          <p className="text-xs text-gray-500">Remaining</p>
        </div>
      </div>
    </div>
  );
};

const GoalsAnalytics = ({ goalsData, portfolioData }: { goalsData: any[]; portfolioData: any }) => (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
    <ChartCard title="Goal Progress Overview">
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={goalsData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip formatter={(value) => `${value}%`} />
          <Bar dataKey="progress" fill="#3B82F6" />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>

    <ChartCard title="Monthly Contributions by Goal">
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={goalsData}
            cx="50%"
            cy="50%"
            outerRadius={80}
            fill="#8884d8"
            dataKey="monthlyContribution"
            label={({ name, value }) => `${name}: $${value}`}
          >
            {goalsData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => `$${Number(value).toLocaleString()}`} />
        </PieChart>
      </ResponsiveContainer>
    </ChartCard>
  </div>
);

const ReportCard = ({ title, description, type, lastGenerated, onDownload }: {
  title: string;
  description: string;
  type: string;
  lastGenerated: string;
  onDownload: () => void;
}) => (
  <div className="bg-white rounded-xl p-6 shadow-sm border">
    <div className="flex items-start justify-between mb-4">
      <div>
        <h3 className="font-semibold text-lg">{title}</h3>
        <p className="text-sm text-gray-600 mt-1">{description}</p>
      </div>
      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">{type}</span>
    </div>
    
    <div className="flex items-center justify-between">
      <p className="text-xs text-gray-500">Updated {lastGenerated}</p>
      <button 
        onClick={onDownload}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm flex items-center space-x-2"
      >
        <Download className="w-4 h-4" />
        <span>Download</span>
      </button>
    </div>
  </div>
);

const ExecutiveSummary = ({ portfolioData, goalsData, portfolioAnalytics, financialPlan }: {
  portfolioData: any;
  goalsData: any[];
  portfolioAnalytics: any;
  financialPlan: any;
}) => (
  <ChartCard title="Executive Summary">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
          <DollarSign className="w-8 h-8 text-blue-600" />
        </div>
        <h4 className="font-semibold">Portfolio Health</h4>
        <p className="text-2xl font-bold text-green-600">Excellent</p>
        <p className="text-sm text-gray-600">Strong diversification and performance</p>
      </div>
      
      <div className="text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
          <Target className="w-8 h-8 text-green-600" />
        </div>
        <h4 className="font-semibold">Goal Attainment</h4>
        <p className="text-2xl font-bold text-blue-600">78%</p>
        <p className="text-sm text-gray-600">Probability of meeting retirement goal</p>
      </div>
      
      <div className="text-center">
        <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
          <BarChart3 className="w-8 h-8 text-purple-600" />
        </div>
        <h4 className="font-semibold">Risk Level</h4>
        <p className="text-2xl font-bold text-orange-600">Moderate</p>
        <p className="text-sm text-gray-600">Aligned with risk tolerance</p>
      </div>
      
      <div className="text-center">
        <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
          <TrendingUp className="w-8 h-8 text-orange-600" />
        </div>
        <h4 className="font-semibold">Next Review</h4>
        <p className="text-2xl font-bold text-purple-600">3 months</p>
        <p className="text-sm text-gray-600">Recommended rebalancing timeline</p>
      </div>
    </div>
    
    <div className="mt-8 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
      <h4 className="font-semibold mb-2">Key Insights</h4>
      <ul className="space-y-1 text-sm">
        <li>• Your portfolio is well-diversified with a Sharpe ratio of {portfolioAnalytics.sharpeRatio}</li>
        <li>• Consider increasing international allocation by 5% to improve diversification</li>
        <li>• You&apos;re on track to meet {goalsData.filter((g: any) => g.progress >= 30).length} out of {goalsData.length} major financial goals</li>
        <li>• Tax-loss harvesting opportunities could save approximately $2,400 annually</li>
        <li>• Emergency fund is {portfolioData.totalCash >= 50000 ? 'adequate' : 'below recommended 6-month target'}</li>
      </ul>
    </div>
  </ChartCard>
);

const InvestmentPlanningSuite = () => {
  const [activeTab, setActiveTab] = useState('portfolio');
  const [timeRange, setTimeRange] = useState('1Y');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [planningStep, setPlanningStep] = useState(1);
  const [generatingPlan, setGeneratingPlan] = useState(false);

  // Use real data from hooks
  const { portfolio: portfolioApiData, isLoading: portfolioLoading } = useInvestmentPortfolio();
  const { holdings: holdingsApiData, isLoading: holdingsLoading } = useInvestmentHoldings();
  const { allocation: assetAllocationData, isLoading: assetLoading } = useAssetAllocation();
  const { allocation: sectorAllocationData, isLoading: sectorLoading } = useSectorAllocation();

  // Transform API data to match component structure
  const portfolioData = useMemo(() => {
    if (!portfolioApiData) return getDefaultPortfolioData();
    
    return {
      totalValue: portfolioApiData.totalValue,
      totalCash: 15420, // This would come from a separate API
      dayChange: 2450,
      dayChangePercent: 0.51,
      accounts: [
        {
          id: '1',
          name: 'Fidelity 401(k)',
          type: 'retirement',
          balance: portfolioApiData.totalValue * 0.38,
          change: 950,
          changePercent: 0.52,
          provider: 'Fidelity'
        },
        {
          id: '2',
          name: 'Charles Schwab Brokerage',
          type: 'investment',
          balance: portfolioApiData.totalValue * 0.50,
          change: 1200,
          changePercent: 0.49,
          provider: 'Charles Schwab'
        },
        {
          id: '3',
          name: 'Vanguard Roth IRA',
          type: 'retirement',
          balance: portfolioApiData.totalValue * 0.12,
          change: 300,
          changePercent: 0.53,
          provider: 'Vanguard'
        }
      ],
      holdings: holdingsApiData || []
    };
  }, [portfolioApiData, holdingsApiData]);

  const [goalsData, setGoalsData] = useState([
    {
      id: 1,
      name: 'Retirement',
      targetAmount: 2000000,
      currentAmount: 487250,
      targetDate: '2055-01-01',
      priority: 'High',
      progress: 24.4,
      monthlyContribution: 2500
    },
    {
      id: 2,
      name: 'House Down Payment',
      targetAmount: 100000,
      currentAmount: 35000,
      targetDate: '2027-06-01',
      priority: 'Medium',
      progress: 35.0,
      monthlyContribution: 1500
    },
    {
      id: 3,
      name: 'Emergency Fund',
      targetAmount: 50000,
      currentAmount: 15420,
      targetDate: '2025-12-01',
      priority: 'High',
      progress: 30.8,
      monthlyContribution: 800
    }
  ]);

  const [riskProfile, setRiskProfile] = useState({
    riskTolerance: 7,
    timeHorizon: 25,
    riskCapacity: 8,
    recommendedAllocation: {
      stocks: 75,
      bonds: 20,
      alternatives: 5
    },
    behavioralBias: 'Moderate Growth',
    volatilityComfort: 15
  });

  const [financialPlan, setFinancialPlan] = useState<any>(null);

  const generateFinancialPlan = async () => {
    setGeneratingPlan(true);
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const plan = createComprehensiveFinancialPlan(portfolioData, goalsData, riskProfile);
    setFinancialPlan(plan);
    setGeneratingPlan(false);
  };

  const portfolioAnalytics = useMemo(() => {
    return calculatePortfolioAnalytics(portfolioData, riskProfile);
  }, [portfolioData, riskProfile]);

  const performanceData = useMemo(() => {
    return generatePerformanceData(timeRange);
  }, [timeRange]);

  if (portfolioLoading || holdingsLoading || assetLoading || sectorLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-full mx-auto bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      <div className="bg-white shadow-sm">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-800 to-slate-900 text-white">
          <div className="max-w-7xl mx-auto px-6 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Briefcase className="w-8 h-8" />
                <div>
                  <h1 className="text-3xl font-bold">Investment & Planning Suite</h1>
                  <p className="text-slate-300">Comprehensive portfolio analysis and financial planning</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <div className="text-2xl font-bold">${portfolioData.totalValue.toLocaleString()}</div>
                  <div className={`flex items-center ${portfolioData.dayChangePercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {portfolioData.dayChangePercent >= 0 ? <ArrowUp className="w-4 h-4 mr-1" /> : <ArrowDown className="w-4 h-4 mr-1" />}
                    ${Math.abs(portfolioData.dayChange).toLocaleString()} ({Math.abs(portfolioData.dayChangePercent)}%)
                  </div>
                </div>
                <button 
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
                >
                  {showAdvanced ? 'Simple' : 'Advanced'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="max-w-7xl mx-auto px-6 py-4 border-b">
          <div className="flex space-x-1">
            {[
              { id: 'portfolio', label: 'Portfolio', icon: <Circle className="w-4 h-4" /> },
              { id: 'analytics', label: 'Analytics', icon: <BarChart3 className="w-4 h-4" /> },
              { id: 'planning', label: 'Financial Planning', icon: <Target className="w-4 h-4" /> },
              { id: 'goals', label: 'Goal Tracking', icon: <CheckCircle className="w-4 h-4" /> },
              { id: 'reports', label: 'Reports', icon: <FileText className="w-4 h-4" /> }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === tab.id 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6">
        {activeTab === 'portfolio' && (
          <PortfolioTab 
            portfolioData={portfolioData}
            performanceData={performanceData}
            timeRange={timeRange}
            setTimeRange={setTimeRange}
            showAdvanced={showAdvanced}
            portfolioAnalytics={portfolioAnalytics}
            assetAllocationData={assetAllocationData}
            sectorAllocationData={sectorAllocationData}
          />
        )}
        
        {activeTab === 'analytics' && (
          <AnalyticsTab 
            portfolioData={portfolioData}
            portfolioAnalytics={portfolioAnalytics}
            riskProfile={riskProfile}
            showAdvanced={showAdvanced}
          />
        )}
        
        {activeTab === 'planning' && (
          <PlanningTab 
            portfolioData={portfolioData}
            goalsData={goalsData}
            riskProfile={riskProfile}
            planningStep={planningStep}
            setPlanningStep={setPlanningStep}
            generateFinancialPlan={generateFinancialPlan}
            generatingPlan={generatingPlan}
            financialPlan={financialPlan}
          />
        )}
        
        {activeTab === 'goals' && (
          <GoalsTab 
            goalsData={goalsData}
            portfolioData={portfolioData}
            riskProfile={riskProfile}
          />
        )}
        
        {activeTab === 'reports' && (
          <ReportsTab 
            portfolioData={portfolioData}
            goalsData={goalsData}
            riskProfile={riskProfile}
            portfolioAnalytics={portfolioAnalytics}
            financialPlan={financialPlan}
          />
        )}
      </div>
    </div>
  );
};

const PortfolioTab = ({ portfolioData, performanceData, timeRange, setTimeRange, showAdvanced, portfolioAnalytics, assetAllocationData, sectorAllocationData }: any) => (
  <div className="space-y-6">
    {/* Portfolio Overview Cards */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <MetricCard
        title="Total Portfolio"
        value={`$${portfolioData.totalValue.toLocaleString()}`}
        change={portfolioData.dayChange}
        changePercent={portfolioData.dayChangePercent}
        icon={<DollarSign className="w-6 h-6" />}
        color="blue"
      />
      <MetricCard
        title="Cash & Equivalents"
        value={`$${portfolioData.totalCash.toLocaleString()}`}
        subtitle="Available to invest"
        icon={<Briefcase className="w-6 h-6" />}
        color="green"
      />
      <MetricCard
        title="Asset Allocation Score"
        value={`${portfolioAnalytics.allocationScore}/100`}
        subtitle={portfolioAnalytics.allocationGrade}
        icon={<Target className="w-6 h-6" />}
        color="purple"
      />
      <MetricCard
        title="Diversification"
        value={`${portfolioAnalytics.diversificationScore}/100`}
        subtitle={portfolioAnalytics.diversificationGrade}
        icon={<Circle className="w-6 h-6" />}
        color="orange"
      />
    </div>

    {/* Performance Chart */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <ChartCard title="Portfolio Performance" className="h-96">
          <div className="flex justify-between items-center mb-4">
            <div className="flex space-x-2">
              {['1M', '3M', '6M', '1Y', '3Y', '5Y', 'ALL'].map((period) => (
                <button
                  key={period}
                  onClick={() => setTimeRange(period)}
                  className={`px-3 py-1 rounded text-sm ${
                    timeRange === period 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {period}
                </button>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis yAxisId="left" tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`} />
              <YAxis yAxisId="right" orientation="right" tickFormatter={(value) => `${value}%`} />
              <Tooltip 
                formatter={(value, name) => [
                  name === 'portfolio' ? `$${Number(value).toLocaleString()}` : `${value}%`,
                  name === 'portfolio' ? 'Portfolio Value' : name === 'sp500' ? 'S&P 500' : 'Benchmark'
                ]} 
              />
              <Area yAxisId="left" type="monotone" dataKey="portfolio" stroke="#3B82F6" fill="#93C5FD" fillOpacity={0.3} />
              <Line yAxisId="right" type="monotone" dataKey="sp500" stroke="#10B981" strokeWidth={2} />
              <Line yAxisId="right" type="monotone" dataKey="benchmark" stroke="#F59E0B" strokeWidth={2} strokeDasharray="5 5" />
            </ComposedChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="space-y-6">
        <AssetAllocationChart 
          assetAllocationData={assetAllocationData}
          targetAllocation={{
            stocks: 75,
            bonds: 20,
            alternatives: 5
          }}
        />
        <TopHoldingsCard holdings={portfolioData.holdings.slice(0, 5)} />
      </div>
    </div>

    {/* Account Details */}
    <AccountsOverview accounts={portfolioData.accounts} />

    {/* Holdings Analysis */}
    <HoldingsAnalysis holdings={portfolioData.holdings} showAdvanced={showAdvanced} />
  </div>
);

const AnalyticsTab = ({ portfolioData, portfolioAnalytics, riskProfile, showAdvanced }: any) => (
  <div className="space-y-6">
    {/* Risk Analytics Cards */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <MetricCard
        title="Sharpe Ratio"
        value={portfolioAnalytics.sharpeRatio}
        subtitle="Risk-adjusted return"
        color="blue"
        showTrend={false}
      />
      <MetricCard
        title="Portfolio Beta"
        value={portfolioAnalytics.beta}
        subtitle="Market sensitivity"
        color="purple"
        showTrend={false}
      />
      <MetricCard
        title="Max Drawdown"
        value={`${portfolioAnalytics.maxDrawdown}%`}
        subtitle="Worst decline"
        color="red"
        showTrend={false}
      />
      <MetricCard
        title="Volatility"
        value={`${portfolioAnalytics.volatility}%`}
        subtitle="Annual standard deviation"
        color="orange"
        showTrend={false}
      />
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Risk Return Scatter */}
      <ChartCard title="Risk vs Return Analysis" className="h-96">
        <ResponsiveContainer width="100%" height={300}>
          <ScatterChart>
            <CartesianGrid />
            <XAxis type="number" dataKey="risk" name="Risk" unit="%" />
            <YAxis type="number" dataKey="return" name="Return" unit="%" />
            <Tooltip cursor={{ strokeDasharray: '3 3' }} />
            <Scatter name="Holdings" data={portfolioAnalytics.riskReturnData} fill="#3B82F6" />
          </ScatterChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Correlation Matrix */}
      <ChartCard title="Asset Correlation Matrix" className="h-96">
        <CorrelationMatrix correlations={portfolioAnalytics.correlationMatrix} />
      </ChartCard>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Sector Analysis */}
      <ChartCard title="Sector Allocation" className="h-80">
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={portfolioAnalytics.sectorAllocation}
              cx="50%"
              cy="50%"
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            >
              {portfolioAnalytics.sectorAllocation.map((entry: any, index: number) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Monte Carlo Simulation */}
      <ChartCard title="Monte Carlo Projections" className="h-80">
        <MonteCarloChart portfolioAnalytics={portfolioAnalytics} />
      </ChartCard>

      {/* Rebalancing Recommendations */}
      <RebalancingCard portfolioAnalytics={portfolioAnalytics} />
    </div>

    {showAdvanced && <AdvancedAnalyticsSection portfolioAnalytics={portfolioAnalytics} />}
  </div>
);

const PlanningTab = ({ portfolioData, goalsData, riskProfile, planningStep, setPlanningStep, generateFinancialPlan, generatingPlan, financialPlan }: any) => {
  if (financialPlan) {
    return <FinancialPlanView plan={financialPlan} />;
  }

  return (
    <div className="space-y-6">
      {/* Planning Progress */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Financial Planning Workflow</h2>
          <div className="text-sm text-gray-500">Step {planningStep} of 5</div>
        </div>
        
        <div className="flex items-center space-x-4 mb-8">
          {[1, 2, 3, 4, 5].map((step) => (
            <div key={step} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step <= planningStep ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                {step}
              </div>
              {step < 5 && <div className={`w-12 h-1 mx-2 ${step < planningStep ? 'bg-blue-600' : 'bg-gray-200'}`} />}
            </div>
          ))}
        </div>

        <PlanningStepContent 
          step={planningStep} 
          portfolioData={portfolioData}
          goalsData={goalsData}
          riskProfile={riskProfile}
        />

        <div className="flex justify-between mt-8">
          <button 
            onClick={() => setPlanningStep(Math.max(1, planningStep - 1))}
            disabled={planningStep === 1}
            className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg disabled:opacity-50"
          >
            Previous
          </button>
          
          {planningStep === 5 ? (
            <button 
              onClick={generateFinancialPlan}
              disabled={generatingPlan}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
            >
              {generatingPlan ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Generating Plan...</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  <span>Generate Financial Plan</span>
                </>
              )}
            </button>
          ) : (
            <button 
              onClick={() => setPlanningStep(Math.min(5, planningStep + 1))}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Next
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const GoalsTab = ({ goalsData, portfolioData, riskProfile }: any) => (
  <div className="space-y-6">
    <div className="flex justify-between items-center">
      <h2 className="text-2xl font-bold">Financial Goals Tracking</h2>
      <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
        Add New Goal
      </button>
    </div>

    <div className="grid gap-6">
      {goalsData.map((goal: any) => (
        <GoalCard key={goal.id} goal={goal} portfolioData={portfolioData} riskProfile={riskProfile} />
      ))}
    </div>

    <GoalsAnalytics goalsData={goalsData} portfolioData={portfolioData} />
  </div>
);

const ReportsTab = ({ portfolioData, goalsData, riskProfile, portfolioAnalytics, financialPlan }: any) => (
  <div className="space-y-6">
    <div className="flex justify-between items-center">
      <h2 className="text-2xl font-bold">Reports & Documents</h2>
      <div className="flex space-x-2">
        <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center space-x-2">
          <Download className="w-4 h-4" />
          <span>Download Portfolio Report</span>
        </button>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2">
          <FileText className="w-4 h-4" />
          <span>Generate Tax Report</span>
        </button>
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <ReportCard
        title="Portfolio Summary"
        description="Comprehensive portfolio analysis and performance metrics"
        type="PDF"
        lastGenerated="2 hours ago"
        onDownload={() => generatePortfolioReport(portfolioData, portfolioAnalytics)}
      />
      <ReportCard
        title="Financial Plan"
        description="Complete financial plan with recommendations and projections"
        type="PDF"
        lastGenerated="1 day ago"
        onDownload={() => generateFinancialPlanReport(financialPlan)}
      />
      <ReportCard
        title="Goal Progress Report"
        description="Detailed analysis of progress toward financial goals"
        type="PDF"
        lastGenerated="3 days ago"
        onDownload={() => generateGoalsReport(goalsData)}
      />
      <ReportCard
        title="Tax Optimization"
        description="Tax-loss harvesting opportunities and strategies"
        type="PDF"
        lastGenerated="1 week ago"
        onDownload={() => generateTaxReport(portfolioData)}
      />
      <ReportCard
        title="Risk Analysis"
        description="Comprehensive risk assessment and stress testing"
        type="PDF"
        lastGenerated="2 weeks ago"
        onDownload={() => generateRiskReport(portfolioAnalytics, riskProfile)}
      />
      <ReportCard
        title="Rebalancing Guide"
        description="Asset allocation recommendations and rebalancing strategy"
        type="PDF"
        lastGenerated="1 month ago"
        onDownload={() => generateRebalancingReport(portfolioAnalytics)}
      />
    </div>

    <ExecutiveSummary 
      portfolioData={portfolioData}
      goalsData={goalsData}
      portfolioAnalytics={portfolioAnalytics}
      financialPlan={financialPlan}
    />
  </div>
);

// Helper Components
const MetricCard = ({ title, value, change, changePercent, subtitle, icon, color, showTrend = true }: any) => {
  const colorClasses: Record<string, string> = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    purple: 'from-purple-500 to-purple-600',
    orange: 'from-orange-500 to-orange-600',
    red: 'from-red-500 to-red-600'
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-2 rounded-lg bg-gradient-to-r ${colorClasses[color]} text-white`}>
          {icon}
        </div>
        {showTrend && change !== undefined && (
          <div className={`flex items-center text-sm ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {change >= 0 ? <ArrowUp className="w-4 h-4 mr-1" /> : <ArrowDown className="w-4 h-4 mr-1" />}
            {Math.abs(changePercent)}%
          </div>
        )}
      </div>
      <h3 className="text-sm font-medium text-gray-600 mb-1">{title}</h3>
      <p className="text-2xl font-bold text-gray-900 mb-1">{value}</p>
      {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
      {showTrend && change !== undefined && (
        <p className="text-sm text-gray-500">
          {change >= 0 ? '+' : ''}${change.toLocaleString()} today
        </p>
      )}
    </div>
  );
};

const ChartCard = ({ title, children, className = "" }: { title: string; children: React.ReactNode; className?: string }) => (
  <div className={`bg-white rounded-xl p-6 shadow-sm border ${className}`}>
    <h3 className="text-lg font-semibold mb-4">{title}</h3>
    {children}
  </div>
);

const AssetAllocationChart = ({ assetAllocationData, targetAllocation }: any) => {
  const allocationData = assetAllocationData?.map((item: any) => ({
    name: item.name,
    current: item.value,
    target: targetAllocation[item.name.toLowerCase()] || item.value,
    value: item.value
  })) || [];

  return (
    <ChartCard title="Asset Allocation" className="h-80">
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={allocationData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="current" fill="#3B82F6" name="Current" />
          <Bar dataKey="target" fill="#10B981" name="Target" />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
};

const TopHoldingsCard = ({ holdings }: { holdings: any[] }) => (
  <ChartCard title="Top Holdings" className="h-80">
    <div className="space-y-3">
      {holdings.map((holding) => (
        <div key={holding.ticker || holding.id} className="flex items-center justify-between">
          <div>
            <div className="font-medium">{holding.ticker}</div>
            <div className="text-sm text-gray-500">{holding.name}</div>
          </div>
          <div className="text-right">
            <div className="font-medium">${holding.value.toLocaleString()}</div>
            <div className={`text-sm ${holding.gainLossPercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {holding.gainLossPercent >= 0 ? '+' : ''}{holding.gainLossPercent}%
            </div>
          </div>
        </div>
      ))}
    </div>
  </ChartCard>
);

const AccountsOverview = ({ accounts }: { accounts: any[] }) => (
  <ChartCard title="Account Overview">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {accounts.map((account) => (
        <div key={account.id} className="p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium">{account.name}</h4>
            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">{account.provider}</span>
          </div>
          <div className="text-2xl font-bold mb-1">${account.balance.toLocaleString()}</div>
          <div className={`flex items-center text-sm ${account.changePercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {account.changePercent >= 0 ? <ArrowUp className="w-3 h-3 mr-1" /> : <ArrowDown className="w-3 h-3 mr-1" />}
            ${Math.abs(account.change).toLocaleString()} ({Math.abs(account.changePercent)}%)
          </div>
        </div>
      ))}
    </div>
  </ChartCard>
);

const HoldingsAnalysis = ({ holdings, showAdvanced }: { holdings: any[]; showAdvanced: boolean }) => (
  <ChartCard title="Holdings Analysis">
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b">
            <th className="text-left py-2">Symbol</th>
            <th className="text-left py-2">Name</th>
            <th className="text-right py-2">Shares</th>
            <th className="text-right py-2">Price</th>
            <th className="text-right py-2">Value</th>
            <th className="text-right py-2">Gain/Loss</th>
            <th className="text-right py-2">Allocation</th>
            {showAdvanced && (
              <>
                <th className="text-right py-2">Sector</th>
                <th className="text-right py-2">Asset Class</th>
              </>
            )}
          </tr>
        </thead>
        <tbody>
          {holdings.map((holding) => (
            <tr key={holding.ticker || holding.id} className="border-b hover:bg-gray-50">
              <td className="py-3 font-medium">{holding.ticker}</td>
              <td className="py-3">{holding.name}</td>
              <td className="py-3 text-right">{holding.shares}</td>
              <td className="py-3 text-right">${holding.price}</td>
              <td className="py-3 text-right">${holding.value.toLocaleString()}</td>
              <td className={`py-3 text-right ${holding.gainLossPercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {holding.gainLossPercent >= 0 ? '+' : ''}${holding.gainLoss.toLocaleString()} ({holding.gainLossPercent}%)
              </td>
              <td className="py-3 text-right">{holding.allocation}%</td>
              {showAdvanced && (
                <>
                  <td className="py-3 text-right">{holding.sector}</td>
                  <td className="py-3 text-right">{holding.type}</td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </ChartCard>
);

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#F97316', '#84CC16'];

// Advanced calculation functions
function calculatePortfolioAnalytics(portfolioData: any, riskProfile: any) {
  return {
    sharpeRatio: 1.35,
    beta: 0.95,
    maxDrawdown: 12.5,
    volatility: 14.2,
    allocationScore: 78,
    allocationGrade: 'B+',
    diversificationScore: 85,
    diversificationGrade: 'A-',
    sectorAllocation: [
      { name: 'Technology', value: 35 },
      { name: 'Healthcare', value: 15 },
      { name: 'Financials', value: 12 },
      { name: 'Consumer', value: 18 },
      { name: 'Industrials', value: 10 },
      { name: 'Other', value: 10 }
    ],
    riskReturnData: [
      { risk: 15, return: 8.5 },
      { risk: 12, return: 6.2 },
      { risk: 20, return: 12.1 },
      { risk: 8, return: 4.1 }
    ],
    correlationMatrix: [
      [1.00, 0.65, -0.12, 0.78],
      [0.65, 1.00, -0.08, 0.82],
      [-0.12, -0.08, 1.00, -0.15],
      [0.78, 0.82, -0.15, 1.00]
    ]
  };
}

function generatePerformanceData(timeRange: string) {
  const periods = timeRange === '1M' ? 30 : timeRange === '3M' ? 90 : timeRange === '6M' ? 180 : 365;
  const data = [];
  let portfolioValue = 450000;
  let sp500Value = 100;
  let benchmarkValue = 100;

  for (let i = 0; i < periods; i++) {
    portfolioValue *= (1 + (Math.random() - 0.45) * 0.02);
    sp500Value *= (1 + (Math.random() - 0.47) * 0.015);
    benchmarkValue *= (1 + (Math.random() - 0.48) * 0.012);
    
    data.push({
      date: new Date(Date.now() - (periods - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      portfolio: Math.round(portfolioValue),
      sp500: Math.round((sp500Value - 100) * 100) / 100,
      benchmark: Math.round((benchmarkValue - 100) * 100) / 100
    });
  }
  
  return data;
}

function createComprehensiveFinancialPlan(portfolioData: any, goalsData: any[], riskProfile: any) {
  return {
    executiveSummary: {
      currentNetWorth: portfolioData.totalValue,
      projectedNetWorth: 2150000,
      goalAttainmentProbability: 78,
      recommendedActions: 5,
      riskScore: riskProfile.riskTolerance
    },
    recommendations: [
      {
        category: 'Asset Allocation',
        priority: 'High',
        action: 'Increase international equity allocation by 5%',
        impact: 'Improve diversification and reduce portfolio risk',
        timeline: '1 month'
      },
      {
        category: 'Savings Rate',
        priority: 'Medium',
        action: 'Increase monthly savings by $200',
        impact: 'Accelerate retirement goal by 2 years',
        timeline: '3 months'
      },
      {
        category: 'Tax Strategy',
        priority: 'High',
        action: 'Max out Roth IRA contributions',
        impact: 'Save $2,400 annually in taxes',
        timeline: '1 month'
      }
    ],
    projections: {
      retirement: {
        projectedValue: 2000000,
        monthlyIncome: 8000,
        probability: 85
      },
      shortTerm: {
        emergencyFund: { target: 50000, timeline: '18 months' },
        houseDownPayment: { target: 100000, timeline: '4 years' }
      }
    },
    scenarios: [
      { name: 'Conservative', probability: 90, outcome: 'Goals met with margin' },
      { name: 'Expected', probability: 75, outcome: 'Goals met on schedule' },
      { name: 'Aggressive', probability: 50, outcome: 'Goals exceeded significantly' }
    ]
  };
}

function getDefaultPortfolioData() {
  return {
    totalValue: 487250,
    totalCash: 15420,
    dayChange: 2450,
    dayChangePercent: 0.51,
    accounts: [],
    holdings: []
  };
}

// Report generation functions
const generatePortfolioReport = (portfolioData: any, portfolioAnalytics: any) => {
  console.log('Generating portfolio report...', portfolioData, portfolioAnalytics);
  alert('Portfolio report would be generated and downloaded here');
};

const generateFinancialPlanReport = (financialPlan: any) => {
  console.log('Generating financial plan report...', financialPlan);
  alert('Financial plan report would be generated and downloaded here');
};

const generateGoalsReport = (goalsData: any[]) => {
  console.log('Generating goals report...', goalsData);
  alert('Goals report would be generated and downloaded here');
};

const generateTaxReport = (portfolioData: any) => {
  console.log('Generating tax report...', portfolioData);
  alert('Tax report would be generated and downloaded here');
};

const generateRiskReport = (portfolioAnalytics: any, riskProfile: any) => {
  console.log('Generating risk report...', portfolioAnalytics, riskProfile);
  alert('Risk report would be generated and downloaded here');
};

const generateRebalancingReport = (portfolioAnalytics: any) => {
  console.log('Generating rebalancing report...', portfolioAnalytics);
  alert('Rebalancing report would be generated and downloaded here');
};

export default InvestmentPlanningSuite;