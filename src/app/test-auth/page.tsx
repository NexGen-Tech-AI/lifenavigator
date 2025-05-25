'use client';

import { signIn, signOut, useSession } from 'next-auth/react';
import { useState } from 'react';

export default function TestAuth() {
  const { data: session, status } = useSession();
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleTestLogin = async () => {
    setLoading(true);
    setResult(null);
    
    try {
      const res = await signIn('credentials', {
        redirect: false,
        email: 'demo@example.com',
        password: 'password',
      });
      
      setResult(res);
      console.log('Login result:', res);
    } catch (error) {
      console.error('Login error:', error);
      setResult({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h1>Authentication Test Page</h1>
      
      <h2>Session Status: {status}</h2>
      {session && (
        <pre>{JSON.stringify(session, null, 2)}</pre>
      )}
      
      <div style={{ marginTop: '20px' }}>
        {!session ? (
          <button 
            onClick={handleTestLogin} 
            disabled={loading}
            style={{ padding: '10px 20px', fontSize: '16px' }}
          >
            {loading ? 'Testing...' : 'Test Demo Login'}
          </button>
        ) : (
          <button 
            onClick={() => signOut()} 
            style={{ padding: '10px 20px', fontSize: '16px' }}
          >
            Sign Out
          </button>
        )}
      </div>
      
      {result && (
        <div style={{ marginTop: '20px' }}>
          <h3>Result:</h3>
          <pre style={{ 
            background: result.error ? '#ffcccc' : '#ccffcc', 
            padding: '10px',
            borderRadius: '5px'
          }}>
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}