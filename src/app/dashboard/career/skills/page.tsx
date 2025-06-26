'use client';

import React, { useState, useEffect } from 'react';
import {
  AcademicCapIcon,
  SparklesIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ClockIcon,
  CheckCircleIcon,
  PlusIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';

interface Skill {
  id: string;
  name: string;
  category: 'technical' | 'soft' | 'business' | 'language';
  level: number; // 1-5
  yearsExperience: number;
  lastUsed: string;
  endorsements: number;
  certifications?: string[];
  projects?: number;
}

interface SkillGap {
  skill: string;
  currentLevel: number;
  requiredLevel: number;
  priority: 'high' | 'medium' | 'low';
  courses: Array<{
    name: string;
    provider: string;
    duration: string;
    cost: string;
  }>;
}

export default function CareerSkillsPage() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [skillGaps, setSkillGaps] = useState<SkillGap[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'current' | 'gaps' | 'development'>('current');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'technical' | 'soft' | 'business' | 'language'>('all');

  useEffect(() => {
    const fetchSkillsData = async () => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSkills([
        {
          id: '1',
          name: 'React',
          category: 'technical',
          level: 5,
          yearsExperience: 5,
          lastUsed: '2025-06-26',
          endorsements: 23,
          certifications: ['React Developer Certificate'],
          projects: 15
        },
        {
          id: '2',
          name: 'Node.js',
          category: 'technical',
          level: 4,
          yearsExperience: 4,
          lastUsed: '2025-06-26',
          endorsements: 18,
          projects: 12
        },
        {
          id: '3',
          name: 'Leadership',
          category: 'soft',
          level: 4,
          yearsExperience: 3,
          lastUsed: '2025-06-25',
          endorsements: 15,
          certifications: ['Agile Leadership']
        },
        {
          id: '4',
          name: 'Communication',
          category: 'soft',
          level: 5,
          yearsExperience: 8,
          lastUsed: '2025-06-26',
          endorsements: 30
        },
        {
          id: '5',
          name: 'Project Management',
          category: 'business',
          level: 3,
          yearsExperience: 2,
          lastUsed: '2025-06-20',
          endorsements: 10,
          certifications: ['PMP Fundamentals']
        },
        {
          id: '6',
          name: 'TypeScript',
          category: 'technical',
          level: 4,
          yearsExperience: 3,
          lastUsed: '2025-06-26',
          endorsements: 20,
          projects: 10
        },
        {
          id: '7',
          name: 'AWS',
          category: 'technical',
          level: 3,
          yearsExperience: 2,
          lastUsed: '2025-06-15',
          endorsements: 12,
          certifications: ['AWS Cloud Practitioner']
        },
        {
          id: '8',
          name: 'Spanish',
          category: 'language',
          level: 3,
          yearsExperience: 5,
          lastUsed: '2025-06-10',
          endorsements: 5
        }
      ]);

      setSkillGaps([
        {
          skill: 'Machine Learning',
          currentLevel: 1,
          requiredLevel: 3,
          priority: 'high',
          courses: [
            {
              name: 'Machine Learning Specialization',
              provider: 'Coursera',
              duration: '3 months',
              cost: '$49/month'
            },
            {
              name: 'Applied ML Course',
              provider: 'Fast.ai',
              duration: '2 months',
              cost: 'Free'
            }
          ]
        },
        {
          skill: 'System Design',
          currentLevel: 2,
          requiredLevel: 4,
          priority: 'high',
          courses: [
            {
              name: 'System Design Interview',
              provider: 'Educative.io',
              duration: '6 weeks',
              cost: '$79'
            }
          ]
        },
        {
          skill: 'Public Speaking',
          currentLevel: 2,
          requiredLevel: 4,
          priority: 'medium',
          courses: [
            {
              name: 'Dynamic Public Speaking',
              provider: 'Udemy',
              duration: '4 weeks',
              cost: '$89.99'
            }
          ]
        }
      ]);

      setLoading(false);
    };

    fetchSkillsData();
  }, []);

  const getLevelLabel = (level: number) => {
    const labels = ['Beginner', 'Novice', 'Intermediate', 'Advanced', 'Expert'];
    return labels[level - 1] || 'Unknown';
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      technical: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
      soft: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
      business: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400',
      language: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      high: 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/20',
      medium: 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/20',
      low: 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/20'
    };
    return colors[priority as keyof typeof colors] || 'text-gray-600 bg-gray-100';
  };

  const filteredSkills = selectedCategory === 'all' 
    ? skills 
    : skills.filter(skill => skill.category === selectedCategory);

  // Prepare data for radar chart
  const radarData = skills
    .filter(skill => skill.category === 'technical')
    .slice(0, 6)
    .map(skill => ({
      skill: skill.name,
      level: skill.level * 20,
      fullMark: 100
    }));

  // Prepare data for skill growth chart
  const growthData = [
    { month: 'Jan', skills: 35 },
    { month: 'Feb', skills: 37 },
    { month: 'Mar', skills: 38 },
    { month: 'Apr', skills: 40 },
    { month: 'May', skills: 42 },
    { month: 'Jun', skills: 45 }
  ];

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
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Skills & Development</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Manage your skills and identify growth opportunities</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('current')}
            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'current'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
            }`}
          >
            Current Skills
          </button>
          <button
            onClick={() => setActiveTab('gaps')}
            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'gaps'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
            }`}
          >
            Skill Gaps
          </button>
          <button
            onClick={() => setActiveTab('development')}
            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'development'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
            }`}
          >
            Development Plan
          </button>
        </nav>
      </div>

      {/* Current Skills Tab */}
      {activeTab === 'current' && (
        <>
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Total Skills</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{skills.length}</p>
                </div>
                <SparklesIcon className="w-8 h-8 text-blue-500" />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Expert Level</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {skills.filter(s => s.level === 5).length}
                  </p>
                </div>
                <ChartBarIcon className="w-8 h-8 text-green-500" />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Certifications</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {skills.reduce((acc, skill) => acc + (skill.certifications?.length || 0), 0)}
                  </p>
                </div>
                <AcademicCapIcon className="w-8 h-8 text-purple-500" />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Endorsements</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {skills.reduce((acc, skill) => acc + skill.endorsements, 0)}
                  </p>
                </div>
                <CheckCircleIcon className="w-8 h-8 text-yellow-500" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Technical Skills Radar */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Technical Skills Overview
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="#e5e7eb" />
                    <PolarAngleAxis dataKey="skill" tick={{ fontSize: 12 }} />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} />
                    <Radar
                      name="Skill Level"
                      dataKey="level"
                      stroke="#3b82f6"
                      fill="#3b82f6"
                      fillOpacity={0.6}
                    />
                    <Tooltip />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Skill Growth Trend */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Skill Growth Trend
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={growthData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="month" stroke="#6b7280" />
                    <YAxis stroke="#6b7280" />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="skills"
                      stroke="#10b981"
                      strokeWidth={3}
                      dot={{ fill: '#10b981', r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Category Filter */}
          <div className="mb-6">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  selectedCategory === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                All Skills
              </button>
              <button
                onClick={() => setSelectedCategory('technical')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  selectedCategory === 'technical'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                Technical
              </button>
              <button
                onClick={() => setSelectedCategory('soft')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  selectedCategory === 'soft'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                Soft Skills
              </button>
              <button
                onClick={() => setSelectedCategory('business')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  selectedCategory === 'business'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                Business
              </button>
              <button
                onClick={() => setSelectedCategory('language')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  selectedCategory === 'language'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                Languages
              </button>
            </div>
          </div>

          {/* Skills List */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">My Skills</h3>
                <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  <PlusIcon className="w-5 h-5 mr-2" />
                  Add Skill
                </button>
              </div>

              <div className="space-y-4">
                {filteredSkills.map((skill) => (
                  <div key={skill.id} className="border-b border-gray-200 dark:border-gray-700 pb-4 last:border-0">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-medium text-gray-900 dark:text-white">{skill.name}</h4>
                          <span className={`px-2 py-1 text-xs font-medium rounded ${getCategoryColor(skill.category)}`}>
                            {skill.category}
                          </span>
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {getLevelLabel(skill.level)}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                          <span className="flex items-center">
                            <ClockIcon className="w-4 h-4 mr-1" />
                            {skill.yearsExperience} years
                          </span>
                          <span>{skill.endorsements} endorsements</span>
                          {skill.certifications && (
                            <span className="flex items-center">
                              <AcademicCapIcon className="w-4 h-4 mr-1" />
                              {skill.certifications.length} cert{skill.certifications.length > 1 ? 's' : ''}
                            </span>
                          )}
                          {skill.projects && (
                            <span>{skill.projects} projects</span>
                          )}
                        </div>
                        {/* Skill Level Bar */}
                        <div className="mt-2 w-full max-w-xs">
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ width: `${(skill.level / 5) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                      <button className="text-gray-400 hover:text-red-600 transition-colors">
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Skill Gaps Tab */}
      {activeTab === 'gaps' && (
        <div className="space-y-6">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6">
            <div className="flex items-start">
              <ArrowTrendingUpIcon className="w-6 h-6 text-yellow-600 dark:text-yellow-400 mr-3 flex-shrink-0" />
              <div>
                <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-200">
                  Skills to Advance Your Career
                </h3>
                <p className="mt-1 text-sm text-yellow-700 dark:text-yellow-300">
                  Based on your career goals and industry trends, we've identified these skill gaps to focus on.
                </p>
              </div>
            </div>
          </div>

          {skillGaps.map((gap, index) => (
            <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {gap.skill}
                </h3>
                <span className={`px-3 py-1 text-xs font-medium rounded-full ${getPriorityColor(gap.priority)}`}>
                  {gap.priority} priority
                </span>
              </div>

              <div className="mb-4">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-gray-600 dark:text-gray-400">Current Level</span>
                  <span className="text-gray-600 dark:text-gray-400">Required Level</span>
                </div>
                <div className="relative">
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                    <div
                      className="absolute top-0 left-0 h-3 bg-blue-600 rounded-full"
                      style={{ width: `${(gap.currentLevel / 5) * 100}%` }}
                    ></div>
                    <div
                      className="absolute top-0 left-0 h-3 bg-blue-300 dark:bg-blue-400 opacity-50 rounded-full"
                      style={{ width: `${(gap.requiredLevel / 5) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                  Recommended Courses
                </h4>
                <div className="space-y-2">
                  {gap.courses.map((course, courseIndex) => (
                    <div key={courseIndex} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{course.name}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {course.provider} • {course.duration}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900 dark:text-white">{course.cost}</p>
                        <button className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
                          Enroll
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Development Plan Tab */}
      {activeTab === 'development' && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Personal Development Plan
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Create a structured plan to develop your skills and advance your career.
          </p>
          
          <div className="space-y-6">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <h4 className="font-medium text-blue-900 dark:text-blue-200 mb-2">
                Q3 2025 Goals
              </h4>
              <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-300">
                <li className="flex items-center">
                  <CheckCircleIcon className="w-4 h-4 mr-2" />
                  Complete AWS Solutions Architect Certification
                </li>
                <li className="flex items-center">
                  <CheckCircleIcon className="w-4 h-4 mr-2" />
                  Improve System Design skills to Advanced level
                </li>
                <li className="flex items-center">
                  <CheckCircleIcon className="w-4 h-4 mr-2" />
                  Learn basics of Machine Learning
                </li>
              </ul>
            </div>

            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                Full development planning features coming soon!
              </p>
              <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                Get Notified
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}