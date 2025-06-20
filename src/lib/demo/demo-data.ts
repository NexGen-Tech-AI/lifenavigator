/**
 * Demo data for the LifeNavigator demo mode
 * Represents a realistic 35-year-old professional
 */

export const DEMO_USER = {
  id: 'demo-user-001',
  email: 'demo@lifenavigator.ai',
  name: 'Alex Johnson',
  age: 35,
  occupation: 'Senior Software Engineer',
  location: 'Austin, TX',
  family_status: 'Married, 1 child',
};

export const DEMO_FINANCIAL_PROFILE = {
  // Income
  annual_salary: 125000,
  spouse_income: 75000,
  total_household_income: 200000,
  
  // Assets
  checking_account: 15000,
  savings_account: 45000,
  emergency_fund: 60000, // 6 months expenses
  
  // Investments
  brokerage_account: 85000,
  retirement_401k: 225000,
  spouse_401k: 125000,
  ira_roth: 45000,
  college_529: 25000,
  
  // Property
  home_value: 450000,
  home_mortgage: 320000,
  car_value: 35000,
  car_loan: 15000,
  
  // Monthly expenses
  mortgage_payment: 2200,
  property_tax: 625,
  home_insurance: 150,
  utilities: 250,
  car_payment: 450,
  car_insurance: 180,
  groceries: 800,
  dining_out: 400,
  childcare: 1500,
  healthcare: 300,
  subscriptions: 150,
  miscellaneous: 500,
  
  // Retirement contributions
  monthly_401k_contribution: 1250, // 12% of salary
  employer_match: 625, // 6% match
  ira_contribution: 500,
  
  // Goals
  retirement_age: 62,
  retirement_income_goal: 160000, // 80% of current
  college_fund_goal: 150000,
  next_car_purchase: 2026,
  home_renovation_budget: 50000,
};

export const DEMO_TAX_PROFILE = {
  filing_status: 'married_jointly',
  dependents: 1,
  state: 'TX', // No state income tax
  
  // Deductions
  mortgage_interest: 14000,
  property_tax: 7500,
  charitable_donations: 5000,
  
  // Pre-tax deductions
  health_insurance: 450, // monthly
  hsa_contribution: 300, // monthly
  dependent_care_fsa: 416, // monthly ($5000 annual max)
  
  // Tax advantaged accounts
  traditional_401k: true,
  roth_ira: true,
  hsa: true,
};

export const DEMO_TRANSACTIONS = [
  // Income
  { date: '2024-01-01', description: 'Salary Deposit', amount: 7250, category: 'INCOME' },
  { date: '2024-01-01', description: 'Spouse Salary', amount: 4375, category: 'INCOME' },
  
  // Regular expenses
  { date: '2024-01-05', description: 'Mortgage Payment', amount: -2200, category: 'HOUSING' },
  { date: '2024-01-07', description: 'Childcare', amount: -750, category: 'CHILDCARE' },
  { date: '2024-01-10', description: 'Grocery Store', amount: -200, category: 'GROCERIES' },
  { date: '2024-01-12', description: 'Electric Bill', amount: -125, category: 'UTILITIES' },
  { date: '2024-01-15', description: 'Car Payment', amount: -450, category: 'TRANSPORTATION' },
  
  // Investments
  { date: '2024-01-15', description: '401k Contribution', amount: -1250, category: 'RETIREMENT' },
  { date: '2024-01-15', description: 'IRA Contribution', amount: -500, category: 'RETIREMENT' },
  { date: '2024-01-20', description: '529 Contribution', amount: -500, category: 'EDUCATION' },
];

export const DEMO_SIMULATION_SCENARIOS = [
  {
    name: 'Job Loss Scenario',
    type: 'JOB_LOSS',
    description: 'What if I lost my job for 6 months?',
    parameters: {
      incomeReduction: 100,
      unemploymentBenefits: true,
      severanceMonths: 2,
    }
  },
  {
    name: 'Market Crash',
    type: 'MARKET_DOWNTURN',
    description: '30% market decline with 18-month recovery',
    parameters: {
      portfolioDropPercent: 30,
      recoveryMonths: 18,
    }
  },
  {
    name: 'Second Child',
    type: 'NEW_BABY',
    description: 'Planning for another child',
    parameters: {
      monthlyChildcare: 1500,
      medicalCosts: 5000,
      parentalLeaveWeeks: 12,
      reducedIncomePercent: 25,
    }
  },
  {
    name: 'Home Renovation',
    type: 'CUSTOM',
    description: 'Major kitchen and bathroom renovation',
    parameters: {
      oneTimeCost: 50000,
      monthlyExpenseChange: 200, // Higher utilities
    }
  }
];

export const DEMO_RETIREMENT_PROJECTIONS = {
  current_savings: 395000, // 401k + IRA combined
  monthly_contribution: 2375, // Employee + employer
  years_to_retirement: 27,
  projected_balance_conservative: 1850000,
  projected_balance_moderate: 2400000,
  projected_balance_aggressive: 3100000,
  
  retirement_readiness: {
    on_track: true,
    confidence_level: 85,
    monthly_retirement_income: 13000,
    years_covered: 30,
    social_security_estimate: 3500,
  }
};

export const DEMO_TAX_OPTIMIZATION = {
  current_withholding: {
    federal: 1650,
    fica: 765,
    state: 0,
    total: 2415,
  },
  
  optimization_opportunities: [
    {
      strategy: 'Max out 401k',
      annual_tax_savings: 3500,
      implementation: 'Increase contribution to $23,000 annual limit',
    },
    {
      strategy: 'Backdoor Roth IRA',
      annual_tax_savings: 0,
      implementation: 'Convert traditional IRA to Roth for tax-free growth',
    },
    {
      strategy: 'HSA Maximum',
      annual_tax_savings: 850,
      implementation: 'Increase HSA to family maximum of $8,050',
    },
  ],
  
  effective_tax_rate: 18.5,
  marginal_tax_rate: 24,
  estimated_refund: 2800,
};