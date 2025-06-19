'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface Address {
  street?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
}

export interface FamilyMember {
  id: string;
  user_id: string;
  first_name: string;
  last_name?: string;
  relationship: 'SPOUSE' | 'CHILD' | 'PARENT' | 'SIBLING' | 'OTHER';
  date_of_birth?: string;
  gender?: string;
  email?: string;
  phone?: string;
  is_dependent: boolean;
  is_beneficiary: boolean;
  photo_url?: string;
  occupation?: string;
  medical_conditions: string[];
  emergency_contact: boolean;
  address?: Address;
  notes?: string;
  created_at: string;
  updated_at: string;
  documents_count?: number;
}

export function useFamilyMembers() {
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const fetchFamilyMembers = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/v1/family/members');
      
      if (!response.ok) {
        throw new Error('Failed to fetch family members');
      }

      const data = await response.json();
      setFamilyMembers(data.familyMembers || []);
    } catch (err) {
      console.error('Error fetching family members:', err);
      setError(err instanceof Error ? err.message : 'Failed to load family members');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addFamilyMember = useCallback(async (memberData: Partial<FamilyMember>) => {
    try {
      const response = await fetch('/api/v1/family/members', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(memberData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to add family member');
      }

      const newMember = await response.json();
      setFamilyMembers(prev => [newMember, ...prev]);
      return newMember;
    } catch (err) {
      console.error('Error adding family member:', err);
      throw err;
    }
  }, []);

  const updateFamilyMember = useCallback(async (id: string, updates: Partial<FamilyMember>) => {
    try {
      const response = await fetch(`/api/v1/family/members/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update family member');
      }

      const updatedMember = await response.json();
      setFamilyMembers(prev => 
        prev.map(member => member.id === id ? updatedMember : member)
      );
      return updatedMember;
    } catch (err) {
      console.error('Error updating family member:', err);
      throw err;
    }
  }, []);

  const deleteFamilyMember = useCallback(async (id: string) => {
    try {
      const response = await fetch(`/api/v1/family/members/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete family member');
      }

      setFamilyMembers(prev => prev.filter(member => member.id !== id));
    } catch (err) {
      console.error('Error deleting family member:', err);
      throw err;
    }
  }, []);

  const getFamilyMemberById = useCallback((id: string) => {
    return familyMembers.find(member => member.id === id);
  }, [familyMembers]);

  useEffect(() => {
    fetchFamilyMembers();
  }, [fetchFamilyMembers]);

  return {
    familyMembers,
    isLoading,
    error,
    refetch: fetchFamilyMembers,
    addFamilyMember,
    updateFamilyMember,
    deleteFamilyMember,
    getFamilyMemberById,
  };
}