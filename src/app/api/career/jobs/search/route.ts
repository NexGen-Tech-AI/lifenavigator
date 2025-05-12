import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/NextAuth';
import { JobListing, JobSearchResult } from '@/types/career';

// Mock job listings data
const mockJobs: JobListing[] = [
  {
    id: '1',
    title: 'Senior Frontend Developer',
    company: 'TechCorp Inc.',
    location: 'San Francisco, CA (Remote)',
    description: 'We are looking for a skilled Senior Frontend Developer to join our growing team. You will be responsible for building user interfaces, implementing new features, and optimizing web applications.',
    salary: '$120,000 - $160,000',
    posted: '2 days ago',
    jobType: 'full-time',
    tags: ['React', 'TypeScript', 'CSS', 'Frontend'],
    applicants: 42,
    matchPercentage: 92,
  },
  {
    id: '2',
    title: 'Full Stack Engineer',
    company: 'Innovative Solutions',
    location: 'New York, NY',
    description: 'Join our team as a Full Stack Engineer to work on challenging projects across our technology stack. You will contribute to both frontend and backend development.',
    salary: '$110,000 - $145,000',
    posted: '1 week ago',
    jobType: 'full-time',
    tags: ['JavaScript', 'Node.js', 'React', 'MongoDB'],
    applicants: 78,
    matchPercentage: 88,
  },
  {
    id: '3',
    title: 'UI/UX Designer',
    company: 'Creative Designs Co.',
    location: 'Remote',
    description: 'We are seeking a talented UI/UX Designer to create beautiful and functional user interfaces for our products. You should have a strong portfolio and experience with modern design tools.',
    salary: '$90,000 - $120,000',
    posted: '3 days ago',
    jobType: 'full-time',
    tags: ['UI', 'UX', 'Figma', 'Adobe XD'],
    applicants: 36,
    matchPercentage: 75,
  },
  {
    id: '4',
    title: 'React Native Developer',
    company: 'Mobile Apps Inc.',
    location: 'Austin, TX (Hybrid)',
    description: 'Looking for a React Native Developer to build cross-platform mobile applications. You will work on features, fix bugs, and help define our mobile strategy.',
    salary: '$100,000 - $130,000',
    posted: '5 days ago',
    jobType: 'full-time',
    tags: ['React Native', 'JavaScript', 'Mobile', 'iOS', 'Android'],
    applicants: 31,
    matchPercentage: 85,
  },
  {
    id: '5',
    title: 'DevOps Engineer',
    company: 'CloudTech Solutions',
    location: 'Chicago, IL (Remote)',
    description: 'Join our DevOps team to build and maintain our infrastructure. You will work with cloud platforms, containerization, and automation tools.',
    salary: '$115,000 - $150,000',
    posted: '1 day ago',
    jobType: 'full-time',
    tags: ['AWS', 'Docker', 'Kubernetes', 'CI/CD'],
    applicants: 25,
    matchPercentage: 78,
  },
  {
    id: '6',
    title: 'Frontend Developer (Contract)',
    company: 'Project Solutions LLC',
    location: 'Remote',
    description: '6-month contract for a Frontend Developer to work on a specific client project. Possibility of extension or conversion to full-time.',
    salary: '$70/hr',
    posted: '2 weeks ago',
    jobType: 'contract',
    tags: ['JavaScript', 'React', 'CSS', 'HTML'],
    applicants: 52,
    matchPercentage: 82,
  },
  {
    id: '7',
    title: 'Data Scientist',
    company: 'Analytics Pro',
    location: 'Seattle, WA',
    description: 'Seeking a Data Scientist to join our team. You will analyze large datasets, build machine learning models, and generate actionable insights for our clients.',
    salary: '$125,000 - $165,000',
    posted: '3 days ago',
    jobType: 'full-time',
    tags: ['Python', 'Machine Learning', 'SQL', 'Data Analysis'],
    applicants: 64,
    matchPercentage: 70,
  },
  {
    id: '8',
    title: 'Backend Engineer',
    company: 'Server Solutions',
    location: 'Boston, MA (Hybrid)',
    description: 'Backend Engineer needed to build and maintain our API services. You should have experience with server-side languages and database design.',
    salary: '$105,000 - $140,000',
    posted: '1 week ago',
    jobType: 'full-time',
    tags: ['Node.js', 'Express', 'MongoDB', 'API Development'],
    applicants: 47,
    matchPercentage: 79,
  },
  {
    id: '9',
    title: 'Product Manager',
    company: 'Product Innovations',
    location: 'San Francisco, CA',
    description: 'We are looking for a Product Manager to lead the development of new features and products. You will work closely with design, engineering, and marketing teams.',
    salary: '$130,000 - $170,000',
    posted: '4 days ago',
    jobType: 'full-time',
    tags: ['Product Management', 'Agile', 'User Research'],
    applicants: 93,
    matchPercentage: 65,
  },
  {
    id: '10',
    title: 'QA Engineer',
    company: 'Quality First Inc.',
    location: 'Denver, CO (Remote)',
    description: 'Join our QA team to ensure the quality of our software products. You will design and execute test plans, identify bugs, and work with developers to resolve issues.',
    salary: '$90,000 - $120,000',
    posted: '2 days ago',
    jobType: 'full-time',
    tags: ['QA', 'Test Automation', 'Selenium', 'JIRA'],
    applicants: 29,
    matchPercentage: 73,
  },
  {
    id: '11',
    title: 'Technical Writer',
    company: 'Documentation Pro',
    location: 'Remote',
    description: 'Looking for a Technical Writer to create clear and concise documentation for our software products. You will work with engineers to understand complex features and translate them into user-friendly guides.',
    salary: '$80,000 - $110,000',
    posted: '1 week ago',
    jobType: 'full-time',
    tags: ['Technical Writing', 'Documentation', 'Markdown'],
    applicants: 18,
    matchPercentage: 68,
  },
  {
    id: '12',
    title: 'Junior Web Developer',
    company: 'StartX Digital',
    location: 'Portland, OR',
    description: 'Great opportunity for a Junior Web Developer to join our team. You will work on web applications and learn from experienced developers.',
    salary: '$70,000 - $90,000',
    posted: '3 days ago',
    jobType: 'full-time',
    tags: ['HTML', 'CSS', 'JavaScript', 'Entry Level'],
    applicants: 105,
    matchPercentage: 80,
  },
  {
    id: '13',
    title: 'Software Engineer (Part-time)',
    company: 'Flexible Solutions',
    location: 'Remote',
    description: 'Part-time opportunity for a Software Engineer to work 20-30 hours per week. Flexible schedule with possibility to increase hours in the future.',
    salary: '$50/hr',
    posted: '5 days ago',
    jobType: 'part-time',
    tags: ['JavaScript', 'Python', 'Flexible Hours'],
    applicants: 41,
    matchPercentage: 76,
  },
  {
    id: '14',
    title: 'Machine Learning Engineer',
    company: 'AI Innovations',
    location: 'San Jose, CA',
    description: 'Join our team as a Machine Learning Engineer to build and deploy ML models. You will work on cutting-edge AI applications and collaborate with research scientists.',
    salary: '$130,000 - $180,000',
    posted: '2 weeks ago',
    jobType: 'full-time',
    tags: ['Machine Learning', 'Python', 'TensorFlow', 'PyTorch'],
    applicants: 87,
    matchPercentage: 67,
  },
  {
    id: '15',
    title: 'Senior Project Manager',
    company: 'Project Excellence',
    location: 'Chicago, IL (Hybrid)',
    description: 'Seeking an experienced Project Manager to lead complex software development projects. You will manage timelines, resources, and stakeholder communication.',
    salary: '$120,000 - $150,000',
    posted: '3 days ago',
    jobType: 'full-time',
    tags: ['Project Management', 'Agile', 'JIRA', 'Leadership'],
    applicants: 56,
    matchPercentage: 71,
  },
];

/**
 * GET /api/career/jobs/search
 * Search for job listings based on provided criteria
 */
export async function GET(request: Request) {
  try {
    // Get the authenticated user
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }
    
    // Get URL parameters
    const { searchParams } = new URL(request.url);
    const keywords = searchParams.get('keywords') || '';
    const location = searchParams.get('location') || '';
    const jobType = searchParams.get('jobType') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    
    // Set up pagination
    const offset = (page - 1) * limit;
    
    // Filter jobs based on search criteria
    let filteredJobs = [...mockJobs];
    
    if (keywords) {
      const keywordsLower = keywords.toLowerCase();
      filteredJobs = filteredJobs.filter(job => 
        job.title.toLowerCase().includes(keywordsLower) ||
        job.company.toLowerCase().includes(keywordsLower) ||
        job.description.toLowerCase().includes(keywordsLower) ||
        job.tags.some(tag => tag.toLowerCase().includes(keywordsLower))
      );
    }
    
    if (location) {
      const locationLower = location.toLowerCase();
      filteredJobs = filteredJobs.filter(job => 
        job.location.toLowerCase().includes(locationLower)
      );
    }
    
    if (jobType && jobType !== 'any') {
      filteredJobs = filteredJobs.filter(job => 
        job.jobType === jobType
      );
    }
    
    // Get the total count of filtered results
    const total = filteredJobs.length;
    
    // Paginate results
    const paginatedJobs = filteredJobs.slice(offset, offset + limit);
    
    // Create the response object
    const response: JobSearchResult = {
      jobs: paginatedJobs,
      total,
      page
    };
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error searching jobs:', error);
    return NextResponse.json(
      { error: 'An error occurred while searching for jobs' },
      { status: 500 }
    );
  }
}