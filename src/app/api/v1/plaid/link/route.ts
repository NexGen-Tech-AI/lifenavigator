import { NextRequest } from 'next/server';
import { z } from 'zod';
import {
  withErrorHandler,
  requireAuth,
  validateRequest,
  successResponse,
  ApiError,
} from '@/lib/api/supabase-route-helpers';
import { createLinkToken } from '@/lib/integrations/plaid/client';

// Request validation schema
const linkTokenSchema = z.object({
  isUpdate: z.boolean().optional().default(false),
  itemId: z.string().optional(),
});

/**
 * POST /api/v1/plaid/link
 * Creates a Plaid Link token for connecting bank accounts
 */
export const POST = withErrorHandler(async (request: NextRequest) => {
  // Authenticate user
  const user = await requireAuth(request);
  
  // Validate request
  const { isUpdate, itemId } = await validateRequest(request, linkTokenSchema);
  
  // Validate update request
  if (isUpdate && !itemId) {
    throw new ApiError('Item ID required for update', 400, 'VALIDATION_ERROR');
  }
  
  // Create link token
  const linkToken = await createLinkToken(user.id, isUpdate, itemId);
  
  return successResponse({
    linkToken: linkToken.link_token,
    expiration: linkToken.expiration,
    requestId: linkToken.request_id,
  });
});