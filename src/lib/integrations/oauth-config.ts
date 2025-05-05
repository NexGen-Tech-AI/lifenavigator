// lib/integrations/oauth-config.ts
interface OAuthProviderConfig {
    clientId: string;
    clientSecret: string;
    authorizationUrl: string;
    tokenUrl: string;
    scopes?: string[];
  }
  
  const OAUTH_CONFIGS: Record<string, OAuthProviderConfig> = {
    plaid: {
      clientId: process.env.PLAID_CLIENT_ID || 'mock_client_id',
      clientSecret: process.env.PLAID_CLIENT_SECRET || 'mock_client_secret',
      authorizationUrl: 'https://cdn.plaid.com/link/v2/stable/link.html',
      tokenUrl: 'https://sandbox.plaid.com/item/public_token/exchange',
      scopes: ['transactions', 'investments', 'auth']
    },
    coinbase: {
      clientId: process.env.COINBASE_CLIENT_ID || 'mock_client_id',
      clientSecret: process.env.COINBASE_CLIENT_SECRET || 'mock_client_secret',
      authorizationUrl: 'https://www.coinbase.com/oauth/authorize',
      tokenUrl: 'https://api.coinbase.com/oauth/token',
      scopes: ['wallet:accounts:read', 'wallet:transactions:read']
    },
    canvas: {
      clientId: process.env.CANVAS_CLIENT_ID || 'mock_client_id',
      clientSecret: process.env.CANVAS_CLIENT_SECRET || 'mock_client_secret',
      authorizationUrl: 'https://canvas.instructure.com/login/oauth2/auth',
      tokenUrl: 'https://canvas.instructure.com/login/oauth2/token',
      scopes: ['url:GET|/api/v1/courses', 'url:GET|/api/v1/users/self/grades']
    },
    google_classroom: {
      clientId: process.env.GOOGLE_CLIENT_ID || 'mock_client_id',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'mock_client_secret',
      authorizationUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
      tokenUrl: 'https://oauth2.googleapis.com/token',
      scopes: ['https://www.googleapis.com/auth/classroom.courses.readonly', 'https://www.googleapis.com/auth/classroom.coursework.me.readonly']
    },
    epic_mychart: {
      clientId: process.env.EPIC_CLIENT_ID || 'mock_client_id',
      clientSecret: process.env.EPIC_CLIENT_SECRET || 'mock_client_secret',
      authorizationUrl: 'https://fhir.epic.com/interconnect-fhir-oauth/oauth2/authorize',
      tokenUrl: 'https://fhir.epic.com/interconnect-fhir-oauth/oauth2/token',
      scopes: ['patient/Patient.read', 'patient/Observation.read', 'patient/Appointment.read']
    },
    linkedin: {
      clientId: process.env.LINKEDIN_CLIENT_ID || 'mock_client_id',
      clientSecret: process.env.LINKEDIN_CLIENT_SECRET || 'mock_client_secret',
      authorizationUrl: 'https://www.linkedin.com/oauth/v2/authorization',
      tokenUrl: 'https://www.linkedin.com/oauth/v2/accessToken',
      scopes: ['r_liteprofile', 'r_emailaddress']
    },
    smartcar: {
      clientId: process.env.SMARTCAR_CLIENT_ID || 'mock_client_id',
      clientSecret: process.env.SMARTCAR_CLIENT_SECRET || 'mock_client_secret',
      authorizationUrl: 'https://connect.smartcar.com/oauth/authorize',
      tokenUrl: 'https://auth.smartcar.com/oauth/token',
      scopes: ['read_vehicle_info', 'read_odometer', 'read_location']
    }
  };
  
  export function getOAuthProviderConfig(providerId: string): OAuthProviderConfig | undefined {
    return OAUTH_CONFIGS[providerId];
  }