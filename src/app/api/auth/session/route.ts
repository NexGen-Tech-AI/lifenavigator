import { getServerSession } from "next-auth/next";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "../NextAuth";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    return NextResponse.json({ 
      session,
      user: session?.user || null 
    });
  } catch (error) {
    console.error('Session retrieval error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve session' },
      { status: 500 }
    );
  }
}