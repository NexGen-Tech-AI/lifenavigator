import { NextRequest, NextResponse } from 'next/server';
import { subDays, format } from 'date-fns';
import { SleepData } from '@/types/health';
import { createSecureHandlers } from '@/lib/auth/route-helpers';

// Handler for GET request - get sleep data for current user
async function getHandler(req: NextRequest) {
  try {
    // User is guaranteed to be available by withAuth middleware
    const userId = (req as any).user.id;
    
    // Get time range from query parameters
    const searchParams = req.nextUrl.searchParams;
    const timeRange = searchParams.get('timeRange') || '7d';
    
    // Determine number of days based on time range
    const days = timeRange === '7d' ? 7 : 
                timeRange === '14d' ? 14 : 
                timeRange === '30d' ? 30 : 90;
    
    // Generate mock sleep data for development
    // In production, this would fetch from a database
    const mockSleepData = generateMockSleepData(days);
    
    // Log PHI access for compliance
    await logPhiAccess(userId, 'sleep_data', req);
    
    return NextResponse.json(mockSleepData);
  } catch (error) {
    console.error('Error fetching sleep data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sleep data' },
      { status: 500 }
    );
  }
}

// Handler for POST request - log new sleep data
async function postHandler(req: NextRequest) {
  try {
    // User is guaranteed to be available by withAuth middleware
    const userId = (req as any).user.id;
    
    // Parse request body
    const sleepData = await req.json();
    
    // Validate required fields
    if (!sleepData.date || !sleepData.sleepStart || !sleepData.sleepEnd) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Process and calculate sleep metrics
    // In production, this would save to a database
    
    // Log PHI access for compliance
    await logPhiAccess(userId, 'sleep_data_create', req);
    
    // For development, just return the data that would be saved
    return NextResponse.json({
      ...sleepData,
      id: Math.random().toString(36).substring(2, 15),
    });
  } catch (error) {
    console.error('Error logging sleep data:', error);
    return NextResponse.json(
      { error: 'Failed to log sleep data' },
      { status: 500 }
    );
  }
}

// Helper function to generate mock sleep data
function generateMockSleepData(days: number): SleepData[] {
  return Array.from({ length: days }).map((_, index) => {
    const date = subDays(new Date(), days - index - 1);
    const isWeekend = [0, 6].includes(date.getDay());
    
    // Simulate typical sleep patterns (less sleep on weekends, more variability)
    const baseHours = isWeekend ? 7 : 7.5;
    const variance = Math.random() * 2 - 1; // -1 to +1
    const duration = Math.max(4, Math.min(11, baseHours + variance));
    
    // Generate random quality but correlate somewhat with duration
    const qualityBase = 5 + (duration - 6) * 0.8; // More sleep tends to mean better quality
    const quality = Math.max(1, Math.min(10, qualityBase + (Math.random() * 2 - 1)));
    
    // Sleep stages as percentages of total duration
    const deepPercent = 0.15 + Math.random() * 0.1;
    const remPercent = 0.2 + Math.random() * 0.1;
    const lightPercent = 1 - deepPercent - remPercent;
    
    return {
      date: format(date, 'yyyy-MM-dd'),
      duration,
      quality,
      deepSleep: duration * deepPercent,
      remSleep: duration * remPercent,
      lightSleep: duration * lightPercent,
      sleepStart: '22:30',
      sleepEnd: '06:30'
    };
  });
}

// Helper function to log PHI access for HIPAA compliance
async function logPhiAccess(userId: string, dataType: string, request: NextRequest) {
  try {
    // This would integrate with your compliance logging system
    // For now, we'll log to console as a placeholder
    console.log(`PHI ACCESS: User ${userId} accessed ${dataType} data from ${request.ip || 'unknown IP'}`);
    
    // In a real implementation, this would:
    // 1. Write to a secure audit log
    // 2. Include full request details
    // 3. Handle HIPAA-required metadata
  } catch (error) {
    // Log error but don't fail the main request
    console.error('Error logging PHI access:', error);
  }
}

// Create secure route handlers with additional protection for health data
export const { GET, POST } = createSecureHandlers(
  { GET: getHandler, POST: postHandler },
  { 
    requireSetupComplete: true,
    // Additional permissions could be added here for healthcare data
    // For example: requiredPermissions: ['health.read', 'health.write']
  }
);