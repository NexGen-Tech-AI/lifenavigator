import { NextRequest, NextResponse } from 'next/server';
import { subDays, format } from 'date-fns';
import { SleepData } from '@/types/health';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/NextAuth';

export async function GET(req: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

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
    
    return NextResponse.json(mockSleepData);
  } catch (error) {
    console.error('Error fetching sleep data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sleep data' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

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