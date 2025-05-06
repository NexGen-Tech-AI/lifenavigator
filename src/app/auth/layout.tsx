'use client';

import React from 'react';
import Image from 'next/image';
import { useTheme } from 'next-themes';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { theme, setTheme } = useTheme();
  
  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left panel - Branding/Illustration (larger on desktop) */}
      <div className="w-full md:w-1/2 bg-blue-600 dark:bg-blue-800 flex flex-col items-center justify-center p-8 text-white">
        <div className="max-w-md mx-auto text-center">
          <div className="mb-8">
            <div className="inline-flex items-center mb-4">
              <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center mr-3">
                <span className="text-blue-600 text-xl font-bold">L</span>
              </div>
              <h1 className="text-2xl font-bold">Life Navigator</h1>
            </div>
            <h2 className="text-3xl font-bold mb-4">Manage your life, all in one place</h2>
            <p className="text-blue-100 mb-8">
              Track your finances, career, education, and health with our comprehensive life management platform.
            </p>
          </div>
          
          <div className="relative w-full h-64 md:h-96 rounded-lg overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-t from-blue-700 to-transparent opacity-50 z-10" />
            {/* Placeholder for illustration - would be replaced with actual image in production */}
            <div className="absolute inset-0 flex items-center justify-center bg-blue-500 z-0">
              <svg className="w-24 h-24 text-blue-200 opacity-50" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
          
          <div className="mt-8 text-sm text-blue-100">
            <p>Trusted by 10,000+ users for their life planning needs</p>
          </div>
        </div>
      </div>
      
      {/* Right panel - Auth forms */}
      <div className="w-full md:w-1/2 bg-white dark:bg-gray-900 flex flex-col">
        <div className="flex justify-end p-4">
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>
        </div>
        
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="w-full max-w-md">
            {children}
          </div>
        </div>
        
        <div className="p-4 text-center text-sm text-gray-600 dark:text-gray-400">
          <p>© {new Date().getFullYear()} Life Navigator. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}