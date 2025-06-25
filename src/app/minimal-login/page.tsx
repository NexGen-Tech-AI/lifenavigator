'use client';

import { useState } from 'react';

export default function MinimalLoginPage() {
  const [status, setStatus] = useState('');

  const handleLogin = async () => {
    setStatus('Logging in...');
    
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'demo@lifenavigator.ai',
          password: 'demo123'
        }),
      });
      
      if (res.ok) {
        setStatus('Success! Redirecting...');
        window.location.href = '/dashboard';
      } else {
        setStatus('Login failed');
      }
    } catch (err) {
      setStatus('Error occurred');
    }
  };

  return (
    <html>
      <body style={{ margin: 0, padding: 20, fontFamily: 'Arial, sans-serif' }}>
        <div style={{ maxWidth: 400, margin: '0 auto', textAlign: 'center' }}>
          <h1>Minimal Login</h1>
          <p>This page bypasses all providers and complexity</p>
          
          <div style={{ marginTop: 20, padding: 20, backgroundColor: '#f0f0f0', borderRadius: 8 }}>
            <p><strong>Demo Credentials:</strong></p>
            <p>Email: demo@lifenavigator.ai</p>
            <p>Password: demo123</p>
          </div>
          
          <button
            onClick={handleLogin}
            style={{
              marginTop: 20,
              padding: '10px 20px',
              fontSize: 16,
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: 4,
              cursor: 'pointer'
            }}
          >
            Login with Demo Account
          </button>
          
          {status && (
            <p style={{ marginTop: 20, color: status.includes('Success') ? 'green' : 'red' }}>
              {status}
            </p>
          )}
        </div>
      </body>
    </html>
  );
}