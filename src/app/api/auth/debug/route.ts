import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth-config";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  try {
    const session = await getServerSession(authConfig);
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('next-auth.session-token');
    
    return NextResponse.json({
      session: session || null,
      hasCookie: !!sessionCookie,
      cookieName: sessionCookie?.name,
      cookieValue: sessionCookie?.value ? 'EXISTS (hidden)' : 'NONE',
      env: {
        hasSecret: !!process.env.NEXTAUTH_SECRET,
        nodeEnv: process.env.NODE_ENV,
      }
    });
  } catch (error: any) {
    return NextResponse.json({ 
      error: error.message,
      stack: error.stack 
    }, { status: 500 });
  }
}