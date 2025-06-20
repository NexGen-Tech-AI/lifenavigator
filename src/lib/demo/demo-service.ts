/**
 * Demo data service
 * Provides mock data for all API endpoints in demo mode
 */

import { 
  DEMO_USER,
  DEMO_FINANCIAL_PROFILE,
  DEMO_TAX_PROFILE,
  DEMO_TRANSACTIONS,
  DEMO_SIMULATION_SCENARIOS,
  DEMO_RETIREMENT_PROJECTIONS,
  DEMO_TAX_OPTIMIZATION
} from './demo-data';

export class DemoDataService {
  static async getUser(userId: string) {
    if (userId !== DEMO_USER.id) return null;
    return DEMO_USER;
  }

  static async getAccounts(userId: string) {
    if (userId !== DEMO_USER.id) return [];
    
    return [
      {
        id: 'demo-checking-001',
        user_id: DEMO_USER.id,
        account_name: 'Chase Checking',
        account_type: 'CHECKING',
        current_balance: DEMO_FINANCIAL_PROFILE.checking_account,
        currency: 'USD',
        is_active: true,
      },
      {
        id: 'demo-savings-001',
        user_id: DEMO_USER.id,
        account_name: 'High Yield Savings',
        account_type: 'SAVINGS',
        current_balance: DEMO_FINANCIAL_PROFILE.savings_account,
        currency: 'USD',
        is_active: true,
      },
      {
        id: 'demo-emergency-001',
        user_id: DEMO_USER.id,
        account_name: 'Emergency Fund',
        account_type: 'SAVINGS',
        current_balance: DEMO_FINANCIAL_PROFILE.emergency_fund,
        currency: 'USD',
        is_active: true,
      },
      {
        id: 'demo-401k-001',
        user_id: DEMO_USER.id,
        account_name: 'Employer 401(k)',
        account_type: 'RETIREMENT',
        current_balance: DEMO_FINANCIAL_PROFILE.retirement_401k,
        currency: 'USD',
        is_active: true,
      },
      {
        id: 'demo-ira-001',
        user_id: DEMO_USER.id,
        account_name: 'Roth IRA',
        account_type: 'RETIREMENT',
        current_balance: DEMO_FINANCIAL_PROFILE.ira_roth,
        currency: 'USD',
        is_active: true,
      },
      {
        id: 'demo-brokerage-001',
        user_id: DEMO_USER.id,
        account_name: 'Investment Account',
        account_type: 'INVESTMENT',
        current_balance: DEMO_FINANCIAL_PROFILE.brokerage_account,
        currency: 'USD',
        is_active: true,
      },
      {
        id: 'demo-mortgage-001',
        user_id: DEMO_USER.id,
        account_name: 'Home Mortgage',
        account_type: 'MORTGAGE',
        current_balance: -DEMO_FINANCIAL_PROFILE.home_mortgage,
        currency: 'USD',
        is_active: true,
        metadata: {
          interest_rate: 6.5,
          original_amount: 360000,
          property_value: DEMO_FINANCIAL_PROFILE.home_value,
        }
      },
      {
        id: 'demo-auto-001',
        user_id: DEMO_USER.id,
        account_name: 'Auto Loan',
        account_type: 'LOAN',
        current_balance: -DEMO_FINANCIAL_PROFILE.car_loan,
        currency: 'USD',
        is_active: true,
        metadata: {
          interest_rate: 4.5,
          original_amount: 30000,
        }
      },
    ];
  }

  static async getTransactions(userId: string, startDate?: Date, endDate?: Date) {
    if (userId !== DEMO_USER.id) return [];
    
    // Generate 3 months of transaction history
    const transactions = [];
    const baseDate = new Date('2024-01-01');
    
    for (let month = 0; month < 3; month++) {
      for (let day = 1; day <= 28; day += 3) {
        const date = new Date(baseDate);
        date.setMonth(date.getMonth() + month);
        date.setDate(day);
        
        // Add varied transactions
        if (day === 1) {
          // Paychecks
          transactions.push({
            id: `demo-tx-salary-${month}-${day}`,
            date: date.toISOString(),
            description: 'Direct Deposit - Salary',
            amount: 7250,
            category: 'INCOME',
            account_id: 'demo-checking-001',
          });
          transactions.push({
            id: `demo-tx-spouse-${month}-${day}`,
            date: date.toISOString(),
            description: 'Direct Deposit - Spouse',
            amount: 4375,
            category: 'INCOME',
            account_id: 'demo-checking-001',
          });
        }
        
        if (day === 5) {
          // Mortgage
          transactions.push({
            id: `demo-tx-mortgage-${month}-${day}`,
            date: date.toISOString(),
            description: 'Mortgage Payment',
            amount: -2200,
            category: 'HOUSING',
            account_id: 'demo-checking-001',
          });
        }
        
        if (day === 10) {
          // Utilities
          transactions.push({
            id: `demo-tx-utilities-${month}-${day}`,
            date: date.toISOString(),
            description: 'Electric & Gas',
            amount: -250,
            category: 'UTILITIES',
            account_id: 'demo-checking-001',
          });
        }
        
        if (day === 15) {
          // 401k & Car payment
          transactions.push({
            id: `demo-tx-401k-${month}-${day}`,
            date: date.toISOString(),
            description: '401k Contribution',
            amount: -1250,
            category: 'RETIREMENT',
            account_id: 'demo-checking-001',
          });
          transactions.push({
            id: `demo-tx-car-${month}-${day}`,
            date: date.toISOString(),
            description: 'Car Payment',
            amount: -450,
            category: 'TRANSPORTATION',
            account_id: 'demo-checking-001',
          });
        }
        
        // Random expenses
        if (day % 7 === 0) {
          transactions.push({
            id: `demo-tx-grocery-${month}-${day}`,
            date: date.toISOString(),
            description: 'Whole Foods',
            amount: -(150 + Math.random() * 100),
            category: 'GROCERIES',
            account_id: 'demo-checking-001',
          });
        }
      }
    }
    
    return transactions.sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }

  static async getFinancialHealth(userId: string) {
    if (userId !== DEMO_USER.id) return null;
    
    const totalAssets = 
      DEMO_FINANCIAL_PROFILE.checking_account +
      DEMO_FINANCIAL_PROFILE.savings_account +
      DEMO_FINANCIAL_PROFILE.emergency_fund +
      DEMO_FINANCIAL_PROFILE.brokerage_account +
      DEMO_FINANCIAL_PROFILE.retirement_401k +
      DEMO_FINANCIAL_PROFILE.ira_roth +
      DEMO_FINANCIAL_PROFILE.college_529 +
      DEMO_FINANCIAL_PROFILE.home_value +
      DEMO_FINANCIAL_PROFILE.car_value;
    
    const totalLiabilities = 
      DEMO_FINANCIAL_PROFILE.home_mortgage +
      DEMO_FINANCIAL_PROFILE.car_loan;
    
    const netWorth = totalAssets - totalLiabilities;
    const monthlyExpenses = 10500; // Sum of all monthly expenses
    
    return {
      score: 82,
      components: {
        emergency_fund: {
          score: 95,
          months_covered: 5.7,
          target_months: 6,
          current_amount: DEMO_FINANCIAL_PROFILE.emergency_fund,
        },
        debt_management: {
          score: 78,
          debt_to_income_ratio: 0.28,
          credit_utilization: 0.15,
        },
        retirement_readiness: {
          score: 85,
          on_track: true,
          projected_income_replacement: 0.82,
          years_to_retirement: 27,
        },
        investment_diversification: {
          score: 80,
          asset_allocation: {
            stocks: 70,
            bonds: 20,
            cash: 10,
          }
        }
      },
      net_worth: netWorth,
      cash_flow: {
        monthly_income: DEMO_FINANCIAL_PROFILE.total_household_income / 12,
        monthly_expenses: monthlyExpenses,
        monthly_surplus: (DEMO_FINANCIAL_PROFILE.total_household_income / 12) - monthlyExpenses,
      }
    };
  }

  static async getTaxSummary(userId: string) {
    if (userId !== DEMO_USER.id) return null;
    
    return {
      filing_status: DEMO_TAX_PROFILE.filing_status,
      tax_year: 2024,
      income: {
        wages: DEMO_FINANCIAL_PROFILE.total_household_income,
        interest: 1200,
        dividends: 3500,
        capital_gains: 5000,
        total_income: DEMO_FINANCIAL_PROFILE.total_household_income + 9700,
      },
      deductions: {
        standard_deduction: 29200,
        itemized_deductions: {
          mortgage_interest: DEMO_TAX_PROFILE.mortgage_interest,
          property_tax: DEMO_TAX_PROFILE.property_tax,
          charitable: DEMO_TAX_PROFILE.charitable_donations,
          total: 26500,
        },
        chosen_method: 'standard',
      },
      tax_liability: {
        federal_tax: 28500,
        state_tax: 0, // Texas
        fica_tax: 15300,
        total_tax: 43800,
        effective_rate: 21.9,
        marginal_rate: 24,
      },
      withholdings: {
        federal: 29000,
        state: 0,
        fica: 15300,
        total: 44300,
      },
      refund: 500,
      optimization_opportunities: DEMO_TAX_OPTIMIZATION.optimization_opportunities,
    };
  }

  static async getSimulationScenarios(userId: string) {
    if (userId !== DEMO_USER.id) return [];
    return DEMO_SIMULATION_SCENARIOS;
  }

  static async getRetirementProjections(userId: string) {
    if (userId !== DEMO_USER.id) return null;
    return DEMO_RETIREMENT_PROJECTIONS;
  }

  static async getInvestments(userId: string) {
    if (userId !== DEMO_USER.id) return [];
    
    return [
      {
        id: 'demo-inv-001',
        user_id: DEMO_USER.id,
        name: 'S&P 500 Index Fund',
        symbol: 'VOO',
        quantity: 150,
        cost_basis: 45000,
        current_value: 62000,
        asset_class: 'STOCKS',
        account_id: 'demo-brokerage-001',
      },
      {
        id: 'demo-inv-002',
        user_id: DEMO_USER.id,
        name: 'Total Bond Market',
        symbol: 'BND',
        quantity: 200,
        cost_basis: 15000,
        current_value: 16000,
        asset_class: 'BONDS',
        account_id: 'demo-brokerage-001',
      },
      {
        id: 'demo-inv-003',
        user_id: DEMO_USER.id,
        name: 'International Stock Market',
        symbol: 'VTIAX',
        quantity: 100,
        cost_basis: 6000,
        current_value: 7000,
        asset_class: 'STOCKS',
        account_id: 'demo-brokerage-001',
      },
      {
        id: 'demo-inv-004',
        user_id: DEMO_USER.id,
        name: 'Target Date 2055',
        symbol: 'VFFVX',
        quantity: 1000,
        cost_basis: 180000,
        current_value: 225000,
        asset_class: 'MIXED',
        account_id: 'demo-401k-001',
      },
    ];
  }
}