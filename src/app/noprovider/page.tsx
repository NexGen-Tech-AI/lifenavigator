export default function NoProviderPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
        <h1 className="text-2xl font-bold text-center mb-6">
          No Provider Test Page
        </h1>
        
        <p className="text-gray-600 mb-6">
          This page loads without any providers. If you can see this, the issue is with the providers.
        </p>
        
        <div className="space-y-4">
          <a 
            href="/working-login" 
            className="block w-full text-center bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
          >
            Go to Working Login
          </a>
          
          <a 
            href="/minimal-login" 
            className="block w-full text-center bg-gray-600 text-white py-2 px-4 rounded hover:bg-gray-700"
          >
            Go to Minimal Login
          </a>
          
          <a 
            href="/static-login.html" 
            className="block w-full text-center bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700"
          >
            Go to Static HTML Login
          </a>
        </div>
        
        <div className="mt-8 p-4 bg-blue-50 rounded">
          <p className="text-sm text-blue-800">
            <strong>Demo Credentials:</strong><br />
            Email: demo@lifenavigator.tech<br />
            Password: DemoPassword123
          </p>
        </div>
      </div>
    </div>
  );
}