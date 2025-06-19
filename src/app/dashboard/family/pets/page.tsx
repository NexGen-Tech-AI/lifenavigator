'use client';

import React, { useState } from 'react';
import { HeartIcon, CalendarIcon, DocumentTextIcon, PlusIcon } from '@heroicons/react/24/outline';
import { usePets } from '@/hooks/usePets';

export default function PetsPage() {
  const { pets, isLoading, addPet, updatePet, deletePet, calculateDaysUntilVet } = usePets();
  const [showAddPetModal, setShowAddPetModal] = useState(false);
  const [selectedPet, setSelectedPet] = useState<any>(null);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  const getSpeciesDisplay = (species: string) => {
    const speciesMap: Record<string, string> = {
      'DOG': 'Dog',
      'CAT': 'Cat',
      'BIRD': 'Bird',
      'FISH': 'Fish',
      'RABBIT': 'Rabbit',
      'HAMSTER': 'Hamster',
      'GUINEA_PIG': 'Guinea Pig',
      'REPTILE': 'Reptile',
      'HORSE': 'Horse',
      'OTHER': 'Other'
    };
    return speciesMap[species] || species;
  };

  return (
    <div className="p-8">
      <div className="mb-8 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Pets</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage your pets&apos; health records, appointments, and important information
          </p>
        </div>
        <button
          onClick={() => setShowAddPetModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <PlusIcon className="h-5 w-5" />
          Add Pet
        </button>
      </div>

      {/* Pet Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {isLoading ? (
          <div className="col-span-full text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto"></div>
          </div>
        ) : (
          <>
            {pets.filter(pet => pet.status === 'ACTIVE').map((pet) => (
              <div
                key={pet.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => setSelectedPet(pet)}
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="h-16 w-16 rounded-full bg-gradient-to-br from-pink-400 to-pink-600 flex items-center justify-center text-white font-bold text-xl">
                      {pet.name[0]}
                    </div>
                    <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm">
                      {getSpeciesDisplay(pet.species)}
                    </span>
                  </div>
                  
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{pet.name}</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">{pet.breed || getSpeciesDisplay(pet.species)}</p>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">Age</span>
                      <span className="text-gray-900 dark:text-white font-medium">
                        {pet.age_years ? `${pet.age_years} years` : 'Unknown'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">Weight</span>
                      <span className="text-gray-900 dark:text-white font-medium">
                        {pet.weight_lbs ? `${pet.weight_lbs} lbs` : 'Unknown'}
                      </span>
                    </div>
                  </div>
                  
                  {pet.next_vet_visit && calculateDaysUntilVet(pet.next_vet_visit) <= 30 && (
                    <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                      <p className="text-sm text-yellow-800 dark:text-yellow-200">
                        Vet visit in {calculateDaysUntilVet(pet.next_vet_visit)} days
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </>
        )}

        {/* Add Pet Card */}
        <button
          onClick={() => setShowAddPetModal(true)}
          className="bg-white dark:bg-gray-800 rounded-lg shadow border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 transition-colors flex flex-col items-center justify-center p-6 min-h-[280px]"
        >
          <HeartIcon className="h-12 w-12 text-gray-400 mb-3" />
          <span className="text-gray-600 dark:text-gray-400 font-medium">Add New Pet</span>
        </button>
      </div>

      {/* Health Reminders */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Health Reminders</h2>
        <div className="space-y-3">
          {pets.filter(pet => pet.status === 'ACTIVE' && pet.next_vet_visit).map((pet) => {
            const daysUntilVet = calculateDaysUntilVet(pet.next_vet_visit!);
            if (daysUntilVet <= 60) {
              return (
                <div key={pet.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center gap-3">
                    <CalendarIcon className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="text-gray-900 dark:text-white font-medium">
                        {pet.name}&apos;s vet checkup
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Scheduled for {formatDate(pet.next_vet_visit!)}
                      </p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    daysUntilVet <= 7
                      ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      : daysUntilVet <= 30
                      ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                      : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                  }`}>
                    {daysUntilVet} days
                  </span>
                </div>
              );
            }
            return null;
          })}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Pets</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                {isLoading ? '...' : pets.filter(p => p.status === 'ACTIVE').length}
              </p>
            </div>
            <HeartIcon className="h-8 w-8 text-pink-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Upcoming Appointments</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                {isLoading ? '...' : pets.filter(pet => pet.next_vet_visit && calculateDaysUntilVet(pet.next_vet_visit) <= 60).length}
              </p>
            </div>
            <CalendarIcon className="h-8 w-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">On Medication</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                {isLoading ? '...' : pets.filter(pet => pet.current_medications && pet.current_medications.length > 0).length}
              </p>
            </div>
            <DocumentTextIcon className="h-8 w-8 text-green-500" />
          </div>
        </div>
      </div>

      {/* Add Pet Modal */}
      {showAddPetModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Add New Pet</h2>
            
            <form onSubmit={async (e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              
              try {
                await addPet({
                  name: formData.get('name') as string,
                  species: formData.get('species') as any,
                  breed: formData.get('breed') as string || undefined,
                  date_of_birth: formData.get('date_of_birth') as string || undefined,
                  weight_lbs: formData.get('weight') ? parseFloat(formData.get('weight') as string) : undefined,
                  microchip_id: formData.get('microchip_id') as string || undefined,
                });
                setShowAddPetModal(false);
              } catch (error) {
                console.error('Error adding pet:', error);
              }
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Pet Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="e.g., Max"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Species
                  </label>
                  <select
                    name="species"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  >
                    <option value="">Select species</option>
                    <option value="DOG">Dog</option>
                    <option value="CAT">Cat</option>
                    <option value="BIRD">Bird</option>
                    <option value="FISH">Fish</option>
                    <option value="RABBIT">Rabbit</option>
                    <option value="HAMSTER">Hamster</option>
                    <option value="GUINEA_PIG">Guinea Pig</option>
                    <option value="REPTILE">Reptile</option>
                    <option value="HORSE">Horse</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Breed
                  </label>
                  <input
                    type="text"
                    name="breed"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="e.g., Golden Retriever"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      name="date_of_birth"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Weight (lbs)
                    </label>
                    <input
                      type="number"
                      name="weight"
                      min="0"
                      step="0.1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="70"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Microchip ID (optional)
                  </label>
                  <input
                    type="text"
                    name="microchip_id"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="985141405428756"
                  />
                </div>
              </div>
              
              <div className="flex gap-3 mt-6">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Add Pet
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddPetModal(false)}
                  className="flex-1 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 py-2 rounded-md hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Pet Details Modal */}
      {selectedPet && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">{selectedPet.name}</h2>
              <button
                onClick={() => setSelectedPet(null)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Basic Information</h3>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">Species</span>
                    <p className="text-gray-900 dark:text-white font-medium">{getSpeciesDisplay(selectedPet.species)}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">Breed</span>
                    <p className="text-gray-900 dark:text-white font-medium">{selectedPet.breed || 'Not specified'}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">Age</span>
                    <p className="text-gray-900 dark:text-white font-medium">{selectedPet.age_years ? `${selectedPet.age_years} years` : 'Unknown'}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">Weight</span>
                    <p className="text-gray-900 dark:text-white font-medium">{selectedPet.weight_lbs ? `${selectedPet.weight_lbs} lbs` : 'Unknown'}</p>
                  </div>
                  {selectedPet.microchip_id && (
                    <div>
                      <span className="text-sm text-gray-500 dark:text-gray-400">Microchip ID</span>
                      <p className="text-gray-900 dark:text-white font-medium">{selectedPet.microchip_id}</p>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Health Information</h3>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">Last Vet Visit</span>
                    <p className="text-gray-900 dark:text-white font-medium">
                      {selectedPet.last_vet_visit ? formatDate(selectedPet.last_vet_visit) : 'Not recorded'}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">Next Vet Visit</span>
                    <p className="text-gray-900 dark:text-white font-medium">
                      {selectedPet.next_vet_visit ? formatDate(selectedPet.next_vet_visit) : 'Not scheduled'}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">Medications</span>
                    {selectedPet.current_medications && selectedPet.current_medications.length > 0 ? (
                      <ul className="mt-1">
                        {selectedPet.current_medications.map((med: any, index: number) => (
                          <li key={index} className="text-gray-900 dark:text-white font-medium">
                            • {med.name} - {med.dosage} ({med.frequency})
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-gray-900 dark:text-white font-medium">None</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <div className="flex gap-3">
                <button className="flex-1 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors">
                  Edit Information
                </button>
                <button className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 py-2 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
                  Health Records
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}