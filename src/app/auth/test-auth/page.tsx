'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function TestAuthPage() {
  const [clientUser, setClientUser] = useState<any>(null);
  const [serverSession, setServerSession] = useState<any>(null);
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginResult, setLoginResult] = useState<any>(null);

  const supabase = createClient();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    setLoading(true);
    
    // Check client-side auth
    const { data: { user }, error } = await supabase.auth.getUser();
    setClientUser({ user, error: error?.message });
    
    // Check server-side session
    try {
      const sessionRes = await fetch('/api/auth/session');
      const sessionData = await sessionRes.json();
      setServerSession(sessionData);
    } catch (error) {
      setServerSession({ error: 'Failed to fetch session' });
    }
    
    // Get debug info
    try {
      const debugRes = await fetch('/api/auth/debug-session');
      const debugData = await debugRes.json();
      setDebugInfo(debugData);
    } catch (error) {
      setDebugInfo({ error: 'Failed to fetch debug info' });
    }
    
    setLoading(false);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginResult(null);
    
    console.log('[Test Auth] Starting login for:', email);
    
    try {
      // Try client-side login
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      const result = {
        clientLogin: {
          success: !error,
          error: error?.message,
          user: data.user?.email,
          session: !!data.session
        }
      };
      
      // Try server-side login
      try {
        const serverRes = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });
        const serverData = await serverRes.json();
        result.serverLogin = {
          success: serverRes.ok,
          status: serverRes.status,
          data: serverData
        };
      } catch (error) {
        result.serverLogin = { error: 'Failed to call server login' };
      }
      
      setLoginResult(result);
      
      // Refresh auth status after login
      setTimeout(checkAuth, 1000);
    } catch (error: any) {
      setLoginResult({ error: error.message });
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setTimeout(checkAuth, 1000);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold">Authentication Test Page</h1>
        
        {loading ? (
          <div>Loading...</div>
        ) : (
          <>
            {/* Current Auth Status */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">Current Auth Status</h2>
              
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium">Client-side User:</h3>
                  <pre className="bg-gray-100 p-2 rounded text-sm overflow-x-auto">
                    {JSON.stringify(clientUser, null, 2)}
                  </pre>
                </div>
                
                <div>
                  <h3 className="font-medium">Server-side Session:</h3>
                  <pre className="bg-gray-100 p-2 rounded text-sm overflow-x-auto">
                    {JSON.stringify(serverSession, null, 2)}
                  </pre>
                </div>
                
                <div>
                  <h3 className="font-medium">Debug Info:</h3>
                  <pre className="bg-gray-100 p-2 rounded text-sm overflow-x-auto">
                    {JSON.stringify(debugInfo, null, 2)}
                  </pre>
                </div>
              </div>
              
              <button
                onClick={checkAuth}
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Refresh Status
              </button>
              
              {clientUser?.user && (
                <button
                  onClick={handleLogout}
                  className="mt-4 ml-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  Logout
                </button>
              )}
            </div>
            
            {/* Login Test */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">Test Login</h2>
              
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md"
                    placeholder="test@example.com"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md"
                    placeholder="password"
                  />
                </div>
                
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                >
                  Test Login
                </button>
              </form>
              
              {loginResult && (
                <div className="mt-4">
                  <h3 className="font-medium">Login Result:</h3>
                  <pre className="bg-gray-100 p-2 rounded text-sm overflow-x-auto">
                    {JSON.stringify(loginResult, null, 2)}
                  </pre>
                </div>
              )}
            </div>
            
            {/* Test Endpoints */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">Test Endpoints</h2>
              
              <div className="space-x-2">
                <a
                  href="/api/auth/test"
                  target="_blank"
                  className="inline-block px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
                >
                  /api/auth/test
                </a>
                <a
                  href="/api/auth/session"
                  target="_blank"
                  className="inline-block px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
                >
                  /api/auth/session
                </a>
                <a
                  href="/api/auth/debug-session"
                  target="_blank"
                  className="inline-block px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
                >
                  /api/auth/debug-session
                </a>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}