'use client';

import { useState } from 'react';

export default function TestLoginPage() {
  const [status, setStatus] = useState('');
  
  const testLogin = async () => {
    setStatus('Testing...');
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'demo@lifenavigator.ai',
          password: 'demo123'
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setStatus('Success! Redirecting...');
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 1000);
      } else {
        setStatus(`Error: ${data.error}`);
      }
    } catch (error) {
      setStatus(`Error: ${error}`);
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl mb-4">Test Login</h1>
        <button
          onClick={testLogin}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Test Demo Login
        </button>
        <p className="mt-4">{status}</p>
      </div>
    </div>
  );
}