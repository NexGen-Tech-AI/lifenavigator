"use client";

import { Suspense } from 'react';
import ComingSoon from '../../../../placeholders/ComingSoon';

export default function InvestmentCalculatorPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ComingSoon />
    </Suspense>
  );
}