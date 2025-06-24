/**
 * Supabase configuration with proper environment variable mapping
 * This ensures we use the correct variables regardless of Vercel's naming
 */

export const supabaseConfig = {
  // Public Supabase URL - accessible from client
  url: process.env.NEXT_PUBLIC_SUPABASE_URL || 
       process.env.SUPABASE_SUPABASE_URL || 
       process.env.SUPABASE_NEXT_PUBLIC_SUPABASE_URL ||
       '',
  
  // Anonymous key - accessible from client
  anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 
           process.env.SUPABASE_SUPABASE_ANON_KEY || 
           process.env.SUPABASE_NEXT_PUBLIC_SUPABASE_ANON_KEY ||
           process.env.NEXT_SUPABASE_ANON_KEY ||
           '',
  
  // Service role key - server-side only
  serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || 
                  process.env.SUPABASE_SUPABASE_SERVICE_ROLE_KEY ||
                  '',
  
  // Database URLs
  database: {
    url: process.env.DATABASE_URL || 
         process.env.SUPABASE_POSTGRES_URL ||
         process.env.POSTGRES_PRISMA_URL ||
         process.env.SUPABASE_POSTGRES_PRISMA_URL ||
         '',
    
    urlNonPooling: process.env.POSTGRES_URL_NON_POOLING || 
                   process.env.SUPABASE_POSTGRES_URL_NON_POOLING ||
                   '',
  },
  
  // JWT Secret (if needed for custom auth)
  jwtSecret: process.env.SUPABASE_JWT_SECRET || 
             process.env.SUPABASE_SUPABASE_JWT_SECRET
};

// Validation function
export function validateSupabaseConfig() {
  const errors: string[] = [];
  
  if (!supabaseConfig.url || supabaseConfig.url.includes('your-project')) {
    errors.push('NEXT_PUBLIC_SUPABASE_URL is not configured');
  }
  
  if (!supabaseConfig.anonKey || supabaseConfig.anonKey.includes('your-anon-key')) {
    errors.push('NEXT_PUBLIC_SUPABASE_ANON_KEY is not configured');
  }
  
  if (!supabaseConfig.serviceRoleKey || supabaseConfig.serviceRoleKey.includes('your-service-role-key')) {
    errors.push('SUPABASE_SERVICE_ROLE_KEY is not configured');
  }
  
  return errors;
}

// Check if Supabase is properly configured
export const isSupabaseConfigured = () => {
  return validateSupabaseConfig().length === 0;
};