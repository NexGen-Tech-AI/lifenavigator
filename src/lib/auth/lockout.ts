/**
 * Account lockout mechanism to prevent brute force attacks
 */
import { prisma } from '@/lib/db';

// Constants
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MINUTES = 15;

interface FailedLoginAttempt {
  timestamp: Date;
}

/**
 * Record a failed login attempt for a user
 */
export async function recordFailedLoginAttempt(email: string): Promise<boolean> {
  try {
    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, metadata: true }
    });

    if (!user) {
      // If user doesn't exist, don't record the attempt (prevents user enumeration)
      return false;
    }

    // Get current metadata or initialize empty object
    const metadata = user.metadata ? { ...(user.metadata as any) } : {};
    
    // Initialize failedLoginAttempts if it doesn't exist
    if (!metadata.failedLoginAttempts) {
      metadata.failedLoginAttempts = [];
    }
    
    // Clean up old attempts (older than lockout duration)
    const now = new Date();
    const cutoffTime = new Date(now.getTime() - LOCKOUT_DURATION_MINUTES * 60 * 1000);
    metadata.failedLoginAttempts = (metadata.failedLoginAttempts as FailedLoginAttempt[])
      .filter(attempt => new Date(attempt.timestamp) > cutoffTime);
    
    // Add new failed attempt
    metadata.failedLoginAttempts.push({
      timestamp: now
    });
    
    // Update user metadata
    await prisma.user.update({
      where: { id: user.id },
      data: { metadata }
    });
    
    // Return true if account should be locked
    return metadata.failedLoginAttempts.length >= MAX_FAILED_ATTEMPTS;
  } catch (error) {
    console.error('Error recording failed login attempt:', error);
    return false;
  }
}

/**
 * Check if a user account is locked
 */
export async function isAccountLocked(email: string): Promise<boolean> {
  try {
    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
      select: { metadata: true }
    });

    if (!user || !user.metadata) {
      return false;
    }

    const metadata = user.metadata as any;
    
    // If no failed attempts, account is not locked
    if (!metadata.failedLoginAttempts || !Array.isArray(metadata.failedLoginAttempts)) {
      return false;
    }
    
    // Clean up old attempts
    const now = new Date();
    const cutoffTime = new Date(now.getTime() - LOCKOUT_DURATION_MINUTES * 60 * 1000);
    const recentAttempts = metadata.failedLoginAttempts
      .filter((attempt: FailedLoginAttempt) => new Date(attempt.timestamp) > cutoffTime);
    
    // If there are enough recent attempts, account is locked
    return recentAttempts.length >= MAX_FAILED_ATTEMPTS;
  } catch (error) {
    console.error('Error checking account lock status:', error);
    return false;
  }
}

/**
 * Reset failed login attempts for a user after successful login
 */
export async function resetFailedLoginAttempts(email: string): Promise<void> {
  try {
    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, metadata: true }
    });

    if (!user || !user.metadata) {
      return;
    }

    // Get current metadata
    const metadata = { ...(user.metadata as any) };
    
    // Reset failed login attempts
    metadata.failedLoginAttempts = [];
    
    // Update user metadata
    await prisma.user.update({
      where: { id: user.id },
      data: { metadata }
    });
  } catch (error) {
    console.error('Error resetting failed login attempts:', error);
  }
}

/**
 * Get remaining lockout time in seconds
 * Returns 0 if not locked
 */
export async function getLockoutTimeRemaining(email: string): Promise<number> {
  try {
    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
      select: { metadata: true }
    });

    if (!user || !user.metadata) {
      return 0;
    }

    const metadata = user.metadata as any;
    
    // If no failed attempts, no lockout
    if (!metadata.failedLoginAttempts || !Array.isArray(metadata.failedLoginAttempts) || metadata.failedLoginAttempts.length === 0) {
      return 0;
    }
    
    // Find most recent attempt
    const attempts = metadata.failedLoginAttempts.map((attempt: FailedLoginAttempt) => new Date(attempt.timestamp));
    const mostRecentAttempt = new Date(Math.max(...attempts.map(date => date.getTime())));
    
    // Calculate lockout end time
    const lockoutEndTime = new Date(mostRecentAttempt.getTime() + LOCKOUT_DURATION_MINUTES * 60 * 1000);
    const now = new Date();
    
    // If lockout has expired, return 0
    if (now >= lockoutEndTime) {
      return 0;
    }
    
    // Return remaining time in seconds
    return Math.ceil((lockoutEndTime.getTime() - now.getTime()) / 1000);
  } catch (error) {
    console.error('Error getting lockout time remaining:', error);
    return 0;
  }
}