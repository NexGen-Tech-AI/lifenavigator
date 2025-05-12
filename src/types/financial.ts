/**
 * Financial domain type definitions
 */

export type FinancialRecord = {
  id: string;
  userId: string;
  totalNetWorth: number | null;
  totalAssets: number | null;
  totalLiabilities: number | null;
  lastCalculated: Date;
  createdAt: Date;
  updatedAt: Date;
};

export type Budget = {
  id: string;
  userId: string;
  name: string;
  totalBudget: number;
  startDate: Date;
  endDate: Date | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  categories?: BudgetCategory[];
};

export type BudgetCategory = {
  id: string;
  budgetId: string;
  name: string;
  allocated: number;
  spent: number;
  createdAt: Date;
  updatedAt: Date;
};

export type Investment = {
  id: string;
  userId: string;
  name: string;
  type: string; // stock, bond, crypto, real_estate, etc.
  value: number;
  purchasePrice: number;
  purchaseDate: Date;
  notes?: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type FinancialOverview = {
  netWorth: number;
  totalAssets: number;
  totalLiabilities: number;
  currentBudget?: Budget;
  investmentSummary: {
    totalValue: number;
    totalGain: number;
    gainPercentage: number;
    breakdown: {
      type: string;
      value: number;
      percentage: number;
    }[];
  };
};

export type FinancialInsight = {
  id: string;
  title: string;
  description: string;
  domain: 'budget' | 'investment' | 'saving' | 'debt' | 'tax' | 'general';
  impact: 'positive' | 'negative' | 'neutral';
  priority: 'high' | 'medium' | 'low';
  createdAt: Date;
};

export type Transaction = {
  id: string;
  userId: string;
  amount: number;
  description: string;
  category: string;
  date: Date;
  type: 'income' | 'expense';
  accountId?: string;
  createdAt: Date;
  updatedAt: Date;
};