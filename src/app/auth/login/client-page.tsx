'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { MockAuthBanner } from '@/components/auth/MockAuthBanner';

export default function LoginClientPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  

  const handleLogin = async (e?: React.FormEvent | React.MouseEvent) => {
    
    console.log('[handleLogin] Function called!');
    console.log('[handleLogin] Email:', email);
    console.log('[handleLogin] Password:', password ? 'provided' : 'empty');
    
    // Prevent any default form submission
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    console.log('[Login] Attempting login with:', email);
    
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }
    
    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
        credentials: 'same-origin',
      });

      const result = await response.json();
      console.log('[Login] Response:', result);

      if (!response.ok) {
        throw new Error(result.error || 'Login failed');
      }

      console.log('[Login] Success! Redirecting...');
      setIsLoading(false);  // Reset loading state before redirect
      // Force a hard navigation to ensure cookies are set
      window.location.href = '/dashboard';
      
    } catch (err: any) {
      console.error('[Login] Error:', err);
      setError(err.message || 'An unexpected error occurred');
      setIsLoading(false);
    }
  };

  const useDemoCredentials = async () => {
    
    console.log('[Login] Using demo credentials');
    setEmail('demo@lifenavigator.tech');
    setPassword('DemoPassword123');
    
    // Automatically trigger login with demo credentials
    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email: 'demo@lifenavigator.tech', 
          password: 'DemoPassword123' 
        }),
        credentials: 'same-origin',
      });

      const result = await response.json();
      console.log('[Login] Demo response:', result);

      if (!response.ok) {
        throw new Error(result.error || 'Login failed');
      }

      console.log('[Login] Demo login success! Redirecting...');
      setIsLoading(false);  // Reset loading state before redirect
      window.location.href = '/dashboard';
      
    } catch (err: any) {
      console.error('[Login] Demo login error:', err);
      setError(err.message || 'An unexpected error occurred');
      setIsLoading(false);
    }
  };

  return (
    <>
      <MockAuthBanner />
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          {/* Logo/Branding */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center space-x-2">
              <img 
                src="/LifeNavigator.png" 
                alt="LifeNavigator Logo" 
                className="w-10 h-10"
                style={{ width: '40px', height: '40px', objectFit: 'contain' }}
              />
              <span className="text-2xl font-bold text-gray-900 dark:text-white">LifeNavigator</span>
            </Link>
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">
              Sign in to your account
            </h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Or{' '}
              <Link 
                href="/auth/register" 
                className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
              >
                create a new account
              </Link>
            </p>
          </div>

          {/* Login Form with proper form tag and submit prevention */}
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              console.log('[Form] Submit prevented');
              handleLogin();
              return false;
            }} 
            className="space-y-6"
          >
            <div className="rounded-md shadow-sm -space-y-px">
              <div>
                <label htmlFor="email" className="sr-only">
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="off"
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <div>
                <label htmlFor="password" className="sr-only">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  autoComplete="off"
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>

            {error && (
              <div className="rounded-md bg-red-50 dark:bg-red-900/20 p-4">
                <div className="text-sm text-red-800 dark:text-red-300">
                  {error}
                </div>
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={isLoading || !email || !password}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Signing in...' : 'Sign in'}
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div className="text-sm">
                <Link href="/auth/forgot-password" className="font-medium text-blue-600 hover:text-blue-500">
                  Forgot your password?
                </Link>
              </div>
              <div className="text-sm">
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('Demo button clicked!');
                    useDemoCredentials();
                  }}
                  disabled={isLoading}
                  className="font-medium text-blue-600 hover:text-blue-500 disabled:opacity-50"
                >
                  Use demo credentials
                </button>
              </div>
            </div>
          </form>

          {/* Footer */}
          <div className="mt-8 text-center text-sm text-gray-600 dark:text-gray-400">
            <p>
              By signing in, you agree to our{' '}
              <Link 
                href="/terms" 
                className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
              >
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link 
                href="/privacy" 
                className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
              >
                Privacy Policy
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}