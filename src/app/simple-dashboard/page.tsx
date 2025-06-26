'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function SimpleDashboard() {
  const [user, setUser] = useState<any>(null);
  const supabase = createClient();
  
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });
  }, []);
  
  return (
    <div style={{ padding: '40px', background: '#000', color: '#fff' }}>
      <h1>Simple Dashboard</h1>
      <p>If you see this, routing works!</p>
      <p>User: {user ? user.email : 'Not authenticated'}</p>
      <p>User ID: {user ? user.id : 'N/A'}</p>
      
      <div style={{ marginTop: '40px' }}>
        <h2>Debug Info:</h2>
        <p>Hostname: {typeof window !== 'undefined' ? window.location.hostname : 'SSR'}</p>
        <p>Demo Mode Detection: {
          typeof window !== 'undefined' && (
            window.location.hostname.includes('demo') ||
            window.location.hostname.includes('mrxm1q5s5')
          ) ? 'YES' : 'NO'
        }</p>
      </div>
      
      <div style={{ marginTop: '40px' }}>
        <a href="/auth-test" style={{ color: '#00ff00' }}>Go to Auth Test</a>
      </div>
    </div>
  );
}