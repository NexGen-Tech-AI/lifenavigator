/**
 * Storage service for file uploads
 * Supports multiple providers: UploadThing, AWS S3, or local storage
 */

import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import crypto from 'crypto';

// Storage provider type
type StorageProvider = 'uploadthing' | 's3' | 'local';

// Get configured storage provider
function getStorageProvider(): StorageProvider {
  if (process.env.UPLOADTHING_SECRET) return 'uploadthing';
  if (process.env.AWS_S3_BUCKET) return 's3';
  return 'local';
}

// S3 client initialization
let s3Client: S3Client | null = null;
if (process.env.AWS_S3_BUCKET) {
  s3Client = new S3Client({
    region: process.env.AWS_REGION || 'us-east-1',
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
    }
  });
}

/**
 * Upload file to storage
 */
export async function uploadFile(
  file: File,
  userId: string
): Promise<{ url: string; key: string }> {
  const provider = getStorageProvider();
  const fileKey = generateFileKey(file.name, userId);
  
  switch (provider) {
    case 'uploadthing':
      return uploadToUploadThing(file, fileKey);
      
    case 's3':
      return uploadToS3(file, fileKey);
      
    case 'local':
      return uploadToLocal(file, fileKey);
      
    default:
      throw new Error('No storage provider configured');
  }
}

/**
 * Delete file from storage
 */
export async function deleteFile(key: string): Promise<void> {
  const provider = getStorageProvider();
  
  switch (provider) {
    case 'uploadthing':
      await deleteFromUploadThing(key);
      break;
      
    case 's3':
      await deleteFromS3(key);
      break;
      
    case 'local':
      await deleteFromLocal(key);
      break;
  }
}

/**
 * Get signed URL for file access
 */
export async function getSignedFileUrl(
  key: string,
  expiresIn = 3600 // 1 hour
): Promise<string> {
  const provider = getStorageProvider();
  
  switch (provider) {
    case 'uploadthing':
      return getUploadThingUrl(key);
      
    case 's3':
      return getS3SignedUrl(key, expiresIn);
      
    case 'local':
      return getLocalUrl(key);
      
    default:
      throw new Error('No storage provider configured');
  }
}

// ==================== PROVIDER IMPLEMENTATIONS ====================

// UploadThing implementation
async function uploadToUploadThing(
  file: File,
  key: string
): Promise<{ url: string; key: string }> {
  // UploadThing integration would go here
  // This is a placeholder implementation
  throw new Error('UploadThing integration not implemented');
}

async function deleteFromUploadThing(key: string): Promise<void> {
  // UploadThing deletion
  throw new Error('UploadThing deletion not implemented');
}

async function getUploadThingUrl(key: string): Promise<string> {
  // UploadThing URL generation
  throw new Error('UploadThing URL generation not implemented');
}

// AWS S3 implementation
async function uploadToS3(
  file: File,
  key: string
): Promise<{ url: string; key: string }> {
  if (!s3Client || !process.env.AWS_S3_BUCKET) {
    throw new Error('S3 not configured');
  }
  
  const buffer = await file.arrayBuffer();
  const command = new PutObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET,
    Key: key,
    Body: Buffer.from(buffer),
    ContentType: file.type,
    ContentLength: file.size,
    Metadata: {
      originalName: file.name
    }
  });
  
  await s3Client.send(command);
  
  // Generate URL
  const url = await getS3SignedUrl(key);
  
  return { url, key };
}

async function deleteFromS3(key: string): Promise<void> {
  if (!s3Client || !process.env.AWS_S3_BUCKET) {
    throw new Error('S3 not configured');
  }
  
  const command = new DeleteObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET,
    Key: key
  });
  
  await s3Client.send(command);
}

async function getS3SignedUrl(key: string, expiresIn = 3600): Promise<string> {
  if (!s3Client || !process.env.AWS_S3_BUCKET) {
    throw new Error('S3 not configured');
  }
  
  const command = new GetObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET,
    Key: key
  });
  
  return getSignedUrl(s3Client, command, { expiresIn });
}

// Local storage implementation (development only)
import { writeFile, unlink, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

async function uploadToLocal(
  file: File,
  key: string
): Promise<{ url: string; key: string }> {
  const uploadDir = join(process.cwd(), 'uploads');
  
  // Ensure upload directory exists
  if (!existsSync(uploadDir)) {
    await mkdir(uploadDir, { recursive: true });
  }
  
  const filePath = join(uploadDir, key);
  const buffer = await file.arrayBuffer();
  
  await writeFile(filePath, Buffer.from(buffer));
  
  const url = `/api/v1/documents/file/${key}`;
  
  return { url, key };
}

async function deleteFromLocal(key: string): Promise<void> {
  const filePath = join(process.cwd(), 'uploads', key);
  
  try {
    await unlink(filePath);
  } catch (error) {
    console.error('Failed to delete local file:', error);
  }
}

function getLocalUrl(key: string): string {
  return `/api/v1/documents/file/${key}`;
}

// ==================== UTILITY FUNCTIONS ====================

/**
 * Generate unique file key
 */
function generateFileKey(fileName: string, userId: string): string {
  const ext = fileName.split('.').pop() || 'bin';
  const id = crypto.randomUUID();
  const timestamp = Date.now();
  
  return `${userId}/${timestamp}-${id}.${ext}`;
}

/**
 * Get file extension from key
 */
export function getFileExtension(key: string): string {
  return key.split('.').pop() || '';
}

/**
 * Get MIME type from extension
 */
export function getMimeType(extension: string): string {
  const mimeTypes: Record<string, string> = {
    pdf: 'application/pdf',
    csv: 'text/csv',
    xls: 'application/vnd.ms-excel',
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    txt: 'text/plain'
  };
  
  return mimeTypes[extension.toLowerCase()] || 'application/octet-stream';
}

/**
 * Validate file type
 */
export function isValidFileType(mimeType: string): boolean {
  const allowedTypes = [
    'application/pdf',
    'text/csv',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'image/jpeg',
    'image/png',
    'text/plain'
  ];
  
  return allowedTypes.includes(mimeType);
}

/**
 * Get max file size for type
 */
export function getMaxFileSize(mimeType: string): number {
  if (mimeType.startsWith('image/')) {
    return 5 * 1024 * 1024; // 5MB for images
  }
  
  return 10 * 1024 * 1024; // 10MB for documents
}