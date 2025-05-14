/**
 * Admin Metrics API
 * 
 * This route provides system metrics for admin dashboards.
 * It is protected by both admin authentication and API gateway security.
 */
import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth/session';
import { apiGateways } from '@/lib/middleware/api-gateway';
import { prisma } from '@/lib/db';

/**
 * Handler for the GET request
 */
async function handler(request: NextRequest) {
  try {
    // User and role validation is handled by withAuth middleware
    const user = (request as any).user;
    
    // Only allow admin users
    if (user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }
    
    // Get API key role if available (from API gateway)
    const apiKeyRole = (request as any).apiKeyRole;
    
    // Get system metrics
    const userCount = await prisma.user.count();
    const activeSessionCount = await prisma.session.count({
      where: {
        expires: {
          gt: new Date(),
        },
      },
    });
    
    // Get financial metrics
    const financialRecordCount = await prisma.financialRecord.count();
    const investmentCount = await prisma.investment.count();
    
    // Get health metrics
    const healthRecordCount = await prisma.healthRecord.count();
    
    // Return metrics
    return NextResponse.json({
      timestamp: new Date().toISOString(),
      requestedBy: {
        userId: user.id,
        role: user.role,
        apiKeyRole: apiKeyRole || 'none',
      },
      metrics: {
        system: {
          userCount,
          activeSessionCount,
        },
        financial: {
          recordCount: financialRecordCount,
          investmentCount,
        },
        health: {
          recordCount: healthRecordCount,
        },
      }
    });
  } catch (error) {
    console.error('Error fetching admin metrics:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching metrics' },
      { status: 500 }
    );
  }
}

// Apply the withAuth middleware for authentication
const authenticatedHandler = withAuth(handler, {
  allowedMethods: ['GET'],
  requiredRole: 'admin',
});

// Apply the admin API gateway for additional security
export const GET = apiGateways.admin(authenticatedHandler);