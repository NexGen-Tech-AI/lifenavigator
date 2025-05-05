// app/api/integrations/oauth/init/route.ts
import { NextResponse } from 'next/server';
import { getOAuthProviderConfig } from '../../../../../lib/integrations/oauth-config';

export async function POST(request: Request) {
  try {
    const { providerId } = await request.json();
    
    if (!providerId) {
      return NextResponse.json({ error: 'Provider ID is required' }, { status: 400 });
    }
    
    const config = getOAuthProviderConfig(providerId);
    
    if (!config) {
      return NextResponse.json({ error: 'Invalid provider ID' }, { status: 400 });
    }
    
    // Generate state parameter for CSRF protection
    const state = Math.random().toString(36).substring(2, 15);
    
    // Store state in session for verification later
    // This would use a real session store in production
    // For now, we'll mock it
    
    // Construct the OAuth URL
    const authUrl = new URL(config.authorizationUrl);
    authUrl.searchParams.append('client_id', config.clientId);
    authUrl.searchParams.append('redirect_uri', `${process.env.NEXT_PUBLIC_APP_URL}/api/integrations/oauth/callback`);
    authUrl.searchParams.append('response_type', 'code');
    authUrl.searchParams.append('state', state);
    
    if (config.scopes) {
      authUrl.searchParams.append('scope', config.scopes.join(' '));
    }
    
    return NextResponse.json({ authUrl: authUrl.toString() });
  } catch (error) {
    console.error('Error initiating OAuth flow:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}