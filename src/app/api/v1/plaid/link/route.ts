/**
 * Plaid Link Token API
 * POST /api/v1/plaid/link - Create link token for Plaid integration
 */

import { NextRequest } from 'next/server';
import { z } from 'zod';
import { Configuration, PlaidApi, PlaidEnvironments, Products, CountryCode } from 'plaid';
import { prisma } from '@/lib/db-prod';
import {
  withErrorHandler,
  requireSubscription,
  validateRequest,
  successResponse,
  errorResponse
} from '@/lib/api/route-helpers';
import { createSecurityAuditLog } from '@/lib/services/security-service';

// Initialize Plaid client
const configuration = new Configuration({
  basePath: PlaidEnvironments[process.env.PLAID_ENV as keyof typeof PlaidEnvironments] || PlaidEnvironments.sandbox,
  baseOptions: {
    headers: {
      'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID,
      'PLAID-SECRET': process.env.PLAID_SECRET,
    },
  },
});

const plaidClient = new PlaidApi(configuration);

// Validation schema
const linkTokenSchema = z.object({
  products: z.array(z.string()).optional(),
  countryCodes: z.array(z.string()).optional(),
  language: z.string().optional().default('en'),
  accountSubtypes: z.array(z.object({
    type: z.string(),
    subtype: z.string()
  })).optional()
});

// POST /api/v1/plaid/link - Create link token
export const POST = withErrorHandler(async (request: NextRequest) => {
  // Require at least PRO subscription for Plaid integration
  const user = await requireSubscription(request, 'PRO');
  
  // Check if Plaid is enabled
  if (process.env.ENABLE_PLAID_INTEGRATION !== 'true') {
    return errorResponse('Plaid integration is not enabled', 'FEATURE_DISABLED', 503);
  }
  
  const data = await validateRequest(request, linkTokenSchema);
  
  try {
    // Default products if not specified
    const products = data.products?.length 
      ? data.products as Products[]
      : (process.env.PLAID_PRODUCTS?.split(',') as Products[] || [Products.Transactions, Products.Accounts]);
    
    // Default country codes
    const countryCodes = data.countryCodes?.length
      ? data.countryCodes as CountryCode[]
      : (process.env.PLAID_COUNTRY_CODES?.split(',') as CountryCode[] || [CountryCode.Us]);
    
    // Create link token
    const linkTokenResponse = await plaidClient.linkTokenCreate({
      client_name: 'LifeNavigator',
      products,
      country_codes: countryCodes,
      language: data.language || 'en',
      user: {
        client_user_id: user.id,
        email_address: user.email || undefined
      },
      webhook: process.env.PLAID_WEBHOOK_URL,
      redirect_uri: process.env.NODE_ENV === 'production' 
        ? `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/integrations/plaid/callback`
        : undefined,
      account_filters: data.accountSubtypes ? {
        depository: {
          account_subtypes: data.accountSubtypes
            .filter(s => s.type === 'depository')
            .map(s => s.subtype as any)
        },
        credit: {
          account_subtypes: data.accountSubtypes
            .filter(s => s.type === 'credit')
            .map(s => s.subtype as any)
        },
        investment: {
          account_subtypes: data.accountSubtypes
            .filter(s => s.type === 'investment')
            .map(s => s.subtype as any)
        }
      } : undefined
    });
    
    // Log the integration attempt
    await createSecurityAuditLog({
      userId: user.id,
      event: 'Plaid link token created',
      eventType: 'INTEGRATION_CONNECTED',
      metadata: {
        products,
        countryCodes
      }
    });
    
    return successResponse({
      linkToken: linkTokenResponse.data.link_token,
      expiration: linkTokenResponse.data.expiration
    });
    
  } catch (error: any) {
    console.error('Plaid link token error:', error);
    
    // Handle Plaid-specific errors
    if (error.response?.data) {
      return errorResponse(
        error.response.data.error_message || 'Failed to create link token',
        error.response.data.error_code,
        400
      );
    }
    
    throw error;
  }
});