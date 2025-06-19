'use client';

import { useState, useEffect, useCallback } from 'react';
import { FinancialHealthScore } from '@/lib/services/financialHealthService';

interface UseFinancialHealthReturn {
  score: FinancialHealthScore | null;
  history: any[];
  isLoading: boolean;
  error: string | null;
  lastCalculated: string | null;
  refreshScore: () => Promise<void>;
}

export function useFinancialHealth(): UseFinancialHealthReturn {
  const [score, setScore] = useState<FinancialHealthScore | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastCalculated, setLastCalculated] = useState<string | null>(null);

  const fetchHealthScore = useCallback(async (forceRefresh = false) => {
    try {
      setIsLoading(true);
      setError(null);

      const url = forceRefresh 
        ? '/api/v1/finance/health-score?recalculate=true'
        : '/api/v1/finance/health-score';

      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Failed to fetch financial health score');
      }

      const data = await response.json();
      setScore(data.score);
      setHistory(data.history || []);
      setLastCalculated(data.lastCalculated);
    } catch (err) {
      console.error('Error fetching financial health score:', err);
      setError(err instanceof Error ? err.message : 'Failed to load financial health score');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refreshScore = useCallback(async () => {
    await fetchHealthScore(true);
  }, [fetchHealthScore]);

  useEffect(() => {
    fetchHealthScore();
  }, [fetchHealthScore]);

  return {
    score,
    history,
    isLoading,
    error,
    lastCalculated,
    refreshScore
  };
}