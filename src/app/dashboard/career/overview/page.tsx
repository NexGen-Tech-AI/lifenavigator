'use client';

import React, { useState, useEffect } from 'react';
import { 
  BriefcaseIcon, 
  AcademicCapIcon, 
  ChartBarIcon, 
  UserGroupIcon,
  ClockIcon,
  TrophyIcon,
  ArrowTrendingUpIcon,
  LightBulbIcon
} from '@heroicons/react/24/outline';
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface CareerOverview {
  currentRole: {
    title: string;
    company: string;
    duration: string;
    satisfaction: number;
  };
  careerProgress: {
    yearsExperience: number;
    rolesHeld: number;
    skillsAcquired: number;
    certificationsEarned: number;
  };
  careerGoals: Array<{
    id: string;
    goal: string;
    targetDate: string;
    progress: number;
    status: 'on-track' | 'at-risk' | 'completed';
  }>;
  salaryProgression: Array<{
    year: string;
    salary: number;
    role: string;
  }>;
  skillDistribution: Array<{
    category: string;
    value: number;
    color: string;
  }>;
}

export default function CareerOverviewPage() {
  const [overview, setOverview] = useState<CareerOverview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    const fetchOverview = async () => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setOverview({
        currentRole: {
          title: 'Senior Software Engineer',
          company: 'TechCorp Inc.',
          duration: '2 years 3 months',
          satisfaction: 85
        },
        careerProgress: {
          yearsExperience: 8,
          rolesHeld: 4,
          skillsAcquired: 42,
          certificationsEarned: 6
        },
        careerGoals: [
          { 
            id: '1', 
            goal: 'Become Engineering Manager', 
            targetDate: '2026-12-31', 
            progress: 65,
            status: 'on-track'
          },
          { 
            id: '2', 
            goal: 'Complete MBA Program', 
            targetDate: '2027-06-30', 
            progress: 30,
            status: 'on-track'
          },
          { 
            id: '3', 
            goal: 'Obtain AWS Solutions Architect Certification', 
            targetDate: '2025-09-30', 
            progress: 80,
            status: 'on-track'
          },
          { 
            id: '4', 
            goal: 'Build and Launch Side Project', 
            targetDate: '2025-12-31', 
            progress: 45,
            status: 'at-risk'
          }
        ],
        salaryProgression: [
          { year: '2017', salary: 65000, role: 'Junior Developer' },
          { year: '2019', salary: 85000, role: 'Developer' },
          { year: '2021', salary: 105000, role: 'Senior Developer' },
          { year: '2023', salary: 125000, role: 'Senior Software Engineer' },
          { year: '2025', salary: 140000, role: 'Senior Software Engineer' }
        ],
        skillDistribution: [
          { category: 'Technical', value: 40, color: '#3b82f6' },
          { category: 'Leadership', value: 20, color: '#10b981' },
          { category: 'Communication', value: 15, color: '#f59e0b' },
          { category: 'Problem Solving', value: 15, color: '#8b5cf6' },
          { category: 'Business', value: 10, color: '#ef4444' }
        ]
      });
      setLoading(false);
    };

    fetchOverview();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!overview) {
    return <div>Error loading career overview</div>;
  }

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
      case 'on-track': return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/20';
      case 'at-risk': return 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/20';
      case 'completed': return 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/20';
      default: return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900/20';
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Career Overview</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Track your professional journey and plan your future</p>
      </div>

      {/* Current Role Card */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl shadow-lg p-6 mb-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">{overview.currentRole.title}</h2>
            <p className="text-blue-100 mt-1">{overview.currentRole.company}</p>
            <p className="text-sm text-blue-200 mt-2">
              <ClockIcon className="inline-block w-4 h-4 mr-1" />
              {overview.currentRole.duration}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-blue-100">Job Satisfaction</p>
            <p className="text-3xl font-bold">{overview.currentRole.satisfaction}%</p>
          </div>
        </div>
      </div>

      {/* Career Progress Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Years Experience</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {overview.careerProgress.yearsExperience}
              </p>
            </div>
            <BriefcaseIcon className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Roles Held</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {overview.careerProgress.rolesHeld}
              </p>
            </div>
            <ChartBarIcon className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Skills Acquired</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {overview.careerProgress.skillsAcquired}
              </p>
            </div>
            <LightBulbIcon className="w-8 h-8 text-yellow-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Certifications</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {overview.careerProgress.certificationsEarned}
              </p>
            </div>
            <TrophyIcon className="w-8 h-8 text-purple-500" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Salary Progression Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Salary Progression
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={overview.salaryProgression}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="year" stroke="#9CA3AF" />
              <YAxis 
                stroke="#9CA3AF" 
                tickFormatter={(value) => formatCurrency(value)}
              />
              <Tooltip 
                formatter={(value: number) => formatCurrency(value)}
                contentStyle={{ 
                  backgroundColor: '#1F2937', 
                  border: 'none',
                  borderRadius: '0.5rem'
                }}
                labelStyle={{ color: '#E5E7EB' }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="salary" 
                stroke="#3B82F6" 
                strokeWidth={2}
                dot={{ fill: '#3B82F6' }}
                name="Salary"
              />
            </LineChart>
          </ResponsiveContainer>
          <div className="mt-4 flex items-center justify-center text-sm text-gray-500 dark:text-gray-400">
            <ArrowTrendingUpIcon className="w-4 h-4 mr-1 text-green-500" />
            Average yearly increase: 12.5%
          </div>
        </div>

        {/* Skill Distribution */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Skill Distribution
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={overview.skillDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ category, value }) => `${category}: ${value}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {overview.skillDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1F2937', 
                  border: 'none',
                  borderRadius: '0.5rem'
                }}
                labelStyle={{ color: '#E5E7EB' }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-2 gap-2">
              {overview.skillDistribution.map((skill) => (
                <div key={skill.category} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded"
                    style={{ backgroundColor: skill.color }}
                  ></div>
                  <span className="text-xs text-gray-600 dark:text-gray-400">
                    {skill.category}: {skill.value}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Career Goals */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Career Goals
        </h3>
        <div className="space-y-4">
          {overview.careerGoals.map((goal) => (
            <div key={goal.id} className="border-b border-gray-200 dark:border-gray-700 pb-4 last:border-0">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900 dark:text-white">{goal.goal}</h4>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(goal.status)}`}>
                  {goal.status.replace('-', ' ')}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-2">
                <span>Target: {new Date(goal.targetDate).toLocaleDateString()}</span>
                <span>{goal.progress}% complete</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${
                    goal.status === 'on-track' ? 'bg-green-500' :
                    goal.status === 'at-risk' ? 'bg-yellow-500' :
                    'bg-blue-500'
                  }`}
                  style={{ width: `${goal.progress}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}