/**
 * User profile management API
 * GET /api/v1/user - Get current user profile
 * PUT /api/v1/user - Update user profile
 * DELETE /api/v1/user - Delete user account
 */

import { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db-prod';
import {
  withErrorHandler,
  requireAuth,
  validateRequest,
  successResponse,
  NotFoundError,
  AuthorizationError
} from '@/lib/api/route-helpers';
import { createSecurityAuditLog } from '@/lib/services/security-service';
import { hash } from 'bcryptjs';

// Validation schemas
const updateProfileSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  image: z.string().url().optional(),
  preferences: z.object({
    currency: z.string().length(3).optional(),
    timezone: z.string().optional(),
    dateFormat: z.string().optional(),
    notifications: z.object({
      email: z.boolean().optional(),
      push: z.boolean().optional(),
      sms: z.boolean().optional()
    }).optional()
  }).optional()
});

const changePasswordSchema = z.object({
  currentPassword: z.string(),
  newPassword: z.string().min(8).max(100)
});

// GET /api/v1/user - Get current user profile
export const GET = withErrorHandler(async (request: NextRequest) => {
  const sessionUser = await requireAuth(request);
  
  const user = await prisma.user.findUnique({
    where: { id: sessionUser.id },
    include: {
      stripeCustomer: {
        select: {
          subscriptionId: true,
          currentPeriodEnd: true,
          cancelAtPeriodEnd: true
        }
      },
      waitlistEntry: {
        select: {
          position: true,
          referralCode: true,
          referralCount: true
        }
      },
      _count: {
        select: {
          financialAccounts: true,
          transactions: true,
          documents: true,
          goals: true,
          budgets: true
        }
      }
    }
  });
  
  if (!user) {
    throw new NotFoundError('User not found');
  }
  
  // Remove sensitive fields
  const { password, ...userWithoutPassword } = user;
  
  // Add computed fields
  const profile = {
    ...userWithoutPassword,
    stats: {
      accountsCount: user._count.financialAccounts,
      transactionsCount: user._count.transactions,
      documentsCount: user._count.documents,
      goalsCount: user._count.goals,
      budgetsCount: user._count.budgets
    },
    subscription: user.stripeCustomer ? {
      tier: user.subscriptionTier,
      status: user.subscriptionStatus,
      currentPeriodEnd: user.stripeCustomer.currentPeriodEnd,
      cancelAtPeriodEnd: user.stripeCustomer.cancelAtPeriodEnd,
      isPilotMember: user.isPilotMember,
      pilotDiscount: user.pilotDiscount
    } : null
  };
  
  return successResponse(profile);
});

// PUT /api/v1/user - Update user profile
export const PUT = withErrorHandler(async (request: NextRequest) => {
  const sessionUser = await requireAuth(request);
  
  // Demo users cannot update profile
  if (sessionUser.isDemoAccount) {
    throw new AuthorizationError('Demo account cannot be modified');
  }
  
  const data = await validateRequest(request, updateProfileSchema);
  
  const updatedUser = await prisma.user.update({
    where: { id: sessionUser.id },
    data: {
      name: data.name,
      image: data.image,
      // Store preferences in a separate table or as JSON
      // For now, we'll extend the schema later
    },
    select: {
      id: true,
      email: true,
      name: true,
      image: true,
      role: true,
      subscriptionTier: true,
      updatedAt: true
    }
  });
  
  await createSecurityAuditLog({
    userId: sessionUser.id,
    event: 'Profile updated',
    eventType: 'PERMISSION_CHANGED',
    metadata: { changes: data }
  });
  
  return successResponse(updatedUser, 'Profile updated successfully');
});

// DELETE /api/v1/user - Delete user account
export const DELETE = withErrorHandler(async (request: NextRequest) => {
  const sessionUser = await requireAuth(request);
  
  // Demo users cannot delete account
  if (sessionUser.isDemoAccount) {
    throw new AuthorizationError('Demo account cannot be deleted');
  }
  
  // Verify password before deletion
  const { password } = await request.json();
  if (!password) {
    throw new AuthorizationError('Password required for account deletion');
  }
  
  const user = await prisma.user.findUnique({
    where: { id: sessionUser.id }
  });
  
  if (!user?.password) {
    throw new NotFoundError('User not found');
  }
  
  const isValid = await hash(password, user.password);
  if (!isValid) {
    throw new AuthorizationError('Invalid password');
  }
  
  // Create final audit log before deletion
  await createSecurityAuditLog({
    userId: sessionUser.id,
    event: 'Account deletion initiated',
    eventType: 'ACCOUNT_DELETED'
  });
  
  // Soft delete or anonymize instead of hard delete
  // This preserves audit trails and allows recovery
  await prisma.user.update({
    where: { id: sessionUser.id },
    data: {
      email: `deleted_${sessionUser.id}@deleted.com`,
      name: 'Deleted User',
      password: null,
      image: null,
      // Mark as deleted without actually removing
      role: 'USER',
      subscriptionTier: 'FREE',
      subscriptionStatus: 'CANCELED'
    }
  });
  
  return successResponse(null, 'Account deleted successfully');
});

// POST /api/v1/user/change-password - Change password
export const POST = withErrorHandler(async (request: NextRequest) => {
  const sessionUser = await requireAuth(request);
  
  // Demo users cannot change password
  if (sessionUser.isDemoAccount) {
    throw new AuthorizationError('Demo account password cannot be changed');
  }
  
  const data = await validateRequest(request, changePasswordSchema);
  
  const user = await prisma.user.findUnique({
    where: { id: sessionUser.id }
  });
  
  if (!user?.password) {
    throw new NotFoundError('User not found');
  }
  
  // Verify current password
  const isValid = await hash(data.currentPassword, user.password);
  if (!isValid) {
    await createSecurityAuditLog({
      userId: sessionUser.id,
      event: 'Failed password change - invalid current password',
      eventType: 'PASSWORD_CHANGED'
    });
    throw new AuthorizationError('Current password is incorrect');
  }
  
  // Hash new password
  const hashedPassword = await hash(data.newPassword, 12);
  
  // Update password
  await prisma.user.update({
    where: { id: sessionUser.id },
    data: { password: hashedPassword }
  });
  
  await createSecurityAuditLog({
    userId: sessionUser.id,
    event: 'Password changed successfully',
    eventType: 'PASSWORD_CHANGED'
  });
  
  return successResponse(null, 'Password changed successfully');
});