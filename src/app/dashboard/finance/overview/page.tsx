// FILE: src/app/dashboard/finance/overview/page.tsx

import { Suspense } from "react";
import { AccountsSummary } from "@/components/domain/finance/overview/AccountsSummary";
import { SpendingTrends } from "@/components/domain/finance/overview/SpendingTrends";
import { UpcomingBills } from "@/components/domain/finance/overview/UpcomingBills";
import { FinancialInsights } from "@/components/domain/finance/overview/FinancialInsights";
import { CashFlow } from "@/components/domain/finance/overview/CashFlow";
import { LoadingSpinner } from "@/components/ui/loaders/LoadingSpinner";

export default function OverviewPage() {
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Financial Overview</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
        <div className="p-6 bg-white rounded-lg shadow dark:bg-slate-800">
          <h2 className="text-lg font-semibold mb-2">Total Assets</h2>
          <p className="text-3xl font-bold">$732,410.55</p>
        </div>
        
        <div className="p-6 bg-white rounded-lg shadow dark:bg-slate-800">
          <h2 className="text-lg font-semibold mb-2">Total Liabilities</h2>
          <p className="text-3xl font-bold">$245,320.18</p>
        </div>
        
        <div className="p-6 bg-white rounded-lg shadow dark:bg-slate-800">
          <h2 className="text-lg font-semibold mb-2">Net Worth</h2>
          <p className="text-3xl font-bold">$487,090.37</p>
        </div>
        
        <div className="p-6 bg-white rounded-lg shadow dark:bg-slate-800">
          <h2 className="text-lg font-semibold mb-2">Monthly Cash Flow</h2>
          <p className="text-3xl font-bold">+$2,834.12</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Suspense fallback={<LoadingSpinner />}>
          <AccountsSummary />
        </Suspense>
        
        <Suspense fallback={<LoadingSpinner />}>
          <SpendingTrends />
        </Suspense>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Suspense fallback={<LoadingSpinner />}>
          <UpcomingBills />
        </Suspense>
        
        <Suspense fallback={<LoadingSpinner />}>
          <CashFlow />
        </Suspense>
        
        <Suspense fallback={<LoadingSpinner />}>
          <FinancialInsights />
        </Suspense>
      </div>
    </div>
  );
}