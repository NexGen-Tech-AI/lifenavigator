import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/NextAuth';
import { InterviewPrepResource } from '@/types/career';

// Mock interview preparation data by job title
const mockInterviewPrep: Record<string, InterviewPrepResource> = {
  // Software Engineer interview prep
  'software engineer': {
    jobTitle: 'Software Engineer',
    overview: 'Software Engineer interviews typically assess your technical skills, problem-solving abilities, and cultural fit. Expect coding challenges, system design questions, and behavioral interviews. Focus on demonstrating your programming skills, knowledge of data structures and algorithms, and your ability to work collaboratively.',
    keySkills: [
      'Problem-solving',
      'Data structures and algorithms',
      'System design',
      'Programming languages (JavaScript, Python, Java, etc.)',
      'Version control (Git)',
      'Testing methodologies',
      'Communication skills'
    ],
    questions: [
      {
        question: 'How would you explain a complex technical concept to a non-technical stakeholder?',
        answer: 'When explaining technical concepts to non-technical stakeholders, I focus on the business value and use analogies they can relate to. For example, when explaining an API, I might compare it to a waiter in a restaurant who takes your order, delivers it to the kitchen, and brings back your food - facilitating communication between different systems without exposing the complexity of how it is prepared.',
        tips: 'Use a real example from your experience if possible. Demonstrate your communication skills by being clear and concise in your answer.'
      },
      {
        question: 'Describe a challenging bug you had to fix. How did you approach the problem?',
        answer: 'I once encountered a memory leak in a web application that only appeared in production under heavy load. I approached it methodically: first reproducing the issue in a controlled environment, then using memory profiling tools to identify the source. I discovered we were storing large user session objects that were not being properly cleaned up. By implementing a session timeout mechanism and restructuring how we stored session data, we resolved the issue and improved overall application performance.',
        tips: 'Follow the STAR method (Situation, Task, Action, Result) and emphasize your debugging process rather than just the solution.'
      },
      {
        question: 'How do you keep your technical skills up-to-date?',
        answer: 'I stay current through a combination of hands-on projects, online courses, and community involvement. I dedicate time each week to learning new technologies or deepening my knowledge of existing ones. I follow industry blogs and newsletters, participate in coding challenges, and contribute to open-source projects. I also attend virtual meetups and conferences when possible to learn from peers and industry experts.',
        tips: 'Mention specific resources you use (blogs, courses, etc.) and any new technologies you have recently learned to demonstrate your commitment to growth.'
      },
      {
        question: 'What is your experience with testing and how do you ensure code quality?',
        answer: 'I believe testing is essential for maintaining code quality. I practice test-driven development when appropriate, writing unit tests before implementing features. I aim for high test coverage of critical paths and business logic. Beyond automated testing, I use static analysis tools, conduct code reviews, and follow consistent style guides. I have implemented CI/CD pipelines that run tests automatically before code is merged, preventing regressions and ensuring quality standards are maintained.',
        tips: 'Discuss both automated testing and other quality assurance practices you follow, with specific examples from your experience.'
      },
      {
        question: 'Explain how you would design a scalable web application architecture.',
        answer: 'For a scalable web application, I would implement a microservices architecture with clearly defined service boundaries based on business domains. The frontend would be a responsive, progressively enhanced SPA using React or Vue.js. For the backend, I would use stateless services deployed in containers for horizontal scaling, with load balancing to distribute traffic. Data storage would use a combination of relational databases for transactional data and NoSQL for high-throughput needs, with caching layers for frequently accessed data. I would implement message queues for asynchronous processing and build a comprehensive monitoring system using tools like Prometheus and Grafana to identify bottlenecks early.',
        tips: 'Tailor your answer to show knowledge of modern architectural patterns and considerations like scalability, resilience, and maintainability.'
      }
    ],
    resources: [
      {
        title: 'Cracking the Coding Interview',
        description: 'Essential book for technical interview preparation with common algorithms and data structure questions.',
        url: 'https://www.crackingthecodinginterview.com/'
      },
      {
        title: 'LeetCode',
        description: 'Platform for practicing coding problems commonly asked in technical interviews.',
        url: 'https://leetcode.com/'
      },
      {
        title: 'System Design Primer',
        description: 'GitHub repository with resources for learning about system design concepts and preparing for system design interviews.',
        url: 'https://github.com/donnemartin/system-design-primer'
      }
    ],
    checklist: [
      'Review company tech stack and recent projects',
      'Practice coding problems on LeetCode or HackerRank',
      'Prepare examples of past projects and challenges overcome',
      'Review system design fundamentals',
      'Prepare questions to ask the interviewer',
      'Test your webcam and audio if interviewing remotely',
      'Bring copies of your resume and portfolio to in-person interviews'
    ]
  },
  
  // Product Manager interview prep
  'product manager': {
    jobTitle: 'Product Manager',
    overview: 'Product Manager interviews evaluate your ability to understand user needs, define product strategy, and work cross-functionally with engineering, design, and business teams. You will need to demonstrate analytical thinking, market awareness, and strong communication skills. Be prepared to discuss product cases, metrics, and your approach to product development.',
    keySkills: [
      'User empathy and customer focus',
      'Strategic thinking',
      'Data analysis and metrics',
      'Cross-functional collaboration',
      'Communication and stakeholder management',
      'Prioritization and roadmap planning',
      'Technical understanding'
    ],
    questions: [
      {
        question: 'How do you prioritize features for your product roadmap?',
        answer: 'I use a framework that balances impact, effort, risk, and strategic alignment. First, I gather inputs from user research, customer feedback, market trends, and business goals. Then I evaluate each potential feature using a scoring system that considers estimated value to users, revenue potential, strategic alignment, and implementation complexity. For the final prioritization, I collaborate with engineering to understand technical dependencies and constraints. This creates a roadmap that maximizes value while maintaining a sustainable pace of delivery.',
        tips: 'Reference a specific framework (like RICE or Impact/Effort) and emphasize the collaborative nature of prioritization.'
      },
      {
        question: 'Tell me about a time when you had to make a difficult product decision based on conflicting feedback.',
        answer: 'When redesigning a checkout flow, we received conflicting feedback between user testing results and business stakeholders. Users preferred a streamlined, single-page checkout, while the marketing team wanted to collect additional data points. I organized a workshop bringing together stakeholders to understand underlying needs, then proposed a compromise: a streamlined primary flow with optional, incentivized data collection. We A/B tested the solution, finding that it increased conversion by 12% while still capturing valuable customer data from 65% of users who opted to provide additional information.',
        tips: 'Show how you balance user needs with business requirements and use data to validate decisions.'
      },
      {
        question: 'What metrics would you use to measure the success of a feature?',
        answer: 'I believe in defining both leading and lagging indicators before launching features. For example, when implementing a new recommendation system, I would track immediate engagement metrics like click-through rate on recommendations (leading indicator), but also monitor longer-term metrics like repeat purchases and lifetime value (lagging indicators). I also distinguish between guardrail metrics that ensure we are not negatively impacting the core experience (like overall conversion rate) and success metrics that demonstrate the specific feature impact. For any significant feature, I create a measurement plan during the planning phase, not after launch.',
        tips: 'Demonstrate understanding of different types of metrics and how they relate to business outcomes.'
      },
      {
        question: 'How do you incorporate user feedback into your product development process?',
        answer: 'I use a multi-channel approach to gathering and synthesizing user feedback. This includes analyzing support tickets, conducting user interviews, reviewing app store ratings, running usability tests, and analyzing behavioral data. I categorize feedback into immediate issues, feature requests, and sentiment signals. For critical issues, we implement quick fixes through our bug-squashing sprint cycles. For feature requests, I aggregate and analyze patterns to inform roadmap planning. I also believe in closing the feedback loop by communicating back to users when their input has led to changes, either through release notes, direct communication, or in-product notifications.',
        tips: 'Emphasize both quantitative and qualitative methods, and how you validate feedback before acting on it.'
      },
      {
        question: 'Describe how you would approach a product launch from start to finish.',
        answer: 'My product launch approach is comprehensive and collaborative. Starting with clear objectives and success metrics, I develop a detailed launch plan with input from engineering, marketing, sales, and customer support. I establish a phased rollout strategy, beginning with alpha testing with internal users, then beta testing with a segment of customers, gathering feedback at each stage. I ensure proper documentation, training materials, and FAQs are ready for both internal teams and customers. The go-to-market strategy includes coordinated marketing campaigns, sales enablement, and support team preparation. Post-launch, I institute a monitoring period to track metrics against goals, capture feedback, and quickly address any issues.',
        tips: 'Show that you consider all aspects of a launch beyond just shipping the feature, including go-to-market strategy and post-launch analysis.'
      }
    ],
    resources: [
      {
        title: 'Cracking the PM Interview',
        description: 'Comprehensive guide to product management interviews with case studies and frameworks.',
        url: 'https://www.crackingthepminterview.com/'
      },
      {
        title: 'Product School Resources',
        description: 'Collection of articles, webinars, and tools for product management professionals.',
        url: 'https://productschool.com/resources/'
      },
      {
        title: 'Mind the Product',
        description: 'Blog and community with insights on product management practices and trends.',
        url: 'https://www.mindtheproduct.com/'
      }
    ],
    checklist: [
      'Research the company products, competitors, and market position',
      'Prepare your product case studies using the STAR method',
      'Practice product sense and analytical questions',
      'Review metrics and KPIs relevant to the company business model',
      'Prepare examples of cross-functional collaboration',
      'Review your product management methodology and frameworks',
      'Prepare thoughtful questions for the interviewer'
    ]
  },
  
  // Default interview prep for any job
  'default': {
    jobTitle: 'Professional',
    overview: 'Job interviews typically evaluate your skills, experience, cultural fit, and potential for growth. Prepare to discuss your background, achievements, and how your abilities align with the role and company. Research the organization beforehand and prepare thoughtful questions to demonstrate your interest and engagement.',
    keySkills: [
      'Communication and interpersonal skills',
      'Problem-solving abilities',
      'Adaptability and learning agility',
      'Teamwork and collaboration',
      'Time management and organization',
      'Technical skills relevant to the position',
      'Industry knowledge'
    ],
    questions: [
      {
        question: 'Tell me about yourself.',
        answer: 'I am a [your profession] with [X years] of experience specializing in [your area of expertise]. I have worked with [types of companies/projects], where I have developed strong skills in [relevant skills]. In my recent role at [current/last company], I [significant achievement with metrics if possible]. I am particularly passionate about [relevant interest], which is why I am excited about this opportunity with your company. I believe my background in [relevant experience] combined with my skills in [key skills] make me a strong fit for this position.',
        tips: 'Keep this concise (1-2 minutes) and relevant to the job. Focus on professional background and highlight achievements rather than just listing job duties.'
      },
      {
        question: 'What are your greatest strengths?',
        answer: 'One of my key strengths is [strength most relevant to the role], which has helped me [specific example of how you have used this strength successfully]. I am also particularly strong at [second strength], demonstrated when I [brief example]. Additionally, I have received consistent feedback about my ability to [third strength], such as when [specific situation]. I believe these strengths would be particularly valuable in this role because [connect to job requirements].',
        tips: 'Choose strengths that are relevant to the position and provide concrete examples that demonstrate each strength in action.'
      },
      {
        question: 'What is your greatest weakness?',
        answer: 'I have sometimes struggled with [honest weakness that is not critical to the role]. For example, [brief situation illustrating this weakness]. Recognizing this area for improvement, I have taken specific steps to address it by [actions you have taken to improve]. These efforts have already resulted in [positive outcome or progress]. I continue to work on this by [ongoing improvement strategy].',
        tips: 'Choose a genuine weakness, but one that will not disqualify you. Focus more on the steps you have taken to improve rather than the weakness itself.'
      },
      {
        question: 'Why are you interested in this position?',
        answer: 'I am excited about this position because it aligns perfectly with my professional interests and skills in [relevant areas]. I have been following [company name] and am impressed by [specific company achievements or values that resonate with you]. The opportunity to [specific aspect of the role] is particularly appealing because [why it interests you]. Additionally, I believe my experience with [relevant experience] would allow me to make meaningful contributions to your team, especially in [specific area where you could add value].',
        tips: 'Show that you have researched the company and understand the role. Connect your background to specific aspects of the position and company mission.'
      },
      {
        question: 'Where do you see yourself in five years?',
        answer: 'In five years, I aim to have developed deep expertise in [relevant area to the role], having made significant contributions to [type of projects/goals]. I am looking for a role where I can grow professionally, take on increasing responsibility, and continue to develop my skills in [areas relevant to the company future]. I am particularly interested in eventually moving toward [logical career progression] while remaining focused on [industry or specialized area]. What attracts me to [company name] is how this aligns with the growth trajectory and opportunities I understand exist here.',
        tips: 'Show ambition while being realistic. Demonstrate that you understand the career path for the role and are committed to the field, but focus on growth rather than specific titles.'
      }
    ],
    resources: [
      {
        title: 'Big Interview',
        description: 'Practice interview tool with customized interview practice and expert video coaching.',
        url: 'https://biginterview.com/'
      },
      {
        title: 'Indeed Career Guide',
        description: 'Comprehensive resource for job seekers with interview tips, resume guidance, and career advice.',
        url: 'https://www.indeed.com/career-advice'
      },
      {
        title: 'Glassdoor Interview Questions',
        description: 'Database of real interview questions from thousands of companies, shared by job candidates.',
        url: 'https://www.glassdoor.com/Interview/index.htm'
      }
    ],
    checklist: [
      'Research the company (mission, products/services, culture, recent news)',
      'Review the job description and match your experience to requirements',
      'Prepare examples using the STAR method (Situation, Task, Action, Result)',
      'Practice answering common interview questions out loud',
      'Prepare thoughtful questions to ask the interviewer',
      'Plan your outfit and test technology if interviewing remotely',
      'Bring copies of your resume and prepare references'
    ]
  }
};

/**
 * GET /api/career/interview-prep
 * Get interview preparation resources for a specific job title
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
    const jobTitle = searchParams.get('jobTitle')?.toLowerCase() || '';
    
    if (!jobTitle) {
      return NextResponse.json(
        { error: 'Job title is required' },
        { status: 400 }
      );
    }
    
    // Find the best match for the requested job title
    // First try exact match, then partial match, then default
    let resources: InterviewPrepResource;
    
    if (mockInterviewPrep[jobTitle]) {
      resources = mockInterviewPrep[jobTitle];
    } else {
      // Try to find a partial match
      const partialMatches = Object.keys(mockInterviewPrep).filter(key => 
        key !== 'default' && jobTitle.includes(key)
      );
      
      if (partialMatches.length > 0) {
        // Use the first partial match
        resources = mockInterviewPrep[partialMatches[0]];
      } else {
        // Use default if no matches
        resources = mockInterviewPrep['default'];
        
        // Set the jobTitle to the requested one
        resources = {
          ...resources,
          jobTitle: jobTitle.charAt(0).toUpperCase() + jobTitle.slice(1)
        };
      }
    }
    
    return NextResponse.json(resources);
  } catch (error) {
    console.error('Error fetching interview prep resources:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching interview prep resources' },
      { status: 500 }
    );
  }
}