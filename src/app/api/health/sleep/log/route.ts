import { NextRequest, NextResponse } from 'next/server';
import { SleepData } from '@/types/health';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/NextAuth';

export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse request body
    const sleepEntryData = await req.json();
    
    // Validate required fields
    if (!sleepEntryData.date || sleepEntryData.quality === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Calculate sleep duration if bedtime and wake time are provided
    if (sleepEntryData.sleepStart && sleepEntryData.sleepEnd) {
      // This is a simplified calculation - in a real app, you'd handle cases like sleeping past midnight
      const [startHour, startMinute] = sleepEntryData.sleepStart.split(':').map(Number);
      const [endHour, endMinute] = sleepEntryData.sleepEnd.split(':').map(Number);
      
      let durationHours = endHour - startHour;
      if (durationHours < 0) durationHours += 24; // Handle sleeping past midnight
      
      let durationMinutes = endMinute - startMinute;
      if (durationMinutes < 0) {
        durationMinutes += 60;
        durationHours -= 1;
      }
      
      const duration = durationHours + (durationMinutes / 60);
      sleepEntryData.duration = parseFloat(duration.toFixed(1));
      
      // Estimate sleep stages based on typical percentages
      sleepEntryData.deepSleep = parseFloat((duration * 0.2).toFixed(1)); // ~20% deep sleep
      sleepEntryData.remSleep = parseFloat((duration * 0.25).toFixed(1));  // ~25% REM sleep
      sleepEntryData.lightSleep = parseFloat((duration * 0.55).toFixed(1)); // ~55% light sleep
    }
    
    // In a real application, this would be saved to a database
    // For development, we'll just return a success response with the processed data
    
    const savedSleepEntry: SleepData = {
      date: sleepEntryData.date,
      duration: sleepEntryData.duration || 0,
      quality: sleepEntryData.quality,
      deepSleep: sleepEntryData.deepSleep || 0,
      remSleep: sleepEntryData.remSleep || 0,
      lightSleep: sleepEntryData.lightSleep || 0,
      sleepStart: sleepEntryData.sleepStart || '',
      sleepEnd: sleepEntryData.sleepEnd || ''
    };
    
    return NextResponse.json(savedSleepEntry);
  } catch (error) {
    console.error('Error logging sleep entry:', error);
    return NextResponse.json(
      { error: 'Failed to log sleep entry' },
      { status: 500 }
    );
  }
}