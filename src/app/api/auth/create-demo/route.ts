import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();
    
    // Create demo user if it doesn't exist
    const demoEmail = 'demo@lifenavigator.tech';
    const demoPassword = 'DemoPassword123';
    
    // Try to sign up the demo user
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: demoEmail,
      password: demoPassword,
      options: {
        data: {
          full_name: 'Demo User',
          username: 'demo_user'
        }
      }
    });
    
    if (signUpError && signUpError.message !== 'User already registered') {
      console.error('Error creating demo user:', signUpError);
      return NextResponse.json({ 
        error: 'Failed to create demo user',
        details: signUpError.message 
      }, { status: 500 });
    }
    
    // If user was created, also create their profile
    if (signUpData?.user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: signUpData.user.id,
          email: demoEmail,
          username: 'demo_user',
          full_name: 'Demo User',
          onboarding_completed: true
        });
        
      if (profileError) {
        console.error('Error creating demo profile:', profileError);
      }
    }
    
    return NextResponse.json({ 
      success: true,
      message: 'Demo account ready',
      credentials: {
        email: demoEmail,
        password: demoPassword
      }
    });
    
  } catch (error: any) {
    console.error('Error in create-demo:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error.message 
    }, { status: 500 });
  }
}