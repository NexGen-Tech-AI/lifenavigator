import { NextRequest } from 'next/server';
import { z } from 'zod';
import crypto from 'crypto';
import { 
  withErrorHandler, 
  successResponse,
  errorResponse,
} from '@/lib/api/supabase-route-helpers';
import { handlePlaidWebhook } from '@/lib/integrations/plaid/client';
import { env } from '@/lib/env';

// Plaid webhook payload schema
const plaidWebhookSchema = z.object({
  webhook_type: z.string(),
  webhook_code: z.string(),
  item_id: z.string(),
  error: z.object({
    error_code: z.string(),
    error_message: z.string(),
    error_type: z.string(),
  }).optional(),
  new_transactions: z.number().optional(),
  removed_transactions: z.array(z.string()).optional(),
});

/**
 * Verifies Plaid webhook signature
 */
function verifyPlaidWebhook(
  signatureHeader: string | null,
  body: string
): boolean {
  if (!signatureHeader || !env.PLAID_WEBHOOK_SECRET) {
    return false;
  }

  try {
    // Plaid sends the signature as: sha256=<signature>
    const signature = signatureHeader.replace('sha256=', '');
    
    // Calculate expected signature
    const expectedSignature = crypto
      .createHmac('sha256', env.PLAID_WEBHOOK_SECRET)
      .update(body)
      .digest('hex');
    
    // Constant-time comparison
    return crypto.timingSafeEqual(
      Buffer.from(signature, 'hex'),
      Buffer.from(expectedSignature, 'hex')
    );
  } catch (error) {
    console.error('Webhook signature verification failed:', error);
    return false;
  }
}

/**
 * POST /api/v1/plaid/webhook
 * Handles Plaid webhooks for transaction updates, errors, etc.
 */
export const POST = withErrorHandler(async (request: NextRequest) => {
  // Get raw body for signature verification
  const body = await request.text();
  
  // Verify webhook signature
  const signature = request.headers.get('plaid-signature');
  if (env.NODE_ENV === 'production' && !verifyPlaidWebhook(signature, body)) {
    return errorResponse('Invalid webhook signature', 'INVALID_SIGNATURE', 401);
  }
  
  // Parse webhook payload
  let payload;
  try {
    payload = plaidWebhookSchema.parse(JSON.parse(body));
  } catch (error) {
    return errorResponse('Invalid webhook payload', 'INVALID_PAYLOAD', 400);
  }
  
  // Handle webhook based on type
  try {
    await handlePlaidWebhook(
      payload.webhook_type,
      payload.webhook_code,
      payload.item_id,
      payload.error
    );
    
    return successResponse({ received: true }, 'Webhook processed');
  } catch (error) {
    console.error('Webhook processing error:', error);
    // Return success to prevent Plaid from retrying
    return successResponse({ received: true, error: true }, 'Webhook received with error');
  }
});