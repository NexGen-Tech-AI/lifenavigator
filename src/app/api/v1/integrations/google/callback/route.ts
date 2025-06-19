/**
 * Google OAuth Callback Handler
 * GET /api/v1/integrations/google/callback
 */

import { NextRequest, NextResponse } from 'next/server'
import { google } from 'googleapis'
import { createClient } from '@/lib/supabase/server'

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  `${process.env.NEXT_PUBLIC_APP_URL}/api/v1/integrations/google/callback`
)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const state = searchParams.get('state')
    const error = searchParams.get('error')
    
    if (error) {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard/integrations?error=${error}`)
    }
    
    if (!code || !state) {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard/integrations?error=missing_params`)
    }
    
    const supabase = await createClient()
    
    // Verify state
    const stateData = JSON.parse(Buffer.from(state, 'base64').toString())
    const { data: oauthState } = await supabase
      .from('oauth_states')
      .select('*')
      .eq('state', state)
      .eq('user_id', stateData.userId)
      .single()
    
    if (!oauthState) {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard/integrations?error=invalid_state`)
    }
    
    // Delete used state
    await supabase
      .from('oauth_states')
      .delete()
      .eq('id', oauthState.id)
    
    // Exchange code for tokens
    const { tokens } = await oauth2Client.getToken(code)
    oauth2Client.setCredentials(tokens)
    
    // Get user info
    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client })
    const { data: userInfo } = await oauth2.userinfo.get()
    
    // Encrypt tokens
    const encryptedTokens = Buffer.from(JSON.stringify(tokens)).toString('base64')
    
    // Store integration
    const { error: integrationError } = await supabase
      .from('integrations')
      .upsert({
        user_id: stateData.userId,
        provider: 'google',
        provider_account_id: userInfo.id,
        provider_email: userInfo.email,
        access_token: encryptedTokens,
        refresh_token: tokens.refresh_token,
        expires_at: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
        is_active: true,
        metadata: {
          name: userInfo.name,
          picture: userInfo.picture,
          scopes: tokens.scope?.split(' ') || []
        }
      }, {
        onConflict: 'user_id,provider'
      })
    
    if (integrationError) {
      console.error('Integration storage error:', integrationError)
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard/integrations?error=storage_failed`)
    }
    
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard/integrations?success=google`)
    
  } catch (error) {
    console.error('Callback error:', error)
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard/integrations?error=callback_failed`)
  }
}