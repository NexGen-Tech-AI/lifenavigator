import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth-config";

console.log("[NEXTAUTH-ROUTE] Loading NextAuth API route...");
console.log("[NEXTAUTH-ROUTE] authConfig exists:", !!authConfig);
console.log("[NEXTAUTH-ROUTE] authConfig.providers:", authConfig?.providers?.length || 0);
console.log("[NEXTAUTH-ROUTE] authConfig.callbacks exists:", !!authConfig?.callbacks);
console.log("[NEXTAUTH-ROUTE] authConfig.callbacks.jwt exists:", !!authConfig?.callbacks?.jwt);
console.log("[NEXTAUTH-ROUTE] authConfig.callbacks.session exists:", !!authConfig?.callbacks?.session);

const handler = NextAuth(authConfig);

console.log("[NEXTAUTH-ROUTE] NextAuth handler created");

export { handler as GET, handler as POST };