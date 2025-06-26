import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function GET() {
  // Use service role key to create user
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  
  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json({ 
      error: 'Missing Supabase configuration',
      hasUrl: !!supabaseUrl,
      hasServiceKey: !!serviceRoleKey 
    }, { status: 500 });
  }
  
  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
  
  try {
    // Create or update demo user
    const demoEmail = 'demo@lifenavigator.tech';
    const demoPassword = 'DemoPassword123';
    
    // Check if user exists
    const { data: { users } } = await supabase.auth.admin.listUsers();
    const existingUser = users.find(u => u.email === demoEmail);
    
    if (existingUser) {
      // Update password
      const { error: updateError } = await supabase.auth.admin.updateUserById(
        existingUser.id,
        { password: demoPassword }
      );
      
      if (updateError) {
        return NextResponse.json({ 
          error: 'Failed to update user password',
          details: updateError.message 
        }, { status: 500 });
      }
      
      return NextResponse.json({ 
        message: 'Demo user already exists, password updated',
        userId: existingUser.id,
        email: demoEmail
      });
    } else {
      // Create new user
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email: demoEmail,
        password: demoPassword,
        email_confirm: true,
        user_metadata: {
          full_name: 'Demo User'
        }
      });
      
      if (createError) {
        return NextResponse.json({ 
          error: 'Failed to create user',
          details: createError.message 
        }, { status: 500 });
      }
      
      // Create profile
      if (newUser.user) {
        await supabase
          .from('profiles')
          .upsert({
            id: newUser.user.id,
            email: demoEmail,
            full_name: 'Demo User',
            username: 'demo_user',
            onboarding_completed: true
          });
      }
      
      return NextResponse.json({ 
        message: 'Demo user created successfully',
        userId: newUser.user?.id,
        email: demoEmail,
        password: demoPassword
      });
    }
  } catch (error: any) {
    return NextResponse.json({ 
      error: 'Unexpected error',
      details: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}