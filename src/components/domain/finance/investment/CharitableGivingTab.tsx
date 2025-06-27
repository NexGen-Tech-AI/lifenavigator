'use client';

import { useState } from 'react';
import { Heart, TrendingUp, Users, Calendar, DollarSign, Award, Target, BarChart } from 'lucide-react';
import dynamic from 'next/dynamic';

const Chart = dynamic(() => import('recharts').then(mod => mod.AreaChart), { ssr: false });
const Line = dynamic(() => import('recharts').then(mod => mod.Line), { ssr: false });
const XAxis = dynamic(() => import('recharts').then(mod => mod.XAxis), { ssr: false });
const YAxis = dynamic(() => import('recharts').then(mod => mod.YAxis), { ssr: false });
const CartesianGrid = dynamic(() => import('recharts').then(mod => mod.CartesianGrid), { ssr: false });
const Tooltip = dynamic(() => import('recharts').then(mod => mod.Tooltip), { ssr: false });
const Area = dynamic(() => import('recharts').then(mod => mod.Area), { ssr: false });
const ResponsiveContainer = dynamic(() => import('recharts').then(mod => mod.ResponsiveContainer), { ssr: false });
const PieChart = dynamic(() => import('recharts').then(mod => mod.PieChart), { ssr: false });
const Pie = dynamic(() => import('recharts').then(mod => mod.Pie), { ssr: false });
const Cell = dynamic(() => import('recharts').then(mod => mod.Cell), { ssr: false });

interface CharitableGivingTabProps {
  portfolio: any;
}

export default function CharitableGivingTab({ portfolio }: CharitableGivingTabProps) {
  const [activeView, setActiveView] = useState('overview');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // Charitable giving data
  const givingHistory = [
    { year: 2020, amount: 12000, taxBenefit: 3200 },
    { year: 2021, amount: 15000, taxBenefit: 4050 },
    { year: 2022, amount: 18000, taxBenefit: 4860 },
    { year: 2023, amount: 22000, taxBenefit: 5940 },
    { year: 2024, amount: 25000, taxBenefit: 6750 }
  ];

  const currentYearGiving = {
    total: 25000,
    ytd: 18750,
    planned: 6250,
    taxSavings: 6750,
    percentOfIncome: 4.2,
    categories: [
      { name: 'Education', amount: 8000, percentage: 32 },
      { name: 'Healthcare', amount: 6000, percentage: 24 },
      { name: 'Environment', amount: 5000, percentage: 20 },
      { name: 'Social Services', amount: 4000, percentage: 16 },
      { name: 'Arts & Culture', amount: 2000, percentage: 8 }
    ]
  };

  const favoriteCharities = [
    {
      id: 1,
      name: 'United Way',
      category: 'Social Services',
      totalDonated: 45000,
      thisYear: 8000,
      impact: '180 families helped',
      rating: 4.8,
      taxDeductible: true
    },
    {
      id: 2,
      name: 'St. Jude Children\'s Hospital',
      category: 'Healthcare',
      totalDonated: 38000,
      thisYear: 6000,
      impact: '12 treatments funded',
      rating: 4.9,
      taxDeductible: true
    },
    {
      id: 3,
      name: 'Nature Conservancy',
      category: 'Environment',
      totalDonated: 28000,
      thisYear: 5000,
      impact: '500 acres protected',
      rating: 4.7,
      taxDeductible: true
    },
    {
      id: 4,
      name: 'Local Food Bank',
      category: 'Social Services',
      totalDonated: 22000,
      thisYear: 4000,
      impact: '8,000 meals provided',
      rating: 4.9,
      taxDeductible: true
    }
  ];

  const plannedGiving = [
    {
      id: 1,
      strategy: 'Donor-Advised Fund',
      amount: 50000,
      timeline: '2025',
      taxBenefit: 13500,
      status: 'In Setup',
      description: 'Establishing DAF for flexible charitable giving'
    },
    {
      id: 2,
      strategy: 'Charitable Remainder Trust',
      amount: 200000,
      timeline: '2030',
      taxBenefit: 54000,
      status: 'Planning',
      description: 'Create income stream while supporting education'
    },
    {
      id: 3,
      strategy: 'Bequest in Will',
      amount: 100000,
      timeline: 'Estate',
      taxBenefit: 40000,
      status: 'Documented',
      description: '10% of estate to charitable causes'
    }
  ];

  const impactMetrics = {
    totalLives: 2500,
    mealsProvided: 45000,
    studentsHelped: 120,
    acresProtected: 1200,
    medicalTreatments: 35
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  return (
    <div className="space-y-6">
      {/* View Navigation */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
        <div className="flex space-x-4 overflow-x-auto">
          {['overview', 'history', 'planning', 'impact'].map((view) => (
            <button
              key={view}
              onClick={() => setActiveView(view)}
              className={`px-4 py-2 rounded-lg font-medium capitalize whitespace-nowrap transition-colors ${
                activeView === view
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {view}
            </button>
          ))}
        </div>
      </div>

      {/* Overview Section */}
      {activeView === 'overview' && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg p-6 border border-purple-100 dark:border-purple-800">
              <div className="flex items-center justify-between mb-2">
                <Heart className="w-8 h-8 text-purple-600" />
                <span className="text-sm text-purple-600 dark:text-purple-400">+15%</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(currentYearGiving.total)}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Total Giving {selectedYear}</p>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg p-6 border border-green-100 dark:border-green-800">
              <div className="flex items-center justify-between mb-2">
                <DollarSign className="w-8 h-8 text-green-600" />
                <span className="text-sm text-green-600 dark:text-green-400">Saved</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(currentYearGiving.taxSavings)}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Tax Benefits</p>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-6 border border-blue-100 dark:border-blue-800">
              <div className="flex items-center justify-between mb-2">
                <Users className="w-8 h-8 text-blue-600" />
                <span className="text-sm text-blue-600 dark:text-blue-400">Impact</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{impactMetrics.totalLives.toLocaleString()}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Lives Impacted</p>
            </div>
            <div className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-lg p-6 border border-yellow-100 dark:border-yellow-800">
              <div className="flex items-center justify-between mb-2">
                <Award className="w-8 h-8 text-yellow-600" />
                <span className="text-sm text-yellow-600 dark:text-yellow-400">{currentYearGiving.percentOfIncome}%</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{favoriteCharities.length}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Charities Supported</p>
            </div>
          </div>

          {/* Giving by Category */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Giving by Category</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={currentYearGiving.categories}
                      dataKey="amount"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      label={({ name, percentage }) => `${name}: ${percentage}%`}
                    >
                      {currentYearGiving.categories.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Favorite Charities */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Favorite Charities</h3>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {favoriteCharities.map((charity) => (
                  <div key={charity.id} className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white">{charity.name}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{charity.category}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">{charity.impact}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900 dark:text-white">{formatCurrency(charity.thisYear)}</p>
                        <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                          <span>⭐ {charity.rating}</span>
                          {charity.taxDeductible && <span className="text-green-600 dark:text-green-400">✓ Tax</span>}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {/* History Section */}
      {activeView === 'history' && (
        <div className="space-y-6">
          {/* Giving Trend Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Charitable Giving History</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <Chart data={givingHistory}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value: number) => formatCurrency(value)}
                    contentStyle={{ backgroundColor: 'rgba(0, 0, 0, 0.8)', border: 'none', borderRadius: '8px' }}
                  />
                  <Area type="monotone" dataKey="amount" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.6} name="Total Given" />
                  <Area type="monotone" dataKey="taxBenefit" stroke="#10B981" fill="#10B981" fillOpacity={0.6} name="Tax Benefit" />
                </Chart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Given (5 Years)</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency(givingHistory.reduce((sum, year) => sum + year.amount, 0))}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Tax Savings</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency(givingHistory.reduce((sum, year) => sum + year.taxBenefit, 0))}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400">Average Annual</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency(givingHistory.reduce((sum, year) => sum + year.amount, 0) / givingHistory.length)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400">Growth Rate</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">20.5%</p>
              </div>
            </div>
          </div>

          {/* Year-by-Year Breakdown */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Detailed Giving Records</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Year</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Amount Given</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Tax Benefit</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Effective Rate</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">% of Income</th>
                  </tr>
                </thead>
                <tbody>
                  {givingHistory.map((year) => (
                    <tr key={year.year} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="py-3 px-4 text-sm text-gray-900 dark:text-white">{year.year}</td>
                      <td className="py-3 px-4 text-sm text-right text-gray-900 dark:text-white">{formatCurrency(year.amount)}</td>
                      <td className="py-3 px-4 text-sm text-right text-green-600 dark:text-green-400">{formatCurrency(year.taxBenefit)}</td>
                      <td className="py-3 px-4 text-sm text-right text-gray-900 dark:text-white">{((year.taxBenefit / year.amount) * 100).toFixed(1)}%</td>
                      <td className="py-3 px-4 text-sm text-right text-gray-900 dark:text-white">3.5%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Planning Section */}
      {activeView === 'planning' && (
        <div className="space-y-6">
          {/* Planned Giving Strategies */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <Target className="w-5 h-5 mr-2 text-purple-600" />
              Planned Giving Strategies
            </h3>
            <div className="space-y-4">
              {plannedGiving.map((plan) => (
                <div key={plan.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white">{plan.strategy}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{plan.description}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      plan.status === 'In Setup' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                      plan.status === 'Planning' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                      'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                    }`}>
                      {plan.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Amount</p>
                      <p className="font-semibold text-gray-900 dark:text-white">{formatCurrency(plan.amount)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Tax Benefit</p>
                      <p className="font-semibold text-green-600 dark:text-green-400">{formatCurrency(plan.taxBenefit)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Timeline</p>
                      <p className="font-semibold text-gray-900 dark:text-white">{plan.timeline}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Giving Calculator */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <BarChart className="w-5 h-5 mr-2 text-blue-600" />
              Tax-Efficient Giving Calculator
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Annual Giving Amount
                  </label>
                  <input
                    type="number"
                    defaultValue={25000}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Tax Bracket
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                    <option value="24">24%</option>
                    <option value="32">32%</option>
                    <option value="35">35%</option>
                    <option value="37">37%</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Giving Strategy
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                    <option>Cash Donation</option>
                    <option>Appreciated Stock</option>
                    <option>Donor-Advised Fund</option>
                    <option>Charitable Trust</option>
                  </select>
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Projected Benefits</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Tax Deduction</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{formatCurrency(6000)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Capital Gains Avoided</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{formatCurrency(1250)}</span>
                  </div>
                  <div className="flex justify-between pt-3 border-t border-gray-200 dark:border-gray-600">
                    <span className="font-medium text-gray-700 dark:text-gray-300">Total Tax Benefit</span>
                    <span className="font-bold text-green-600 dark:text-green-400">{formatCurrency(7250)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700 dark:text-gray-300">Effective Cost</span>
                    <span className="font-bold text-gray-900 dark:text-white">{formatCurrency(17750)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Impact Section */}
      {activeView === 'impact' && (
        <div className="space-y-6">
          {/* Impact Dashboard */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Your Impact Dashboard</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{impactMetrics.totalLives.toLocaleString()}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Lives Impacted</p>
              </div>
              <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <Heart className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{impactMetrics.mealsProvided.toLocaleString()}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Meals Provided</p>
              </div>
              <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <Award className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{impactMetrics.studentsHelped}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Students Helped</p>
              </div>
              <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <TrendingUp className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{impactMetrics.acresProtected.toLocaleString()}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Acres Protected</p>
              </div>
              <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <Heart className="w-8 h-8 text-red-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{impactMetrics.medicalTreatments}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Medical Treatments</p>
              </div>
            </div>
          </div>

          {/* Impact Stories */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Impact Stories</h3>
            <div className="space-y-4">
              <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Education Initiative Success</h4>
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                  Your contribution helped provide scholarships for 12 underprivileged students to attend college this year.
                  Three of them are now pursuing STEM degrees.
                </p>
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-purple-600 dark:text-purple-400">United Way Education Fund</span>
                  <span className="text-gray-500">•</span>
                  <span className="text-gray-600 dark:text-gray-400">March 2024</span>
                </div>
              </div>
              <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Environmental Protection</h4>
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                  The Nature Conservancy used your donations to protect 200 acres of critical wetland habitat,
                  preserving homes for 15 endangered species.
                </p>
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-green-600 dark:text-green-400">Nature Conservancy</span>
                  <span className="text-gray-500">•</span>
                  <span className="text-gray-600 dark:text-gray-400">February 2024</span>
                </div>
              </div>
              <div className="p-4 bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 rounded-lg">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Healthcare Access Expanded</h4>
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                  St. Jude's used contributions to provide free cancer treatment for 5 children whose families
                  couldn't afford care. All are now in remission.
                </p>
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-red-600 dark:text-red-400">St. Jude Children's Hospital</span>
                  <span className="text-gray-500">•</span>
                  <span className="text-gray-600 dark:text-gray-400">January 2024</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}