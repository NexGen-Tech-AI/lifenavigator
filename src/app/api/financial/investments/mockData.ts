import type { 
  InvestmentPortfolio,
  InvestmentHolding,
  AssetAllocation,
  SectorAllocation,
  GeographicAllocation,
  RiskMetrics,
  RiskAlert,
  StressTestScenario,
  PortfolioInsight,
  RebalancingRecommendation,
  TimeRangeData,
  MarketAssumptions
} from '@/types/investment';

// Mock portfolio holdings data
const mockHoldings: InvestmentHolding[] = [
  {
    id: "h1",
    ticker: "AAPL",
    name: "Apple Inc.",
    type: "Stock",
    sector: "Technology",
    shares: 150,
    price: 172.43,
    value: 25864.50,
    costBasis: 18750.00,
    gainLoss: 7114.50,
    gainLossPercent: 37.94,
    allocation: 15.21,
  },
  {
    id: "h2",
    ticker: "MSFT",
    name: "Microsoft Corp.",
    type: "Stock",
    sector: "Technology",
    shares: 85,
    price: 305.18,
    value: 25940.30,
    costBasis: 21250.00,
    gainLoss: 4690.30,
    gainLossPercent: 22.07,
    allocation: 15.25,
  },
  {
    id: "h3",
    ticker: "AMZN",
    name: "Amazon.com Inc.",
    type: "Stock",
    sector: "Consumer Discretionary",
    shares: 110,
    price: 135.28,
    value: 14880.80,
    costBasis: 12650.00,
    gainLoss: 2230.80,
    gainLossPercent: 17.63,
    allocation: 8.75,
  },
  {
    id: "h4",
    ticker: "GOOGL",
    name: "Alphabet Inc.",
    type: "Stock",
    sector: "Communication Services",
    shares: 95,
    price: 132.67,
    value: 12603.65,
    costBasis: 10450.00,
    gainLoss: 2153.65,
    gainLossPercent: 20.61,
    allocation: 7.41,
  },
  {
    id: "h5",
    ticker: "BRK.B",
    name: "Berkshire Hathaway Inc.",
    type: "Stock",
    sector: "Financials",
    shares: 45,
    price: 364.32,
    value: 16394.40,
    costBasis: 13500.00,
    gainLoss: 2894.40,
    gainLossPercent: 21.44,
    allocation: 9.64,
  },
  {
    id: "h6",
    ticker: "VFIAX",
    name: "Vanguard 500 Index Fund",
    type: "Mutual Fund",
    sector: "Blend",
    shares: 65,
    price: 434.56,
    value: 28246.40,
    costBasis: 24700.00,
    gainLoss: 3546.40,
    gainLossPercent: 14.36,
    allocation: 16.61,
  },
  {
    id: "h7",
    ticker: "VBTLX",
    name: "Vanguard Total Bond Market Index",
    type: "Mutual Fund",
    sector: "Fixed Income",
    shares: 250,
    price: 102.45,
    value: 25612.50,
    costBasis: 27500.00,
    gainLoss: -1887.50,
    gainLossPercent: -6.86,
    allocation: 15.06,
  },
  {
    id: "h8",
    ticker: "VNQ",
    name: "Vanguard Real Estate ETF",
    type: "ETF",
    sector: "Real Estate",
    shares: 125,
    price: 85.43,
    value: 10678.75,
    costBasis: 11250.00,
    gainLoss: -571.25,
    gainLossPercent: -5.08,
    allocation: 6.28,
  },
  {
    id: "h9",
    ticker: "CASH",
    name: "Cash & Money Market",
    type: "Cash",
    sector: "Cash",
    shares: 9854.23,
    price: 1.00,
    value: 9854.23,
    costBasis: 9854.23,
    gainLoss: 0,
    gainLossPercent: 0,
    allocation: 5.79,
  },
];

// Mock asset allocation data
const mockAssetAllocation: AssetAllocation = [
  { name: "US Stocks", value: 45, color: "#3B82F6" }, // Blue
  { name: "International Stocks", value: 20, color: "#10B981" }, // Green
  { name: "Bonds", value: 15, color: "#F59E0B" }, // Amber
  { name: "Real Estate", value: 10, color: "#EF4444" }, // Red
  { name: "Cash", value: 5, color: "#6B7280" }, // Gray
  { name: "Alternatives", value: 5, color: "#8B5CF6" }, // Purple
];

// Mock sector allocation data
const mockSectorAllocation: SectorAllocation = [
  { name: "Technology", value: 42, color: "#3B82F6" }, // Blue
  { name: "Healthcare", value: 15, color: "#10B981" }, // Green
  { name: "Financials", value: 12, color: "#F59E0B" }, // Amber
  { name: "Consumer Discretionary", value: 10, color: "#EF4444" }, // Red
  { name: "Industrials", value: 8, color: "#6B7280" }, // Gray
  { name: "Communication", value: 5, color: "#8B5CF6" }, // Purple
  { name: "Other Sectors", value: 8, color: "#EC4899" }, // Pink
];

// Mock geographic allocation data
const mockGeographicAllocation: GeographicAllocation = [
  { name: "United States", value: 65, color: "#3B82F6" }, // Blue
  { name: "Europe", value: 15, color: "#10B981" }, // Green
  { name: "Asia-Pacific", value: 10, color: "#F59E0B" }, // Amber
  { name: "Emerging Markets", value: 8, color: "#EF4444" }, // Red
  { name: "Other Regions", value: 2, color: "#6B7280" }, // Gray
];

// Mock risk metrics
const mockRiskMetrics: RiskMetrics = {
  beta: 0.85,
  sharpeRatio: 1.12,
  volatility: 12.4,
  maxDrawdown: -18.6,
  downside: 10.2,
  concentrationRisk: 27.5,
};

// Mock risk alerts
const mockRiskAlerts: RiskAlert[] = [
  {
    id: "risk1",
    type: "warning",
    title: "Sector concentration",
    description: "Technology sector represents 42% of your portfolio, increasing volatility risk.",
  },
  {
    id: "risk2",
    type: "info",
    title: "Market correlation",
    description: "Your portfolio has a 0.85 beta, suggesting moderate market correlation.",
  },
  {
    id: "risk3",
    type: "warning",
    title: "Single stock exposure",
    description: "AAPL represents 15% of your portfolio, creating concentration risk.",
  },
];

// Mock stress test data
const mockStressTests: StressTestScenario[] = [
  { name: "Market Crash (-40%)", portfolioImpact: -34 },
  { name: "Recession (-20%)", portfolioImpact: -17 },
  { name: "Tech Crash (-30%)", portfolioImpact: -26 },
  { name: "Inflation Spike", portfolioImpact: -12 },
  { name: "Interest Rate Hike", portfolioImpact: -8 },
];

// Mock portfolio insights
const mockInsights: PortfolioInsight[] = [
  {
    id: "insight1",
    type: "warning",
    title: "High tech concentration",
    description: "Tech sector (42%) exceeds recommended maximum of 30% for your risk profile.",
    icon: "ExclamationTriangleIcon",
    action: "Review allocation",
  },
  {
    id: "insight2",
    type: "info",
    title: "Dividend growth opportunity",
    description: "Portfolio yield (1.78%) is below market average. Consider adding dividend stocks.",
    icon: "BanknotesIcon",
    action: "See suggestions",
  },
  {
    id: "insight3",
    type: "success",
    title: "Portfolio outperformance",
    description: "Your portfolio has outperformed the S&P 500 by 1.5% over the past year.",
    icon: "ArrowTrendingUpIcon",
    action: "View details",
  },
  {
    id: "insight4",
    type: "warning",
    title: "Single stock exposure",
    description: "AAPL and MSFT each represent >15% of portfolio, creating concentration risk.",
    icon: "ExclamationTriangleIcon",
    action: "Diversify holdings",
  },
  {
    id: "insight5",
    type: "info",
    title: "Retirement planning",
    description: "Based on your growth rate, you're on track to meet your retirement goal of $1.2M by 2045.",
    icon: "CheckCircleIcon",
    action: "View projection",
  },
];

// Mock rebalancing recommendations
const mockRebalancingRecommendations: RebalancingRecommendation[] = [
  {
    action: "Reduce",
    ticker: "AAPL",
    name: "Apple Inc.",
    current: 15.21,
    target: 10.00,
    difference: -5.21,
  },
  {
    action: "Reduce",
    ticker: "MSFT",
    name: "Microsoft Corp.",
    current: 15.25,
    target: 10.00,
    difference: -5.25,
  },
  {
    action: "Increase",
    ticker: "VBTLX",
    name: "Vanguard Total Bond Market Index",
    current: 15.06,
    target: 25.00,
    difference: 9.94,
  },
  {
    action: "Add New",
    ticker: "VYM",
    name: "Vanguard High Dividend Yield ETF",
    current: 0,
    target: 5.00,
    difference: 5.00,
  },
];

// Mock performance data
const mockPerformanceData: TimeRangeData = {
  "1M": [
    { date: "05/05", portfolioValue: 170075, benchmark: 168200 },
    { date: "05/12", portfolioValue: 168400, benchmark: 167500 },
    { date: "05/19", portfolioValue: 167200, benchmark: 166800 },
    { date: "05/26", portfolioValue: 169300, benchmark: 167900 },
    { date: "06/02", portfolioValue: 170750, benchmark: 169200 },
  ],
  "3M": [
    { date: "Mar", portfolioValue: 162300, benchmark: 160500 },
    { date: "Apr", portfolioValue: 165800, benchmark: 164200 },
    { date: "May", portfolioValue: 170750, benchmark: 169200 },
  ],
  "1Y": [
    { date: "Jun 24", portfolioValue: 138500, benchmark: 140200 },
    { date: "Sep 24", portfolioValue: 144800, benchmark: 145500 },
    { date: "Dec 24", portfolioValue: 156200, benchmark: 154800 },
    { date: "Mar 25", portfolioValue: 165800, benchmark: 164200 },
    { date: "May 25", portfolioValue: 170750, benchmark: 169200 },
  ],
  "3Y": [
    { date: "2022", portfolioValue: 112500, benchmark: 115800 },
    { date: "2023", portfolioValue: 135600, benchmark: 132500 },
    { date: "2024", portfolioValue: 156200, benchmark: 154800 },
    { date: "2025", portfolioValue: 170750, benchmark: 169200 },
  ],
  "5Y": [
    { date: "2021", portfolioValue: 92400, benchmark: 95600 },
    { date: "2022", portfolioValue: 112500, benchmark: 115800 },
    { date: "2023", portfolioValue: 135600, benchmark: 132500 },
    { date: "2024", portfolioValue: 156200, benchmark: 154800 },
    { date: "2025", portfolioValue: 170750, benchmark: 169200 },
  ],
};

// Mock market assumptions
const mockMarketAssumptions: MarketAssumptions = {
  riskFreeRate: 4.5,
  equityRiskPremium: 5.0,
  inflationRate: 2.5,
  bondYield: 5.2,
};

// Function to calculate portfolio totals from holdings
function calculatePortfolioTotals(holdings: InvestmentHolding[]) {
  const totalValue = holdings.reduce((sum, holding) => sum + holding.value, 0);
  const totalCostBasis = holdings.reduce((sum, holding) => sum + holding.costBasis, 0);
  const totalGainLoss = holdings.reduce((sum, holding) => sum + holding.gainLoss, 0);
  const totalGainLossPercent = (totalGainLoss / totalCostBasis) * 100;
  
  return {
    totalValue,
    totalCostBasis,
    totalGainLoss,
    totalGainLossPercent
  };
}

// Function to get complete portfolio data
export function getPortfolioMockData(): InvestmentPortfolio {
  const portfolioTotals = calculatePortfolioTotals(mockHoldings);
  
  return {
    ...portfolioTotals,
    risk: 'Moderate',
    holdings: mockHoldings,
    assetAllocation: mockAssetAllocation,
    sectorAllocation: mockSectorAllocation,
    geographicAllocation: mockGeographicAllocation,
    riskMetrics: mockRiskMetrics,
    riskAlerts: mockRiskAlerts,
    stressTests: mockStressTests,
    insights: mockInsights,
    rebalancingRecommendations: mockRebalancingRecommendations,
    performance: mockPerformanceData,
    marketAssumptions: mockMarketAssumptions,
  };
}

// Create additional API route helpers to pull specific sections of the data
export function getHoldingsMockData() {
  return mockHoldings;
}

export function getAssetAllocationMockData() {
  return mockAssetAllocation;
}

export function getSectorAllocationMockData() {
  return mockSectorAllocation;
}

export function getGeographicAllocationMockData() {
  return mockGeographicAllocation;
}

export function getRiskMetricsMockData() {
  return mockRiskMetrics;
}

export function getRiskAlertsMockData() {
  return mockRiskAlerts;
}

export function getStressTestsMockData() {
  return mockStressTests;
}

export function getInsightsMockData() {
  return mockInsights;
}

export function getRebalancingRecommendationsMockData() {
  return mockRebalancingRecommendations;
}

export function getPerformanceMockData() {
  return mockPerformanceData;
}

export function getMarketAssumptionsMockData() {
  return mockMarketAssumptions;
}