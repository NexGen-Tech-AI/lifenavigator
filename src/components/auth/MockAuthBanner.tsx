'use client';

export function MockAuthBanner() {
  if (process.env.NODE_ENV !== 'development' || 
      (process.env.NEXT_PUBLIC_SUPABASE_URL && 
       process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://your-project.supabase.co')) {
    return null;
  }

  return (
    <div className="bg-yellow-50 dark:bg-yellow-900/20 border-b border-yellow-200 dark:border-yellow-800">
      <div className="px-4 py-2">
        <p className="text-sm text-center text-yellow-800 dark:text-yellow-200">
          🔧 Running in development mode with mock authentication. 
          Use email: <code className="font-mono">demo@lifenavigator.ai</code> / password: <code className="font-mono">demo123</code>
        </p>
      </div>
    </div>
  );
}