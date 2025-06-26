'use client';

import React, { useState, useEffect } from 'react';
import {
  AcademicCapIcon,
  BookOpenIcon,
  ClockIcon,
  StarIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  ChevronDownIcon,
  UserIcon,
  CalendarIcon,
  VideoCameraIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  PlayCircleIcon,
  LockClosedIcon,
  ChartBarIcon,
  BuildingLibraryIcon,
  TagIcon,
  ArrowRightIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';

interface Course {
  id: string;
  title: string;
  description: string;
  school: string;
  schoolLogo?: string;
  instructor: string;
  instructorImage?: string;
  duration: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  rating: number;
  totalRatings: number;
  enrolled: number;
  price: number;
  originalPrice?: number;
  thumbnail: string;
  category: string;
  subcategory?: string;
  tags: string[];
  degreeProgram?: string;
  certificateType?: 'Course Certificate' | 'Professional Certificate' | 'Specialization' | 'Degree' | 'MicroMasters';
  progress?: number;
  isEnrolled: boolean;
  startDate?: string;
  endDate?: string;
  modules: number;
  completedModules?: number;
  estimatedWeeks: number;
  language: string;
  subtitles: string[];
  prerequisites?: string[];
  skills: string[];
  lastAccessed?: string;
}

interface School {
  id: string;
  name: string;
  logo?: string;
  description: string;
  courseCount: number;
  studentCount: number;
  rating: number;
}

interface FilterOptions {
  schools: string[];
  levels: string[];
  categories: string[];
  certificateTypes: string[];
  priceRange: [number, number];
  duration: string[];
  ratings: number[];
}

const schools: School[] = [
  {
    id: 'mit',
    name: 'Massachusetts Institute of Technology',
    logo: '🏛️',
    description: 'World-renowned institution for technology and innovation',
    courseCount: 42,
    studentCount: 125000,
    rating: 4.9
  },
  {
    id: 'stanford',
    name: 'Stanford University',
    logo: '🌲',
    description: 'Leading university in computer science and entrepreneurship',
    courseCount: 38,
    studentCount: 98000,
    rating: 4.8
  },
  {
    id: 'harvard',
    name: 'Harvard University',
    logo: '🏛️',
    description: 'Excellence in business, law, and liberal arts',
    courseCount: 56,
    studentCount: 156000,
    rating: 4.9
  },
  {
    id: 'coursera',
    name: 'Coursera',
    logo: '📚',
    description: 'Professional certificates and career development',
    courseCount: 124,
    studentCount: 450000,
    rating: 4.7
  },
  {
    id: 'udacity',
    name: 'Udacity',
    logo: '🚀',
    description: 'Nanodegrees in cutting-edge technology',
    courseCount: 28,
    studentCount: 67000,
    rating: 4.6
  }
];

const mockCourses: Course[] = [
  {
    id: '1',
    title: 'Machine Learning Specialization',
    description: 'Master machine learning fundamentals in this comprehensive program from Stanford University and DeepLearning.AI',
    school: 'Stanford University',
    schoolLogo: '🌲',
    instructor: 'Andrew Ng',
    instructorImage: '👨‍🏫',
    duration: '3 months',
    level: 'Intermediate',
    rating: 4.9,
    totalRatings: 45231,
    enrolled: 2854320,
    price: 49,
    originalPrice: 79,
    thumbnail: '🤖',
    category: 'Computer Science',
    subcategory: 'Machine Learning',
    tags: ['Python', 'TensorFlow', 'Neural Networks', 'Deep Learning'],
    certificateType: 'Specialization',
    degreeProgram: 'Computer Science',
    progress: 65,
    isEnrolled: true,
    startDate: '2024-01-15',
    modules: 12,
    completedModules: 8,
    estimatedWeeks: 12,
    language: 'English',
    subtitles: ['Spanish', 'Chinese', 'Hindi', 'Arabic'],
    prerequisites: ['Basic Python', 'Linear Algebra', 'Calculus'],
    skills: ['Supervised Learning', 'Neural Networks', 'Decision Trees', 'Clustering'],
    lastAccessed: '2 hours ago'
  },
  {
    id: '2',
    title: 'CS50: Introduction to Computer Science',
    description: 'Harvard\'s introduction to the intellectual enterprises of computer science and the art of programming',
    school: 'Harvard University',
    schoolLogo: '🏛️',
    instructor: 'David J. Malan',
    instructorImage: '👨‍🏫',
    duration: '11 weeks',
    level: 'Beginner',
    rating: 4.8,
    totalRatings: 89456,
    enrolled: 3567890,
    price: 0,
    thumbnail: '💻',
    category: 'Computer Science',
    subcategory: 'Programming',
    tags: ['C', 'Python', 'SQL', 'JavaScript', 'HTML/CSS'],
    certificateType: 'Course Certificate',
    degreeProgram: 'Computer Science',
    progress: 30,
    isEnrolled: true,
    startDate: '2024-02-01',
    modules: 10,
    completedModules: 3,
    estimatedWeeks: 11,
    language: 'English',
    subtitles: ['Spanish', 'Portuguese', 'French', 'German'],
    skills: ['Problem Solving', 'Algorithms', 'Data Structures', 'Web Development'],
    lastAccessed: '1 day ago'
  },
  {
    id: '3',
    title: 'Google Data Analytics Professional Certificate',
    description: 'Prepare for a new career in the high-growth field of data analytics with Google\'s professional training',
    school: 'Coursera',
    schoolLogo: '📚',
    instructor: 'Google Career Certificates',
    instructorImage: '🎓',
    duration: '6 months',
    level: 'Beginner',
    rating: 4.7,
    totalRatings: 67890,
    enrolled: 987654,
    price: 39,
    thumbnail: '📊',
    category: 'Data Science',
    subcategory: 'Data Analytics',
    tags: ['SQL', 'R', 'Tableau', 'Data Visualization'],
    certificateType: 'Professional Certificate',
    progress: 0,
    isEnrolled: false,
    modules: 8,
    estimatedWeeks: 24,
    language: 'English',
    subtitles: ['Spanish', 'Arabic', 'French', 'Portuguese'],
    skills: ['Data Cleaning', 'Data Analysis', 'Data Visualization', 'SQL'],
    prerequisites: ['No prior experience required']
  },
  {
    id: '4',
    title: 'MIT MicroMasters in Finance',
    description: 'Advance your career with MIT\'s MicroMasters program in Finance, featuring rigorous courses in modern finance',
    school: 'Massachusetts Institute of Technology',
    schoolLogo: '🏛️',
    instructor: 'MIT Faculty',
    instructorImage: '👨‍🏫',
    duration: '12 months',
    level: 'Advanced',
    rating: 4.9,
    totalRatings: 12345,
    enrolled: 45678,
    price: 1500,
    originalPrice: 2000,
    thumbnail: '💰',
    category: 'Business',
    subcategory: 'Finance',
    tags: ['Financial Markets', 'Corporate Finance', 'Derivatives', 'Risk Management'],
    certificateType: 'MicroMasters',
    degreeProgram: 'Master of Finance',
    progress: 0,
    isEnrolled: false,
    modules: 20,
    estimatedWeeks: 52,
    language: 'English',
    subtitles: ['Chinese', 'Spanish'],
    prerequisites: ['Calculus', 'Probability', 'Statistics', 'Microeconomics'],
    skills: ['Financial Analysis', 'Portfolio Management', 'Quantitative Finance', 'Financial Modeling']
  },
  {
    id: '5',
    title: 'Full Stack Web Development Nanodegree',
    description: 'Become a full stack web developer with this comprehensive program covering both front-end and back-end technologies',
    school: 'Udacity',
    schoolLogo: '🚀',
    instructor: 'Industry Professionals',
    instructorImage: '👥',
    duration: '4 months',
    level: 'Intermediate',
    rating: 4.6,
    totalRatings: 23456,
    enrolled: 156789,
    price: 399,
    thumbnail: '🌐',
    category: 'Computer Science',
    subcategory: 'Web Development',
    tags: ['React', 'Node.js', 'PostgreSQL', 'Docker', 'AWS'],
    certificateType: 'Professional Certificate',
    progress: 45,
    isEnrolled: true,
    startDate: '2024-01-01',
    modules: 16,
    completedModules: 7,
    estimatedWeeks: 16,
    language: 'English',
    subtitles: ['Spanish', 'Portuguese'],
    prerequisites: ['HTML/CSS', 'JavaScript', 'Basic Programming'],
    skills: ['React Development', 'API Design', 'Database Management', 'Cloud Deployment'],
    lastAccessed: '3 days ago'
  }
];

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSchool, setSelectedSchool] = useState<string>('all');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [selectedCertificateType, setSelectedCertificateType] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<'popularity' | 'rating' | 'newest' | 'price'>('popularity');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showEnrolledOnly, setShowEnrolledOnly] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [showCourseDetails, setShowCourseDetails] = useState(false);

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setCourses(mockCourses);
      setFilteredCourses(mockCourses);
      setLoading(false);
    }, 1000);
  }, []);

  useEffect(() => {
    filterCourses();
  }, [selectedSchool, selectedLevel, selectedCertificateType, selectedCategory, searchQuery, showEnrolledOnly, sortBy, courses]);

  const filterCourses = () => {
    let filtered = [...courses];

    // Filter by enrollment status
    if (showEnrolledOnly) {
      filtered = filtered.filter(course => course.isEnrolled);
    }

    // Filter by school
    if (selectedSchool !== 'all') {
      filtered = filtered.filter(course => course.school === selectedSchool);
    }

    // Filter by level
    if (selectedLevel !== 'all') {
      filtered = filtered.filter(course => course.level === selectedLevel);
    }

    // Filter by certificate type
    if (selectedCertificateType !== 'all') {
      filtered = filtered.filter(course => course.certificateType === selectedCertificateType);
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(course => course.category === selectedCategory);
    }

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(course =>
        course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.instructor.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Sort courses
    switch (sortBy) {
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'newest':
        filtered.sort((a, b) => (b.startDate || '').localeCompare(a.startDate || ''));
        break;
      case 'price':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'popularity':
      default:
        filtered.sort((a, b) => b.enrolled - a.enrolled);
        break;
    }

    setFilteredCourses(filtered);
  };

  const getUniqueValues = (key: keyof Course) => {
    const values = courses.map(course => course[key]).filter(Boolean);
    return [...new Set(values)];
  };

  const CourseCard = ({ course }: { course: Course }) => (
    <div
      className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer"
      onClick={() => {
        setSelectedCourse(course);
        setShowCourseDetails(true);
      }}
    >
      {/* Thumbnail */}
      <div className="relative h-48 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-t-lg flex items-center justify-center">
        <span className="text-6xl">{course.thumbnail}</span>
        {course.isEnrolled && course.progress !== undefined && (
          <div className="absolute bottom-0 left-0 right-0 bg-black/50 p-2">
            <div className="flex items-center justify-between text-white text-sm mb-1">
              <span>Progress</span>
              <span>{course.progress}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div
                className="bg-green-500 h-2 rounded-full"
                style={{ width: `${course.progress}%` }}
              />
            </div>
          </div>
        )}
        {course.originalPrice && (
          <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-sm font-semibold">
            {Math.round(((course.originalPrice - course.price) / course.originalPrice) * 100)}% OFF
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {/* School and Certificate Type */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <span>{course.schoolLogo}</span>
            <span className="truncate">{course.school}</span>
          </div>
          {course.certificateType && (
            <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded">
              {course.certificateType}
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
          {course.title}
        </h3>

        {/* Instructor */}
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
          {course.instructor}
        </p>

        {/* Stats */}
        <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-3">
          <div className="flex items-center gap-1">
            <StarIconSolid className="w-4 h-4 text-yellow-500" />
            <span>{course.rating}</span>
            <span>({course.totalRatings.toLocaleString()})</span>
          </div>
          <div className="flex items-center gap-1">
            <UserIcon className="w-4 h-4" />
            <span>{course.enrolled.toLocaleString()}</span>
          </div>
        </div>

        {/* Level and Duration */}
        <div className="flex items-center justify-between mb-3">
          <span className={`text-xs px-2 py-1 rounded ${
            course.level === 'Beginner' ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' :
            course.level === 'Intermediate' ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200' :
            course.level === 'Advanced' ? 'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200' :
            'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
          }`}>
            {course.level}
          </span>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            <ClockIcon className="w-4 h-4 inline mr-1" />
            {course.duration}
          </span>
        </div>

        {/* Price or Status */}
        <div className="flex items-center justify-between">
          {course.isEnrolled ? (
            <button className="flex items-center gap-2 text-green-600 dark:text-green-400 font-medium">
              <PlayCircleIcon className="w-5 h-5" />
              Continue Learning
            </button>
          ) : (
            <div className="flex items-center gap-2">
              {course.price === 0 ? (
                <span className="text-green-600 dark:text-green-400 font-semibold">Free</span>
              ) : (
                <>
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">
                    ${course.price}
                  </span>
                  {course.originalPrice && (
                    <span className="text-sm text-gray-500 line-through">
                      ${course.originalPrice}
                    </span>
                  )}
                </>
              )}
            </div>
          )}
          {course.lastAccessed && (
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {course.lastAccessed}
            </span>
          )}
        </div>
      </div>
    </div>
  );

  const CourseDetailsModal = () => {
    if (!selectedCourse) return null;

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 flex justify-between items-start">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {selectedCourse.title}
            </h2>
            <button
              onClick={() => setShowCourseDetails(false)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* School and Instructor */}
            <div className="flex items-center gap-6 mb-6">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{selectedCourse.schoolLogo}</span>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{selectedCourse.school}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Institution</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-2xl">{selectedCourse.instructorImage}</span>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{selectedCourse.instructor}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Instructor</p>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">About this course</h3>
              <p className="text-gray-600 dark:text-gray-400">{selectedCourse.description}</p>
            </div>

            {/* Course Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Left Column */}
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Course Information</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Duration</span>
                      <span>{selectedCourse.duration} ({selectedCourse.estimatedWeeks} weeks)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Level</span>
                      <span>{selectedCourse.level}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Language</span>
                      <span>{selectedCourse.language}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Subtitles</span>
                      <span>{selectedCourse.subtitles.join(', ')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Certificate</span>
                      <span>{selectedCourse.certificateType}</span>
                    </div>
                    {selectedCourse.degreeProgram && (
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Degree Program</span>
                        <span>{selectedCourse.degreeProgram}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Prerequisites */}
                {selectedCourse.prerequisites && (
                  <div>
                    <h4 className="font-medium mb-2">Prerequisites</h4>
                    <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-400">
                      {selectedCourse.prerequisites.map((prereq, index) => (
                        <li key={index}>{prereq}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                {/* Skills */}
                <div>
                  <h4 className="font-medium mb-2">Skills you'll gain</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedCourse.skills.map((skill, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Tags */}
                <div>
                  <h4 className="font-medium mb-2">Technologies</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedCourse.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Stats */}
                <div>
                  <h4 className="font-medium mb-2">Course Stats</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Rating</span>
                      <div className="flex items-center gap-1">
                        <StarIconSolid className="w-4 h-4 text-yellow-500" />
                        <span>{selectedCourse.rating} ({selectedCourse.totalRatings.toLocaleString()} reviews)</span>
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Students Enrolled</span>
                      <span>{selectedCourse.enrolled.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Total Modules</span>
                      <span>{selectedCourse.modules}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Progress (if enrolled) */}
            {selectedCourse.isEnrolled && selectedCourse.progress !== undefined && (
              <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <h4 className="font-medium mb-2">Your Progress</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Completed {selectedCourse.completedModules} of {selectedCourse.modules} modules</span>
                    <span>{selectedCourse.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                    <div
                      className="bg-green-500 h-3 rounded-full"
                      style={{ width: `${selectedCourse.progress}%` }}
                    />
                  </div>
                  {selectedCourse.startDate && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Started on {new Date(selectedCourse.startDate).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
              <div>
                {selectedCourse.price === 0 ? (
                  <span className="text-2xl font-bold text-green-600 dark:text-green-400">Free</span>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="text-3xl font-bold text-gray-900 dark:text-white">
                      ${selectedCourse.price}
                    </span>
                    {selectedCourse.originalPrice && (
                      <span className="text-lg text-gray-500 line-through">
                        ${selectedCourse.originalPrice}
                      </span>
                    )}
                  </div>
                )}
              </div>
              <div className="flex gap-3">
                <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
                  Add to Wishlist
                </button>
                {selectedCourse.isEnrolled ? (
                  <button className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2">
                    <PlayCircleIcon className="w-5 h-5" />
                    Continue Learning
                  </button>
                ) : (
                  <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    Enroll Now
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
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
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Courses</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Explore courses from top universities and institutions
        </p>
      </div>

      {/* Top Controls */}
      <div className="mb-6 space-y-4">
        {/* Search and Filter Toggle */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search courses, instructors, or skills..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <FunnelIcon className="w-5 h-5" />
            Filters
            {(selectedSchool !== 'all' || selectedLevel !== 'all' || selectedCertificateType !== 'all' || selectedCategory !== 'all') && (
              <span className="ml-1 px-2 py-0.5 bg-blue-600 text-white text-xs rounded-full">
                Active
              </span>
            )}
          </button>
        </div>

        {/* Filter Options */}
        {showFilters && (
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* School Filter */}
              <div>
                <label className="block text-sm font-medium mb-2">School</label>
                <select
                  value={selectedSchool}
                  onChange={(e) => setSelectedSchool(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                >
                  <option value="all">All Schools</option>
                  {schools.map(school => (
                    <option key={school.id} value={school.name}>{school.name}</option>
                  ))}
                </select>
              </div>

              {/* Level Filter */}
              <div>
                <label className="block text-sm font-medium mb-2">Level</label>
                <select
                  value={selectedLevel}
                  onChange={(e) => setSelectedLevel(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                >
                  <option value="all">All Levels</option>
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                  <option value="Expert">Expert</option>
                </select>
              </div>

              {/* Certificate Type Filter */}
              <div>
                <label className="block text-sm font-medium mb-2">Certificate Type</label>
                <select
                  value={selectedCertificateType}
                  onChange={(e) => setSelectedCertificateType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                >
                  <option value="all">All Types</option>
                  <option value="Course Certificate">Course Certificate</option>
                  <option value="Professional Certificate">Professional Certificate</option>
                  <option value="Specialization">Specialization</option>
                  <option value="Degree">Degree</option>
                  <option value="MicroMasters">MicroMasters</option>
                </select>
              </div>

              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium mb-2">Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                >
                  <option value="all">All Categories</option>
                  <option value="Computer Science">Computer Science</option>
                  <option value="Data Science">Data Science</option>
                  <option value="Business">Business</option>
                  <option value="Engineering">Engineering</option>
                  <option value="Arts & Humanities">Arts & Humanities</option>
                </select>
              </div>
            </div>

            {/* Clear Filters */}
            <div className="flex justify-end">
              <button
                onClick={() => {
                  setSelectedSchool('all');
                  setSelectedLevel('all');
                  setSelectedCertificateType('all');
                  setSelectedCategory('all');
                }}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                Clear all filters
              </button>
            </div>
          </div>
        )}

        {/* View Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-4">
            {/* Enrolled Toggle */}
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showEnrolledOnly}
                onChange={(e) => setShowEnrolledOnly(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <span className="text-sm">Show enrolled courses only</span>
            </label>

            {/* View Mode */}
            <div className="flex items-center gap-2 border border-gray-300 dark:border-gray-600 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded ${viewMode === 'grid' ? 'bg-gray-100 dark:bg-gray-700' : ''}`}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded ${viewMode === 'list' ? 'bg-gray-100 dark:bg-gray-700' : ''}`}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
            >
              <option value="popularity">Most Popular</option>
              <option value="rating">Highest Rated</option>
              <option value="newest">Newest</option>
              <option value="price">Price: Low to High</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="mb-4">
        <p className="text-gray-600 dark:text-gray-400">
          Showing {filteredCourses.length} of {courses.length} courses
        </p>
      </div>

      {/* Course Grid/List */}
      {filteredCourses.length === 0 ? (
        <div className="text-center py-12">
          <BookOpenIcon className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600 dark:text-gray-400">No courses found matching your criteria</p>
        </div>
      ) : (
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
          {filteredCourses.map(course => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      )}

      {/* Course Details Modal */}
      {showCourseDetails && <CourseDetailsModal />}
    </div>
  );
}