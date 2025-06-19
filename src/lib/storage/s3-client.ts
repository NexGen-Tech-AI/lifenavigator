/**
 * S3 Document Storage Service
 * Handles secure document upload/download with KMS encryption
 */

import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
  CreateMultipartUploadCommand,
  UploadPartCommand,
  CompleteMultipartUploadCommand,
  AbortMultipartUploadCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';
import { env } from '@/lib/env';
import { createClient } from '@/lib/supabase/server';
import { encryptField } from '@/lib/encryption/service';
import type { DocumentInsert, ProcessingStatus } from '@/types/database';

// Initialize S3 client
const s3Client = new S3Client({
  region: env.AWS_REGION,
  credentials: {
    accessKeyId: env.AWS_ACCESS_KEY_ID,
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
  },
});

// Configuration
const VAULT_BUCKET = env.AWS_VAULT_BUCKET;
const PROCESSING_BUCKET = env.AWS_PROCESSING_BUCKET || env.AWS_VAULT_BUCKET;
const KMS_KEY_ID = env.AWS_KMS_KEY_ID;
const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB chunks for multipart
const PRESIGNED_URL_EXPIRY = 3600; // 1 hour

// Allowed file types
const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/csv',
  'application/zip',
] as const;

/**
 * Document upload options
 */
interface UploadOptions {
  userId: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  documentType: DocumentInsert['document_type'];
  folderPath?: string;
  tags?: string[];
  taxYear?: number;
  metadata?: Record<string, any>;
}

/**
 * Upload result
 */
interface UploadResult {
  documentId: string;
  s3Key: string;
  presignedUrl: string;
  expiresAt: Date;
}

/**
 * Validates file before upload
 */
function validateFile(fileName: string, fileType: string, fileSize: number): void {
  // Check file size
  if (fileSize > MAX_FILE_SIZE) {
    throw new Error(`File size exceeds maximum of ${MAX_FILE_SIZE / 1024 / 1024}MB`);
  }

  // Check mime type
  if (!ALLOWED_MIME_TYPES.includes(fileType as any)) {
    throw new Error(`File type ${fileType} is not allowed`);
  }

  // Check file name
  if (!/^[\w\-. ]+$/.test(fileName)) {
    throw new Error('Invalid file name. Only alphanumeric characters, spaces, dots, and dashes are allowed');
  }
}

/**
 * Generates a secure S3 key for document storage
 */
function generateS3Key(userId: string, documentId: string, fileName: string): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const safeFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
  
  return `users/${userId}/${year}/${month}/${documentId}/${safeFileName}`;
}

/**
 * Creates a presigned URL for document upload
 */
export async function createUploadUrl(options: UploadOptions): Promise<UploadResult> {
  const supabase = await createClient();
  
  try {
    // Validate file
    validateFile(options.fileName, options.fileType, options.fileSize);

    // Generate document ID and S3 key
    const documentId = uuidv4();
    const s3Key = generateS3Key(options.userId, documentId, options.fileName);

    // Encrypt metadata if provided
    let encryptedMetadata = null;
    if (options.metadata) {
      encryptedMetadata = await encryptField(JSON.stringify(options.metadata), {
        userId: options.userId,
        tableName: 'documents',
        fieldName: 'encrypted_metadata',
        operation: 'encrypt',
      });
    }

    // Create document record
    const { error: dbError } = await supabase.from('documents').insert({
      id: documentId,
      user_id: options.userId,
      name: options.fileName,
      document_type: options.documentType,
      file_size_bytes: options.fileSize,
      mime_type: options.fileType,
      s3_bucket: VAULT_BUCKET,
      s3_key: s3Key,
      encryption_key_id: KMS_KEY_ID,
      encrypted_metadata: encryptedMetadata,
      folder_path: options.folderPath || '/',
      tags: options.tags || [],
      tax_year: options.taxYear,
      processing_status: 'PENDING',
    });

    if (dbError) throw dbError;

    // Create presigned upload URL
    const command = new PutObjectCommand({
      Bucket: VAULT_BUCKET,
      Key: s3Key,
      ContentType: options.fileType,
      ServerSideEncryption: 'aws:kms',
      SSEKMSKeyId: KMS_KEY_ID,
      Metadata: {
        'user-id': options.userId,
        'document-id': documentId,
        'original-name': options.fileName,
      },
      Tagging: `DocumentType=${options.documentType}&UserId=${options.userId}`,
    });

    const presignedUrl = await getSignedUrl(s3Client, command, {
      expiresIn: PRESIGNED_URL_EXPIRY,
    });

    // Log upload initiation
    await supabase.from('audit_logs').insert({
      user_id: options.userId,
      event_type: 'DOCUMENT_UPLOAD_INITIATED',
      event_category: 'DOCUMENT',
      description: `Upload initiated for ${options.fileName}`,
      entity_type: 'documents',
      entity_id: documentId,
      new_values: {
        fileName: options.fileName,
        fileType: options.fileType,
        fileSize: options.fileSize,
      },
    });

    return {
      documentId,
      s3Key,
      presignedUrl,
      expiresAt: new Date(Date.now() + PRESIGNED_URL_EXPIRY * 1000),
    };
  } catch (error) {
    console.error('Error creating upload URL:', error);
    throw new Error('Failed to create upload URL');
  }
}

/**
 * Creates a multipart upload for large files
 */
export async function createMultipartUpload(options: UploadOptions): Promise<{
  uploadId: string;
  documentId: string;
  s3Key: string;
}> {
  const supabase = await createClient();
  
  try {
    // Validate file
    validateFile(options.fileName, options.fileType, options.fileSize);

    // Generate document ID and S3 key
    const documentId = uuidv4();
    const s3Key = generateS3Key(options.userId, documentId, options.fileName);

    // Create multipart upload
    const command = new CreateMultipartUploadCommand({
      Bucket: VAULT_BUCKET,
      Key: s3Key,
      ContentType: options.fileType,
      ServerSideEncryption: 'aws:kms',
      SSEKMSKeyId: KMS_KEY_ID,
      Metadata: {
        'user-id': options.userId,
        'document-id': documentId,
        'original-name': options.fileName,
      },
    });

    const response = await s3Client.send(command);
    
    if (!response.UploadId) {
      throw new Error('Failed to create multipart upload');
    }

    // Create document record
    await supabase.from('documents').insert({
      id: documentId,
      user_id: options.userId,
      name: options.fileName,
      document_type: options.documentType,
      file_size_bytes: options.fileSize,
      mime_type: options.fileType,
      s3_bucket: VAULT_BUCKET,
      s3_key: s3Key,
      encryption_key_id: KMS_KEY_ID,
      folder_path: options.folderPath || '/',
      tags: options.tags || [],
      tax_year: options.taxYear,
      processing_status: 'PENDING',
    });

    return {
      uploadId: response.UploadId,
      documentId,
      s3Key,
    };
  } catch (error) {
    console.error('Error creating multipart upload:', error);
    throw new Error('Failed to create multipart upload');
  }
}

/**
 * Gets a presigned URL for downloading a document
 */
export async function createDownloadUrl(
  userId: string,
  documentId: string,
  expiresIn: number = 3600
): Promise<string> {
  const supabase = await createClient();

  try {
    // Get document details
    const { data: document, error } = await supabase
      .from('documents')
      .select('*')
      .eq('id', documentId)
      .eq('user_id', userId)
      .single();

    if (error || !document) {
      throw new Error('Document not found');
    }

    // Check if document exists in S3
    const headCommand = new HeadObjectCommand({
      Bucket: document.s3_bucket,
      Key: document.s3_key,
    });

    try {
      await s3Client.send(headCommand);
    } catch (s3Error) {
      throw new Error('Document file not found in storage');
    }

    // Create presigned download URL
    const command = new GetObjectCommand({
      Bucket: document.s3_bucket,
      Key: document.s3_key,
      ResponseContentDisposition: `attachment; filename="${document.name}"`,
    });

    const presignedUrl = await getSignedUrl(s3Client, command, { expiresIn });

    // Log download
    await supabase.from('audit_logs').insert({
      user_id: userId,
      event_type: 'DOCUMENT_DOWNLOADED',
      event_category: 'DOCUMENT',
      description: `Downloaded ${document.name}`,
      entity_type: 'documents',
      entity_id: documentId,
    });

    return presignedUrl;
  } catch (error) {
    console.error('Error creating download URL:', error);
    throw new Error('Failed to create download URL');
  }
}

/**
 * Deletes a document from S3 and database
 */
export async function deleteDocument(userId: string, documentId: string): Promise<void> {
  const supabase = await createClient();

  try {
    // Get document details
    const { data: document, error } = await supabase
      .from('documents')
      .select('*')
      .eq('id', documentId)
      .eq('user_id', userId)
      .single();

    if (error || !document) {
      throw new Error('Document not found');
    }

    // Delete from S3
    const command = new DeleteObjectCommand({
      Bucket: document.s3_bucket,
      Key: document.s3_key,
    });

    await s3Client.send(command);

    // Soft delete from database
    await supabase
      .from('documents')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', documentId);

    // Log deletion
    await supabase.from('audit_logs').insert({
      user_id: userId,
      event_type: 'DOCUMENT_DELETED',
      event_category: 'DOCUMENT',
      description: `Deleted ${document.name}`,
      entity_type: 'documents',
      entity_id: documentId,
      old_values: {
        fileName: document.name,
        fileType: document.mime_type,
      },
    });
  } catch (error) {
    console.error('Error deleting document:', error);
    throw new Error('Failed to delete document');
  }
}

/**
 * Updates document processing status
 */
export async function updateDocumentStatus(
  documentId: string,
  status: ProcessingStatus,
  extractedData?: any,
  ocrText?: string,
  error?: string
): Promise<void> {
  const supabase = await createClient();

  const updates: any = {
    processing_status: status,
    processed_at: status === 'COMPLETED' ? new Date().toISOString() : null,
    processing_error: error,
  };

  if (extractedData) {
    updates.extracted_data = extractedData;
  }

  if (ocrText) {
    updates.ocr_text = ocrText;
  }

  await supabase
    .from('documents')
    .update(updates)
    .eq('id', documentId);
}

/**
 * Generates a checksum for file integrity
 */
export function generateFileChecksum(fileBuffer: Buffer): string {
  return crypto.createHash('sha256').update(fileBuffer).digest('hex');
}

/**
 * Verifies file integrity
 */
export async function verifyFileIntegrity(
  s3Key: string,
  expectedChecksum: string
): Promise<boolean> {
  try {
    const command = new GetObjectCommand({
      Bucket: VAULT_BUCKET,
      Key: s3Key,
    });

    const response = await s3Client.send(command);
    
    if (!response.Body) {
      return false;
    }

    // Convert stream to buffer
    const chunks: Uint8Array[] = [];
    for await (const chunk of response.Body as any) {
      chunks.push(chunk);
    }
    const buffer = Buffer.concat(chunks);

    // Calculate checksum
    const actualChecksum = generateFileChecksum(buffer);
    
    return actualChecksum === expectedChecksum;
  } catch (error) {
    console.error('Error verifying file integrity:', error);
    return false;
  }
}

/**
 * Copies document to processing bucket for OCR/analysis
 */
export async function copyToProcessingBucket(
  documentId: string,
  s3Key: string
): Promise<string> {
  const processingKey = `processing/${documentId}/${s3Key.split('/').pop()}`;

  // For now, we'll use the same bucket with different prefix
  // In production, use a separate processing bucket
  return processingKey;
}