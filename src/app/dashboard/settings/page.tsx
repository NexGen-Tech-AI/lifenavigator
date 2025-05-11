'use client';

import React from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function SettingsPage() {
  const { data: session } = useSession();
  const router = useRouter();

  const settingsSections = [
    {
      id: 'profile',
      name: 'Profile',
      description: 'Manage your personal information and profile settings',
      href: '/dashboard/settings/profile',
      icon: '=d',
    },
    {
      id: 'security',
      name: 'Security',
      description: 'Update your password and security preferences',
      href: '/dashboard/settings/security',
      icon: '=',
    },
    {
      id: 'preferences',
      name: 'Preferences',
      description: 'Configure display settings and app behavior',
      href: '/dashboard/settings/preferences',
      icon: '™',
    },
    {
      id: 'notifications',
      name: 'Notifications',
      description: 'Manage how and when we contact you',
      href: '/dashboard/settings/notifications',
      icon: '=',
    },
    {
      id: 'integrations',
      name: 'Integrations',
      description: 'Connect with third-party services and apps',
      href: '/dashboard/integrations',
      icon: '=',
    },
  ];

  return (
    <div className="py-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="mx-auto px-4 sm:px-6 md:px-8 max-w-6xl">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Settings</h1>
        </div>
        
        <div className="mt-6 grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {settingsSections.map((section) => (
            <Link
              key={section.id}
              href={section.href}
              className="relative block p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center mb-3">
                <span className="text-2xl mr-3">{section.icon}</span>
                <h2 className="text-lg font-medium text-gray-900 dark:text-white">{section.name}</h2>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">{section.description}</p>
            </Link>
          ))}
        </div>
        
        <div className="mt-10 bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Account Settings</h3>
          </div>
          <div className="px-6 py-4">
            <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">Email address</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{session?.user?.email || 'Email not available'}</p>
              </div>
              <button 
                className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                onClick={() => router.push('/dashboard/settings/profile')}
              >
                Update
              </button>
            </div>
            
            <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">Delete account</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Permanently delete your account and all data</p>
              </div>
              <button className="px-3 py-1 text-sm font-medium text-red-600 hover:text-red-500 border border-red-600 hover:border-red-500 rounded-md">
                Delete
              </button>
            </div>
            
            <div className="flex items-center justify-between py-3">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">Export data</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Download a copy of your personal data</p>
              </div>
              <button className="px-3 py-1 text-sm font-medium text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700">
                Export
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}