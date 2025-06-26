import { createBrowserClient as createSupabaseBrowserClient } from '@supabase/ssr'
import type { Database } from '@/types/supabase'
import { supabaseConfig } from '@/config/supabase'

let browserClient: any = null;

export function createBrowserClient() {
  if (browserClient) {
    return browserClient;
  }

  const SUPABASE_URL = supabaseConfig.url;
  const SUPABASE_ANON_KEY = supabaseConfig.anonKey;

  console.log('[Supabase] Creating browser client with URL:', SUPABASE_URL);
  
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.error('[Supabase] Missing credentials');
    throw new Error('Supabase credentials not found');
  }

  try {
    // Create browser client without deprecated cookies option
    // The SSR package handles cookies automatically in the browser
    browserClient = createSupabaseBrowserClient<Database>(
      SUPABASE_URL,
      SUPABASE_ANON_KEY
    );
    console.log('[Supabase] Browser client created successfully');
    return browserClient;
  } catch (error) {
    console.error('[Supabase] Failed to create browser client:', error);
    throw error;
  }
}