'use client';

import React, { useState, useEffect } from 'react';
import { 
  BriefcaseIcon, 
  MapPinIcon, 
  CurrencyDollarIcon,
  ClockIcon,
  StarIcon,
  BuildingOfficeIcon,
  AdjustmentsHorizontalIcon,
  MagnifyingGlassIcon,
  BookmarkIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid, BookmarkIcon as BookmarkIconSolid } from '@heroicons/react/24/solid';

interface JobOpportunity {
  id: string;
  title: string;
  company: string;
  location: string;
  salary: {
    min: number;
    max: number;
  };
  type: 'Full-time' | 'Part-time' | 'Contract' | 'Remote';
  experience: string;
  posted: string;
  matchScore: number;
  skills: string[];
  description: string;
  benefits: string[];
  isSaved: boolean;
}

export default function CareerOpportunitiesPage() {
  const [opportunities, setOpportunities] = useState<JobOpportunity[]>([]);
  const [filteredOpportunities, setFilteredOpportunities] = useState<JobOpportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    type: 'all',
    minSalary: 0,
    location: 'all',
    matchScore: 0
  });

  useEffect(() => {
    const fetchOpportunities = async () => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const jobs: JobOpportunity[] = [
        {
          id: '1',
          title: 'Senior Software Engineer',
          company: 'TechCorp Inc.',
          location: 'San Francisco, CA',
          salary: { min: 150000, max: 200000 },
          type: 'Full-time',
          experience: '5+ years',
          posted: '2 days ago',
          matchScore: 92,
          skills: ['React', 'Node.js', 'AWS', 'TypeScript'],
          description: 'We are looking for a Senior Software Engineer to join our growing team...',
          benefits: ['Health Insurance', '401k Match', 'Remote Work', 'Stock Options'],
          isSaved: false
        },
        {
          id: '2',
          title: 'Engineering Manager',
          company: 'InnovateTech',
          location: 'Remote',
          salary: { min: 180000, max: 230000 },
          type: 'Remote',
          experience: '7+ years',
          posted: '1 week ago',
          matchScore: 87,
          skills: ['Leadership', 'Agile', 'System Design', 'Team Management'],
          description: 'Lead a team of talented engineers in building next-generation products...',
          benefits: ['Unlimited PTO', 'Health & Wellness', 'Learning Budget', 'Home Office Setup'],
          isSaved: true
        },
        {
          id: '3',
          title: 'Full Stack Developer',
          company: 'StartupXYZ',
          location: 'Austin, TX',
          salary: { min: 120000, max: 150000 },
          type: 'Full-time',
          experience: '3+ years',
          posted: '3 days ago',
          matchScore: 85,
          skills: ['React', 'Python', 'PostgreSQL', 'Docker'],
          description: 'Join our fast-paced startup as a Full Stack Developer...',
          benefits: ['Equity', 'Flexible Hours', 'Health Insurance', 'Gym Membership'],
          isSaved: false
        },
        {
          id: '4',
          title: 'DevOps Engineer',
          company: 'CloudSystems',
          location: 'Seattle, WA',
          salary: { min: 140000, max: 180000 },
          type: 'Full-time',
          experience: '4+ years',
          posted: '5 days ago',
          matchScore: 78,
          skills: ['Kubernetes', 'CI/CD', 'AWS', 'Terraform'],
          description: 'We need a DevOps Engineer to help scale our infrastructure...',
          benefits: ['Health Insurance', 'Stock Options', 'Conference Budget', 'Parental Leave'],
          isSaved: false
        },
        {
          id: '5',
          title: 'Technical Lead',
          company: 'FinTech Solutions',
          location: 'New York, NY',
          salary: { min: 170000, max: 210000 },
          type: 'Full-time',
          experience: '6+ years',
          posted: '1 day ago',
          matchScore: 90,
          skills: ['Java', 'Microservices', 'Spring Boot', 'Leadership'],
          description: 'Lead technical initiatives for our core banking platform...',
          benefits: ['Bonus', 'Health Insurance', 'Transit Benefits', 'Professional Development'],
          isSaved: true
        }
      ];
      setOpportunities(jobs);
      setFilteredOpportunities(jobs);
      setLoading(false);
    };

    fetchOpportunities();
  }, []);

  useEffect(() => {
    let filtered = opportunities;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(job => 
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Type filter
    if (filters.type !== 'all') {
      filtered = filtered.filter(job => job.type === filters.type);
    }

    // Salary filter
    if (filters.minSalary > 0) {
      filtered = filtered.filter(job => job.salary.min >= filters.minSalary);
    }

    // Location filter
    if (filters.location !== 'all') {
      filtered = filtered.filter(job => 
        filters.location === 'remote' ? job.type === 'Remote' : job.location.includes(filters.location)
      );
    }

    // Match score filter
    if (filters.matchScore > 0) {
      filtered = filtered.filter(job => job.matchScore >= filters.matchScore);
    }

    setFilteredOpportunities(filtered);
  }, [searchTerm, filters, opportunities]);

  const toggleSaveJob = (jobId: string) => {
    setOpportunities(prev => 
      prev.map(job => 
        job.id === jobId ? { ...job, isSaved: !job.isSaved } : job
      )
    );
  };

  const formatSalary = (min: number, max: number) => {
    const format = (val: number) => `$${(val / 1000).toFixed(0)}k`;
    return `${format(min)} - ${format(max)}`;
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
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Career Opportunities</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Find your next perfect role</p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search Bar */}
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by job title, company, or skills..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                         focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Filter Button */}
          <button className="flex items-center px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600">
            <AdjustmentsHorizontalIcon className="w-5 h-5 mr-2" />
            Filters
          </button>
        </div>

        {/* Quick Filters */}
        <div className="mt-4 flex flex-wrap gap-2">
          <select 
            className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm"
            value={filters.type}
            onChange={(e) => setFilters({...filters, type: e.target.value})}
          >
            <option value="all">All Types</option>
            <option value="Full-time">Full-time</option>
            <option value="Remote">Remote</option>
            <option value="Contract">Contract</option>
          </select>

          <select 
            className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm"
            value={filters.minSalary}
            onChange={(e) => setFilters({...filters, minSalary: Number(e.target.value)})}
          >
            <option value="0">Any Salary</option>
            <option value="100000">$100k+</option>
            <option value="150000">$150k+</option>
            <option value="200000">$200k+</option>
          </select>

          <select 
            className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm"
            value={filters.matchScore}
            onChange={(e) => setFilters({...filters, matchScore: Number(e.target.value)})}
          >
            <option value="0">Any Match</option>
            <option value="70">70%+ Match</option>
            <option value="80">80%+ Match</option>
            <option value="90">90%+ Match</option>
          </select>
        </div>
      </div>

      {/* Results Summary */}
      <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
        Showing {filteredOpportunities.length} opportunities
      </div>

      {/* Job Listings */}
      <div className="space-y-4">
        {filteredOpportunities.map((job) => (
          <div key={job.id} className="bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition-shadow p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {job.title}
                  </h3>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    job.matchScore >= 90 ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                    job.matchScore >= 80 ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400' :
                    'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                  }`}>
                    {job.matchScore}% Match
                  </span>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                  <span className="flex items-center">
                    <BuildingOfficeIcon className="w-4 h-4 mr-1" />
                    {job.company}
                  </span>
                  <span className="flex items-center">
                    <MapPinIcon className="w-4 h-4 mr-1" />
                    {job.location}
                  </span>
                  <span className="flex items-center">
                    <ClockIcon className="w-4 h-4 mr-1" />
                    {job.posted}
                  </span>
                </div>
              </div>
              <button 
                onClick={() => toggleSaveJob(job.id)}
                className="text-gray-400 hover:text-blue-600 transition-colors"
              >
                {job.isSaved ? (
                  <BookmarkIconSolid className="w-6 h-6 text-blue-600" />
                ) : (
                  <BookmarkIcon className="w-6 h-6" />
                )}
              </button>
            </div>

            <div className="mb-4">
              <p className="text-gray-700 dark:text-gray-300 line-clamp-2">
                {job.description}
              </p>
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              {job.skills.map((skill, index) => (
                <span 
                  key={index}
                  className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm rounded-lg"
                >
                  {skill}
                </span>
              ))}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-4 text-sm">
                <span className="flex items-center font-medium text-gray-900 dark:text-white">
                  <CurrencyDollarIcon className="w-4 h-4 mr-1" />
                  {formatSalary(job.salary.min, job.salary.max)}
                </span>
                <span className="text-gray-600 dark:text-gray-400">
                  {job.experience}
                </span>
                <span className="px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 rounded text-xs">
                  {job.type}
                </span>
              </div>
              <div className="flex gap-2">
                <button className="px-4 py-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors">
                  View Details
                </button>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  Apply Now
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Load More */}
      {filteredOpportunities.length > 0 && (
        <div className="mt-8 text-center">
          <button className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            Load More Opportunities
          </button>
        </div>
      )}
    </div>
  );
}