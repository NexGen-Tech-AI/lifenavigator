'use client';

import Link from 'next/link';

export function SetupStatusBanner() {
  const isSupabaseConfigured = process.env.NEXT_PUBLIC_SUPABASE_URL && 
    process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://your-project.supabase.co';

  if (process.env.NODE_ENV !== 'development' || isSupabaseConfigured) {
    return null;
  }

  return (
    <div className="bg-blue-50 dark:bg-blue-900/20 border-b border-blue-200 dark:border-blue-800">
      <div className="px-4 py-3">
        <div className="flex items-center justify-center">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <strong>Setup Required:</strong> Supabase is not configured. OAuth login is disabled. 
              <Link 
                href="/SUPABASE_COMPLETE_SETUP_GUIDE.md" 
                className="ml-2 underline font-medium hover:text-blue-600 dark:hover:text-blue-300"
                target="_blank"
              >
                View setup guide →
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}