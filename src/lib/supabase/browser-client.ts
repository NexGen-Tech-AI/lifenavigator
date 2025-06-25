import { createBrowserClient as createSupabaseBrowserClient } from '@supabase/ssr'
import type { Database } from '@/types/supabase'

// Hardcoded values for immediate functionality
const SUPABASE_URL = "https://oxtivjctfyemoegxepzw.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im94dGl2amN0ZnllbW9lZ3hlcHp3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1MjIzNTAsImV4cCI6MjA2NjA5ODM1MH0.-SDX_rIM-8VCUbjJ_CyqOaeoBPbI8J3RYxcigDwkcGQ";

let browserClient: any = null;

export function createBrowserClient() {
  if (browserClient) {
    return browserClient;
  }

  console.log('[Supabase] Creating browser client with URL:', SUPABASE_URL);
  
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.error('[Supabase] Missing credentials');
    throw new Error('Supabase credentials not found');
  }

  try {
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