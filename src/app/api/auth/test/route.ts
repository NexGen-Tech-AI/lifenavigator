import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth-config";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getServerSession(authConfig);
  
  return NextResponse.json({
    hasSession: !!session,
    session: session || null,
    timestamp: new Date().toISOString()
  });
}