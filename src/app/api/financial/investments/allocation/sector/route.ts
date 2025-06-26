import { NextResponse } from 'next/server';

// GET /api/financial/investments/allocation/sector - Return sector allocation
export async function GET() {
  return NextResponse.json([
    { sector: 'Technology', value: 120000, percent: 31.17, color: '#3b82f6' },
    { sector: 'Healthcare', value: 60000, percent: 15.58, color: '#ec4899' },
    { sector: 'Financials', value: 55000, percent: 14.29, color: '#10b981' },
    { sector: 'Consumer Discretionary', value: 45000, percent: 11.69, color: '#f59e0b' },
    { sector: 'Industrials', value: 40000, percent: 10.39, color: '#8b5cf6' },
    { sector: 'Real Estate', value: 30000, percent: 7.79, color: '#06b6d4' },
    { sector: 'Energy', value: 20000, percent: 5.19, color: '#ef4444' },
    { sector: 'Utilities', value: 15000, percent: 3.90, color: '#84cc16' }
  ]);
}