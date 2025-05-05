// app/api/integrations/oauth/callback/route.ts
import { NextResponse } from 'next/server';
import { getOAuthProviderConfig } from '@/lib/integrations/oauth-config';

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

    // Exchange code for access token
    // In a real app, this would make an API call to the provider's token endpoint
    // For this example, we'll simulate a successful token exchange
    
    // In production, store the token securely
    
    // Return success response
    return new Response(`
      <html>
        <body>
          <script>
            window.opener.postMessage({ type: 'oauth-success', providerId: '${providerId}' }, '${process.env.NEXT_PUBLIC_APP_URL}');
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
    return new Response(`
      <html>
        <body>
          <script>
            window.opener.postMessage({ type: 'oauth-error', error: 'Internal server error' }, '${process.env.NEXT_PUBLIC_APP_URL}');
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