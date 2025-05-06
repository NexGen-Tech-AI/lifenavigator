/**
 * Career domain type definitions
 */

export type CareerRecord = {
  id: string;
  userId: string;
  currentRole: string | null;
  company: string | null;
  industry: string | null;
  yearsExperience: number | null;
  salaryRange: string | null;
  createdAt: Date;
  updatedAt: Date;
  skills?: Skill[];
  jobApplications?: JobApplication[];
  networkingEvents?: NetworkingEvent[];
};

export type Skill = {
  id: string;
  careerRecordId: string;
  name: string;
  proficiency: number; // 1-5 scale
  yearsExperience: number | null;
  createdAt: Date;
  updatedAt: Date;
};

export type JobApplication = {
  id: string;
  careerRecordId: string;
  company: string;
  role: string;
  appliedDate: Date;
  status: 'applied' | 'interview' | 'rejected' | 'accepted';
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type NetworkingEvent = {
  id: string;
  careerRecordId: string;
  name: string;
  date: Date;
  location: string | null;
  description: string | null;
  outcome: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type CareerOverview = {
  currentRole: string | null;
  company: string | null;
  industry: string | null;
  topSkills: Skill[];
  recentApplications: JobApplication[];
  upcomingEvents: NetworkingEvent[];
};

export type CareerInsight = {
  id: string;
  title: string;
  description: string;
  domain: 'skills' | 'job-search' | 'networking' | 'general';
  impact: 'positive' | 'negative' | 'neutral';
  priority: 'high' | 'medium' | 'low';
  createdAt: Date;
};

export type JobRecommendation = {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  matchScore: number;
  url: string;
  salaryRange: string | null;
  createdAt: Date;
};