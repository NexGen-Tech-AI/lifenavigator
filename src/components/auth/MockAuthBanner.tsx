'use client';

export function MockAuthBanner() {
  // In production, this banner should never show
  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  // Only show in development when using mock auth
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const isUsingMockAuth = !supabaseUrl || 
                         supabaseUrl.includes('your-project') || 
                         supabaseUrl.includes('your_project');
  
  if (!isUsingMockAuth) {
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