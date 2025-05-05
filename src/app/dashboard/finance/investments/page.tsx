// FILE: src/app/dashboard/finance/investment/page.tsx

import { Suspense } from "react";
import { InvestmentPortfolioAnalysis } from "@/components/domain/finance/investment/InvestmentPortfolioAnalysis";
import { PortfolioPerformance } from "@/components/domain/finance/investment/PortfolioPerformance";
import { AssetAllocation } from "@/components/domain/finance/investment/AssetAllocation";
import { InvestmentCalculator } from "@/components/domain/finance/investment/InvestmentCalculator";
import { PortfolioRiskAnalysis } from "@/components/domain/finance/investment/PortfolioRiskAnalysis";
import { InvestmentInsights } from "@/components/domain/finance/investment/InvestmentInsights";
import { LoadingSpinner } from "@/components/ui/loaders/LoadingSpinner";

export default function InvestmentPage() {
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Investment Dashboard</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="p-6 bg-white rounded-lg shadow dark:bg-slate-800">
          <h2 className="text-xl font-semibold mb-4">Portfolio Value</h2>
          <p className="text-3xl font-bold">$427,850.32</p>
          <div className="flex items-center mt-2">
            <span className="text-green-500 text-sm font-medium">+$2,134.15 (0.5%)</span>
            <span className="text-slate-500 text-sm ml-2">Today</span>
          </div>
        </div>
        
        <div className="p-6 bg-white rounded-lg shadow dark:bg-slate-800">
          <h2 className="text-xl font-semibold mb-4">YTD Return</h2>
          <p className="text-3xl font-bold">8.24%</p>
          <div className="flex items-center mt-2">
            <span className="text-green-500 text-sm font-medium">+$32,450.12</span>
            <span className="text-slate-500 text-sm ml-2">Since Jan 1</span>
          </div>
        </div>
        
        <div className="p-6 bg-white rounded-lg shadow dark:bg-slate-800">
          <h2 className="text-xl font-semibold mb-4">Risk Profile</h2>
          <p className="text-3xl font-bold">Moderate</p>
          <div className="flex items-center mt-2">
            <span className="text-yellow-500 text-sm font-medium">Beta: 0.85</span>
            <span className="text-slate-500 text-sm ml-2">vs. S&P 500</span>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Suspense fallback={<LoadingSpinner />}>
          <PortfolioPerformance />
        </Suspense>
        
        <Suspense fallback={<LoadingSpinner />}>
          <AssetAllocation />
        </Suspense>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Suspense fallback={<LoadingSpinner />}>
          <PortfolioRiskAnalysis />
        </Suspense>
        
        <Suspense fallback={<LoadingSpinner />}>
          <InvestmentInsights />
        </Suspense>
      </div>
      
      <div className="mb-8">
        <Suspense fallback={<LoadingSpinner />}>
          <InvestmentPortfolioAnalysis />
        </Suspense>
      </div>
      
      <div>
        <Suspense fallback={<LoadingSpinner />}>
          <InvestmentCalculator />
        </Suspense>
      </div>
    </div>
  );
}