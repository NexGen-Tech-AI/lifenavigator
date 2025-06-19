import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { CALENDAR_PROVIDERS, getOAuthUrl } from '@/lib/calendar/providers'

// OAuth configuration from environment variables
const OAUTH_CONFIGS = {
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
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get provider from query params
    const { searchParams } = new URL(request.url)
    const providerId = searchParams.get('provider')

    if (!providerId || !CALENDAR_PROVIDERS[providerId]) {
      return NextResponse.json({ error: 'Invalid provider' }, { status: 400 })
    }

    const provider = CALENDAR_PROVIDERS[providerId]

    // Handle CalDAV separately (no OAuth)
    if (providerId === 'CALDAV') {
      return NextResponse.redirect('/dashboard/settings/integrations?setup=caldav')
    }

    // Get OAuth config
    const oauthConfig = OAUTH_CONFIGS[providerId as keyof typeof OAUTH_CONFIGS]
    if (!oauthConfig?.clientId) {
      return NextResponse.json({ 
        error: 'Provider not configured',
        message: `${provider.name} integration is not yet configured. Please contact support.`
      }, { status: 501 })
    }

    // Generate state token for CSRF protection
    const state = Buffer.from(JSON.stringify({
      userId: user.id,
      provider: providerId,
      timestamp: Date.now()
    })).toString('base64')

    // Store state in database for validation
    await supabase
      .from('calendar_integration_logs')
      .insert({
        user_id: user.id,
        action: 'oauth_init',
        status: 'pending',
        metadata: { state, provider: providerId }
      })

    // Build OAuth URL
    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/v1/calendar/callback`
    const authUrl = getOAuthUrl(provider, {
      clientId: oauthConfig.clientId,
      redirectUri,
      responseType: 'code',
      accessType: 'offline',
      prompt: 'consent'
    })

    // Add state parameter
    const finalUrl = `${authUrl}&state=${encodeURIComponent(state)}`

    // Redirect to OAuth provider
    return NextResponse.redirect(finalUrl)
  } catch (error) {
    console.error('Calendar connect error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}