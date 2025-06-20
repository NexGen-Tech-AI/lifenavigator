'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence, useDragControls } from 'framer-motion';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
  Scatter
} from 'recharts';
import {
  HomeIcon,
  BriefcaseIcon,
  UserGroupIcon,
  HeartIcon,
  AcademicCapIcon,
  BuildingOfficeIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  PlusCircleIcon,
  TrashIcon,
  PlayIcon,
  PauseIcon,
  ArrowPathIcon,
  BookmarkIcon,
  ShareIcon,
  DocumentArrowDownIcon,
  AdjustmentsHorizontalIcon,
  SparklesIcon,
  MapIcon,
  CalendarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  InformationCircleIcon,
  LightBulbIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CogIcon,
  ClockIcon,
  LinkIcon,
  DocumentDuplicateIcon,
  EyeIcon,
  PencilIcon,
  XMarkIcon,
  FolderOpenIcon,
  ArrowTrendingUpIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';
import { useAccounts } from '@/hooks/useAccounts';
import { RiskAnalysisService } from '@/lib/services/riskAnalysisService';
import { ReportGeneratorService } from '@/lib/services/reportGeneratorService';
import { RiskDashboard } from './RiskDashboard';

// Types
interface LifeEvent {
  id: string;
  type: 'career' | 'financial' | 'family' | 'health' | 'education' | 'lifestyle';
  name: string;
  date: Date;
  amount?: number;
  frequency?: 'once' | 'monthly' | 'yearly';
  dependencies: string[];
  impacts: {
    income?: number;
    expenses?: number;
    assets?: number;
    liabilities?: number;
    healthScore?: number;
    stressLevel?: number;
    goalProgress?: Record<string, number>;
  };
  parameters: Record<string, any>;
  position?: { x: number; y: number };
}

interface FinancialSnapshot {
  date: Date;
  netWorth: number;
  income: number;
  expenses: number;
  assets: number;
  liabilities: number;
  emergencyFund: number;
  healthScore: number;
  stressLevel: number;
  cashFlow: number;
  goalProgress: Record<string, number>;
}

interface SimulationScenario {
  id: string;
  name: string;
  description: string;
  events: LifeEvent[];
  snapshots: FinancialSnapshot[];
  createdAt: Date;
  updatedAt: Date;
  tags: string[];
}


// Event Templates
const eventTemplates = [
  { 
    type: 'career' as const, 
    name: 'Salary Raise', 
    icon: <BriefcaseIcon className="h-5 w-5" />,
    defaultParams: { percentage: 10 }
  },
  { 
    type: 'career' as const, 
    name: 'Job Change', 
    icon: <BriefcaseIcon className="h-5 w-5" />,
    defaultParams: { newSalary: 100000, movingCost: 5000 }
  },
  { 
    type: 'financial' as const, 
    name: 'Buy Home', 
    icon: <HomeIcon className="h-5 w-5" />,
    defaultParams: { price: 400000, downPayment: 80000, mortgageRate: 6.5 }
  },
  { 
    type: 'family' as const, 
    name: 'Have Child', 
    icon: <UserGroupIcon className="h-5 w-5" />,
    defaultParams: { monthlyChildcare: 1500, medicalCosts: 5000 }
  },
  { 
    type: 'family' as const, 
    name: 'Get Married', 
    icon: <HeartIcon className="h-5 w-5" />,
    defaultParams: { weddingCost: 25000, spouseIncome: 60000 }
  },
  { 
    type: 'education' as const, 
    name: 'MBA Program', 
    icon: <AcademicCapIcon className="h-5 w-5" />,
    defaultParams: { tuition: 120000, duration: 24, incomeReduction: 100 }
  },
  { 
    type: 'career' as const, 
    name: 'Start Business', 
    icon: <BuildingOfficeIcon className="h-5 w-5" />,
    defaultParams: { investment: 50000, monthlyBurn: 5000, projectedRevenue: 10000 }
  },
  { 
    type: 'financial' as const, 
    name: 'Investment Income', 
    icon: <ChartBarIcon className="h-5 w-5" />,
    defaultParams: { monthlyDividends: 500, capitalGains: 10000 }
  }
];

// Utility Functions
const getEventColor = (type: LifeEvent['type']) => {
  const colors = {
    career: 'blue',
    financial: 'green',
    family: 'purple',
    health: 'red',
    education: 'yellow',
    lifestyle: 'pink'
  };
  return colors[type] || 'gray';
};

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    year: 'numeric'
  }).format(date);
};

// Components
const DraggableEvent: React.FC<{
  template: typeof eventTemplates[0];
  onDrop: (template: typeof eventTemplates[0], position: { x: number; y: number }) => void;
}> = ({ template }) => {
  const [{ isDragging }, drag] = useDrag({
    type: 'event',
    item: { template },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  return (
    <div ref={drag}>
      <motion.div
        className={`p-2 sm:p-3 rounded-lg border-2 border-dashed cursor-move ${
          isDragging ? 'opacity-50' : 'opacity-100'
        } border-${getEventColor(template.type)}-300 bg-${getEventColor(template.type)}-50 
        dark:bg-${getEventColor(template.type)}-900/20 hover:shadow-md transition-all`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <div className="flex items-center gap-2">
          <div className={`text-${getEventColor(template.type)}-600 dark:text-${getEventColor(template.type)}-400 flex-shrink-0`}>
            {React.cloneElement(template.icon, { className: "h-5 w-5 sm:h-6 sm:w-6" })}
          </div>
          <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
            {template.name}
          </span>
        </div>
      </motion.div>
    </div>
  );
};

const TimelineCanvas: React.FC<{
  events: LifeEvent[];
  onEventUpdate: (id: string, updates: Partial<LifeEvent>) => void;
  onEventDelete: (id: string) => void;
  onEventClick: (event: LifeEvent) => void;
  onDrop: (template: typeof eventTemplates[0], position: { x: number; y: number }) => void;
}> = ({ events, onEventUpdate, onEventDelete, onEventClick, onDrop }) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [, drop] = useDrop({
    accept: 'event',
    drop: (item: { template: typeof eventTemplates[0] }, monitor) => {
      if (canvasRef.current) {
        const offset = monitor.getClientOffset();
        const canvasRect = canvasRef.current.getBoundingClientRect();
        if (offset) {
          const position = {
            x: offset.x - canvasRect.left,
            y: offset.y - canvasRect.top
          };
          onDrop(item.template, position);
        }
      }
    },
  });

  return (
    <div
      ref={(node) => {
        canvasRef.current = node;
        drop(node);
      }}
      className="relative h-64 sm:h-80 md:h-96 bg-gray-50 dark:bg-gray-900 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700 overflow-hidden"
    >
      {/* Timeline grid */}
      <div className="absolute inset-0 grid grid-cols-6 sm:grid-cols-12 gap-0 pointer-events-none">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className={`border-r border-gray-200 dark:border-gray-800 ${i % 2 !== 0 ? 'hidden sm:block' : ''}`}>
            <div className="text-xs text-gray-500 p-1 truncate">
              {new Date(Date.now() + i * 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short' })}
            </div>
          </div>
        ))}
      </div>

      {/* Events */}
      <AnimatePresence>
        {events.map((event) => (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            drag
            dragMomentum={false}
            onDragEnd={(e, info) => {
              onEventUpdate(event.id, {
                position: {
                  x: (event.position?.x || 0) + info.offset.x,
                  y: (event.position?.y || 0) + info.offset.y
                }
              });
            }}
            className={`absolute p-2 sm:p-3 rounded-lg shadow-lg cursor-pointer bg-white dark:bg-gray-800 
              border-2 border-${getEventColor(event.type)}-400`}
            style={{
              left: event.position?.x || 50,
              top: event.position?.y || 50,
              minWidth: '120px'
            }}
            whileHover={{ scale: 1.05, zIndex: 10 }}
            onClick={() => onEventClick(event)}
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className={`text-${getEventColor(event.type)}-600`}>
                  {eventTemplates.find(t => t.name === event.name)?.icon}
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">
                    {event.name}
                  </p>
                  <p className="text-xs text-gray-500 hidden sm:block">
                    {formatDate(event.date)}
                  </p>
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEventDelete(event.id);
                }}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              >
                <XMarkIcon className="h-4 w-4 text-gray-500" />
              </button>
            </div>
            
            {/* Dependency lines */}
            {event.dependencies.map((depId) => {
              const depEvent = events.find(e => e.id === depId);
              if (!depEvent || !depEvent.position || !event.position) return null;
              
              return (
                <svg
                  key={depId}
                  className="absolute pointer-events-none"
                  style={{
                    left: 0,
                    top: 0,
                    width: '1000px',
                    height: '1000px',
                    transform: 'translate(-500px, -500px)'
                  }}
                >
                  <line
                    x1={500}
                    y1={500}
                    x2={500 + (depEvent.position.x - event.position.x)}
                    y2={500 + (depEvent.position.y - event.position.y)}
                    stroke="#9CA3AF"
                    strokeWidth="2"
                    strokeDasharray="5,5"
                    markerEnd="url(#arrowhead)"
                  />
                  <defs>
                    <marker
                      id="arrowhead"
                      markerWidth="10"
                      markerHeight="7"
                      refX="9"
                      refY="3.5"
                      orient="auto"
                    >
                      <polygon
                        points="0 0, 10 3.5, 0 7"
                        fill="#9CA3AF"
                      />
                    </marker>
                  </defs>
                </svg>
              );
            })}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

const EventConfigModal: React.FC<{
  event: LifeEvent | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (event: LifeEvent) => void;
  allEvents: LifeEvent[];
}> = ({ event, isOpen, onClose, onSave, allEvents }) => {
  const [editedEvent, setEditedEvent] = useState<LifeEvent | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    setEditedEvent(event);
  }, [event]);

  if (!isOpen || !editedEvent) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg bg-${getEventColor(editedEvent.type)}-100 
                  dark:bg-${getEventColor(editedEvent.type)}-900/20`}>
                  <div className={`text-${getEventColor(editedEvent.type)}-600 
                    dark:text-${getEventColor(editedEvent.type)}-400`}>
                    {eventTemplates.find(t => t.name === editedEvent.name)?.icon}
                  </div>
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {editedEvent.name}
                  </h2>
                  <p className="text-sm text-gray-500">Configure event parameters</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                <XMarkIcon className="h-5 w-5 text-gray-500" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Basic Parameters */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Event Date
                </label>
                <input
                  type="date"
                  value={editedEvent.date.toISOString().split('T')[0]}
                  onChange={(e) => {
                    const dateValue = e.target.value;
                    // Only update if we have a valid date string
                    if (dateValue) {
                      const newDate = new Date(dateValue);
                      // Check if the date is valid
                      if (!isNaN(newDate.getTime())) {
                        setEditedEvent({
                          ...editedEvent,
                          date: newDate
                        });
                      }
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                />
              </div>

              {/* Dynamic parameters based on event type */}
              {Object.entries(editedEvent.parameters).map(([key, value]) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
                  </label>
                  <input
                    type={typeof value === 'number' ? 'number' : 'text'}
                    value={value}
                    onChange={(e) => {
                      const newValue = e.target.value;
                      if (typeof value === 'number') {
                        // For number inputs, only update if valid number or empty
                        const parsed = parseFloat(newValue);
                        if (!isNaN(parsed) || newValue === '') {
                          setEditedEvent({
                            ...editedEvent,
                            parameters: {
                              ...editedEvent.parameters,
                              [key]: newValue === '' ? 0 : parsed
                            }
                          });
                        }
                      } else {
                        // For text inputs, update directly
                        setEditedEvent({
                          ...editedEvent,
                          parameters: {
                            ...editedEvent.parameters,
                            [key]: newValue
                          }
                        });
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                  />
                </div>
              ))}

              {/* Dependencies */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Dependencies
                </label>
                <select
                  multiple
                  value={editedEvent.dependencies}
                  onChange={(e) => {
                    const selected = Array.from(e.target.selectedOptions, option => option.value);
                    setEditedEvent({ ...editedEvent, dependencies: selected });
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                >
                  {allEvents
                    .filter(e => e.id !== editedEvent.id)
                    .map(e => (
                      <option key={e.id} value={e.id}>
                        {e.name} - {formatDate(e.date)}
                      </option>
                    ))
                  }
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Hold Ctrl/Cmd to select multiple dependencies
                </p>
              </div>
            </div>

            {/* Advanced Impact */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                <AdjustmentsHorizontalIcon className="h-4 w-4" />
                {showAdvanced ? 'Hide' : 'Show'} Advanced Impact
              </button>

              <AnimatePresence>
                {showAdvanced && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="mt-4 space-y-4 overflow-hidden"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Income Impact (monthly)
                        </label>
                        <input
                          type="number"
                          value={editedEvent.impacts.income || 0}
                          onChange={(e) => {
                            const value = parseFloat(e.target.value);
                            if (!isNaN(value) || e.target.value === '') {
                              setEditedEvent({
                                ...editedEvent,
                                impacts: {
                                  ...editedEvent.impacts,
                                  income: e.target.value === '' ? 0 : value
                                }
                              });
                            }
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Expense Impact (monthly)
                        </label>
                        <input
                          type="number"
                          value={editedEvent.impacts.expenses || 0}
                          onChange={(e) => {
                            const value = parseFloat(e.target.value);
                            if (!isNaN(value) || e.target.value === '') {
                              setEditedEvent({
                                ...editedEvent,
                                impacts: {
                                  ...editedEvent.impacts,
                                  expenses: e.target.value === '' ? 0 : value
                                }
                              });
                            }
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                        />
                      </div>
                    </div>

                    <div className="p-3 sm:p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <h4 className="text-xs sm:text-sm font-medium text-blue-900 dark:text-blue-200 mb-2">
                        Impact Analysis
                      </h4>
                      <div className="space-y-1 text-xs sm:text-sm text-blue-800 dark:text-blue-300">
                        <p>• Monthly cash flow change: {formatCurrency((editedEvent.impacts.income || 0) - (editedEvent.impacts.expenses || 0))}</p>
                        <p>• Dependencies: {editedEvent.dependencies.length} events</p>
                        <p>• Affects: Financial Health Score, Goal Achievement</p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 sm:p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-2 sm:gap-3">
            <button
              onClick={onClose}
              className="px-3 sm:px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                onSave(editedEvent);
                onClose();
              }}
              className="px-3 sm:px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Save Changes
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

const ImpactDashboard: React.FC<{
  snapshots: FinancialSnapshot[];
  currentSnapshot: FinancialSnapshot | null;
}> = ({ snapshots, currentSnapshot }) => {
  if (!currentSnapshot) return null;

  const healthScoreData = [
    { category: 'Income', value: 85, optimal: 100 },
    { category: 'Savings', value: 70, optimal: 100 },
    { category: 'Debt', value: 60, optimal: 100 },
    { category: 'Emergency', value: 80, optimal: 100 },
    { category: 'Goals', value: 75, optimal: 100 },
    { category: 'Risk', value: 65, optimal: 100 }
  ];

  const netWorthData = snapshots.map(s => ({
    date: formatDate(s.date),
    netWorth: s.netWorth,
    assets: s.assets,
    liabilities: -s.liabilities
  }));

  const goalData = Object.entries(currentSnapshot.goalProgress || {}).map(([goal, progress]) => ({
    goal,
    progress,
    remaining: 100 - progress
  }));

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
        Simulation Results & Impact Analysis
      </h2>
      
      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Net Worth</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(currentSnapshot.netWorth)}
              </p>
              <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                +{formatCurrency(currentSnapshot.netWorth - snapshots[0].netWorth)}
              </p>
            </div>
            <ArrowTrendingUpIcon className="h-8 w-8 text-green-500" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Monthly Cash Flow</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(currentSnapshot.cashFlow)}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {((currentSnapshot.cashFlow / currentSnapshot.income) * 100).toFixed(0)}% of income
              </p>
            </div>
            <CurrencyDollarIcon className="h-8 w-8 text-blue-500" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Emergency Fund</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(currentSnapshot.emergencyFund)}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {(currentSnapshot.emergencyFund / currentSnapshot.expenses).toFixed(1)} months
              </p>
            </div>
            <ShieldCheckIcon className="h-8 w-8 text-yellow-500" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Health Score</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {currentSnapshot.healthScore}/100
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {currentSnapshot.healthScore >= 80 ? 'Excellent' : 
                 currentSnapshot.healthScore >= 60 ? 'Good' : 'Needs Attention'}
              </p>
            </div>
            <HeartIcon className="h-8 w-8 text-red-500" />
          </div>
        </motion.div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Financial Health Score */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Financial Health Breakdown
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Circular Score Meter */}
            <div className="flex items-center justify-center">
              <div className="relative w-40 h-40 sm:w-48 sm:h-48">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="50%"
                    cy="50%"
                    r="40%"
                    stroke="#E5E7EB"
                    strokeWidth="8%"
                    fill="none"
                  />
                  <circle
                    cx="50%"
                    cy="50%"
                    r="40%"
                    stroke="#3B82F6"
                    strokeWidth="8%"
                    fill="none"
                    strokeDasharray={`${currentSnapshot.healthScore * 2.51} 251`}
                    className="transition-all duration-1000"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
                      {currentSnapshot.healthScore}
                    </p>
                    <p className="text-xs sm:text-sm text-gray-500">Health Score</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Radar Chart */}
            <div className="h-48 sm:h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={healthScoreData}>
                  <PolarGrid stroke="#e5e7eb" />
                  <PolarAngleAxis dataKey="category" tick={{ fontSize: 10 }} className="text-xs" />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 10 }} />
                  <Radar
                    name="Current"
                    dataKey="value"
                    stroke="#3b82f6"
                    fill="#3b82f6"
                    fillOpacity={0.6}
                  />
                  <Radar
                    name="Optimal"
                    dataKey="optimal"
                    stroke="#10b981"
                    fill="#10b981"
                    fillOpacity={0.3}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </motion.div>

        {/* Net Worth Graph */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 sm:p-6"
      >
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">
          Net Worth Projection
        </h3>
        <div className="h-48 sm:h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={netWorthData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} />
              <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} tick={{ fontSize: 10 }} />
              <Tooltip formatter={(value: number) => formatCurrency(value)} contentStyle={{ fontSize: '12px' }} />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Area
                type="monotone"
                dataKey="assets"
                stackId="1"
                stroke="#10b981"
                fill="#10b981"
                fillOpacity={0.6}
              />
              <Area
                type="monotone"
                dataKey="liabilities"
                stackId="1"
                stroke="#ef4444"
                fill="#ef4444"
                fillOpacity={0.6}
              />
              <Line
                type="monotone"
                dataKey="netWorth"
                stroke="#3b82f6"
                strokeWidth={3}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>
      </div>

      {/* Emergency Fund & Goals */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        {/* Emergency Fund Timeline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 sm:p-6"
        >
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">
            Emergency Fund Status
          </h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">Current Fund</span>
                <span className="text-lg font-semibold text-gray-900 dark:text-white">
                  {formatCurrency(currentSnapshot.emergencyFund)}
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                <div
                  className="bg-green-500 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min((currentSnapshot.emergencyFund / (currentSnapshot.expenses * 6)) * 100, 100)}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {Math.round(currentSnapshot.emergencyFund / currentSnapshot.expenses)} months of expenses covered
              </p>
            </div>

            <div className="p-3 sm:p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <div className="flex items-center gap-2 mb-1 sm:mb-2">
                <ExclamationTriangleIcon className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-600" />
                <p className="text-xs sm:text-sm font-medium text-yellow-800 dark:text-yellow-200">
                  Recommendation
                </p>
              </div>
              <p className="text-xs sm:text-sm text-yellow-700 dark:text-yellow-300">
                Target: 6 months of expenses ({formatCurrency(currentSnapshot.expenses * 6)})
              </p>
            </div>
          </div>
        </motion.div>

        {/* Goal Probability */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 sm:p-6"
        >
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">
            Goal Achievement
          </h3>
          <div className="space-y-3">
            {goalData.map((goal) => (
              <div key={goal.goal}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {goal.goal}
                  </span>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">
                    {goal.progress}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-500 ${
                      goal.progress >= 80 ? 'bg-green-500' :
                      goal.progress >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${goal.progress}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Emotional Confidence Index */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 sm:p-6"
      >
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">
          Emotional Confidence Index
        </h3>
        <div className="relative h-20 bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 rounded-lg">
          <div
            className="absolute top-1/2 transform -translate-y-1/2 w-4 h-8 bg-white rounded shadow-lg transition-all duration-500"
            style={{ left: `${100 - currentSnapshot.stressLevel}%` }}
          />
          <div className="absolute -bottom-6 left-0 text-xs text-gray-500">Stressed</div>
          <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs text-gray-500">Neutral</div>
          <div className="absolute -bottom-6 right-0 text-xs text-gray-500">Confident</div>
        </div>
      </motion.div>
    </div>
  );
};

const AIInsightsPanel: React.FC<{
  events: LifeEvent[];
  snapshots: FinancialSnapshot[];
}> = ({ events, snapshots }) => {
  const insights = [
    {
      type: 'warning',
      title: 'Emergency Fund Alert',
      description: 'Your emergency fund will drop below 3 months after the home purchase. Consider increasing savings rate.',
      icon: <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600" />
    },
    {
      type: 'suggestion',
      title: 'Retirement Optimization',
      description: 'Increasing 401k contribution by 2% would improve retirement goal achievement by 15%.',
      icon: <LightBulbIcon className="h-5 w-5 text-blue-600" />
    },
    {
      type: 'positive',
      title: 'Debt Reduction Progress',
      description: 'At current rate, you\'ll be debt-free 8 months ahead of schedule.',
      icon: <CheckCircleIcon className="h-5 w-5 text-green-600" />
    }
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 sm:p-6">
      <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4 flex items-center gap-2">
        <SparklesIcon className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />
        AI Insights
      </h3>
      
      <div className="space-y-3">
        {insights.map((insight, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`p-3 sm:p-4 rounded-lg border ${
              insight.type === 'warning' ? 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800' :
              insight.type === 'suggestion' ? 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800' :
              'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800'
            }`}
          >
            <div className="flex items-start gap-2 sm:gap-3">
              <div className="flex-shrink-0">{insight.icon}</div>
              <div className="flex-1">
                <h4 className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">
                  {insight.title}
                </h4>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {insight.description}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
        <p className="text-xs sm:text-sm text-purple-800 dark:text-purple-200">
          💡 <strong>Pro tip:</strong> Try adjusting your raise date to Q1 2025 for better mortgage qualification timing.
        </p>
      </div>
    </div>
  );
};

// Main Component
export function LifeDecisionEngine() {
  const accountsData = useAccounts();
  
  const accounts = accountsData.data?.data || [];
  const accountsLoading = accountsData.isLoading;
  
  const [events, setEvents] = useState<LifeEvent[]>([]);
  const [snapshots, setSnapshots] = useState<FinancialSnapshot[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<LifeEvent | null>(null);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [currentScenario, setCurrentScenario] = useState<SimulationScenario | null>(null);
  const [showDAG, setShowDAG] = useState(false);
  const [showScenarioManager, setShowScenarioManager] = useState(false);
  const [savedScenarios, setSavedScenarios] = useState<SimulationScenario[]>([]);
  const [mobileView, setMobileView] = useState<'events' | 'timeline' | 'impact' | 'risk'>('timeline');
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [riskAnalysis, setRiskAnalysis] = useState<any>(null);
  const [showRiskDashboard, setShowRiskDashboard] = useState(false);

  // Calculate initial financial state from real data
  const calculateInitialState = useCallback(() => {
    if (!accounts) return null;

    const totalAssets = accounts.reduce((sum: number, acc: any) => 
      acc.type === 'depository' || acc.type === 'investment' ? sum + (acc.current_balance || 0) : sum, 0
    );
    
    const totalLiabilities = accounts.reduce((sum: number, acc: any) => 
      acc.type === 'credit' || acc.type === 'loan' ? sum + (acc.current_balance || 0) : sum, 0
    );

    return {
      assets: totalAssets,
      liabilities: totalLiabilities,
      netWorth: totalAssets - totalLiabilities,
      income: 7000, // This would come from transaction analysis
      expenses: 4500, // This would come from transaction analysis
      emergencyFund: accounts.find(a => a.name?.toLowerCase().includes('savings'))?.current_balance || 0
    };
  }, [accounts]);

  // Add event handler
  const handleAddEvent = (template: typeof eventTemplates[0], position: { x: number; y: number }) => {
    const newEvent: LifeEvent = {
      id: `event-${Date.now()}`,
      type: template.type,
      name: template.name,
      date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Default to 1 month from now
      dependencies: [],
      impacts: {},
      parameters: { ...template.defaultParams },
      position
    };
    
    setEvents([...events, newEvent]);
    setSelectedEvent(newEvent);
    setIsEventModalOpen(true);
  };

  // Update event handler
  const handleUpdateEvent = (id: string, updates: Partial<LifeEvent>) => {
    setEvents(events.map(e => e.id === id ? { ...e, ...updates } : e));
  };

  // Delete event handler
  const handleDeleteEvent = (id: string) => {
    setEvents(events.filter(e => e.id !== id));
    // Remove dependencies to this event
    setEvents(events.map(e => ({
      ...e,
      dependencies: e.dependencies.filter(dep => dep !== id)
    })));
  };

  // Run simulation
  const runSimulation = useCallback(async () => {
    // Prevent multiple simultaneous simulations
    if (isSimulating) return;
    
    setIsSimulating(true);
    
    try {
      const initialState = calculateInitialState();
      if (!initialState) {
        setIsSimulating(false);
        return;
      }

      // Sort events by date and dependencies (topological sort)
      const sortedEvents = [...events].sort((a, b) => a.date.getTime() - b.date.getTime());
      
      // Generate monthly snapshots
      const newSnapshots: FinancialSnapshot[] = [];
      const startDate = new Date();
      const endDate = new Date(startDate.getTime() + 5 * 365 * 24 * 60 * 60 * 1000); // 5 years
    
    let currentState = {
      ...initialState,
      healthScore: 75,
      stressLevel: 30,
      goalProgress: {
        'Retirement': 45,
        'Home Purchase': 20,
        'Emergency Fund': 60,
        'Debt Freedom': 70
      }
    };
    
    for (let date = new Date(startDate); date <= endDate; date.setMonth(date.getMonth() + 1)) {
      // Apply events that occur this month
      const monthEvents = sortedEvents.filter(e => 
        e.date.getFullYear() === date.getFullYear() && 
        e.date.getMonth() === date.getMonth()
      );
      
      for (const event of monthEvents) {
        // Apply event impacts
        if (event.impacts.income) currentState.income += event.impacts.income;
        if (event.impacts.expenses) currentState.expenses += event.impacts.expenses;
        if (event.impacts.assets) currentState.assets += event.impacts.assets;
        if (event.impacts.liabilities) currentState.liabilities += event.impacts.liabilities;
        
        // Apply specific event logic
        switch (event.name) {
          case 'Salary Raise':
            currentState.income *= (1 + event.parameters.percentage / 100);
            break;
          case 'Buy Home':
            currentState.liabilities += event.parameters.price - event.parameters.downPayment;
            currentState.assets -= event.parameters.downPayment;
            currentState.expenses += (event.parameters.price - event.parameters.downPayment) * event.parameters.mortgageRate / 100 / 12;
            break;
          case 'Have Child':
            currentState.expenses += event.parameters.monthlyChildcare;
            currentState.stressLevel += 10;
            break;
          // Add more event-specific logic
        }
      }
      
      // Monthly calculations
      const monthlySavings = currentState.income - currentState.expenses;
      currentState.assets += monthlySavings;
      currentState.netWorth = currentState.assets - currentState.liabilities;
      currentState.emergencyFund = Math.min(currentState.emergencyFund + monthlySavings * 0.2, currentState.expenses * 6);
      
      // Update health score based on various factors
      currentState.healthScore = Math.round(
        (currentState.netWorth > 0 ? 20 : 0) +
        (currentState.emergencyFund >= currentState.expenses * 3 ? 20 : 10) +
        (monthlySavings > 0 ? 20 : 0) +
        (currentState.liabilities < currentState.assets * 0.5 ? 20 : 10) +
        (Object.values(currentState.goalProgress).reduce((a: number, b: number) => a + b, 0) / Object.keys(currentState.goalProgress).length / 5)
      );
      
      // Update stress level
      currentState.stressLevel = Math.max(0, Math.min(100,
        100 - currentState.healthScore + 
        (currentState.emergencyFund < currentState.expenses * 3 ? 20 : 0) +
        (monthlySavings < 0 ? 30 : 0)
      ));
      
      // Update goal progress
      currentState.goalProgress['Emergency Fund'] = Math.min(100, (currentState.emergencyFund / (currentState.expenses * 6)) * 100);
      currentState.goalProgress['Debt Freedom'] = currentState.liabilities > 0 ? Math.max(0, 100 - (currentState.liabilities / initialState.liabilities) * 100) : 100;
      
      newSnapshots.push({
        date: new Date(date),
        netWorth: currentState.netWorth,
        income: currentState.income,
        expenses: currentState.expenses,
        assets: currentState.assets,
        liabilities: currentState.liabilities,
        emergencyFund: currentState.emergencyFund,
        healthScore: currentState.healthScore,
        stressLevel: currentState.stressLevel,
        goalProgress: { ...currentState.goalProgress }
      });
    }
    
    setSnapshots(newSnapshots);
    
    // Run risk analysis on the results
    const analysis = RiskAnalysisService.analyzeRisks(
      newSnapshots,
      events,
      {} // Goals would come from user profile
    );
    setRiskAnalysis(analysis);
    
    } catch (error) {
      console.error('Simulation error:', error);
    } finally {
      setIsSimulating(false);
    }
  }, [events, calculateInitialState, isSimulating]);

  // Generate PDF Report
  const generatePDFReport = async () => {
    if (!riskAnalysis || !snapshots.length) {
      console.error('No analysis data available');
      return;
    }

    try {
      const blob = await ReportGeneratorService.generatePDFReport(
        riskAnalysis,
        snapshots,
        events,
        'Demo User' // Would come from user profile
      );
      
      // For now, just alert that PDF generation requires dependencies
      if (blob.type === 'text/plain') {
        alert('PDF generation requires additional dependencies. Please install: npm install jspdf jspdf-autotable @types/jspdf');
        return;
      }
      
      // Create download link
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `financial-risk-report-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF report. Please try again.');
    }
  };

  // Load predefined scenarios
  const loadScenarioBundle = (bundleName: string, append: boolean = false) => {
    const timestamp = Date.now();
    const bundles: Record<string, LifeEvent[]> = {
      'Startup Founder': [
        {
          id: `startup-1-${timestamp}`,
          type: 'career',
          name: 'Start Business',
          date: new Date(Date.now() + 3 * 30 * 24 * 60 * 60 * 1000),
          dependencies: [],
          impacts: { income: -5000, expenses: 3000 },
          parameters: { investment: 50000, monthlyBurn: 5000, projectedRevenue: [0, 0, 2000, 5000, 8000, 10000] },
          position: { x: 100, y: 100 }
        },
        {
          id: `startup-2-${timestamp}`,
          type: 'financial',
          name: 'Investment Income',
          date: new Date(Date.now() + 12 * 30 * 24 * 60 * 60 * 1000),
          dependencies: [`startup-1-${timestamp}`],
          impacts: { income: 10000 },
          parameters: { monthlyRevenue: 10000 },
          position: { x: 300, y: 100 }
        },
        {
          id: `startup-3-${timestamp}`,
          type: 'career',
          name: 'Hire First Employee',
          date: new Date(Date.now() + 18 * 30 * 24 * 60 * 60 * 1000),
          dependencies: [`startup-2-${timestamp}`],
          impacts: { expenses: 5000 },
          parameters: { employeeSalary: 60000, benefitsCost: 15000 },
          position: { x: 500, y: 100 }
        }
      ],
      'New Parent': [
        {
          id: `parent-1-${timestamp}`,
          type: 'family',
          name: 'Have Child',
          date: new Date(Date.now() + 6 * 30 * 24 * 60 * 60 * 1000),
          dependencies: [],
          impacts: { expenses: 2000, stressLevel: 15 },
          parameters: { monthlyChildcare: 1500, medicalCosts: 5000 },
          position: { x: 100, y: 200 }
        },
        {
          id: `parent-2-${timestamp}`,
          type: 'financial',
          name: 'Buy Home',
          date: new Date(Date.now() + 2 * 30 * 24 * 60 * 60 * 1000),
          dependencies: [],
          impacts: { expenses: 500 },
          parameters: { price: 450000, downPayment: 90000, mortgageRate: 6.5 },
          position: { x: 300, y: 200 }
        },
        {
          id: `parent-3-${timestamp}`,
          type: 'education',
          name: '529 Education Plan',
          date: new Date(Date.now() + 8 * 30 * 24 * 60 * 60 * 1000),
          dependencies: [`parent-1-${timestamp}`],
          impacts: { expenses: 300 },
          parameters: { monthlyContribution: 300, targetAmount: 100000 },
          position: { x: 500, y: 200 }
        }
      ],
      'Career Change': [
        {
          id: `career-1-${timestamp}`,
          type: 'education',
          name: 'Professional Certification',
          date: new Date(Date.now() + 1 * 30 * 24 * 60 * 60 * 1000),
          dependencies: [],
          impacts: { expenses: 500 },
          parameters: { courseCost: 5000, studyHours: 200 },
          position: { x: 100, y: 300 }
        },
        {
          id: `career-2-${timestamp}`,
          type: 'career',
          name: 'Job Change',
          date: new Date(Date.now() + 4 * 30 * 24 * 60 * 60 * 1000),
          dependencies: [`career-1-${timestamp}`],
          impacts: { income: 2000 },
          parameters: { newSalary: 95000, signingBonus: 10000 },
          position: { x: 300, y: 300 }
        },
        {
          id: `career-3-${timestamp}`,
          type: 'career',
          name: 'Promotion',
          date: new Date(Date.now() + 16 * 30 * 24 * 60 * 60 * 1000),
          dependencies: [`career-2-${timestamp}`],
          impacts: { income: 1500 },
          parameters: { salaryIncrease: 15, newTitle: 'Senior Manager' },
          position: { x: 500, y: 300 }
        }
      ],
      'Real Estate Investor': [
        {
          id: `realestate-1-${timestamp}`,
          type: 'financial',
          name: 'Buy Rental Property',
          date: new Date(Date.now() + 6 * 30 * 24 * 60 * 60 * 1000),
          dependencies: [],
          impacts: { income: 500, expenses: 200, assets: 250000, liabilities: 200000 },
          parameters: { propertyPrice: 250000, downPayment: 50000, monthlyRent: 2000, mortgage: 1300 },
          position: { x: 100, y: 400 }
        },
        {
          id: `realestate-2-${timestamp}`,
          type: 'financial',
          name: 'Property Renovation',
          date: new Date(Date.now() + 12 * 30 * 24 * 60 * 60 * 1000),
          dependencies: [`realestate-1-${timestamp}`],
          impacts: { income: 300, assets: 30000 },
          parameters: { renovationCost: 30000, rentIncrease: 300 },
          position: { x: 300, y: 400 }
        },
        {
          id: `realestate-3-${timestamp}`,
          type: 'financial',
          name: 'Second Rental Property',
          date: new Date(Date.now() + 24 * 30 * 24 * 60 * 60 * 1000),
          dependencies: [`realestate-1-${timestamp}`],
          impacts: { income: 600, expenses: 250, assets: 300000, liabilities: 240000 },
          parameters: { propertyPrice: 300000, downPayment: 60000, monthlyRent: 2500, mortgage: 1650 },
          position: { x: 500, y: 400 }
        }
      ],
      'Early Retirement': [
        {
          id: `retire-1-${timestamp}`,
          type: 'financial',
          name: 'Max 401k Contribution',
          date: new Date(Date.now() + 1 * 30 * 24 * 60 * 60 * 1000),
          dependencies: [],
          impacts: { expenses: 1875 },
          parameters: { annualContribution: 22500, employerMatch: 6 },
          position: { x: 100, y: 500 }
        },
        {
          id: `retire-2-${timestamp}`,
          type: 'financial',
          name: 'Backdoor Roth IRA',
          date: new Date(Date.now() + 2 * 30 * 24 * 60 * 60 * 1000),
          dependencies: [],
          impacts: { expenses: 541 },
          parameters: { annualContribution: 6500 },
          position: { x: 300, y: 500 }
        },
        {
          id: `retire-3-${timestamp}`,
          type: 'lifestyle',
          name: 'FIRE Lifestyle',
          date: new Date(Date.now() + 60 * 30 * 24 * 60 * 60 * 1000),
          dependencies: [`retire-1-${timestamp}`, `retire-2-${timestamp}`],
          impacts: { income: -7000, expenses: -3000, stressLevel: -30 },
          parameters: { targetNetWorth: 1500000, withdrawalRate: 4 },
          position: { x: 500, y: 500 }
        }
      ],
      'Graduate School': [
        {
          id: `grad-1-${timestamp}`,
          type: 'education',
          name: 'GMAT/GRE Prep',
          date: new Date(Date.now() + 1 * 30 * 24 * 60 * 60 * 1000),
          dependencies: [],
          impacts: { expenses: 300 },
          parameters: { prepCost: 2000, testFee: 300 },
          position: { x: 100, y: 100 }
        },
        {
          id: `grad-2-${timestamp}`,
          type: 'education',
          name: 'MBA Program',
          date: new Date(Date.now() + 9 * 30 * 24 * 60 * 60 * 1000),
          dependencies: [`grad-1-${timestamp}`],
          impacts: { income: -7000, expenses: 5000, liabilities: 120000 },
          parameters: { tuition: 120000, duration: 24, lostIncome: 160000 },
          position: { x: 300, y: 100 }
        },
        {
          id: `grad-3-${timestamp}`,
          type: 'career',
          name: 'Post-MBA Job',
          date: new Date(Date.now() + 33 * 30 * 24 * 60 * 60 * 1000),
          dependencies: [`grad-2-${timestamp}`],
          impacts: { income: 13000 },
          parameters: { newSalary: 150000, signingBonus: 30000 },
          position: { x: 500, y: 100 }
        }
      ],
      'Economic Downturn': [
        {
          id: `downturn-1-${timestamp}`,
          type: 'career',
          name: 'Job Loss',
          date: new Date(Date.now() + 3 * 30 * 24 * 60 * 60 * 1000),
          dependencies: [],
          impacts: { income: -7000, stressLevel: 40 },
          parameters: { severanceMonths: 2, unemploymentBenefits: true },
          position: { x: 100, y: 200 }
        },
        {
          id: `downturn-2-${timestamp}`,
          type: 'financial',
          name: 'Market Crash',
          date: new Date(Date.now() + 3 * 30 * 24 * 60 * 60 * 1000),
          dependencies: [],
          impacts: { assets: -50000 },
          parameters: { portfolioDropPercent: 30, recoveryMonths: 24 },
          position: { x: 300, y: 200 }
        },
        {
          id: `downturn-3-${timestamp}`,
          type: 'career',
          name: 'New Job (Lower Pay)',
          date: new Date(Date.now() + 6 * 30 * 24 * 60 * 60 * 1000),
          dependencies: [`downturn-1-${timestamp}`],
          impacts: { income: 5500, stressLevel: -20 },
          parameters: { newSalary: 65000, payReduction: 20 },
          position: { x: 500, y: 200 }
        }
      ],
      'Health Crisis': [
        {
          id: `health-1-${timestamp}`,
          type: 'health',
          name: 'Medical Emergency',
          date: new Date(Date.now() + 2 * 30 * 24 * 60 * 60 * 1000),
          dependencies: [],
          impacts: { expenses: 2000, assets: -15000, stressLevel: 50 },
          parameters: { medicalBills: 50000, insuranceCoverage: 35000, outOfPocket: 15000 },
          position: { x: 100, y: 300 }
        },
        {
          id: `health-2-${timestamp}`,
          type: 'career',
          name: 'Medical Leave',
          date: new Date(Date.now() + 2 * 30 * 24 * 60 * 60 * 1000),
          dependencies: [`health-1-${timestamp}`],
          impacts: { income: -3500 },
          parameters: { leaveWeeks: 12, shortTermDisability: 60 },
          position: { x: 300, y: 300 }
        },
        {
          id: `health-3-${timestamp}`,
          type: 'lifestyle',
          name: 'Lifestyle Changes',
          date: new Date(Date.now() + 6 * 30 * 24 * 60 * 60 * 1000),
          dependencies: [`health-1-${timestamp}`],
          impacts: { expenses: 500, healthScore: 20, stressLevel: -20 },
          parameters: { gymMembership: 150, healthyFood: 200, therapy: 150 },
          position: { x: 500, y: 300 }
        }
      ],
      'Side Hustle Success': [
        {
          id: `side-1-${timestamp}`,
          type: 'career',
          name: 'Start Side Business',
          date: new Date(Date.now() + 1 * 30 * 24 * 60 * 60 * 1000),
          dependencies: [],
          impacts: { income: 500, expenses: 200 },
          parameters: { startupCost: 2000, monthlyRevenue: 1000, monthlyExpenses: 300 },
          position: { x: 100, y: 400 }
        },
        {
          id: `side-2-${timestamp}`,
          type: 'career',
          name: 'Scale Side Business',
          date: new Date(Date.now() + 12 * 30 * 24 * 60 * 60 * 1000),
          dependencies: [`side-1-${timestamp}`],
          impacts: { income: 2500, expenses: 800 },
          parameters: { monthlyRevenue: 5000, monthlyExpenses: 1500, hoursPerWeek: 20 },
          position: { x: 300, y: 400 }
        },
        {
          id: `side-3-${timestamp}`,
          type: 'career',
          name: 'Go Full-Time',
          date: new Date(Date.now() + 24 * 30 * 24 * 60 * 60 * 1000),
          dependencies: [`side-2-${timestamp}`],
          impacts: { income: 3000, expenses: 1000, stressLevel: 10 },
          parameters: { monthlyRevenue: 12000, monthlyExpenses: 3000, quitMainJob: true },
          position: { x: 500, y: 400 }
        }
      ],
      'Inheritance Windfall': [
        {
          id: `inherit-1-${timestamp}`,
          type: 'financial',
          name: 'Receive Inheritance',
          date: new Date(Date.now() + 6 * 30 * 24 * 60 * 60 * 1000),
          dependencies: [],
          impacts: { assets: 250000, stressLevel: -20 },
          parameters: { inheritanceAmount: 250000, taxOwed: 0 },
          position: { x: 100, y: 500 }
        },
        {
          id: `inherit-2-${timestamp}`,
          type: 'financial',
          name: 'Investment Strategy',
          date: new Date(Date.now() + 7 * 30 * 24 * 60 * 60 * 1000),
          dependencies: [`inherit-1-${timestamp}`],
          impacts: { income: 1000 },
          parameters: { investmentAmount: 200000, expectedReturn: 6, monthlyDividends: 1000 },
          position: { x: 300, y: 500 }
        },
        {
          id: `inherit-3-${timestamp}`,
          type: 'financial',
          name: 'Pay Off Debt',
          date: new Date(Date.now() + 7 * 30 * 24 * 60 * 60 * 1000),
          dependencies: [`inherit-1-${timestamp}`],
          impacts: { liabilities: -50000, expenses: -800 },
          parameters: { debtPaidOff: 50000, monthlySavings: 800 },
          position: { x: 500, y: 500 }
        }
      ]
    };
    
    const newEvents = bundles[bundleName] || [];
    
    if (append) {
      // When appending, adjust positions to avoid overlap
      const maxY = events.reduce((max, event) => Math.max(max, event.position?.y || 0), 0);
      const adjustedEvents = newEvents.map(event => ({
        ...event,
        position: {
          x: event.position?.x || 0,
          y: (event.position?.y || 0) + maxY + 100
        }
      }));
      setEvents([...events, ...adjustedEvents]);
    } else {
      setEvents(newEvents);
    }
  };

  // Save scenario
  const saveScenario = () => {
    if (!currentScenario) {
      const newScenario: SimulationScenario = {
        id: `scenario-${Date.now()}`,
        name: `Scenario ${savedScenarios.length + 1}`,
        description: '',
        events: [...events],
        snapshots: [...snapshots],
        createdAt: new Date(),
        updatedAt: new Date(),
        tags: []
      };
      setCurrentScenario(newScenario);
      setSavedScenarios([...savedScenarios, newScenario]);
    } else {
      const updated = {
        ...currentScenario,
        events: [...events],
        snapshots: [...snapshots],
        updatedAt: new Date()
      };
      setCurrentScenario(updated);
      setSavedScenarios(savedScenarios.map(s => s.id === updated.id ? updated : s));
    }
  };

  // Create a timer ref for debouncing
  const simulationTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-run simulation when events change with debounce
  useEffect(() => {
    // Clear any existing timer
    if (simulationTimerRef.current) {
      clearTimeout(simulationTimerRef.current);
    }

    // Only run simulation if we have events and not currently simulating
    if (events.length > 0 && !isSimulating) {
      // Debounce the simulation by 500ms to prevent rapid re-runs
      simulationTimerRef.current = setTimeout(() => {
        runSimulation();
      }, 500);
    }

    // Cleanup timer on unmount
    return () => {
      if (simulationTimerRef.current) {
        clearTimeout(simulationTimerRef.current);
      }
    };
  }, [events, runSimulation, isSimulating]);

  if (accountsLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-1.5 sm:p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <SparklesIcon className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h1 className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">
                    Life Decision Engine
                  </h1>
                  <p className="text-xs sm:text-sm text-gray-500 hidden sm:block">Simulate your financial future</p>
                </div>
              </div>
              
              {/* Desktop Toolbar */}
              <div className="hidden lg:flex items-center gap-2">
                <button
                  onClick={() => setShowDAG(!showDAG)}
                  className={`p-2 rounded-lg transition-colors ${
                    showDAG ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                  title="Toggle DAG View"
                >
                  <MapIcon className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setShowRiskDashboard(!showRiskDashboard)}
                  className={`p-2 rounded-lg transition-colors ${
                    showRiskDashboard ? 'bg-red-100 text-red-600' : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                  title="Risk Analysis"
                  disabled={!riskAnalysis}
                >
                  <ExclamationTriangleIcon className="h-5 w-5" />
                </button>
                <button
                  onClick={runSimulation}
                  disabled={isSimulating}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
                >
                  {isSimulating ? (
                    <>
                      <ArrowPathIcon className="h-5 w-5 animate-spin" />
                      <span className="hidden xl:inline">Simulating...</span>
                    </>
                  ) : (
                    <>
                      <PlayIcon className="h-5 w-5" />
                      <span className="hidden xl:inline">Run Simulation</span>
                    </>
                  )}
                </button>
                <button
                  onClick={saveScenario}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                  title="Save Scenario"
                >
                  <BookmarkIcon className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setShowScenarioManager(true)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                  title="Manage Scenarios"
                >
                  <FolderOpenIcon className="h-5 w-5" />
                </button>
                <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg" title="Share">
                  <ShareIcon className="h-5 w-5" />
                </button>
                <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg" title="Export PDF">
                  <DocumentArrowDownIcon className="h-5 w-5" />
                </button>
              </div>
              
              {/* Mobile Toolbar */}
              <div className="flex lg:hidden items-center gap-2">
                <button
                  onClick={runSimulation}
                  disabled={isSimulating}
                  className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 text-sm"
                >
                  {isSimulating ? (
                    <ArrowPathIcon className="h-4 w-4 animate-spin" />
                  ) : (
                    <PlayIcon className="h-4 w-4" />
                  )}
                  <span className="hidden sm:inline">Run</span>
                </button>
                <button
                  onClick={() => setShowMobileMenu(!showMobileMenu)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  <CogIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
            
            {/* Mobile Menu */}
            {showMobileMenu && (
              <div className="lg:hidden mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setShowDAG(!showDAG)}
                    className={`p-2 rounded-lg transition-colors text-sm ${
                      showDAG ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 dark:bg-gray-700'
                    }`}
                  >
                    <MapIcon className="h-4 w-4 inline mr-1" />
                    DAG View
                  </button>
                  <button
                    onClick={saveScenario}
                    className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm"
                  >
                    <BookmarkIcon className="h-4 w-4 inline mr-1" />
                    Save
                  </button>
                  <button
                    onClick={() => setShowScenarioManager(true)}
                    className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm"
                  >
                    <FolderOpenIcon className="h-4 w-4 inline mr-1" />
                    Scenarios
                  </button>
                  <button className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm">
                    <ShareIcon className="h-4 w-4 inline mr-1" />
                    Share
                  </button>
                  <button className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm">
                    <DocumentArrowDownIcon className="h-4 w-4 inline mr-1" />
                    Export
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Mobile View Tabs */}
        <div className="lg:hidden sticky top-0 z-40 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="container mx-auto px-4">
            <div className="flex justify-around">
              <button
                onClick={() => setMobileView('events')}
                className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${
                  mobileView === 'events'
                    ? 'text-blue-600 border-blue-600'
                    : 'text-gray-500 border-transparent hover:text-gray-700'
                }`}
              >
                <CalendarIcon className="h-5 w-5 mx-auto mb-1" />
                Events
              </button>
              <button
                onClick={() => setMobileView('timeline')}
                className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${
                  mobileView === 'timeline'
                    ? 'text-blue-600 border-blue-600'
                    : 'text-gray-500 border-transparent hover:text-gray-700'
                }`}
              >
                <ClockIcon className="h-5 w-5 mx-auto mb-1" />
                Timeline
              </button>
              <button
                onClick={() => setMobileView('impact')}
                className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${
                  mobileView === 'impact'
                    ? 'text-blue-600 border-blue-600'
                    : 'text-gray-500 border-transparent hover:text-gray-700'
                }`}
              >
                <ChartBarIcon className="h-5 w-5 mx-auto mb-1" />
                Impact
              </button>
              <button
                onClick={() => setMobileView('risk')}
                className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${
                  mobileView === 'risk'
                    ? 'text-blue-600 border-blue-600'
                    : 'text-gray-500 border-transparent hover:text-gray-700'
                }`}
                disabled={!riskAnalysis}
              >
                <ExclamationTriangleIcon className="h-5 w-5 mx-auto mb-1" />
                Risk
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-4 sm:py-6">
          {/* Top Section - Event Library and Timeline */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 mb-8">
            {/* Left Panel - Event Library & Real Data */}
            <div className={`lg:col-span-3 space-y-4 ${mobileView === 'events' ? 'block lg:block' : 'hidden lg:block'}`}>
              {/* Real Data Summary */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 sm:p-6"
              >
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">
                  Your Financial Data
                </h3>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Monthly Income</span>
                    <span className="font-medium text-gray-900 dark:text-white">$7,000</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Total Assets</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {formatCurrency(calculateInitialState()?.assets || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Total Liabilities</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {formatCurrency(calculateInitialState()?.liabilities || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Net Worth</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {formatCurrency(calculateInitialState()?.netWorth || 0)}
                    </span>
                  </div>
                </div>

                <button className="w-full mt-4 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-sm transition-colors">
                  Edit Values
                </button>
              </motion.div>

              {/* Event Library */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 sm:p-6"
              >
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">
                  Life Events
                </h3>
                
                <div className="space-y-3">
                  {eventTemplates.map((template, index) => (
                    <DraggableEvent
                      key={index}
                      template={template}
                      onDrop={handleAddEvent}
                    />
                  ))}
                </div>

                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Scenario Templates
                    </h4>
                    <button
                      onClick={() => setEvents([])}
                      className="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                    >
                      Clear All
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-2 gap-2 mb-3">
                    <button
                      onClick={(e) => loadScenarioBundle('Startup Founder', e.shiftKey)}
                      className="px-2 py-2 text-xs border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-left"
                      title="Start a business journey"
                    >
                      🚀 Startup
                    </button>
                    <button
                      onClick={(e) => loadScenarioBundle('New Parent', e.shiftKey)}
                      className="px-2 py-2 text-xs border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-left"
                      title="Plan for parenthood"
                    >
                      👶 Parent
                    </button>
                    <button
                      onClick={(e) => loadScenarioBundle('Career Change', e.shiftKey)}
                      className="px-2 py-2 text-xs border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-left"
                      title="Change careers"
                    >
                      🎓 Career
                    </button>
                    <button
                      onClick={(e) => loadScenarioBundle('Real Estate Investor', e.shiftKey)}
                      className="px-2 py-2 text-xs border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-left"
                      title="Real estate investing"
                    >
                      🏠 Real Estate
                    </button>
                    <button
                      onClick={(e) => loadScenarioBundle('Early Retirement', e.shiftKey)}
                      className="px-2 py-2 text-xs border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-left"
                      title="FIRE movement"
                    >
                      🔥 FIRE
                    </button>
                    <button
                      onClick={(e) => loadScenarioBundle('Graduate School', e.shiftKey)}
                      className="px-2 py-2 text-xs border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-left"
                      title="Advanced education"
                    >
                      🎓 Grad School
                    </button>
                    <button
                      onClick={(e) => loadScenarioBundle('Economic Downturn', e.shiftKey)}
                      className="px-2 py-2 text-xs border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-left"
                      title="Recession planning"
                    >
                      📉 Downturn
                    </button>
                    <button
                      onClick={(e) => loadScenarioBundle('Health Crisis', e.shiftKey)}
                      className="px-2 py-2 text-xs border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-left"
                      title="Medical emergency"
                    >
                      🏥 Health
                    </button>
                    <button
                      onClick={(e) => loadScenarioBundle('Side Hustle Success', e.shiftKey)}
                      className="px-2 py-2 text-xs border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-left"
                      title="Side business growth"
                    >
                      💼 Side Hustle
                    </button>
                    <button
                      onClick={(e) => loadScenarioBundle('Inheritance Windfall', e.shiftKey)}
                      className="px-2 py-2 text-xs border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-left"
                      title="Sudden wealth"
                    >
                      💰 Windfall
                    </button>
                  </div>

                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <h5 className="text-xs font-medium text-blue-800 dark:text-blue-200 mb-2">
                      Combine Scenarios
                    </h5>
                    <p className="text-xs text-blue-700 dark:text-blue-300 mb-2">
                      Hold Shift and click to add scenarios together
                    </p>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <button
                        onClick={() => {
                          loadScenarioBundle('Startup Founder', false);
                          setTimeout(() => loadScenarioBundle('New Parent', true), 100);
                        }}
                        className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                      >
                        Startup + Parent
                      </button>
                      <button
                        onClick={() => {
                          loadScenarioBundle('Career Change', false);
                          setTimeout(() => loadScenarioBundle('Real Estate Investor', true), 100);
                        }}
                        className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                      >
                        Career + RE
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Center Panel - Timeline Canvas */}
            <div className={`lg:col-span-9 ${mobileView === 'timeline' ? 'block lg:block' : 'hidden lg:block'}`}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 sm:p-6"
              >
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">
                  Timeline Simulator
                </h3>
                
                <TimelineCanvas
                  events={events}
                  onEventUpdate={handleUpdateEvent}
                  onEventDelete={handleDeleteEvent}
                  onEventClick={(event) => {
                    setSelectedEvent(event);
                    setIsEventModalOpen(true);
                  }}
                  onDrop={handleAddEvent}
                />

                {events.length === 0 && (
                  <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-center">
                    <p className="text-xs sm:text-sm text-blue-800 dark:text-blue-200">
                      {/* Mobile message */}
                      <span className="lg:hidden">Switch to Events tab to add life events</span>
                      {/* Desktop message */}
                      <span className="hidden lg:inline">Drag life events from the left panel onto the timeline to begin</span>
                    </p>
                  </div>
                )}
              </motion.div>

              {/* DAG Visualization (Optional) */}
              <AnimatePresence>
                {showDAG && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-6 bg-white dark:bg-gray-800 rounded-lg shadow p-4 sm:p-6 overflow-hidden"
                  >
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">
                      Event Dependency Graph
                    </h3>
                    <div className="h-64 bg-gray-50 dark:bg-gray-900 rounded-lg flex items-center justify-center">
                      <p className="text-gray-500">DAG visualization would go here</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

          </div>

          {/* Bottom Section - Simulation Results */}
          {(mobileView === 'impact' || mobileView === 'timeline') && snapshots.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8"
            >
              <ImpactDashboard
                snapshots={snapshots}
                currentSnapshot={snapshots[snapshots.length - 1]}
              />
            </motion.div>
          )}

          {/* AI Insights Section */}
          {(mobileView === 'impact' || mobileView === 'timeline') && snapshots.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mt-6"
            >
              <AIInsightsPanel events={events} snapshots={snapshots} />
            </motion.div>
          )}

          {/* Risk Analysis Dashboard */}
          {(showRiskDashboard || mobileView === 'risk') && riskAnalysis && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8"
            >
              <RiskDashboard 
                analysis={riskAnalysis} 
                onGenerateReport={generatePDFReport}
              />
            </motion.div>
          )}

          {/* Empty State for Impact View */}
          {mobileView === 'impact' && snapshots.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8 bg-gray-100 dark:bg-gray-800 rounded-lg p-12 text-center"
            >
              <ChartBarIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">
                Add events and run simulation to see impact analysis
              </p>
            </motion.div>
          )}
        </div>

        {/* Event Configuration Modal */}
        <EventConfigModal
          event={selectedEvent}
          isOpen={isEventModalOpen}
          onClose={() => setIsEventModalOpen(false)}
          onSave={(event) => {
            handleUpdateEvent(event.id, event);
            setIsEventModalOpen(false);
          }}
          allEvents={events}
        />

        {/* Scenario Manager Modal */}
        <AnimatePresence>
          {showScenarioManager && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
              onClick={() => setShowScenarioManager(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] sm:max-h-[80vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
                    Scenario Manager
                  </h2>
                  <button
                    onClick={() => setShowScenarioManager(false)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>
                
                <div className="p-4 sm:p-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                    {savedScenarios.map((scenario) => (
                      <div
                        key={scenario.id}
                        className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 sm:p-4 hover:shadow-md cursor-pointer transition-shadow"
                        onClick={() => {
                          setEvents(scenario.events);
                          setSnapshots(scenario.snapshots);
                          setCurrentScenario(scenario);
                          setShowScenarioManager(false);
                        }}
                      >
                        <h3 className="text-sm sm:text-base font-medium text-gray-900 dark:text-white">
                          {scenario.name}
                        </h3>
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {scenario.events.length} events
                        </p>
                        <p className="text-xs text-gray-500 mt-2">
                          Updated {scenario.updatedAt.toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </DndProvider>
  );
}