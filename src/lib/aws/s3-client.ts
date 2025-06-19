/**
 * AWS S3 Client for Document Vault
 * Handles secure document storage with encryption
 */

import { S3Client } from "@aws-sdk/client-s3";
import { 
  PutObjectCommand, 
  GetObjectCommand, 
  DeleteObjectCommand,
  HeadObjectCommand,
  ListObjectsV2Command 
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// Initialize S3 client
export const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

// Configuration
export const VAULT_BUCKET = process.env.AWS_VAULT_BUCKET!;
export const PROCESSING_BUCKET = process.env.AWS_PROCESSING_BUCKET!;
export const KMS_KEY_ID = process.env.AWS_KMS_KEY_ID!;

// File type validation
export const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/gif',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/csv'
];

export const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

// Document categories
export type DocumentCategory = 
  | 'financial' 
  | 'medical' 
  | 'legal' 
  | 'insurance' 
  | 'tax' 
  | 'personal';

/**
 * Generate a secure S3 key for user documents
 */
export function generateDocumentKey(
  userId: string,
  category: DocumentCategory,
  fileName: string
): string {
  const timestamp = Date.now();
  const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
  return `users/${userId}/documents/${category}/${timestamp}-${sanitizedFileName}`;
}

/**
 * Generate pre-signed URL for uploading documents
 */
export async function generateUploadUrl(
  key: string,
  contentType: string,
  metadata?: Record<string, string>
): Promise<{ uploadUrl: string; key: string; expiresIn: number }> {
  const command = new PutObjectCommand({
    Bucket: VAULT_BUCKET,
    Key: key,
    ContentType: contentType,
    ServerSideEncryption: 'aws:kms',
    SSEKMSKeyId: KMS_KEY_ID,
    Metadata: metadata,
  });

  const uploadUrl = await getSignedUrl(s3Client, command, {
    expiresIn: 3600, // 1 hour
  });

  return {
    uploadUrl,
    key,
    expiresIn: 3600,
  };
}

/**
 * Generate pre-signed URL for downloading documents
 */
export async function generateDownloadUrl(
  key: string,
  expiresIn: number = 900 // 15 minutes default
): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: VAULT_BUCKET,
    Key: key,
  });

  return getSignedUrl(s3Client, command, { expiresIn });
}

/**
 * Delete a document from S3
 */
export async function deleteDocument(key: string): Promise<void> {
  const command = new DeleteObjectCommand({
    Bucket: VAULT_BUCKET,
    Key: key,
  });

  await s3Client.send(command);
}

/**
 * Check if a document exists
 */
export async function documentExists(key: string): Promise<boolean> {
  try {
    const command = new HeadObjectCommand({
      Bucket: VAULT_BUCKET,
      Key: key,
    });
    
    await s3Client.send(command);
    return true;
  } catch (error: any) {
    if (error.name === 'NotFound') {
      return false;
    }
    throw error;
  }
}

/**
 * List user documents
 */
export async function listUserDocuments(
  userId: string,
  category?: DocumentCategory
): Promise<Array<{
  key: string;
  size: number;
  lastModified: Date;
}>> {
  const prefix = category 
    ? `users/${userId}/documents/${category}/`
    : `users/${userId}/documents/`;

  const command = new ListObjectsV2Command({
    Bucket: VAULT_BUCKET,
    Prefix: prefix,
    MaxKeys: 1000,
  });

  const response = await s3Client.send(command);
  
  return (response.Contents || []).map(object => ({
    key: object.Key!,
    size: object.Size || 0,
    lastModified: object.LastModified!,
  }));
}

/**
 * Upload document to processing bucket for temporary operations
 */
export async function uploadToProcessing(
  key: string,
  body: Buffer | Uint8Array | string,
  contentType: string
): Promise<void> {
  const command = new PutObjectCommand({
    Bucket: PROCESSING_BUCKET,
    Key: key,
    Body: body,
    ContentType: contentType,
    ServerSideEncryption: 'aws:kms',
    SSEKMSKeyId: KMS_KEY_ID,
  });

  await s3Client.send(command);
}

/**
 * Validate file before upload
 */
export function validateFile(
  file: { type: string; size: number; name: string }
): { valid: boolean; error?: string } {
  if (!ALLOWED_FILE_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: `File type ${file.type} is not allowed`,
    };
  }

  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File size exceeds maximum allowed size of ${MAX_FILE_SIZE / 1024 / 1024}MB`,
    };
  }

  // Check for suspicious file names
  const suspiciousPatterns = [
    /\.exe$/i,
    /\.bat$/i,
    /\.cmd$/i,
    /\.scr$/i,
    /\.vbs$/i,
    /\.js$/i,
  ];

  if (suspiciousPatterns.some(pattern => pattern.test(file.name))) {
    return {
      valid: false,
      error: 'File type not allowed for security reasons',
    };
  }

  return { valid: true };
}