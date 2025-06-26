import { NextResponse } from 'next/server';

// GET /api/financial/investments/allocation/asset - Return asset allocation
export async function GET() {
  return NextResponse.json([
    { category: 'Stocks', value: 250000, percent: 64.94, color: '#3b82f6' },
    { category: 'Bonds', value: 85000, percent: 22.08, color: '#10b981' },
    { category: 'Cash', value: 30000, percent: 7.79, color: '#f59e0b' },
    { category: 'Alternatives', value: 20000, percent: 5.19, color: '#8b5cf6' }
  ]);
}