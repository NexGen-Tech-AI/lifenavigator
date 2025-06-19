import { createClient } from '@/lib/supabase/server';

export interface ScenarioParameters {
  // Job Loss
  incomeReduction?: number; // percentage
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
  projectedRevenue?: number[];
  salaryReduction?: number;
  
  // Custom
  monthlyIncomeChange?: number;
  monthlyExpenseChange?: number;
  oneTimeCost?: number;
  oneTimeIncome?: number;
}

export interface SimulationSnapshot {
  date: Date;
  monthsFromStart: number;
  netWorth: number;
  totalAssets: number;
  totalLiabilities: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  cashFlow: number;
  emergencyFundMonths: number;
  debtToIncomeRatio: number;
  investmentBalance: number;
  retirementBalance: number;
}

export interface SimulationResult {
  scenarioId?: string;
  snapshots: SimulationSnapshot[];
  impactOnNetWorth: number;
  impactOnCashFlow: number;
  newHealthScore: number;
  riskLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  warnings: string[];
  opportunities: string[];
}

export class FinancialSimulatorService {
  private supabase: any;

  constructor(supabase: any) {
    this.supabase = supabase;
  }

  async runSimulation(
    userId: string,
    scenarioType: string,
    parameters: ScenarioParameters,
    startDate: Date = new Date(),
    durationMonths: number = 60
  ): Promise<SimulationResult> {
    try {
      // Get current financial state
      const baselineState = await this.getCurrentFinancialState(userId);
      
      // Run simulation based on scenario type
      let simulationMethod: (state: any, params: ScenarioParameters, month: number) => any;
      
      switch (scenarioType) {
        case 'JOB_LOSS':
          simulationMethod = this.simulateJobLoss;
          break;
        case 'MARKET_DOWNTURN':
          simulationMethod = this.simulateMarketDownturn;
          break;
        case 'HOME_PURCHASE':
          simulationMethod = this.simulateHomePurchase;
          break;
        case 'VEHICLE_PURCHASE':
          simulationMethod = this.simulateVehiclePurchase;
          break;
        case 'MARRIAGE':
          simulationMethod = this.simulateMarriage;
          break;
        case 'NEW_BABY':
          simulationMethod = this.simulateNewBaby;
          break;
        case 'START_BUSINESS':
          simulationMethod = this.simulateStartBusiness;
          break;
        default:
          simulationMethod = this.simulateCustomScenario;
      }

      // Generate monthly snapshots
      const snapshots: SimulationSnapshot[] = [];
      let currentState = { ...baselineState };
      
      for (let month = 0; month <= durationMonths; month++) {
        const snapshotDate = new Date(startDate);
        snapshotDate.setMonth(snapshotDate.getMonth() + month);
        
        // Apply scenario effects
        currentState = simulationMethod.call(this, currentState, parameters, month);
        
        // Calculate derived metrics
        const emergencyFundMonths = currentState.monthlyExpenses > 0 
          ? currentState.emergencyFund / currentState.monthlyExpenses 
          : 0;
          
        const debtToIncomeRatio = currentState.monthlyIncome > 0
          ? currentState.monthlyDebtPayments / currentState.monthlyIncome
          : 0;
        
        snapshots.push({
          date: snapshotDate,
          monthsFromStart: month,
          netWorth: currentState.totalAssets - currentState.totalLiabilities,
          totalAssets: currentState.totalAssets,
          totalLiabilities: currentState.totalLiabilities,
          monthlyIncome: currentState.monthlyIncome,
          monthlyExpenses: currentState.monthlyExpenses,
          cashFlow: currentState.monthlyIncome - currentState.monthlyExpenses,
          emergencyFundMonths,
          debtToIncomeRatio,
          investmentBalance: currentState.investmentBalance,
          retirementBalance: currentState.retirementBalance
        });
      }

      // Calculate impacts
      const initialNetWorth = snapshots[0].netWorth;
      const finalNetWorth = snapshots[snapshots.length - 1].netWorth;
      const impactOnNetWorth = finalNetWorth - initialNetWorth;
      
      const avgInitialCashFlow = snapshots.slice(0, 3).reduce((sum, s) => sum + s.cashFlow, 0) / 3;
      const avgFinalCashFlow = snapshots.slice(-3).reduce((sum, s) => sum + s.cashFlow, 0) / 3;
      const impactOnCashFlow = avgFinalCashFlow - avgInitialCashFlow;

      // Calculate new health score (simplified)
      const finalSnapshot = snapshots[snapshots.length - 1];
      const newHealthScore = this.calculateHealthScoreFromSnapshot(finalSnapshot);

      // Determine risk level
      const riskLevel = this.assessRiskLevel(snapshots);

      // Generate warnings and opportunities
      const { warnings, opportunities } = this.analyzeSimulation(snapshots, parameters);

      return {
        snapshots,
        impactOnNetWorth,
        impactOnCashFlow,
        newHealthScore,
        riskLevel,
        warnings,
        opportunities
      };
    } catch (error) {
      console.error('Error running simulation:', error);
      throw error;
    }
  }

  private async getCurrentFinancialState(userId: string) {
    // Fetch all necessary financial data
    const [accounts, transactions, investments] = await Promise.all([
      this.getAccounts(userId),
      this.getRecentTransactions(userId, 3),
      this.getInvestments(userId)
    ]);

    // Calculate current state
    const totalAssets = accounts
      .filter(a => !['CREDIT_CARD', 'LOAN', 'MORTGAGE'].includes(a.account_type))
      .reduce((sum, a) => sum + (a.current_balance || 0), 0);

    const totalLiabilities = accounts
      .filter(a => ['CREDIT_CARD', 'LOAN', 'MORTGAGE'].includes(a.account_type))
      .reduce((sum, a) => sum + Math.abs(a.current_balance || 0), 0);

    const emergencyFund = accounts
      .filter(a => a.account_type === 'SAVINGS')
      .reduce((sum, a) => sum + (a.current_balance || 0), 0);

    const investmentBalance = investments.reduce((sum, i) => sum + (i.current_value || 0), 0);
    
    const retirementBalance = accounts
      .filter(a => a.account_type === 'RETIREMENT')
      .reduce((sum, a) => sum + (a.current_balance || 0), 0);

    // Calculate monthly income and expenses from transactions
    const monthlyIncome = this.calculateMonthlyAverage(transactions.filter(t => t.amount > 0));
    const monthlyExpenses = Math.abs(this.calculateMonthlyAverage(transactions.filter(t => t.amount < 0)));
    const monthlyDebtPayments = Math.abs(this.calculateMonthlyAverage(
      transactions.filter(t => t.amount < 0 && ['LOAN_PAYMENT', 'MORTGAGE', 'CREDIT_CARD_PAYMENT'].includes(t.category))
    ));

    return {
      totalAssets,
      totalLiabilities,
      emergencyFund,
      investmentBalance,
      retirementBalance,
      monthlyIncome,
      monthlyExpenses,
      monthlyDebtPayments,
      liquidAssets: emergencyFund + investmentBalance * 0.5, // Assume 50% of investments are liquid
    };
  }

  private simulateJobLoss(state: any, params: ScenarioParameters, month: number) {
    const newState = { ...state };
    
    // Reduce income
    if (params.incomeReduction) {
      newState.monthlyIncome *= (1 - params.incomeReduction / 100);
    }
    
    // Add unemployment benefits (typically 6 months)
    if (params.unemploymentBenefits && month <= 6) {
      newState.monthlyIncome += state.monthlyIncome * 0.4; // Assume 40% of original income
    }
    
    // Add severance (one-time)
    if (params.severanceMonths && month === 0) {
      newState.liquidAssets += state.monthlyIncome * params.severanceMonths;
    }
    
    // Deplete emergency fund if cash flow negative
    const cashFlow = newState.monthlyIncome - newState.monthlyExpenses;
    if (cashFlow < 0 && newState.emergencyFund > 0) {
      const fundDepletion = Math.min(Math.abs(cashFlow), newState.emergencyFund);
      newState.emergencyFund -= fundDepletion;
      newState.totalAssets -= fundDepletion;
    }
    
    return newState;
  }

  private simulateMarketDownturn(state: any, params: ScenarioParameters, month: number) {
    const newState = { ...state };
    const dropPercent = params.portfolioDropPercent || 25;
    const recoveryMonths = params.recoveryMonths || 18;
    
    if (month === 0) {
      // Initial drop
      newState.investmentBalance *= (1 - dropPercent / 100);
      newState.retirementBalance *= (1 - dropPercent / 100);
      newState.totalAssets = state.totalAssets - state.investmentBalance - state.retirementBalance + 
                             newState.investmentBalance + newState.retirementBalance;
    } else if (month <= recoveryMonths) {
      // Gradual recovery
      const recoveryRate = dropPercent / recoveryMonths / 100;
      newState.investmentBalance *= (1 + recoveryRate);
      newState.retirementBalance *= (1 + recoveryRate);
      newState.totalAssets = state.totalAssets - state.investmentBalance - state.retirementBalance + 
                             newState.investmentBalance + newState.retirementBalance;
    }
    
    return newState;
  }

  private simulateHomePurchase(state: any, params: ScenarioParameters, month: number) {
    const newState = { ...state };
    
    if (month === 0) {
      // Down payment
      const downPayment = (params.homePrice || 0) * (params.downPaymentPercent || 20) / 100;
      newState.liquidAssets -= downPayment;
      newState.totalAssets -= downPayment;
      
      // Add mortgage
      const mortgageAmount = (params.homePrice || 0) - downPayment;
      newState.totalLiabilities += mortgageAmount;
      
      // Add home as asset
      newState.totalAssets += params.homePrice || 0;
    }
    
    // Monthly costs
    const mortgagePayment = this.calculateMortgagePayment(
      (params.homePrice || 0) * (1 - (params.downPaymentPercent || 20) / 100),
      params.mortgageRate || 6.5,
      params.mortgageYears || 30
    );
    
    const housingCosts = mortgagePayment + 
                        (params.propertyTax || 0) / 12 + 
                        (params.homeInsurance || 0) / 12 + 
                        (params.hoa || 0);
    
    newState.monthlyExpenses += housingCosts;
    newState.monthlyDebtPayments += mortgagePayment;
    
    // Pay down mortgage principal (simplified)
    if (month > 0) {
      const principalPayment = mortgagePayment * 0.3; // Rough estimate
      newState.totalLiabilities -= principalPayment;
    }
    
    return newState;
  }

  private simulateVehiclePurchase(state: any, params: ScenarioParameters, month: number) {
    const newState = { ...state };
    
    if (month === 0) {
      // Down payment
      const downPayment = params.vehicleDownPayment || 0;
      newState.liquidAssets -= downPayment;
      newState.totalAssets -= downPayment;
      
      // Add loan
      const loanAmount = (params.vehiclePrice || 0) - downPayment;
      newState.totalLiabilities += loanAmount;
      
      // Add vehicle as asset (depreciating)
      newState.totalAssets += params.vehiclePrice || 0;
    }
    
    // Monthly payment
    const monthlyPayment = this.calculateLoanPayment(
      (params.vehiclePrice || 0) - (params.vehicleDownPayment || 0),
      params.loanRate || 5,
      params.loanTermMonths || 60
    );
    
    newState.monthlyExpenses += monthlyPayment;
    newState.monthlyDebtPayments += monthlyPayment;
    
    // Vehicle depreciation (15% per year)
    if (month > 0) {
      const monthlyDepreciation = (params.vehiclePrice || 0) * 0.15 / 12;
      newState.totalAssets -= monthlyDepreciation;
    }
    
    return newState;
  }

  private simulateMarriage(state: any, params: ScenarioParameters, month: number) {
    const newState = { ...state };
    
    if (month === 0 && params.weddingCost) {
      // Wedding expenses
      newState.liquidAssets -= params.weddingCost;
      newState.totalAssets -= params.weddingCost;
    }
    
    // Add spouse income and expenses
    newState.monthlyIncome += params.spouseIncome || 0;
    newState.monthlyExpenses += params.spouseExpenses || 0;
    
    // Tax benefits (simplified - assume 10% reduction in effective tax)
    if (params.spouseIncome) {
      newState.monthlyExpenses *= 0.95;
    }
    
    return newState;
  }

  private simulateNewBaby(state: any, params: ScenarioParameters, month: number) {
    const newState = { ...state };
    
    if (month === 0 && params.medicalCosts) {
      // Medical costs
      newState.liquidAssets -= params.medicalCosts;
      newState.totalAssets -= params.medicalCosts;
    }
    
    // Parental leave income reduction
    if (params.parentalLeaveWeeks && month < params.parentalLeaveWeeks / 4) {
      newState.monthlyIncome *= (1 - (params.reducedIncomePercent || 50) / 100);
    }
    
    // Ongoing childcare costs
    if (month >= (params.parentalLeaveWeeks || 12) / 4) {
      newState.monthlyExpenses += params.monthlyChildcare || 0;
    }
    
    // Additional baby-related expenses
    newState.monthlyExpenses += 500; // Diapers, formula, etc.
    
    return newState;
  }

  private simulateStartBusiness(state: any, params: ScenarioParameters, month: number) {
    const newState = { ...state };
    
    if (month === 0 && params.startupCosts) {
      // Initial investment
      newState.liquidAssets -= params.startupCosts;
      newState.totalAssets -= params.startupCosts;
    }
    
    // Salary reduction
    if (params.salaryReduction) {
      newState.monthlyIncome *= (1 - params.salaryReduction / 100);
    }
    
    // Business expenses
    newState.monthlyExpenses += params.monthlyBusinessExpenses || 0;
    
    // Business revenue (if provided)
    if (params.projectedRevenue && params.projectedRevenue[month]) {
      newState.monthlyIncome += params.projectedRevenue[month];
    }
    
    return newState;
  }

  private simulateCustomScenario(state: any, params: ScenarioParameters, month: number) {
    const newState = { ...state };
    
    // One-time changes
    if (month === 0) {
      if (params.oneTimeCost) {
        newState.liquidAssets -= params.oneTimeCost;
        newState.totalAssets -= params.oneTimeCost;
      }
      if (params.oneTimeIncome) {
        newState.liquidAssets += params.oneTimeIncome;
        newState.totalAssets += params.oneTimeIncome;
      }
    }
    
    // Monthly changes
    newState.monthlyIncome += params.monthlyIncomeChange || 0;
    newState.monthlyExpenses += params.monthlyExpenseChange || 0;
    
    return newState;
  }

  private calculateMortgagePayment(principal: number, annualRate: number, years: number): number {
    const monthlyRate = annualRate / 100 / 12;
    const numPayments = years * 12;
    
    if (monthlyRate === 0) return principal / numPayments;
    
    return principal * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / 
           (Math.pow(1 + monthlyRate, numPayments) - 1);
  }

  private calculateLoanPayment(principal: number, annualRate: number, months: number): number {
    const monthlyRate = annualRate / 100 / 12;
    
    if (monthlyRate === 0) return principal / months;
    
    return principal * (monthlyRate * Math.pow(1 + monthlyRate, months)) / 
           (Math.pow(1 + monthlyRate, months) - 1);
  }

  private calculateHealthScoreFromSnapshot(snapshot: SimulationSnapshot): number {
    // Simplified health score calculation
    let score = 0;
    
    // Emergency fund (20%)
    if (snapshot.emergencyFundMonths >= 6) score += 20;
    else if (snapshot.emergencyFundMonths >= 3) score += 15;
    else score += (snapshot.emergencyFundMonths / 3) * 15;
    
    // Debt-to-income (20%)
    if (snapshot.debtToIncomeRatio <= 0.2) score += 20;
    else if (snapshot.debtToIncomeRatio <= 0.36) score += 15;
    else if (snapshot.debtToIncomeRatio <= 0.5) score += 10;
    else score += 5;
    
    // Cash flow (20%)
    const cashFlowRatio = snapshot.cashFlow / Math.max(snapshot.monthlyIncome, 1);
    if (cashFlowRatio >= 0.2) score += 20;
    else if (cashFlowRatio >= 0.1) score += 15;
    else if (cashFlowRatio >= 0) score += 10;
    else score += 5;
    
    // Net worth growth (20%)
    if (snapshot.netWorth > 0) score += 15;
    else score += 5;
    
    // Investment balance (20%)
    const investmentRatio = snapshot.investmentBalance / Math.max(snapshot.totalAssets, 1);
    if (investmentRatio >= 0.3) score += 20;
    else score += investmentRatio * 66.67;
    
    return Math.round(score);
  }

  private assessRiskLevel(snapshots: SimulationSnapshot[]): 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL' {
    const finalSnapshot = snapshots[snapshots.length - 1];
    
    // Check for critical conditions
    if (finalSnapshot.emergencyFundMonths < 1 || 
        finalSnapshot.cashFlow < -1000 ||
        finalSnapshot.debtToIncomeRatio > 0.5) {
      return 'CRITICAL';
    }
    
    // Check for high risk
    if (finalSnapshot.emergencyFundMonths < 3 || 
        finalSnapshot.cashFlow < 0 ||
        finalSnapshot.debtToIncomeRatio > 0.36) {
      return 'HIGH';
    }
    
    // Check for moderate risk
    if (finalSnapshot.emergencyFundMonths < 6 || 
        finalSnapshot.cashFlow < 500 ||
        finalSnapshot.debtToIncomeRatio > 0.28) {
      return 'MODERATE';
    }
    
    return 'LOW';
  }

  private analyzeSimulation(snapshots: SimulationSnapshot[], parameters: ScenarioParameters) {
    const warnings: string[] = [];
    const opportunities: string[] = [];
    
    const finalSnapshot = snapshots[snapshots.length - 1];
    
    // Warnings
    if (finalSnapshot.emergencyFundMonths < 3) {
      warnings.push('Emergency fund will drop below 3 months of expenses');
    }
    
    if (finalSnapshot.cashFlow < 0) {
      warnings.push('Monthly expenses will exceed income');
    }
    
    if (finalSnapshot.debtToIncomeRatio > 0.36) {
      warnings.push('Debt-to-income ratio will exceed recommended 36%');
    }
    
    // Find months with negative net worth
    const negativeNetWorthMonths = snapshots.filter(s => s.netWorth < 0).length;
    if (negativeNetWorthMonths > 0) {
      warnings.push(`Net worth will be negative for ${negativeNetWorthMonths} months`);
    }
    
    // Opportunities
    if (finalSnapshot.cashFlow > snapshots[0].cashFlow * 1.2) {
      opportunities.push('Cash flow improves significantly over time');
    }
    
    if (finalSnapshot.investmentBalance > snapshots[0].investmentBalance * 1.5) {
      opportunities.push('Investment portfolio shows strong growth');
    }
    
    if (parameters.homePrice && finalSnapshot.netWorth > snapshots[0].netWorth) {
      opportunities.push('Home equity builds wealth despite initial costs');
    }
    
    return { warnings, opportunities };
  }

  private async getAccounts(userId: string) {
    const { data } = await this.supabase
      .from('accounts')
      .select('*')
      .eq('user_id', userId);
    return data || [];
  }

  private async getRecentTransactions(userId: string, months: number) {
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);
    
    const { data } = await this.supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .gte('date', startDate.toISOString());
    return data || [];
  }

  private async getInvestments(userId: string) {
    const { data } = await this.supabase
      .from('investments')
      .select('*')
      .eq('user_id', userId);
    return data || [];
  }

  private calculateMonthlyAverage(transactions: any[]): number {
    if (transactions.length === 0) return 0;
    const total = transactions.reduce((sum, t) => sum + t.amount, 0);
    return total / 3; // Assuming 3 months of data
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
        start_date: new Date(),
        end_date: result.snapshots[result.snapshots.length - 1].date,
        simulation_results: result,
        impact_on_net_worth: result.impactOnNetWorth,
        impact_on_cash_flow: result.impactOnCashFlow,
        new_health_score: result.newHealthScore,
        risk_level: result.riskLevel,
        is_saved: true,
        tags
      })
      .select()
      .single();

    if (error) throw error;

    // Save snapshots
    const snapshots = result.snapshots.map(snapshot => ({
      scenario_id: data.id,
      snapshot_date: snapshot.date,
      months_from_start: snapshot.monthsFromStart,
      net_worth: snapshot.netWorth,
      total_assets: snapshot.totalAssets,
      total_liabilities: snapshot.totalLiabilities,
      monthly_income: snapshot.monthlyIncome,
      monthly_expenses: snapshot.monthlyExpenses,
      cash_flow: snapshot.cashFlow,
      emergency_fund_months: snapshot.emergencyFundMonths,
      debt_to_income_ratio: snapshot.debtToIncomeRatio,
      investment_balance: snapshot.investmentBalance,
      retirement_balance: snapshot.retirementBalance
    }));

    await this.supabase
      .from('simulation_snapshots')
      .insert(snapshots);

    return data.id;
  }

  async getSavedScenarios(userId: string): Promise<any[]> {
    const { data } = await this.supabase
      .from('financial_scenarios')
      .select('*')
      .eq('user_id', userId)
      .eq('is_saved', true)
      .order('created_at', { ascending: false });

    return data || [];
  }

  async getScenarioTemplates(): Promise<any[]> {
    const { data } = await this.supabase
      .from('scenario_templates')
      .select('*')
      .eq('is_active', true)
      .order('name');

    return data || [];
  }
}