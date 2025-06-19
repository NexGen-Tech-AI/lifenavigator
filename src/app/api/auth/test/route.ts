import { createClient } from '@/lib/supabase/server';
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  
  return NextResponse.json({
    hasSession: !!user,
    user: user || null,
    error: error?.message || null,
    timestamp: new Date().toISOString()
  });
}