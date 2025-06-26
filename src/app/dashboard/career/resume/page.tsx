'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  DocumentTextIcon,
  ArrowDownTrayIcon,
  PencilIcon,
  EyeIcon,
  SparklesIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ShareIcon,
  ClipboardDocumentIcon,
  PrinterIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { ResumeTemplate, ResumeData } from '@/components/career/ResumeTemplate';

interface Resume {
  id: string;
  name: string;
  lastUpdated: string;
  version: number;
  atsScore: number;
  views: number;
  downloads: number;
  isActive: boolean;
  data?: ResumeData;
}

interface ResumeSection {
  section: string;
  score: number;
  feedback: string[];
  improvements: string[];
}

// Sample resume data
const sampleResumeData: ResumeData = {
  personalInfo: {
    name: 'John Doe',
    title: 'Senior Software Engineer',
    email: 'john.doe@email.com',
    phone: '+1 (555) 123-4567',
    location: 'San Francisco, CA',
    linkedin: 'linkedin.com/in/johndoe',
    github: 'github.com/johndoe',
    portfolio: 'johndoe.dev'
  },
  summary: 'Experienced Senior Software Engineer with 8+ years of expertise in building scalable web applications and leading development teams. Proficient in React, Node.js, and cloud technologies. Passionate about creating efficient solutions and mentoring junior developers.',
  experience: [
    {
      company: 'TechCorp Inc.',
      title: 'Senior Software Engineer',
      location: 'San Francisco, CA',
      startDate: 'Jan 2021',
      endDate: 'Present',
      description: 'Lead development of microservices architecture serving 2M+ users daily.',
      achievements: [
        'Reduced API response time by 45% through optimization and caching strategies',
        'Led team of 5 engineers in successful migration to Kubernetes',
        'Implemented CI/CD pipeline reducing deployment time from 2 hours to 15 minutes',
        'Mentored 3 junior developers, all promoted within 18 months'
      ]
    },
    {
      company: 'InnovateSoft',
      title: 'Software Engineer',
      location: 'Austin, TX',
      startDate: 'Jun 2018',
      endDate: 'Dec 2020',
      description: 'Full-stack development for SaaS platform with focus on performance and scalability.',
      achievements: [
        'Built real-time collaboration features used by 50K+ active users',
        'Improved application performance by 60% through code optimization',
        'Developed automated testing suite with 90% code coverage',
        'Created reusable component library adopted across 5 product teams'
      ]
    },
    {
      company: 'StartupXYZ',
      title: 'Junior Developer',
      location: 'Remote',
      startDate: 'Aug 2016',
      endDate: 'May 2018',
      description: 'Full-stack development for early-stage startup in fintech space.',
      achievements: [
        'Developed core payment processing module handling $1M+ transactions',
        'Implemented responsive design increasing mobile conversions by 35%',
        'Built customer dashboard with React and D3.js for data visualization'
      ]
    }
  ],
  education: [
    {
      degree: 'Bachelor of Science in Computer Science',
      school: 'University of California, Berkeley',
      location: 'Berkeley, CA',
      graduationDate: 'May 2016',
      gpa: '3.8/4.0'
    }
  ],
  skills: {
    technical: ['React', 'Node.js', 'TypeScript', 'AWS', 'Docker', 'Kubernetes', 'PostgreSQL', 'MongoDB', 'Redis', 'GraphQL', 'REST APIs', 'Microservices'],
    soft: ['Leadership', 'Team Collaboration', 'Problem Solving', 'Communication', 'Mentoring', 'Agile/Scrum'],
    languages: ['English (Native)', 'Spanish (Conversational)']
  },
  certifications: [
    {
      name: 'AWS Solutions Architect - Associate',
      issuer: 'Amazon Web Services',
      date: 'Mar 2023'
    },
    {
      name: 'Certified Kubernetes Administrator',
      issuer: 'CNCF',
      date: 'Jan 2022'
    }
  ],
  projects: [
    {
      name: 'Open Source Contribution - React Query',
      description: 'Contributed performance improvements and bug fixes to popular data-fetching library',
      technologies: ['React', 'TypeScript', 'Jest'],
      link: 'github.com/tanstack/query'
    },
    {
      name: 'Personal Finance Tracker',
      description: 'Built full-stack application for personal finance management with ML-powered insights',
      technologies: ['Next.js', 'Python', 'TensorFlow', 'PostgreSQL']
    }
  ]
};

export default function CareerResumePage() {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [activeResume, setActiveResume] = useState<Resume | null>(null);
  const [resumeAnalysis, setResumeAnalysis] = useState<ResumeSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'resumes' | 'builder' | 'optimize'>('resumes');
  const [showPreview, setShowPreview] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<'modern' | 'classic' | 'minimal'>('modern');
  const resumeRef = useRef<HTMLDivElement>(null);

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
          isActive: true,
          data: sampleResumeData
        },
        {
          id: '2',
          name: 'Engineering Manager - Leadership Focus',
          lastUpdated: '2025-06-01',
          version: 2,
          atsScore: 87,
          views: 23,
          downloads: 5,
          isActive: false,
          data: { ...sampleResumeData, personalInfo: { ...sampleResumeData.personalInfo, title: 'Engineering Manager' }}
        },
        {
          id: '3',
          name: 'Full Stack Developer - Startup',
          lastUpdated: '2025-05-20',
          version: 1,
          atsScore: 78,
          views: 15,
          downloads: 3,
          isActive: false,
          data: { ...sampleResumeData, personalInfo: { ...sampleResumeData.personalInfo, title: 'Full Stack Developer' }}
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

  const handleDownloadPDF = () => {
    if (!activeResume?.data) return;

    // Create a new window with the resume content
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    // Get the template styles
    const getTemplateStyles = () => {
      switch (selectedTemplate) {
        case 'modern':
          return `
            .resume-container { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
            .resume-header { background: linear-gradient(to right, #2563eb, #1e40af); color: white; padding: 2rem; }
            .section-title { color: #2563eb; border-bottom: 2px solid #dbeafe; padding-bottom: 0.5rem; margin-bottom: 0.75rem; }
          `;
        case 'classic':
          return `
            .resume-container { font-family: Georgia, serif; }
            .resume-header { border-bottom: 4px solid #1f2937; padding-bottom: 1.5rem; margin-bottom: 1.5rem; }
            .section-title { color: #1f2937; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 1px solid #d1d5db; }
          `;
        case 'minimal':
          return `
            .resume-container { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
            .resume-header { margin-bottom: 2rem; }
            .section-title { color: #111827; font-weight: 500; margin-bottom: 0.75rem; }
          `;
      }
    };

    // Write the HTML content
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${activeResume.name}</title>
          <meta charset="utf-8">
          <style>
            @page { margin: 0.5in; }
            * { box-sizing: border-box; margin: 0; padding: 0; }
            body { 
              font-size: 11pt; 
              line-height: 1.5; 
              color: #1f2937;
              background: white;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            ${getTemplateStyles()}
            .resume-container { max-width: 8.5in; margin: 0 auto; background: white; }
            h1 { font-size: 24pt; margin-bottom: 0.5rem; }
            h2 { font-size: 14pt; margin-bottom: 0.75rem; font-weight: bold; }
            h3 { font-size: 12pt; margin-bottom: 0.25rem; font-weight: 600; }
            p { margin-bottom: 0.5rem; }
            ul { margin-left: 1.25rem; }
            li { margin-bottom: 0.25rem; }
            .section { margin-bottom: 1.5rem; }
            .job-header { display: flex; justify-content: space-between; align-items: flex-start; }
            .text-sm { font-size: 10pt; }
            .text-gray { color: #6b7280; }
            .mb-2 { margin-bottom: 0.5rem; }
            .mb-3 { margin-bottom: 0.75rem; }
            .mb-4 { margin-bottom: 1rem; }
            @media print {
              body { margin: 0; }
              .resume-container { page-break-inside: avoid; }
              .section { page-break-inside: avoid; }
            }
          </style>
        </head>
        <body>
          <div class="resume-container">
            ${generateResumeHTML(activeResume.data, selectedTemplate)}
          </div>
        </body>
      </html>
    `);

    printWindow.document.close();
    
    // Wait for content to load then print
    printWindow.onload = () => {
      printWindow.focus();
      printWindow.print();
    };
  };

  const generateResumeHTML = (data: ResumeData, template: string) => {
    const headerClass = template === 'modern' ? 'resume-header' : '';
    
    return `
      <div class="${headerClass}">
        <h1>${data.personalInfo.name}</h1>
        <p style="font-size: 16pt; margin-bottom: 0.5rem;">${data.personalInfo.title}</p>
        <p class="text-sm">
          ${data.personalInfo.email} • ${data.personalInfo.phone} • ${data.personalInfo.location}
          ${data.personalInfo.linkedin ? ` • ${data.personalInfo.linkedin}` : ''}
          ${data.personalInfo.github ? ` • ${data.personalInfo.github}` : ''}
        </p>
      </div>

      <div style="padding: ${template === 'modern' ? '2rem' : '0'};">
        <div class="section">
          <h2 class="section-title">Professional Summary</h2>
          <p>${data.summary}</p>
        </div>

        <div class="section">
          <h2 class="section-title">Professional Experience</h2>
          ${data.experience.map(job => `
            <div class="mb-4">
              <div class="job-header">
                <div>
                  <h3>${job.title}</h3>
                  <p class="text-gray">${job.company} • ${job.location}</p>
                </div>
                <p class="text-sm text-gray">${job.startDate} - ${job.endDate}</p>
              </div>
              <p class="mb-2">${job.description}</p>
              <ul>
                ${job.achievements.map(achievement => `<li>${achievement}</li>`).join('')}
              </ul>
            </div>
          `).join('')}
        </div>

        <div class="section">
          <h2 class="section-title">Education</h2>
          ${data.education.map(edu => `
            <div class="mb-3">
              <div class="job-header">
                <div>
                  <h3>${edu.degree}</h3>
                  <p class="text-gray">${edu.school} • ${edu.location}</p>
                </div>
                <p class="text-sm text-gray">${edu.graduationDate}</p>
              </div>
              ${edu.gpa ? `<p class="text-sm text-gray">GPA: ${edu.gpa}</p>` : ''}
            </div>
          `).join('')}
        </div>

        <div class="section">
          <h2 class="section-title">Skills</h2>
          <div>
            <p><strong>Technical Skills:</strong> ${data.skills.technical.join(', ')}</p>
            <p><strong>Soft Skills:</strong> ${data.skills.soft.join(', ')}</p>
            ${data.skills.languages ? `<p><strong>Languages:</strong> ${data.skills.languages.join(', ')}</p>` : ''}
          </div>
        </div>

        ${data.certifications && data.certifications.length > 0 ? `
          <div class="section">
            <h2 class="section-title">Certifications</h2>
            ${data.certifications.map(cert => `
              <p>${cert.name} • ${cert.issuer} • ${cert.date}</p>
            `).join('')}
          </div>
        ` : ''}

        ${data.projects && data.projects.length > 0 ? `
          <div class="section">
            <h2 class="section-title">Key Projects</h2>
            ${data.projects.map(project => `
              <div class="mb-3">
                <h3>${project.name}</h3>
                <p>${project.description}</p>
                <p class="text-sm text-gray">Technologies: ${project.technologies.join(', ')}</p>
              </div>
            `).join('')}
          </div>
        ` : ''}
      </div>
    `;
  };

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
                      <ArrowDownTrayIcon className="w-4 h-4 mr-1" />
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
                  <button 
                    className="flex-1 px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
                    onClick={(e) => {
                      e.stopPropagation();
                      // Edit functionality
                    }}
                  >
                    <PencilIcon className="w-4 h-4 inline mr-1" />
                    Edit
                  </button>
                  <button 
                    className="flex-1 px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowPreview(true);
                    }}
                  >
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
                <button 
                  onClick={handleDownloadPDF}
                  className="flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <ArrowDownTrayIcon className="w-5 h-5 mr-2" />
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

      {/* Resume Preview Modal */}
      {showPreview && activeResume?.data && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                Resume Preview
              </h3>
              <div className="flex items-center gap-4">
                <select
                  value={selectedTemplate}
                  onChange={(e) => setSelectedTemplate(e.target.value as any)}
                  className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-sm"
                >
                  <option value="modern">Modern</option>
                  <option value="classic">Classic</option>
                  <option value="minimal">Minimal</option>
                </select>
                <button
                  onClick={handleDownloadPDF}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors flex items-center"
                >
                  <PrinterIcon className="w-5 h-5 mr-2" />
                  Print/PDF
                </button>
                <button
                  onClick={() => setShowPreview(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>
            </div>
            <div className="overflow-y-auto max-h-[calc(90vh-80px)] p-8 bg-gray-50 dark:bg-gray-800" ref={resumeRef}>
              <ResumeTemplate data={activeResume.data} template={selectedTemplate} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}