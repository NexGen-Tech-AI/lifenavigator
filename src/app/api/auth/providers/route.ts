import { getProviders } from "next-auth/react";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const providers = await getProviders();
    
    return NextResponse.json(providers || {});
  } catch (error) {
    console.error('Providers retrieval error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve providers' },
      { status: 500 }
    );
  }
}