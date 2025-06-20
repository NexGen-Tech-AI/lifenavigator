import { FinancialSnapshot } from '@/types/simulator';

export interface RiskScore {
  category: string;
  score: number; // 0-100, where 0 is highest risk
  level: 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW';
  factors: string[];
  impact: string;
}

export interface Recommendation {
  id: string;
  priority: 'IMMEDIATE' | 'HIGH' | 'MEDIUM' | 'LOW';
  category: string;
  title: string;
  description: string;
  impact: string;
  timeline: string;
  estimatedSavings?: number;
  implementation: string[];
}

export interface RiskAnalysis {
  overallRiskScore: number;
  riskLevel: 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW';
  risks: RiskScore[];
  recommendations: Recommendation[];
  warnings: string[];
  opportunities: string[];
}

export class RiskAnalysisService {
  static analyzeRisks(
    snapshots: FinancialSnapshot[],
    events: any[],
    goals: any
  ): RiskAnalysis {
    const currentSnapshot = snapshots[0];
    const futureSnapshots = snapshots.slice(1);
    
    const risks: RiskScore[] = [];
    const recommendations: Recommendation[] = [];
    const warnings: string[] = [];
    const opportunities: string[] = [];

    // 1. Emergency Fund Risk
    const emergencyFundRisk = this.assessEmergencyFundRisk(currentSnapshot, futureSnapshots);
    risks.push(emergencyFundRisk);

    // 2. Cash Flow Risk
    const cashFlowRisk = this.assessCashFlowRisk(snapshots);
    risks.push(cashFlowRisk);

    // 3. Debt Risk
    const debtRisk = this.assessDebtRisk(currentSnapshot, futureSnapshots);
    risks.push(debtRisk);

    // 4. Investment Risk
    const investmentRisk = this.assessInvestmentRisk(currentSnapshot, events);
    risks.push(investmentRisk);

    // 5. Goal Achievement Risk
    const goalRisk = this.assessGoalRisk(snapshots, goals);
    risks.push(goalRisk);

    // Generate recommendations based on risks
    risks.forEach(risk => {
      const recs = this.generateRecommendations(risk, currentSnapshot, events);
      recommendations.push(...recs);
    });

    // Identify critical periods
    const criticalPeriods = this.identifyCriticalPeriods(snapshots);
    warnings.push(...criticalPeriods);

    // Find optimization opportunities
    const opts = this.findOpportunities(currentSnapshot, events);
    opportunities.push(...opts);

    // Calculate overall risk score
    const overallRiskScore = Math.round(
      risks.reduce((sum, risk) => sum + risk.score, 0) / risks.length
    );

    return {
      overallRiskScore,
      riskLevel: this.getRiskLevel(overallRiskScore),
      risks,
      recommendations: this.prioritizeRecommendations(recommendations),
      warnings,
      opportunities
    };
  }

  private static assessEmergencyFundRisk(
    current: FinancialSnapshot,
    future: FinancialSnapshot[]
  ): RiskScore {
    const monthsCovered = current.emergencyFund / current.expenses;
    const factors: string[] = [];
    let score = 100;

    // Check current coverage
    if (monthsCovered < 3) {
      score -= 40;
      factors.push('Emergency fund covers less than 3 months');
    } else if (monthsCovered < 6) {
      score -= 20;
      factors.push('Emergency fund below recommended 6 months');
    }

    // Check future depletion
    const depletionPoints = future.filter(s => 
      s.emergencyFund / s.expenses < 3
    ).length;
    
    if (depletionPoints > 0) {
      score -= Math.min(30, depletionPoints * 5);
      factors.push(`Emergency fund depletes in ${depletionPoints} future periods`);
    }

    // Check volatility
    const fundVolatility = this.calculateVolatility(
      future.map(s => s.emergencyFund)
    );
    if (fundVolatility > 0.3) {
      score -= 10;
      factors.push('High emergency fund volatility');
    }

    return {
      category: 'Emergency Fund',
      score: Math.max(0, score),
      level: this.getRiskLevel(score),
      factors,
      impact: 'Insufficient buffer for unexpected expenses or income loss'
    };
  }

  private static assessCashFlowRisk(snapshots: FinancialSnapshot[]): RiskScore {
    const factors: string[] = [];
    let score = 100;

    // Check negative cash flow periods
    const negativePeriods = snapshots.filter(s => s.cashFlow < 0).length;
    if (negativePeriods > 0) {
      score -= Math.min(40, negativePeriods * 5);
      factors.push(`${negativePeriods} periods with negative cash flow`);
    }

    // Check cash flow margin
    const avgCashFlowMargin = snapshots.reduce((sum, s) => 
      sum + (s.cashFlow / s.income), 0
    ) / snapshots.length;

    if (avgCashFlowMargin < 0.1) {
      score -= 30;
      factors.push('Cash flow margin below 10%');
    } else if (avgCashFlowMargin < 0.2) {
      score -= 15;
      factors.push('Cash flow margin below 20%');
    }

    // Check volatility
    const cashFlowVolatility = this.calculateVolatility(
      snapshots.map(s => s.cashFlow)
    );
    if (cashFlowVolatility > 0.5) {
      score -= 15;
      factors.push('Highly volatile cash flow');
    }

    return {
      category: 'Cash Flow',
      score: Math.max(0, score),
      level: this.getRiskLevel(score),
      factors,
      impact: 'Difficulty meeting monthly obligations and saving for goals'
    };
  }

  private static assessDebtRisk(
    current: FinancialSnapshot,
    future: FinancialSnapshot[]
  ): RiskScore {
    const factors: string[] = [];
    let score = 100;

    // Debt-to-income ratio
    const dtiRatio = current.debtToIncomeRatio;
    if (dtiRatio > 0.43) {
      score -= 40;
      factors.push('DTI ratio exceeds 43% threshold');
    } else if (dtiRatio > 0.36) {
      score -= 20;
      factors.push('DTI ratio above recommended 36%');
    }

    // Debt growth
    const debtGrowth = future.filter((s, i) => 
      i > 0 && s.totalLiabilities > future[i-1].totalLiabilities
    ).length;
    
    if (debtGrowth > future.length * 0.3) {
      score -= 20;
      factors.push('Debt increasing in multiple periods');
    }

    // High-interest debt
    if (current.totalLiabilities > current.netWorth * 0.5) {
      score -= 20;
      factors.push('Total debt exceeds 50% of net worth');
    }

    return {
      category: 'Debt Management',
      score: Math.max(0, score),
      level: this.getRiskLevel(score),
      factors,
      impact: 'Limited borrowing capacity and reduced financial flexibility'
    };
  }

  private static assessInvestmentRisk(
    current: FinancialSnapshot,
    events: any[]
  ): RiskScore {
    const factors: string[] = [];
    let score = 100;

    // Asset allocation
    const investmentRatio = current.investmentBalance / current.totalAssets;
    if (investmentRatio < 0.2) {
      score -= 30;
      factors.push('Low investment allocation (under 20% of assets)');
    }

    // Retirement readiness
    const retirementRatio = current.retirementBalance / (current.income * 10);
    if (retirementRatio < 0.5) {
      score -= 25;
      factors.push('Retirement savings below target');
    }

    // Concentration risk
    if (current.investmentBalance > 0 && !events.some(e => e.type === 'investment')) {
      score -= 15;
      factors.push('No investment diversification events planned');
    }

    return {
      category: 'Investment & Retirement',
      score: Math.max(0, score),
      level: this.getRiskLevel(score),
      factors,
      impact: 'Insufficient growth potential and retirement preparedness'
    };
  }

  private static assessGoalRisk(
    snapshots: FinancialSnapshot[],
    goals: any
  ): RiskScore {
    const factors: string[] = [];
    let score = 100;

    // This would integrate with actual goal tracking
    // For now, using simplified logic
    const netWorthGrowth = (
      snapshots[snapshots.length - 1].netWorth - snapshots[0].netWorth
    ) / snapshots[0].netWorth;

    if (netWorthGrowth < 0) {
      score -= 40;
      factors.push('Net worth declining over projection period');
    } else if (netWorthGrowth < 0.1) {
      score -= 20;
      factors.push('Net worth growth below 10%');
    }

    return {
      category: 'Goal Achievement',
      score: Math.max(0, score),
      level: this.getRiskLevel(score),
      factors,
      impact: 'Risk of not achieving financial goals on schedule'
    };
  }

  private static generateRecommendations(
    risk: RiskScore,
    current: FinancialSnapshot,
    events: any[]
  ): Recommendation[] {
    const recommendations: Recommendation[] = [];

    if (risk.category === 'Emergency Fund' && risk.score < 60) {
      recommendations.push({
        id: 'ef-1',
        priority: risk.score < 30 ? 'IMMEDIATE' : 'HIGH',
        category: 'Emergency Fund',
        title: 'Build Emergency Fund to 6 Months',
        description: 'Increase emergency savings to cover 6 months of expenses',
        impact: 'Protect against job loss and unexpected expenses',
        timeline: '3-6 months',
        estimatedSavings: current.expenses * 3,
        implementation: [
          'Set up automatic transfer of $500/month to high-yield savings',
          'Reduce discretionary spending by 20%',
          'Apply any windfalls (bonuses, tax refunds) to emergency fund',
          'Consider temporary side income'
        ]
      });

      if (risk.score < 30) {
        recommendations.push({
          id: 'ef-2',
          priority: 'IMMEDIATE',
          category: 'Risk Management',
          title: 'Switch to Lower Deductible Health Plan',
          description: 'Reduce health insurance deductible to minimize out-of-pocket risk',
          impact: 'Lower financial exposure during emergency fund rebuild',
          timeline: 'Next enrollment period',
          implementation: [
            'Compare health plan options during open enrollment',
            'Calculate total cost including premiums and max out-of-pocket',
            'Consider HSA-eligible plan once emergency fund is rebuilt'
          ]
        });
      }
    }

    if (risk.category === 'Cash Flow' && risk.score < 70) {
      recommendations.push({
        id: 'cf-1',
        priority: 'HIGH',
        category: 'Cash Flow',
        title: 'Optimize Monthly Cash Flow',
        description: 'Increase monthly surplus to at least 20% of income',
        impact: 'Accelerate goal achievement and build financial resilience',
        timeline: '1-2 months',
        estimatedSavings: current.income * 0.1,
        implementation: [
          'Review and cancel unused subscriptions',
          'Negotiate lower rates on insurance and utilities',
          'Implement zero-based budgeting',
          'Consider refinancing high-interest debt'
        ]
      });
    }

    if (risk.category === 'Debt Management' && risk.score < 60) {
      recommendations.push({
        id: 'dm-1',
        priority: risk.score < 30 ? 'IMMEDIATE' : 'HIGH',
        category: 'Debt Reduction',
        title: 'Accelerate Debt Payoff Strategy',
        description: 'Implement avalanche method to reduce high-interest debt',
        impact: 'Save on interest and improve debt-to-income ratio',
        timeline: '12-24 months',
        estimatedSavings: current.totalLiabilities * 0.15,
        implementation: [
          'List all debts by interest rate',
          'Pay minimums on all debts',
          'Apply extra payments to highest-rate debt first',
          'Consider balance transfer for credit card debt',
          'Avoid new debt until DTI < 36%'
        ]
      });
    }

    return recommendations;
  }

  private static identifyCriticalPeriods(snapshots: FinancialSnapshot[]): string[] {
    const warnings: string[] = [];

    snapshots.forEach((snapshot, index) => {
      if (snapshot.emergencyFund < snapshot.expenses * 2) {
        warnings.push(
          `Month ${index + 1}: Emergency fund drops below 2 months of expenses`
        );
      }

      if (snapshot.cashFlow < 0) {
        warnings.push(
          `Month ${index + 1}: Negative cash flow of ${Math.abs(snapshot.cashFlow)}`
        );
      }

      if (snapshot.debtToIncomeRatio > 0.43) {
        warnings.push(
          `Month ${index + 1}: Debt-to-income ratio exceeds 43%`
        );
      }
    });

    return warnings.slice(0, 5); // Return top 5 warnings
  }

  private static findOpportunities(
    current: FinancialSnapshot,
    events: any[]
  ): string[] {
    const opportunities: string[] = [];

    // Tax optimization
    if (current.income > 100000) {
      opportunities.push(
        'Consider maxing out 401(k) contributions for tax savings'
      );
    }

    // Investment opportunities
    if (current.cashFlow / current.income > 0.3) {
      opportunities.push(
        'Strong cash flow allows for increased investment contributions'
      );
    }

    // Debt optimization
    if (current.totalLiabilities > 50000) {
      opportunities.push(
        'Explore refinancing options for potential interest savings'
      );
    }

    return opportunities;
  }

  private static calculateVolatility(values: number[]): number {
    if (values.length < 2) return 0;
    
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance = values.reduce((sum, val) => 
      sum + Math.pow(val - mean, 2), 0
    ) / values.length;
    
    return Math.sqrt(variance) / Math.abs(mean);
  }

  private static getRiskLevel(score: number): 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW' {
    if (score < 25) return 'CRITICAL';
    if (score < 50) return 'HIGH';
    if (score < 75) return 'MODERATE';
    return 'LOW';
  }

  private static prioritizeRecommendations(
    recommendations: Recommendation[]
  ): Recommendation[] {
    const priorityOrder = {
      'IMMEDIATE': 0,
      'HIGH': 1,
      'MEDIUM': 2,
      'LOW': 3
    };

    return recommendations.sort((a, b) => 
      priorityOrder[a.priority] - priorityOrder[b.priority]
    );
  }
}