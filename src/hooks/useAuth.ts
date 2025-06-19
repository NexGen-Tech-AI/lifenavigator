'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  loading: boolean;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: true
  });
  
  const supabase = createClient();

  useEffect(() => {
    // Get initial session
    supabase.auth.getUser().then(({ data: { user } }) => {
      setAuthState({ user, loading: false });
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthState({ user: session?.user ?? null, loading: false });
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  return {
    user: authState.user,
    loading: authState.loading,
    isAuthenticated: !!authState.user,
  };
}

// Compatibility wrapper for components expecting useSession format
export function useSession() {
  const { user, loading } = useAuth();
  
  return {
    data: user ? {
      user: {
        id: user.id,
        email: user.email,
        name: user.user_metadata?.name || user.email?.split('@')[0],
        image: user.user_metadata?.avatar_url,
      },
      expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    } : null,
    status: loading ? 'loading' : user ? 'authenticated' : 'unauthenticated',
  };
}

// Sign out function
export async function signOut() {
  const supabase = createClient();
  await supabase.auth.signOut();
  window.location.href = '/auth/login';
}

// Sign in function (for compatibility)
export async function signIn(provider?: string, options?: any) {
  if (provider === 'credentials' && options?.redirect === false) {
    // Handle credentials sign in (used in tests)
    const supabase = createClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email: options.email,
      password: options.password,
    });
    return { error: error?.message, ok: !error, data };
  }
  // For other cases, redirect to login
  window.location.href = '/auth/login';
}