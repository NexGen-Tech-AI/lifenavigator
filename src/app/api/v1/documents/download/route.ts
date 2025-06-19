import { NextRequest } from 'next/server';
import { z } from 'zod';
import {
  withErrorHandler,
  requireAuth,
  validateRequest,
  successResponse,
  ApiError,
} from '@/lib/api/supabase-route-helpers';
import { createDownloadUrl } from '@/lib/storage/s3-client';

// Request validation schema
const downloadRequestSchema = z.object({
  documentId: z.string().uuid(),
  expiresIn: z.number().min(60).max(86400).optional().default(3600), // 1 hour default
});

/**
 * POST /api/v1/documents/download
 * Creates a presigned URL for secure document download from S3
 */
export const POST = withErrorHandler(async (request: NextRequest) => {
  // Authenticate user
  const user = await requireAuth(request);
  
  // Validate request
  const { documentId, expiresIn } = await validateRequest(request, downloadRequestSchema);
  
  try {
    // Create download URL
    const downloadUrl = await createDownloadUrl(user.id, documentId, expiresIn);
    
    return successResponse({
      downloadUrl,
      expiresIn,
      expiresAt: new Date(Date.now() + expiresIn * 1000),
    }, 'Download URL created');
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'Document not found') {
        throw new ApiError('Document not found', 404, 'NOT_FOUND');
      }
      throw new ApiError(error.message, 400, 'DOWNLOAD_ERROR');
    }
    throw error;
  }
});