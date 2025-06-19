import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { GetServerSidePropsContext } from 'next';

/**
 * Check if a user is authenticated for server-side requests
 */
export async function isAuthenticated(req: NextRequest | Request | null = null): Promise<boolean> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return !!user;
}

/**
 * Get the current user's ID if authenticated
 */
export async function getCurrentUserId(): Promise<string | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id || null;
}

/**
 * Get the current user
 */
export async function getCurrentUser() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error || !user) {
    return null;
  }
  
  // Get additional user data from database if needed
  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single();
  
  return {
    ...user,
    ...profile
  };
}

/**
 * Middleware to protect API routes
 */
export async function authMiddleware(req: NextRequest | Request): Promise<NextResponse | null> {
  const isAuthed = await isAuthenticated(req);
  
  if (!isAuthed) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  return null; // Continue with the request if authenticated
}

/**
 * Helper for protected pages in getServerSideProps
 */
export async function requireAuth(context: GetServerSidePropsContext) {
  // Note: This pattern is not recommended for Next.js App Router
  // Use middleware or server components instead
  
  // For now, return a redirect instruction
  // The actual auth check should be done in middleware
  return {
    redirect: {
      destination: '/auth/login',
      permanent: false,
    },
  };
}

/**
 * Attach user info to context
 */
export async function withAuthContext(_context: GetServerSidePropsContext) {
  // Note: This pattern is not recommended for Next.js App Router
  // Use server components to fetch user data instead
  return { props: { user: null } };
}