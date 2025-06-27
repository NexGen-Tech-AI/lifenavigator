'use client';

import { useState, useEffect } from 'react';
import { Target, TrendingUp, Calendar, DollarSign, AlertTriangle, CheckCircle, Plus, Edit2, Trash2 } from 'lucide-react';
import dynamic from 'next/dynamic';

const Chart = dynamic(() => import('recharts').then(mod => mod.LineChart), { ssr: false });
const Line = dynamic(() => import('recharts').then(mod => mod.Line), { ssr: false });
const XAxis = dynamic(() => import('recharts').then(mod => mod.XAxis), { ssr: false });
const YAxis = dynamic(() => import('recharts').then(mod => mod.YAxis), { ssr: false });
const CartesianGrid = dynamic(() => import('recharts').then(mod => mod.CartesianGrid), { ssr: false });
const Tooltip = dynamic(() => import('recharts').then(mod => mod.Tooltip), { ssr: false });
const ResponsiveContainer = dynamic(() => import('recharts').then(mod => mod.ResponsiveContainer), { ssr: false });
const BarChart = dynamic(() => import('recharts').then(mod => mod.BarChart), { ssr: false });
const Bar = dynamic(() => import('recharts').then(mod => mod.Bar), { ssr: false });

interface GoalsTrackingTabProps {
  portfolio: any;
}

export default function GoalsTrackingTab({ portfolio }: GoalsTrackingTabProps) {
  const [goals, setGoals] = useState<any[]>([]);
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    try {
      const response = await fetch('/api/financial/investments/goals');
      const data = await response.json();
      setGoals(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching goals:', error);
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
  };

  const calculateMonthsRemaining = (targetDate: string) => {
    const target = new Date(targetDate);
    const now = new Date();
    const months = (target.getFullYear() - now.getFullYear()) * 12 + target.getMonth() - now.getMonth();
    return Math.max(0, months);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'on_track':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'at_risk':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'behind':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'Low':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  // Calculate goal projections
  const calculateProjection = (goal: any) => {
    const data = [];
    const monthsRemaining = calculateMonthsRemaining(goal.targetDate);
    let currentAmount = goal.currentAmount;
    const monthlyGrowthRate = 0.007; // 7% annual return / 12 months

    for (let month = 0; month <= monthsRemaining; month++) {
      data.push({
        month,
        projected: Math.round(currentAmount),
        required: Math.round(goal.currentAmount + (goal.targetAmount - goal.currentAmount) * (month / monthsRemaining))
      });
      currentAmount = currentAmount * (1 + monthlyGrowthRate) + goal.monthlyContribution;
    }

    return data;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Summary statistics
  const totalGoalAmount = goals.reduce((sum, goal) => sum + goal.targetAmount, 0);
  const totalCurrentAmount = goals.reduce((sum, goal) => sum + goal.currentAmount, 0);
  const totalMonthlyContribution = goals.reduce((sum, goal) => sum + goal.monthlyContribution, 0);
  const overallProgress = (totalCurrentAmount / totalGoalAmount) * 100;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-6 border border-blue-100 dark:border-blue-800">
          <div className="flex items-center justify-between mb-2">
            <Target className="w-8 h-8 text-blue-600" />
            <span className="text-sm text-blue-600 dark:text-blue-400">{goals.length} Goals</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(totalGoalAmount)}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Total Goal Amount</p>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg p-6 border border-green-100 dark:border-green-800">
          <div className="flex items-center justify-between mb-2">
            <DollarSign className="w-8 h-8 text-green-600" />
            <span className="text-sm text-green-600 dark:text-green-400">{overallProgress.toFixed(1)}%</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(totalCurrentAmount)}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Current Progress</p>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg p-6 border border-purple-100 dark:border-purple-800">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-8 h-8 text-purple-600" />
            <span className="text-sm text-purple-600 dark:text-purple-400">Monthly</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(totalMonthlyContribution)}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Total Contributions</p>
        </div>
        <div className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-lg p-6 border border-yellow-100 dark:border-yellow-800">
          <div className="flex items-center justify-between mb-2">
            <Calendar className="w-8 h-8 text-yellow-600" />
            <span className="text-sm text-yellow-600 dark:text-yellow-400">Gap</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(totalGoalAmount - totalCurrentAmount)}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Remaining to Save</p>
        </div>
      </div>

      {/* Goals List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Financial Goals</h3>
          <button
            onClick={() => setShowAddGoal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Goal
          </button>
        </div>

        <div className="space-y-4">
          {goals.map((goal) => (
            <div key={goal.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white text-lg">{goal.name}</h4>
                  <div className="flex items-center gap-3 mt-1">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(goal.status)}`}>
                      {goal.status.replace(/_/g, ' ')}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(goal.priority)}`}>
                      {goal.priority} Priority
                    </span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {formatDate(goal.targetDate)} ({calculateMonthsRemaining(goal.targetDate)} months)
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setSelectedGoal(goal)}
                    className="p-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
                  <span>Progress</span>
                  <span>{formatCurrency(goal.currentAmount)} / {formatCurrency(goal.targetAmount)}</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full transition-all duration-500 ${
                      goal.status === 'on_track' ? 'bg-gradient-to-r from-green-500 to-emerald-500' :
                      goal.status === 'at_risk' ? 'bg-gradient-to-r from-yellow-500 to-orange-500' :
                      'bg-gradient-to-r from-red-500 to-pink-500'
                    }`}
                    style={{ width: `${goal.progress}%` }}
                  />
                </div>
              </div>

              {/* Goal Details */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-gray-600 dark:text-gray-400">Monthly Contribution</p>
                  <p className="font-semibold text-gray-900 dark:text-white">{formatCurrency(goal.monthlyContribution)}</p>
                </div>
                <div>
                  <p className="text-gray-600 dark:text-gray-400">Required Monthly</p>
                  <p className="font-semibold text-gray-900 dark:text-white">{formatCurrency(goal.requiredMonthlyContribution)}</p>
                </div>
                <div>
                  <p className="text-gray-600 dark:text-gray-400">Projected Shortfall</p>
                  <p className={`font-semibold ${goal.projectedShortfall > 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                    {formatCurrency(goal.projectedShortfall)}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 dark:text-gray-400">Completion</p>
                  <p className="font-semibold text-gray-900 dark:text-white">{goal.progress.toFixed(1)}%</p>
                </div>
              </div>

              {/* Show projection chart for selected goal */}
              {selectedGoal?.id === goal.id && (
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <h5 className="font-medium text-gray-900 dark:text-white mb-3">Goal Projection</h5>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <Chart data={calculateProjection(goal)}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" label={{ value: 'Months', position: 'insideBottom', offset: -5 }} />
                        <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
                        <Tooltip formatter={(value: number) => formatCurrency(value)} />
                        <Line type="monotone" dataKey="projected" stroke="#3B82F6" strokeWidth={2} name="Projected" />
                        <Line type="monotone" dataKey="required" stroke="#10B981" strokeWidth={2} strokeDasharray="5 5" name="Required" />
                      </Chart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {/* Recommendations */}
              {goal.status !== 'on_track' && (
                <div className={`mt-4 p-3 rounded-lg ${
                  goal.status === 'at_risk' ? 'bg-yellow-50 dark:bg-yellow-900/20' : 'bg-red-50 dark:bg-red-900/20'
                }`}>
                  <div className="flex items-start">
                    <AlertTriangle className={`w-5 h-5 mr-2 flex-shrink-0 mt-0.5 ${
                      goal.status === 'at_risk' ? 'text-yellow-600' : 'text-red-600'
                    }`} />
                    <div>
                      <p className={`text-sm font-medium ${
                        goal.status === 'at_risk' ? 'text-yellow-800 dark:text-yellow-200' : 'text-red-800 dark:text-red-200'
                      }`}>
                        Action Required
                      </p>
                      <p className={`text-sm mt-1 ${
                        goal.status === 'at_risk' ? 'text-yellow-700 dark:text-yellow-300' : 'text-red-700 dark:text-red-300'
                      }`}>
                        Increase monthly contribution by {formatCurrency(goal.requiredMonthlyContribution - goal.monthlyContribution)} to meet your goal.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Goals Overview Chart */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Goals Progress Overview</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={goals}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
              <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(value: number) => formatCurrency(value)} />
              <Bar dataKey="currentAmount" fill="#3B82F6" name="Current" />
              <Bar dataKey="targetAmount" fill="#E5E7EB" name="Target" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Add Goal Modal */}
      {showAddGoal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Add New Goal</h3>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Goal Name</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="e.g., Dream Vacation"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Target Amount</label>
                <input
                  type="number"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="50000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Target Date</label>
                <input
                  type="date"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Monthly Contribution</label>
                <input
                  type="number"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="1000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Priority</label>
                <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowAddGoal(false)}
                  className="flex-1 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add Goal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}