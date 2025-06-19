import { SupabaseClient } from '@supabase/supabase-js';

export interface ScenarioParameters {
  // Job Loss
  incomeReduction?: number;
  unemploymentBenefits?: boolean;
  severanceMonths?: number;
  
  // Market Downturn
  portfolioDropPercent?: number;
  recoveryMonths?: number;
  
  // Home Purchase
  homePrice?: number;
  downPaymentPercent?: number;
  mortgageRate?: number;
  mortgageYears?: number;
  propertyTax?: number;
  homeInsurance?: number;
  hoa?: number;
  
  // Vehicle Purchase
  vehiclePrice?: number;
  vehicleDownPayment?: number;
  loanRate?: number;
  loanTermMonths?: number;
  
  // Marriage
  spouseIncome?: number;
  spouseExpenses?: number;
  weddingCost?: number;
  
  // New Baby
  monthlyChildcare?: number;
  medicalCosts?: number;
  parentalLeaveWeeks?: number;
  reducedIncomePercent?: number;
  
  // Start Business
  startupCosts?: number;
  monthlyBusinessExpenses?: number;
  salaryReduction?: number;
  projectedRevenue?: number[];
  
  // Custom
  monthlyIncomeChange?: number;
  monthlyExpenseChange?: number;
  oneTimeCost?: number;
  oneTimeIncome?: number;
  
  [key: string]: any;
}

export interface MonthlySnapshot {
  date: Date;
  netWorth: number;
  totalAssets: number;
  totalLiabilities: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  cashFlow: number;
  emergencyFund: number;
  savingsRate: number;
  debtToIncomeRatio: number;
}

export interface SimulationResult {
  snapshots: MonthlySnapshot[];
  impactOnNetWorth: number;
  impactOnCashFlow: number;
  newHealthScore: number;
  riskLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  warnings: string[];
  opportunities: string[];
}

export class FinancialSimulatorEngineService {
  constructor(private supabase: SupabaseClient) {}

  async runSimulation(
    userId: string,
    scenarioType: string,
    parameters: ScenarioParameters,
    startDate: Date = new Date(),
    durationMonths: number = 60
  ): Promise<SimulationResult> {
    // Fetch user's current financial state
    const baselineState = await this.getUserFinancialState(userId);
    
    // Generate monthly snapshots
    const snapshots = this.generateSnapshots(
      baselineState,
      scenarioType,
      parameters,
      startDate,
      durationMonths
    );
    
    // Calculate impacts
    const firstSnapshot = snapshots[0];
    const lastSnapshot = snapshots[snapshots.length - 1];
    
    const impactOnNetWorth = lastSnapshot.netWorth - firstSnapshot.netWorth;
    const impactOnCashFlow = lastSnapshot.cashFlow - firstSnapshot.cashFlow;
    
    // Calculate new health score
    const newHealthScore = this.calculateHealthScore(lastSnapshot);
    
    // Assess risk level
    const riskLevel = this.assessRiskLevel(snapshots);
    
    // Generate warnings and opportunities
    const { warnings, opportunities } = this.analyzeScenario(snapshots, parameters);
    
    return {
      snapshots,
      impactOnNetWorth,
      impactOnCashFlow,
      newHealthScore,
      riskLevel,
      warnings,
      opportunities
    };
  }

  private async getUserFinancialState(userId: string) {
    // Fetch accounts
    const { data: accounts } = await this.supabase
      .from('accounts')
      .select('*')
      .eq('user_id', userId);
    
    // Calculate baseline metrics
    const totalAssets = accounts?.reduce((sum, acc) => 
      acc.type === 'depository' || acc.type === 'investment' 
        ? sum + (acc.current_balance || 0) 
        : sum, 0
    ) || 0;
    
    const totalLiabilities = accounts?.reduce((sum, acc) => 
      acc.type === 'credit' || acc.type === 'loan' 
        ? sum + (acc.current_balance || 0) 
        : sum, 0
    ) || 0;
    
    // Mock some values (would come from transaction analysis)
    const monthlyIncome = 7000;
    const monthlyExpenses = 4500;
    const emergencyFund = 15000;
    
    return {
      totalAssets,
      totalLiabilities,
      monthlyIncome,
      monthlyExpenses,
      emergencyFund,
      netWorth: totalAssets - totalLiabilities,
      cashFlow: monthlyIncome - monthlyExpenses
    };
  }

  private generateSnapshots(
    baselineState: any,
    scenarioType: string,
    parameters: ScenarioParameters,
    startDate: Date,
    durationMonths: number
  ): MonthlySnapshot[] {
    const snapshots: MonthlySnapshot[] = [];
    let currentState = { ...baselineState };
    
    for (let month = 0; month < durationMonths; month++) {
      const snapshotDate = new Date(startDate);
      snapshotDate.setMonth(snapshotDate.getMonth() + month);
      
      // Apply scenario-specific changes
      this.applyScenarioChanges(currentState, scenarioType, parameters, month);
      
      // Calculate monthly changes
      const cashFlow = currentState.monthlyIncome - currentState.monthlyExpenses;
      currentState.totalAssets += cashFlow;
      currentState.netWorth = currentState.totalAssets - currentState.totalLiabilities;
      
      // Update emergency fund
      if (cashFlow > 0) {
        currentState.emergencyFund = Math.min(
          currentState.emergencyFund + cashFlow * 0.2,
          currentState.monthlyExpenses * 6
        );
      }
      
      snapshots.push({
        date: new Date(snapshotDate),
        netWorth: currentState.netWorth,
        totalAssets: currentState.totalAssets,
        totalLiabilities: currentState.totalLiabilities,
        monthlyIncome: currentState.monthlyIncome,
        monthlyExpenses: currentState.monthlyExpenses,
        cashFlow,
        emergencyFund: currentState.emergencyFund,
        savingsRate: cashFlow > 0 ? (cashFlow / currentState.monthlyIncome) * 100 : 0,
        debtToIncomeRatio: currentState.totalLiabilities / (currentState.monthlyIncome * 12)
      });
    }
    
    return snapshots;
  }

  private applyScenarioChanges(
    state: any,
    scenarioType: string,
    parameters: ScenarioParameters,
    month: number
  ) {
    switch (scenarioType) {
      case 'JOB_LOSS':
        if (month === 0) {
          state.monthlyIncome *= (1 - (parameters.incomeReduction || 100) / 100);
          if (parameters.unemploymentBenefits) {
            state.monthlyIncome += 1600; // Average unemployment benefit
          }
        }
        if (month < (parameters.severanceMonths || 0)) {
          state.monthlyIncome += state.monthlyIncome / (1 - (parameters.incomeReduction || 100) / 100);
        }
        break;
        
      case 'HOME_PURCHASE':
        if (month === 0) {
          const loanAmount = (parameters.homePrice || 0) - (parameters.downPaymentPercent || 20) / 100 * (parameters.homePrice || 0);
          state.totalAssets -= (parameters.downPaymentPercent || 20) / 100 * (parameters.homePrice || 0);
          state.totalLiabilities += loanAmount;
          
          // Calculate monthly mortgage payment
          const monthlyRate = (parameters.mortgageRate || 6.5) / 100 / 12;
          const numPayments = (parameters.mortgageYears || 30) * 12;
          const monthlyPayment = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / 
            (Math.pow(1 + monthlyRate, numPayments) - 1);
          
          state.monthlyExpenses += monthlyPayment + 
            ((parameters.propertyTax || 0) / 12) + 
            ((parameters.homeInsurance || 0) / 12) + 
            (parameters.hoa || 0);
        }
        break;
        
      case 'NEW_BABY':
        if (month === 0) {
          state.totalAssets -= parameters.medicalCosts || 0;
        }
        if (month < (parameters.parentalLeaveWeeks || 0) * 0.25) {
          state.monthlyIncome *= (1 - (parameters.reducedIncomePercent || 0) / 100);
        }
        state.monthlyExpenses += parameters.monthlyChildcare || 0;
        break;
        
      // Add more scenario implementations...
    }
  }

  private calculateHealthScore(snapshot: MonthlySnapshot): number {
    let score = 0;
    
    // Net worth component (20 points)
    if (snapshot.netWorth > 0) score += 20;
    else if (snapshot.netWorth > -10000) score += 10;
    
    // Emergency fund component (20 points)
    const monthsCovered = snapshot.emergencyFund / snapshot.monthlyExpenses;
    if (monthsCovered >= 6) score += 20;
    else if (monthsCovered >= 3) score += 15;
    else if (monthsCovered >= 1) score += 10;
    else score += 5;
    
    // Savings rate component (20 points)
    if (snapshot.savingsRate >= 20) score += 20;
    else if (snapshot.savingsRate >= 10) score += 15;
    else if (snapshot.savingsRate >= 5) score += 10;
    else if (snapshot.savingsRate > 0) score += 5;
    
    // Cash flow component (20 points)
    if (snapshot.cashFlow > 1000) score += 20;
    else if (snapshot.cashFlow > 500) score += 15;
    else if (snapshot.cashFlow > 0) score += 10;
    
    // Debt ratio component (20 points)
    if (snapshot.debtToIncomeRatio === 0) score += 20;
    else if (snapshot.debtToIncomeRatio < 0.2) score += 15;
    else if (snapshot.debtToIncomeRatio < 0.4) score += 10;
    else if (snapshot.debtToIncomeRatio < 0.6) score += 5;
    
    return Math.round(score);
  }

  private assessRiskLevel(snapshots: MonthlySnapshot[]): 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL' {
    const lastSnapshot = snapshots[snapshots.length - 1];
    const negativeMonths = snapshots.filter(s => s.cashFlow < 0).length;
    const emergencyMonths = lastSnapshot.emergencyFund / lastSnapshot.monthlyExpenses;
    
    if (negativeMonths > 6 || emergencyMonths < 1 || lastSnapshot.debtToIncomeRatio > 0.8) {
      return 'CRITICAL';
    } else if (negativeMonths > 3 || emergencyMonths < 3 || lastSnapshot.debtToIncomeRatio > 0.6) {
      return 'HIGH';
    } else if (negativeMonths > 1 || emergencyMonths < 6 || lastSnapshot.debtToIncomeRatio > 0.4) {
      return 'MODERATE';
    }
    return 'LOW';
  }

  private analyzeScenario(
    snapshots: MonthlySnapshot[],
    parameters: ScenarioParameters
  ): { warnings: string[]; opportunities: string[] } {
    const warnings: string[] = [];
    const opportunities: string[] = [];
    
    const lastSnapshot = snapshots[snapshots.length - 1];
    const emergencyMonths = lastSnapshot.emergencyFund / lastSnapshot.monthlyExpenses;
    
    // Warnings
    if (emergencyMonths < 3) {
      warnings.push('Emergency fund will drop below 3 months of expenses');
    }
    if (lastSnapshot.cashFlow < 0) {
      warnings.push('Monthly expenses exceed income - unsustainable situation');
    }
    if (lastSnapshot.debtToIncomeRatio > 0.6) {
      warnings.push('High debt-to-income ratio may limit future borrowing');
    }
    
    // Opportunities
    if (lastSnapshot.savingsRate > 20) {
      opportunities.push('High savings rate allows for accelerated goal achievement');
    }
    if (lastSnapshot.netWorth > snapshots[0].netWorth * 1.5) {
      opportunities.push('Strong net worth growth creates investment opportunities');
    }
    
    return { warnings, opportunities };
  }

  async saveScenario(
    userId: string,
    name: string,
    description: string,
    scenarioType: string,
    parameters: ScenarioParameters,
    result: SimulationResult,
    tags: string[] = []
  ): Promise<string> {
    const { data, error } = await this.supabase
      .from('financial_scenarios')
      .insert({
        user_id: userId,
        name,
        description,
        scenario_type: scenarioType,
        parameters,
        simulation_result: result,
        tags,
        risk_level: result.riskLevel,
        impact_on_net_worth: result.impactOnNetWorth,
        impact_on_cash_flow: result.impactOnCashFlow,
        created_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (error) throw error;
    return data.id;
  }

  async getSavedScenarios(userId: string): Promise<any[]> {
    const { data, error } = await this.supabase
      .from('financial_scenarios')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }

  async getScenarioTemplates(): Promise<any[]> {
    // Return predefined scenario templates
    return [
      {
        id: 'job-loss',
        name: 'Job Loss',
        description: 'Simulate unemployment and recovery',
        scenarioType: 'JOB_LOSS',
        defaultParameters: {
          incomeReduction: 100,
          unemploymentBenefits: true,
          severanceMonths: 2
        }
      },
      {
        id: 'home-purchase',
        name: 'Home Purchase',
        description: 'Plan for buying a home',
        scenarioType: 'HOME_PURCHASE',
        defaultParameters: {
          homePrice: 400000,
          downPaymentPercent: 20,
          mortgageRate: 6.5,
          mortgageYears: 30
        }
      },
      // Add more templates...
    ];
  }
}