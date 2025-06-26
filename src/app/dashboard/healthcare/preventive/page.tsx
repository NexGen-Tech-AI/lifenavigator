'use client';

import React, { useState, useEffect } from 'react';
import {
  ShieldCheckIcon,
  CalendarDaysIcon,
  ClipboardDocumentCheckIcon,
  BellAlertIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  BeakerIcon,
  HeartIcon,
  UserIcon,
  CameraIcon,
  SparklesIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

interface Screening {
  id: string;
  name: string;
  category: string;
  frequency: string;
  lastCompleted?: string;
  nextDue: string;
  status: 'overdue' | 'due-soon' | 'up-to-date';
  priority: 'high' | 'medium' | 'low';
  description: string;
}

interface Vaccination {
  id: string;
  name: string;
  series?: string;
  lastDose?: string;
  nextDose?: string;
  status: 'complete' | 'in-progress' | 'due' | 'overdue';
  notes?: string;
}

interface HealthMetric {
  name: string;
  value: number | string;
  unit?: string;
  status: 'normal' | 'attention' | 'alert';
  trend?: 'up' | 'down' | 'stable';
  lastUpdated: string;
}

export default function PreventiveHealthcarePage() {
  const [screenings, setScreenings] = useState<Screening[]>([]);
  const [vaccinations, setVaccinations] = useState<Vaccination[]>([]);
  const [healthMetrics, setHealthMetrics] = useState<HealthMetric[]>([]);
  const [riskFactors, setRiskFactors] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'screenings' | 'vaccinations' | 'metrics' | 'recommendations'>('screenings');

  useEffect(() => {
    const fetchPreventiveData = async () => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock screening data
      setScreenings([
        {
          id: '1',
          name: 'Annual Physical Exam',
          category: 'General Health',
          frequency: 'Yearly',
          lastCompleted: '2024-11-15',
          nextDue: '2025-11-15',
          status: 'up-to-date',
          priority: 'high',
          description: 'Comprehensive physical examination including vital signs, blood work, and health assessment'
        },
        {
          id: '2',
          name: 'Dental Checkup',
          category: 'Oral Health',
          frequency: 'Every 6 months',
          lastCompleted: '2024-09-10',
          nextDue: '2025-03-10',
          status: 'due-soon',
          priority: 'medium',
          description: 'Professional cleaning and oral health examination'
        },
        {
          id: '3',
          name: 'Eye Exam',
          category: 'Vision',
          frequency: 'Every 2 years',
          lastCompleted: '2023-06-20',
          nextDue: '2025-06-20',
          status: 'up-to-date',
          priority: 'low',
          description: 'Comprehensive eye health and vision examination'
        },
        {
          id: '4',
          name: 'Cholesterol Screening',
          category: 'Cardiovascular',
          frequency: 'Every 5 years',
          lastCompleted: '2022-03-15',
          nextDue: '2025-03-15',
          status: 'due-soon',
          priority: 'high',
          description: 'Blood test to check cholesterol levels'
        },
        {
          id: '5',
          name: 'Blood Pressure Check',
          category: 'Cardiovascular',
          frequency: 'Yearly',
          lastCompleted: '2024-11-15',
          nextDue: '2025-11-15',
          status: 'up-to-date',
          priority: 'high',
          description: 'Regular monitoring of blood pressure'
        },
        {
          id: '6',
          name: 'Skin Cancer Screening',
          category: 'Dermatology',
          frequency: 'Yearly',
          lastCompleted: '2023-08-20',
          nextDue: '2024-08-20',
          status: 'overdue',
          priority: 'medium',
          description: 'Full body skin examination by dermatologist'
        }
      ]);

      // Mock vaccination data
      setVaccinations([
        {
          id: '1',
          name: 'Influenza (Flu) Vaccine',
          lastDose: '2024-10-15',
          nextDose: '2025-10-01',
          status: 'complete',
          notes: 'Annual vaccine'
        },
        {
          id: '2',
          name: 'COVID-19 Vaccine',
          series: 'Primary series + 2 boosters',
          lastDose: '2024-09-20',
          status: 'complete',
          notes: 'Updated vaccine received'
        },
        {
          id: '3',
          name: 'Tetanus, Diphtheria (Td)',
          lastDose: '2020-05-10',
          nextDose: '2030-05-10',
          status: 'complete',
          notes: 'Every 10 years'
        },
        {
          id: '4',
          name: 'Shingles Vaccine',
          status: 'due',
          notes: 'Recommended for adults 50+'
        },
        {
          id: '5',
          name: 'Pneumococcal Vaccine',
          lastDose: '2023-03-15',
          status: 'complete',
          notes: 'High-risk individuals'
        }
      ]);

      // Mock health metrics
      setHealthMetrics([
        {
          name: 'BMI',
          value: 24.5,
          unit: 'kg/m²',
          status: 'normal',
          trend: 'stable',
          lastUpdated: '2024-11-15'
        },
        {
          name: 'Blood Pressure',
          value: '118/78',
          unit: 'mmHg',
          status: 'normal',
          trend: 'stable',
          lastUpdated: '2024-11-15'
        },
        {
          name: 'Resting Heart Rate',
          value: 68,
          unit: 'bpm',
          status: 'normal',
          trend: 'down',
          lastUpdated: '2025-01-20'
        },
        {
          name: 'Cholesterol',
          value: 195,
          unit: 'mg/dL',
          status: 'attention',
          trend: 'up',
          lastUpdated: '2024-11-15'
        },
        {
          name: 'Blood Sugar',
          value: 92,
          unit: 'mg/dL',
          status: 'normal',
          trend: 'stable',
          lastUpdated: '2024-11-15'
        }
      ]);

      // Mock risk factors
      setRiskFactors([
        'Family history of heart disease',
        'Sedentary lifestyle',
        'Occasional stress',
        'Irregular sleep schedule'
      ]);

      setLoading(false);
    };

    fetchPreventiveData();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'overdue':
      case 'alert':
        return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/20';
      case 'due-soon':
      case 'due':
      case 'attention':
        return 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/20';
      case 'up-to-date':
      case 'complete':
      case 'normal':
        return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/20';
      default:
        return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900/20';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-600 dark:text-red-400';
      case 'medium':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'low':
        return 'text-blue-600 dark:text-blue-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
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
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Preventive Healthcare</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Stay ahead of health issues with proactive care</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Overdue Items</h3>
            <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {screenings.filter(s => s.status === 'overdue').length + vaccinations.filter(v => v.status === 'overdue').length}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Requires attention</p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Due Soon</h3>
            <ClockIcon className="h-5 w-5 text-yellow-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {screenings.filter(s => s.status === 'due-soon').length + vaccinations.filter(v => v.status === 'due').length}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Next 3 months</p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Up to Date</h3>
            <CheckCircleIcon className="h-5 w-5 text-green-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {screenings.filter(s => s.status === 'up-to-date').length + vaccinations.filter(v => v.status === 'complete').length}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">All good!</p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Health Score</h3>
            <HeartIcon className="h-5 w-5 text-purple-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">85%</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Good</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('screenings')}
            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'screenings'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
            }`}
          >
            Health Screenings
          </button>
          <button
            onClick={() => setActiveTab('vaccinations')}
            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'vaccinations'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
            }`}
          >
            Vaccinations
          </button>
          <button
            onClick={() => setActiveTab('metrics')}
            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'metrics'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
            }`}
          >
            Health Metrics
          </button>
          <button
            onClick={() => setActiveTab('recommendations')}
            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'recommendations'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
            }`}
          >
            Recommendations
          </button>
        </nav>
      </div>

      {/* Screenings Tab */}
      {activeTab === 'screenings' && (
        <div className="space-y-4">
          {screenings.map((screening) => (
            <div key={screening.id} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {screening.name}
                    </h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(screening.status)}`}>
                      {screening.status.replace('-', ' ')}
                    </span>
                    <span className={`text-xs font-medium ${getPriorityColor(screening.priority)}`}>
                      {screening.priority} priority
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    {screening.description}
                  </p>
                  <div className="flex items-center gap-6 text-sm">
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Category: </span>
                      <span className="text-gray-900 dark:text-white">{screening.category}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Frequency: </span>
                      <span className="text-gray-900 dark:text-white">{screening.frequency}</span>
                    </div>
                    {screening.lastCompleted && (
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Last: </span>
                        <span className="text-gray-900 dark:text-white">
                          {new Date(screening.lastCompleted).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Next Due: </span>
                      <span className="text-gray-900 dark:text-white font-medium">
                        {new Date(screening.nextDue).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  Schedule
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Vaccinations Tab */}
      {activeTab === 'vaccinations' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {vaccinations.map((vaccine) => (
            <div key={vaccine.id} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {vaccine.name}
                </h3>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(vaccine.status)}`}>
                  {vaccine.status}
                </span>
              </div>
              {vaccine.series && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{vaccine.series}</p>
              )}
              <div className="space-y-2 text-sm">
                {vaccine.lastDose && (
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Last Dose: </span>
                    <span className="text-gray-900 dark:text-white">
                      {new Date(vaccine.lastDose).toLocaleDateString()}
                    </span>
                  </div>
                )}
                {vaccine.nextDose && (
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Next Dose: </span>
                    <span className="text-gray-900 dark:text-white font-medium">
                      {new Date(vaccine.nextDose).toLocaleDateString()}
                    </span>
                  </div>
                )}
                {vaccine.notes && (
                  <p className="text-gray-600 dark:text-gray-400 italic">{vaccine.notes}</p>
                )}
              </div>
              {vaccine.status !== 'complete' && (
                <button className="mt-4 w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  Schedule Vaccination
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Health Metrics Tab */}
      {activeTab === 'metrics' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {healthMetrics.map((metric, index) => (
            <div key={index} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {metric.name}
                </h3>
                {metric.trend && (
                  <div className={`flex items-center ${
                    metric.trend === 'up' ? 'text-red-500' : 
                    metric.trend === 'down' ? 'text-green-500' : 
                    'text-gray-500'
                  }`}>
                    {metric.trend === 'up' && '↑'}
                    {metric.trend === 'down' && '↓'}
                    {metric.trend === 'stable' && '→'}
                  </div>
                )}
              </div>
              <div className="text-center py-4">
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {metric.value}
                  {metric.unit && <span className="text-lg text-gray-600 dark:text-gray-400 ml-1">{metric.unit}</span>}
                </p>
                <span className={`inline-block mt-2 px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(metric.status)}`}>
                  {metric.status}
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                Last updated: {new Date(metric.lastUpdated).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Recommendations Tab */}
      {activeTab === 'recommendations' && (
        <div className="space-y-6">
          {/* Risk Factors */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Risk Factors
            </h3>
            <div className="space-y-3">
              {riskFactors.map((factor, index) => (
                <div key={index} className="flex items-center gap-3">
                  <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />
                  <span className="text-gray-700 dark:text-gray-300">{factor}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Personalized Recommendations */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Personalized Recommendations
            </h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <SparklesIcon className="h-6 w-6 text-blue-500 mt-0.5" />
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    Schedule Your Overdue Screenings
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    You have 1 overdue screening. Book your skin cancer screening appointment as soon as possible.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <SparklesIcon className="h-6 w-6 text-blue-500 mt-0.5" />
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    Monitor Cholesterol Levels
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Your cholesterol is slightly elevated. Consider dietary changes and schedule a follow-up test in 3 months.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <SparklesIcon className="h-6 w-6 text-blue-500 mt-0.5" />
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    Increase Physical Activity
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    To address sedentary lifestyle concerns, aim for at least 150 minutes of moderate exercise per week.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <SparklesIcon className="h-6 w-6 text-blue-500 mt-0.5" />
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    Consider Shingles Vaccination
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Based on your age, you may be eligible for the shingles vaccine. Discuss with your healthcare provider.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Preventive Care Schedule */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-6 rounded-lg">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Your Preventive Care Schedule
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Next 3 Months</h4>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2 text-sm">
                    <CalendarDaysIcon className="h-4 w-4 text-blue-600" />
                    <span className="text-gray-700 dark:text-gray-300">Dental Checkup - March 2025</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <CalendarDaysIcon className="h-4 w-4 text-blue-600" />
                    <span className="text-gray-700 dark:text-gray-300">Cholesterol Screening - March 2025</span>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Rest of Year</h4>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2 text-sm">
                    <CalendarDaysIcon className="h-4 w-4 text-purple-600" />
                    <span className="text-gray-700 dark:text-gray-300">Eye Exam - June 2025</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <CalendarDaysIcon className="h-4 w-4 text-purple-600" />
                    <span className="text-gray-700 dark:text-gray-300">Flu Vaccine - October 2025</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <CalendarDaysIcon className="h-4 w-4 text-purple-600" />
                    <span className="text-gray-700 dark:text-gray-300">Annual Physical - November 2025</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}