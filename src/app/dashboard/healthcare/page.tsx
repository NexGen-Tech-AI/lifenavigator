'use client';

import React, { useState, useEffect } from 'react';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from 'recharts';

const HealthcareDashboard = () => {
  // State for health data
  const [healthData, setHealthData] = useState({
    healthScoreHistory: [] as { date: string; score: number }[],
    vitalSigns: {
      bloodPressure: { systolic: 0, diastolic: 0, date: '' },
      heartRate: { value: 0, date: '' },
      weight: { value: 0, date: '' }
    },
    activityData: [] as { day: string; steps: number; activeMinutes: number }[],
    sleepData: [] as { day: string; hours: number; quality: number }[],
    upcomingAppointments: [] as { id: string; doctor: string; specialty: string; date: string; time: string }[],
    medicationAdherence: { adherence: 0, medications: [] as { name: string; adherence: number }[] }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Colors for charts
  const COLORS = ['#ef4444', '#f97316', '#14b8a6', '#3b82f6', '#8b5cf6'];

  // Fetch health data
  useEffect(() => {
    const fetchHealthData = async () => {
      try {
        setLoading(true);
        
        // Mock API calls
        const scoreData = await fetchHealthScoreHistory();
        const vitalsData = await fetchVitalSigns();
        const activityData = await fetchActivityData();
        const sleepData = await fetchSleepData();
        const appointmentsData = await fetchUpcomingAppointments();
        const medicationData = await fetchMedicationAdherence();
        
        setHealthData({
          healthScoreHistory: scoreData,
          vitalSigns: vitalsData,
          activityData,
          sleepData,
          upcomingAppointments: appointmentsData,
          medicationAdherence: medicationData
        });
        setLoading(false);
      } catch (err) {
        setError("Failed to load health data");
        setLoading(false);
      }
    };
    
    fetchHealthData();
  }, []);

  // Mock data fetching functions
  const fetchHealthScoreHistory = async () => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const data = [];
    const today = new Date();
    
    for (let i = 30; i >= 0; i--) {
      const date = new Date();
      date.setDate(today.getDate() - i);
      
      // Generate some realistic health score fluctuations (70-85 range)
      const baseScore = 75;
      const variation = Math.sin(i / 5) * 5;
      const improvement = i > 15 ? 0 : (15 - i) / 3; // Gradual improvement in recent days
      
      data.push({
        date: date.toISOString().split('T')[0],
        score: Math.round(baseScore + variation + improvement)
      });
    }
    
    return data;
  };
  
  const fetchVitalSigns = async () => {
    await new Promise(resolve => setTimeout(resolve, 450));
    return {
      bloodPressure: { systolic: 125, diastolic: 82, date: '2025-05-28' },
      heartRate: { value: 68, date: '2025-05-28' },
      weight: { value: 165.5, date: '2025-05-28' }
    };
  };
  
  const fetchActivityData = async () => {
    await new Promise(resolve => setTimeout(resolve, 550));
    const data = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(today.getDate() - i);
      
      const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
      const isWeekend = [0, 6].includes(date.getDay());
      
      // More steps on weekends, random variation on weekdays
      const baseSteps = isWeekend ? 9000 : 7000;
      const stepsVariation = Math.random() * 2000 - 1000;
      
      // More active minutes on weekends
      const baseActiveMinutes = isWeekend ? 45 : 30;
      const activeVariation = Math.random() * 20 - 10;
      
      data.push({
        day: dayName,
        steps: Math.round(baseSteps + stepsVariation),
        activeMinutes: Math.round(baseActiveMinutes + activeVariation)
      });
    }
    
    return data;
  };
  
  const fetchSleepData = async () => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const data = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(today.getDate() - i);
      
      const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
      const isWeekend = [0, 6].includes(date.getDay());
      
      // More sleep on weekends, less on weekdays
      const baseSleep = isWeekend ? 8 : 7;
      const sleepVariation = Math.random() * 1.5 - 0.75;
      
      data.push({
        day: dayName,
        hours: Math.round((baseSleep + sleepVariation) * 10) / 10,
        quality: Math.round(Math.random() * 30 + 60) // Sleep quality 60-90
      });
    }
    
    return data;
  };
  
  const fetchUpcomingAppointments = async () => {
    await new Promise(resolve => setTimeout(resolve, 400));
    return [
      { id: 'apt1', doctor: 'Dr. Smith', specialty: 'Primary Care', date: '2025-06-15', time: '10:30 AM' },
      { id: 'apt2', doctor: 'Dr. Johnson', specialty: 'Dermatology', date: '2025-07-03', time: '2:15 PM' },
      { id: 'apt3', doctor: 'Dr. Williams', specialty: 'Dentist', date: '2025-06-28', time: '9:00 AM' },
    ];
  };
  
  const fetchMedicationAdherence = async () => {
    await new Promise(resolve => setTimeout(resolve, 450));
    return {
      adherence: 85,
      medications: [
        { name: 'Vitamin D', adherence: 95 },
        { name: 'Allergy Medication', adherence: 85 },
        { name: 'Multivitamin', adherence: 75 }
      ]
    };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl font-semibold">Loading health data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl font-semibold text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Health Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400">Your personal health monitoring platform</p>
      </header>
      
      {/* Health summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">Health Score</h2>
          <div className="flex items-center">
            <div className="relative w-16 h-16">
              <svg className="w-full h-full" viewBox="0 0 36 36">
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#E5E7EB"
                  strokeWidth="3"
                  strokeDasharray="100, 100"
                />
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#ef4444"
                  strokeWidth="3"
                  strokeDasharray="78, 100"
                />
                <text x="18" y="20.35" className="text-xs" textAnchor="middle" fill="#ef4444" fontWeight="bold">78</text>
              </svg>
            </div>
            <div className="ml-4">
              <div className="text-3xl font-bold text-red-600 dark:text-red-500">78</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Good</div>
            </div>
          </div>
          <div className="mt-2 text-sm text-green-600 dark:text-green-400">
            ↑ 5% improvement this month
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">Vital Signs</h2>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500 dark:text-gray-400">Blood Pressure</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {healthData.vitalSigns.bloodPressure.systolic}/{healthData.vitalSigns.bloodPressure.diastolic} mmHg
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500 dark:text-gray-400">Resting Heart Rate</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {healthData.vitalSigns.heartRate.value} bpm
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500 dark:text-gray-400">Weight</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {healthData.vitalSigns.weight.value} lbs
              </span>
            </div>
          </div>
          <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            Last updated: {new Date(healthData.vitalSigns.bloodPressure.date).toLocaleDateString()}
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">Medication Adherence</h2>
          <div className="flex items-center">
            <div className="relative w-16 h-16">
              <svg className="w-full h-full" viewBox="0 0 36 36">
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#E5E7EB"
                  strokeWidth="3"
                  strokeDasharray="100, 100"
                />
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#84cc16"
                  strokeWidth="3"
                  strokeDasharray={`${healthData.medicationAdherence.adherence}, 100`}
                />
                <text x="18" y="20.35" className="text-xs" textAnchor="middle" fill="#84cc16" fontWeight="bold">
                  {healthData.medicationAdherence.adherence}%
                </text>
              </svg>
            </div>
            <div className="ml-4 space-y-1">
              {healthData.medicationAdherence.medications.map((med, index) => (
                <div key={index} className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">{med.name}</span>
                  <span className="font-medium text-gray-900 dark:text-white">{med.adherence}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Health score trend */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Health Score Trend</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={healthData.healthScoreHistory}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(dateStr) => {
                    const date = new Date(dateStr);
                    return `${date.getMonth() + 1}/${date.getDate()}`;
                  }}
                  interval={6}
                />
                <YAxis domain={[60, 90]} />
                <Tooltip 
                  formatter={(value) => [`${value}`, 'Health Score']}
                  labelFormatter={(dateStr) => {
                    const date = new Date(dateStr);
                    return date.toLocaleDateString();
                  }}
                />
                <Line type="monotone" dataKey="score" stroke="#ef4444" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* Activity data */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Weekly Activity</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={healthData.activityData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis yAxisId="left" orientation="left" stroke="#ef4444" />
                <YAxis yAxisId="right" orientation="right" stroke="#3b82f6" />
                <Tooltip />
                <Legend />
                <Bar yAxisId="left" dataKey="steps" name="Steps" fill="#ef4444" />
                <Bar yAxisId="right" dataKey="activeMinutes" name="Active Minutes" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Sleep data */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Sleep Quality</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={healthData.sleepData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis yAxisId="left" orientation="left" stroke="#8b5cf6" />
                <YAxis yAxisId="right" orientation="right" stroke="#14b8a6" domain={[0, 100]} />
                <Tooltip />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="hours" name="Sleep Hours" stroke="#8b5cf6" strokeWidth={2} />
                <Line yAxisId="right" type="monotone" dataKey="quality" name="Sleep Quality %" stroke="#14b8a6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* Upcoming appointments */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Upcoming Appointments</h2>
          <div className="space-y-4">
            {healthData.upcomingAppointments.map((appointment) => (
              <div key={appointment.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div className="flex justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">{appointment.doctor}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{appointment.specialty}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900 dark:text-white">
                      {new Date(appointment.date).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{appointment.time}</p>
                  </div>
                </div>
              </div>
            ))}
            <div className="mt-4 text-center">
              <button className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 font-medium">
                Schedule New Appointment
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Health insights and recommendations */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Health Insights</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-green-50 dark:bg-green-900/20 border-l-4 border-green-400 p-4">
            <div className="flex">
              <div>
                <p className="font-medium text-green-800 dark:text-green-200">Consistency</p>
                <p className="text-sm text-green-700 dark:text-green-300 mt-1">Your daily step count has been consistent this week. Keep up the good work!</p>
              </div>
            </div>
          </div>
          
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 p-4">
            <div className="flex">
              <div>
                <p className="font-medium text-yellow-800 dark:text-yellow-200">Recommendation</p>
                <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">Consider adding 30 minutes of meditation to improve your sleep quality.</p>
              </div>
            </div>
          </div>
          
          <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-400 p-4">
            <div className="flex">
              <div>
                <p className="font-medium text-blue-800 dark:text-blue-200">Reminder</p>
                <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">Your annual physical check-up is due next month. Schedule it soon.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HealthcareDashboard;