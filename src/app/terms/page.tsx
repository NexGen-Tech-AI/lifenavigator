import Link from 'next/link';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Terms of Service</h1>
          
          <div className="prose prose-gray dark:prose-invert max-w-none">
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Last updated: {new Date().toLocaleDateString()}
            </p>

            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-6 mb-4">
              1. Acceptance of Terms
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              By accessing and using Life Navigator, you agree to be bound by these Terms of Service
              and all applicable laws and regulations.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-6 mb-4">
              2. Use of Service
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              You may use our service for lawful purposes only. You agree not to use the service
              in any way that violates any applicable laws or regulations.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-6 mb-4">
              3. User Accounts
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              You are responsible for maintaining the confidentiality of your account credentials
              and for all activities that occur under your account.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-6 mb-4">
              4. Intellectual Property
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              All content and materials available on Life Navigator are proprietary to us or our
              licensors and are protected by applicable intellectual property laws.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-6 mb-4">
              5. Limitation of Liability
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              We shall not be liable for any indirect, incidental, special, consequential, or
              punitive damages resulting from your use of or inability to use the service.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-6 mb-4">
              6. Contact Information
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              If you have any questions about these Terms, please contact us at
              legal@lifenavigator.ai
            </p>
          </div>

          <div className="mt-8">
            <Link
              href="/"
              className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}