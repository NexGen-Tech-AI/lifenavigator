'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export async function loginAction(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  
  console.log('Server action login attempt:', { email });
  
  const supabase = await createClient();
  
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  
  if (error) {
    return { error: error.message };
  }
  
  // Check if user has completed onboarding
  const { data: profile } = await supabase
    .from('users')
    .select('onboarding_completed')
    .eq('id', data.user.id)
    .single();
  
  if (profile?.onboarding_completed) {
    redirect('/dashboard');
  } else {
    redirect('/onboarding/questionnaire');
  }
}