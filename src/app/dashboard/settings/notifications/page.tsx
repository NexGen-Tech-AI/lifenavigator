'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card } from '@/components/ui/cards/Card';
import { Button } from '@/components/ui/buttons/Button';
import { toast } from '@/components/ui/toaster';
import LoadingSpinner from '@/components/ui/loaders/LoadingSpinner';

interface NotificationSetting {
  id: string;
  type: string;
  category: string;
  email: boolean;
  push: boolean;
  inApp: boolean;
}

export default function NotificationsSettingsPage() {
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Group notifications by category
  const [notificationSettings, setNotificationSettings] = useState<NotificationSetting[]>([
    // Financial notifications
    { id: 'billing', type: 'Billing & Payments', category: 'financial', email: true, push: true, inApp: true },
    { id: 'budgetAlerts', type: 'Budget Alerts', category: 'financial', email: true, push: true, inApp: true },
    { id: 'investmentUpdates', type: 'Investment Updates', category: 'financial', email: true, push: false, inApp: true },
    { id: 'taxReminders', type: 'Tax Deadlines & Reminders', category: 'financial', email: true, push: true, inApp: true },
    
    // Career notifications
    { id: 'jobOpportunities', type: 'Job Opportunities', category: 'career', email: true, push: false, inApp: true },
    { id: 'networkingReminders', type: 'Networking Reminders', category: 'career', email: true, push: true, inApp: true },
    { id: 'skillsUpdates', type: 'Skills & Learning Updates', category: 'career', email: false, push: false, inApp: true },
    
    // Education notifications
    { id: 'courseDeadlines', type: 'Course Deadlines', category: 'education', email: true, push: true, inApp: true },
    { id: 'certificateExpiration', type: 'Certificate Expiration', category: 'education', email: true, push: false, inApp: true },
    { id: 'learningRecommendations', type: 'Learning Recommendations', category: 'education', email: false, push: false, inApp: true },
    
    // Health notifications
    { id: 'appointmentReminders', type: 'Appointment Reminders', category: 'health', email: true, push: true, inApp: true },
    { id: 'medicationReminders', type: 'Medication Reminders', category: 'health', email: true, push: true, inApp: true },
    { id: 'healthTips', type: 'Health Tips & Insights', category: 'health', email: false, push: false, inApp: true },
    
    // System notifications
    { id: 'securityAlerts', type: 'Security Alerts', category: 'system', email: true, push: true, inApp: true },
    { id: 'accountUpdates', type: 'Account Updates', category: 'system', email: true, push: false, inApp: true },
    { id: 'featureAnnouncements', type: 'New Features & Announcements', category: 'system', email: true, push: false, inApp: true },
  ]);
  
  // Group notifications by category for display
  const categories = [
    { id: 'financial', name: 'Financial', icon: '=°' },
    { id: 'career', name: 'Career', icon: '=¼' },
    { id: 'education', name: 'Education', icon: '<“' },
    { id: 'health', name: 'Health', icon: 'd' },
    { id: 'system', name: 'System', icon: '™' },
  ];
  
  // Fetch notification settings
  useEffect(() => {
    const fetchNotificationSettings = async () => {
      if (status === 'loading') return;
      
      if (!session?.user?.id) {
        setError('You must be logged in to view this page');
        setIsLoading(false);
        return;
      }
      
      try {
        // In a real application, we would fetch the user's notification settings from the API
        // For now, we'll just simulate a delay and use our default settings
        await new Promise(resolve => setTimeout(resolve, 500));
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching notification settings:', error);
        setError('Failed to load notification settings. Please try again.');
        setIsLoading(false);
      }
    };
    
    fetchNotificationSettings();
  }, [session, status]);
  
  // Handle toggle change
  const handleToggle = (id: string, channel: 'email' | 'push' | 'inApp') => {
    setNotificationSettings(prevSettings => 
      prevSettings.map(setting => 
        setting.id === id 
          ? { ...setting, [channel]: !setting[channel] }
          : setting
      )
    );
  };
  
  // Handle toggle all for a category
  const handleToggleCategory = (category: string, channel: 'email' | 'push' | 'inApp', value: boolean) => {
    setNotificationSettings(prevSettings => 
      prevSettings.map(setting => 
        setting.category === category 
          ? { ...setting, [channel]: value }
          : setting
      )
    );
  };
  
  // Check if all notifications in a category are enabled for a channel
  const isCategoryEnabled = (category: string, channel: 'email' | 'push' | 'inApp'): boolean => {
    const categorySettings = notificationSettings.filter(setting => setting.category === category);
    return categorySettings.every(setting => setting[channel]);
  };
  
  // Check if some (but not all) notifications in a category are enabled for a channel
  const isCategoryPartiallyEnabled = (category: string, channel: 'email' | 'push' | 'inApp'): boolean => {
    const categorySettings = notificationSettings.filter(setting => setting.category === category);
    const enabledCount = categorySettings.filter(setting => setting[channel]).length;
    return enabledCount > 0 && enabledCount < categorySettings.length;
  };
  
  // Handle save
  const handleSave = async () => {
    setIsSaving(true);
    
    try {
      // In a real application, we would send the updated settings to the API
      // For now, we'll just simulate a delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Settings Saved",
        description: "Your notification preferences have been updated.",
        type: "success",
      });
    } catch (error) {
      console.error('Error saving notification settings:', error);
      toast({
        title: "Error",
        description: "Failed to save notification settings. Please try again.",
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
  
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Notification Settings</h1>
      
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        Manage how and when you receive notifications from Life Navigator.
      </p>
      
      <div className="mb-8">
        <Card>
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium">Delivery Channels</h2>
            </div>
          </div>
          
          <div className="p-6">
            <div className="flex flex-col space-y-4">
              <div className="grid grid-cols-4 gap-4 text-sm font-medium text-gray-500 dark:text-gray-400 pb-2 border-b border-gray-200 dark:border-gray-700">
                <div className="col-span-1">Notification Type</div>
                <div className="col-span-1 text-center">Email</div>
                <div className="col-span-1 text-center">Push</div>
                <div className="col-span-1 text-center">In-App</div>
              </div>
              
              {categories.map((category) => {
                const categorySettings = notificationSettings.filter(setting => setting.category === category.id);
                
                return (
                  <div key={category.id} className="space-y-4">
                    {/* Category header */}
                    <div className="grid grid-cols-4 gap-4 pt-2">
                      <div className="col-span-1 flex items-center">
                        <span className="mr-2">{category.icon}</span>
                        <span className="font-medium text-gray-900 dark:text-white">{category.name}</span>
                      </div>
                      
                      {/* Category toggle for email */}
                      <div className="col-span-1 flex justify-center">
                        <button
                          onClick={() => handleToggleCategory(category.id, 'email', !isCategoryEnabled(category.id, 'email'))}
                          className={`h-5 w-5 rounded ${
                            isCategoryEnabled(category.id, 'email')
                              ? 'bg-blue-600'
                              : isCategoryPartiallyEnabled(category.id, 'email')
                                ? 'bg-blue-600 bg-opacity-50'
                                : 'bg-gray-200 dark:bg-gray-700'
                          } flex items-center justify-center focus:outline-none`}
                        >
                          {isCategoryEnabled(category.id, 'email') || isCategoryPartiallyEnabled(category.id, 'email') ? (
                            <svg className="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          ) : null}
                        </button>
                      </div>
                      
                      {/* Category toggle for push */}
                      <div className="col-span-1 flex justify-center">
                        <button
                          onClick={() => handleToggleCategory(category.id, 'push', !isCategoryEnabled(category.id, 'push'))}
                          className={`h-5 w-5 rounded ${
                            isCategoryEnabled(category.id, 'push')
                              ? 'bg-blue-600'
                              : isCategoryPartiallyEnabled(category.id, 'push')
                                ? 'bg-blue-600 bg-opacity-50'
                                : 'bg-gray-200 dark:bg-gray-700'
                          } flex items-center justify-center focus:outline-none`}
                        >
                          {isCategoryEnabled(category.id, 'push') || isCategoryPartiallyEnabled(category.id, 'push') ? (
                            <svg className="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          ) : null}
                        </button>
                      </div>
                      
                      {/* Category toggle for in-app */}
                      <div className="col-span-1 flex justify-center">
                        <button
                          onClick={() => handleToggleCategory(category.id, 'inApp', !isCategoryEnabled(category.id, 'inApp'))}
                          className={`h-5 w-5 rounded ${
                            isCategoryEnabled(category.id, 'inApp')
                              ? 'bg-blue-600'
                              : isCategoryPartiallyEnabled(category.id, 'inApp')
                                ? 'bg-blue-600 bg-opacity-50'
                                : 'bg-gray-200 dark:bg-gray-700'
                          } flex items-center justify-center focus:outline-none`}
                        >
                          {isCategoryEnabled(category.id, 'inApp') || isCategoryPartiallyEnabled(category.id, 'inApp') ? (
                            <svg className="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          ) : null}
                        </button>
                      </div>
                    </div>
                    
                    {/* Individual notification settings */}
                    {categorySettings.map((setting) => (
                      <div key={setting.id} className="grid grid-cols-4 gap-4 pl-6 py-2 border-b border-gray-100 dark:border-gray-800 last:border-0">
                        <div className="col-span-1 text-gray-700 dark:text-gray-300 text-sm">
                          {setting.type}
                        </div>
                        
                        {/* Email toggle */}
                        <div className="col-span-1 flex justify-center">
                          <button
                            onClick={() => handleToggle(setting.id, 'email')}
                            className={`relative inline-flex h-5 w-9 items-center rounded-full
                            ${setting.email ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'}`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                              ${setting.email ? 'translate-x-5' : 'translate-x-1'}`}
                            />
                          </button>
                        </div>
                        
                        {/* Push toggle */}
                        <div className="col-span-1 flex justify-center">
                          <button
                            onClick={() => handleToggle(setting.id, 'push')}
                            className={`relative inline-flex h-5 w-9 items-center rounded-full
                            ${setting.push ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'}`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                              ${setting.push ? 'translate-x-5' : 'translate-x-1'}`}
                            />
                          </button>
                        </div>
                        
                        {/* In-App toggle */}
                        <div className="col-span-1 flex justify-center">
                          <button
                            onClick={() => handleToggle(setting.id, 'inApp')}
                            className={`relative inline-flex h-5 w-9 items-center rounded-full
                            ${setting.inApp ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'}`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                              ${setting.inApp ? 'translate-x-5' : 'translate-x-1'}`}
                            />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          </div>
        </Card>
      </div>
      
      <Card>
        <div className="p-6">
          <h2 className="text-lg font-medium mb-4">Notification Schedule</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Configure when you receive notifications. This applies to email and push notifications.
          </p>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Quiet Hours</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                During these hours, you will not receive push notifications unless they are marked as urgent.
              </p>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="quietHoursStart" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Start Time
                  </label>
                  <select
                    id="quietHoursStart"
                    className="w-full rounded-md border border-gray-300 dark:border-gray-700 shadow-sm py-2 px-3 
                    bg-white dark:bg-gray-800 text-gray-900 dark:text-white 
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    defaultValue="22:00"
                  >
                    {Array.from({ length: 24 }, (_, i) => {
                      const hour = i.toString().padStart(2, '0');
                      return (
                        <option key={`${hour}:00`} value={`${hour}:00`}>
                          {`${hour}:00`}
                        </option>
                      );
                    })}
                  </select>
                </div>
                
                <div>
                  <label htmlFor="quietHoursEnd" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    End Time
                  </label>
                  <select
                    id="quietHoursEnd"
                    className="w-full rounded-md border border-gray-300 dark:border-gray-700 shadow-sm py-2 px-3 
                    bg-white dark:bg-gray-800 text-gray-900 dark:text-white 
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    defaultValue="07:00"
                  >
                    {Array.from({ length: 24 }, (_, i) => {
                      const hour = i.toString().padStart(2, '0');
                      return (
                        <option key={`${hour}:00`} value={`${hour}:00`}>
                          {`${hour}:00`}
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Digest Frequency</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                Receive a summary of your notifications instead of individual alerts.
              </p>
              
              <div>
                <select
                  id="digestFrequency"
                  className="w-full rounded-md border border-gray-300 dark:border-gray-700 shadow-sm py-2 px-3 
                  bg-white dark:bg-gray-800 text-gray-900 dark:text-white 
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  defaultValue="daily"
                >
                  <option value="never">Never (receive individual notifications)</option>
                  <option value="daily">Daily digest</option>
                  <option value="weekly">Weekly digest</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </Card>
      
      <div className="mt-6 flex justify-end">
        <Button
          onClick={handleSave}
          disabled={isSaving}
        >
          {isSaving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </div>
  );
}