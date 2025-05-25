import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

const publicPaths = ['/auth/login', '/auth/register', '/auth/error', '/']
const protectedPaths = ['/dashboard', '/profile', '/goals', '/settings']

function shouldSkipMiddleware(pathname: string): boolean {
  const skipPatterns = [
    '/_next/',
    '/api/auth/',
    '/favicon.ico',
    '/robots.txt'
  ]
 
  const fileExtensions = ['.ico', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.css', '.js', '.woff', '.woff2', '.ttf', '.eot', '.pdf']
 
  return skipPatterns.some(pattern => pathname.startsWith(pattern)) ||
         fileExtensions.some(ext => pathname.endsWith(ext))
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
 
  if (shouldSkipMiddleware(pathname)) {
    return NextResponse.next()
  }

  console.log(`\n=== MIDDLEWARE DEBUG START ===`)
  console.log(`[MW] Processing: ${pathname}`)
  console.log(`[MW] Request headers:`, Object.fromEntries(request.headers.entries()))
 
  // Log all cookies
  const cookies = request.cookies.getAll()
  console.log(`[MW] All cookies:`, cookies.map(c => ({ name: c.name, hasValue: !!c.value, length: c.value.length })))
 
  // Check for NextAuth session token specifically
  const sessionCookie = request.cookies.get('next-auth.session-token')
  console.log(`[MW] NextAuth session cookie:`, {
    exists: !!sessionCookie,
    hasValue: !!sessionCookie?.value,
    valueLength: sessionCookie?.value?.length || 0,
    valuePreview: sessionCookie?.value?.substring(0, 50) + '...'
  })

  console.log(`[MW] Environment check:`)
  console.log(`  - NEXTAUTH_SECRET exists: ${!!process.env.NEXTAUTH_SECRET}`)
  console.log(`  - NEXTAUTH_SECRET length: ${process.env.NEXTAUTH_SECRET?.length || 0}`)
  console.log(`  - NEXTAUTH_URL: ${process.env.NEXTAUTH_URL}`)
  console.log(`  - NODE_ENV: ${process.env.NODE_ENV}`)

  try {
    // Try multiple ways to get the token
    console.log(`[MW] Attempting to get token...`)
    
    const token1 = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET
    })
    
    const token2 = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
      cookieName: 'next-auth.session-token'
    })
    
    const token3 = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
      raw: true
    })
    
    console.log(`[MW] Token attempts:`)
    console.log(`  - Default getToken: ${!!token1} (email: ${token1?.email})`)
    console.log(`  - With cookieName: ${!!token2} (email: ${token2?.email})`)
    console.log(`  - Raw token: ${!!token3}`)
    
    if (token1) {
      console.log(`[MW] Token details:`, {
        email: token1.email,
        name: token1.name,
        id: token1.id,
        exp: token1.exp ? new Date(Number(token1.exp) * 1000).toISOString() : 'none',
        iat: token1.iat ? new Date(Number(token1.iat) * 1000).toISOString() : 'none'
      })
    }
    
    const token = token1 || token2
    const isAuthenticated = !!token && !!token.email
    
    console.log(`[MW] Final result:`)
    console.log(`  - Authenticated: ${isAuthenticated}`)
    console.log(`  - Email: ${token?.email || 'none'}`)
    console.log(`=== MIDDLEWARE DEBUG END ===\n`)

    // Allow public paths
    if (publicPaths.includes(pathname)) {
      console.log(`[MW] ✅ Public path allowed: ${pathname}`)
      return NextResponse.next()
    }

    // Check protected paths
    const requiresAuth = protectedPaths.some(path => pathname.startsWith(path))
    
    if (requiresAuth && !isAuthenticated) {
      console.log(`[MW] ❌ Redirecting unauthenticated user from ${pathname}`)
      const loginUrl = new URL('/auth/login', request.url)
      loginUrl.searchParams.set('callbackUrl', pathname)
      return NextResponse.redirect(loginUrl)
    }

    if (isAuthenticated) {
      console.log(`[MW] ✅ Authenticated access granted to ${pathname}`)
    }

    return NextResponse.next()

  } catch (error) {
    console.error('[MW] ❌ Error in middleware:', error)
    
    const requiresAuth = protectedPaths.some(path => pathname.startsWith(path))
    if (requiresAuth) {
      const loginUrl = new URL('/auth/login', request.url)
      loginUrl.searchParams.set('callbackUrl', pathname)
      return NextResponse.redirect(loginUrl)
    }
    
    return NextResponse.next()
  }
}

export const config = {
  matcher: ['/((?!api/auth|_next/static|_next/image|favicon\\.ico).*)']
}