import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // For demo deployment - NO AUTHENTICATION NEEDED
  console.log('[Middleware] Path:', request.nextUrl.pathname);
  
  // Redirect root to dashboard
  if (request.nextUrl.pathname === '/') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  
  // Redirect any auth pages to dashboard
  if (request.nextUrl.pathname.startsWith('/auth')) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  
  // Allow everything else
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}