// app/api/integrations/sync-status/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // In a real app, fetch sync status from the database
    // For now, we'll return mock data
    
    return NextResponse.json({
      status: 'success',
      lastSync: '2025-05-03T12:30:00Z',
      domains: {
        finance: 'success',
        education: 'success',
        career: 'in_progress',
        healthcare: 'success',
        automotive: 'success',
        smarthome: 'success'
      }
    });
  } catch (error) {
    console.error('Error fetching sync status:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}