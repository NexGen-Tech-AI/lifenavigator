'use client';

import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, LineChart, Line, ResponsiveContainer, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, RadarChart, 
  PolarGrid, PolarAngleAxis, Radar
} from 'recharts';

const CareerDashboard = () => {
  // State for career data
  const [careerData, setCareerData] = useState({
    skills: [] as { name: string; level: number; target: number }[],
    jobMatch: [] as { id: string; company: string; title: string; match: number; salary: string; location: string }[],
    networkMetrics: [] as { month: string; connections: number; messages: number }[],
    upcomingEvents: [] as { id: string; title: string; date: string; type: string }[],
    industryTrends: [] as { skill: string; growth: number }[]
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch career data
  useEffect(() => {
    const fetchCareerData = async () => {
      try {
        setLoading(true);
        
        // Mock API calls
        const skillsData = await fetchSkills();
        const jobMatchData = await fetchJobMatches();
        const networkData = await fetchNetworkMetrics();
        const eventsData = await fetchUpcomingEvents();
        const trendsData = await fetchIndustryTrends();
        
        setCareerData({
          skills: skillsData,
          jobMatch: jobMatchData,
          networkMetrics: networkData,
          upcomingEvents: eventsData,
          industryTrends: trendsData
        });
        setLoading(false);
      } catch (err) {
        setError("Failed to load career data");
        setLoading(false);
      }
    };
    
    fetchCareerData();
  }, []);

  // Mock data fetching functions
  const fetchSkills = async () => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return [
      { name: 'Communication', level: 85, target: 90 },
      { name: 'Leadership', level: 70, target: 85 },
      { name: 'Technical', level: 90, target: 95 },
      { name: 'Problem Solving', level: 80, target: 85 },
      { name: 'Project Management', level: 75, target: 90 },
      { name: 'Teamwork', level: 85, target: 90 },
      { name: 'Adaptability', level: 80, target: 85 },
      { name: 'Creativity', level: 65, target: 80 }
    ];
  };
  
  const fetchJobMatches = async () => {
    await new Promise(resolve => setTimeout(resolve, 600));
    return [
      { id: 'job1', company: 'TechCorp', title: 'Senior Developer', match: 92, salary: '$120,000 - $140,000', location: 'Remote' },
      { id: 'job2', company: 'InnovateSoft', title: 'Lead Engineer', match: 87, salary: '$130,000 - $150,000', location: 'San Francisco, CA' },
      { id: 'job3', company: 'DataSystems', title: 'DevOps Engineer', match: 83, salary: '$115,000 - $135,000', location: 'Austin, TX' },
      { id: 'job4', company: 'CloudTech', title: 'Senior Software Engineer', match: 81, salary: '$125,000 - $145,000', location: 'Remote' },
    ];
  };
  
  const fetchNetworkMetrics = async () => {
    await new Promise(resolve => setTimeout(resolve, 550));
    return [
      { month: 'Jan', connections: 5, messages: 12 },
      { month: 'Feb', connections: 8, messages: 15 },
      { month: 'Mar', connections: 12, messages: 20 },
      { month: 'Apr', connections: 9, messages: 18 },
      { month: 'May', connections: 15, messages: 25 },
      { month: 'Jun', connections: 18, messages: 30 }
    ];
  };
  
  const fetchUpcomingEvents = async () => {
    await new Promise(resolve => setTimeout(resolve, 450));
    return [
      { id: 'event1', title: 'Tech Conference 2025', date: '2025-07-15', type: 'Conference' },
      { id: 'event2', title: 'Networking Mixer', date: '2025-06-23', type: 'Networking' },
      { id: 'event3', title: 'Industry Webinar', date: '2025-06-10', type: 'Webinar' },
      { id: 'event4', title: 'Career Fair', date: '2025-07-05', type: 'Fair' },
    ];
  };
  
  const fetchIndustryTrends = async () => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return [
      { skill: 'AI/ML', growth: 85 },
      { skill: 'Cybersecurity', growth: 75 },
      { skill: 'Cloud Computing', growth: 70 },
      { skill: 'Blockchain', growth: 60 },
      { skill: 'Edge Computing', growth: 55 },
    ];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl font-semibold">Loading career data...</div>
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
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Career Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400">Track your professional development and opportunities</p>
      </header>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Career Summary */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md lg:col-span-1">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Career Summary</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
              <span className="font-medium text-gray-700 dark:text-gray-300">Role Readiness</span>
              <span className="font-semibold text-gray-900 dark:text-white">85%</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
              <span className="font-medium text-gray-700 dark:text-gray-300">Network Strength</span>
              <span className="font-semibold text-gray-900 dark:text-white">72%</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
              <span className="font-medium text-gray-700 dark:text-gray-300">Industry Alignment</span>
              <span className="font-semibold text-gray-900 dark:text-white">91%</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
              <span className="font-medium text-gray-700 dark:text-gray-300">Skill Growth</span>
              <span className="font-semibold text-gray-900 dark:text-white">+15%</span>
            </div>
          </div>
        </div>
        
        {/* Skills Radar */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md lg:col-span-2">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Skills Assessment</h2>
          <div className="h-64 md:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={careerData.skills}>
                <PolarGrid />
                <PolarAngleAxis dataKey="name" />
                <Radar name="Current Level" dataKey="level" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                <Radar name="Target Level" dataKey="target" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.6} />
                <Legend />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Top Job Matches */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Top Job Matches</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Position</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Match</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Salary</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Location</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {careerData.jobMatch.map((job) => (
                  <tr key={job.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">{job.title}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{job.company}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-green-600 dark:text-green-400">{job.match}%</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{job.salary}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{job.location}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 text-center">
            <button className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium">
              View All Opportunities
            </button>
          </div>
        </div>
        
        {/* Networking Activity */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Networking Activity</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={careerData.networkMetrics}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="connections" name="New Connections" fill="#8884d8" />
                <Bar dataKey="messages" name="Messages Sent" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Events */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Upcoming Events</h2>
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {careerData.upcomingEvents.map((event) => (
              <div key={event.id} className="py-3 flex justify-between items-center">
                <div>
                  <div className="text-sm font-medium text-gray-900 dark:text-white">{event.title}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">{new Date(event.date).toLocaleDateString()}</div>
                </div>
                <div className="px-2 py-1 text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded">
                  {event.type}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 text-center">
            <button className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium">
              View All Events
            </button>
          </div>
        </div>
        
        {/* Industry Trends */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Industry Trends</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
            Top growing skills in your industry for the next 12 months:
          </p>
          <div className="space-y-4">
            {careerData.industryTrends.map((trend) => (
              <div key={trend.skill} className="relative pt-1">
                <div className="flex items-center justify-between mb-1">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {trend.skill}
                  </div>
                  <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    {trend.growth}% growth
                  </div>
                </div>
                <div className="overflow-hidden h-2 text-xs flex rounded bg-gray-200 dark:bg-gray-700">
                  <div
                    style={{ width: `${trend.growth}%` }}
                    className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-600 dark:bg-blue-500"
                  ></div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded border border-yellow-100 dark:border-yellow-800">
            <p className="text-sm text-yellow-800 dark:text-yellow-300">
              <span className="font-medium">Career Insight:</span> Adding skills in AI/ML could increase your job match score by up to 15%.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CareerDashboard;