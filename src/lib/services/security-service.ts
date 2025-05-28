/**
 * Security service for audit logging and protection features
 */

import { prisma } from '@/lib/db-prod';
import { AuditEventType } from '@prisma/client';
import { headers } from 'next/headers';

interface SecurityAuditLogInput {
  userId?: string;
  event: string;
  eventType: AuditEventType;
  metadata?: any;
}

/**
 * Create a security audit log entry
 */
export async function createSecurityAuditLog(input: SecurityAuditLogInput) {
  try {
    const headersList = headers();
    const ipAddress = headersList.get('x-forwarded-for') || 
                     headersList.get('x-real-ip') || 
                     'unknown';
    const userAgent = headersList.get('user-agent') || 'unknown';

    await prisma.securityAuditLog.create({
      data: {
        userId: input.userId,
        event: input.event,
        eventType: input.eventType,
        ipAddress: ipAddress.split(',')[0].trim(), // Get first IP if multiple
        userAgent: userAgent.substring(0, 255), // Limit length
        metadata: input.metadata
      }
    });
  } catch (error) {
    // Log to console but don't throw - audit logging shouldn't break the app
    console.error('Failed to create security audit log:', error);
  }
}

/**
 * Get recent security events for a user
 */
export async function getUserSecurityEvents(
  userId: string,
  limit = 10
) {
  return prisma.securityAuditLog.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: limit
  });
}

/**
 * Check for suspicious activity
 */
export async function checkSuspiciousActivity(userId: string): Promise<{
  isSuspicious: boolean;
  reason?: string;
}> {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  
  // Check for multiple failed login attempts
  const failedLogins = await prisma.securityAuditLog.count({
    where: {
      userId,
      eventType: 'LOGIN_FAILED',
      createdAt: { gte: oneHourAgo }
    }
  });
  
  if (failedLogins >= 3) {
    return {
      isSuspicious: true,
      reason: 'Multiple failed login attempts'
    };
  }
  
  // Check for logins from multiple IPs
  const recentLogins = await prisma.securityAuditLog.findMany({
    where: {
      userId,
      eventType: 'LOGIN_SUCCESS',
      createdAt: { gte: oneHourAgo }
    },
    select: { ipAddress: true },
    distinct: ['ipAddress']
  });
  
  if (recentLogins.length >= 3) {
    return {
      isSuspicious: true,
      reason: 'Logins from multiple IP addresses'
    };
  }
  
  // Check for rapid data exports
  const dataExports = await prisma.securityAuditLog.count({
    where: {
      userId,
      eventType: 'DATA_EXPORT',
      createdAt: { gte: oneHourAgo }
    }
  });
  
  if (dataExports >= 5) {
    return {
      isSuspicious: true,
      reason: 'Multiple data export requests'
    };
  }
  
  return { isSuspicious: false };
}

/**
 * Rate limiting check
 */
export async function checkRateLimit(
  identifier: string,
  action: string,
  maxAttempts: number,
  windowMs: number
): Promise<{ allowed: boolean; remainingAttempts: number }> {
  const windowStart = new Date(Date.now() - windowMs);
  
  const attempts = await prisma.securityAuditLog.count({
    where: {
      event: `rate_limit:${action}:${identifier}`,
      createdAt: { gte: windowStart }
    }
  });
  
  if (attempts >= maxAttempts) {
    return { allowed: false, remainingAttempts: 0 };
  }
  
  // Log this attempt
  await prisma.securityAuditLog.create({
    data: {
      event: `rate_limit:${action}:${identifier}`,
      eventType: 'LOGIN_FAILED', // Using as a general rate limit type
      metadata: { action, identifier }
    }
  });
  
  return { 
    allowed: true, 
    remainingAttempts: maxAttempts - attempts - 1 
  };
}

/**
 * Clean up old audit logs (run periodically)
 */
export async function cleanupOldAuditLogs(daysToKeep = 90) {
  const cutoffDate = new Date(Date.now() - daysToKeep * 24 * 60 * 60 * 1000);
  
  const result = await prisma.securityAuditLog.deleteMany({
    where: {
      createdAt: { lt: cutoffDate }
    }
  });
  
  return result.count;
}

/**
 * Generate security report for a user
 */
export async function generateSecurityReport(userId: string) {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  
  const [
    totalLogins,
    failedLogins,
    uniqueIPs,
    dataExports,
    securityChanges
  ] = await Promise.all([
    prisma.securityAuditLog.count({
      where: {
        userId,
        eventType: 'LOGIN_SUCCESS',
        createdAt: { gte: thirtyDaysAgo }
      }
    }),
    prisma.securityAuditLog.count({
      where: {
        userId,
        eventType: 'LOGIN_FAILED',
        createdAt: { gte: thirtyDaysAgo }
      }
    }),
    prisma.securityAuditLog.findMany({
      where: {
        userId,
        eventType: 'LOGIN_SUCCESS',
        createdAt: { gte: thirtyDaysAgo }
      },
      select: { ipAddress: true },
      distinct: ['ipAddress']
    }),
    prisma.securityAuditLog.count({
      where: {
        userId,
        eventType: 'DATA_EXPORT',
        createdAt: { gte: thirtyDaysAgo }
      }
    }),
    prisma.securityAuditLog.count({
      where: {
        userId,
        eventType: {
          in: ['PASSWORD_CHANGED', 'MFA_ENABLED', 'MFA_DISABLED']
        },
        createdAt: { gte: thirtyDaysAgo }
      }
    })
  ]);
  
  return {
    period: '30 days',
    totalLogins,
    failedLogins,
    uniqueIPCount: uniqueIPs.length,
    dataExports,
    securityChanges,
    generatedAt: new Date()
  };
}