#!/usr/bin/env node

/**
 * Test script to verify all calculation endpoints and services
 */

const { createClient } = require('@supabase/supabase-js');

// Test data
const testCases = {
  taxCalculation: {
    income: 100000,
    filingStatus: 'single',
    deductions: 15000,
    credits: 2000
  },
  retirementCalculation: {
    current_age: 30,
    retirement_age: 65,
    current_savings: 50000,
    monthly_contribution: 1000,
    current_annual_income: 100000
  },
  investmentGrowth: {
    initialAmount: 10000,
    monthlyContribution: 500,
    annualReturn: 0.07,
    years: 30,
    inflationRate: 0.025
  },
  financialSimulation: {
    scenario_type: 'job_loss',
    parameters: {
      months_without_income: 6,
      new_income_percentage: 0.8,
      emergency_fund_months: 3
    },
    initial_state: {
      income: 100000,
      expenses: 60000,
      assets: {
        checking: 10000,
        savings: 50000,
        investments: 100000
      },
      liabilities: {
        mortgage: 200000,
        auto_loan: 20000
      }
    }
  }
};

// Test endpoints
const endpoints = [
  {
    name: 'Tax Service (Direct)',
    test: async () => {
      const { TaxService } = require('../src/lib/services/taxService.ts');
      const result = TaxService.calculateTaxWithholding({
        annualIncome: testCases.taxCalculation.income,
        filingStatus: testCases.taxCalculation.filingStatus,
        payFrequency: 'BIWEEKLY',
        federalAllowances: 1,
        additionalWithholding: 0,
        preTaxDeductions: 0,
        dependents: 0
      });
      return { success: true, result };
    }
  },
  {
    name: 'Financial Simulator Service (Direct)',
    test: async () => {
      const { FinancialSimulatorService } = require('../src/lib/services/financialSimulatorService.ts');
      const result = await FinancialSimulatorService.runSimulation(testCases.financialSimulation);
      return { success: true, result: { months: result.months.length, final_net_worth: result.months[result.months.length - 1].net_worth } };
    }
  },
  {
    name: 'Financial Health Service (Direct)',
    test: async () => {
      const { FinancialHealthService } = require('../src/lib/services/financialHealthService.ts');
      const result = FinancialHealthService.calculateHealthScore({
        income: 100000,
        expenses: 60000,
        assets: { cash: 60000, investments: 100000 },
        liabilities: { mortgage: 200000, auto: 20000 },
        credit_score: 750,
        retirement_contributions_rate: 0.15
      });
      return { success: true, result };
    }
  },
  {
    name: 'API: Financial Simulator',
    test: async () => {
      const response = await fetch('http://localhost:3000/api/v1/finance/simulator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testCases.financialSimulation)
      });
      const data = await response.json();
      return { success: response.ok, result: data };
    }
  },
  {
    name: 'API: Tax Summary',
    test: async () => {
      const response = await fetch('http://localhost:3000/api/v1/tax/summary');
      const data = await response.json();
      return { success: response.ok, result: data };
    }
  },
  {
    name: 'API: Investment Growth Calculator',
    test: async () => {
      const response = await fetch('http://localhost:3000/api/financial/calculator/investment-growth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testCases.investmentGrowth)
      });
      const data = await response.json();
      return { success: response.ok, result: data, error: response.ok ? null : data };
    }
  },
  {
    name: 'API: Retirement Calculator',
    test: async () => {
      const response = await fetch('http://localhost:3000/api/financial/retirement-calculator/quick-calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testCases.retirementCalculation)
      });
      const data = await response.json();
      return { success: response.ok, result: data, error: response.ok ? null : data };
    }
  }
];

// Color helpers
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

// Run tests
async function runTests() {
  console.log(`${colors.blue}🧪 Testing LifeNavigator Calculation Endpoints${colors.reset}\n`);
  
  const results = [];
  
  for (const endpoint of endpoints) {
    process.stdout.write(`Testing ${endpoint.name}... `);
    
    try {
      const result = await endpoint.test();
      if (result.success) {
        console.log(`${colors.green}✓ PASS${colors.reset}`);
        if (result.result) {
          console.log(`  Result: ${JSON.stringify(result.result, null, 2).split('\n').slice(0, 5).join('\n')}`);
        }
      } else {
        console.log(`${colors.red}✗ FAIL${colors.reset}`);
        if (result.error) {
          console.log(`  Error: ${JSON.stringify(result.error)}`);
        }
      }
      results.push({ ...endpoint, ...result });
    } catch (error) {
      console.log(`${colors.red}✗ ERROR${colors.reset}`);
      console.log(`  Error: ${error.message}`);
      results.push({ ...endpoint, success: false, error: error.message });
    }
  }
  
  // Summary
  console.log(`\n${colors.blue}📊 Test Summary${colors.reset}`);
  const passed = results.filter(r => r.success).length;
  const failed = results.length - passed;
  
  console.log(`  ${colors.green}Passed: ${passed}${colors.reset}`);
  console.log(`  ${colors.red}Failed: ${failed}${colors.reset}`);
  console.log(`  Total: ${results.length}`);
  
  // List missing endpoints
  console.log(`\n${colors.yellow}⚠️  Missing API Endpoints:${colors.reset}`);
  const missingEndpoints = results.filter(r => !r.success && r.name.startsWith('API:'));
  missingEndpoints.forEach(endpoint => {
    console.log(`  - ${endpoint.name}`);
  });
  
  return results;
}

// Execute if run directly
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { runTests };