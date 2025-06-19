/**
 * Simplified encryption wrappers for API usage
 */

import { encryptData, decryptData } from './index';

/**
 * Simple encrypt function for API usage
 */
export async function encrypt(text: string): Promise<string> {
  if (!text) return text;
  return encryptData(text);
}

/**
 * Simple decrypt function for API usage
 */
export async function decrypt(encryptedText: string): Promise<string> {
  if (!encryptedText) return encryptedText;
  return decryptData(encryptedText);
}

// Export sync versions (these are actually async but named for compatibility)
export { encrypt as encryptSync, decrypt as decryptSync };