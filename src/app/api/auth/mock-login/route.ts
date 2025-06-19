import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  // Only allow in development with mock auth enabled
  if (process.env.NODE_ENV !== 'development' || process.env.USE_MOCK_AUTH !== 'true') {
    return NextResponse.json({ error: 'Not available' }, { status: 404 })
  }
  
  const body = await request.json()
  const { email, password } = body
  
  // Check demo credentials
  if (email === 'demo@lifenavigator.ai' && password === 'demo123') {
    // Set a simple cookie for auth
    const cookieStore = await cookies()
    cookieStore.set('mock-auth-user', email, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: '/'
    })
    
    return NextResponse.json({
      user: {
        id: '11111111-1111-1111-1111-111111111111',
        email: email,
        user_metadata: { name: 'Demo User' }
      },
      session: { access_token: 'mock-token' }
    })
  }
  
  return NextResponse.json(
    { error: 'Invalid credentials' },
    { status: 401 }
  )
}