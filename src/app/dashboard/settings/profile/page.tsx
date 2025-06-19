'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from '@/hooks/useAuth';
import { Card } from '@/components/ui/cards/Card';
import { Button } from '@/components/ui/buttons/Button';
import LoadingSpinner from '@/components/ui/loaders/LoadingSpinner';
import { toast } from '@/components/ui/toaster';
import Link from 'next/link';
import { Edit } from 'lucide-react';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  image?: string;
  createdAt: string;
  updatedAt: string;
}

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [profileData, setProfileData] = useState<UserProfile | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
  });
  const [error, setError] = useState<string | null>(null);
  
  // Fetch user profile data
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (status === 'loading') return;
      
      if (!session?.user?.id) {
        setError('You must be logged in to view this page');
        setIsLoading(false);
        return;
      }
      
      try {
        const response = await fetch(`/api/user/profile`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch profile');
        }
        
        const data = await response.json();
        setProfileData(data);
        setFormData({
          name: data.name || '',
          email: data.email || '',
        });
      } catch (error) {
        console.error('Error fetching profile:', error);
        setError('Failed to load profile data. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserProfile();
  }, [session, status]);
  
  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    
    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update profile');
      }
      
      const updatedProfile = await response.json();
      setProfileData(updatedProfile);
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
        type: "success",
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      setError('Failed to update profile. Please try again.');
      toast({
        title: "Update Failed",
        description: "There was an error updating your profile.",
        type: "error",
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  // Show loading spinner
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[500px]">
        <LoadingSpinner size="large" />
      </div>
    );
  }
  
  // Show error message
  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 p-4 rounded-lg">
          <p>{error}</p>
        </div>
      </div>
    );
  }
  
  // Member since date
  const memberSinceDate = profileData?.createdAt 
    ? new Date(profileData.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'Unknown';
  
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Profile Settings</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column - Profile Information */}
        <div className="lg:col-span-2">
          <Card>
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Personal Information</h2>
                <Link
                  href="/dashboard/settings/profile/edit"
                  className="flex items-center px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Full Profile
                </Link>
              </div>
              
              <form onSubmit={handleSubmit}>
                <div className="space-y-6">
                  {/* Name field */}
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm placeholder-gray-400 
                      focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                      bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      placeholder="Your full name"
                    />
                  </div>
                  
                  {/* Email field */}
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm placeholder-gray-400 
                      focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                      bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      placeholder="Your email address"
                    />
                  </div>
                  
                  {/* Submit button */}
                  <div className="flex justify-end">
                    <Button 
                      type="submit" 
                      disabled={isSaving}
                      className="px-4 py-2"
                    >
                      {isSaving ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </div>
                </div>
              </form>
            </div>
          </Card>
          
          {/* Profile Completion Section */}
          <Card className="mt-6">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">Profile Completion</h2>
              
              <div className="relative pt-1">
                <div className="flex mb-2 items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-blue-600 bg-blue-200 dark:bg-blue-900 dark:text-blue-200">
                      Progress
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-semibold inline-block text-blue-600 dark:text-blue-400">
                      70%
                    </span>
                  </div>
                </div>
                <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-blue-200 dark:bg-blue-900">
                  <div style={{ width: "70%" }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500 dark:bg-blue-600 transition-all duration-500"></div>
                </div>
              </div>
              
              <div className="space-y-3 mt-4">
                <div className="flex items-center">
                  <div className="h-5 w-5 rounded-full bg-green-500 dark:bg-green-600 flex items-center justify-center text-white">
                    <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                    </svg>
                  </div>
                  <span className="ml-2 text-gray-700 dark:text-gray-300">Basic Profile Information</span>
                </div>
                <div className="flex items-center">
                  <div className="h-5 w-5 rounded-full bg-green-500 dark:bg-green-600 flex items-center justify-center text-white">
                    <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                    </svg>
                  </div>
                  <span className="ml-2 text-gray-700 dark:text-gray-300">Completed Onboarding</span>
                </div>
                <div className="flex items-center">
                  <div className="h-5 w-5 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-white">
                    <svg className="h-3 w-3 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                    </svg>
                  </div>
                  <span className="ml-2 text-gray-500 dark:text-gray-400">Add Profile Photo</span>
                </div>
                <div className="flex items-center">
                  <div className="h-5 w-5 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-white">
                    <svg className="h-3 w-3 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                    </svg>
                  </div>
                  <span className="ml-2 text-gray-500 dark:text-gray-400">Set Up Two-Factor Authentication</span>
                </div>
              </div>
            </div>
          </Card>
        </div>
        
        {/* Right column - Profile Photo and Account Summary */}
        <div>
          {/* Profile Photo Card */}
          <Card>
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">Profile Photo</h2>
              
              <div className="flex flex-col items-center">
                <div className="relative mb-4">
                  {profileData?.image ? (
                    <img 
                      src={profileData.image} 
                      alt="Profile" 
                      className="h-32 w-32 rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-32 w-32 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-700 dark:text-blue-300 text-4xl font-medium">
                      {formData.name ? formData.name.charAt(0).toUpperCase() : '?'}
                    </div>
                  )}
                  
                  <button className="absolute bottom-0 right-0 bg-white dark:bg-gray-800 rounded-full p-2 shadow-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                    <svg className="h-5 w-5 text-gray-700 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </button>
                </div>
                
                <div className="space-y-2 w-full">
                  <Button variant="outline" className="w-full">
                    Upload New Photo
                  </Button>
                  <Button variant="ghost" className="w-full text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20">
                    Remove Photo
                  </Button>
                </div>
              </div>
            </div>
          </Card>
          
          {/* Account Summary Card */}
          <Card className="mt-6">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">Account Summary</h2>
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Member Since</p>
                  <p className="mt-1 text-gray-900 dark:text-white">{memberSinceDate}</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Account Type</p>
                  <p className="mt-1 text-gray-900 dark:text-white">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200">
                      Premium
                    </span>
                  </p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Linked Accounts</p>
                  <div className="mt-1 flex space-x-2">
                    <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                      </svg>
                    </div>
                    <div className="h-8 w-8 rounded-full bg-blue-400 flex items-center justify-center text-white">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.937 4.937 0 004.604 3.417 9.868 9.868 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.054 0 13.999-7.496 13.999-13.986 0-.209 0-.42-.015-.63a9.936 9.936 0 002.46-2.532l-.047-.02z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <button className="text-sm font-medium text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300">
                  Deactivate Account
                </button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}