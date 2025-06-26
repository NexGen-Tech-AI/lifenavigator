'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function TestAuthPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [email, setEmail] = useState('demo@lifenavigator.tech')
  const [password, setPassword] = useState('DemoPassword123')
  const [logs, setLogs] = useState<string[]>([])
  
  const supabase = createClient()
  
  const addLog = (message: string) => {
    console.log(message)
    setLogs(prev => [...prev, `${new Date().toISOString()}: ${message}`])
  }
  
  useEffect(() => {
    checkAuth()
  }, [])
  
  const checkAuth = async () => {
    addLog('Checking authentication...')
    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      if (error) {
        addLog(`Auth check error: ${error.message}`)
      } else {
        addLog(`Current user: ${user?.email || 'none'}`)
      }
      setUser(user)
    } catch (error: any) {
      addLog(`Error checking auth: ${error.message}`)
    }
    setLoading(false)
  }
  
  const handleLogin = async () => {
    addLog(`Attempting login with ${email}...`)
    setLoading(true)
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      
      if (error) {
        addLog(`Login error: ${error.message}`)
      } else {
        addLog(`Login successful: ${data.user?.email}`)
        addLog(`Session expires: ${data.session?.expires_at}`)
        
        // Wait a moment then check auth again
        setTimeout(() => {
          checkAuth()
          addLog('Redirecting to dashboard in 2 seconds...')
          setTimeout(() => {
            window.location.href = '/dashboard'
          }, 2000)
        }, 1000)
      }
    } catch (error: any) {
      addLog(`Unexpected error: ${error.message}`)
    }
    
    setLoading(false)
  }
  
  const handleLogout = async () => {
    addLog('Logging out...')
    const { error } = await supabase.auth.signOut()
    if (error) {
      addLog(`Logout error: ${error.message}`)
    } else {
      addLog('Logged out successfully')
    }
    checkAuth()
  }
  
  return (
    <div style={{ 
      padding: '40px', 
      maxWidth: '800px', 
      margin: '0 auto',
      backgroundColor: '#f5f5f5',
      minHeight: '100vh'
    }}>
      <h1>Authentication Test Page</h1>
      
      <div style={{ 
        background: 'white', 
        padding: '20px', 
        borderRadius: '8px',
        marginBottom: '20px'
      }}>
        <h2>Current Status</h2>
        <p><strong>Loading:</strong> {loading ? 'Yes' : 'No'}</p>
        <p><strong>User:</strong> {user ? user.email : 'Not authenticated'}</p>
        <p><strong>User ID:</strong> {user ? user.id : 'N/A'}</p>
      </div>
      
      {!user && (
        <div style={{ 
          background: 'white', 
          padding: '20px', 
          borderRadius: '8px',
          marginBottom: '20px'
        }}>
          <h2>Login</h2>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            style={{ 
              width: '100%', 
              padding: '10px', 
              marginBottom: '10px',
              border: '1px solid #ddd',
              borderRadius: '4px'
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
              border: '1px solid #ddd',
              borderRadius: '4px'
            }}
          />
          <button
            onClick={handleLogin}
            disabled={loading}
            style={{ 
              width: '100%', 
              padding: '10px', 
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1
            }}
          >
            {loading ? 'Processing...' : 'Login'}
          </button>
        </div>
      )}
      
      {user && (
        <div style={{ 
          background: 'white', 
          padding: '20px', 
          borderRadius: '8px',
          marginBottom: '20px'
        }}>
          <h2>Actions</h2>
          <button
            onClick={handleLogout}
            style={{ 
              padding: '10px 20px', 
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              marginRight: '10px'
            }}
          >
            Logout
          </button>
          <button
            onClick={() => window.location.href = '/dashboard'}
            style={{ 
              padding: '10px 20px', 
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Go to Dashboard
          </button>
        </div>
      )}
      
      <div style={{ 
        background: 'white', 
        padding: '20px', 
        borderRadius: '8px',
        marginBottom: '20px'
      }}>
        <h2>Debug Logs</h2>
        <div style={{ 
          background: '#f8f9fa', 
          padding: '10px', 
          borderRadius: '4px',
          fontFamily: 'monospace',
          fontSize: '12px',
          maxHeight: '300px',
          overflow: 'auto'
        }}>
          {logs.map((log, i) => (
            <div key={i}>{log}</div>
          ))}
        </div>
      </div>
      
      <div style={{ 
        background: 'white', 
        padding: '20px', 
        borderRadius: '8px'
      }}>
        <h2>Quick Links</h2>
        <a href="/auth/login" style={{ marginRight: '20px' }}>Login Page</a>
        <a href="/dashboard" style={{ marginRight: '20px' }}>Dashboard</a>
        <a href="/api/auth/debug-session" style={{ marginRight: '20px' }}>Debug Session API</a>
      </div>
    </div>
  )
}