import { NextRequest, NextResponse } from "next/server";
import { generateCsrfToken } from "@/lib/auth/csrf";

export async function GET(req: NextRequest) {
  try {
    const csrfToken = await generateCsrfToken();
    
    return NextResponse.json({ csrfToken });
  } catch (error) {
    console.error('CSRF token generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate CSRF token' },
      { status: 500 }
    );
  }
}