import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export default async function Home() {
  const supabase = await createClient();
  
  // Get the user's session
  const { data: { user } } = await supabase.auth.getUser();

  // If user is not authenticated, redirect to login
  if (!user) {
    redirect('/auth/login');
  }

  // Get user profile to check setup status
  const { data: profile } = await supabase
    .from('users')
    .select('setup_completed')
    .eq('id', user.id)
    .single();

  // If user hasn't completed setup, redirect to onboarding
  if (profile && !profile.setup_completed) {
    redirect(`/onboarding/questionnaire?userId=${user.id}`);
  }

  // If user is authenticated and has completed setup, redirect to dashboard
  redirect('/dashboard');
}