import { NextResponse } from 'next/server';

// GET /api/financial/investments/portfolio - Return demo investment portfolio
export async function GET() {
  return NextResponse.json({
    totalValue: 385000,
    totalCost: 350000,
    totalGainLoss: 35000,
    totalGainLossPercent: 10,
    dayChange: 2150.50,
    dayChangePercent: 0.56,
    holdings: [
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
        dayChangePercent: 0.45
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
        dayChangePercent: 0.56
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
        dayChangePercent: -0.30
      }
    ],
    assetAllocation: {
      stocks: { value: 250000, percent: 64.94 },
      bonds: { value: 85000, percent: 22.08 },
      cash: { value: 30000, percent: 7.79 },
      alternatives: { value: 20000, percent: 5.19 }
    },
    sectorAllocation: {
      technology: { value: 120000, percent: 31.17 },
      healthcare: { value: 60000, percent: 15.58 },
      financials: { value: 55000, percent: 14.29 },
      'consumer discretionary': { value: 45000, percent: 11.69 },
      industrials: { value: 40000, percent: 10.39 },
      'real estate': { value: 30000, percent: 7.79 },
      energy: { value: 20000, percent: 5.19 },
      utilities: { value: 15000, percent: 3.90 }
    },
    geographicAllocation: {
      'United States': { value: 270000, percent: 70.13 },
      'International Developed': { value: 80000, percent: 20.78 },
      'Emerging Markets': { value: 35000, percent: 9.09 }
    },
    riskMetrics: {
      beta: 0.95,
      standardDeviation: 12.5,
      sharpeRatio: 1.25,
      treynorRatio: 0.15,
      alpha: 2.1,
      rSquared: 0.92,
      informationRatio: 0.45,
      trackingError: 3.2
    },
    performanceMetrics: {
      ytd: { value: 28500, percent: 8.14 },
      oneMonth: { value: 3850, percent: 1.01 },
      threeMonths: { value: 11550, percent: 3.09 },
      sixMonths: { value: 19250, percent: 5.26 },
      oneYear: { value: 35000, percent: 10.0 },
      threeYears: { value: 77000, percent: 24.0 },
      fiveYears: { value: 115500, percent: 41.57 },
      sinceInception: { value: 35000, percent: 10.0 }
    }
  });
}