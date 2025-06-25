import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Life Navigator
          </h1>
          <p className="text-2xl text-gray-600 dark:text-gray-300 mb-8">
            Your AI-Powered Life Management Platform
          </p>
          
          <div className="space-y-4">
            <Link
              href="/demo-welcome"
              className="inline-block px-8 py-4 bg-blue-600 text-white text-lg font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-lg"
            >
              Try Demo Account
            </Link>
            
            <p className="text-gray-600 dark:text-gray-400">
              or
            </p>
            
            <Link
              href="/auth/login"
              className="inline-block px-8 py-4 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-lg font-semibold rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors shadow-lg border border-gray-300 dark:border-gray-600"
            >
              Login with Demo Credentials
            </Link>
          </div>
          
          <div className="mt-12 bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 max-w-2xl mx-auto">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              Quick Demo Access
            </h2>
            <div className="bg-gray-100 dark:bg-gray-700 rounded p-4">
              <p className="text-gray-700 dark:text-gray-300">
                <strong>Email:</strong> demo@lifenavigator.tech<br />
                <strong>Password:</strong> DemoPassword123
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}