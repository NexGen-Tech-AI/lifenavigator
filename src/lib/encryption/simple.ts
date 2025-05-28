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

// Re-export the original functions for backward compatibility
export { encrypt as encryptSync, decrypt as decryptSync } from './index';