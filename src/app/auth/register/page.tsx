import React from 'react';
import RegisterForm from './RegisterForm';
import Link from 'next/link';
import { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { MockAuthBanner } from '@/components/auth/MockAuthBanner';

// Metadata for the page
export const metadata: Metadata = {
  title: 'Register | Life Navigator',
  description: 'Create a new Life Navigator account',
};

export default async function RegisterPage() {
  // Check if user is already authenticated
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (user) {
    // Check if user has completed onboarding
    const { data: profile } = await supabase
      .from('users')
      .select('onboarding_completed')
      .eq('id', user.id)
      .single();
    
    if (profile?.onboarding_completed) {
      redirect('/dashboard');
    } else {
      redirect('/onboarding');
    }
  }
  
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
              Create your account
            </h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Or{' '}
              <Link 
                href="/auth/login" 
                className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
              >
                sign in to existing account
              </Link>
            </p>
          </div>

          {/* Registration Form */}
          <RegisterForm />

          {/* Footer */}
          <div className="mt-8 text-center text-sm text-gray-600 dark:text-gray-400">
            <p>
              By creating an account, you agree to our{' '}
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