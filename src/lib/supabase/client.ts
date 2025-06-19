import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/types/supabase'
import { createMockClient } from './mock-client'

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  
  // Use mock client in development if Supabase is not configured
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    if (!url || !key || url.toLowerCase().includes('your-project') || url.toLowerCase().includes('your_project')) {
      console.log('🔧 Using mock Supabase client for development');
      return createMockClient() as any;
    }
  }

  if (!url || !key) {
    throw new Error('Supabase URL and Anon Key are required');
  }

  return createBrowserClient<Database>(url, key)
}