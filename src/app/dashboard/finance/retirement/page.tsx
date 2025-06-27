'use client';

import React from 'react';
import dynamic from 'next/dynamic';

const AdvancedRetirementCalculator = dynamic(
  () => import('@/components/domain/finance/retirement/AdvancedRetirementCalculator'),
  { ssr: false }
);

export default function RetirementPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <AdvancedRetirementCalculator />
    </div>
  );
}