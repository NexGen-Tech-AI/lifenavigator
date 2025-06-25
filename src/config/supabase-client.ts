/**
 * Client-specific Supabase configuration
 * This file ensures environment variables are properly available in the browser
 */

// For production deployment, use the actual values
const PRODUCTION_CONFIG = {
  url: "https://oxtivjctfyemoegxepzw.supabase.co",
  anonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im94dGl2amN0ZnllbW9lZ3hlcHp3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1MjIzNTAsImV4cCI6MjA2NjA5ODM1MH0.-SDX_rIM-8VCUbjJ_CyqOaeoBPbI8J3RYxcigDwkcGQ"
};

export function getSupabaseConfig() {
  // Try environment variables first
  const envUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const envKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  // Use env vars if available, otherwise use production config
  return {
    url: envUrl || PRODUCTION_CONFIG.url,
    anonKey: envKey || PRODUCTION_CONFIG.anonKey
  };
}