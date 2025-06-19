import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

// OAuth token exchange endpoints
const TOKEN_ENDPOINTS = {
  GOOGLE: 'https://oauth2.googleapis.com/token',
  OUTLOOK: 'https://login.microsoftonline.com/common/oauth2/v2.0/token',
  OFFICE365: 'https://login.microsoftonline.com/common/oauth2/v2.0/token',
  APPLE: 'https://appleid.apple.com/auth/token',
  YAHOO: 'https://api.login.yahoo.com/oauth2/get_token'
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { searchParams } = new URL(request.url)
    
    // Get OAuth response parameters
    const code = searchParams.get('code')
    const state = searchParams.get('state')
    const error = searchParams.get('error')

    // Handle OAuth errors
    if (error) {
      console.error('OAuth error:', error, searchParams.get('error_description'))
      return NextResponse.redirect(
        `/dashboard/settings/integrations?error=${encodeURIComponent(error)}`
      )
    }

    if (!code || !state) {
      return NextResponse.redirect(
        '/dashboard/settings/integrations?error=missing_parameters'
      )
    }

    // Decode and validate state
    let stateData: any
    try {
      stateData = JSON.parse(Buffer.from(state, 'base64').toString())
    } catch (e) {
      return NextResponse.redirect(
        '/dashboard/settings/integrations?error=invalid_state'
      )
    }

    // Verify state timestamp (5 minute expiry)
    if (Date.now() - stateData.timestamp > 5 * 60 * 1000) {
      return NextResponse.redirect(
        '/dashboard/settings/integrations?error=state_expired'
      )
    }

    // Get user and verify
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user || user.id !== stateData.userId) {
      return NextResponse.redirect(
        '/dashboard/settings/integrations?error=unauthorized'
      )
    }

    const provider = stateData.provider
    const tokenEndpoint = TOKEN_ENDPOINTS[provider as keyof typeof TOKEN_ENDPOINTS]
    
    if (!tokenEndpoint) {
      return NextResponse.redirect(
        '/dashboard/settings/integrations?error=invalid_provider'
      )
    }

    // Exchange code for tokens
    const oauthConfig = {
      GOOGLE: {
        clientId: process.env.GOOGLE_CALENDAR_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CALENDAR_CLIENT_SECRET!,
      },
      OUTLOOK: {
        clientId: process.env.OUTLOOK_CLIENT_ID!,
        clientSecret: process.env.OUTLOOK_CLIENT_SECRET!,
      },
      OFFICE365: {
        clientId: process.env.OFFICE365_CLIENT_ID!,
        clientSecret: process.env.OFFICE365_CLIENT_SECRET!,
      },
      APPLE: {
        clientId: process.env.APPLE_CLIENT_ID!,
        clientSecret: process.env.APPLE_CLIENT_SECRET!,
      },
      YAHOO: {
        clientId: process.env.YAHOO_CLIENT_ID!,
        clientSecret: process.env.YAHOO_CLIENT_SECRET!,
      }
    }[provider]

    if (!oauthConfig) {
      return NextResponse.redirect(
        '/dashboard/settings/integrations?error=provider_not_configured'
      )
    }

    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/v1/calendar/callback`
    
    // Exchange authorization code for tokens
    const tokenResponse = await fetch(tokenEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
        client_id: oauthConfig.clientId,
        client_secret: oauthConfig.clientSecret,
      }).toString()
    })

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text()
      console.error('Token exchange failed:', errorData)
      return NextResponse.redirect(
        '/dashboard/settings/integrations?error=token_exchange_failed'
      )
    }

    const tokens = await tokenResponse.json()

    // Get user info to determine account email
    let accountEmail = ''
    let accountName = ''
    let providerAccountId = ''

    switch (provider) {
      case 'GOOGLE':
        const googleUserResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
          headers: {
            Authorization: `Bearer ${tokens.access_token}`
          }
        })
        if (googleUserResponse.ok) {
          const googleUser = await googleUserResponse.json()
          accountEmail = googleUser.email
          accountName = googleUser.name
          providerAccountId = googleUser.id
        }
        break

      case 'OUTLOOK':
      case 'OFFICE365':
        const msUserResponse = await fetch('https://graph.microsoft.com/v1.0/me', {
          headers: {
            Authorization: `Bearer ${tokens.access_token}`
          }
        })
        if (msUserResponse.ok) {
          const msUser = await msUserResponse.json()
          accountEmail = msUser.mail || msUser.userPrincipalName
          accountName = msUser.displayName
          providerAccountId = msUser.id
        }
        break

      // Add other providers...
    }

    // Save connection to database
    const { error: dbError } = await supabase
      .from('calendar_connections')
      .insert({
        user_id: user.id,
        provider,
        provider_account_id: providerAccountId,
        account_email: accountEmail,
        account_name: accountName,
        access_token: tokens.access_token, // This should be encrypted in production
        refresh_token: tokens.refresh_token,
        token_expires_at: tokens.expires_in 
          ? new Date(Date.now() + tokens.expires_in * 1000).toISOString()
          : null,
        is_active: true,
        sync_enabled: true
      })

    if (dbError) {
      console.error('Failed to save connection:', dbError)
      return NextResponse.redirect(
        '/dashboard/settings/integrations?error=save_failed'
      )
    }

    // Log successful connection
    await supabase
      .from('calendar_integration_logs')
      .insert({
        user_id: user.id,
        action: 'oauth_complete',
        status: 'success',
        metadata: { provider, accountEmail }
      })

    // Trigger initial sync
    // This would ideally be done via a background job
    await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/v1/calendar/sync`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': request.headers.get('cookie') || ''
      },
      body: JSON.stringify({ provider, accountEmail })
    })

    // Redirect back to integrations page with success
    return NextResponse.redirect(
      '/dashboard/settings/integrations?success=connected'
    )
  } catch (error) {
    console.error('Calendar callback error:', error)
    return NextResponse.redirect(
      '/dashboard/settings/integrations?error=internal_error'
    )
  }
}