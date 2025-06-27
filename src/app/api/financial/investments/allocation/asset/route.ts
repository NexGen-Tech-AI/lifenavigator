import { NextResponse } from 'next/server';
import type { AssetAllocation } from '@/types/investment';

// GET /api/financial/investments/allocation/asset - Return asset allocation
export async function GET() {
  const allocation: AssetAllocation = [
    { name: 'Stocks', value: 64.94, color: '#3b82f6' },
    { name: 'Bonds', value: 22.08, color: '#10b981' },
    { name: 'Cash', value: 7.79, color: '#f59e0b' },
    { name: 'Alternatives', value: 5.19, color: '#8b5cf6' }
  ];
  
  return NextResponse.json(allocation);
}