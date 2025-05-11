// app/api/integrations/oauth/callback/route.ts
import { NextResponse } from 'next/server';
import { getOAuthProviderConfig } from '@/lib/integrations/oauth-config';
import { handleOAuthCallback } from '@/lib/services/integrationService';

export async function GET(request: Request) {
  try {
    // Get query parameters
    const url = new URL(request.url);
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');
    const providerId = url.searchParams.get('provider');
    const error = url.searchParams.get('error');

    // Handle OAuth errors
    if (error) {
      return new Response(`
        <html>
          <body>
            <script>
              window.opener.postMessage({ type: 'oauth-error', error: '${error}' }, '${process.env.NEXT_PUBLIC_APP_URL}');
              window.close();
            </script>
          </body>
        </html>
      `, {
        headers: {
          'Content-Type': 'text/html',
        },
      });
    }

    // Validate parameters
    if (!code || !state || !providerId) {
      return new Response(`
        <html>
          <body>
            <script>
              window.opener.postMessage({ type: 'oauth-error', error: 'Missing required parameters' }, '${process.env.NEXT_PUBLIC_APP_URL}');
              window.close();
            </script>
          </body>
        </html>
      `, {
        headers: {
          'Content-Type': 'text/html',
        },
      });
    }

    // Get provider config
    const config = getOAuthProviderConfig(providerId);
    if (!config) {
      return new Response(`
        <html>
          <body>
            <script>
              window.opener.postMessage({ type: 'oauth-error', error: 'Invalid provider' }, '${process.env.NEXT_PUBLIC_APP_URL}');
              window.close();
            </script>
          </body>
        </html>
      `, {
        headers: {
          'Content-Type': 'text/html',
        },
      });
    }

    // Handle OAuth callback and exchange code for token
    const { userId, integrationId } = await handleOAuthCallback(providerId, code, state);

    // Return success response
    return new Response(`
      <html>
        <body>
          <script>
            window.opener.postMessage({
              type: 'oauth-success',
              providerId: '${providerId}',
              integrationId: '${integrationId}'
            }, '${process.env.NEXT_PUBLIC_APP_URL}');
            window.close();
          </script>
        </body>
      </html>
    `, {
      headers: {
        'Content-Type': 'text/html',
      },
    });
  } catch (error) {
    console.error('Error handling OAuth callback:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';

    return new Response(`
      <html>
        <body>
          <script>
            window.opener.postMessage({ type: 'oauth-error', error: '${errorMessage}' }, '${process.env.NEXT_PUBLIC_APP_URL}');
            window.close();
          </script>
        </body>
      </html>
    `, {
      headers: {
        'Content-Type': 'text/html',
      },
    });
  }
}