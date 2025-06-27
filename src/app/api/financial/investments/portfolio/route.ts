import { NextResponse } from 'next/server';
import type { InvestmentPortfolio } from '@/types/investment';

// GET /api/financial/investments/portfolio - Return demo investment portfolio
export async function GET() {
  // Total investment value includes: Brokerage (85k) + 401k Primary (225k) + 401k Spouse (125k) + Roth IRA (45k) = 480k
  const portfolio: InvestmentPortfolio = {
    totalValue: 480000,
    totalCostBasis: 420000,
    totalGainLoss: 60000,
    totalGainLossPercent: 14.29,
    risk: 'Moderate',
    holdings: [
      {
        id: '1',
        ticker: 'VTI',
        name: 'Vanguard Total Stock Market ETF',
        type: 'ETF',
        sector: 'Diversified',
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
      }
    ],
    assetAllocation: [
      { name: 'Stocks', value: 64.94, color: '#10b981' },
      { name: 'Bonds', value: 22.08, color: '#3b82f6' },
      { name: 'Cash', value: 7.79, color: '#f59e0b' },
      { name: 'Alternatives', value: 5.19, color: '#8b5cf6' }
    ],
    sectorAllocation: [
      { name: 'Technology', value: 31.17, color: '#10b981' },
      { name: 'Healthcare', value: 15.58, color: '#3b82f6' },
      { name: 'Financials', value: 14.29, color: '#f59e0b' },
      { name: 'Consumer Discretionary', value: 11.69, color: '#8b5cf6' },
      { name: 'Industrials', value: 10.39, color: '#ec4899' },
      { name: 'Real Estate', value: 7.79, color: '#14b8a6' },
      { name: 'Energy', value: 5.19, color: '#f97316' },
      { name: 'Utilities', value: 3.90, color: '#6366f1' }
    ],
    geographicAllocation: [
      { name: 'United States', value: 70.13, color: '#10b981' },
      { name: 'International Developed', value: 20.78, color: '#3b82f6' },
      { name: 'Emerging Markets', value: 9.09, color: '#f59e0b' }
    ],
    riskMetrics: {
      beta: 0.95,
      sharpeRatio: 1.25,
      volatility: 12.5,
      maxDrawdown: -15.2,
      downside: 8.3,
      concentrationRisk: 0.31
    },
    riskAlerts: [
      {
        id: '1',
        type: 'info',
        title: 'Diversification',
        description: 'Your portfolio is well-diversified across asset classes'
      }
    ],
    stressTests: [
      {
        name: 'Market Crash (-20%)',
        portfolioImpact: -15.2
      },
      {
        name: 'Interest Rate Rise (+2%)',
        portfolioImpact: -4.8
      }
    ],
    insights: [
      {
        id: '1',
        type: 'success',
        title: 'Strong YTD Performance',
        description: 'Your portfolio has outperformed the market by 2.5%',
        icon: '📈',
        action: 'Consider rebalancing to lock in gains'
      }
    ],
    rebalancingRecommendations: [
      {
        action: 'Reduce',
        ticker: 'VTI',
        name: 'Vanguard Total Stock Market ETF',
        current: 5.71,
        target: 5.0,
        difference: -0.71
      }
    ],
    performance: {
      '1D': [
        { date: '2024-01-01', portfolioValue: 383000, benchmark: 98 },
        { date: '2024-01-02', portfolioValue: 385000, benchmark: 100 }
      ],
      '1W': [
        { date: '2023-12-25', portfolioValue: 380000, benchmark: 95 },
        { date: '2023-12-26', portfolioValue: 381000, benchmark: 96 },
        { date: '2023-12-27', portfolioValue: 382000, benchmark: 97 },
        { date: '2023-12-28', portfolioValue: 383000, benchmark: 98 },
        { date: '2023-12-29', portfolioValue: 384000, benchmark: 99 },
        { date: '2024-01-01', portfolioValue: 383000, benchmark: 98 },
        { date: '2024-01-02', portfolioValue: 385000, benchmark: 100 }
      ],
      '1M': Array.from({ length: 30 }, (_, i) => ({
        date: new Date(2024, 0, i + 1).toISOString().split('T')[0],
        portfolioValue: 370000 + (i * 500),
        benchmark: 90 + (i * 0.33)
      })),
      '3M': Array.from({ length: 90 }, (_, i) => ({
        date: new Date(2023, 9, i + 1).toISOString().split('T')[0],
        portfolioValue: 350000 + (i * 388),
        benchmark: 85 + (i * 0.17)
      })),
      '1Y': Array.from({ length: 365 }, (_, i) => ({
        date: new Date(2023, 0, i + 1).toISOString().split('T')[0],
        portfolioValue: 350000 + (i * 95),
        benchmark: 90 + (i * 0.027)
      }))
    },
    marketAssumptions: {
      riskFreeRate: 4.5,
      equityRiskPremium: 5.5,
      inflationRate: 2.5,
      bondYield: 4.8
    }
  };

  return NextResponse.json(portfolio);
}