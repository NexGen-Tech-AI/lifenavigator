export default function TestRenderPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Test Render Page
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          If you can see this, basic rendering is working.
        </p>
        <a 
          href="/auth/login"
          className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Go to Login
        </a>
      </div>
    </div>
  );
}