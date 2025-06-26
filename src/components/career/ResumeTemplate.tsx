'use client';

import React from 'react';

export interface ResumeData {
  personalInfo: {
    name: string;
    title: string;
    email: string;
    phone: string;
    location: string;
    linkedin?: string;
    github?: string;
    portfolio?: string;
  };
  summary: string;
  experience: Array<{
    company: string;
    title: string;
    location: string;
    startDate: string;
    endDate: string;
    description: string;
    achievements: string[];
  }>;
  education: Array<{
    degree: string;
    school: string;
    location: string;
    graduationDate: string;
    gpa?: string;
  }>;
  skills: {
    technical: string[];
    soft: string[];
    languages?: string[];
  };
  certifications?: Array<{
    name: string;
    issuer: string;
    date: string;
  }>;
  projects?: Array<{
    name: string;
    description: string;
    technologies: string[];
    link?: string;
  }>;
}

interface ResumeTemplateProps {
  data: ResumeData;
  template?: 'modern' | 'classic' | 'minimal';
}

export const ResumeTemplate: React.FC<ResumeTemplateProps> = ({ data, template = 'modern' }) => {
  const getTemplateStyles = () => {
    switch (template) {
      case 'modern':
        return {
          container: 'bg-white text-gray-900 font-sans',
          header: 'bg-gradient-to-r from-blue-600 to-blue-800 text-white p-8',
          section: 'mb-6',
          sectionTitle: 'text-xl font-bold text-blue-700 border-b-2 border-blue-200 pb-2 mb-3',
          text: 'text-gray-700'
        };
      case 'classic':
        return {
          container: 'bg-white text-gray-900 font-serif',
          header: 'border-b-4 border-gray-800 pb-6 mb-6',
          section: 'mb-6',
          sectionTitle: 'text-lg font-bold text-gray-800 uppercase tracking-wide border-b border-gray-300 pb-2 mb-3',
          text: 'text-gray-700'
        };
      case 'minimal':
        return {
          container: 'bg-white text-gray-800 font-sans',
          header: 'mb-8',
          section: 'mb-6',
          sectionTitle: 'text-lg font-medium text-gray-900 mb-3',
          text: 'text-gray-600'
        };
      default:
        return {
          container: 'bg-white text-gray-900',
          header: 'mb-6',
          section: 'mb-6',
          sectionTitle: 'text-xl font-bold mb-3',
          text: 'text-gray-700'
        };
    }
  };

  const styles = getTemplateStyles();

  return (
    <div id="resume-content" className={`${styles.container} p-8 max-w-4xl mx-auto shadow-lg`}>
      {/* Header */}
      <header className={styles.header}>
        <h1 className={`text-3xl font-bold ${template === 'modern' ? '' : 'text-gray-900'}`}>
          {data.personalInfo.name}
        </h1>
        <p className={`text-xl mt-2 ${template === 'modern' ? 'text-blue-100' : 'text-gray-600'}`}>
          {data.personalInfo.title}
        </p>
        <div className={`mt-4 flex flex-wrap gap-4 text-sm ${template === 'modern' ? 'text-blue-100' : 'text-gray-600'}`}>
          <span>{data.personalInfo.email}</span>
          <span>{data.personalInfo.phone}</span>
          <span>{data.personalInfo.location}</span>
          {data.personalInfo.linkedin && (
            <span>{data.personalInfo.linkedin}</span>
          )}
          {data.personalInfo.github && (
            <span>{data.personalInfo.github}</span>
          )}
        </div>
      </header>

      {/* Summary */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Professional Summary</h2>
        <p className={styles.text}>{data.summary}</p>
      </section>

      {/* Experience */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Professional Experience</h2>
        {data.experience.map((job, index) => (
          <div key={index} className="mb-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-lg">{job.title}</h3>
                <p className="text-gray-600">{job.company} • {job.location}</p>
              </div>
              <p className="text-gray-500 text-sm">
                {job.startDate} - {job.endDate}
              </p>
            </div>
            <p className={`mt-2 ${styles.text}`}>{job.description}</p>
            <ul className="mt-2 list-disc list-inside">
              {job.achievements.map((achievement, i) => (
                <li key={i} className={styles.text}>{achievement}</li>
              ))}
            </ul>
          </div>
        ))}
      </section>

      {/* Education */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Education</h2>
        {data.education.map((edu, index) => (
          <div key={index} className="mb-3">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold">{edu.degree}</h3>
                <p className="text-gray-600">{edu.school} • {edu.location}</p>
              </div>
              <p className="text-gray-500 text-sm">{edu.graduationDate}</p>
            </div>
            {edu.gpa && <p className="text-gray-600 text-sm">GPA: {edu.gpa}</p>}
          </div>
        ))}
      </section>

      {/* Skills */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Skills</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="font-semibold mb-2">Technical Skills</h3>
            <p className={styles.text}>{data.skills.technical.join(', ')}</p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Soft Skills</h3>
            <p className={styles.text}>{data.skills.soft.join(', ')}</p>
          </div>
        </div>
        {data.skills.languages && data.skills.languages.length > 0 && (
          <div className="mt-3">
            <h3 className="font-semibold mb-2">Languages</h3>
            <p className={styles.text}>{data.skills.languages.join(', ')}</p>
          </div>
        )}
      </section>

      {/* Certifications */}
      {data.certifications && data.certifications.length > 0 && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Certifications</h2>
          {data.certifications.map((cert, index) => (
            <div key={index} className="mb-2">
              <span className="font-semibold">{cert.name}</span>
              <span className="text-gray-600"> • {cert.issuer} • {cert.date}</span>
            </div>
          ))}
        </section>
      )}

      {/* Projects */}
      {data.projects && data.projects.length > 0 && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Key Projects</h2>
          {data.projects.map((project, index) => (
            <div key={index} className="mb-3">
              <h3 className="font-semibold">{project.name}</h3>
              <p className={styles.text}>{project.description}</p>
              <p className="text-gray-600 text-sm mt-1">
                Technologies: {project.technologies.join(', ')}
              </p>
            </div>
          ))}
        </section>
      )}
    </div>
  );
};