'use client';

import React, { useState, useEffect } from 'react';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from 'recharts';

const EducationDashboard = () => {
  // State for education data
  const [educationData, setEducationData] = useState({
    enrolledCourses: [] as { id: string; title: string; provider: string; progress: number; dueDate: string | null }[],
    completedCourses: 0,
    inProgressCourses: 0,
    certifications: [] as { id: string; name: string; provider: string; status: 'completed' | 'in_progress'; expiryDate: string | null }[],
    learningHours: [] as { week: string; hours: number }[],
    skillProgress: [] as { skill: string; level: number; target: number }[]
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Colors for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

  // Fetch education data
  useEffect(() => {
    const fetchEducationData = async () => {
      try {
        setLoading(true);
        
        // Mock API calls
        const coursesData = await fetchCourses();
        const statsData = await fetchEducationStats();
        const certificationsData = await fetchCertifications();
        const hoursData = await fetchLearningHours();
        const skillsData = await fetchSkillProgress();
        
        setEducationData({
          enrolledCourses: coursesData,
          completedCourses: statsData.completed,
          inProgressCourses: statsData.inProgress,
          certifications: certificationsData,
          learningHours: hoursData,
          skillProgress: skillsData
        });
        setLoading(false);
      } catch (err) {
        setError("Failed to load education data");
        setLoading(false);
      }
    };
    
    fetchEducationData();
  }, []);

  // Mock data fetching functions
  const fetchCourses = async () => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return [
      { id: 'course1', title: 'Advanced Machine Learning', provider: 'Coursera', progress: 75, dueDate: '2025-06-30' },
      { id: 'course2', title: 'Cloud Architecture', provider: 'AWS', progress: 45, dueDate: '2025-07-15' },
      { id: 'course3', title: 'Cybersecurity Fundamentals', provider: 'Udemy', progress: 90, dueDate: '2025-06-10' },
      { id: 'course4', title: 'Data Science with Python', provider: 'edX', progress: 20, dueDate: '2025-08-01' },
    ];
  };
  
  const fetchEducationStats = async () => {
    await new Promise(resolve => setTimeout(resolve, 400));
    return {
      completed: 12,
      inProgress: 4
    };
  };
  
  const fetchCertifications = async () => {
    await new Promise(resolve => setTimeout(resolve, 450));
    return [
      { id: 'cert1', name: 'AWS Certified Solutions Architect', provider: 'Amazon', status: 'completed' as const, expiryDate: '2027-05-20' },
      { id: 'cert2', name: 'Google Cloud Professional', provider: 'Google', status: 'in_progress' as const, expiryDate: null },
      { id: 'cert3', name: 'Microsoft Azure Administrator', provider: 'Microsoft', status: 'completed' as const, expiryDate: '2026-10-15' },
    ];
  };
  
  const fetchLearningHours = async () => {
    await new Promise(resolve => setTimeout(resolve, 550));
    return [
      { week: 'Week 1', hours: 8 },
      { week: 'Week 2', hours: 6 },
      { week: 'Week 3', hours: 10 },
      { week: 'Week 4', hours: 5 },
      { week: 'Week 5', hours: 12 },
      { week: 'Week 6', hours: 7 },
    ];
  };
  
  const fetchSkillProgress = async () => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return [
      { skill: 'Programming', level: 85, target: 90 },
      { skill: 'Data Analysis', level: 70, target: 85 },
      { skill: 'Cloud Computing', level: 60, target: 80 },
      { skill: 'Cybersecurity', level: 45, target: 75 },
      { skill: 'Machine Learning', level: 55, target: 80 },
    ];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl font-semibold">Loading education data...</div>
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

  // Calculate course statistics
  const totalCourses = educationData.completedCourses + educationData.inProgressCourses;
  const courseCompletionData = [
    { name: 'Completed', value: educationData.completedCourses },
    { name: 'In Progress', value: educationData.inProgressCourses },
  ];

  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Education Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400">Tracking your learning journey</p>
      </header>
      
      {/* Education summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">Courses Completed</h2>
          <div className="flex items-end space-x-2">
            <div className="text-3xl font-bold text-amber-600 dark:text-amber-500">{educationData.completedCourses}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400 pb-1">of {totalCourses} total</div>
          </div>
          <div className="mt-4 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
            <div 
              className="bg-amber-600 h-2.5 rounded-full" 
              style={{ width: `${totalCourses > 0 ? (educationData.completedCourses / totalCourses) * 100 : 0}%` }}
            ></div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">Active Certifications</h2>
          <div className="text-3xl font-bold text-amber-600 dark:text-amber-500">
            {educationData.certifications.filter(cert => cert.status === 'completed').length}
          </div>
          <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {educationData.certifications.filter(cert => cert.status === 'in_progress').length} in progress
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">Learning Hours</h2>
          <div className="text-3xl font-bold text-amber-600 dark:text-amber-500">
            {educationData.learningHours.reduce((total, week) => total + week.hours, 0)}
          </div>
          <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Last 6 weeks
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Current courses */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Current Courses</h2>
          <div className="space-y-4">
            {educationData.enrolledCourses.map((course) => (
              <div key={course.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">{course.title}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{course.provider}</p>
                  </div>
                  <div className="px-2 py-1 text-xs font-medium rounded-full bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200">
                    {course.progress}% Complete
                  </div>
                </div>
                
                <div className="mt-3 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-amber-600 h-2 rounded-full" 
                    style={{ width: `${course.progress}%` }}
                  ></div>
                </div>
                
                {course.dueDate && (
                  <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                    Due: {new Date(course.dueDate).toLocaleDateString()}
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="mt-4 text-center">
            <button className="text-amber-600 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-300 font-medium">
              View All Courses
            </button>
          </div>
        </div>
        
        {/* Learning activity */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Learning Activity</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={educationData.learningHours}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" />
                <YAxis label={{ value: 'Hours', angle: -90, position: 'insideLeft' }} />
                <Tooltip formatter={(value) => [`${value} hours`, 'Time Spent']} />
                <Bar dataKey="hours" fill="#facc15" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Skill progress */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Skill Progress</h2>
          <div className="space-y-4">
            {educationData.skillProgress.map((skill) => (
              <div key={skill.skill} className="relative pt-1">
                <div className="flex items-center justify-between mb-1">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {skill.skill}
                  </div>
                  <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    {skill.level}% / {skill.target}%
                  </div>
                </div>
                <div className="overflow-hidden h-2 text-xs flex rounded bg-gray-200 dark:bg-gray-700">
                  <div
                    style={{ width: `${skill.level}%` }}
                    className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-amber-600 dark:bg-amber-500"
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Course completion */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Course Completion</h2>
          <div className="flex items-center justify-center h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={courseCompletionData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {courseCompletionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [value, 'Courses']} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      
      {/* Certifications */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Certifications</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white dark:bg-gray-800">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Certification</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Provider</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Expiry Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {educationData.certifications.map((cert) => (
                <tr key={cert.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    {cert.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {cert.provider}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      cert.status === 'completed' 
                        ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' 
                        : 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'
                    }`}>
                      {cert.status === 'completed' ? 'Completed' : 'In Progress'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {cert.expiryDate ? new Date(cert.expiryDate).toLocaleDateString() : 'N/A'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 text-center">
          <button className="text-amber-600 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-300 font-medium">
            View All Certifications
          </button>
        </div>
      </div>
      
      {/* Learning insights */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Learning Insights</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-400 p-4">
            <div className="flex">
              <div>
                <p className="font-medium text-blue-800 dark:text-blue-200">Learning Habit</p>
                <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">You learn best in the evening. Consider scheduling focused study time between 7-9pm.</p>
              </div>
            </div>
          </div>
          
          <div className="bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-400 p-4">
            <div className="flex">
              <div>
                <p className="font-medium text-amber-800 dark:text-amber-200">Career Impact</p>
                <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">Completing your Cloud certification could increase your job opportunities by 35%.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EducationDashboard;