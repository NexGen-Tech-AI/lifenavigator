/**
 * Password utility using bcrypt
 */
import { compare } from 'bcrypt';

export async function comparePasswords(plainPassword: string, hashedPassword: string): Promise<boolean> {
  return await compare(plainPassword, hashedPassword);
}