'use client';

import React from 'react';
import { LifeDecisionEngine } from './LifeDecisionEngine';
import { ErrorBoundary } from '../ErrorBoundary';

export function FinancialSimulator() {
  return (
    <ErrorBoundary>
      <LifeDecisionEngine />
    </ErrorBoundary>
  );
}