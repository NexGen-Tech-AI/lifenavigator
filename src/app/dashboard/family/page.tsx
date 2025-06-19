'use client';

import React, { useState } from 'react';
import { UserGroupIcon, HeartIcon, CalendarIcon, DocumentTextIcon, PlusIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { useFamilyMembers } from '@/hooks/useFamilyMembers';
import { usePets } from '@/hooks/usePets';

export default function FamilyPage() {
  const { familyMembers, isLoading: familyLoading, addFamilyMember } = useFamilyMembers();
  const { pets, isLoading: petsLoading } = usePets();
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState<any>(null);

  const upcomingEventsCount = 3; // This would come from real data
  const documentsCount = familyMembers.reduce((acc, member) => acc + (member.documents_count || 0), 0) + 12;

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Family Hub</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Manage your family&apos;s information, pets, and important documents in one place
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Family Members</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                {familyLoading ? '...' : familyMembers.length}
              </p>
            </div>
            <UserGroupIcon className="h-8 w-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Pets</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                {petsLoading ? '...' : pets.filter(p => p.status === 'ACTIVE').length}
              </p>
            </div>
            <HeartIcon className="h-8 w-8 text-pink-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Upcoming Events</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">{upcomingEventsCount}</p>
            </div>
            <CalendarIcon className="h-8 w-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Documents</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">{documentsCount}</p>
            </div>
            <DocumentTextIcon className="h-8 w-8 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Family Members Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Family Members</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {familyLoading ? (
            <div className="col-span-full text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          ) : (
            <>
              {familyMembers.map((member) => {
                const initials = `${member.first_name[0]}${member.last_name?.[0] || ''}`.toUpperCase();
                const colors = ['blue', 'pink', 'green', 'purple', 'yellow', 'red'];
                const colorIndex = member.id.charCodeAt(0) % colors.length;
                const color = colors[colorIndex];
                
                return (
                  <div 
                    key={member.id} 
                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => setSelectedMember(member)}
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`h-12 w-12 rounded-full bg-${color}-100 dark:bg-${color}-900 flex items-center justify-center`}>
                        <span className={`text-${color}-600 dark:text-${color}-300 font-semibold`}>{initials}</span>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 dark:text-white">
                          {member.first_name} {member.last_name}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                          {member.relationship.toLowerCase()}
                        </p>
                        {member.emergency_contact && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 mt-1">
                            Emergency Contact
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              
              <button 
                className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 hover:border-gray-400 dark:hover:border-gray-500 transition-colors"
                onClick={() => setShowAddMemberModal(true)}
              >
                <div className="text-center">
                  <UserGroupIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">Add Family Member</span>
                </div>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link href="/dashboard/family/pets" className="block p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <HeartIcon className="h-6 w-6 text-pink-500 mb-2" />
            <h4 className="font-medium text-gray-900 dark:text-white">Manage Pets</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">View and update pet information</p>
          </Link>

          <Link href="/dashboard/family/events" className="block p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <CalendarIcon className="h-6 w-6 text-green-500 mb-2" />
            <h4 className="font-medium text-gray-900 dark:text-white">Family Events</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Schedule family gatherings</p>
          </Link>

          <Link href="/dashboard/family/documents" className="block p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <DocumentTextIcon className="h-6 w-6 text-purple-500 mb-2" />
            <h4 className="font-medium text-gray-900 dark:text-white">Documents</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Store important family documents</p>
          </Link>

          <Link href="/dashboard/family/emergency" className="block p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <svg className="h-6 w-6 text-red-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h4 className="font-medium text-gray-900 dark:text-white">Emergency Info</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Emergency contacts & info</p>
          </Link>
        </div>
      </div>

      {/* Add Family Member Modal */}
      {showAddMemberModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Add Family Member</h2>
            
            <form onSubmit={async (e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              
              try {
                await addFamilyMember({
                  first_name: formData.get('first_name') as string,
                  last_name: formData.get('last_name') as string,
                  relationship: formData.get('relationship') as any,
                  date_of_birth: formData.get('date_of_birth') as string || undefined,
                  email: formData.get('email') as string || undefined,
                  phone: formData.get('phone') as string || undefined,
                  emergency_contact: formData.get('emergency_contact') === 'on',
                });
                setShowAddMemberModal(false);
              } catch (error) {
                console.error('Error adding family member:', error);
              }
            }}>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      First Name
                    </label>
                    <input
                      type="text"
                      name="first_name"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="John"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Last Name
                    </label>
                    <input
                      type="text"
                      name="last_name"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="Doe"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Relationship
                  </label>
                  <select
                    name="relationship"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  >
                    <option value="">Select relationship</option>
                    <option value="SPOUSE">Spouse</option>
                    <option value="CHILD">Child</option>
                    <option value="PARENT">Parent</option>
                    <option value="SIBLING">Sibling</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
                
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
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="john@example.com"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Phone
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="(555) 123-4567"
                  />
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="emergency_contact"
                    id="emergency_contact"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="emergency_contact" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">
                    Set as emergency contact
                  </label>
                </div>
              </div>
              
              <div className="flex gap-3 mt-6">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Add Member
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddMemberModal(false)}
                  className="flex-1 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 py-2 rounded-md hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}