import { createClient } from '@/lib/supabase/server';

export interface FinancialHealthScore {
  score: number;
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  components: {
    emergencyFund: number;
    debtToIncome: number;
    creditUtilization: number;
    investmentRatio: number;
    incomeConsistency: number;
    retirementContribution: number;
    budgetCompliance: number;
  };
  recommendations: string[];
  benchmarks: {
    nationalAverage: number;
    ageGroupAverage: number;
    peerPercentile: number;
  };
}

export class FinancialHealthService {
  private supabase: any;

  constructor(supabase: any) {
    this.supabase = supabase;
  }

  async calculateHealthScore(userId: string): Promise<FinancialHealthScore> {
    try {
      // Get user's financial data
      const [accounts, transactions, user] = await Promise.all([
        this.getUserAccounts(userId),
        this.getRecentTransactions(userId),
        this.getUserProfile(userId)
      ]);

      // Calculate component scores
      const components = {
        emergencyFund: await this.calculateEmergencyFundScore(accounts, transactions),
        debtToIncome: await this.calculateDebtToIncomeScore(accounts, transactions),
        creditUtilization: await this.calculateCreditUtilizationScore(accounts),
        investmentRatio: await this.calculateInvestmentRatioScore(accounts),
        incomeConsistency: await this.calculateIncomeConsistencyScore(transactions),
        retirementContribution: await this.calculateRetirementScore(accounts, transactions),
        budgetCompliance: await this.calculateBudgetComplianceScore(transactions)
      };

      // Calculate weighted overall score
      const weights = {
        emergencyFund: 0.20,
        debtToIncome: 0.20,
        creditUtilization: 0.15,
        investmentRatio: 0.15,
        incomeConsistency: 0.10,
        retirementContribution: 0.15,
        budgetCompliance: 0.05
      };

      const score = Math.round(
        Object.entries(components).reduce((total, [key, value]) => {
          return total + (value * weights[key as keyof typeof weights]);
        }, 0)
      );

      const grade = this.getGrade(score);
      const recommendations = this.generateRecommendations(components);
      const benchmarks = await this.getBenchmarks(user, score);

      // Save score to history
      await this.saveScoreToHistory(userId, score, grade, components, recommendations, benchmarks);

      return {
        score,
        grade,
        components,
        recommendations,
        benchmarks
      };
    } catch (error) {
      console.error('Error calculating financial health score:', error);
      throw error;
    }
  }

  private async getUserAccounts(userId: string) {
    const { data } = await this.supabase
      .from('accounts')
      .select('*')
      .eq('user_id', userId);
    return data || [];
  }

  private async getRecentTransactions(userId: string, months: number = 6) {
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    const { data } = await this.supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .gte('date', startDate.toISOString());
    return data || [];
  }

  private async getUserProfile(userId: string) {
    const { data } = await this.supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();
    return data;
  }

  private async calculateEmergencyFundScore(accounts: any[], transactions: any[]): Promise<number> {
    // Calculate total emergency fund (savings + liquid investments)
    const emergencyFund = accounts
      .filter(acc => acc.account_type === 'SAVINGS' || acc.account_type === 'MONEY_MARKET')
      .reduce((total, acc) => total + (acc.current_balance || 0), 0);

    // Calculate monthly expenses (last 3 months average)
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    const recentExpenses = transactions
      .filter(t => 
        t.amount < 0 && 
        new Date(t.date) >= threeMonthsAgo &&
        !['TRANSFER', 'INVESTMENT'].includes(t.category)
      )
      .reduce((total, t) => total + Math.abs(t.amount), 0);

    const monthlyExpenses = recentExpenses / 3;
    const emergencyMonths = monthlyExpenses > 0 ? emergencyFund / monthlyExpenses : 0;

    // Score calculation
    if (emergencyMonths >= 6) return 100;
    if (emergencyMonths >= 3) return 70 + ((emergencyMonths - 3) / 3) * 30;
    return Math.round((emergencyMonths / 3) * 70);
  }

  private async calculateDebtToIncomeScore(accounts: any[], transactions: any[]): Promise<number> {
    // Calculate total debt payments
    const debtAccounts = accounts.filter(acc => 
      ['CREDIT_CARD', 'LOAN', 'MORTGAGE', 'LINE_OF_CREDIT'].includes(acc.account_type)
    );

    const totalDebt = debtAccounts.reduce((total, acc) => total + (acc.current_balance || 0), 0);

    // Calculate monthly income (last 3 months average)
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    const recentIncome = transactions
      .filter(t => 
        t.amount > 0 && 
        new Date(t.date) >= threeMonthsAgo &&
        ['INCOME', 'SALARY', 'BONUS'].includes(t.category)
      )
      .reduce((total, t) => total + t.amount, 0);

    const monthlyIncome = recentIncome / 3;
    const debtToIncomeRatio = monthlyIncome > 0 ? (totalDebt / 12) / monthlyIncome : 0;

    // Score calculation (lower ratio is better)
    if (debtToIncomeRatio <= 0.20) return 100;
    if (debtToIncomeRatio <= 0.36) return 90 - ((debtToIncomeRatio - 0.20) / 0.16) * 20;
    if (debtToIncomeRatio <= 0.50) return 70 - ((debtToIncomeRatio - 0.36) / 0.14) * 20;
    return Math.max(0, 50 - ((debtToIncomeRatio - 0.50) * 100));
  }

  private async calculateCreditUtilizationScore(accounts: any[]): Promise<number> {
    const creditCards = accounts.filter(acc => acc.account_type === 'CREDIT_CARD');
    
    if (creditCards.length === 0) return 75; // Default score if no credit cards

    const totalBalance = creditCards.reduce((sum, card) => sum + (card.current_balance || 0), 0);
    const totalLimit = creditCards.reduce((sum, card) => sum + (card.credit_limit || 0), 0);
    
    if (totalLimit === 0) return 50;

    const utilizationRatio = totalBalance / totalLimit;

    // Score calculation (lower utilization is better)
    if (utilizationRatio <= 0.10) return 100;
    if (utilizationRatio <= 0.30) return 90 - ((utilizationRatio - 0.10) / 0.20) * 15;
    if (utilizationRatio <= 0.50) return 75 - ((utilizationRatio - 0.30) / 0.20) * 25;
    return Math.max(0, 50 - ((utilizationRatio - 0.50) * 100));
  }

  private async calculateInvestmentRatioScore(accounts: any[]): Promise<number> {
    const totalAssets = accounts
      .filter(acc => !['CREDIT_CARD', 'LOAN', 'MORTGAGE'].includes(acc.account_type))
      .reduce((sum, acc) => sum + (acc.current_balance || 0), 0);

    const investmentAssets = accounts
      .filter(acc => ['INVESTMENT', 'RETIREMENT', 'BROKERAGE'].includes(acc.account_type))
      .reduce((sum, acc) => sum + (acc.current_balance || 0), 0);

    if (totalAssets === 0) return 0;

    const investmentRatio = investmentAssets / totalAssets;

    // Score calculation (higher ratio is better)
    if (investmentRatio >= 0.50) return 100;
    if (investmentRatio >= 0.30) return 80 + ((investmentRatio - 0.30) / 0.20) * 20;
    if (investmentRatio >= 0.15) return 60 + ((investmentRatio - 0.15) / 0.15) * 20;
    return Math.round(investmentRatio / 0.15 * 60);
  }

  private async calculateIncomeConsistencyScore(transactions: any[]): Promise<number> {
    // Look at income over the last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyIncome: { [key: string]: number } = {};
    
    transactions
      .filter(t => 
        t.amount > 0 && 
        new Date(t.date) >= sixMonthsAgo &&
        ['INCOME', 'SALARY'].includes(t.category)
      )
      .forEach(t => {
        const monthKey = new Date(t.date).toISOString().substring(0, 7);
        monthlyIncome[monthKey] = (monthlyIncome[monthKey] || 0) + t.amount;
      });

    const incomeValues = Object.values(monthlyIncome);
    
    if (incomeValues.length < 3) return 50; // Not enough data

    const avgIncome = incomeValues.reduce((sum, val) => sum + val, 0) / incomeValues.length;
    const variance = incomeValues.reduce((sum, val) => sum + Math.pow(val - avgIncome, 2), 0) / incomeValues.length;
    const stdDev = Math.sqrt(variance);
    const coefficientOfVariation = avgIncome > 0 ? stdDev / avgIncome : 1;

    // Score calculation (lower variation is better)
    if (coefficientOfVariation <= 0.10) return 100;
    if (coefficientOfVariation <= 0.25) return 90 - ((coefficientOfVariation - 0.10) / 0.15) * 20;
    if (coefficientOfVariation <= 0.50) return 70 - ((coefficientOfVariation - 0.25) / 0.25) * 30;
    return Math.max(0, 40 - ((coefficientOfVariation - 0.50) * 40));
  }

  private async calculateRetirementScore(accounts: any[], transactions: any[]): Promise<number> {
    // Get retirement accounts
    const retirementAccounts = accounts.filter(acc => 
      acc.account_type === 'RETIREMENT' || acc.account_subtype?.includes('401K') || acc.account_subtype?.includes('IRA')
    );

    // Calculate monthly retirement contributions
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    const retirementContributions = transactions
      .filter(t => 
        t.category === 'RETIREMENT' && 
        t.amount < 0 && // Outgoing to retirement
        new Date(t.date) >= threeMonthsAgo
      )
      .reduce((sum, t) => sum + Math.abs(t.amount), 0) / 3;

    // Get monthly income
    const monthlyIncome = transactions
      .filter(t => 
        t.amount > 0 && 
        new Date(t.date) >= threeMonthsAgo &&
        ['INCOME', 'SALARY'].includes(t.category)
      )
      .reduce((sum, t) => sum + t.amount, 0) / 3;

    if (monthlyIncome === 0) return 50;

    const contributionRate = retirementContributions / monthlyIncome;

    // Score calculation
    if (contributionRate >= 0.15) return 100;
    if (contributionRate >= 0.10) return 85 + ((contributionRate - 0.10) / 0.05) * 15;
    if (contributionRate >= 0.05) return 70 + ((contributionRate - 0.05) / 0.05) * 15;
    return Math.round(contributionRate / 0.05 * 70);
  }

  private async calculateBudgetComplianceScore(transactions: any[]): Promise<number> {
    // This would compare actual spending vs budgeted amounts
    // For now, return a default score
    return 75;
  }

  private getGrade(score: number): 'A' | 'B' | 'C' | 'D' | 'F' {
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'F';
  }

  private generateRecommendations(components: FinancialHealthScore['components']): string[] {
    const recommendations: string[] = [];

    if (components.emergencyFund < 70) {
      recommendations.push('Build your emergency fund to cover 3-6 months of expenses');
    }

    if (components.debtToIncome < 70) {
      recommendations.push('Focus on paying down high-interest debt to improve your debt-to-income ratio');
    }

    if (components.creditUtilization < 75) {
      recommendations.push('Reduce credit card balances to below 30% of available credit');
    }

    if (components.investmentRatio < 60) {
      recommendations.push('Increase investments to build long-term wealth');
    }

    if (components.retirementContribution < 70) {
      recommendations.push('Boost retirement contributions to at least 10% of income');
    }

    if (components.incomeConsistency < 80) {
      recommendations.push('Consider diversifying income sources for greater stability');
    }

    return recommendations;
  }

  private async getBenchmarks(user: any, score: number): Promise<FinancialHealthScore['benchmarks']> {
    // Get age group
    const birthYear = user?.date_of_birth ? new Date(user.date_of_birth).getFullYear() : null;
    const age = birthYear ? new Date().getFullYear() - birthYear : 30;
    
    const ageGroup = 
      age < 25 ? '18-24' :
      age < 35 ? '25-34' :
      age < 45 ? '35-44' :
      age < 55 ? '45-54' :
      age < 65 ? '55-64' : '65+';

    // Fetch benchmarks from database
    const { data: benchmark } = await this.supabase
      .from('financial_benchmarks')
      .select('avg_health_score')
      .eq('age_group', ageGroup)
      .eq('income_bracket', user?.annual_income_range || '50K_75K')
      .single();

    const ageGroupAverage = benchmark?.avg_health_score || 75;
    const nationalAverage = 73; // Default national average

    // Calculate percentile
    const peerPercentile = score >= ageGroupAverage ? 
      50 + Math.round((score - ageGroupAverage) / (100 - ageGroupAverage) * 50) :
      Math.round(score / ageGroupAverage * 50);

    return {
      nationalAverage,
      ageGroupAverage,
      peerPercentile
    };
  }

  private async saveScoreToHistory(
    userId: string, 
    score: number, 
    grade: string,
    components: FinancialHealthScore['components'],
    recommendations: string[],
    benchmarks: FinancialHealthScore['benchmarks']
  ) {
    // Mark previous scores as not current
    await this.supabase
      .from('financial_health_scores')
      .update({ is_current: false })
      .eq('user_id', userId)
      .eq('is_current', true);

    // Insert new score
    await this.supabase
      .from('financial_health_scores')
      .insert({
        user_id: userId,
        score,
        grade,
        emergency_fund_score: components.emergencyFund,
        debt_to_income_score: components.debtToIncome,
        credit_utilization_score: components.creditUtilization,
        investment_ratio_score: components.investmentRatio,
        income_consistency_score: components.incomeConsistency,
        retirement_contribution_score: components.retirementContribution,
        budget_compliance_score: components.budgetCompliance,
        calculation_details: components,
        recommendations,
        improvement_areas: recommendations.slice(0, 3),
        national_average_score: benchmarks.nationalAverage,
        age_group_average_score: benchmarks.ageGroupAverage,
        peer_percentile: benchmarks.peerPercentile,
        is_current: true
      });
  }

  async getScoreHistory(userId: string, limit: number = 12): Promise<any[]> {
    const { data } = await this.supabase
      .from('financial_health_scores')
      .select('*')
      .eq('user_id', userId)
      .order('calculated_at', { ascending: false })
      .limit(limit);

    return data || [];
  }
}