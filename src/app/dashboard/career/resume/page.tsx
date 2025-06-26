'use client';

import React, { useState, useEffect } from 'react';
import {
  DocumentTextIcon,
  DownloadIcon,
  PencilIcon,
  EyeIcon,
  SparklesIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowUpIcon,
  ShareIcon,
  ClipboardDocumentIcon
} from '@heroicons/react/24/outline';

interface Resume {
  id: string;
  name: string;
  lastUpdated: string;
  version: number;
  atsScore: number;
  views: number;
  downloads: number;
  isActive: boolean;
}

interface ResumeSection {
  section: string;
  score: number;
  feedback: string[];
  improvements: string[];
}

export default function CareerResumePage() {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [activeResume, setActiveResume] = useState<Resume | null>(null);
  const [resumeAnalysis, setResumeAnalysis] = useState<ResumeSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'resumes' | 'builder' | 'optimize'>('resumes');

  useEffect(() => {
    const fetchResumeData = async () => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const resumeList: Resume[] = [
        {
          id: '1',
          name: 'Senior Software Engineer - General',
          lastUpdated: '2025-06-15',
          version: 3,
          atsScore: 92,
          views: 45,
          downloads: 12,
          isActive: true
        },
        {
          id: '2',
          name: 'Engineering Manager - Leadership Focus',
          lastUpdated: '2025-06-01',
          version: 2,
          atsScore: 87,
          views: 23,
          downloads: 5,
          isActive: false
        },
        {
          id: '3',
          name: 'Full Stack Developer - Startup',
          lastUpdated: '2025-05-20',
          version: 1,
          atsScore: 78,
          views: 15,
          downloads: 3,
          isActive: false
        }
      ];

      const analysis: ResumeSection[] = [
        {
          section: 'Professional Summary',
          score: 90,
          feedback: [
            'Strong opening statement with quantifiable achievements',
            'Clear career objective aligned with target roles'
          ],
          improvements: [
            'Consider adding more industry-specific keywords'
          ]
        },
        {
          section: 'Work Experience',
          score: 95,
          feedback: [
            'Excellent use of action verbs',
            'Quantified achievements with metrics',
            'Clear progression in responsibilities'
          ],
          improvements: []
        },
        {
          section: 'Skills',
          score: 85,
          feedback: [
            'Good mix of technical and soft skills',
            'Skills match job market demands'
          ],
          improvements: [
            'Add more emerging technologies',
            'Group skills by category for better readability'
          ]
        },
        {
          section: 'Education & Certifications',
          score: 88,
          feedback: [
            'Relevant certifications included',
            'Education properly formatted'
          ],
          improvements: [
            'Consider adding completion dates for certifications'
          ]
        },
        {
          section: 'Keywords & ATS',
          score: 92,
          feedback: [
            'High keyword density for target roles',
            'ATS-friendly formatting'
          ],
          improvements: [
            'Add more industry-specific acronyms'
          ]
        }
      ];

      setResumes(resumeList);
      setActiveResume(resumeList[0]);
      setResumeAnalysis(analysis);
      setLoading(false);
    };

    fetchResumeData();
  }, []);

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/20';
    if (score >= 80) return 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/20';
    if (score >= 70) return 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/20';
    return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/20';
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
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Resume Management</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Create, optimize, and manage your professional resumes</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('resumes')}
            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'resumes'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
            }`}
          >
            My Resumes
          </button>
          <button
            onClick={() => setActiveTab('builder')}
            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'builder'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
            }`}
          >
            Resume Builder
          </button>
          <button
            onClick={() => setActiveTab('optimize')}
            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'optimize'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
            }`}
          >
            Optimize & Analyze
          </button>
        </nav>
      </div>

      {/* My Resumes Tab */}
      {activeTab === 'resumes' && (
        <div>
          {/* Resume List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {resumes.map((resume) => (
              <div
                key={resume.id}
                className={`bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition-shadow p-6 cursor-pointer ${
                  activeResume?.id === resume.id ? 'ring-2 ring-blue-500' : ''
                }`}
                onClick={() => setActiveResume(resume)}
              >
                <div className="flex items-start justify-between mb-4">
                  <DocumentTextIcon className="w-8 h-8 text-blue-500" />
                  {resume.isActive && (
                    <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 rounded-full">
                      Active
                    </span>
                  )}
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  {resume.name}
                </h3>
                <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <p>Version {resume.version} • Updated {new Date(resume.lastUpdated).toLocaleDateString()}</p>
                  <div className="flex items-center gap-4">
                    <span className="flex items-center">
                      <EyeIcon className="w-4 h-4 mr-1" />
                      {resume.views}
                    </span>
                    <span className="flex items-center">
                      <DownloadIcon className="w-4 h-4 mr-1" />
                      {resume.downloads}
                    </span>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300">ATS Score</span>
                    <span className={`text-xs font-bold ${
                      resume.atsScore >= 90 ? 'text-green-600 dark:text-green-400' :
                      resume.atsScore >= 80 ? 'text-blue-600 dark:text-blue-400' :
                      'text-yellow-600 dark:text-yellow-400'
                    }`}>
                      {resume.atsScore}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        resume.atsScore >= 90 ? 'bg-green-500' :
                        resume.atsScore >= 80 ? 'bg-blue-500' :
                        'bg-yellow-500'
                      }`}
                      style={{ width: `${resume.atsScore}%` }}
                    ></div>
                  </div>
                </div>
                <div className="mt-4 flex gap-2">
                  <button className="flex-1 px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600">
                    <PencilIcon className="w-4 h-4 inline mr-1" />
                    Edit
                  </button>
                  <button className="flex-1 px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700">
                    <EyeIcon className="w-4 h-4 inline mr-1" />
                    View
                  </button>
                </div>
              </div>
            ))}

            {/* Add New Resume Card */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
              <DocumentTextIcon className="w-12 h-12 text-gray-400 mb-4" />
              <p className="text-gray-600 dark:text-gray-400 font-medium">Create New Resume</p>
            </div>
          </div>

          {/* Resume Actions */}
          {activeResume && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Resume Actions
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <button className="flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  <DownloadIcon className="w-5 h-5 mr-2" />
                  Download PDF
                </button>
                <button className="flex items-center justify-center px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                  <ShareIcon className="w-5 h-5 mr-2" />
                  Share Link
                </button>
                <button className="flex items-center justify-center px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                  <ClipboardDocumentIcon className="w-5 h-5 mr-2" />
                  Duplicate
                </button>
                <button className="flex items-center justify-center px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
                  <SparklesIcon className="w-5 h-5 mr-2" />
                  AI Enhance
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Resume Builder Tab */}
      {activeTab === 'builder' && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8">
          <div className="text-center py-12">
            <DocumentTextIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
              Resume Builder Coming Soon
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
              Our AI-powered resume builder will help you create professional resumes tailored to your target roles.
            </p>
            <div className="flex justify-center gap-4">
              <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                Get Notified
              </button>
              <button className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                Import Resume
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Optimize & Analyze Tab */}
      {activeTab === 'optimize' && activeResume && (
        <div>
          {/* Overall Score */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl shadow-lg p-8 mb-8 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold mb-2">Resume Analysis</h2>
                <p className="text-blue-100">{activeResume.name}</p>
              </div>
              <div className="text-center">
                <div className="text-5xl font-bold">{activeResume.atsScore}</div>
                <p className="text-blue-100 mt-1">ATS Score</p>
              </div>
            </div>
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white/20 rounded-lg p-4">
                <p className="text-blue-100 text-sm">Keyword Match</p>
                <p className="text-2xl font-bold">87%</p>
              </div>
              <div className="bg-white/20 rounded-lg p-4">
                <p className="text-blue-100 text-sm">Readability</p>
                <p className="text-2xl font-bold">94%</p>
              </div>
              <div className="bg-white/20 rounded-lg p-4">
                <p className="text-blue-100 text-sm">Impact Score</p>
                <p className="text-2xl font-bold">91%</p>
              </div>
            </div>
          </div>

          {/* Section Analysis */}
          <div className="space-y-6">
            {resumeAnalysis.map((section, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {section.section}
                  </h3>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getScoreColor(section.score)}`}>
                    {section.score}%
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Strengths */}
                  <div>
                    <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center">
                      <CheckCircleIcon className="w-5 h-5 text-green-500 mr-2" />
                      Strengths
                    </h4>
                    <ul className="space-y-2">
                      {section.feedback.map((item, i) => (
                        <li key={i} className="text-sm text-gray-600 dark:text-gray-400 flex items-start">
                          <span className="text-green-500 mr-2">•</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Improvements */}
                  {section.improvements.length > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center">
                        <ExclamationTriangleIcon className="w-5 h-5 text-yellow-500 mr-2" />
                        Suggested Improvements
                      </h4>
                      <ul className="space-y-2">
                        {section.improvements.map((item, i) => (
                          <li key={i} className="text-sm text-gray-600 dark:text-gray-400 flex items-start">
                            <span className="text-yellow-500 mr-2">•</span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex justify-center gap-4">
            <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center">
              <SparklesIcon className="w-5 h-5 mr-2" />
              Apply AI Suggestions
            </button>
            <button className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              Re-analyze
            </button>
          </div>
        </div>
      )}
    </div>
  );
}