import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    const supabase = await createClient();
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      return NextResponse.json({ 
        success: false, 
        error: error.message,
        code: error.code 
      }, { status: 401 });
    }
    
    return NextResponse.json({ 
      success: true, 
      user: data.user?.email,
      session: data.session ? 'Active' : 'None'
    });
    
  } catch (error: any) {
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Test login endpoint. POST with {email, password} to test.',
    demo: {
      email: 'demo@lifenavigator.tech',
      password: 'DemoPassword123'
    }
  });
}