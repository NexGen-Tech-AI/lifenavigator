/**
 * Production-grade encryption service for sensitive data
 * Uses AES-256-GCM encryption with AWS KMS for key management
 */

import crypto from 'crypto';
import { KMSClient, EncryptCommand, DecryptCommand, GenerateDataKeyCommand } from '@aws-sdk/client-kms';
import { env } from '@/lib/env';
import { createClient } from '@/lib/supabase/server';

// Initialize KMS client
const kmsClient = new KMSClient({
  region: env.AWS_REGION,
  credentials: {
    accessKeyId: env.AWS_ACCESS_KEY_ID,
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
  },
});

// Encryption configuration
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const TAG_LENGTH = 16;
const SALT_LENGTH = 32;
const KEY_LENGTH = 32;
const ITERATIONS = 100000;

/**
 * Field-level encryption configuration
 * Defines which fields should be encrypted in each table
 */
export const ENCRYPTED_FIELDS = {
  users: ['mfa_secret', 'phone'],
  financial_accounts: ['account_number_encrypted', 'routing_number_encrypted', 'plaid_access_token_encrypted'],
  integrations: ['access_token_encrypted', 'refresh_token_encrypted', 'webhook_secret_encrypted'],
  health_records: ['details_encrypted'],
  documents: ['encrypted_metadata'],
} as const;

/**
 * Encryption context for audit logging
 */
interface EncryptionContext {
  userId: string;
  tableName: string;
  fieldName: string;
  operation: 'encrypt' | 'decrypt';
}

/**
 * Encrypted data structure
 */
interface EncryptedData {
  ciphertext: string;
  iv: string;
  tag: string;
  keyId: string;
  algorithm: string;
  version: number;
}

/**
 * Generates a data encryption key using AWS KMS
 */
async function generateDataKey(): Promise<{ plaintext: Buffer; encrypted: Buffer; keyId: string }> {
  const command = new GenerateDataKeyCommand({
    KeyId: env.AWS_KMS_KEY_ID,
    KeySpec: 'AES_256',
  });

  const response = await kmsClient.send(command);
  
  if (!response.Plaintext || !response.CiphertextBlob || !response.KeyId) {
    throw new Error('Failed to generate data key from KMS');
  }

  return {
    plaintext: Buffer.from(response.Plaintext),
    encrypted: Buffer.from(response.CiphertextBlob),
    keyId: response.KeyId,
  };
}

/**
 * Encrypts data using AES-256-GCM with KMS-managed keys
 */
export async function encryptField(
  plaintext: string,
  context: EncryptionContext
): Promise<string> {
  try {
    // Generate a new data key for this encryption
    const { plaintext: dataKey, encrypted: encryptedDataKey, keyId } = await generateDataKey();

    // Generate random IV
    const iv = crypto.randomBytes(IV_LENGTH);

    // Create cipher
    const cipher = crypto.createCipheriv(ALGORITHM, dataKey, iv);

    // Add authenticated data (context)
    const authData = JSON.stringify({
      userId: context.userId,
      tableName: context.tableName,
      fieldName: context.fieldName,
      timestamp: new Date().toISOString(),
    });
    cipher.setAAD(Buffer.from(authData, 'utf8'));

    // Encrypt the data
    const encrypted = Buffer.concat([
      cipher.update(plaintext, 'utf8'),
      cipher.final(),
    ]);

    // Get the authentication tag
    const tag = cipher.getAuthTag();

    // Combine all components
    const encryptedData: EncryptedData = {
      ciphertext: encrypted.toString('base64'),
      iv: iv.toString('base64'),
      tag: tag.toString('base64'),
      keyId: keyId,
      algorithm: ALGORITHM,
      version: 1,
    };

    // Store the encrypted data key alongside the encrypted data
    const result = {
      data: encryptedData,
      encryptedKey: encryptedDataKey.toString('base64'),
    };

    // Log encryption event
    await logEncryptionEvent(context, 'success');

    // Return as base64-encoded JSON
    return Buffer.from(JSON.stringify(result)).toString('base64');
  } catch (error) {
    await logEncryptionEvent(context, 'failure', error);
    throw new Error(`Encryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Decrypts data encrypted with encryptField
 */
export async function decryptField(
  encryptedData: string,
  context: EncryptionContext
): Promise<string> {
  try {
    // Parse the encrypted data
    const parsed = JSON.parse(Buffer.from(encryptedData, 'base64').toString('utf8'));
    const { data, encryptedKey } = parsed;

    // Decrypt the data key using KMS
    const decryptCommand = new DecryptCommand({
      CiphertextBlob: Buffer.from(encryptedKey, 'base64'),
      KeyId: env.AWS_KMS_KEY_ID,
    });

    const decryptResponse = await kmsClient.send(decryptCommand);
    
    if (!decryptResponse.Plaintext) {
      throw new Error('Failed to decrypt data key');
    }

    const dataKey = Buffer.from(decryptResponse.Plaintext);

    // Extract components
    const iv = Buffer.from(data.iv, 'base64');
    const tag = Buffer.from(data.tag, 'base64');
    const ciphertext = Buffer.from(data.ciphertext, 'base64');

    // Create decipher
    const decipher = crypto.createDecipheriv(ALGORITHM, dataKey, iv);
    decipher.setAuthTag(tag);

    // Add authenticated data (must match encryption)
    const authData = JSON.stringify({
      userId: context.userId,
      tableName: context.tableName,
      fieldName: context.fieldName,
      timestamp: new Date().toISOString(),
    });
    decipher.setAAD(Buffer.from(authData, 'utf8'));

    // Decrypt
    const decrypted = Buffer.concat([
      decipher.update(ciphertext),
      decipher.final(),
    ]);

    // Log decryption event
    await logEncryptionEvent(context, 'success');

    return decrypted.toString('utf8');
  } catch (error) {
    await logEncryptionEvent(context, 'failure', error);
    throw new Error(`Decryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Encrypts multiple fields in an object
 */
export async function encryptFields<T extends Record<string, any>>(
  data: T,
  tableName: keyof typeof ENCRYPTED_FIELDS,
  userId: string
): Promise<T> {
  const encryptedData = { ...data };
  const fieldsToEncrypt = ENCRYPTED_FIELDS[tableName] || [];

  for (const field of fieldsToEncrypt) {
    if (data[field] && typeof data[field] === 'string') {
      const context: EncryptionContext = {
        userId,
        tableName,
        fieldName: field,
        operation: 'encrypt',
      };
      encryptedData[field] = await encryptField(data[field], context);
    }
  }

  return encryptedData;
}

/**
 * Decrypts multiple fields in an object
 */
export async function decryptFields<T extends Record<string, any>>(
  data: T,
  tableName: keyof typeof ENCRYPTED_FIELDS,
  userId: string
): Promise<T> {
  const decryptedData = { ...data };
  const fieldsToDecrypt = ENCRYPTED_FIELDS[tableName] || [];

  for (const field of fieldsToDecrypt) {
    if (data[field] && typeof data[field] === 'string') {
      try {
        const context: EncryptionContext = {
          userId,
          tableName,
          fieldName: field,
          operation: 'decrypt',
        };
        decryptedData[field] = await decryptField(data[field], context);
      } catch (error) {
        // Log error but don't fail the entire operation
        console.error(`Failed to decrypt field ${field}:`, error);
        decryptedData[field] = null;
      }
    }
  }

  return decryptedData;
}

/**
 * Hashes sensitive data for searching (one-way)
 */
export function hashForSearch(value: string, salt?: string): string {
  const actualSalt = salt || crypto.randomBytes(SALT_LENGTH).toString('hex');
  const hash = crypto.pbkdf2Sync(value, actualSalt, ITERATIONS, KEY_LENGTH, 'sha256');
  return `${actualSalt}:${hash.toString('hex')}`;
}

/**
 * Verifies a value against a hash
 */
export function verifyHash(value: string, hash: string): boolean {
  const [salt, hashValue] = hash.split(':');
  const testHash = crypto.pbkdf2Sync(value, salt, ITERATIONS, KEY_LENGTH, 'sha256');
  return testHash.toString('hex') === hashValue;
}

/**
 * Logs encryption/decryption events for audit
 */
async function logEncryptionEvent(
  context: EncryptionContext,
  status: 'success' | 'failure',
  error?: any
): Promise<void> {
  try {
    const supabase = await createClient();
    
    await supabase.from('audit_logs').insert({
      user_id: context.userId,
      event_type: `ENCRYPTION_${context.operation.toUpperCase()}`,
      event_category: 'SECURITY',
      description: `${context.operation} operation on ${context.tableName}.${context.fieldName}`,
      entity_type: context.tableName,
      new_values: {
        status,
        field: context.fieldName,
        error: error?.message,
      },
    });
  } catch (logError) {
    console.error('Failed to log encryption event:', logError);
  }
}

/**
 * Generates a secure random token
 */
export function generateSecureToken(length: number = 32): string {
  return crypto.randomBytes(length).toString('base64url');
}

/**
 * Encrypts data for client-side storage (less secure, for non-critical data)
 */
export function encryptForClient(data: string, password: string): string {
  const salt = crypto.randomBytes(SALT_LENGTH);
  const key = crypto.pbkdf2Sync(password, salt, ITERATIONS, KEY_LENGTH, 'sha256');
  const iv = crypto.randomBytes(IV_LENGTH);
  
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([cipher.update(data, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  
  return Buffer.concat([salt, iv, tag, encrypted]).toString('base64');
}

/**
 * Decrypts data encrypted for client-side storage
 */
export function decryptFromClient(encryptedData: string, password: string): string {
  const buffer = Buffer.from(encryptedData, 'base64');
  
  const salt = buffer.slice(0, SALT_LENGTH);
  const iv = buffer.slice(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
  const tag = buffer.slice(SALT_LENGTH + IV_LENGTH, SALT_LENGTH + IV_LENGTH + TAG_LENGTH);
  const encrypted = buffer.slice(SALT_LENGTH + IV_LENGTH + TAG_LENGTH);
  
  const key = crypto.pbkdf2Sync(password, salt, ITERATIONS, KEY_LENGTH, 'sha256');
  
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(tag);
  
  return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString('utf8');
}