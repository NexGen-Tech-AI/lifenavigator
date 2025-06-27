'use client';

import dynamic from 'next/dynamic';

// Dynamic import to avoid SSR issues with charts
const AdvancedRetirementCalculator = dynamic(
  () => import('@/components/domain/finance/retirement/AdvancedRetirementCalculator'),
  { 
    ssr: false,
    loading: () => (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }
);

export default function RetirementCalculatorPage() {
  return <AdvancedRetirementCalculator />;
}