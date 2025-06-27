import { NextResponse } from 'next/server';
import type { InvestmentHolding } from '@/types/investment';

// GET /api/financial/investments/holdings - Return investment holdings
export async function GET() {
  const holdings: InvestmentHolding[] = [
    {
      id: '1',
      ticker: 'VTI',
      name: 'Vanguard Total Stock Market ETF',
      type: 'ETF',
      sector: 'Broad Market',
      shares: 100,
      price: 220,
      value: 22000,
      costBasis: 20000,
      gainLoss: 2000,
      gainLossPercent: 10,
      allocation: 5.71
    },
    {
      id: '2', 
      ticker: 'AAPL',
      name: 'Apple Inc.',
      type: 'Stock',
      sector: 'Technology',
      shares: 150,
      price: 180,
      value: 27000,
      costBasis: 22500,
      gainLoss: 4500,
      gainLossPercent: 20,
      allocation: 7.01
    },
    {
      id: '3',
      ticker: 'BND',
      name: 'Vanguard Total Bond Market ETF',
      type: 'ETF',
      sector: 'Bonds',
      shares: 200,
      price: 82,
      value: 16400,
      costBasis: 16000,
      gainLoss: 400,
      gainLossPercent: 2.5,
      allocation: 4.26
    },
    {
      id: '4',
      ticker: 'MSFT',
      name: 'Microsoft Corporation',
      type: 'Stock',
      sector: 'Technology',
      shares: 80,
      price: 380,
      value: 30400,
      costBasis: 24000,
      gainLoss: 6400,
      gainLossPercent: 26.67,
      allocation: 7.89
    },
    {
      id: '5',
      ticker: 'VOO',
      name: 'Vanguard S&P 500 ETF',
      type: 'ETF',
      sector: 'Large Cap',
      shares: 50,
      price: 450,
      value: 22500,
      costBasis: 20000,
      gainLoss: 2500,
      gainLossPercent: 12.5,
      allocation: 5.84
    }
  ];

  return NextResponse.json(holdings);
}