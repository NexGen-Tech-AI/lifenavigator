/**
 * Google OAuth Integration - Calendar & Gmail
 * GET /api/v1/integrations/google/auth - Start OAuth flow
 * GET /api/v1/integrations/google/callback - Handle callback
 */

import { NextRequest, NextResponse } from 'next/server'
import { google } from 'googleapis'
import { createClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/api/supabase-route-helpers'

// OAuth2 client configuration
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  `${process.env.NEXT_PUBLIC_APP_URL}/api/v1/integrations/google/callback`
)

// Scopes for Calendar and Gmail
const SCOPES = [
  'https://www.googleapis.com/auth/calendar',
  'https://www.googleapis.com/auth/calendar.events',
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/gmail.labels',
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/userinfo.profile'
]

// GET - Start OAuth flow
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request)
    
    // Generate state parameter for CSRF protection
    const state = Buffer.from(JSON.stringify({
      userId: user.id,
      timestamp: Date.now()
    })).toString('base64')
    
    // Store state in database for verification
    const supabase = await createClient()
    await supabase.from('oauth_states').insert({
      user_id: user.id,
      state,
      provider: 'google',
      expires_at: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
    })
    
    // Generate authorization URL
    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: SCOPES,
      state,
      prompt: 'consent' // Force consent to get refresh token
    })
    
    return NextResponse.json({ authUrl })
  } catch (error) {
    console.error('Google auth error:', error)
    return NextResponse.json({ error: 'Failed to start authentication' }, { status: 500 })
  }
}