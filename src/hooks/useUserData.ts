'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from '@/hooks/useAuth';
import { apiClient } from '@/lib/api/client';

// Types for user data
interface UserGoals {
  financialGoals?: any;
  careerGoals?: any;
  educationGoals?: any;
  healthGoals?: any;
}

interface RiskProfile {
  riskTheta: number;
  financialRiskTolerance?: number;
  careerRiskTolerance?: number;
  healthRiskTolerance?: number;
  educationRiskTolerance?: number;
}

interface UserData {
  id: string;
  name: string;
  email: string;
  setupCompleted: boolean;
  goals?: UserGoals;
  riskProfile?: RiskProfile;
  // Add other user-specific data as needed
}

export function useUserData() {
  const { data: session, status } = useSession();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const retryCount = useRef(0);

  useEffect(() => {
    async function fetchUserData() {
      if (status !== 'authenticated' || !session?.user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        // Fetch user data from the API
        const data = await apiClient.get<UserData>('/user/profile');
        setUserData(data);
        retryCount.current = 0; // Reset retry count on success
      } catch (err: any) {
        console.error('Error fetching user data:', err);
        
        // Handle specific error cases
        if (err.status === 404) {
          // Don't retry on 404 - endpoint doesn't exist
          console.warn('User profile endpoint not found, using default data');
          // Use mock data instead
          const mockUserData: UserData = {
            id: session.user.id || '',
            name: (session.user as any).user_metadata?.name || session.user.email?.split('@')[0] || 'User',
            email: session.user.email || '',
            setupCompleted: true,
            goals: {
              financialGoals: {},
              careerGoals: {},
              educationGoals: {},
              healthGoals: {}
            },
            riskProfile: {
              riskTheta: 0.5,
              financialRiskTolerance: 0.6,
              careerRiskTolerance: 0.5,
              healthRiskTolerance: 0.4,
              educationRiskTolerance: 0.7
            }
          };
          setUserData(mockUserData);
          setError(null);
          return;
        }
        
        setError(err instanceof Error ? err : new Error('Failed to fetch user data'));
      } finally {
        setLoading(false);
      }
    }

    fetchUserData();
  }, [session, status]);

  return { userData, loading, error };
}

// Function to fetch domain-specific data
export function useDomainData<T>(domain: 'financial' | 'career' | 'education' | 'health', endpoint: string) {
  const { data: session, status } = useSession();
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchDomainData() {
      if (status !== 'authenticated' || !session?.user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        // Fetch domain-specific data from the API
        const responseData = await apiClient.get<T>(`/${domain}${endpoint}`);
        setData(responseData);
      } catch (err) {
        console.error(`Error fetching ${domain} data:`, err);
        setError(err instanceof Error ? err : new Error(`Failed to fetch ${domain} data`));
      } finally {
        setLoading(false);
      }
    }

    fetchDomainData();
  }, [session, status, domain, endpoint]);

  return { data, loading, error };
}