'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import LoadingSpinner from '@/components/ui/loaders/LoadingSpinner';

export default function Dashboard() {
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Simple loading effect to ensure session is available
    if (status === 'loading') {
      return;
    }
    
    if (status === 'unauthenticated') {
      setError('You must be logged in to view this page');
      setLoading(false);
      return;
    }
    
    // Set user data from session
    if (session?.user) {
      setUserData({
        name: session.user.name || 'User',
        email: session.user.email,
        id: session.user.id
      });
    }
    
    setLoading(false);
  }, [session, status]);

  // Domain summaries with default data
  const domainSummaries = [
    {
      title: 'Financial Overview',
      stats: [
        { label: 'Net Worth', value: '$127,492', trend: 'up', percent: '12%' },
        { label: 'Monthly Expenses', value: '$3,250', trend: 'down', percent: '5%' },
        { label: 'Investment Return', value: '9.2%', trend: 'up', percent: '1.5%' },
      ],
      insights: 'Your retirement savings are ahead of target by 8%. Consider rebalancing your portfolio this quarter.',
      link: '/dashboard/finance',
      color: 'from-emerald-500 to-teal-400',
    },
    {
      title: 'Career Progress',
      stats: [
        { label: 'Skills Growth', value: '7/10', trend: 'up', percent: '15%' },
        { label: 'Network Reach', value: '342', trend: 'up', percent: '23%' },
        { label: 'Industry Position', value: 'Mid-Senior', trend: 'neutral', percent: '0%' },
      ],
      insights: 'Enhancing your leadership skills could position you for a promotion in the next 6 months.',
      link: '/dashboard/career',
      color: 'from-purple-500 to-indigo-400',
    },
    {
      title: 'Education Tracking',
      stats: [
        { label: 'Courses Complete', value: '8/12', trend: 'up', percent: '25%' },
        { label: 'Certifications', value: '3', trend: 'neutral', percent: '0%' },
        { label: 'Learning Hours', value: '48', trend: 'up', percent: '10%' },
      ],
      insights: "You're on track to complete your current certification within 45 days.",
      link: '/dashboard/education',
      color: 'from-amber-500 to-yellow-400',
    },
    {
      title: 'Health Metrics',
      stats: [
        { label: 'Wellness Score', value: '82/100', trend: 'up', percent: '4%' },
        { label: 'Activity Level', value: '7.5/10', trend: 'up', percent: '12%' },
        { label: 'Sleep Quality', value: '6.8/10', trend: 'down', percent: '3%' },
      ],
      insights: 'Your recent exercise routine is showing positive results. Focus on improving sleep quality.',
      link: '/dashboard/healthcare',
      color: 'from-rose-500 to-red-400',
    },
  ];

  // Actions for quick access
  const quickActions = [
    { name: 'Update Budget', icon: '💰', href: '/dashboard/finance/budget' },
    { name: 'Track Investments', icon: '📈', href: '/dashboard/finance/investments' },
    { name: 'Log Exercise', icon: '🏃', href: '/dashboard/healthcare/wellness' },
    { name: 'Secure Documents', icon: '🔒', href: '/dashboard/healthcare/documents' },
    { name: 'View Learning Path', icon: '📚', href: '/dashboard/education/progress' },
    { name: 'Network Connections', icon: '👥', href: '/dashboard/career/networking' },
  ];

  // Show loading spinner while fetching user data
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  // Show error message if fetching user data failed
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="p-4 bg-red-100 dark:bg-red-900/30 rounded-lg text-red-800 dark:text-red-200 max-w-md text-center">
          <p className="text-lg font-medium">{error}</p>
          <p className="mt-2">Please try refreshing the page or contact support if the problem persists.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="mx-auto px-4 sm:px-6 md:px-8">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white sr-only">Dashboard</h1>
        <p className="text-lg text-gray-700 dark:text-gray-300 font-medium">
          Welcome back, {userData?.name || 'User'}! Here's your life at a glance.
        </p>
      </div>
      
      <div className="mx-auto px-4 sm:px-6 md:px-8">
        {/* Quick Actions */}
        <div className="mt-6">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">Quick Actions</h2>
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
            {quickActions.map((action) => (
              <Link
                key={action.name}
                href={action.href}
                className="relative flex items-center space-x-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-3 shadow-sm hover:shadow transition-all"
              >
                <div className="flex-shrink-0 text-2xl">{action.icon}</div>
                <div className="min-w-0 flex-1">
                  <span className="absolute inset-0" aria-hidden="true" />
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{action.name}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Domain Summaries */}
        <div className="mt-8 grid gap-6 grid-cols-1 lg:grid-cols-2">
          {domainSummaries.map((domain) => (
            <div
              key={domain.title}
              className="bg-white dark:bg-gray-800 overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700 shadow"
            >
              <div className={`bg-gradient-to-r ${domain.color} h-2`} />
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">{domain.title}</h3>
                  <Link 
                    href={domain.link}
                    className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                  >
                    View details
                  </Link>
                </div>
                
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {domain.stats.map((stat) => (
                    <div key={stat.label} className="overflow-hidden rounded-lg bg-gray-50 dark:bg-gray-700/40 px-4 py-3">
                      <dt className="truncate text-sm font-medium text-gray-500 dark:text-gray-400">{stat.label}</dt>
                      <dd className="mt-1 flex items-baseline">
                        <p className="text-xl font-semibold text-gray-900 dark:text-white">{stat.value}</p>
                        <p
                          className={`ml-2 flex items-baseline text-xs font-semibold ${
                            stat.trend === 'up' ? 'text-green-600 dark:text-green-400' :
                            stat.trend === 'down' ? 'text-red-600 dark:text-red-400' :
                            'text-gray-500 dark:text-gray-400'
                          }`}
                        >
                          {stat.trend === 'up' && (
                            <svg className="h-3 w-3 flex-shrink-0 self-center text-green-500" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                              <path fillRule="evenodd" d="M10 17a.75.75 0 01-.75-.75V5.612L5.29 9.77a.75.75 0 01-1.08-1.04l5.25-5.5a.75.75 0 011.08 0l5.25 5.5a.75.75 0 11-1.08 1.04l-3.96-4.158V16.25A.75.75 0 0110 17z" clipRule="evenodd" />
                            </svg>
                          )}
                          {stat.trend === 'down' && (
                            <svg className="h-3 w-3 flex-shrink-0 self-center text-red-500" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                              <path fillRule="evenodd" d="M10 3a.75.75 0 01.75.75v10.638l3.96-4.158a.75.75 0 111.08 1.04l-5.25 5.5a.75.75 0 01-1.08 0l-5.25-5.5a.75.75 0 111.08-1.04l3.96 4.158V3.75A.75.75 0 0110 3z" clipRule="evenodd" />
                            </svg>
                          )}
                          <span className="sr-only">{stat.trend === 'up' ? 'Increased' : stat.trend === 'down' ? 'Decreased' : 'Unchanged'} by</span>
                          {stat.percent}
                        </p>
                      </dd>
                    </div>
                  ))}
                </div>
                
                <div className="mt-4 bg-blue-50 dark:bg-blue-900/20 rounded-md p-3">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    <span className="font-medium">Insight:</span> {domain.insights}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Recommendations */}
        <div className="mt-8">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">Recommended Actions</h2>
          <div className="mt-3">
            <div className="overflow-hidden bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow">
              <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                <li className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-yellow-100 text-yellow-600 dark:bg-yellow-800/30 dark:text-yellow-400">
                        💳
                      </span>
                      <p className="ml-3 text-sm font-medium text-gray-900 dark:text-white">Review credit card spending - 23% higher than usual</p>
                    </div>
                    <Link
                      href="/dashboard/finance/transactions"
                      className="ml-6 rounded-md bg-white dark:bg-gray-700 px-3 py-1 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500 border border-gray-200 dark:border-gray-600"
                    >
                      Review
                    </Link>
                  </div>
                </li>
                <li className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-800/30 dark:text-green-400">
                        💰
                      </span>
                      <p className="ml-3 text-sm font-medium text-gray-900 dark:text-white">Retirement contribution increase recommended</p>
                    </div>
                    <Link
                      href="/dashboard/finance/retirement"
                      className="ml-6 rounded-md bg-white dark:bg-gray-700 px-3 py-1 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500 border border-gray-200 dark:border-gray-600"
                    >
                      Adjust
                    </Link>
                  </div>
                </li>
                <li className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-800/30 dark:text-blue-400">
                        👔
                      </span>
                      <p className="ml-3 text-sm font-medium text-gray-900 dark:text-white">3 new job opportunities match your profile</p>
                    </div>
                    <Link
                      href="/dashboard/career/opportunities"
                      className="ml-6 rounded-md bg-white dark:bg-gray-700 px-3 py-1 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500 border border-gray-200 dark:border-gray-600"
                    >
                      View
                    </Link>
                  </div>
                </li>
                <li className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100 text-purple-600 dark:bg-purple-800/30 dark:text-purple-400">
                        🩺
                      </span>
                      <p className="ml-3 text-sm font-medium text-gray-900 dark:text-white">Annual physical check-up due in 2 weeks</p>
                    </div>
                    <Link
                      href="/dashboard/healthcare/preventive"
                      className="ml-6 rounded-md bg-white dark:bg-gray-700 px-3 py-1 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500 border border-gray-200 dark:border-gray-600"
                    >
                      Schedule
                    </Link>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}