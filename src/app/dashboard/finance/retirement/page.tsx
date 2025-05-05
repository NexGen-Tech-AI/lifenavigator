// FILE: src/app/dashboard/finance/retirement/page.tsx

import { Suspense } from "react";
import { RetirementPlanner } from "@/components/domain/finance/retirement/RetirementPlanner";
import { RetirementAccounts } from "@/components/domain/finance/retirement/RetirementAccounts";
import { LoadingSpinner } from "@/components/ui/loaders/LoadingSpinner";

export default function RetirementPage() {
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Retirement Planning</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Suspense fallback={<LoadingSpinner />}>
          <RetirementAccounts />
        </Suspense>
        
        <div className="space-y-6">
          <div className="p-6 bg-white rounded-lg shadow dark:bg-slate-800">
            <h2 className="text-xl font-semibold mb-4">Retirement Progress</h2>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Current savings: $285,000</span>
              <span className="text-sm font-medium">Goal: $1,200,000</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2.5 dark:bg-slate-700">
              <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: "24%" }} />
            </div>
            <p className="text-sm text-slate-500 mt-2">You're 24% of the way to your retirement goal</p>
          </div>
        </div>
      </div>
      
      <Suspense fallback={<LoadingSpinner />}>
        <RetirementPlanner />
      </Suspense>
    </div>
  );
}