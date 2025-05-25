import { NextResponse } from "next/server";

export async function GET() {
  // Return the providers configuration directly
  // In this app, we only use credentials provider
  return NextResponse.json({
    credentials: {
      id: "credentials",
      name: "Credentials",
      type: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      }
    }
  });
}