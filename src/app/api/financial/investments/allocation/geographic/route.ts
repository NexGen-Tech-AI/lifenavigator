import { NextResponse } from 'next/server';

// GET /api/financial/investments/allocation/geographic - Return geographic allocation
export async function GET() {
  return NextResponse.json([
    { region: 'United States', value: 270000, percent: 70.13, color: '#3b82f6' },
    { region: 'International Developed', value: 80000, percent: 20.78, color: '#10b981' },
    { region: 'Emerging Markets', value: 35000, percent: 9.09, color: '#f59e0b' }
  ]);
}