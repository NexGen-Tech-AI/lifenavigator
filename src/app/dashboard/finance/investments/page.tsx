// FILE: src/app/dashboard/finance/investment/page.tsx

import { Suspense } from "react";
import { InvestmentPortfolio } from "@/components/domain/finance/investment/InvestmentPortfolio";
import { InvestmentPerformance } from "@/components/domain/finance/investment/InvestmentPerformance";
import { InvestmentAllocations } from "@/components/domain/finance/investment/InvestmentAllocations";
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
          <h2 className="text-xl font-semibold mb-4">Total Positions</h2>
          <p className="text-3xl font-bold">42</p>
          <div className="flex items-center mt-2">
            <span className="text-slate-500 text-sm">Across 5 accounts</span>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Suspense fallback={<LoadingSpinner />}>
          <InvestmentPerformance />
        </Suspense>
        
        <Suspense fallback={<LoadingSpinner />}>
          <InvestmentAllocations />
        </Suspense>
      </div>
      
      <Suspense fallback={<LoadingSpinner />}>
        <InvestmentPortfolio />
      </Suspense>
    </div>
  );
}