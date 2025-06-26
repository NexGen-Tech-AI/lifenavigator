'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function AuthTestPage() {
  const [email, setEmail] = useState('demo@lifenavigator.tech');
  const [password, setPassword] = useState('DemoPassword123');
  const [status, setStatus] = useState('');
  const [user, setUser] = useState<any>(null);
  const [logs, setLogs] = useState<string[]>([]);
  
  const supabase = createClient();
  
  const addLog = (message: string) => {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message}`;
    console.log(logMessage);
    setLogs(prev => [...prev, logMessage]);
  };
  
  useEffect(() => {
    checkCurrentUser();
    checkSupabaseConfig();
  }, []);
  
  const checkSupabaseConfig = () => {
    addLog('Checking Supabase configuration...');
    addLog(`NEXT_PUBLIC_SUPABASE_URL: ${process.env.NEXT_PUBLIC_SUPABASE_URL || 'NOT SET'}`);
    addLog(`Has ANON_KEY: ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'YES' : 'NO'}`);
  };
  
  const checkCurrentUser = async () => {
    addLog('Checking current user...');
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) {
        addLog(`Error getting user: ${error.message}`);
        setStatus('Not authenticated');
      } else if (user) {
        addLog(`Current user: ${user.email}`);
        setUser(user);
        setStatus(`Authenticated as ${user.email}`);
      } else {
        addLog('No user found');
        setStatus('Not authenticated');
      }
    } catch (error: any) {
      addLog(`Exception: ${error.message}`);
      setStatus(`Error: ${error.message}`);
    }
  };
  
  const testLogin = async () => {
    addLog(`Attempting login with ${email}...`);
    setStatus('Logging in...');
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        addLog(`Login error: ${error.message}`);
        setStatus(`Login failed: ${error.message}`);
        
        // If user doesn't exist, try to create it
        if (error.message.includes('Invalid login credentials')) {
          addLog('User might not exist, trying to create...');
          await createDemoUser();
        }
      } else {
        addLog(`Login successful! User: ${data.user?.email}`);
        addLog(`Session: ${data.session ? 'Created' : 'No session'}`);
        setStatus(`Logged in as ${data.user?.email}`);
        setUser(data.user);
        
        // Test if session persists
        setTimeout(() => {
          addLog('Checking if session persists...');
          checkCurrentUser();
        }, 2000);
      }
    } catch (error: any) {
      addLog(`Exception during login: ${error.message}`);
      setStatus(`Error: ${error.message}`);
    }
  };
  
  const createDemoUser = async () => {
    addLog('Creating demo user...');
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: 'Demo User'
          }
        }
      });
      
      if (error) {
        addLog(`Signup error: ${error.message}`);
        setStatus(`Failed to create user: ${error.message}`);
      } else {
        addLog(`User created: ${data.user?.email}`);
        setStatus('User created! Try logging in again.');
      }
    } catch (error: any) {
      addLog(`Exception during signup: ${error.message}`);
      setStatus(`Error: ${error.message}`);
    }
  };
  
  const testLogout = async () => {
    addLog('Logging out...');
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        addLog(`Logout error: ${error.message}`);
      } else {
        addLog('Logged out successfully');
        setUser(null);
        setStatus('Logged out');
      }
    } catch (error: any) {
      addLog(`Exception during logout: ${error.message}`);
    }
  };
  
  const navigateToDashboard = () => {
    addLog('Navigating to dashboard...');
    window.location.href = '/dashboard';
  };
  
  return (
    <div style={{ 
      padding: '40px', 
      maxWidth: '1000px', 
      margin: '0 auto',
      fontFamily: 'monospace'
    }}>
      <h1>🔍 Authentication Debug Page</h1>
      
      <div style={{ 
        background: '#f0f0f0', 
        padding: '20px', 
        borderRadius: '8px',
        marginBottom: '20px'
      }}>
        <h2>Current Status</h2>
        <p><strong>Status:</strong> {status}</p>
        <p><strong>User:</strong> {user ? `${user.email} (${user.id})` : 'None'}</p>
        <p><strong>Environment:</strong> {process.env.NODE_ENV}</p>
      </div>
      
      <div style={{ 
        background: '#e8f4f8', 
        padding: '20px', 
        borderRadius: '8px',
        marginBottom: '20px'
      }}>
        <h2>Test Login</h2>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          style={{ 
            width: '100%', 
            padding: '10px', 
            marginBottom: '10px',
            fontSize: '16px'
          }}
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          style={{ 
            width: '100%', 
            padding: '10px', 
            marginBottom: '10px',
            fontSize: '16px'
          }}
        />
        <div>
          <button 
            onClick={testLogin}
            style={{ 
              padding: '10px 20px', 
              marginRight: '10px',
              background: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            Test Login
          </button>
          <button 
            onClick={createDemoUser}
            style={{ 
              padding: '10px 20px', 
              marginRight: '10px',
              background: '#2196F3',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            Create Demo User
          </button>
          {user && (
            <>
              <button 
                onClick={testLogout}
                style={{ 
                  padding: '10px 20px', 
                  marginRight: '10px',
                  background: '#f44336',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '16px'
                }}
              >
                Logout
              </button>
              <button 
                onClick={navigateToDashboard}
                style={{ 
                  padding: '10px 20px', 
                  background: '#9C27B0',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '16px'
                }}
              >
                Go to Dashboard
              </button>
            </>
          )}
        </div>
      </div>
      
      <div style={{ 
        background: '#333', 
        color: '#0f0',
        padding: '20px', 
        borderRadius: '8px',
        maxHeight: '400px',
        overflow: 'auto'
      }}>
        <h2>Debug Logs</h2>
        <pre style={{ margin: 0 }}>
          {logs.map((log, i) => (
            <div key={i}>{log}</div>
          ))}
        </pre>
      </div>
      
      <div style={{ marginTop: '20px' }}>
        <h3>Quick Links:</h3>
        <a href="/api/auth/debug-session" target="_blank" style={{ marginRight: '20px' }}>
          Debug Session API
        </a>
        <a href="/auth/login" style={{ marginRight: '20px' }}>
          Login Page
        </a>
        <a href="/dashboard" style={{ marginRight: '20px' }}>
          Dashboard
        </a>
      </div>
    </div>
  );
}