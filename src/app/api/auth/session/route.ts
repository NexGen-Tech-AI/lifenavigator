import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error || !user) {
      return NextResponse.json({ 
        session: null,
        user: null 
      });
    }

    // Get user profile from database
    const { data: profile } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    return NextResponse.json({ 
      session: {
        user: {
          id: user.id,
          email: user.email,
          ...profile
        },
        expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
      },
      user: {
        id: user.id,
        email: user.email,
        ...profile
      }
    });
  } catch (error: any) {
    console.error('Session retrieval error:', error);
    return NextResponse.json({ 
      session: null,
      user: null 
    });
  }
}