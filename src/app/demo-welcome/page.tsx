import Link from 'next/link';

export default function DemoWelcomePage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Welcome to Life Navigator Demo
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Explore our AI-powered life management platform
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            Demo Account Access
          </h2>
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 mb-6">
            <p className="text-gray-700 dark:text-gray-300 mb-2">
              <strong>Email:</strong> demo@lifenavigator.tech
            </p>
            <p className="text-gray-700 dark:text-gray-300">
              <strong>Password:</strong> DemoPassword123
            </p>
          </div>
          <Link
            href="/auth/login"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Login to Demo Account
          </Link>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              🎯 What You Can Explore
            </h3>
            <ul className="space-y-2 text-gray-600 dark:text-gray-400">
              <li>✓ AI-powered financial planning and tracking</li>
              <li>✓ Career development roadmaps</li>
              <li>✓ Education planning and progress tracking</li>
              <li>✓ Healthcare management dashboard</li>
              <li>✓ Goal setting and achievement tracking</li>
              <li>✓ Secure document storage</li>
            </ul>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              🚀 Key Features
            </h3>
            <ul className="space-y-2 text-gray-600 dark:text-gray-400">
              <li>✓ Personalized AI recommendations</li>
              <li>✓ Real-time progress tracking</li>
              <li>✓ Secure data encryption</li>
              <li>✓ Multi-domain life management</li>
              <li>✓ Intuitive dashboard interface</li>
              <li>✓ Mobile-responsive design</li>
            </ul>
          </div>
        </div>

        <div className="mt-12 text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Ready to start managing your life better?
          </p>
          <Link
            href="/auth/register"
            className="inline-flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Create Your Own Account
          </Link>
        </div>
      </div>
    </div>
  );
}