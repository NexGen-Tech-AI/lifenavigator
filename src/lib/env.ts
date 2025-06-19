import { z } from 'zod'

/**
 * Environment variable validation
 * This ensures all required environment variables are set
 * and provides type-safe access throughout the application
 */

const envSchema = z.object({
  // Node environment
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  
  // Supabase (Required in production, optional in development)
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().default('https://your-project.supabase.co').describe('Supabase project URL'),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1).default('placeholder-anon-key').describe('Supabase anonymous key'),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).default('placeholder-service-key').describe('Supabase service role key'),
  
  // Application
  NEXT_PUBLIC_APP_URL: z.string().url().default('http://localhost:3000').describe('Application URL'),
  
  // AWS S3 (Optional - for document storage)
  AWS_REGION: z.string().default('us-east-1').optional().describe('AWS region'),
  AWS_ACCESS_KEY_ID: z.string().min(1).optional().describe('AWS access key'),
  AWS_SECRET_ACCESS_KEY: z.string().min(1).optional().describe('AWS secret key'),
  AWS_VAULT_BUCKET: z.string().min(1).optional().describe('S3 bucket for documents'),
  AWS_KMS_KEY_ID: z.string().min(1).optional().describe('KMS key for encryption'),
  AWS_PROCESSING_BUCKET: z.string().optional().describe('S3 bucket for processing'),
  
  // Plaid (Optional - for financial integration)
  PLAID_CLIENT_ID: z.string().optional().describe('Plaid client ID'),
  PLAID_SECRET: z.string().optional().describe('Plaid secret'),
  PLAID_ENV: z.enum(['sandbox', 'development', 'production']).default('sandbox').describe('Plaid environment'),
  
  // Google OAuth (Optional - for calendar/email integration)
  GOOGLE_CLIENT_ID: z.string().optional().describe('Google OAuth client ID'),
  GOOGLE_CLIENT_SECRET: z.string().optional().describe('Google OAuth client secret'),
  
  // Stripe (Optional - for payments)
  STRIPE_SECRET_KEY: z.string().optional().describe('Stripe secret key'),
  STRIPE_WEBHOOK_SECRET: z.string().optional().describe('Stripe webhook secret'),
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().optional().describe('Stripe publishable key'),
  
  // Coinbase (Optional - for crypto integration)
  COINBASE_API_KEY: z.string().optional().describe('Coinbase API key'),
  COINBASE_API_SECRET: z.string().optional().describe('Coinbase API secret'),
  
  // Security
  ENCRYPTION_KEY: z.string().min(32).optional().describe('Encryption key for sensitive data'),
  JWT_SECRET: z.string().min(32).optional().describe('JWT secret for tokens'),
})

// Parse and validate environment variables
const parseEnv = () => {
  try {
    const parsed = envSchema.parse(process.env)
    return parsed
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('❌ Invalid environment variables:')
      console.error(error.format())
      
      const missing = error.errors
        .filter(err => err.code === 'invalid_type' && err.received === 'undefined')
        .map(err => err.path.join('.'))
      
      if (missing.length > 0) {
        console.error('\n📋 Missing required environment variables:')
        missing.forEach(varName => {
          const field = envSchema.shape[varName as keyof typeof envSchema.shape]
          const description = (field as any)._def?.description || ''
          console.error(`  - ${varName}: ${description}`)
        })
      }
      
      if (process.env.NODE_ENV === 'production') {
        throw new Error('Invalid environment variables')
      } else {
        console.error('\n⚠️  Running in development mode with missing variables')
        console.error('Some features may not work properly')
      }
    }
    throw error
  }
}

// Export validated environment variables
export const env = parseEnv()

// Type for environment variables
export type Env = z.infer<typeof envSchema>

// Helper to check if a feature is enabled based on env vars
export const isFeatureEnabled = {
  plaid: Boolean(env.PLAID_CLIENT_ID && env.PLAID_SECRET),
  google: Boolean(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET),
  stripe: Boolean(env.STRIPE_SECRET_KEY),
  coinbase: Boolean(env.COINBASE_API_KEY && env.COINBASE_API_SECRET),
  encryption: Boolean(env.ENCRYPTION_KEY),
}

// Export specific configurations
export const config = {
  isDevelopment: env.NODE_ENV === 'development',
  isProduction: env.NODE_ENV === 'production',
  isTest: env.NODE_ENV === 'test',
  
  supabase: {
    url: env.NEXT_PUBLIC_SUPABASE_URL,
    anonKey: env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    serviceKey: env.SUPABASE_SERVICE_ROLE_KEY,
  },
  
  aws: {
    region: env.AWS_REGION,
    accessKeyId: env.AWS_ACCESS_KEY_ID,
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
    vaultBucket: env.AWS_VAULT_BUCKET,
    processingBucket: env.AWS_PROCESSING_BUCKET,
    kmsKeyId: env.AWS_KMS_KEY_ID,
  },
  
  plaid: {
    clientId: env.PLAID_CLIENT_ID,
    secret: env.PLAID_SECRET,
    environment: env.PLAID_ENV,
  },
  
  app: {
    url: env.NEXT_PUBLIC_APP_URL,
  },
}