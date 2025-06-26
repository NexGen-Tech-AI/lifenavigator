import { NextResponse } from 'next/server';

// GET /api/financial/investments/holdings - Return investment holdings
export async function GET() {
  return NextResponse.json([
    {
      id: '1',
      symbol: 'VTI',
      name: 'Vanguard Total Stock Market ETF',
      quantity: 100,
      avgCost: 200,
      currentPrice: 220,
      value: 22000,
      gainLoss: 2000,
      gainLossPercent: 10,
      allocation: 5.71,
      dayChange: 100,
      dayChangePercent: 0.45,
      type: 'ETF',
      sector: 'Broad Market',
      lastUpdated: new Date().toISOString()
    },
    {
      id: '2', 
      symbol: 'AAPL',
      name: 'Apple Inc.',
      quantity: 150,
      avgCost: 150,
      currentPrice: 180,
      value: 27000,
      gainLoss: 4500,
      gainLossPercent: 20,
      allocation: 7.01,
      dayChange: 150,
      dayChangePercent: 0.56,
      type: 'Stock',
      sector: 'Technology',
      lastUpdated: new Date().toISOString()
    },
    {
      id: '3',
      symbol: 'BND',
      name: 'Vanguard Total Bond Market ETF',
      quantity: 200,
      avgCost: 80,
      currentPrice: 82,
      value: 16400,
      gainLoss: 400,
      gainLossPercent: 2.5,
      allocation: 4.26,
      dayChange: -50,
      dayChangePercent: -0.30,
      type: 'ETF',
      sector: 'Bonds',
      lastUpdated: new Date().toISOString()
    },
    {
      id: '4',
      symbol: 'MSFT',
      name: 'Microsoft Corporation',
      quantity: 80,
      avgCost: 300,
      currentPrice: 380,
      value: 30400,
      gainLoss: 6400,
      gainLossPercent: 26.67,
      allocation: 7.89,
      dayChange: 200,
      dayChangePercent: 0.66,
      type: 'Stock',
      sector: 'Technology',
      lastUpdated: new Date().toISOString()
    },
    {
      id: '5',
      symbol: 'VOO',
      name: 'Vanguard S&P 500 ETF',
      quantity: 50,
      avgCost: 400,
      currentPrice: 450,
      value: 22500,
      gainLoss: 2500,
      gainLossPercent: 12.5,
      allocation: 5.84,
      dayChange: 80,
      dayChangePercent: 0.36,
      type: 'ETF',
      sector: 'Large Cap',
      lastUpdated: new Date().toISOString()
    }
  ]);
}