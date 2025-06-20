/**
 * Document upload and management API
 * GET /api/v1/documents - List user documents
 * POST /api/v1/documents - Upload new document
 */

import { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import {
  withErrorHandler,
  requireAuth,
  successResponse,
  paginatedResponse,
  getPaginationParams,
  getQueryParams,
  ValidationError,
  errorResponse
} from '@/lib/api/route-helpers';
import { DocumentType, ProcessingStatus } from '@prisma/client';
import { uploadFile, deleteFile } from '@/lib/services/storage-service';
import { processDocument } from '@/lib/services/document-processor';
import { createSecurityAuditLog } from '@/lib/services/security-service';

// File upload limits
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'text/csv',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'image/jpeg',
  'image/png'
];

// GET /api/v1/documents - List documents
export const GET = withErrorHandler(async (request: NextRequest) => {
  const user = await requireAuth(request);
  const { page, pageSize, skip } = getPaginationParams(request);
  const params = getQueryParams(request);
  
  // Build filters
  const where: any = { userId: user.id };
  
  if (params.type) {
    where.documentType = params.type;
  }
  
  if (params.status) {
    where.processingStatus = params.status;
  }
  
  if (params.startDate || params.endDate) {
    where.uploadedAt = {};
    if (params.startDate) {
      where.uploadedAt.gte = new Date(params.startDate);
    }
    if (params.endDate) {
      where.uploadedAt.lte = new Date(params.endDate);
    }
  }
  
  // Get documents
  const [documents, total] = await Promise.all([
    prisma.document.findMany({
      where,
      include: {
        _count: {
          select: {
            transactions: true
          }
        }
      },
      orderBy: { uploadedAt: 'desc' },
      skip,
      take: pageSize
    }),
    prisma.document.count({ where })
  ]);
  
  // Format response
  const formattedDocuments = documents.map(doc => ({
    id: doc.id,
    fileName: doc.fileName,
    fileType: doc.fileType,
    fileSize: doc.fileSize,
    documentType: doc.documentType,
    uploadedAt: doc.uploadedAt,
    processingStatus: doc.processingStatus,
    processedAt: doc.processedAt,
    processingError: doc.processingError,
    confidence: doc.confidence,
    pageCount: doc.pageCount,
    transactionCount: doc._count.transactions,
    // Don't expose raw extracted data in list view
    hasExtractedData: !!doc.extractedData
  }));
  
  return paginatedResponse(formattedDocuments, page, pageSize, total);
});

// POST /api/v1/documents - Upload document
export const POST = withErrorHandler(async (request: NextRequest) => {
  const user = await requireAuth(request);
  
  // Check if document upload is enabled
  if (process.env.ENABLE_DOCUMENT_UPLOAD !== 'true') {
    return errorResponse('Document upload is not enabled', 'FEATURE_DISABLED', 503);
  }
  
  // Parse multipart form data
  const formData = await request.formData();
  const file = formData.get('file') as File | null;
  const documentType = formData.get('documentType') as DocumentType | null;
  const accountId = formData.get('accountId') as string | null;
  
  if (!file) {
    throw new ValidationError('No file provided');
  }
  
  if (!documentType) {
    throw new ValidationError('Document type is required');
  }
  
  // Validate file
  if (file.size > MAX_FILE_SIZE) {
    throw new ValidationError(`File size exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit`);
  }
  
  if (!ALLOWED_FILE_TYPES.includes(file.type)) {
    throw new ValidationError('File type not supported');
  }
  
  // Verify account ownership if provided
  if (accountId) {
    const account = await prisma.financialAccount.findFirst({
      where: {
        id: accountId,
        userId: user.id
      }
    });
    
    if (!account) {
      throw new ValidationError('Invalid account');
    }
  }
  
  try {
    // Upload file to storage
    const { url, key } = await uploadFile(file, user.id);
    
    // Create document record
    const document = await prisma.document.create({
      data: {
        userId: user.id,
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        fileUrl: url,
        storageKey: key,
        documentType,
        processingStatus: ProcessingStatus.PENDING
      }
    });
    
    // Log upload
    await createSecurityAuditLog({
      userId: user.id,
      event: 'Document uploaded',
      eventType: 'DATA_EXPORT', // Using as general data event
      metadata: {
        documentId: document.id,
        documentType,
        fileName: file.name
      }
    });
    
    // Queue document for processing
    await queueDocumentProcessing(document.id, documentType, accountId);
    
    return successResponse({
      id: document.id,
      fileName: document.fileName,
      fileSize: document.fileSize,
      documentType: document.documentType,
      processingStatus: document.processingStatus,
      uploadedAt: document.uploadedAt
    }, 'Document uploaded successfully', 201);
    
  } catch (error: any) {
    // Clean up on error
    console.error('Document upload error:', error);
    throw new Error('Failed to upload document');
  }
});

// Queue document for processing
async function queueDocumentProcessing(
  documentId: string,
  documentType: DocumentType,
  accountId?: string | null
) {
  // In production, this would queue to a background job processor
  // For now, process inline with error handling
  
  setTimeout(async () => {
    try {
      await processDocumentInline(documentId, documentType, accountId);
    } catch (error) {
      console.error('Document processing error:', error);
    }
  }, 0);
}

// Process document inline
async function processDocumentInline(
  documentId: string,
  documentType: DocumentType,
  accountId?: string | null
) {
  try {
    // Update status to processing
    await prisma.document.update({
      where: { id: documentId },
      data: { processingStatus: ProcessingStatus.PROCESSING }
    });
    
    const document = await prisma.document.findUnique({
      where: { id: documentId }
    });
    
    if (!document) return;
    
    // Process document based on type
    const result = await processDocument(document.fileUrl, documentType);
    
    if (!result.success) {
      throw new Error(result.error || 'Processing failed');
    }
    
    // Update document with results
    await prisma.document.update({
      where: { id: documentId },
      data: {
        processingStatus: ProcessingStatus.COMPLETED,
        processedAt: new Date(),
        extractedData: result.data,
        confidence: result.confidence,
        pageCount: result.pageCount,
        parsedAccounts: result.accounts
      }
    });
    
    // Create transactions if applicable
    if (result.transactions && result.transactions.length > 0 && accountId) {
      await createTransactionsFromDocument(
        document.userId,
        accountId,
        documentId,
        result.transactions
      );
    }
    
    // Notify user
    await prisma.notification.create({
      data: {
        userId: document.userId,
        type: 'SYSTEM_UPDATE',
        title: 'Document Processed',
        message: `Your ${documentType.toLowerCase()} has been processed successfully`,
        data: { documentId },
        channels: ['in_app']
      }
    });
    
  } catch (error: any) {
    // Update document with error
    await prisma.document.update({
      where: { id: documentId },
      data: {
        processingStatus: ProcessingStatus.FAILED,
        processingError: error.message || 'Unknown error'
      }
    });
    
    // Notify user of failure
    const document = await prisma.document.findUnique({
      where: { id: documentId }
    });
    
    if (document) {
      await prisma.notification.create({
        data: {
          userId: document.userId,
          type: 'SYSTEM_UPDATE',
          title: 'Document Processing Failed',
          message: `Failed to process your ${documentType.toLowerCase()}. Please try again or enter data manually.`,
          data: { documentId, error: error.message },
          channels: ['in_app']
        }
      });
    }
  }
}

// Create transactions from parsed document
async function createTransactionsFromDocument(
  userId: string,
  accountId: string,
  documentId: string,
  transactions: any[]
) {
  const created = [];
  
  for (const tx of transactions) {
    try {
      // Parse date
      const transactionDate = new Date(tx.date);
      if (isNaN(transactionDate.getTime())) continue;
      
      // Skip if transaction might already exist
      const existing = await prisma.transaction.findFirst({
        where: {
          userId,
          accountId,
          transactionDate,
          amount: tx.amount,
          description: { contains: tx.description.substring(0, 20) }
        }
      });
      
      if (existing) continue;
      
      // Create transaction
      const transaction = await prisma.transaction.create({
        data: {
          userId,
          accountId,
          documentId,
          transactionDate,
          amount: tx.amount,
          description: tx.description,
          dataSource: 'DOCUMENT',
          notes: `Imported from document`
        }
      });
      
      created.push(transaction);
    } catch (error) {
      console.error('Failed to create transaction:', error);
    }
  }
  
  return created;
}