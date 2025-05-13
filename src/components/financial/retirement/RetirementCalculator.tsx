import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/cards/Card';
import { Button } from '@/components/ui/buttons/Button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/forms/Select';
import { Input } from '@/components/ui/forms/Input';
import { SliderInput } from '@/components/ui/forms/SliderInput';
import { LoadingSpinner } from '@/components/ui/loaders/LoadingSpinner';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
  BarChart,
  Bar,
  ReferenceLine,
} from 'recharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/components/ui/toaster';
import { useRetirementCalculator } from '@/hooks/useRetirementCalculator';

// Enum types from backend 
enum ContributionFrequency {
  WEEKLY = "weekly",
  BI_WEEKLY = "bi_weekly",
  MONTHLY = "monthly",
  QUARTERLY = "quarterly",
  ANNUALLY = "annually"
}

enum IncreaseType {
  FLAT = "flat",
  PERCENTAGE = "percentage",
  NONE = "none"
}

// Interface for contribution strategy
interface ContributionStrategy {
  name: string;
  initialAmount: number;
  frequency: ContributionFrequency;
  increaseType: IncreaseType;
  annualIncreaseAmount: number;
  annualIncreasePercentage: number;
  maxContributionLimit?: number;
  startAge?: number;
  endAge?: number;
}

// Interface for calculator configuration
interface CalculatorConfig {
  currentAge: number;
  retirementAge: number;
  lifeExpectancy: number;
  currentSavings: number;
  currentAnnualIncome: number;
  expectedIncomeGrowthRate: number;
  expectedInflationRate: number;
  desiredIncomeReplacementRate: number;
  safeWithdrawalRate: number;
  socialSecurityBenefit?: number;
  socialSecurityStartAge?: number;
  pensionBenefit?: number;
  pensionStartAge?: number;
}

// Main component
const RetirementCalculator: React.FC = () => {
  // State for calculator configuration
  const [config, setConfig] = useState<CalculatorConfig>({
    currentAge: 35,
    retirementAge: 65,
    lifeExpectancy: 90,
    currentSavings: 100000,
    currentAnnualIncome: 75000,
    expectedIncomeGrowthRate: 2.0,
    expectedInflationRate: 2.5,
    desiredIncomeReplacementRate: 80.0,
    safeWithdrawalRate: 4.0,
    socialSecurityStartAge: 67,
    pensionStartAge: 65,
  });

  // State for contribution strategies
  const [strategies, setStrategies] = useState<ContributionStrategy[]>([
    {
      name: "Primary Retirement",
      initialAmount: 500,
      frequency: ContributionFrequency.MONTHLY,
      increaseType: IncreaseType.PERCENTAGE,
      annualIncreaseAmount: 0,
      annualIncreasePercentage: 2.0,
    }
  ]);

  // State for active tab
  const [activeTab, setActiveTab] = useState("input");

  // Use the retirement calculator hook
  const { 
    calculateRetirement, 
    isLoading, 
    results, 
    calculateQuickRetirement
  } = useRetirementCalculator();

  // Function to handle config changes
  const handleConfigChange = (field: keyof CalculatorConfig, value: any) => {
    setConfig(prevConfig => ({
      ...prevConfig,
      [field]: value
    }));
  };

  // Function to handle strategy changes
  const handleStrategyChange = (index: number, field: keyof ContributionStrategy, value: any) => {
    setStrategies(prevStrategies => {
      const newStrategies = [...prevStrategies];
      newStrategies[index] = {
        ...newStrategies[index],
        [field]: value
      };
      return newStrategies;
    });
  };

  // Function to add a new strategy
  const addStrategy = () => {
    setStrategies(prevStrategies => [
      ...prevStrategies,
      {
        name: `Strategy ${prevStrategies.length + 1}`,
        initialAmount: 200,
        frequency: ContributionFrequency.MONTHLY,
        increaseType: IncreaseType.NONE,
        annualIncreaseAmount: 0,
        annualIncreasePercentage: 0,
      }
    ]);
  };

  // Function to remove a strategy
  const removeStrategy = (index: number) => {
    if (strategies.length > 1) {
      setStrategies(prevStrategies => prevStrategies.filter((_, i) => i !== index));
    } else {
      toast({
        title: "Error",
        description: "You must have at least one contribution strategy",
        variant: "destructive"
      });
    }
  };

  // Function to handle quick calculation
  const handleQuickCalculation = () => {
    calculateQuickRetirement({
      current_age: config.currentAge,
      retirement_age: config.retirementAge,
      current_savings: config.currentSavings,
      monthly_contribution: strategies[0].initialAmount,
      current_annual_income: config.currentAnnualIncome
    });
    setActiveTab("results");
  };

  // Function to handle detailed calculation
  const handleDetailedCalculation = () => {
    // Transform data to match API expectations
    const formattedStrategies = strategies.map(strategy => ({
      name: strategy.name,
      initial_amount: strategy.initialAmount,
      frequency: strategy.frequency,
      increase_type: strategy.increaseType,
      annual_increase_amount: strategy.annualIncreaseAmount,
      annual_increase_percentage: strategy.annualIncreasePercentage,
      max_contribution_limit: strategy.maxContributionLimit,
      start_age: strategy.startAge,
      end_age: strategy.endAge,
    }));

    calculateRetirement({
      current_age: config.currentAge,
      retirement_age: config.retirementAge,
      life_expectancy: config.lifeExpectancy,
      current_savings: config.currentSavings,
      current_annual_income: config.currentAnnualIncome,
      expected_income_growth_rate: config.expectedIncomeGrowthRate,
      expected_inflation_rate: config.expectedInflationRate,
      desired_income_replacement_rate: config.desiredIncomeReplacementRate,
      safe_withdrawal_rate: config.safeWithdrawalRate,
      social_security_benefit: config.socialSecurityBenefit,
      social_security_start_age: config.socialSecurityStartAge,
      pension_benefit: config.pensionBenefit,
      pension_start_age: config.pensionStartAge,
      contribution_strategies: formattedStrategies,
      include_monte_carlo: true,
    });
    setActiveTab("results");
  };

  // Format currency for display
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Format percent for display
  const formatPercent = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Retirement Calculator</h1>
      
      {/* Tabs for Input and Results */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full mb-6">
          <TabsTrigger value="input" className="flex-1">Input Parameters</TabsTrigger>
          <TabsTrigger value="results" className="flex-1" disabled={!results}>Results</TabsTrigger>
        </TabsList>
        
        {/* Input Tab */}
        <TabsContent value="input" className="space-y-8">
          {/* Basic Parameters */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Parameters</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="font-medium">Current Age</label>
                <Input 
                  type="number"
                  value={config.currentAge}
                  onChange={(e) => handleConfigChange('currentAge', parseInt(e.target.value))}
                  min={18}
                  max={85}
                />
              </div>
              
              <div className="space-y-2">
                <label className="font-medium">Retirement Age</label>
                <Input 
                  type="number"
                  value={config.retirementAge}
                  onChange={(e) => handleConfigChange('retirementAge', parseInt(e.target.value))}
                  min={config.currentAge + 1}
                  max={90}
                />
              </div>
              
              <div className="space-y-2">
                <label className="font-medium">Life Expectancy</label>
                <Input 
                  type="number"
                  value={config.lifeExpectancy}
                  onChange={(e) => handleConfigChange('lifeExpectancy', parseInt(e.target.value))}
                  min={config.retirementAge + 1}
                  max={110}
                />
              </div>
              
              <div className="space-y-2">
                <label className="font-medium">Current Retirement Savings</label>
                <Input 
                  type="number"
                  value={config.currentSavings}
                  onChange={(e) => handleConfigChange('currentSavings', parseFloat(e.target.value))}
                  min={0}
                  step={1000}
                />
              </div>
              
              <div className="space-y-2">
                <label className="font-medium">Current Annual Income</label>
                <Input 
                  type="number"
                  value={config.currentAnnualIncome}
                  onChange={(e) => handleConfigChange('currentAnnualIncome', parseFloat(e.target.value))}
                  min={0}
                  step={1000}
                />
              </div>
              
              <div className="space-y-2">
                <label className="font-medium">Desired Income Replacement (%)</label>
                <SliderInput 
                  value={config.desiredIncomeReplacementRate}
                  onChange={(value) => handleConfigChange('desiredIncomeReplacementRate', value)}
                  min={30}
                  max={100}
                  step={5}
                />
              </div>
            </CardContent>
          </Card>
          
          {/* Contribution Strategies */}
          <Card>
            <CardHeader className="flex flex-row justify-between items-center">
              <CardTitle>Contribution Strategies</CardTitle>
              <Button onClick={addStrategy} variant="outline">Add Strategy</Button>
            </CardHeader>
            <CardContent className="space-y-8">
              {strategies.map((strategy, index) => (
                <div key={index} className="border p-4 rounded-lg space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold text-lg">{strategy.name}</h3>
                    {strategies.length > 1 && (
                      <Button variant="ghost" size="sm" onClick={() => removeStrategy(index)}>
                        Remove
                      </Button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="font-medium">Name</label>
                      <Input 
                        value={strategy.name}
                        onChange={(e) => handleStrategyChange(index, 'name', e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="font-medium">Initial Amount</label>
                      <Input 
                        type="number"
                        value={strategy.initialAmount}
                        onChange={(e) => handleStrategyChange(index, 'initialAmount', parseFloat(e.target.value))}
                        min={0}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="font-medium">Frequency</label>
                      <Select 
                        value={strategy.frequency}
                        onValueChange={(value) => handleStrategyChange(index, 'frequency', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select frequency" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={ContributionFrequency.WEEKLY}>Weekly</SelectItem>
                          <SelectItem value={ContributionFrequency.BI_WEEKLY}>Bi-Weekly</SelectItem>
                          <SelectItem value={ContributionFrequency.MONTHLY}>Monthly</SelectItem>
                          <SelectItem value={ContributionFrequency.QUARTERLY}>Quarterly</SelectItem>
                          <SelectItem value={ContributionFrequency.ANNUALLY}>Annually</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="font-medium">Increase Type</label>
                      <Select 
                        value={strategy.increaseType}
                        onValueChange={(value) => handleStrategyChange(index, 'increaseType', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select increase type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={IncreaseType.NONE}>No Increase</SelectItem>
                          <SelectItem value={IncreaseType.FLAT}>Flat Amount</SelectItem>
                          <SelectItem value={IncreaseType.PERCENTAGE}>Percentage</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {strategy.increaseType === IncreaseType.FLAT && (
                      <div className="space-y-2">
                        <label className="font-medium">Annual Amount Increase</label>
                        <Input 
                          type="number"
                          value={strategy.annualIncreaseAmount}
                          onChange={(e) => handleStrategyChange(index, 'annualIncreaseAmount', parseFloat(e.target.value))}
                          min={0}
                        />
                      </div>
                    )}
                    
                    {strategy.increaseType === IncreaseType.PERCENTAGE && (
                      <div className="space-y-2">
                        <label className="font-medium">Annual Percentage Increase (%)</label>
                        <Input 
                          type="number"
                          value={strategy.annualIncreasePercentage}
                          onChange={(e) => handleStrategyChange(index, 'annualIncreasePercentage', parseFloat(e.target.value))}
                          min={0}
                          max={25}
                          step={0.5}
                        />
                      </div>
                    )}
                    
                    <div className="space-y-2">
                      <label className="font-medium">Max Contribution Limit (Optional)</label>
                      <Input 
                        type="number"
                        value={strategy.maxContributionLimit || ''}
                        onChange={(e) => handleStrategyChange(index, 'maxContributionLimit', e.target.value ? parseFloat(e.target.value) : undefined)}
                        min={0}
                        placeholder="No limit"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
          
          {/* Advanced Parameters */}
          <Card>
            <CardHeader>
              <CardTitle>Advanced Parameters</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="font-medium">Expected Income Growth Rate (%)</label>
                <Input 
                  type="number"
                  value={config.expectedIncomeGrowthRate}
                  onChange={(e) => handleConfigChange('expectedIncomeGrowthRate', parseFloat(e.target.value))}
                  min={0}
                  max={10}
                  step={0.1}
                />
              </div>
              
              <div className="space-y-2">
                <label className="font-medium">Expected Inflation Rate (%)</label>
                <Input 
                  type="number"
                  value={config.expectedInflationRate}
                  onChange={(e) => handleConfigChange('expectedInflationRate', parseFloat(e.target.value))}
                  min={0}
                  max={10}
                  step={0.1}
                />
              </div>
              
              <div className="space-y-2">
                <label className="font-medium">Safe Withdrawal Rate (%)</label>
                <Input 
                  type="number"
                  value={config.safeWithdrawalRate}
                  onChange={(e) => handleConfigChange('safeWithdrawalRate', parseFloat(e.target.value))}
                  min={0.5}
                  max={10}
                  step={0.1}
                />
              </div>
              
              <div className="space-y-2">
                <label className="font-medium">Social Security Benefit (Annual)</label>
                <Input 
                  type="number"
                  value={config.socialSecurityBenefit || ''}
                  onChange={(e) => handleConfigChange('socialSecurityBenefit', e.target.value ? parseFloat(e.target.value) : undefined)}
                  min={0}
                  placeholder="Optional"
                />
              </div>
              
              <div className="space-y-2">
                <label className="font-medium">Social Security Start Age</label>
                <Input 
                  type="number"
                  value={config.socialSecurityStartAge || ''}
                  onChange={(e) => handleConfigChange('socialSecurityStartAge', e.target.value ? parseInt(e.target.value) : undefined)}
                  min={62}
                  max={70}
                  disabled={!config.socialSecurityBenefit}
                />
              </div>
              
              <div className="space-y-2">
                <label className="font-medium">Pension Benefit (Annual)</label>
                <Input 
                  type="number"
                  value={config.pensionBenefit || ''}
                  onChange={(e) => handleConfigChange('pensionBenefit', e.target.value ? parseFloat(e.target.value) : undefined)}
                  min={0}
                  placeholder="Optional"
                />
              </div>
              
              <div className="space-y-2">
                <label className="font-medium">Pension Start Age</label>
                <Input 
                  type="number"
                  value={config.pensionStartAge || ''}
                  onChange={(e) => handleConfigChange('pensionStartAge', e.target.value ? parseInt(e.target.value) : undefined)}
                  min={55}
                  max={75}
                  disabled={!config.pensionBenefit}
                />
              </div>
            </CardContent>
          </Card>
          
          {/* Calculation Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button onClick={handleQuickCalculation} className="w-full sm:w-auto">
              Quick Calculate
            </Button>
            <Button onClick={handleDetailedCalculation} className="w-full sm:w-auto" variant="default">
              Run Detailed Calculation
            </Button>
          </div>
        </TabsContent>
        
        {/* Results Tab */}
        <TabsContent value="results" className="space-y-6">
          {isLoading ? (
            <div className="flex justify-center py-20">
              <LoadingSpinner size="lg" />
            </div>
          ) : results ? (
            <>
              {/* Summary Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Retirement Summary</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <div className="text-sm font-medium text-muted-foreground mb-1">
                      Years to Retirement
                    </div>
                    <div className="text-3xl font-bold">
                      {results.years_to_retirement}
                    </div>
                  </div>
                  
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <div className="text-sm font-medium text-muted-foreground mb-1">
                      Projected Portfolio at Retirement
                    </div>
                    <div className="text-3xl font-bold">
                      {formatCurrency(
                        results.scenario_results.Moderate?.portfolio_at_retirement || 
                        Object.values(results.scenario_results)[0].portfolio_at_retirement
                      )}
                    </div>
                  </div>
                  
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <div className="text-sm font-medium text-muted-foreground mb-1">
                      Income Replacement
                    </div>
                    <div className="text-3xl font-bold">
                      {formatPercent(
                        results.scenario_results.Moderate?.income_replacement_percentage || 
                        Object.values(results.scenario_results)[0].income_replacement_percentage
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Portfolio Growth Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Portfolio Value Over Time</CardTitle>
                </CardHeader>
                <CardContent className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={results.visualization.ages.map((age, index) => ({
                        age,
                        year: results.visualization.years[index],
                        value: results.visualization.portfolio_values[index],
                        Conservative: results.visualization.growth_by_scenario?.Conservative?.[index],
                        Moderate: results.visualization.growth_by_scenario?.Moderate?.[index],
                        Aggressive: results.visualization.growth_by_scenario?.Aggressive?.[index],
                      }))}
                      margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="age" 
                        label={{ value: 'Age', position: 'insideBottom', offset: -5 }} 
                      />
                      <YAxis 
                        tickFormatter={(value) => formatCurrency(value)}
                        width={100}
                      />
                      <Tooltip 
                        formatter={(value) => [formatCurrency(value as number), "Portfolio Value"]}
                        labelFormatter={(label) => `Age: ${label}`}
                      />
                      <Legend />
                      <ReferenceLine 
                        x={config.retirementAge} 
                        stroke="red" 
                        label={{ value: 'Retirement', position: 'top' }} 
                      />
                      
                      {/* Show different scenarios if available */}
                      {results.visualization.growth_by_scenario?.Conservative && (
                        <Area 
                          type="monotone" 
                          dataKey="Conservative" 
                          stackId="1"
                          stroke="#8884d8" 
                          fill="#8884d8" 
                          fillOpacity={0.3}
                        />
                      )}
                      {results.visualization.growth_by_scenario?.Moderate && (
                        <Area 
                          type="monotone" 
                          dataKey="Moderate" 
                          stackId="1"
                          stroke="#82ca9d" 
                          fill="#82ca9d" 
                          fillOpacity={0.3}
                        />
                      )}
                      {results.visualization.growth_by_scenario?.Aggressive && (
                        <Area 
                          type="monotone" 
                          dataKey="Aggressive" 
                          stackId="1"
                          stroke="#ffc658" 
                          fill="#ffc658" 
                          fillOpacity={0.3}
                        />
                      )}
                      
                      {/* Default if no scenarios */}
                      {!results.visualization.growth_by_scenario && (
                        <Area 
                          type="monotone" 
                          dataKey="value" 
                          stroke="#82ca9d" 
                          fill="#82ca9d" 
                          fillOpacity={0.6}
                        />
                      )}
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              
              {/* Income Replacement Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Income Replacement Over Time</CardTitle>
                </CardHeader>
                <CardContent className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={results.visualization.ages.map((age, index) => ({
                        age,
                        year: results.visualization.years[index],
                        replacement: results.visualization.income_replacement_percentages[index],
                      }))}
                      margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="age" 
                        label={{ value: 'Age', position: 'insideBottom', offset: -5 }} 
                      />
                      <YAxis 
                        tickFormatter={(value) => `${value}%`}
                      />
                      <Tooltip 
                        formatter={(value) => [`${value}%`, "Income Replacement"]}
                        labelFormatter={(label) => `Age: ${label}`}
                      />
                      <Legend />
                      <ReferenceLine 
                        x={config.retirementAge} 
                        stroke="red" 
                        label={{ value: 'Retirement', position: 'top' }} 
                      />
                      <ReferenceLine 
                        y={config.desiredIncomeReplacementRate} 
                        stroke="green" 
                        label={{ value: 'Target', position: 'right' }} 
                      />
                      <Line 
                        type="monotone" 
                        dataKey="replacement" 
                        stroke="#8884d8" 
                        activeDot={{ r: 8 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              
              {/* Contributions and Withdrawals Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Contributions and Withdrawals</CardTitle>
                </CardHeader>
                <CardContent className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={results.visualization.ages.map((age, index) => ({
                        age,
                        contribution: results.visualization.contributions[index],
                        withdrawal: results.visualization.withdrawals[index],
                      }))}
                      margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="age" 
                        label={{ value: 'Age', position: 'insideBottom', offset: -5 }} 
                      />
                      <YAxis 
                        tickFormatter={(value) => formatCurrency(value)}
                        width={100}
                      />
                      <Tooltip 
                        formatter={(value) => [formatCurrency(value as number), ""]}
                        labelFormatter={(label) => `Age: ${label}`}
                      />
                      <Legend />
                      <ReferenceLine 
                        x={config.retirementAge} 
                        stroke="red" 
                        label={{ value: 'Retirement', position: 'top' }} 
                      />
                      <Bar dataKey="contribution" fill="#82ca9d" name="Contribution" />
                      <Bar dataKey="withdrawal" fill="#ff7300" name="Withdrawal" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              
              {/* Recommendations */}
              {results.recommendations && (
                <Card>
                  <CardHeader>
                    <CardTitle>Personalized Recommendations</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {results.recommendations.map((recommendation, index) => (
                      <div 
                        key={index} 
                        className={`p-4 rounded-lg border-l-4 ${
                          recommendation.priority === 'high' 
                            ? 'border-red-500 bg-red-50 dark:bg-red-900/20' 
                            : recommendation.priority === 'medium' 
                            ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20' 
                            : 'border-green-500 bg-green-50 dark:bg-green-900/20'
                        }`}
                      >
                        <h3 className="font-semibold">{recommendation.title}</h3>
                        <p className="text-sm text-muted-foreground mt-1">{recommendation.description}</p>
                        {recommendation.action_items && (
                          <ul className="mt-2 space-y-1 list-disc pl-5">
                            {recommendation.action_items.map((item, i) => (
                              <li key={i} className="text-sm">{item}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
              
              {/* Buttons */}
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Button 
                  onClick={() => setActiveTab("input")}
                  variant="outline"
                  className="w-full sm:w-auto"
                >
                  Modify Inputs
                </Button>
                <Button 
                  onClick={handleDetailedCalculation}
                  className="w-full sm:w-auto"
                >
                  Recalculate
                </Button>
              </div>
            </>
          ) : (
            <div className="text-center py-20">
              <h3 className="text-xl font-medium">No calculation results yet</h3>
              <p className="text-muted-foreground mt-2">
                Go to the Input Parameters tab to set up your retirement calculation
              </p>
              <Button 
                onClick={() => setActiveTab("input")}
                variant="outline"
                className="mt-4"
              >
                Go to Inputs
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RetirementCalculator;