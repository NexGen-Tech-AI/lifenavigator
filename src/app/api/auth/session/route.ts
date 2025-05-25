import { getServerSession } from "next-auth/next";
import { NextRequest, NextResponse } from "next/server";
import { authConfig } from "@/lib/auth-config";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authConfig);
    
    return NextResponse.json({ 
      session,
      user: session?.user || null 
    });
  } catch (error: any) {
    // If JWT decryption fails, return null session instead of error
    if (error?.message?.includes('decryption')) {
      return NextResponse.json({ 
        session: null,
        user: null 
      });
    }
    console.error('Session retrieval error:', error);
    return NextResponse.json({ 
      session: null,
      user: null 
    });
  }
}