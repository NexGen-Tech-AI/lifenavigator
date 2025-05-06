import { prisma } from "@/lib/db";

// Financial record types
export interface CreateFinancialRecordInput {
  userId: string;
  totalNetWorth?: number;
  totalAssets?: number;
  totalLiabilities?: number;
}

export interface UpdateFinancialRecordInput {
  totalNetWorth?: number;
  totalAssets?: number;
  totalLiabilities?: number;
}

// Budget types
export interface CreateBudgetInput {
  userId: string;
  name: string;
  totalBudget: number;
  startDate: Date;
  endDate?: Date;
  isActive?: boolean;
  categories?: CreateBudgetCategoryInput[];
}

export interface CreateBudgetCategoryInput {
  name: string;
  allocated: number;
  spent?: number;
}

export interface UpdateBudgetInput {
  name?: string;
  totalBudget?: number;
  startDate?: Date;
  endDate?: Date;
  isActive?: boolean;
}

// Investment types
export interface CreateInvestmentInput {
  userId: string;
  name: string;
  type: string;
  value: number;
  purchasePrice: number;
  purchaseDate: Date;
  notes?: string;
}

export interface UpdateInvestmentInput {
  name?: string;
  type?: string;
  value?: number;
  purchasePrice?: number;
  purchaseDate?: Date;
  notes?: string;
}

export const financialService = {
  // Financial Records
  async getFinancialRecord(userId: string) {
    const record = await prisma.financialRecord.findFirst({
      where: { userId },
      orderBy: { lastCalculated: 'desc' },
    });
    
    return record;
  },
  
  async createFinancialRecord(data: CreateFinancialRecordInput) {
    const record = await prisma.financialRecord.create({
      data: {
        userId: data.userId,
        totalNetWorth: data.totalNetWorth,
        totalAssets: data.totalAssets,
        totalLiabilities: data.totalLiabilities,
      },
    });
    
    return record;
  },
  
  async updateFinancialRecord(id: string, data: UpdateFinancialRecordInput) {
    const record = await prisma.financialRecord.update({
      where: { id },
      data: {
        ...data,
        lastCalculated: new Date(),
      },
    });
    
    return record;
  },
  
  // Budgets
  async getBudgets(userId: string) {
    const budgets = await prisma.budget.findMany({
      where: { userId },
      include: {
        categories: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    
    return budgets;
  },
  
  async getBudgetById(id: string) {
    const budget = await prisma.budget.findUnique({
      where: { id },
      include: {
        categories: true,
      },
    });
    
    return budget;
  },
  
  async createBudget(data: CreateBudgetInput) {
    const { categories, ...budgetData } = data;
    
    const budget = await prisma.budget.create({
      data: {
        ...budgetData,
        categories: {
          create: categories || [],
        },
      },
      include: {
        categories: true,
      },
    });
    
    return budget;
  },
  
  async updateBudget(id: string, data: UpdateBudgetInput) {
    const budget = await prisma.budget.update({
      where: { id },
      data,
      include: {
        categories: true,
      },
    });
    
    return budget;
  },
  
  async addBudgetCategory(budgetId: string, data: CreateBudgetCategoryInput) {
    const category = await prisma.budgetCategory.create({
      data: {
        ...data,
        budgetId,
      },
    });
    
    return category;
  },
  
  async updateBudgetCategory(id: string, data: { allocated?: number; spent?: number }) {
    const category = await prisma.budgetCategory.update({
      where: { id },
      data,
    });
    
    return category;
  },
  
  // Investments
  async getInvestments(userId: string) {
    const investments = await prisma.investment.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    
    return investments;
  },
  
  async getInvestmentById(id: string) {
    const investment = await prisma.investment.findUnique({
      where: { id },
    });
    
    return investment;
  },
  
  async createInvestment(data: CreateInvestmentInput) {
    const investment = await prisma.investment.create({
      data,
    });
    
    return investment;
  },
  
  async updateInvestment(id: string, data: UpdateInvestmentInput) {
    const investment = await prisma.investment.update({
      where: { id },
      data,
    });
    
    return investment;
  },
  
  async deleteInvestment(id: string) {
    await prisma.investment.delete({
      where: { id },
    });
    
    return true;
  },
};