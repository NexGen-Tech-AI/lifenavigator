// app/api/integrations/oauth/init/route.ts
import { NextResponse } from 'next/server';
import { getOAuthProviderConfig } from '../../../../../lib/integrations/oauth-config';
import { initializeOAuthFlow } from '@/lib/services/integrationService';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/NextAuth';

export async function POST(request: Request) {
  try {
    // Get authenticated user
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const userId = session.user.id;
    const { providerId } = await request.json();

    if (!providerId) {
      return NextResponse.json({ error: 'Provider ID is required' }, { status: 400 });
    }

    const config = getOAuthProviderConfig(providerId);

    if (!config) {
      return NextResponse.json({ error: 'Invalid provider ID' }, { status: 400 });
    }

    // Initialize OAuth flow using our service
    const { authUrl, state } = await initializeOAuthFlow(userId, providerId);

    return NextResponse.json({ authUrl, state });
  } catch (error) {
    console.error('Error initiating OAuth flow:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}