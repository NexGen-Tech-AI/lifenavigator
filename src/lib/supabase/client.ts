import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/types/supabase'
import { createMockClient } from './mock-client'
import { supabaseConfig } from '@/config/supabase'

export function createClient() {
  const url = supabaseConfig.url;
  const key = supabaseConfig.anonKey;
  
  // Use mock client in development if Supabase is not configured
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    if (!url || !key || url.toLowerCase().includes('your-project') || url.toLowerCase().includes('your_project')) {
      console.log('🔧 Using mock Supabase client for development');
      return createMockClient() as any;
    }
  }

  if (!url || !key) {
    // In production, if env vars are missing, throw a more helpful error
    if (process.env.NODE_ENV === 'production') {
      console.error('Supabase configuration missing:', {
        url: url ? 'Set' : 'Missing',
        key: key ? 'Set' : 'Missing'
      });
    }
    throw new Error(`Supabase configuration missing. URL: ${url ? 'Set' : 'Missing'}, Key: ${key ? 'Set' : 'Missing'}`);
  }

  return createBrowserClient<Database>(url, key)
}