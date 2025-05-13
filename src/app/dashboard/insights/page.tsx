'use client';

import { useState } from 'react';
import Link from 'next/link';
import { CalendarIcon, ChartBarIcon, DocumentTextIcon, SparklesIcon } from '@heroicons/react/24/outline';

export default function InsightsComingSoonPage() {
  return (
    <div className="h-full w-full flex flex-col items-center justify-center p-8 text-center">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8 flex justify-center">
          <div className="p-4 bg-blue-100 dark:bg-blue-900/30 rounded-full">
            <SparklesIcon className="h-16 w-16 text-blue-500 dark:text-blue-400" />
          </div>
        </div>
        
        <h1 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">
          AI-Powered Insights Coming Soon
        </h1>
        
        <p className="text-lg mb-8 text-gray-600 dark:text-gray-300">
          We're working on powerful AI analytics to provide personalized insights across all areas of your life.
        </p>
        
        <div className="grid md:grid-cols-3 gap-6 mb-10">
          <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <ChartBarIcon className="h-10 w-10 text-blue-500 mb-4 mx-auto" />
            <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Financial Trends</h2>
            <p className="text-gray-600 dark:text-gray-300">Detailed analysis of your spending habits and investment performance.</p>
          </div>
          
          <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <CalendarIcon className="h-10 w-10 text-blue-500 mb-4 mx-auto" />
            <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Time Optimization</h2>
            <p className="text-gray-600 dark:text-gray-300">Smart schedule suggestions and productivity insights.</p>
          </div>
          
          <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <DocumentTextIcon className="h-10 w-10 text-blue-500 mb-4 mx-auto" />
            <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Goal Tracking</h2>
            <p className="text-gray-600 dark:text-gray-300">Progress analytics and personalized recommendations for your goals.</p>
          </div>
        </div>
        
        <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg border border-blue-100 dark:border-blue-800 mb-8">
          <h3 className="text-lg font-semibold mb-2 text-blue-800 dark:text-blue-300">
            We're launching soon!
          </h3>
          <p className="text-blue-700 dark:text-blue-200">
            The Insights dashboard is currently in development and will be available in the next update.
            Check back soon for personalized AI-powered analytics across all areas of your life.
          </p>
        </div>
        
        <div className="flex justify-center space-x-4">
          <Link 
            href="/dashboard" 
            className="px-5 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-md font-medium transition-colors"
          >
            Back to Dashboard
          </Link>
          
          <Link 
            href="/dashboard/download" 
            className="px-5 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md font-medium transition-colors"
          >
            Join Desktop Waitlist
          </Link>
        </div>
      </div>
    </div>
  );
}