import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export default async function Home() {
  // Check if we're in demo mode
  const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';
  const skipAuth = process.env.NEXT_PUBLIC_SKIP_AUTH === 'true';
  
  // In demo mode, redirect straight to dashboard
  if (isDemoMode && skipAuth) {
    redirect('/dashboard');
  }
  
  const supabase = await createClient();
  
  // Get the user's session
  const { data: { user } } = await supabase.auth.getUser();

  // If user is not authenticated, redirect to login
  if (!user) {
    redirect('/auth/login');
  }

  // Get user profile to check onboarding status
  const { data: profile } = await supabase
    .from('profiles')
    .select('onboarding_completed')
    .eq('id', user.id)
    .single();

  // If user hasn't completed onboarding, redirect to onboarding
  if (profile && !profile.onboarding_completed) {
    redirect('/onboarding');
  }

  // If user is authenticated and has completed setup, redirect to dashboard
  redirect('/dashboard');
}