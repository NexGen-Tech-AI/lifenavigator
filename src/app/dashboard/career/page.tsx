'use client';

import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, LineChart, Line, ResponsiveContainer, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, RadarChart, 
  PolarGrid, PolarAngleAxis, Radar
} from 'recharts';
import { CheckCircleIcon, BriefcaseIcon, UserGroupIcon, StarIcon } from '@heroicons/react/24/outline';

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
      { skill: 'AI/Machine Learning', growth: 78 },
      { skill: 'Cloud Computing', growth: 65 },
      { skill: 'Data Analytics', growth: 62 },
      { skill: 'Cybersecurity', growth: 58 },
      { skill: 'DevOps', growth: 55 }
    ];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Career Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Track your professional growth and opportunities</p>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Skills Mastered</h3>
            <CheckCircleIcon className="h-5 w-5 text-green-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">12</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">+3 this quarter</p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Job Matches</h3>
            <BriefcaseIcon className="h-5 w-5 text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">24</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Above 80% match</p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Network Size</h3>
            <UserGroupIcon className="h-5 w-5 text-purple-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">342</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">+67 new connections</p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Avg. Match Score</h3>
            <StarIcon className="h-5 w-5 text-yellow-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">87%</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Top 10% in your field</p>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Skills Assessment Radar */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Skills Assessment</h2>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={careerData.skills}>
              <PolarGrid stroke="#e5e7eb" />
              <PolarAngleAxis dataKey="name" tick={{ fontSize: 12 }} />
              <Radar name="Current" dataKey="level" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.6} />
              <Radar name="Target" dataKey="target" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.3} />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
        </div>
        
        {/* Job Match Table */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Top Job Matches</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b dark:border-gray-700">
                  <th className="text-left py-2 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">Position</th>
                  <th className="text-left py-2 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">Match</th>
                  <th className="text-left py-2 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">Salary</th>
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
                      <div className="flex items-center">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{job.match}%</div>
                        <div className="ml-2 w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div className="bg-purple-600 h-2 rounded-full" style={{ width: `${job.match}%` }}></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {job.salary}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Network Activity */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Networking Activity</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={careerData.networkMetrics}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip />
              <Bar dataKey="connections" fill="#8b5cf6" name="New Connections" />
              <Bar dataKey="messages" fill="#06b6d4" name="Messages" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        {/* Upcoming Events */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Upcoming Events</h2>
          <div className="space-y-3">
            {careerData.upcomingEvents.map((event) => (
              <div key={event.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">{event.title}</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {new Date(event.date).toLocaleDateString()} • {event.type}
                  </p>
                </div>
                <button className="px-3 py-1 text-sm bg-purple-600 text-white rounded hover:bg-purple-700">
                  Register
                </button>
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