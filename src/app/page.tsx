'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { LazyLoad } from '@/components/ui/lazy/LazyLoad';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
// Replacing missing import with proper utility
import { classNames } from '@/lib/utils/classNames';

// Types
interface AppCategory {
  id: string;
  name: string;
  applications: Application[];
}

interface Application {
  id: string;
  name: string;
  description: string;
  thumbnailUrl: string;
  color: string;
}

interface WidgetConfig {
  id: string;
  type: 'balance' | 'chart' | 'list' | 'calendar' | 'progress' | 'reminder';
  title: string;
  size: 'small' | 'medium' | 'large';
  source?: string;
  timeframe?: 'day' | 'week' | 'month' | 'quarter' | 'year' | 'all';
}

interface FinancialAccount {
  id: string;
  name: string;
  type: string;
  balance: number;
  currency: string;
  lastUpdated: string;
}

interface Appointment {
  id: string;
  title: string;
  date: string;
  time: string;
  provider: string;
  location: string;
  type: string;
}

interface Task {
  id: string;
  title: string;
  due: string;
  priority: 'low' | 'medium' | 'high';
  completed: boolean;
  category: string;
}

// Sample data
const appCategories: AppCategory[] = [
  {
    id: 'finance',
    name: 'Finance',
    applications: [
      {
        id: 'budget-planner',
        name: 'Budget Planner',
        description: 'Plan and track your monthly expenses',
        thumbnailUrl: '/images/thumbnails/budget-planner.jpg',
        color: 'bg-blue-500',
      },
      // Other finance apps...
    ],
  },
  // Other categories...
];

const financialAccounts: FinancialAccount[] = [
  {
    id: 'checking-1',
    name: 'Primary Checking',
    type: 'checking',
    balance: 4285.75,
    currency: 'USD',
    lastUpdated: '2025-05-01T08:30:00Z',
  },
  {
    id: 'savings-1',
    name: 'Emergency Fund',
    type: 'savings',
    balance: 12750.42,
    currency: 'USD',
    lastUpdated: '2025-05-01T08:30:00Z',
  },
  {
    id: 'investment-1',
    name: 'Retirement Portfolio',
    type: 'investment',
    balance: 187432.18,
    currency: 'USD',
    lastUpdated: '2025-04-30T16:00:00Z',
  },
  {
    id: 'credit-1',
    name: 'Credit Card',
    type: 'credit',
    balance: -1243.87,
    currency: 'USD',
    lastUpdated: '2025-05-01T08:30:00Z',
  },
];

const upcomingAppointments: Appointment[] = [
  {
    id: 'appt-1',
    title: 'Annual Physical',
    date: '2025-05-15',
    time: '10:00 AM',
    provider: 'Dr. Sarah Johnson',
    location: 'Memorial Health Center',
    type: 'medical',
  },
  {
    id: 'appt-2',
    title: 'Dental Cleaning',
    date: '2025-05-22',
    time: '2:30 PM',
    provider: 'Dr. Michael Chen',
    location: 'Bright Smile Dental',
    type: 'dental',
  },
  {
    id: 'appt-3',
    title: 'Career Coaching',
    date: '2025-05-08',
    time: '4:00 PM',
    provider: 'Emily Rodriguez',
    location: 'Virtual Meeting',
    type: 'career',
  },
];

const tasks: Task[] = [
  {
    id: 'task-1',
    title: 'Submit healthcare reimbursement form',
    due: '2025-05-07',
    priority: 'high',
    completed: false,
    category: 'health',
  },
  {
    id: 'task-2',
    title: 'Renew professional certification',
    due: '2025-05-30',
    priority: 'medium',
    completed: false,
    category: 'career',
  },
  {
    id: 'task-3',
    title: 'Review retirement contribution allocation',
    due: '2025-05-10',
    priority: 'medium',
    completed: false,
    category: 'finance',
  },
  {
    id: 'task-4',
    title: 'Enroll in advanced data science course',
    due: '2025-05-15',
    priority: 'low',
    completed: false,
    category: 'education',
  },
];

// Default widgets
const defaultWidgets: WidgetConfig[] = [
  {
    id: 'widget-1',
    type: 'balance',
    title: 'Financial Summary',
    size: 'medium',
    source: 'all',
  },
  {
    id: 'widget-2',
    type: 'chart',
    title: 'Net Worth Trend',
    size: 'large',
    timeframe: 'year',
  },
  {
    id: 'widget-3',
    type: 'list',
    title: 'Upcoming Appointments',
    size: 'medium',
    source: 'appointments',
  },
  {
    id: 'widget-4',
    type: 'reminder',
    title: 'Tasks & Reminders',
    size: 'medium',
    source: 'tasks',
  },
  {
    id: 'widget-5',
    type: 'progress',
    title: 'Learning Progress',
    size: 'small',
    source: 'education',
  },
  {
    id: 'widget-6',
    type: 'calendar',
    title: 'Work Schedule',
    size: 'medium',
    source: 'work',
  },
];

// Helper function for chart data
function generateRandomData(count: number, min: number, max: number): number[] {
  return Array.from({length: count}, () => 
      Math.floor(Math.random() * (max - min + 1)) + min
  );
}

// Widget Component
const Widget: React.FC<{
  config: WidgetConfig;
  onRemove: () => void;
  timeframe: string;
  financialAccounts: FinancialAccount[];
  appointments: Appointment[];
  tasks: Task[];
}> = ({ config, onRemove, timeframe, financialAccounts, appointments, tasks }) => {
  // Size classes mapping
  const sizeClasses = {
    small: "col-span-1",
    medium: "col-span-1 md:col-span-1",
    large: "col-span-1 md:col-span-2",
  };

  // Render widget content based on type
  const renderWidgetContent = () => {
    switch (config.type) {
      case 'balance':
        return <FinancialBalanceWidget accounts={financialAccounts} />;
      case 'chart':
        return <ChartWidget title={config.title} timeframe={timeframe as any} />;
      case 'list':
        return config.source === 'appointments' 
          ? <AppointmentListWidget appointments={appointments} /> 
          : <div>Generic List Widget</div>;
      case 'calendar':
        return <CalendarWidget title={config.title} />;
      case 'progress':
        return <ProgressWidget title={config.title} />;
      case 'reminder':
        return <TaskReminderWidget tasks={tasks} />;
      default:
        return <div>Unknown widget type</div>;
    }
  };

  return (
    <div className={`${sizeClasses[config.size]} bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden`}>
      <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="font-medium text-gray-800 dark:text-white">{config.title}</h3>
        <button 
          onClick={onRemove}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          title="Remove widget"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      <div className="p-4">
        {renderWidgetContent()}
      </div>
    </div>
  );
};

// Financial Balance Widget Component
const FinancialBalanceWidget: React.FC<{
  accounts: FinancialAccount[];
}> = ({ accounts }) => {
  // Calculate totals
  const totalAssets = accounts
    .filter(a => a.type !== 'credit')
    .reduce((sum, account) => sum + account.balance, 0);
    
  const totalLiabilities = accounts
    .filter(a => a.type === 'credit')
    .reduce((sum, account) => sum + Math.abs(account.balance), 0);
    
  const netWorth = totalAssets - totalLiabilities;

  return (
    <div>
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <p className="text-sm text-gray-500 dark:text-gray-400">Net Worth</p>
          <p className={`text-lg font-bold ${netWorth >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
            ${netWorth.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full" 
            style={{ width: `${(totalAssets / (totalAssets + totalLiabilities)) * 100}%` }}
          ></div>
        </div>
      </div>
      
      <div className="space-y-3">
        {accounts.map(account => (
          <div key={account.id} className="flex justify-between items-center">
            <div>
              <p className="text-sm font-medium text-gray-800 dark:text-white">{account.name}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{account.type.charAt(0).toUpperCase() + account.type.slice(1)}</p>
            </div>
            <p className={`font-medium ${account.type === 'credit' ? 'text-red-600 dark:text-red-400' : 'text-gray-800 dark:text-white'}`}>
              ${Math.abs(account.balance).toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

// Chart Widget Component
const ChartWidget: React.FC<{
  title: string;
  timeframe: 'day' | 'week' | 'month' | 'quarter' | 'year' | 'all';
}> = ({ title, timeframe }) => {
  // Sample data for different timeframes
  const data = {
    day: generateRandomData(7, 150000, 155000),
    week: generateRandomData(7, 148000, 155000),
    month: generateRandomData(8, 145000, 162000),
    quarter: generateRandomData(6, 140000, 165000),
    year: generateRandomData(8, 130000, 165000),
    all: generateRandomData(8, 100000, 165000)
  };

  const selectedData = data[timeframe];
  const maxValue = Math.max(...selectedData);
  const timeLabels = {
    day: 'Today',
    week: 'This Week',
    month: 'This Month',
    quarter: 'This Quarter',
    year: 'This Year',
    all: 'All Time',
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm font-medium text-gray-800 dark:text-white">
          {timeLabels[timeframe]} Overview
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Last updated: May 1, 2025
        </p>
      </div>
      
      <div className="h-48 flex items-end space-x-1">
        {selectedData.map((value, i) => (
          <div key={i} className="flex-1 flex flex-col items-center justify-end">
            <div 
              className="w-full bg-blue-500 hover:bg-blue-600 transition-colors rounded-t"
              style={{ height: `${(value / maxValue) * 100}%` }}
            ></div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {i + 1}
            </p>
          </div>
        ))}
      </div>
      
      <div className="mt-4 flex justify-between text-xs text-gray-500 dark:text-gray-400">
        <p>Starting: ${selectedData[0].toLocaleString()}</p>
        <p>Current: ${selectedData[selectedData.length - 1].toLocaleString()}</p>
      </div>
    </div>
  );
};

// Appointment List Widget Component
const AppointmentListWidget: React.FC<{
  appointments: Appointment[];
}> = ({ appointments }) => {
  return (
    <div className="space-y-3">
      {appointments.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400 text-center py-4">No upcoming appointments</p>
      ) : (
        appointments.map(appointment => (
          <div key={appointment.id} className="border-b border-gray-100 dark:border-gray-700 pb-3 last:border-0 last:pb-0">
            <div className="flex justify-between">
              <p className="font-medium text-gray-800 dark:text-white">{appointment.title}</p>
              <span className={`text-xs px-2 py-1 rounded-full ${
                appointment.type === 'medical' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                appointment.type === 'dental' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
              }`}>
                {appointment.type}
              </span>
            </div>
            <div className="mt-1 flex items-center text-sm text-gray-600 dark:text-gray-300">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {new Date(appointment.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} at {appointment.time}
            </div>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{appointment.provider} • {appointment.location}</p>
          </div>
        ))
      )}
    </div>
  );
};

// Task Reminder Widget Component
const TaskReminderWidget: React.FC<{
  tasks: Task[];
}> = ({ tasks }) => {
  return (
    <div className="space-y-2">
      {tasks.map(task => (
        <div key={task.id} className="flex items-start space-x-3 py-2">
          <div className={`mt-0.5 flex-shrink-0 h-4 w-4 rounded-full border ${
            task.priority === 'high' ? 'border-red-500' :
            task.priority === 'medium' ? 'border-yellow-500' : 'border-green-500'
          } ${task.completed ? 'bg-gray-300 dark:bg-gray-600' : 'bg-white dark:bg-gray-800'}`}></div>
          <div className="flex-1">
            <p className={`text-sm font-medium ${
              task.completed ? 'text-gray-500 line-through' : 'text-gray-800 dark:text-white'
            }`}>
              {task.title}
            </p>
            <div className="flex items-center mt-1">
              <span className={`text-xs px-2 py-0.5 rounded-full mr-2 ${
                task.category === 'health' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                task.category === 'career' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' :
                task.category === 'finance' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
              }`}>
                {task.category}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Due: {new Date(task.due).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// Calendar Widget Component
const CalendarWidget: React.FC<{
  title: string;
}> = ({ title }) => {
  return (
    <div className="text-center py-4">
      <p className="text-gray-500 dark:text-gray-400">Calendar Widget Preview</p>
    </div>
  );
};

// Progress Widget Component
const ProgressWidget: React.FC<{
  title: string;
}> = ({ title }) => {
  return (
    <div className="text-center py-4">
      <p className="text-gray-500 dark:text-gray-400">Progress Widget Preview</p>
    </div>
  );
};

// App Category Row Component
const AppCategoryRow: React.FC<{
  category: AppCategory;
  onAppClick: (app: Application) => void;
}> = ({ category, onAppClick }) => {
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white">{category.name}</h2>
        <button className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors">
          View All
        </button>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {category.applications.map(app => (
          <div 
            key={app.id}
            onClick={() => onAppClick(app)}
            className="aspect-video bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
          >
            <div className="relative h-24">
              {app.thumbnailUrl ? (
                <Image
                  src={app.thumbnailUrl}
                  alt={app.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className={classNames(`w-full h-full flex items-center justify-center`, app.color)}>
                  <span className="text-2xl font-bold text-white">{app.name.charAt(0)}</span>
                </div>
              )}
            </div>
            <div className="p-3">
              <h3 className="font-medium text-gray-800 dark:text-white mb-1">{app.name}</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">{app.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Integration Modal Component
const IntegrationModal: React.FC<{
  onClose: () => void;
}> = ({ onClose }) => {
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Integration categories
  const categories = [
    'All', 
    'Finance', 
    'Career', 
    'Education', 
    'Healthcare', 
    'Productivity', 
    'Social'
  ];
  
  // Sample integration apps with more details
  const integrationApps = [
    { 
      id: 'chase', 
      name: 'Chase Bank', 
      description: 'Connect your Chase accounts',
      icon: 'chase',
      category: 'Finance',
      popular: true
    },
    { 
      id: 'bofa', 
      name: 'Bank of America', 
      description: 'Connect your Bank of America accounts',
      icon: 'bofa',
      category: 'Finance' 
    },
    { 
      id: 'vanguard', 
      name: 'Vanguard', 
      description: 'Connect your investment accounts',
      icon: 'vanguard',
      category: 'Finance',
      popular: true
    },
    { 
      id: 'fidelity', 
      name: 'Fidelity', 
      description: 'Connect your retirement accounts',
      icon: 'fidelity',
      category: 'Finance' 
    },
    { 
      id: 'robinhood', 
      name: 'Robinhood', 
      description: 'Connect your investment portfolio',
      icon: 'robinhood',
      category: 'Finance' 
    },
    { 
      id: 'linkedin', 
      name: 'LinkedIn', 
      description: 'Connect for job recommendations',
      icon: 'linkedin',
      category: 'Career',
      popular: true
    },
    { 
      id: 'indeed', 
      name: 'Indeed', 
      description: 'Track your job applications',
      icon: 'indeed',
      category: 'Career' 
    },
    { 
      id: 'glassdoor', 
      name: 'Glassdoor', 
      description: 'Access salary insights',
      icon: 'glassdoor',
      category: 'Career' 
    },
    { 
      id: 'udemy', 
      name: 'Udemy', 
      description: 'Track your course progress',
      icon: 'udemy',
      category: 'Education',
      popular: true
    },
    { 
      id: 'coursera', 
      name: 'Coursera', 
      description: 'Access your certifications',
      icon: 'coursera',
      category: 'Education' 
    },
    { 
      id: 'khan', 
      name: 'Khan Academy', 
      description: 'Track your learning journey',
      icon: 'khan',
      category: 'Education' 
    },
    { 
      id: 'epic', 
      name: 'Epic MyChart', 
      description: 'Access your health records',
      icon: 'epic',
      category: 'Healthcare',
      popular: true
    },
    { 
      id: 'fitbit', 
      name: 'Fitbit', 
      description: 'Connect your health data',
      icon: 'fitbit',
      category: 'Healthcare',
      popular: true
    },
    { 
      id: 'apple', 
      name: 'Apple Health', 
      description: 'Sync your health metrics',
      icon: 'apple',
      category: 'Healthcare' 
    },
    { 
      id: 'google', 
      name: 'Google Calendar', 
      description: 'Sync your schedule',
      icon: 'google',
      category: 'Productivity',
      popular: true
    },
    { 
      id: 'outlook', 
      name: 'Outlook', 
      description: 'Connect your work calendar',
      icon: 'outlook',
      category: 'Productivity' 
    },
    { 
      id: 'slack', 
      name: 'Slack', 
      description: 'Stay connected to your teams',
      icon: 'slack',
      category: 'Productivity' 
    },
    { 
      id: 'twitter', 
      name: 'Twitter', 
      description: 'Connect your social profile',
      icon: 'twitter',
      category: 'Social' 
    },
    { 
      id: 'instagram', 
      name: 'Instagram', 
      description: 'Share your milestones',
      icon: 'instagram',
      category: 'Social' 
    }
  ];
  
  // Filter integrations based on active category and search query
  const filteredIntegrations = integrationApps.filter(app => {
    const matchesCategory = activeCategory === 'All' || app.category === activeCategory;
    const matchesSearch = searchQuery === '' || 
      app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.category.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesCategory && matchesSearch;
  });
  
  // Get popular integrations
  const popularIntegrations = integrationApps.filter(app => app.popular);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 fade-in">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-4xl w-full max-h-[80vh] overflow-hidden">
        {/* Modal header */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white">Connect Integrations</h3>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            aria-label="Close modal"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Modal content */}
        <div className="p-6 overflow-y-auto max-h-[calc(80vh-8rem)]">
          {/* Search input */}
          <div className="mb-6">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Search integrations..."
                aria-label="Search integrations"
              />
            </div>
          </div>
          
          {/* Category tabs */}
          <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
            <ul className="flex flex-wrap -mb-px text-sm font-medium text-center">
              {categories.map(category => (
                <li key={category} className="mr-2">
                  <button
                    onClick={() => setActiveCategory(category)}
                    className={classNames(
                      'inline-block p-4 border-b-2 rounded-t-lg',
                      activeCategory === category
                        ? 'border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400'
                        : 'border-transparent hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300'
                    )}
                  >
                    {category}
                  </button>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Popular integrations (shown when no search) */}
          {searchQuery === '' && activeCategory === 'All' && (
            <div className="mb-8">
              <h4 className="text-lg font-medium text-gray-800 dark:text-white mb-4">Popular Integrations</h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {popularIntegrations.map(app => (
                  <div 
                    key={app.id} 
                    className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors border border-transparent hover:border-blue-200 dark:hover:border-blue-800"
                  >
                    <div className="h-12 w-12 mb-3 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                      <span className="text-xl font-bold text-gray-700 dark:text-gray-300">{app.name.charAt(0)}</span>
                    </div>
                    <h4 className="font-medium text-gray-800 dark:text-white text-center">{app.name}</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-center">{app.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Filtered integrations */}
          <div>
            <h4 className="text-lg font-medium text-gray-800 dark:text-white mb-4">
              {searchQuery || activeCategory !== 'All' ? 'Matching Integrations' : 'All Integrations'}
            </h4>
            
            {filteredIntegrations.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {filteredIntegrations.map(app => (
                  <div 
                    key={app.id} 
                    className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors border border-transparent hover:border-blue-200 dark:hover:border-blue-800"
                  >
                    <div className="h-12 w-12 mb-3 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                      <span className="text-xl font-bold text-gray-700 dark:text-gray-300">{app.name.charAt(0)}</span>
                    </div>
                    <h4 className="font-medium text-gray-800 dark:text-white text-center">{app.name}</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-center">{app.description}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-lg font-medium">No matching integrations found</p>
                <p className="mt-1">Try a different search term or category</p>
              </div>
            )}
          </div>
        </div>
        
        {/* Modal footer */}
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end">
          <button 
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors mr-2"
          >
            Cancel
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
            Connect Selected
          </button>
        </div>
      </div>
    </div>
  );
};

// Widget Modal Component
const WidgetModal: React.FC<{
  onClose: () => void;
  onAddWidget: (widget: WidgetConfig) => void;
  existingWidgets: WidgetConfig[];
}> = ({ onClose, onAddWidget, existingWidgets }) => {
  const [widgetType, setWidgetType] = useState<WidgetConfig['type']>('balance');
  const [widgetTitle, setWidgetTitle] = useState('New Widget');
  const [widgetSize, setWidgetSize] = useState<WidgetConfig['size']>('medium');
  const [widgetSource, setWidgetSource] = useState('all');
  
  const handleAddWidget = () => {
    const newWidget: WidgetConfig = {
      id: `widget-${Date.now()}`,
      type: widgetType,
      title: widgetTitle,
      size: widgetSize,
      source: widgetSource,
    };
    
    onAddWidget(newWidget);
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 fade-in">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Add New Widget</h3>
        </div>
        
        <div className="p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Widget Type
              </label>
              <select
                value={widgetType}
                onChange={(e) => setWidgetType(e.target.value as WidgetConfig['type'])}
                className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md p-2 text-gray-900 dark:text-white"
                aria-label="Widget Type"
              >
                <option value="balance">Financial Balance</option>
                <option value="chart">Chart/Graph</option>
                <option value="list">List View</option>
                <option value="calendar">Calendar</option>
                <option value="progress">Progress Tracker</option>
                <option value="reminder">Reminders</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Widget Title
              </label>
              <input
                type="text"
                value={widgetTitle}
                onChange={(e) => setWidgetTitle(e.target.value)}
                className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md p-2 text-gray-900 dark:text-white"
                aria-label="Widget Title"
                placeholder="Enter widget title"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Widget Size
              </label>
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="widgetSize"
                    value="small"
                    checked={widgetSize === 'small'}
                    onChange={() => setWidgetSize('small')}
                    className="mr-2"
                  />
                  <span className="text-gray-700 dark:text-gray-300">Small</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="widgetSize"
                    value="medium"
                    checked={widgetSize === 'medium'}
                    onChange={() => setWidgetSize('medium')}
                    className="mr-2"
                  />
                  <span className="text-gray-700 dark:text-gray-300">Medium</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="widgetSize"
                    value="large"
                    checked={widgetSize === 'large'}
                    onChange={() => setWidgetSize('large')}
                    className="mr-2"
                  />
                  <span className="text-gray-700 dark:text-gray-300">Large</span>
                </label>
              </div>
            </div>
            
            {(widgetType === 'balance' || widgetType === 'list') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Data Source
                </label>
                <select
                  value={widgetSource}
                  onChange={(e) => setWidgetSource(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md p-2 text-gray-900 dark:text-white"
                  aria-label="Data Source"
                >
                  <option value="all">All Sources</option>
                  <option value="accounts">Financial Accounts</option>
                  <option value="appointments">Appointments</option>
                  <option value="tasks">Tasks & Reminders</option>
                  <option value="education">Education</option>
                  <option value="work">Work</option>
                </select>
              </div>
            )}
          </div>
        </div>
        
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end">
          <button 
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors mr-2"
          >
            Cancel
          </button>
          <button 
            onClick={handleAddWidget}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Add Widget
          </button>
        </div>
      </div>
    </div>
  );
};

// Main Dashboard Component
export default function DashboardPage() {
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [showIntegrationModal, setShowIntegrationModal] = useState(false);
  const [showWidgetModal, setShowWidgetModal] = useState(false);
  const [widgets, setWidgets] = useState<WidgetConfig[]>(defaultWidgets);
  const [selectedTimeframe, setSelectedTimeframe] = useState<'day' | 'week' | 'month' | 'quarter' | 'year' | 'all'>('month');

  // Toggle integration modal
  const toggleIntegrationModal = () => {
    setShowIntegrationModal(!showIntegrationModal);
  };

  // Toggle widget customization modal
  const toggleWidgetModal = () => {
    setShowWidgetModal(!showWidgetModal);
  };

  // Handle app selection
  const openApp = (app: Application) => {
    setSelectedApp(app);
  };

  // Navigate back from app
  const closeApp = () => {
    setSelectedApp(null);
  };

  // Add a new widget
  const addWidget = (widget: WidgetConfig) => {
    setWidgets([...widgets, widget]);
    setShowWidgetModal(false);
  };

  // Remove a widget
  const removeWidget = (widgetId: string) => {
    setWidgets(widgets.filter(w => w.id !== widgetId));
  };

  // Update timeframe for charts/trends
  const updateTimeframe = (timeframe: 'day' | 'week' | 'month' | 'quarter' | 'year' | 'all') => {
    setSelectedTimeframe(timeframe);
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      {selectedApp ? (
        // App view when an app is selected
        <div className="h-screen flex flex-col">
          {/* App header */}
          <div className="bg-white dark:bg-gray-800 shadow py-3 px-4 flex items-center justify-between">
            <button 
              onClick={closeApp}
              className="flex items-center text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              Back to Dashboard
            </button>
            <h1 className="text-lg font-semibold text-gray-800 dark:text-white">{selectedApp.name}</h1>
            <div className="w-24"></div> {/* Spacer for alignment */}
          </div>
          
          {/* App content */}
          <div className="flex-1 bg-gray-50 dark:bg-gray-900 p-4">
            <div className="h-full rounded-lg border border-gray-200 dark:border-gray-700">
              {/* App content would be loaded here */}
              <div className="p-8 text-center">
                <div className={`mx-auto h-24 w-24 rounded-full flex items-center justify-center ${selectedApp.color} text-white mb-4`}>
                  <span className="text-3xl font-bold">{selectedApp.name.charAt(0)}</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">{selectedApp.name}</h2>
                <p className="text-gray-600 dark:text-gray-300 mb-6">{selectedApp.description}</p>
                <p className="text-gray-500 dark:text-gray-400">This is where the {selectedApp.name} application would be loaded.</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        // Main dashboard
        <div className="container mx-auto px-4 py-8">
          {/* Dashboard header */}
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Life Navigator</h1>
            <div className="flex items-center space-x-4">
              <button 
                onClick={toggleWidgetModal}
                className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                title="Customize Dashboard"
                aria-label="Customize Dashboard"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                </svg>
              </button>
              <button 
                className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                title="Notifications"
                aria-label="Notifications"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </button>
              <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
                TR
              </div>
            </div>
          </div>

          {/* Timeframe selector for charts/trends */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 mb-6">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-medium text-gray-800 dark:text-white">Dashboard Overview</h2>
              <div className="flex space-x-2">
                <select 
                  value={selectedTimeframe}
                  onChange={(e) => updateTimeframe(e.target.value as any)}
                  className="bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-md p-2"
                  aria-label="Select timeframe"
                >
                  <option value="day">Daily</option>
                  <option value="week">Weekly</option>
                  <option value="month">Monthly</option>
                  <option value="quarter">Quarterly</option>
                  <option value="year">Yearly</option>
                  <option value="all">All Time</option>
                </select>
              </div>
            </div>
          </div>

          {/* Widgets Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
            {widgets.map((widget) => (
              <Widget 
                key={widget.id} 
                config={widget} 
                onRemove={() => removeWidget(widget.id)}
                timeframe={selectedTimeframe}
                financialAccounts={financialAccounts}
                appointments={upcomingAppointments}
                tasks={tasks}
              />
            ))}
          </div>

          {/* App categories */}
          <div className="space-y-12">
            {appCategories.map((category) => (
              <AppCategoryRow 
                key={category.id} 
                category={category} 
                onAppClick={openApp} 
              />
            ))}
            
            {/* Integration section */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Integrations</h2>
                <button 
                  onClick={toggleIntegrationModal}
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
                >
                  View All
                </button>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                <div 
                  onClick={toggleIntegrationModal}
                  className="aspect-video bg-gray-200 dark:bg-gray-800 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-500 dark:text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Add Integration</p>
                </div>
                
                {/* Sample integrations */}
                <div className="aspect-video bg-gray-100 dark:bg-gray-800 rounded-lg p-4 flex flex-col items-center justify-center">
                  <div className="h-8 w-8 rounded-full bg-[#1DB954] mb-2 flex items-center justify-center">
                    <span className="text-white font-bold text-sm">S</span>
                  </div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Spotify</p>
                </div>
                
                <div className="aspect-video bg-gray-100 dark:bg-gray-800 rounded-lg p-4 flex flex-col items-center justify-center">
                  <div className="h-8 w-8 rounded-full bg-[#00B0B9] mb-2 flex items-center justify-center">
                    <span className="text-white font-bold text-sm">F</span>
                  </div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Fitbit</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Integration modal */}
          {showIntegrationModal && (
            <IntegrationModal onClose={toggleIntegrationModal} />
          )}
          
          {/* Widget customization modal */}
          {showWidgetModal && (
            <WidgetModal 
              onClose={toggleWidgetModal} 
              onAddWidget={addWidget}
              existingWidgets={widgets}
            />
          )}
        </div>
      )}
    </div>
  );
}