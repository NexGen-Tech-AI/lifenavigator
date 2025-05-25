import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  const cookieStore = await cookies();
  
  // List of all possible NextAuth cookie names
  const cookieNames = [
    'next-auth.session-token',
    '__Secure-next-auth.session-token',
    '__Host-next-auth.session-token',
    'next-auth.csrf-token',
    'next-auth.callback-url',
    '__Host-csrf-secret'
  ];
  
  console.log("[CLEAR-COOKIES] Clearing all auth cookies...");
  
  // Clear each cookie
  cookieNames.forEach(name => {
    try {
      cookieStore.delete(name);
      console.log(`[CLEAR-COOKIES] Deleted: ${name}`);
    } catch (e) {
      console.log(`[CLEAR-COOKIES] Failed to delete: ${name}`);
    }
  });
  
  return NextResponse.json({ 
    message: "All auth cookies cleared",
    cleared: cookieNames 
  });
}