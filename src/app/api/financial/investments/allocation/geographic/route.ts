import { NextResponse } from 'next/server';
import type { GeographicAllocation } from '@/types/investment';

// GET /api/financial/investments/allocation/geographic - Return geographic allocation
export async function GET() {
  const allocation: GeographicAllocation = [
    { name: 'United States', value: 70.13, color: '#3b82f6' },
    { name: 'International Developed', value: 20.78, color: '#10b981' },
    { name: 'Emerging Markets', value: 9.09, color: '#f59e0b' }
  ];
  
  return NextResponse.json(allocation);
}