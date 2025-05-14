/**
 * Password utility that uses bcryptjs (pure JavaScript implementation)
 * This is reliable across all environments, but bcrypt would be faster in production
 */
import bcryptjs from 'bcryptjs';

/**
 * Compare a plain text password with a hashed password
 */
export async function comparePasswords(plainPassword: string, hashedPassword: string): Promise<boolean> {
  return await bcryptjs.compare(plainPassword, hashedPassword);
}

/**
 * Hash a password using bcryptjs
 * @param password Plain text password to hash
 * @param saltRounds Number of salt rounds (default: 12)
 */
export async function hashPassword(password: string, saltRounds: number = 12): Promise<string> {
  return await bcryptjs.hash(password, saltRounds);
}