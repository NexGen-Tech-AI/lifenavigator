'use client';

import { useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function ForceLogoutPage() {
  useEffect(() => {
    async function forceLogout() {
      // Clear all localStorage
      if (typeof window !== 'undefined') {
        localStorage.clear();
        sessionStorage.clear();
        
        // Clear all cookies
        document.cookie.split(";").forEach(function(c) { 
          document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
        });
        
        // Sign out from Supabase
        const supabase = createClient();
        await supabase.auth.signOut();
        
        // Force redirect to login
        window.location.href = '/auth/login';
      }
    }
    
    forceLogout();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Logging out...
        </h1>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
      </div>
    </div>
  );
}