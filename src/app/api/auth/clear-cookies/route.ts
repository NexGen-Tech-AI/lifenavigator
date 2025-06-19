import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  const cookieStore = await cookies();
  const supabase = await createClient();
  
  // Sign out from Supabase (this will clear server-side session)
  await supabase.auth.signOut();
  
  console.log("[CLEAR-COOKIES] Clearing all Supabase auth cookies...");
  
  // Get all cookies and clear ones that match Supabase patterns
  const allCookies = cookieStore.getAll();
  const clearedCookies: string[] = [];
  
  allCookies.forEach(cookie => {
    // Clear Supabase cookies (they typically start with 'sb-')
    if (cookie.name.startsWith('sb-') || cookie.name.includes('supabase')) {
      try {
        cookieStore.delete(cookie.name);
        clearedCookies.push(cookie.name);
        console.log(`[CLEAR-COOKIES] Deleted: ${cookie.name}`);
      } catch (e) {
        console.log(`[CLEAR-COOKIES] Failed to delete: ${cookie.name}`);
      }
    }
  });
  
  return NextResponse.json({ 
    message: "All Supabase auth cookies cleared",
    cleared: clearedCookies 
  });
}