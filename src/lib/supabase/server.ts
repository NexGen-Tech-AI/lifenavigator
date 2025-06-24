import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from '@/types/supabase'
import { createMockClient } from './mock-client'
import { supabaseConfig } from '@/config/supabase'

/**
 * Creates a Supabase client for use in server components and API routes
 * This client handles cookie-based authentication automatically
 */
export async function createClient() {
  const url = supabaseConfig.url;
  const key = supabaseConfig.anonKey;
  
  
  // Use mock client in development if Supabase is not configured
  if (process.env.NODE_ENV === 'development') {
    if (!url || !key || url.toLowerCase().includes('your-project') || url.toLowerCase().includes('your_project')) {
      console.log('🔧 Using mock Supabase client for development (server)');
      return createMockClient() as any;
    }
  }

  if (!url || !key) {
    throw new Error('Server: Supabase URL and Anon Key are required');
  }

  const cookieStore = await cookies()

  return createServerClient<Database>(
    url,
    key,
    {
      cookies: {
        async get(name: string) {
          return cookieStore.get(name)?.value
        },
        async set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch (error) {
            // The `set` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
        async remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch (error) {
            // The `delete` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}

/**
 * Creates a Supabase client with service role privileges
 * WARNING: Only use this for admin operations, never expose to client
 */
export async function createServiceClient() {
  // Use mock client in development if Supabase is not configured
  if (process.env.NODE_ENV === 'development') {
    const url = supabaseConfig.url?.toLowerCase();
    if (!url || url.includes('your-project') || url.includes('your_project')) {
      return createMockClient() as any;
    }
  }

  const cookieStore = await cookies()

  return createServerClient<Database>(
    supabaseConfig.url,
    supabaseConfig.serviceRoleKey,
    {
      cookies: {
        async get(name: string) {
          return cookieStore.get(name)?.value
        },
        async set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch (error) {
            // Ignore errors from Server Components
          }
        },
        async remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch (error) {
            // Ignore errors from Server Components
          }
        },
      },
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )
}