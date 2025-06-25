'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function WaitlistPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [referralCode, setReferralCode] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // For now, just show success - you can integrate with a service later
    console.log('Waitlist submission:', { email, referralCode });
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
        <div className="max-w-md w-full text-center">
          <div className="mb-8">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 dark:bg-green-900">
              <svg className="h-8 w-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-4">
            You're on the list!
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
            We'll notify you at <span className="font-semibold">{email}</span> when we launch.
          </p>
          <div className="space-y-4">
            <Link
              href="/auth/login"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              Try Demo Account
            </Link>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Use email: demo@lifenavigator.ai<br />
              Password: demo123
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <img 
            src="/LifeNavigator.png" 
            alt="Life Navigator" 
            className="mx-auto h-16 w-16 mb-4"
          />
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">
            Join the Life Navigator Waitlist
          </h2>
          <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
            Be the first to experience AI-powered life management
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Email address
            </label>
            <input
              type="email"
              id="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label htmlFor="referral" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Referral code (optional)
            </label>
            <input
              type="text"
              id="referral"
              value={referralCode}
              onChange={(e) => setReferralCode(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              placeholder="Enter referral code"
            />
          </div>

          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Join Waitlist
          </button>

          <div className="text-center">
            <Link
              href="/auth/login"
              className="text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
            >
              Already have access? Sign in
            </Link>
          </div>
        </form>

        <div className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-8">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            What to expect:
          </h3>
          <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
            <li className="flex items-start">
              <svg className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              AI-powered financial planning and insights
            </li>
            <li className="flex items-start">
              <svg className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Comprehensive health and wellness tracking
            </li>
            <li className="flex items-start">
              <svg className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Career development and education guidance
            </li>
            <li className="flex items-start">
              <svg className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Secure document storage and management
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}