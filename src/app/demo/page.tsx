'use client'

import { DEMO_USER, DEMO_FINANCIAL_PROFILE } from '@/lib/demo/demo-data'
import Link from 'next/link'

export default function DemoPage() {
  // Calculate financial stats from demo data
  const netWorth = DEMO_FINANCIAL_PROFILE.home_value - DEMO_FINANCIAL_PROFILE.home_mortgage + 
                   DEMO_FINANCIAL_PROFILE.checking_account + DEMO_FINANCIAL_PROFILE.savings_account +
                   DEMO_FINANCIAL_PROFILE.brokerage_account + DEMO_FINANCIAL_PROFILE.retirement_401k + 
                   DEMO_FINANCIAL_PROFILE.ira_roth - DEMO_FINANCIAL_PROFILE.car_loan
  
  const totalAssets = DEMO_FINANCIAL_PROFILE.checking_account + DEMO_FINANCIAL_PROFILE.savings_account +
                      DEMO_FINANCIAL_PROFILE.brokerage_account + DEMO_FINANCIAL_PROFILE.retirement_401k + 
                      DEMO_FINANCIAL_PROFILE.ira_roth + DEMO_FINANCIAL_PROFILE.home_value + 
                      DEMO_FINANCIAL_PROFILE.car_value
  
  const totalLiabilities = DEMO_FINANCIAL_PROFILE.home_mortgage + DEMO_FINANCIAL_PROFILE.car_loan

  const domainSummaries = [
    {
      title: 'Financial Overview',
      stats: [
        { 
          label: 'Net Worth', 
          value: `$${netWorth.toLocaleString()}`, 
          trend: 'up', 
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
      insights: 'Demo data showing a healthy financial profile with diversified assets.',
      link: '/demo/finance',
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
      link: '/demo/healthcare',
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
      link: '/demo/career',
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
      link: '/demo/education',
      color: 'from-indigo-500 to-blue-600',
    },
  ]

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Welcome to Life Navigator Demo
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Explore {DEMO_USER.name}'s life dashboard - {DEMO_USER.occupation} in {DEMO_USER.location}
        </p>
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

      {/* Quick Actions */}
      <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Explore Demo Features</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Link
            href="/demo/finance/accounts"
            className="flex flex-col items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
          >
            <span className="text-3xl mb-2">🏦</span>
            <span className="text-sm">View Accounts</span>
          </Link>
          <Link
            href="/demo/finance/transactions"
            className="flex flex-col items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
          >
            <span className="text-3xl mb-2">💳</span>
            <span className="text-sm">Transactions</span>
          </Link>
          <Link
            href="/demo/healthcare/appointments"
            className="flex flex-col items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
          >
            <span className="text-3xl mb-2">📅</span>
            <span className="text-sm">Appointments</span>
          </Link>
          <Link
            href="/demo/finance/retirement"
            className="flex flex-col items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
          >
            <span className="text-3xl mb-2">🎯</span>
            <span className="text-sm">Retirement Plan</span>
          </Link>
        </div>
      </div>
    </div>
  )
}