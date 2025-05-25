import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth-config";

console.log("[NEXTAUTH-ROUTE] 🚀 Loading NextAuth API route...");
console.log("[NEXTAUTH-ROUTE] Environment check:");
console.log("  - NEXTAUTH_SECRET exists:", !!process.env.NEXTAUTH_SECRET);
console.log("  - NEXTAUTH_SECRET length:", process.env.NEXTAUTH_SECRET?.length || 0);
console.log("  - NEXTAUTH_URL:", process.env.NEXTAUTH_URL);
console.log("  - NODE_ENV:", process.env.NODE_ENV);

// Validate authConfig is loaded
console.log("[NEXTAUTH-ROUTE] authConfig exists:", !!authConfig);
console.log("[NEXTAUTH-ROUTE] authConfig providers:", authConfig?.providers?.length || 0);
console.log("[NEXTAUTH-ROUTE] authConfig has callbacks:", !!authConfig?.callbacks);
console.log("[NEXTAUTH-ROUTE] authConfig has jwt callback:", !!authConfig?.callbacks?.jwt);
console.log("[NEXTAUTH-ROUTE] authConfig has session callback:", !!authConfig?.callbacks?.session);

if (!authConfig) {
  console.error("[NEXTAUTH-ROUTE] ❌ CRITICAL: authConfig is undefined!");
  throw new Error("authConfig is undefined");
}

// Create handler with explicit configuration
const handler = NextAuth(authConfig);

console.log("[NEXTAUTH-ROUTE] ✅ NextAuth handler created successfully");

export { handler as GET, handler as POST };