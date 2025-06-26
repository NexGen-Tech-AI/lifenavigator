'use client';

import React, { useState } from 'react';
import {
  CogIcon,
  BellIcon,
  AcademicCapIcon,
  ClockIcon,
  GlobeAltIcon,
  ShieldCheckIcon,
  UserCircleIcon,
  CalendarDaysIcon,
  EnvelopeIcon,
  DevicePhoneMobileIcon,
  ComputerDesktopIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

interface StudyPreferences {
  studyGoal: number; // hours per week
  preferredTime: 'morning' | 'afternoon' | 'evening' | 'night';
  learningStyle: 'visual' | 'auditory' | 'reading' | 'kinesthetic';
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'mixed';
  pace: 'slow' | 'moderate' | 'fast' | 'intensive';
}

interface NotificationSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  smsNotifications: boolean;
  reminderFrequency: 'daily' | 'weekly' | 'custom';
  deadlineAlerts: boolean;
  progressReports: boolean;
  newCourseAlerts: boolean;
  achievementNotifications: boolean;
}

interface PrivacySettings {
  profileVisibility: 'public' | 'friends' | 'private';
  showProgress: boolean;
  showCertificates: boolean;
  showAchievements: boolean;
  allowDataCollection: boolean;
}

export default function EducationSettingsPage() {
  const [studyPreferences, setStudyPreferences] = useState<StudyPreferences>({
    studyGoal: 10,
    preferredTime: 'evening',
    learningStyle: 'visual',
    difficulty: 'intermediate',
    pace: 'moderate'
  });

  const [notifications, setNotifications] = useState<NotificationSettings>({
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    reminderFrequency: 'daily',
    deadlineAlerts: true,
    progressReports: true,
    newCourseAlerts: true,
    achievementNotifications: true
  });

  const [privacy, setPrivacy] = useState<PrivacySettings>({
    profileVisibility: 'friends',
    showProgress: true,
    showCertificates: true,
    showAchievements: true,
    allowDataCollection: true
  });

  const [activeTab, setActiveTab] = useState<'preferences' | 'notifications' | 'privacy' | 'account'>('preferences');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  const handleSave = () => {
    setSaveStatus('saving');
    // Simulate API call
    setTimeout(() => {
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    }, 1000);
  };

  return (
    <div className="container mx-auto py-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Education Settings</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Customize your learning experience and preferences
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
            <nav className="space-y-1">
              <button
                onClick={() => setActiveTab('preferences')}
                className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg text-left transition-colors ${
                  activeTab === 'preferences'
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                    : 'hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                <AcademicCapIcon className="w-5 h-5" />
                Study Preferences
              </button>
              <button
                onClick={() => setActiveTab('notifications')}
                className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg text-left transition-colors ${
                  activeTab === 'notifications'
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                    : 'hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                <BellIcon className="w-5 h-5" />
                Notifications
              </button>
              <button
                onClick={() => setActiveTab('privacy')}
                className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg text-left transition-colors ${
                  activeTab === 'privacy'
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                    : 'hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                <ShieldCheckIcon className="w-5 h-5" />
                Privacy
              </button>
              <button
                onClick={() => setActiveTab('account')}
                className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg text-left transition-colors ${
                  activeTab === 'account'
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                    : 'hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                <UserCircleIcon className="w-5 h-5" />
                Account
              </button>
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            {/* Study Preferences */}
            {activeTab === 'preferences' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold mb-4">Study Preferences</h2>
                
                {/* Study Goal */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Weekly Study Goal
                  </label>
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      min="1"
                      max="40"
                      value={studyPreferences.studyGoal}
                      onChange={(e) => setStudyPreferences({
                        ...studyPreferences,
                        studyGoal: parseInt(e.target.value)
                      })}
                      className="flex-1"
                    />
                    <span className="w-20 text-center font-medium">
                      {studyPreferences.studyGoal} hours
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Set your target study hours per week
                  </p>
                </div>

                {/* Preferred Study Time */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Preferred Study Time
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {(['morning', 'afternoon', 'evening', 'night'] as const).map((time) => (
                      <label
                        key={time}
                        className={`flex items-center justify-center p-3 rounded-lg border cursor-pointer transition-colors ${
                          studyPreferences.preferredTime === time
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                            : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                        }`}
                      >
                        <input
                          type="radio"
                          name="preferredTime"
                          value={time}
                          checked={studyPreferences.preferredTime === time}
                          onChange={(e) => setStudyPreferences({
                            ...studyPreferences,
                            preferredTime: e.target.value as any
                          })}
                          className="sr-only"
                        />
                        <span className="capitalize">{time}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Learning Style */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Learning Style
                  </label>
                  <select
                    value={studyPreferences.learningStyle}
                    onChange={(e) => setStudyPreferences({
                      ...studyPreferences,
                      learningStyle: e.target.value as any
                    })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                  >
                    <option value="visual">Visual (Videos, Diagrams)</option>
                    <option value="auditory">Auditory (Lectures, Podcasts)</option>
                    <option value="reading">Reading/Writing (Text, Notes)</option>
                    <option value="kinesthetic">Kinesthetic (Hands-on, Practice)</option>
                  </select>
                </div>

                {/* Difficulty Level */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Preferred Difficulty
                  </label>
                  <select
                    value={studyPreferences.difficulty}
                    onChange={(e) => setStudyPreferences({
                      ...studyPreferences,
                      difficulty: e.target.value as any
                    })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                    <option value="mixed">Mixed Levels</option>
                  </select>
                </div>

                {/* Learning Pace */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Learning Pace
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {(['slow', 'moderate', 'fast', 'intensive'] as const).map((pace) => (
                      <label
                        key={pace}
                        className={`flex items-center justify-center p-3 rounded-lg border cursor-pointer transition-colors ${
                          studyPreferences.pace === pace
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                            : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                        }`}
                      >
                        <input
                          type="radio"
                          name="pace"
                          value={pace}
                          checked={studyPreferences.pace === pace}
                          onChange={(e) => setStudyPreferences({
                            ...studyPreferences,
                            pace: e.target.value as any
                          })}
                          className="sr-only"
                        />
                        <span className="capitalize">{pace}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Notifications */}
            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold mb-4">Notification Settings</h2>
                
                {/* Notification Channels */}
                <div className="space-y-4">
                  <h3 className="font-medium">Notification Channels</h3>
                  
                  <label className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center gap-3">
                      <EnvelopeIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                      <div>
                        <p className="font-medium">Email Notifications</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Receive updates via email
                        </p>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={notifications.emailNotifications}
                      onChange={(e) => setNotifications({
                        ...notifications,
                        emailNotifications: e.target.checked
                      })}
                      className="w-5 h-5 text-blue-600 rounded"
                    />
                  </label>

                  <label className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center gap-3">
                      <ComputerDesktopIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                      <div>
                        <p className="font-medium">Push Notifications</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Browser and desktop notifications
                        </p>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={notifications.pushNotifications}
                      onChange={(e) => setNotifications({
                        ...notifications,
                        pushNotifications: e.target.checked
                      })}
                      className="w-5 h-5 text-blue-600 rounded"
                    />
                  </label>

                  <label className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center gap-3">
                      <DevicePhoneMobileIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                      <div>
                        <p className="font-medium">SMS Notifications</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Text message alerts
                        </p>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={notifications.smsNotifications}
                      onChange={(e) => setNotifications({
                        ...notifications,
                        smsNotifications: e.target.checked
                      })}
                      className="w-5 h-5 text-blue-600 rounded"
                    />
                  </label>
                </div>

                {/* Notification Types */}
                <div className="space-y-4">
                  <h3 className="font-medium">What to Notify</h3>
                  
                  <label className="flex items-center justify-between">
                    <span>Study Reminders</span>
                    <select
                      value={notifications.reminderFrequency}
                      onChange={(e) => setNotifications({
                        ...notifications,
                        reminderFrequency: e.target.value as any
                      })}
                      className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
                    >
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="custom">Custom</option>
                    </select>
                  </label>

                  <label className="flex items-center justify-between">
                    <span>Deadline Alerts</span>
                    <input
                      type="checkbox"
                      checked={notifications.deadlineAlerts}
                      onChange={(e) => setNotifications({
                        ...notifications,
                        deadlineAlerts: e.target.checked
                      })}
                      className="w-5 h-5 text-blue-600 rounded"
                    />
                  </label>

                  <label className="flex items-center justify-between">
                    <span>Progress Reports</span>
                    <input
                      type="checkbox"
                      checked={notifications.progressReports}
                      onChange={(e) => setNotifications({
                        ...notifications,
                        progressReports: e.target.checked
                      })}
                      className="w-5 h-5 text-blue-600 rounded"
                    />
                  </label>

                  <label className="flex items-center justify-between">
                    <span>New Course Alerts</span>
                    <input
                      type="checkbox"
                      checked={notifications.newCourseAlerts}
                      onChange={(e) => setNotifications({
                        ...notifications,
                        newCourseAlerts: e.target.checked
                      })}
                      className="w-5 h-5 text-blue-600 rounded"
                    />
                  </label>

                  <label className="flex items-center justify-between">
                    <span>Achievement Notifications</span>
                    <input
                      type="checkbox"
                      checked={notifications.achievementNotifications}
                      onChange={(e) => setNotifications({
                        ...notifications,
                        achievementNotifications: e.target.checked
                      })}
                      className="w-5 h-5 text-blue-600 rounded"
                    />
                  </label>
                </div>
              </div>
            )}

            {/* Privacy */}
            {activeTab === 'privacy' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold mb-4">Privacy Settings</h2>
                
                {/* Profile Visibility */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Profile Visibility
                  </label>
                  <select
                    value={privacy.profileVisibility}
                    onChange={(e) => setPrivacy({
                      ...privacy,
                      profileVisibility: e.target.value as any
                    })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                  >
                    <option value="public">Public - Anyone can view</option>
                    <option value="friends">Friends Only</option>
                    <option value="private">Private - Only you</option>
                  </select>
                </div>

                {/* Privacy Options */}
                <div className="space-y-4">
                  <h3 className="font-medium">What Others Can See</h3>
                  
                  <label className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Learning Progress</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Show your course progress and completion rates
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={privacy.showProgress}
                      onChange={(e) => setPrivacy({
                        ...privacy,
                        showProgress: e.target.checked
                      })}
                      className="w-5 h-5 text-blue-600 rounded"
                    />
                  </label>

                  <label className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Certificates</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Display earned certificates on your profile
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={privacy.showCertificates}
                      onChange={(e) => setPrivacy({
                        ...privacy,
                        showCertificates: e.target.checked
                      })}
                      className="w-5 h-5 text-blue-600 rounded"
                    />
                  </label>

                  <label className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Achievements</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Show badges and milestones you've earned
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={privacy.showAchievements}
                      onChange={(e) => setPrivacy({
                        ...privacy,
                        showAchievements: e.target.checked
                      })}
                      className="w-5 h-5 text-blue-600 rounded"
                    />
                  </label>
                </div>

                {/* Data Collection */}
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <label className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Learning Analytics</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Allow collection of learning data to improve recommendations
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={privacy.allowDataCollection}
                      onChange={(e) => setPrivacy({
                        ...privacy,
                        allowDataCollection: e.target.checked
                      })}
                      className="w-5 h-5 text-blue-600 rounded"
                    />
                  </label>
                </div>
              </div>
            )}

            {/* Account */}
            {activeTab === 'account' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold mb-4">Account Settings</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Display Name
                    </label>
                    <input
                      type="text"
                      defaultValue="John Doe"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      defaultValue="john.doe@example.com"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Time Zone
                    </label>
                    <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700">
                      <option>Eastern Time (ET)</option>
                      <option>Central Time (CT)</option>
                      <option>Mountain Time (MT)</option>
                      <option>Pacific Time (PT)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Language
                    </label>
                    <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700">
                      <option>English</option>
                      <option>Spanish</option>
                      <option>French</option>
                      <option>German</option>
                    </select>
                  </div>
                </div>

                {/* Danger Zone */}
                <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                  <h3 className="font-medium text-red-600 mb-4">Danger Zone</h3>
                  <div className="space-y-3">
                    <button className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20">
                      Export Learning Data
                    </button>
                    <button className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20">
                      Delete Learning History
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Save Button */}
            <div className="mt-8 flex justify-end">
              <button
                onClick={handleSave}
                disabled={saveStatus === 'saving'}
                className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {saveStatus === 'saving' && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                )}
                {saveStatus === 'saved' && <CheckIcon className="w-5 h-5" />}
                {saveStatus === 'saving' ? 'Saving...' : saveStatus === 'saved' ? 'Saved!' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}