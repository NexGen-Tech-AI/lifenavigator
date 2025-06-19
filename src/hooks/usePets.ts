'use client';

import { useState, useEffect, useCallback } from 'react';

interface Medication {
  name: string;
  dosage: string;
  frequency: string;
}

export interface Pet {
  id: string;
  user_id: string;
  name: string;
  species: 'DOG' | 'CAT' | 'BIRD' | 'FISH' | 'RABBIT' | 'HAMSTER' | 'GUINEA_PIG' | 'REPTILE' | 'HORSE' | 'OTHER';
  breed?: string;
  color?: string;
  date_of_birth?: string;
  age_years?: number;
  weight_lbs?: number;
  gender?: 'MALE' | 'FEMALE' | 'UNKNOWN';
  is_neutered: boolean;
  microchip_id?: string;
  license_number?: string;
  last_vet_visit?: string;
  next_vet_visit?: string;
  vaccination_status: 'UP_TO_DATE' | 'DUE_SOON' | 'OVERDUE' | 'UNKNOWN';
  primary_vet_name?: string;
  primary_vet_phone?: string;
  dietary_restrictions: string[];
  current_medications: Medication[];
  allergies: string[];
  has_insurance: boolean;
  insurance_provider?: string;
  insurance_policy_number?: string;
  status: 'ACTIVE' | 'LOST' | 'DECEASED' | 'REHOMED';
  notes?: string;
  created_at: string;
  updated_at: string;
  health_records_count?: number;
  documents_count?: number;
  recent_health_records?: any[];
}

interface UpcomingAppointment {
  pet_id: string;
  pet_name: string;
  appointment_date: string;
  days_until: number;
  appointment_type: string;
}

export function usePets() {
  const [pets, setPets] = useState<Pet[]>([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState<UpcomingAppointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPets = useCallback(async (status?: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (status) params.append('status', status);

      const response = await fetch(`/api/v1/pets?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch pets');
      }

      const data = await response.json();
      setPets(data.pets || []);
      setUpcomingAppointments(data.upcomingAppointments || []);
    } catch (err) {
      console.error('Error fetching pets:', err);
      setError(err instanceof Error ? err.message : 'Failed to load pets');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addPet = useCallback(async (petData: Partial<Pet>) => {
    try {
      const response = await fetch('/api/v1/pets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(petData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to add pet');
      }

      const newPet = await response.json();
      setPets(prev => [newPet, ...prev]);
      
      // Refetch to get updated appointments
      await fetchPets();
      
      return newPet;
    } catch (err) {
      console.error('Error adding pet:', err);
      throw err;
    }
  }, [fetchPets]);

  const updatePet = useCallback(async (id: string, updates: Partial<Pet>) => {
    try {
      const response = await fetch(`/api/v1/pets/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update pet');
      }

      const updatedPet = await response.json();
      setPets(prev => 
        prev.map(pet => pet.id === id ? updatedPet : pet)
      );
      
      // Refetch to get updated appointments
      await fetchPets();
      
      return updatedPet;
    } catch (err) {
      console.error('Error updating pet:', err);
      throw err;
    }
  }, [fetchPets]);

  const deletePet = useCallback(async (id: string) => {
    try {
      const response = await fetch(`/api/v1/pets/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete pet');
      }

      setPets(prev => prev.filter(pet => pet.id !== id));
      
      // Refetch to get updated appointments
      await fetchPets();
    } catch (err) {
      console.error('Error deleting pet:', err);
      throw err;
    }
  }, [fetchPets]);

  const getPetById = useCallback(async (id: string) => {
    try {
      const response = await fetch(`/api/v1/pets/${id}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch pet details');
      }

      const petDetails = await response.json();
      return petDetails;
    } catch (err) {
      console.error('Error fetching pet details:', err);
      throw err;
    }
  }, []);

  const calculateDaysUntilVet = useCallback((nextVisitDate: string) => {
    const today = new Date();
    const visitDate = new Date(nextVisitDate);
    const diffTime = visitDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }, []);

  useEffect(() => {
    fetchPets();
  }, [fetchPets]);

  return {
    pets,
    upcomingAppointments,
    isLoading,
    error,
    refetch: fetchPets,
    addPet,
    updatePet,
    deletePet,
    getPetById,
    calculateDaysUntilVet,
  };
}