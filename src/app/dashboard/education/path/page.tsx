'use client';

import React, { useState, useEffect } from 'react';
import {
  RocketLaunchIcon,
  AcademicCapIcon,
  CheckCircleIcon,
  LockClosedIcon,
  PlayCircleIcon,
  ChartBarIcon,
  TrophyIcon,
  ClockIcon,
  CalendarIcon,
  SparklesIcon,
  ArrowRightIcon,
  ChevronRightIcon,
  BookOpenIcon,
  BeakerIcon,
  CodeBracketIcon,
  CpuChipIcon,
  GlobeAltIcon,
  LightBulbIcon,
  PuzzlePieceIcon,
  DocumentTextIcon,
  BriefcaseIcon,
  StarIcon,
  FireIcon,
  FlagIcon,
  MapIcon,
  ArrowPathIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleIconSolid } from '@heroicons/react/24/solid';

interface Milestone {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  date?: string;
  skills: string[];
  type: 'course' | 'project' | 'certification' | 'skill';
}

interface PathStage {
  id: string;
  title: string;
  description: string;
  duration: string;
  status: 'completed' | 'current' | 'locked';
  progress: number;
  milestones: Milestone[];
  requiredSkills: string[];
  targetRole?: string;
}

interface LearningPath {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  category: string;
  totalDuration: string;
  currentStage: number;
  totalStages: number;
  progress: number;
  completedMilestones: number;
  totalMilestones: number;
  targetRole: string;
  averageSalary: string;
  demandLevel: 'High' | 'Medium' | 'Low';
  stages: PathStage[];
}

interface Recommendation {
  id: string;
  title: string;
  reason: string;
  match: number;
  icon: React.ReactNode;
}

const mockLearningPaths: LearningPath[] = [
  {
    id: '1',
    title: 'Full Stack Web Developer',
    description: 'Master both front-end and back-end development to build complete web applications',
    icon: <GlobeAltIcon className="w-6 h-6" />,
    category: 'Web Development',
    totalDuration: '8-12 months',
    currentStage: 2,
    totalStages: 5,
    progress: 35,
    completedMilestones: 7,
    totalMilestones: 20,
    targetRole: 'Full Stack Developer',
    averageSalary: '$105,000',
    demandLevel: 'High',
    stages: [
      {
        id: 's1',
        title: 'Foundation: HTML, CSS & JavaScript',
        description: 'Build a solid foundation in web fundamentals',
        duration: '6-8 weeks',
        status: 'completed',
        progress: 100,
        requiredSkills: ['Basic Computer Skills', 'Problem Solving'],
        milestones: [
          {
            id: 'm1',
            title: 'Complete HTML/CSS Fundamentals',
            description: 'Master semantic HTML and modern CSS techniques',
            completed: true,
            date: '2024-01-15',
            skills: ['HTML5', 'CSS3', 'Flexbox', 'Grid'],
            type: 'course'
          },
          {
            id: 'm2',
            title: 'JavaScript Essentials',
            description: 'Learn JavaScript basics and DOM manipulation',
            completed: true,
            date: '2024-02-01',
            skills: ['JavaScript', 'DOM', 'Events', 'ES6+'],
            type: 'course'
          },
          {
            id: 'm3',
            title: 'Build Portfolio Website',
            description: 'Create your first responsive website',
            completed: true,
            date: '2024-02-15',
            skills: ['Responsive Design', 'Git', 'GitHub Pages'],
            type: 'project'
          }
        ]
      },
      {
        id: 's2',
        title: 'Front-End Frameworks',
        description: 'Master modern front-end frameworks and tools',
        duration: '8-10 weeks',
        status: 'current',
        progress: 60,
        requiredSkills: ['JavaScript', 'HTML', 'CSS'],
        milestones: [
          {
            id: 'm4',
            title: 'React Fundamentals',
            description: 'Learn React components, state, and props',
            completed: true,
            date: '2024-03-01',
            skills: ['React', 'JSX', 'Components', 'Hooks'],
            type: 'course'
          },
          {
            id: 'm5',
            title: 'State Management',
            description: 'Master Redux and Context API',
            completed: true,
            date: '2024-03-15',
            skills: ['Redux', 'Context API', 'State Management'],
            type: 'course'
          },
          {
            id: 'm6',
            title: 'Build React Application',
            description: 'Create a complex React application',
            completed: false,
            skills: ['React Router', 'API Integration', 'Testing'],
            type: 'project'
          },
          {
            id: 'm7',
            title: 'TypeScript Mastery',
            description: 'Add type safety to your JavaScript',
            completed: false,
            skills: ['TypeScript', 'Type Systems', 'Generics'],
            type: 'course'
          }
        ]
      },
      {
        id: 's3',
        title: 'Back-End Development',
        description: 'Learn server-side programming and databases',
        duration: '10-12 weeks',
        status: 'locked',
        progress: 0,
        requiredSkills: ['JavaScript', 'Git', 'Command Line'],
        targetRole: 'Back-End Developer',
        milestones: [
          {
            id: 'm8',
            title: 'Node.js & Express',
            description: 'Build RESTful APIs with Node.js',
            completed: false,
            skills: ['Node.js', 'Express', 'REST APIs', 'Middleware'],
            type: 'course'
          },
          {
            id: 'm9',
            title: 'Database Design',
            description: 'Master SQL and NoSQL databases',
            completed: false,
            skills: ['PostgreSQL', 'MongoDB', 'Database Design'],
            type: 'course'
          },
          {
            id: 'm10',
            title: 'Authentication & Security',
            description: 'Implement secure authentication systems',
            completed: false,
            skills: ['JWT', 'OAuth', 'Security Best Practices'],
            type: 'course'
          }
        ]
      },
      {
        id: 's4',
        title: 'DevOps & Deployment',
        description: 'Learn to deploy and maintain applications',
        duration: '6-8 weeks',
        status: 'locked',
        progress: 0,
        requiredSkills: ['Git', 'Linux Basics', 'Networking'],
        milestones: [
          {
            id: 'm11',
            title: 'Docker & Containerization',
            description: 'Master container technology',
            completed: false,
            skills: ['Docker', 'Docker Compose', 'Containers'],
            type: 'course'
          },
          {
            id: 'm12',
            title: 'CI/CD Pipelines',
            description: 'Automate deployment processes',
            completed: false,
            skills: ['GitHub Actions', 'Jenkins', 'CI/CD'],
            type: 'course'
          }
        ]
      },
      {
        id: 's5',
        title: 'Advanced Topics & Specialization',
        description: 'Choose your specialization and master advanced concepts',
        duration: '8-10 weeks',
        status: 'locked',
        progress: 0,
        requiredSkills: ['Full Stack Basics', 'Problem Solving'],
        milestones: [
          {
            id: 'm13',
            title: 'Microservices Architecture',
            description: 'Design scalable applications',
            completed: false,
            skills: ['Microservices', 'API Gateway', 'Service Mesh'],
            type: 'course'
          },
          {
            id: 'm14',
            title: 'Cloud Computing',
            description: 'Deploy on AWS, Azure, or GCP',
            completed: false,
            skills: ['AWS', 'Cloud Architecture', 'Serverless'],
            type: 'certification'
          }
        ]
      }
    ]
  },
  {
    id: '2',
    title: 'Data Science & Machine Learning',
    description: 'Analyze data and build intelligent systems using Python and ML frameworks',
    icon: <BeakerIcon className="w-6 h-6" />,
    category: 'Data Science',
    totalDuration: '10-14 months',
    currentStage: 1,
    totalStages: 6,
    progress: 15,
    completedMilestones: 3,
    totalMilestones: 24,
    targetRole: 'Data Scientist',
    averageSalary: '$120,000',
    demandLevel: 'High',
    stages: [
      {
        id: 'ds1',
        title: 'Python Programming & Mathematics',
        description: 'Build foundation in Python and essential mathematics',
        duration: '8-10 weeks',
        status: 'current',
        progress: 75,
        requiredSkills: ['Basic Programming', 'High School Math'],
        milestones: [
          {
            id: 'dm1',
            title: 'Python Fundamentals',
            description: 'Master Python programming basics',
            completed: true,
            date: '2024-02-01',
            skills: ['Python', 'Data Structures', 'Algorithms'],
            type: 'course'
          },
          {
            id: 'dm2',
            title: 'Statistics & Probability',
            description: 'Essential statistics for data science',
            completed: true,
            date: '2024-02-20',
            skills: ['Statistics', 'Probability', 'Hypothesis Testing'],
            type: 'course'
          },
          {
            id: 'dm3',
            title: 'Linear Algebra',
            description: 'Mathematics for machine learning',
            completed: true,
            date: '2024-03-10',
            skills: ['Matrices', 'Vectors', 'Eigenvalues'],
            type: 'course'
          },
          {
            id: 'dm4',
            title: 'Calculus for ML',
            description: 'Derivatives and optimization',
            completed: false,
            skills: ['Derivatives', 'Gradients', 'Optimization'],
            type: 'course'
          }
        ]
      },
      {
        id: 'ds2',
        title: 'Data Analysis & Visualization',
        description: 'Learn to analyze and visualize data effectively',
        duration: '6-8 weeks',
        status: 'locked',
        progress: 0,
        requiredSkills: ['Python', 'Basic Statistics'],
        milestones: [
          {
            id: 'dm5',
            title: 'Pandas & NumPy Mastery',
            description: 'Data manipulation with Python',
            completed: false,
            skills: ['Pandas', 'NumPy', 'Data Cleaning'],
            type: 'course'
          },
          {
            id: 'dm6',
            title: 'Data Visualization',
            description: 'Create compelling visualizations',
            completed: false,
            skills: ['Matplotlib', 'Seaborn', 'Plotly'],
            type: 'course'
          }
        ]
      }
    ]
  }
];

const recommendations: Recommendation[] = [
  {
    id: '1',
    title: 'AI & Machine Learning Engineer',
    reason: 'Based on your interest in Python and mathematics',
    match: 92,
    icon: <CpuChipIcon className="w-5 h-5" />
  },
  {
    id: '2',
    title: 'Cloud Solutions Architect',
    reason: 'Aligns with your full-stack development progress',
    match: 87,
    icon: <GlobeAltIcon className="w-5 h-5" />
  },
  {
    id: '3',
    title: 'Cybersecurity Specialist',
    reason: 'High demand field with excellent growth potential',
    match: 78,
    icon: <LockClosedIcon className="w-5 h-5" />
  }
];

export default function LearningPathPage() {
  const [activePath, setActivePath] = useState<LearningPath | null>(null);
  const [paths, setPaths] = useState<LearningPath[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreatePath, setShowCreatePath] = useState(false);
  const [activeTab, setActiveTab] = useState<'current' | 'explore' | 'completed'>('current');
  const [editingMilestone, setEditingMilestone] = useState<string | null>(null);

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setPaths(mockLearningPaths);
      setActivePath(mockLearningPaths[0]);
      setLoading(false);
    }, 1000);
  }, []);

  const getStageIcon = (stage: PathStage) => {
    if (stage.status === 'completed') return <CheckCircleIconSolid className="w-6 h-6 text-green-500" />;
    if (stage.status === 'current') return <PlayCircleIcon className="w-6 h-6 text-blue-500" />;
    return <LockClosedIcon className="w-6 h-6 text-gray-400" />;
  };

  const getMilestoneIcon = (type: Milestone['type']) => {
    switch (type) {
      case 'course': return <BookOpenIcon className="w-4 h-4" />;
      case 'project': return <CodeBracketIcon className="w-4 h-4" />;
      case 'certification': return <AcademicCapIcon className="w-4 h-4" />;
      case 'skill': return <SparklesIcon className="w-4 h-4" />;
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
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Learning Path</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Track your progress and plan your learning journey
            </p>
          </div>
          <button
            onClick={() => setShowCreatePath(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <PlusIcon className="w-5 h-5" />
            Create Custom Path
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-6 border-b border-gray-200 dark:border-gray-700 mb-6">
        <button
          onClick={() => setActiveTab('current')}
          className={`pb-3 px-1 border-b-2 font-medium transition-colors ${
            activeTab === 'current'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          Current Paths
        </button>
        <button
          onClick={() => setActiveTab('explore')}
          className={`pb-3 px-1 border-b-2 font-medium transition-colors ${
            activeTab === 'explore'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          Explore Paths
        </button>
        <button
          onClick={() => setActiveTab('completed')}
          className={`pb-3 px-1 border-b-2 font-medium transition-colors ${
            activeTab === 'completed'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          Completed
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Path List */}
        <div className="lg:col-span-1 space-y-4">
          {/* Active Paths */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold mb-4">Your Paths</h2>
            <div className="space-y-3">
              {paths.map((path) => (
                <div
                  key={path.id}
                  onClick={() => setActivePath(path)}
                  className={`p-4 rounded-lg cursor-pointer transition-all ${
                    activePath?.id === path.id
                      ? 'bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-500'
                      : 'bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg text-blue-600 dark:text-blue-400">
                      {path.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 dark:text-white">{path.title}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Stage {path.currentStage} of {path.totalStages}
                      </p>
                      <div className="mt-2">
                        <div className="flex justify-between text-xs mb-1">
                          <span>Progress</span>
                          <span>{path.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${path.progress}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recommendations */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold mb-4">Recommended for You</h2>
            <div className="space-y-3">
              {recommendations.map((rec) => (
                <div
                  key={rec.id}
                  className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer"
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg text-green-600 dark:text-green-400">
                      {rec.icon}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{rec.title}</h4>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{rec.reason}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <div className="flex-1 bg-gray-200 dark:bg-gray-600 rounded-full h-1.5">
                          <div
                            className="bg-green-500 h-1.5 rounded-full"
                            style={{ width: `${rec.match}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium text-green-600 dark:text-green-400">
                          {rec.match}% match
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Path Details */}
        {activePath && (
          <div className="lg:col-span-2 space-y-6">
            {/* Path Overview */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg text-blue-600 dark:text-blue-400">
                    {activePath.icon}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      {activePath.title}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                      {activePath.description}
                    </p>
                  </div>
                </div>
              </div>

              {/* Path Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Duration</p>
                  <p className="font-semibold">{activePath.totalDuration}</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Target Role</p>
                  <p className="font-semibold">{activePath.targetRole}</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Avg. Salary</p>
                  <p className="font-semibold">{activePath.averageSalary}</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Demand</p>
                  <p className={`font-semibold ${
                    activePath.demandLevel === 'High' ? 'text-green-600' :
                    activePath.demandLevel === 'Medium' ? 'text-yellow-600' :
                    'text-red-600'
                  }`}>
                    {activePath.demandLevel}
                  </p>
                </div>
              </div>

              {/* Overall Progress */}
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">Overall Progress</span>
                  <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {activePath.progress}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-3 mb-2">
                  <div
                    className="bg-blue-600 h-3 rounded-full"
                    style={{ width: `${activePath.progress}%` }}
                  />
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {activePath.completedMilestones} of {activePath.totalMilestones} milestones completed
                </p>
              </div>
            </div>

            {/* Learning Stages */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold mb-6">Learning Stages</h3>
              <div className="space-y-6">
                {activePath.stages.map((stage, index) => (
                  <div key={stage.id} className="relative">
                    {/* Stage Connection Line */}
                    {index < activePath.stages.length - 1 && (
                      <div className="absolute left-3 top-10 bottom-0 w-0.5 bg-gray-300 dark:bg-gray-600" />
                    )}

                    {/* Stage Content */}
                    <div className="flex gap-4">
                      <div className="flex-shrink-0 relative z-10">
                        {getStageIcon(stage)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="font-semibold text-gray-900 dark:text-white">
                              {stage.title}
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {stage.description}
                            </p>
                          </div>
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {stage.duration}
                          </span>
                        </div>

                        {/* Stage Progress */}
                        {stage.status !== 'locked' && (
                          <div className="mb-4">
                            <div className="flex justify-between text-sm mb-1">
                              <span>Progress</span>
                              <span>{stage.progress}%</span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full ${
                                  stage.status === 'completed' ? 'bg-green-500' : 'bg-blue-500'
                                }`}
                                style={{ width: `${stage.progress}%` }}
                              />
                            </div>
                          </div>
                        )}

                        {/* Required Skills */}
                        {stage.requiredSkills.length > 0 && (
                          <div className="mb-4">
                            <p className="text-sm font-medium mb-2">Prerequisites:</p>
                            <div className="flex flex-wrap gap-2">
                              {stage.requiredSkills.map((skill, idx) => (
                                <span
                                  key={idx}
                                  className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs"
                                >
                                  {skill}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Milestones */}
                        <div className="space-y-3">
                          {stage.milestones.map((milestone) => (
                            <div
                              key={milestone.id}
                              className={`p-3 rounded-lg border ${
                                milestone.completed
                                  ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                                  : stage.status === 'locked'
                                  ? 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 opacity-50'
                                  : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                              }`}
                            >
                              <div className="flex items-start gap-3">
                                <div className={`mt-0.5 ${
                                  milestone.completed ? 'text-green-600' : 'text-gray-400'
                                }`}>
                                  {milestone.completed ? (
                                    <CheckCircleIconSolid className="w-5 h-5" />
                                  ) : (
                                    <div className="w-5 h-5 rounded-full border-2 border-current" />
                                  )}
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-start justify-between">
                                    <div>
                                      <div className="flex items-center gap-2">
                                        {getMilestoneIcon(milestone.type)}
                                        <h5 className="font-medium text-gray-900 dark:text-white">
                                          {milestone.title}
                                        </h5>
                                      </div>
                                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                        {milestone.description}
                                      </p>
                                      {milestone.skills.length > 0 && (
                                        <div className="flex flex-wrap gap-1 mt-2">
                                          {milestone.skills.map((skill, idx) => (
                                            <span
                                              key={idx}
                                              className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded text-xs"
                                            >
                                              {skill}
                                            </span>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                    {milestone.date && (
                                      <span className="text-xs text-gray-500 dark:text-gray-400">
                                        {new Date(milestone.date).toLocaleDateString()}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Start/Continue Button */}
                        {stage.status === 'current' && (
                          <button className="mt-4 flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                            <PlayCircleIcon className="w-5 h-5" />
                            Continue Learning
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Study Streak & Achievements */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Study Streak */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <FireIcon className="w-6 h-6 text-orange-500" />
                  Study Streak
                </h3>
                <div className="text-center">
                  <p className="text-4xl font-bold text-orange-500">12</p>
                  <p className="text-gray-600 dark:text-gray-400">days in a row</p>
                  <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                    Keep it up! You're on fire!
                  </p>
                </div>
              </div>

              {/* Recent Achievements */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <TrophyIcon className="w-6 h-6 text-yellow-500" />
                  Recent Achievements
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded">
                      <StarIcon className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">JavaScript Master</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        Completed all JS modules
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded">
                      <RocketLaunchIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">Quick Learner</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        Finished 3 courses this month
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}