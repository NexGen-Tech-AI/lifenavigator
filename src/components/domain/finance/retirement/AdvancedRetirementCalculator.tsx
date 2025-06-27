'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Calculator, TrendingUp, DollarSign, Target, AlertTriangle, Info, Settings, BarChart3 } from 'lucide-react';

const AdvancedRetirementCalculator = () => {
  const [inputs, setInputs] = useState({
    currentAge: 30,
    retirementAge: 65,
    currentSavings: 50000,
    monthlyContribution: 1000,
    expectedAnnualReturn: 0.07,
    riskTolerance: 2,
    inflationRate: 0.025,
    socialSecurityIncome: 24000,
    currentAnnualIncome: 75000,
    incomeReplacementGoal: 0.8,
    contributionIncreaseRate: 0.03,
    withdrawalRate: 0.04,
    taxRate: 0.22,
    compoundingFrequency: 12,
    volatility: 0.15,
    riskFreeRate: 0.025,
    downSideDeviation: 0.12,
    healthcareCosts: 5000,
    healthcareInflation: 0.05,
    emergencyFund: 25000,
    otherRetirementAccounts: 0,
    pensionIncome: 0,
    partTimeIncomeYears: 0,
    partTimeIncome: 0
  });

  const [calculations, setCalculations] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scenarios, setScenarios] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('calculator');
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Fetch calculations when inputs change
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchCalculations();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [inputs]);

  const fetchCalculations = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/financial/retirement-calculator/advanced', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(inputs)
      });

      if (!response.ok) {
        throw new Error('Failed to calculate retirement projections');
      }

      const data = await response.json();
      setCalculations(data.calculations);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const updateInput = (key: string, value: string | number) => {
    setInputs(prev => ({ ...prev, [key]: parseFloat(value.toString()) || 0 }));
  };

  const addScenario = () => {
    if (!calculations) return;
    const scenarioName = `Scenario ${scenarios.length + 1}`;
    setScenarios(prev => [...prev, { name: scenarioName, inputs: { ...inputs }, results: calculations }]);
  };

  const removeScenario = (index: number) => {
    setScenarios(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="max-w-7xl mx-auto p-6 bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen">
      <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Calculator className="w-8 h-8" />
              <div>
                <h1 className="text-3xl font-bold">Advanced Retirement Calculator</h1>
                <p className="text-blue-100">Comprehensive financial planning with real-time analytics</p>
              </div>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-400 rounded-lg transition-colors flex items-center space-x-2"
              >
                <Settings className="w-4 h-4" />
                <span>{showAdvanced ? 'Basic' : 'Advanced'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-gray-50 px-6 py-3 border-b">
          <div className="flex space-x-1">
            {['calculator', 'projections', 'scenarios', 'analytics'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === tab 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-white text-gray-600 hover:bg-gray-100'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="p-6">
          {loading && (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {!loading && !error && (
            <>
              {activeTab === 'calculator' && (
                <CalculatorTab 
                  inputs={inputs} 
                  updateInput={updateInput} 
                  calculations={calculations}
                  showAdvanced={showAdvanced}
                />
              )}
              
              {activeTab === 'projections' && calculations && (
                <ProjectionsTab calculations={calculations} inputs={inputs} />
              )}
              
              {activeTab === 'scenarios' && (
                <ScenariosTab 
                  scenarios={scenarios} 
                  addScenario={addScenario}
                  removeScenario={removeScenario}
                  currentResults={calculations}
                />
              )}
              
              {activeTab === 'analytics' && calculations && (
                <AnalyticsTab calculations={calculations} inputs={inputs} />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const CalculatorTab: React.FC<any> = ({ inputs, updateInput, calculations, showAdvanced }) => (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
    {/* Input Section */}
    <div className="space-y-6">
      <div className="bg-gray-50 rounded-xl p-6">
        <h3 className="text-xl font-semibold mb-4 flex items-center">
          <Settings className="w-5 h-5 mr-2" />
          Basic Parameters
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <InputField label="Current Age" value={inputs.currentAge} onChange={(v) => updateInput('currentAge', v)} />
          <InputField label="Retirement Age" value={inputs.retirementAge} onChange={(v) => updateInput('retirementAge', v)} />
          <InputField label="Current Savings ($)" value={inputs.currentSavings} onChange={(v) => updateInput('currentSavings', v)} />
          <InputField label="Monthly Contribution ($)" value={inputs.monthlyContribution} onChange={(v) => updateInput('monthlyContribution', v)} />
          <InputField label="Expected Annual Return (%)" value={inputs.expectedAnnualReturn * 100} onChange={(v) => updateInput('expectedAnnualReturn', v / 100)} />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Risk Tolerance</label>
            <select 
              value={inputs.riskTolerance} 
              onChange={(e) => updateInput('riskTolerance', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value={1}>Conservative</option>
              <option value={2}>Moderate</option>
              <option value={3}>Aggressive</option>
            </select>
          </div>
        </div>
      </div>

      {showAdvanced && (
        <>
          <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="text-xl font-semibold mb-4">Advanced Parameters</h3>
            <div className="grid grid-cols-2 gap-4">
              <InputField label="Inflation Rate (%)" value={inputs.inflationRate * 100} onChange={(v) => updateInput('inflationRate', v / 100)} />
              <InputField label="Contribution Growth (%)" value={inputs.contributionIncreaseRate * 100} onChange={(v) => updateInput('contributionIncreaseRate', v / 100)} />
              <InputField label="Withdrawal Rate (%)" value={inputs.withdrawalRate * 100} onChange={(v) => updateInput('withdrawalRate', v / 100)} />
              <InputField label="Tax Rate (%)" value={inputs.taxRate * 100} onChange={(v) => updateInput('taxRate', v / 100)} />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Compounding Frequency</label>
                <select 
                  value={inputs.compoundingFrequency} 
                  onChange={(e) => updateInput('compoundingFrequency', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value={1}>Annually</option>
                  <option value={4}>Quarterly</option>
                  <option value={12}>Monthly</option>
                  <option value={365}>Daily</option>
                </select>
              </div>
              <InputField label="Volatility (%)" value={inputs.volatility * 100} onChange={(v) => updateInput('volatility', v / 100)} />
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="text-xl font-semibold mb-4">Additional Income Sources</h3>
            <div className="grid grid-cols-2 gap-4">
              <InputField label="Social Security ($)" value={inputs.socialSecurityIncome} onChange={(v) => updateInput('socialSecurityIncome', v)} />
              <InputField label="Pension Income ($)" value={inputs.pensionIncome} onChange={(v) => updateInput('pensionIncome', v)} />
              <InputField label="Current Annual Income ($)" value={inputs.currentAnnualIncome} onChange={(v) => updateInput('currentAnnualIncome', v)} />
              <InputField label="Income Replacement Goal (%)" value={inputs.incomeReplacementGoal * 100} onChange={(v) => updateInput('incomeReplacementGoal', v / 100)} />
              <InputField label="Healthcare Costs ($)" value={inputs.healthcareCosts} onChange={(v) => updateInput('healthcareCosts', v)} />
              <InputField label="Emergency Fund ($)" value={inputs.emergencyFund} onChange={(v) => updateInput('emergencyFund', v)} />
            </div>
          </div>
        </>
      )}
    </div>

    {/* Results Section */}
    <div className="space-y-6">
      {calculations && (
        <>
          <ResultsCard calculations={calculations} />
          <RiskMetricsCard calculations={calculations} />
          <QuickInsights calculations={calculations} />
        </>
      )}
    </div>
  </div>
);

const ProjectionsTab: React.FC<any> = ({ calculations, inputs }) => {
  const projectionData = useMemo(() => {
    return {
      portfolioGrowth: calculations.projections,
      incomeBreakdown: [
        { name: 'Portfolio Withdrawals', value: calculations.monthlyIncome * 12 - inputs.socialSecurityIncome - inputs.pensionIncome },
        { name: 'Social Security', value: inputs.socialSecurityIncome },
        { name: 'Pension', value: inputs.pensionIncome }
      ].filter(item => item.value > 0),
      riskScenarios: [
        { scenario: 'Bear Market', value: calculations.totalAtRetirement * 0.7 },
        { scenario: 'Expected', value: calculations.totalAtRetirement },
        { scenario: 'Bull Market', value: calculations.totalAtRetirement * 1.3 }
      ]
    };
  }, [calculations, inputs]);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Portfolio Growth Over Time" icon={<TrendingUp className="w-5 h-5" />}>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={projectionData.portfolioGrowth}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="age" />
              <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`} />
              <Tooltip formatter={(value) => [`$${Number(value).toLocaleString()}`, 'Portfolio Value']} />
              <Area type="monotone" dataKey="balance" stroke="#3B82F6" fill="#93C5FD" fillOpacity={0.6} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Income Sources in Retirement" icon={<PieChart className="w-5 h-5" />}>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={projectionData.incomeBreakdown}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {projectionData.incomeBreakdown.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={['#3B82F6', '#10B981', '#F59E0B', '#EF4444'][index % 4]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `$${Number(value).toLocaleString()}`} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Risk Scenarios" icon={<AlertTriangle className="w-5 h-5" />}>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={projectionData.riskScenarios}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="scenario" />
              <YAxis tickFormatter={(value) => `$${(value / 1000000).toFixed(1)}M`} />
              <Tooltip formatter={(value) => [`$${Number(value).toLocaleString()}`, 'Portfolio Value']} />
              <Bar dataKey="value" fill="#6366F1" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <CompoundingEffectChart calculations={calculations} />
      </div>

      <MonteCarloChart calculations={calculations} />
    </div>
  );
};

const ScenariosTab: React.FC<any> = ({ scenarios, addScenario, removeScenario, currentResults }) => (
  <div className="space-y-6">
    <div className="flex justify-between items-center">
      <h2 className="text-2xl font-bold">Scenario Comparison</h2>
      <button 
        onClick={addScenario}
        disabled={!currentResults}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Add Current Scenario
      </button>
    </div>

    {scenarios.length === 0 ? (
      <div className="text-center py-12 text-gray-500">
        <BarChart3 className="w-16 h-16 mx-auto mb-4 text-gray-300" />
        <p>No scenarios saved yet. Add your current configuration to start comparing scenarios.</p>
      </div>
    ) : (
      <div className="grid gap-6">
        <ScenarioComparisonChart scenarios={scenarios} currentResults={currentResults} />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {scenarios.map((scenario, index) => (
            <ScenarioCard 
              key={index} 
              scenario={scenario} 
              onRemove={() => removeScenario(index)} 
            />
          ))}
        </div>
      </div>
    )}
  </div>
);

const AnalyticsTab: React.FC<any> = ({ calculations, inputs }) => (
  <div className="space-y-8">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <MetricCard 
        title="Sharpe Ratio" 
        value={calculations.sharpeRatio} 
        subtitle="Risk-adjusted return"
        color="blue"
      />
      <MetricCard 
        title="Sortino Ratio" 
        value={calculations.sortinoRatio} 
        subtitle="Downside risk adjusted"
        color="green"
      />
      <MetricCard 
        title="Portfolio Beta" 
        value={calculations.portfolioBeta} 
        subtitle="Market correlation"
        color="purple"
      />
      <MetricCard 
        title="Value at Risk" 
        value={`${calculations.valueAtRisk}%`} 
        subtitle="5% worst case"
        color="red"
      />
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <SensitivityChart calculations={calculations} />
      <ChartCard title="Monte Carlo Success Rate" icon={<Target className="w-5 h-5" />}>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="text-6xl font-bold text-blue-600">
              {calculations.monteCarloResults?.successRate?.toFixed(1)}%
            </div>
            <p className="text-gray-600 mt-2">Probability of meeting retirement goals</p>
          </div>
        </div>
      </ChartCard>
    </div>

    <AdvancedMetricsTable calculations={calculations} />
  </div>
);

// Helper Components
const InputField: React.FC<{ label: string; value: number; onChange: (value: string) => void; type?: string }> = ({ 
  label, value, onChange, type = "number" 
}) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
    />
  </div>
);

const ChartCard: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode }> = ({ 
  title, icon, children 
}) => (
  <div className="bg-white rounded-xl border shadow-sm p-6">
    <div className="flex items-center mb-4">
      <div className="text-blue-600 mr-2">{icon}</div>
      <h3 className="text-lg font-semibold">{title}</h3>
    </div>
    {children}
  </div>
);

const ResultsCard: React.FC<{ calculations: any }> = ({ calculations }) => (
  <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 border border-green-200">
    <h3 className="text-xl font-semibold mb-4 flex items-center">
      <Target className="w-5 h-5 mr-2 text-green-600" />
      Retirement Projections
    </h3>
    <div className="space-y-3">
      <div className="flex justify-between">
        <span className="text-gray-600">Total at Retirement:</span>
        <span className="font-bold text-lg">${calculations.totalAtRetirement.toLocaleString()}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-gray-600">Monthly Income:</span>
        <span className="font-bold text-lg">${calculations.monthlyIncome.toLocaleString()}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-gray-600">Income Replacement:</span>
        <span className={`font-bold text-lg ${calculations.meetsIncomeGoal ? 'text-green-600' : 'text-red-600'}`}>
          {calculations.incomeReplacementRatio}%
        </span>
      </div>
      <div className="flex justify-between">
        <span className="text-gray-600">Portfolio Longevity:</span>
        <span className="font-bold text-lg">{calculations.portfolioLongevity} years</span>
      </div>
    </div>
  </div>
);

const RiskMetricsCard: React.FC<{ calculations: any }> = ({ calculations }) => (
  <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
    <h3 className="text-xl font-semibold mb-4 flex items-center">
      <BarChart3 className="w-5 h-5 mr-2 text-purple-600" />
      Risk Metrics
    </h3>
    <div className="space-y-3">
      <div className="flex justify-between">
        <span className="text-gray-600">Sharpe Ratio:</span>
        <span className="font-bold">{calculations.sharpeRatio}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-gray-600">Sortino Ratio:</span>
        <span className="font-bold">{calculations.sortinoRatio}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-gray-600">Value at Risk:</span>
        <span className="font-bold text-red-600">{calculations.valueAtRisk}%</span>
      </div>
      <div className="flex justify-between">
        <span className="text-gray-600">Max Drawdown:</span>
        <span className="font-bold text-red-600">{calculations.maxDrawdown}%</span>
      </div>
    </div>
  </div>
);

const QuickInsights: React.FC<{ calculations: any }> = ({ calculations }) => (
  <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-6 border border-yellow-200">
    <h3 className="text-xl font-semibold mb-4 flex items-center">
      <Info className="w-5 h-5 mr-2 text-yellow-600" />
      Key Insights
    </h3>
    <div className="space-y-2 text-sm">
      {calculations.insights?.map((insight: string, index: number) => (
        <div key={index} className="flex items-start">
          <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
          <span>{insight}</span>
        </div>
      )) || <p className="text-gray-500">Loading insights...</p>}
    </div>
  </div>
);

const MetricCard: React.FC<{ title: string; value: string | number; subtitle: string; color: string }> = ({ 
  title, value, subtitle, color 
}) => {
  const colorClasses: Record<string, string> = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    purple: 'from-purple-500 to-purple-600',
    red: 'from-red-500 to-red-600'
  };

  return (
    <div className="bg-white rounded-xl border shadow-sm p-6">
      <div className={`w-full h-2 bg-gradient-to-r ${colorClasses[color]} rounded-full mb-4`}></div>
      <h3 className="text-lg font-semibold mb-1">{title}</h3>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-sm text-gray-500">{subtitle}</p>
    </div>
  );
};

const CompoundingEffectChart: React.FC<{ calculations: any }> = ({ calculations }) => (
  <ChartCard title="Compounding Frequency Effect" icon={<TrendingUp className="w-5 h-5" />}>
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={calculations.compoundingEffect || []}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="frequency" />
        <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`} />
        <Tooltip 
          formatter={(value, name) => [
            name === 'value' ? `$${Number(value).toLocaleString()}` : `+$${Number(value).toLocaleString()}`,
            name === 'value' ? 'Future Value' : 'vs Annual'
          ]} 
        />
        <Bar dataKey="value" fill="#3B82F6" />
        <Bar dataKey="difference" fill="#10B981" />
      </BarChart>
    </ResponsiveContainer>
  </ChartCard>
);

const MonteCarloChart: React.FC<{ calculations: any }> = ({ calculations }) => (
  <ChartCard title="Monte Carlo Simulation Results" icon={<BarChart3 className="w-5 h-5" />}>
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={calculations.monteCarloResults?.percentiles || []}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="percentile" />
        <YAxis tickFormatter={(value) => `$${(value / 1000000).toFixed(1)}M`} />
        <Tooltip formatter={(value) => [`$${Number(value).toLocaleString()}`, 'Portfolio Value']} />
        <Area type="monotone" dataKey="value" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
      </AreaChart>
    </ResponsiveContainer>
  </ChartCard>
);

const SensitivityChart: React.FC<{ calculations: any }> = ({ calculations }) => (
  <ChartCard title="Return Rate Sensitivity Analysis" icon={<TrendingUp className="w-5 h-5" />}>
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={calculations.sensitivityAnalysis || []}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="returnRate" />
        <YAxis tickFormatter={(value) => `$${(value / 1000000).toFixed(1)}M`} />
        <Tooltip formatter={(value) => [`$${Number(value).toLocaleString()}`, 'Portfolio Value']} />
        <Line type="monotone" dataKey="value" stroke="#F59E0B" strokeWidth={3} />
      </LineChart>
    </ResponsiveContainer>
  </ChartCard>
);

const ScenarioComparisonChart: React.FC<{ scenarios: any[]; currentResults: any }> = ({ scenarios, currentResults }) => {
  const comparisonData = scenarios.map((scenario) => ({
    name: scenario.name,
    totalAtRetirement: scenario.results.totalAtRetirement,
    monthlyIncome: scenario.results.monthlyIncome,
    incomeReplacement: scenario.results.incomeReplacementRatio
  }));

  if (currentResults) {
    comparisonData.push({
      name: 'Current',
      totalAtRetirement: currentResults.totalAtRetirement,
      monthlyIncome: currentResults.monthlyIncome,
      incomeReplacement: currentResults.incomeReplacementRatio
    });
  }

  return (
    <ChartCard title="Scenario Comparison" icon={<BarChart3 className="w-5 h-5" />}>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={comparisonData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis tickFormatter={(value) => `$${(value / 1000000).toFixed(1)}M`} />
          <Tooltip formatter={(value) => `$${Number(value).toLocaleString()}`} />
          <Bar dataKey="totalAtRetirement" fill="#3B82F6" />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
};

const ScenarioCard: React.FC<{ scenario: any; onRemove: () => void }> = ({ scenario, onRemove }) => (
  <div className="bg-white rounded-lg border shadow-sm p-4">
    <div className="flex justify-between items-start mb-3">
      <h4 className="font-semibold">{scenario.name}</h4>
      <button 
        onClick={onRemove}
        className="text-red-500 hover:text-red-700 text-sm"
      >
        Remove
      </button>
    </div>
    <div className="space-y-2 text-sm">
      <div className="flex justify-between">
        <span>Total:</span>
        <span className="font-medium">${(scenario.results.totalAtRetirement / 1000000).toFixed(1)}M</span>
      </div>
      <div className="flex justify-between">
        <span>Monthly:</span>
        <span className="font-medium">${scenario.results.monthlyIncome.toLocaleString()}</span>
      </div>
      <div className="flex justify-between">
        <span>Replacement:</span>
        <span className="font-medium">{scenario.results.incomeReplacementRatio}%</span>
      </div>
    </div>
  </div>
);

const AdvancedMetricsTable: React.FC<{ calculations: any }> = ({ calculations }) => (
  <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
    <div className="p-6 border-b">
      <h3 className="text-lg font-semibold">Advanced Financial Metrics</h3>
    </div>
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Metric</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Interpretation</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {calculations.advancedMetrics?.map((metric: any, index: number) => (
            <tr key={index}>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{metric.name}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{metric.value}</td>
              <td className="px-6 py-4 text-sm text-gray-500">{metric.interpretation}</td>
            </tr>
          )) || (
            <tr>
              <td colSpan={3} className="px-6 py-4 text-center text-gray-500">Loading metrics...</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  </div>
);

export default AdvancedRetirementCalculator;