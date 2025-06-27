import { NextResponse } from 'next/server';
import type { SectorAllocation } from '@/types/investment';

// GET /api/financial/investments/allocation/sector - Return sector allocation
export async function GET() {
  const allocation: SectorAllocation = [
    { name: 'Technology', value: 31.17, color: '#3b82f6' },
    { name: 'Healthcare', value: 15.58, color: '#ec4899' },
    { name: 'Financials', value: 14.29, color: '#10b981' },
    { name: 'Consumer Discretionary', value: 11.69, color: '#f59e0b' },
    { name: 'Industrials', value: 10.39, color: '#8b5cf6' },
    { name: 'Real Estate', value: 7.79, color: '#06b6d4' },
    { name: 'Energy', value: 5.19, color: '#ef4444' },
    { name: 'Utilities', value: 3.90, color: '#84cc16' }
  ];
  
  return NextResponse.json(allocation);
}