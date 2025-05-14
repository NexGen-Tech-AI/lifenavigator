/**
 * Internal Health Check API
 * 
 * This route is for internal service health checks and requires
 * cross-service authentication.
 */
import { NextRequest, NextResponse } from 'next/server';
import { withCrossServiceAuth } from '@/lib/middleware/cross-service-auth';
import { prisma } from '@/lib/db';

/**
 * Handler for the health check request
 */
async function handler(request: NextRequest) {
  try {
    // Get service information added by the middleware
    const service = (request as any).service;
    
    // Check database connection
    const dbCheck = await checkDatabase();
    
    // Build response
    const healthData = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: process.env.APP_ENV || 'local',
      requestedBy: service?.name || 'unknown',
      checks: {
        database: dbCheck.ok ? 'ok' : 'error',
      }
    };
    
    return NextResponse.json(healthData);
  } catch (error) {
    console.error('Health check failed:', error);
    
    return NextResponse.json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}

/**
 * Check database connection
 */
async function checkDatabase() {
  try {
    // Try to execute a simple query
    await prisma.$queryRaw`SELECT 1 AS health_check`;
    return { ok: true };
  } catch (error) {
    console.error('Database health check failed:', error);
    return { ok: false, error };
  }
}

// Apply the cross-service auth middleware with strict mode
export const GET = withCrossServiceAuth(handler, {
  strict: true,
  requiredServices: [
    'financial-service',
    'health-service',
    'career-service',
    'education-service',
    'analytics-service',
    'admin-dashboard'
  ],
});