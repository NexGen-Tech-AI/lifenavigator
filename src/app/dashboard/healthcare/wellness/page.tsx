'use client';

import React, { useState, useEffect } from 'react';
import {
  HeartIcon,
  UserGroupIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  TrophyIcon,
  ChartBarIcon,
  SparklesIcon,
  CalendarDaysIcon,
  ClipboardDocumentCheckIcon,
  BellAlertIcon,
  AcademicCapIcon,
  ShoppingBagIcon,
  BeakerIcon,
  FireIcon,
  ChevronRightIcon,
  CheckCircleIcon,
  PlusIcon
} from '@heroicons/react/24/outline';

interface WellnessContact {
  id: string;
  type: 'gym' | 'nutritionist' | 'trainer' | 'therapist' | 'other';
  name: string;
  title: string;
  phone: string;
  email: string;
  address?: string;
  notes?: string;
  lastContact?: string;
  nextAppointment?: string;
}

interface WellnessGoal {
  id: string;
  category: 'fitness' | 'nutrition' | 'mental' | 'sleep' | 'other';
  title: string;
  target: string;
  current: string;
  unit?: string;
  deadline: string;
  progress: number;
  status: 'on-track' | 'at-risk' | 'completed' | 'paused';
  milestones?: { date: string; value: string; achieved: boolean }[];
}

interface Supplement {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  timeOfDay: string[];
  purpose: string;
  startDate: string;
  prescribedBy?: string;
  notes?: string;
  reminders: boolean;
}

interface WorkoutSession {
  date: string;
  type: string;
  duration: number;
  calories: number;
  intensity: 'low' | 'moderate' | 'high';
}

interface NutritionLog {
  date: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  water: number;
}

export default function WellnessCenterPage() {
  const [contacts, setContacts] = useState<WellnessContact[]>([]);
  const [goals, setGoals] = useState<WellnessGoal[]>([]);
  const [supplements, setSupplements] = useState<Supplement[]>([]);
  const [workoutHistory, setWorkoutHistory] = useState<WorkoutSession[]>([]);
  const [nutritionHistory, setNutritionHistory] = useState<NutritionLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'contacts' | 'goals' | 'supplements' | 'activity'>('overview');
  const [showAddModal, setShowAddModal] = useState(false);
  const [modalType, setModalType] = useState<'contact' | 'goal' | 'supplement'>('contact');

  useEffect(() => {
    const fetchWellnessData = async () => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock contacts data
      setContacts([
        {
          id: '1',
          type: 'gym',
          name: 'FitLife Gym',
          title: 'Premium Fitness Center',
          phone: '(555) 123-4567',
          email: 'info@fitlifegym.com',
          address: '123 Fitness Ave, Suite 100',
          notes: 'Membership #: FL-2024-1234',
          nextAppointment: '2025-06-28 6:00 AM'
        },
        {
          id: '2',
          type: 'nutritionist',
          name: 'Dr. Sarah Chen',
          title: 'Registered Dietitian Nutritionist',
          phone: '(555) 234-5678',
          email: 'sarah.chen@nutritionexperts.com',
          address: '456 Health Blvd, Office 201',
          lastContact: '2025-06-15',
          nextAppointment: '2025-07-15 2:00 PM',
          notes: 'Focus on balanced macros and meal planning'
        },
        {
          id: '3',
          type: 'trainer',
          name: 'Mike Thompson',
          title: 'Certified Personal Trainer',
          phone: '(555) 345-6789',
          email: 'mike@fitlifegym.com',
          notes: 'Specializes in strength training and HIIT',
          nextAppointment: '2025-06-30 5:00 PM'
        }
      ]);

      // Mock goals data
      setGoals([
        {
          id: '1',
          category: 'fitness',
          title: 'Lose Weight',
          target: '165',
          current: '175',
          unit: 'lbs',
          deadline: '2025-12-31',
          progress: 50,
          status: 'on-track',
          milestones: [
            { date: '2025-03-31', value: '172', achieved: false },
            { date: '2025-06-30', value: '169', achieved: false },
            { date: '2025-09-30', value: '167', achieved: false }
          ]
        },
        {
          id: '2',
          category: 'fitness',
          title: 'Run 5K',
          target: '25',
          current: '35',
          unit: 'minutes',
          deadline: '2025-09-01',
          progress: 30,
          status: 'on-track'
        },
        {
          id: '3',
          category: 'nutrition',
          title: 'Daily Protein Intake',
          target: '120',
          current: '95',
          unit: 'grams',
          deadline: '2025-07-31',
          progress: 79,
          status: 'on-track'
        },
        {
          id: '4',
          category: 'mental',
          title: 'Daily Meditation',
          target: '30',
          current: '15',
          unit: 'days streak',
          deadline: '2025-08-01',
          progress: 50,
          status: 'on-track'
        },
        {
          id: '5',
          category: 'sleep',
          title: 'Sleep Quality',
          target: '8',
          current: '6.5',
          unit: 'hours/night',
          deadline: '2025-07-01',
          progress: 81,
          status: 'at-risk'
        }
      ]);

      // Mock supplements data
      setSupplements([
        {
          id: '1',
          name: 'Vitamin D3',
          dosage: '2000 IU',
          frequency: 'Daily',
          timeOfDay: ['Morning'],
          purpose: 'Immune support, bone health',
          startDate: '2024-01-15',
          prescribedBy: 'Dr. Emily Smith',
          reminders: true
        },
        {
          id: '2',
          name: 'Omega-3 Fish Oil',
          dosage: '1000mg',
          frequency: 'Twice daily',
          timeOfDay: ['Morning', 'Evening'],
          purpose: 'Heart health, inflammation',
          startDate: '2024-03-20',
          notes: 'Take with meals',
          reminders: true
        },
        {
          id: '3',
          name: 'Multivitamin',
          dosage: '1 tablet',
          frequency: 'Daily',
          timeOfDay: ['Morning'],
          purpose: 'General nutrition support',
          startDate: '2024-01-01',
          reminders: false
        },
        {
          id: '4',
          name: 'Magnesium Glycinate',
          dosage: '400mg',
          frequency: 'Daily',
          timeOfDay: ['Evening'],
          purpose: 'Sleep quality, muscle recovery',
          startDate: '2024-06-10',
          prescribedBy: 'Dr. Sarah Chen',
          notes: 'Take 30 minutes before bed',
          reminders: true
        },
        {
          id: '5',
          name: 'Probiotics',
          dosage: '10 billion CFU',
          frequency: 'Daily',
          timeOfDay: ['Morning'],
          purpose: 'Digestive health',
          startDate: '2024-09-01',
          notes: 'Refrigerate after opening',
          reminders: true
        }
      ]);

      // Mock workout history
      setWorkoutHistory([
        { date: '2025-06-26', type: 'Strength Training', duration: 45, calories: 280, intensity: 'high' },
        { date: '2025-06-25', type: 'Yoga', duration: 60, calories: 180, intensity: 'low' },
        { date: '2025-06-24', type: 'Running', duration: 30, calories: 320, intensity: 'moderate' },
        { date: '2025-06-23', type: 'HIIT', duration: 25, calories: 350, intensity: 'high' },
        { date: '2025-06-22', type: 'Swimming', duration: 40, calories: 400, intensity: 'moderate' }
      ]);

      // Mock nutrition history
      setNutritionHistory([
        { date: '2025-06-26', calories: 2150, protein: 95, carbs: 280, fat: 75, water: 8 },
        { date: '2025-06-25', calories: 2320, protein: 110, carbs: 300, fat: 82, water: 9 },
        { date: '2025-06-24', calories: 1980, protein: 88, carbs: 250, fat: 68, water: 7 },
        { date: '2025-06-23', calories: 2250, protein: 105, carbs: 290, fat: 78, water: 10 },
        { date: '2025-06-22', calories: 2100, protein: 92, carbs: 275, fat: 72, water: 8 }
      ]);

      setLoading(false);
    };

    fetchWellnessData();
  }, []);

  const getContactIcon = (type: string) => {
    switch (type) {
      case 'gym':
        return <HeartIcon className="h-8 w-8 text-blue-500" />;
      case 'nutritionist':
        return <AcademicCapIcon className="h-8 w-8 text-green-500" />;
      case 'trainer':
        return <UserGroupIcon className="h-8 w-8 text-purple-500" />;
      default:
        return <UserGroupIcon className="h-8 w-8 text-gray-500" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'fitness':
        return 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/20';
      case 'nutrition':
        return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/20';
      case 'mental':
        return 'text-purple-600 bg-purple-100 dark:text-purple-400 dark:bg-purple-900/20';
      case 'sleep':
        return 'text-indigo-600 bg-indigo-100 dark:text-indigo-400 dark:bg-indigo-900/20';
      default:
        return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900/20';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/20';
      case 'on-track':
        return 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/20';
      case 'at-risk':
        return 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/20';
      case 'paused':
        return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900/20';
      default:
        return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900/20';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Wellness Center</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Manage your fitness, nutrition, and well-being</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'overview'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('contacts')}
            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'contacts'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
            }`}
          >
            Wellness Team
          </button>
          <button
            onClick={() => setActiveTab('goals')}
            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'goals'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
            }`}
          >
            Goals & Progress
          </button>
          <button
            onClick={() => setActiveTab('supplements')}
            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'supplements'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
            }`}
          >
            Supplements
          </button>
          <button
            onClick={() => setActiveTab('activity')}
            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'activity'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
            }`}
          >
            Activity & Nutrition
          </button>
        </nav>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Active Goals</h3>
                <TrophyIcon className="h-5 w-5 text-yellow-500" />
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {goals.filter(g => g.status !== 'completed').length}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {goals.filter(g => g.status === 'on-track').length} on track
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">This Week</h3>
                <FireIcon className="h-5 w-5 text-orange-500" />
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {workoutHistory.length}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Workouts completed</p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Supplements</h3>
                <BeakerIcon className="h-5 w-5 text-green-500" />
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{supplements.length}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {supplements.filter(s => s.reminders).length} with reminders
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Avg. Calories</h3>
                <ChartBarIcon className="h-5 w-5 text-blue-500" />
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {Math.round(nutritionHistory.reduce((sum, n) => sum + n.calories, 0) / nutritionHistory.length)}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Daily average</p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Today's Focus</h3>
              <ul className="space-y-3">
                <li className="flex items-center gap-3">
                  <CheckCircleIcon className="h-5 w-5 text-green-500" />
                  <span className="text-gray-700 dark:text-gray-300">Morning workout completed</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="h-5 w-5 rounded-full border-2 border-gray-300"></div>
                  <span className="text-gray-700 dark:text-gray-300">Take evening supplements</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="h-5 w-5 rounded-full border-2 border-gray-300"></div>
                  <span className="text-gray-700 dark:text-gray-300">Log dinner nutrition</span>
                </li>
              </ul>
            </div>

            <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Next Appointments</h3>
              <div className="space-y-3">
                {contacts
                  .filter(c => c.nextAppointment)
                  .slice(0, 2)
                  .map(contact => (
                    <div key={contact.id} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white text-sm">{contact.name}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {new Date(contact.nextAppointment!).toLocaleDateString()}
                        </p>
                      </div>
                      <ChevronRightIcon className="h-4 w-4 text-gray-400" />
                    </div>
                  ))}
              </div>
            </div>

            <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Goal Progress</h3>
              <div className="space-y-3">
                {goals.slice(0, 2).map(goal => (
                  <div key={goal.id}>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{goal.title}</span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">{goal.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-purple-600 h-2 rounded-full"
                        style={{ width: `${goal.progress}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Wellness Team Tab */}
      {activeTab === 'contacts' && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Your Wellness Team</h2>
            <button
              onClick={() => {
                setModalType('contact');
                setShowAddModal(true);
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <PlusIcon className="h-5 w-5" />
              Add Contact
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {contacts.map((contact) => (
              <div key={contact.id} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                <div className="flex items-start gap-4">
                  {getContactIcon(contact.type)}
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{contact.name}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{contact.title}</p>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <PhoneIcon className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-700 dark:text-gray-300">{contact.phone}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <EnvelopeIcon className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-700 dark:text-gray-300">{contact.email}</span>
                      </div>
                      {contact.address && (
                        <div className="flex items-center gap-2">
                          <MapPinIcon className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-700 dark:text-gray-300">{contact.address}</span>
                        </div>
                      )}
                      {contact.nextAppointment && (
                        <div className="flex items-center gap-2 mt-3">
                          <CalendarDaysIcon className="h-4 w-4 text-blue-500" />
                          <span className="text-blue-600 dark:text-blue-400 font-medium">
                            Next: {new Date(contact.nextAppointment).toLocaleString()}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    {contact.notes && (
                      <p className="mt-3 text-sm text-gray-600 dark:text-gray-400 italic">
                        {contact.notes}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Goals & Progress Tab */}
      {activeTab === 'goals' && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Wellness Goals</h2>
            <button
              onClick={() => {
                setModalType('goal');
                setShowAddModal(true);
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <PlusIcon className="h-5 w-5" />
              Add Goal
            </button>
          </div>

          <div className="space-y-6">
            {goals.map((goal) => (
              <div key={goal.id} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{goal.title}</h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(goal.category)}`}>
                        {goal.category}
                      </span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(goal.status)}`}>
                        {goal.status.replace('-', ' ')}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Target: {goal.target} {goal.unit} by {new Date(goal.deadline).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{goal.progress}%</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Current: {goal.current} {goal.unit}
                    </p>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Progress</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {goal.current} / {goal.target} {goal.unit}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full ${
                        goal.status === 'on-track' ? 'bg-blue-600' :
                        goal.status === 'at-risk' ? 'bg-yellow-600' :
                        goal.status === 'completed' ? 'bg-green-600' :
                        'bg-gray-400'
                      }`}
                      style={{ width: `${goal.progress}%` }}
                    ></div>
                  </div>
                </div>

                {goal.milestones && goal.milestones.length > 0 && (
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Milestones</h4>
                    <div className="space-y-2">
                      {goal.milestones.map((milestone, index) => (
                        <div key={index} className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            {milestone.achieved ? (
                              <CheckCircleIcon className="h-4 w-4 text-green-500" />
                            ) : (
                              <div className="h-4 w-4 rounded-full border-2 border-gray-300"></div>
                            )}
                            <span className={milestone.achieved ? 'text-gray-500 line-through' : 'text-gray-700 dark:text-gray-300'}>
                              {milestone.value} {goal.unit}
                            </span>
                          </div>
                          <span className="text-gray-500 dark:text-gray-400">
                            {new Date(milestone.date).toLocaleDateString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Supplements Tab */}
      {activeTab === 'supplements' && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Supplement Regimen</h2>
            <button
              onClick={() => {
                setModalType('supplement');
                setShowAddModal(true);
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <PlusIcon className="h-5 w-5" />
              Add Supplement
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {supplements.map((supplement) => (
              <div key={supplement.id} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{supplement.name}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{supplement.purpose}</p>
                  </div>
                  {supplement.reminders && (
                    <BellAlertIcon className="h-5 w-5 text-blue-500" />
                  )}
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Dosage:</span>
                    <span className="text-gray-900 dark:text-white font-medium">{supplement.dosage}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Frequency:</span>
                    <span className="text-gray-900 dark:text-white">{supplement.frequency}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Time:</span>
                    <span className="text-gray-900 dark:text-white">{supplement.timeOfDay.join(', ')}</span>
                  </div>
                  {supplement.prescribedBy && (
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">Prescribed by:</span>
                      <span className="text-gray-900 dark:text-white">{supplement.prescribedBy}</span>
                    </div>
                  )}
                </div>

                {supplement.notes && (
                  <p className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded text-sm text-gray-600 dark:text-gray-400">
                    {supplement.notes}
                  </p>
                )}

                <div className="mt-4 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                  <CalendarDaysIcon className="h-4 w-4" />
                  <span>Started {new Date(supplement.startDate).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Activity & Nutrition Tab */}
      {activeTab === 'activity' && (
        <div className="space-y-6">
          {/* Recent Workouts */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Recent Workouts</h3>
            <div className="space-y-3">
              {workoutHistory.map((workout, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center gap-4">
                    <FireIcon className={`h-6 w-6 ${
                      workout.intensity === 'high' ? 'text-red-500' :
                      workout.intensity === 'moderate' ? 'text-orange-500' :
                      'text-yellow-500'
                    }`} />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{workout.type}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {new Date(workout.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900 dark:text-white">{workout.duration} min</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{workout.calories} cal</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Nutrition Tracking */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Nutrition Overview</h3>
            <div className="space-y-4">
              {nutritionHistory.slice(0, 3).map((nutrition, index) => (
                <div key={index} className="border-b border-gray-200 dark:border-gray-700 pb-4 last:border-0">
                  <div className="flex justify-between mb-2">
                    <span className="font-medium text-gray-900 dark:text-white">
                      {new Date(nutrition.date).toLocaleDateString()}
                    </span>
                    <span className="font-bold text-gray-900 dark:text-white">
                      {nutrition.calories} cal
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Protein</span>
                      <p className="font-medium text-gray-900 dark:text-white">{nutrition.protein}g</p>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Carbs</span>
                      <p className="font-medium text-gray-900 dark:text-white">{nutrition.carbs}g</p>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Fat</span>
                      <p className="font-medium text-gray-900 dark:text-white">{nutrition.fat}g</p>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Water</span>
                      <p className="font-medium text-gray-900 dark:text-white">{nutrition.water} cups</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <button className="mt-4 w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Log Today's Nutrition
            </button>
          </div>

          {/* Weekly Summary */}
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 p-6 rounded-lg">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Weekly Summary</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{workoutHistory.length}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Workouts</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {workoutHistory.reduce((sum, w) => sum + w.duration, 0)}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Minutes</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {workoutHistory.reduce((sum, w) => sum + w.calories, 0)}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Calories Burned</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {Math.round(nutritionHistory.reduce((sum, n) => sum + n.water, 0) / nutritionHistory.length)}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Avg Water/Day</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}