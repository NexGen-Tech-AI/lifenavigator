'use client';

import React from 'react';
import { FinancialSimulator } from '@/components/finance/FinancialSimulator';
import Link from 'next/link';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

export default function SimulatorPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <Link
          href="/dashboard/finance/overview"
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Back to Overview
        </Link>
      </div>

      <FinancialSimulator />
    </div>
  );
}