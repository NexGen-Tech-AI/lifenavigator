'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Calculator, TrendingUp, AlertCircle, BarChart, PieChart as PieChartIcon } from 'lucide-react';

const Chart = dynamic(() => import('recharts').then(mod => mod.LineChart), { ssr: false });
const Line = dynamic(() => import('recharts').then(mod => mod.Line), { ssr: false });
const XAxis = dynamic(() => import('recharts').then(mod => mod.XAxis), { ssr: false });
const YAxis = dynamic(() => import('recharts').then(mod => mod.YAxis), { ssr: false });
const CartesianGrid = dynamic(() => import('recharts').then(mod => mod.CartesianGrid), { ssr: false });
const Tooltip = dynamic(() => import('recharts').then(mod => mod.Tooltip), { ssr: false });
const ResponsiveContainer = dynamic(() => import('recharts').then(mod => mod.ResponsiveContainer), { ssr: false });
const RadarChart = dynamic(() => import('recharts').then(mod => mod.RadarChart), { ssr: false });
const PolarGrid = dynamic(() => import('recharts').then(mod => mod.PolarGrid), { ssr: false });
const PolarAngleAxis = dynamic(() => import('recharts').then(mod => mod.PolarAngleAxis), { ssr: false });
const PolarRadiusAxis = dynamic(() => import('recharts').then(mod => mod.PolarRadiusAxis), { ssr: false });
const Radar = dynamic(() => import('recharts').then(mod => mod.Radar), { ssr: false });
const ScatterChart = dynamic(() => import('recharts').then(mod => mod.ScatterChart), { ssr: false });
const Scatter = dynamic(() => import('recharts').then(mod => mod.Scatter), { ssr: false });
const ZAxis = dynamic(() => import('recharts').then(mod => mod.ZAxis), { ssr: false });

interface AdvancedAnalyticsProps {
  portfolio: any;
}

export default function AdvancedAnalytics({ portfolio }: AdvancedAnalyticsProps) {
  const [riskMetrics, setRiskMetrics] = useState<any>(null);
  const [correlationMatrix, setCorrelationMatrix] = useState<any>(null);
  const [monteCarloResults, setMonteCarloResults] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    try {
      const [riskRes, correlationRes, monteCarloRes] = await Promise.all([
        fetch('/api/financial/investments/analytics/risk-metrics'),
        fetch('/api/financial/investments/analytics/correlation-matrix'),
        fetch('/api/financial/investments/analytics/monte-carlo')
      ]);

      const [risk, correlation, monteCarlo] = await Promise.all([
        riskRes.json(),
        correlationRes.json(),
        monteCarloRes.json()
      ]);

      setRiskMetrics(risk);
      setCorrelationMatrix(correlation);
      setMonteCarloResults(monteCarlo);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching analytics data:', error);
      setLoading(false);
    }
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
    return `${value.toFixed(2)}%`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Prepare data for charts
  const riskRadarData = riskMetrics ? [
    { metric: 'Sharpe Ratio', value: riskMetrics.sharpeRatio * 50, benchmark: 60 },
    { metric: 'Sortino Ratio', value: riskMetrics.sortinoRatio * 50, benchmark: 65 },
    { metric: 'Alpha', value: (riskMetrics.alpha + 5) * 10, benchmark: 50 },
    { metric: 'Beta (inverted)', value: (2 - riskMetrics.beta) * 50, benchmark: 55 },
    { metric: 'Calmar Ratio', value: riskMetrics.calmarRatio * 60, benchmark: 50 },
    { metric: 'Info Ratio', value: riskMetrics.informationRatio * 100, benchmark: 45 }
  ] : [];

  const monteCarloChartData = monteCarloResults?.percentiles.map((p: any) => ({
    percentile: p.percentile,
    value: p.value,
    probability: p.probability
  })) || [];

  const efficientFrontierData = [
    { risk: 5, return: 3.2, label: 'Conservative' },
    { risk: 8, return: 5.1, label: 'Moderate Conservative' },
    { risk: 12, return: 7.2, label: 'Moderate' },
    { risk: 15, return: 8.8, label: 'Current Portfolio', size: 300 },
    { risk: 18, return: 10.2, label: 'Moderate Aggressive' },
    { risk: 22, return: 11.5, label: 'Aggressive' },
    { risk: 25, return: 12.1, label: 'Very Aggressive' }
  ];

  return (
    <div className="space-y-6">
      {/* Risk Metrics Overview */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <Calculator className="w-5 h-5 mr-2 text-blue-600" />
          Advanced Risk Metrics
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Sharpe Ratio</p>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{riskMetrics?.sharpeRatio.toFixed(2)}</p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">Risk-adjusted return</p>
          </div>
          <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Sortino Ratio</p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">{riskMetrics?.sortinoRatio.toFixed(2)}</p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">Downside risk-adjusted</p>
          </div>
          <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Beta</p>
            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{riskMetrics?.beta.toFixed(2)}</p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">Market sensitivity</p>
          </div>
          <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Alpha</p>
            <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{formatPercent(riskMetrics?.alpha || 0)}</p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">Excess return</p>
          </div>
          <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Max Drawdown</p>
            <p className="text-2xl font-bold text-red-600 dark:text-red-400">{formatPercent(riskMetrics?.maxDrawdown || 0)}</p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">Peak to trough</p>
          </div>
          <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">VaR (95%)</p>
            <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{formatPercent(riskMetrics?.valueAtRisk || 0)}</p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">5% worst case</p>
          </div>
          <div className="p-4 bg-pink-50 dark:bg-pink-900/20 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">CVaR (95%)</p>
            <p className="text-2xl font-bold text-pink-600 dark:text-pink-400">{formatPercent(riskMetrics?.conditionalValueAtRisk || 0)}</p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">Expected shortfall</p>
          </div>
          <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Volatility</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatPercent(riskMetrics?.volatility || 0)}</p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">Standard deviation</p>
          </div>
        </div>
      </div>

      {/* Risk Radar Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Risk Profile Analysis</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={riskRadarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="metric" />
                <PolarRadiusAxis angle={90} domain={[0, 100]} />
                <Radar name="Your Portfolio" dataKey="value" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.6} />
                <Radar name="Benchmark" dataKey="benchmark" stroke="#10B981" fill="#10B981" fillOpacity={0.3} />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Efficient Frontier */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Efficient Frontier</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="risk" label={{ value: 'Risk (Volatility %)', position: 'insideBottom', offset: -5 }} />
                <YAxis dataKey="return" label={{ value: 'Expected Return %', angle: -90, position: 'insideLeft' }} />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                <Scatter name="Portfolios" data={efficientFrontierData} fill="#3B82F6">
                  {efficientFrontierData.map((entry, index) => (
                    <cell key={`cell-${index}`} fill={entry.label === 'Current Portfolio' ? '#EF4444' : '#3B82F6'} />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Correlation Matrix */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <PieChartIcon className="w-5 h-5 mr-2 text-purple-600" />
          Asset Correlation Matrix
        </h3>
        {correlationMatrix && (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="px-2 py-1 text-sm font-semibold text-gray-700 dark:text-gray-300"></th>
                    {correlationMatrix.assets.map((asset: string) => (
                      <th key={asset} className="px-2 py-1 text-sm font-semibold text-gray-700 dark:text-gray-300 text-center">
                        {asset}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {correlationMatrix.matrix.map((row: number[], i: number) => (
                    <tr key={i}>
                      <td className="px-2 py-1 text-sm font-semibold text-gray-700 dark:text-gray-300">
                        {correlationMatrix.assets[i]}
                      </td>
                      {row.map((value: number, j: number) => {
                        const color = value === 1 ? 'bg-gray-200 dark:bg-gray-600' :
                                    value > 0.7 ? 'bg-red-200 dark:bg-red-900/50 text-red-800 dark:text-red-200' :
                                    value > 0.3 ? 'bg-yellow-200 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-200' :
                                    value > -0.3 ? 'bg-green-200 dark:bg-green-900/50 text-green-800 dark:text-green-200' :
                                    'bg-blue-200 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200';
                        return (
                          <td key={j} className={`px-2 py-1 text-sm text-center ${color}`}>
                            {value.toFixed(2)}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <div className="flex items-start">
                <AlertCircle className="w-5 h-5 text-yellow-600 mr-2 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-1">Correlation Analysis</h4>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300">
                    {correlationMatrix.interpretation.recommendation}
                  </p>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-2">
                    Diversification Score: {correlationMatrix.interpretation.diversificationScore}/100
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Monte Carlo Simulation */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
          Monte Carlo Simulation Results
        </h3>
        {monteCarloResults && (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-3">Portfolio Value Projections</h4>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <Chart data={monteCarloChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="percentile" />
                      <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
                      <Tooltip formatter={(value: number) => formatCurrency(value)} />
                      <Line type="monotone" dataKey="value" stroke="#3B82F6" strokeWidth={2} />
                    </Chart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-3">Simulation Parameters</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Simulations Run</span>
                      <span className="font-semibold text-gray-900 dark:text-white">{monteCarloResults.simulations.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Time Horizon</span>
                      <span className="font-semibold text-gray-900 dark:text-white">{monteCarloResults.timeHorizon} years</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Expected Return</span>
                      <span className="font-semibold text-gray-900 dark:text-white">{formatPercent(monteCarloResults.assumptions.expectedReturn)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Volatility</span>
                      <span className="font-semibold text-gray-900 dark:text-white">{formatPercent(monteCarloResults.assumptions.volatility)}</span>
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-3">Key Results</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-blue-700 dark:text-blue-300">Success Rate</span>
                      <span className="font-bold text-blue-900 dark:text-blue-100">{formatPercent(monteCarloResults.successRate)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-700 dark:text-blue-300">Expected Value</span>
                      <span className="font-bold text-blue-900 dark:text-blue-100">{formatCurrency(monteCarloResults.expectedValue)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-700 dark:text-blue-300">90% Confidence Range</span>
                      <span className="font-bold text-blue-900 dark:text-blue-100">
                        {formatCurrency(monteCarloResults.confidenceInterval.low)} - {formatCurrency(monteCarloResults.confidenceInterval.high)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Best Case (95th)</p>
                <p className="text-xl font-bold text-green-600 dark:text-green-400">{formatCurrency(monteCarloResults.bestCase)}</p>
              </div>
              <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Expected (50th)</p>
                <p className="text-xl font-bold text-blue-600 dark:text-blue-400">{formatCurrency(monteCarloResults.expectedValue)}</p>
              </div>
              <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Conservative (25th)</p>
                <p className="text-xl font-bold text-yellow-600 dark:text-yellow-400">{formatCurrency(monteCarloResults.percentiles[2].value)}</p>
              </div>
              <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Worst Case (5th)</p>
                <p className="text-xl font-bold text-red-600 dark:text-red-400">{formatCurrency(monteCarloResults.worstCase)}</p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}