// FILE: src/app/dashboard/finance/layout.tsx

import { ReactNode } from "react";
import { FinanceSidebar } from "@/components/domain/finance/FinanceSidebar";

interface FinanceLayoutProps {
  children: ReactNode;
}

export default function FinanceLayout({ children }: FinanceLayoutProps) {
  return (
    <div className="flex h-full">
      {/* Finance-specific sidebar */}
      <FinanceSidebar />
      
      {/* Main content area */}
      <div className="flex-1 overflow-auto p-4">
        {children}
      </div>
    </div>
  );
}