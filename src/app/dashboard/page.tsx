'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useUser } from '@/hooks/useUser';
import LoadingSpinner from '@/components/ui/loaders/LoadingSpinner';
import { useAccounts } from '@/hooks/useAccounts';
import DailySchedule from '@/components/calendar/DailySchedule';
import { getTodayEvents } from '@/lib/mock/calendarEvents';
import AppThumbnails from '@/components/dashboard/AppThumbnails';

export default function Dashboard() {
  const { user, profile, loading: authLoading } = useUser();
  const { summary, isLoading: accountsLoading } = useAccounts();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !accountsLoading) {
      setLoading(false);
    }
  }, [authLoading, accountsLoading]);

  if (authLoading || loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center p-8">
        <p className="text-gray-600 dark:text-gray-400">
          You must be logged in to view this page
        </p>
        <Link href="/auth/login" className="text-blue-600 hover:text-blue-500 mt-4 inline-block">
          Go to Login
        </Link>
      </div>
    );
  }

  // Calculate financial stats from real data
  const netWorth = summary?.netWorth || 0;
  const totalAssets = summary?.totalAssets || 0;
  const totalLiabilities = summary?.totalLiabilities || 0;

  // Domain summaries with real data where available
  const domainSummaries = [
    {
      title: 'Financial Overview',
      stats: [
        { 
          label: 'Net Worth', 
          value: `$${netWorth.toLocaleString()}`, 
          trend: netWorth > 0 ? 'up' : 'down', 
          percent: '12%' 
        },
        { 
          label: 'Total Assets', 
          value: `$${totalAssets.toLocaleString()}`, 
          trend: 'up', 
          percent: '5%' 
        },
        { 
          label: 'Total Liabilities', 
          value: `$${totalLiabilities.toLocaleString()}`, 
          trend: 'down', 
          percent: '3%' 
        },
      ],
      insights: profile?.is_demo_account 
        ? 'This is demo data. Connect your real accounts to see actual insights.'
        : 'Your financial health is improving. Consider reviewing your investment strategy.',
      link: '/dashboard/finance',
      color: 'from-blue-500 to-purple-600',
    },
    {
      title: 'Healthcare Status',
      stats: [
        { label: 'Next Appointment', value: 'Apr 15', trend: 'neutral' },
        { label: 'Wellness Score', value: '82/100', trend: 'up', percent: '3pts' },
        { label: 'Medications Due', value: '2', trend: 'neutral' },
      ],
      insights: 'Annual physical due in 2 months. Schedule your flu shot for optimal protection.',
      link: '/dashboard/healthcare',
      color: 'from-green-500 to-teal-600',
    },
    {
      title: 'Career Progress',
      stats: [
        { label: 'Skill Growth', value: '15%', trend: 'up' },
        { label: 'Network Size', value: '342', trend: 'up', percent: '12' },
        { label: 'Applications', value: '5 Active', trend: 'neutral' },
      ],
      insights: 'Your profile views increased by 30% this month. Update your portfolio with recent projects.',
      link: '/dashboard/career',
      color: 'from-orange-500 to-red-600',
    },
    {
      title: 'Education Journey',
      stats: [
        { label: 'Courses Active', value: '3', trend: 'neutral' },
        { label: 'Completion Rate', value: '78%', trend: 'up', percent: '5%' },
        { label: 'Study Streak', value: '12 days', trend: 'up' },
      ],
      insights: 'You\'re ahead of schedule in 2 courses. Consider starting the advanced module.',
      link: '/dashboard/education',
      color: 'from-indigo-500 to-blue-600',
    },
  ];

  // Recent activities
  const recentActivities = [
    { icon: '💰', text: 'Budget alert: Entertainment spending at 85%', time: '2 hours ago', type: 'warning' },
    { icon: '📚', text: 'Course milestone completed: React Advanced Patterns', time: '5 hours ago', type: 'success' },
    { icon: '🏥', text: 'Prescription refill reminder: Medication XYZ', time: '1 day ago', type: 'info' },
    { icon: '💼', text: 'New job match: Senior Developer at TechCorp', time: '2 days ago', type: 'success' },
  ];

  // Today's events
  const todayEvents = getTodayEvents();

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Welcome Header */}
      <div className="mb-8 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Welcome back, {profile?.name || user.email?.split('@')[0]}!
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Here's your life overview for today
          </p>
        </div>
        <a
          href="/auth/logout"
          className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
        >
          Logout
        </a>
      </div>

      {/* Domain Summaries Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {domainSummaries.map((domain, index) => (
          <Link
            key={index}
            href={domain.link}
            className="block bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden"
          >
            <div className={`h-2 bg-gradient-to-r ${domain.color}`} />
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">{domain.title}</h2>
              
              <div className="grid grid-cols-3 gap-4 mb-4">
                {domain.stats.map((stat, statIndex) => (
                  <div key={statIndex} className="flex flex-col">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{stat.label}</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">{stat.value}</p>
                    {stat.trend !== 'neutral' && (
                      <div className="flex items-center gap-1 mt-1">
                        <span className={`text-xs ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                          {stat.trend === 'up' ? '↑' : '↓'}
                        </span>
                        <span className="text-xs text-gray-600 dark:text-gray-400">
                          {stat.percent}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              
              <p className="text-sm text-gray-600 dark:text-gray-400 italic">
                {domain.insights}
              </p>
            </div>
          </Link>
        ))}
      </div>

      {/* Today's Schedule and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Schedule */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Today's Schedule</h2>
          <DailySchedule events={todayEvents} />
        </div>

        {/* Recent Activity */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
          <div className="space-y-3">
            {recentActivities.map((activity, index) => (
              <div key={index} className="flex items-start space-x-3">
                <span className="text-2xl">{activity.icon}</span>
                <div className="flex-1">
                  <p className="text-sm">{activity.text}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
          <Link
            href="/dashboard/insights"
            className="block mt-4 text-center text-sm text-blue-600 hover:text-blue-500"
          >
            View all activities →
          </Link>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Link
            href="/dashboard/finance?action=add-account"
            className="flex flex-col items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
          >
            <span className="text-3xl mb-2">🏦</span>
            <span className="text-sm">Add Account</span>
          </Link>
          <Link
            href="/dashboard/finance/transactions"
            className="flex flex-col items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
          >
            <span className="text-3xl mb-2">💳</span>
            <span className="text-sm">Add Transaction</span>
          </Link>
          <Link
            href="/dashboard/healthcare/appointments"
            className="flex flex-col items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
          >
            <span className="text-3xl mb-2">📅</span>
            <span className="text-sm">Book Appointment</span>
          </Link>
          <Link
            href="/dashboard/finance/assets"
            className="flex flex-col items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
          >
            <span className="text-3xl mb-2">🏠</span>
            <span className="text-sm">Manage Assets</span>
          </Link>
        </div>
      </div>

      {/* Upcoming Features - Netflix Style Thumbnails */}
      <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <AppThumbnails />
      </div>
    </div>
  );
}