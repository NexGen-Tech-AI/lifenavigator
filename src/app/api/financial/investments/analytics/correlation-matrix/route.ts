import { NextResponse } from 'next/server';

// GET /api/financial/investments/analytics/correlation-matrix - Return asset correlation matrix
export async function GET() {
  const correlationMatrix = {
    assets: ['US Stocks', 'Int\'l Stocks', 'Bonds', 'REITs', 'Commodities'],
    matrix: [
      [1.00, 0.65, -0.12, 0.78, 0.25],  // US Stocks
      [0.65, 1.00, -0.08, 0.82, 0.31],  // Int'l Stocks
      [-0.12, -0.08, 1.00, -0.15, -0.22], // Bonds
      [0.78, 0.82, -0.15, 1.00, 0.18],  // REITs
      [0.25, 0.31, -0.22, 0.18, 1.00]   // Commodities
    ],
    interpretation: {
      highCorrelations: [
        { pair: 'US Stocks - REITs', value: 0.78, risk: 'high' },
        { pair: 'Int\'l Stocks - REITs', value: 0.82, risk: 'high' },
        { pair: 'US Stocks - Int\'l Stocks', value: 0.65, risk: 'medium' }
      ],
      diversificationScore: 72,
      recommendation: 'Consider reducing REIT allocation or adding more uncorrelated assets like commodities'
    }
  };

  return NextResponse.json(correlationMatrix);
}