import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/types/supabase'
import { createMockClient } from './mock-client'
import { getSupabaseConfig } from '@/config/supabase-client'

let clientInstance: any = null;

export function createClient() {
  // Return cached instance if available
  if (clientInstance) {
    return clientInstance;
  }

  // Use client-specific config that handles env vars properly
  const { url, anonKey: key } = getSupabaseConfig();
  
  // Use mock client in development if Supabase is not configured
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    if (!url || !key || url.toLowerCase().includes('your-project') || url.toLowerCase().includes('your_project')) {
      console.log('🔧 Using mock Supabase client for development');
      clientInstance = createMockClient();
      return clientInstance as any;
    }
  }

  if (!url || !key) {
    // In production, if env vars are missing, log error and return mock client
    console.error('Supabase configuration missing:', {
      url: url ? 'Set' : 'Missing',
      key: key ? 'Set' : 'Missing',
      env: process.env.NODE_ENV
    });
    
    // Return mock client to prevent app from crashing
    if (typeof window !== 'undefined') {
      console.warn('Using mock client due to missing configuration');
      clientInstance = createMockClient();
      return clientInstance as any;
    }
    
    throw new Error(`Supabase configuration missing. URL: ${url ? 'Set' : 'Missing'}, Key: ${key ? 'Set' : 'Missing'}`);
  }

  try {
    clientInstance = createBrowserClient<Database>(url, key);
    return clientInstance;
  } catch (error) {
    console.error('Failed to create Supabase client:', error);
    // Return mock client on error
    clientInstance = createMockClient();
    return clientInstance as any;
  }
}