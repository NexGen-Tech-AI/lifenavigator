'use client';

import Link from 'next/link';

export default function HealthcareOverviewPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Healthcare Overview</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Your complete health summary</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link href="/dashboard/healthcare" className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow hover:shadow-lg transition-shadow">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Health Dashboard</h2>
          <p className="text-gray-600 dark:text-gray-400">View your complete health metrics and trends</p>
        </Link>
        
        <Link href="/dashboard/healthcare/appointments" className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow hover:shadow-lg transition-shadow">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Appointments</h2>
          <p className="text-gray-600 dark:text-gray-400">Manage your healthcare appointments</p>
        </Link>
        
        <Link href="/dashboard/healthcare/wellness" className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow hover:shadow-lg transition-shadow">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Wellness Center</h2>
          <p className="text-gray-600 dark:text-gray-400">Track fitness, nutrition, and wellness goals</p>
        </Link>
      </div>
    </div>
  );
}