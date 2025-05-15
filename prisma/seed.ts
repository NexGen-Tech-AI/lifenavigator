import { PrismaClient } from '@prisma/client';
import { hash } from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create a demo user
  const demoUserPassword = await hash('password123', 10);
  
  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@lifenavigator.com' },
    update: {},
    create: {
      email: 'demo@lifenavigator.com',
      name: 'Demo User',
      password: demoUserPassword,
      settings: {
        create: {
          theme: 'system',
          currency: 'USD',
          notificationsEnabled: true,
        },
      },
    },
  });
  
  console.log('Created demo user:', demoUser.id);
  
  // Add financial data
  const financialRecord = await prisma.financialRecord.upsert({
    where: {
      id: 'demo-financial-record',
    },
    update: {},
    create: {
      id: 'demo-financial-record',
      userId: demoUser.id,
      totalNetWorth: 127492,
      totalAssets: 152824,
      totalLiabilities: 25332,
    },
  });
  
  console.log('Created financial record:', financialRecord.id);
  
  // Add a budget
  const budget = await prisma.budget.upsert({
    where: {
      id: 'demo-budget',
    },
    update: {},
    create: {
      id: 'demo-budget',
      userId: demoUser.id,
      name: 'Monthly Budget',
      totalBudget: 4000,
      startDate: new Date('2025-05-01'),
      endDate: new Date('2025-05-31'),
      isActive: true,
      categories: {
        create: [
          { name: 'Housing', allocated: 1500, spent: 1500 },
          { name: 'Groceries', allocated: 600, spent: 450 },
          { name: 'Transportation', allocated: 400, spent: 350 },
          { name: 'Entertainment', allocated: 300, spent: 275 },
          { name: 'Dining Out', allocated: 400, spent: 320 },
          { name: 'Savings', allocated: 500, spent: 500 },
          { name: 'Utilities', allocated: 300, spent: 280 },
        ],
      },
    },
  });
  
  console.log('Created budget:', budget.id);
  
  // Add investments
  const investments = await Promise.all([
    prisma.investment.upsert({
      where: { id: 'demo-investment-1' },
      update: {},
      create: {
        id: 'demo-investment-1',
        userId: demoUser.id,
        name: 'Total Stock Market ETF',
        type: 'stock',
        value: 45000,
        purchasePrice: 40000,
        purchaseDate: new Date('2023-01-15'),
      },
    }),
    prisma.investment.upsert({
      where: { id: 'demo-investment-2' },
      update: {},
      create: {
        id: 'demo-investment-2',
        userId: demoUser.id,
        name: 'International Stock ETF',
        type: 'stock',
        value: 25000,
        purchasePrice: 24000,
        purchaseDate: new Date('2023-02-20'),
      },
    }),
    prisma.investment.upsert({
      where: { id: 'demo-investment-3' },
      update: {},
      create: {
        id: 'demo-investment-3',
        userId: demoUser.id,
        name: 'Bond ETF',
        type: 'bond',
        value: 15000,
        purchasePrice: 15500,
        purchaseDate: new Date('2023-03-10'),
      },
    }),
  ]);
  
  console.log('Created investments:', investments.length);
  
  // Add career data
  const careerRecord = await prisma.careerRecord.upsert({
    where: { id: 'demo-career-record' },
    update: {},
    create: {
      id: 'demo-career-record',
      userId: demoUser.id,
      currentRole: 'Senior Software Engineer',
      company: 'Tech Solutions Inc.',
      industry: 'Software Development',
      yearsExperience: 8,
      salaryRange: '$120,000 - $150,000',
      skills: {
        create: [
          { name: 'JavaScript', proficiency: 5, yearsExperience: 8 },
          { name: 'TypeScript', proficiency: 5, yearsExperience: 5 },
          { name: 'React', proficiency: 5, yearsExperience: 6 },
          { name: 'Node.js', proficiency: 4, yearsExperience: 6 },
          { name: 'Python', proficiency: 3, yearsExperience: 3 },
          { name: 'AWS', proficiency: 4, yearsExperience: 4 },
          { name: 'Docker', proficiency: 4, yearsExperience: 3 },
        ],
      },
      jobApplications: {
        create: [
          {
            company: 'Innovate Tech',
            role: 'Lead Developer',
            appliedDate: new Date('2025-04-10'),
            status: 'interview',
            notes: 'Second interview scheduled for May 15',
          },
          {
            company: 'Global Solutions',
            role: 'Senior Full Stack Developer',
            appliedDate: new Date('2025-04-05'),
            status: 'applied',
            notes: 'Waiting for response',
          },
        ],
      },
      networkingEvents: {
        create: [
          {
            name: 'Tech Conference 2025',
            date: new Date('2025-07-15'),
            location: 'San Francisco, CA',
            description: 'Annual tech conference with networking opportunities',
          },
          {
            name: 'Local Meetup',
            date: new Date('2025-05-20'),
            location: 'Downtown Tech Hub',
            description: 'Monthly tech meetup for local developers',
          },
        ],
      },
    },
  });
  
  console.log('Created career record:', careerRecord.id);
  
  // Add education data
  const educationRecord = await prisma.educationRecord.upsert({
    where: { id: 'demo-education-record' },
    update: {},
    create: {
      id: 'demo-education-record',
      userId: demoUser.id,
      highestDegree: 'Bachelor of Science',
      fieldOfStudy: 'Computer Science',
      institution: 'State University',
      courses: {
        create: [
          {
            name: 'Advanced Machine Learning',
            provider: 'Coursera',
            startDate: new Date('2025-03-01'),
            status: 'in_progress',
            notes: 'Working on final project',
          },
          {
            name: 'Cloud Architecture',
            provider: 'AWS Training',
            startDate: new Date('2025-02-15'),
            endDate: new Date('2025-04-01'),
            status: 'completed',
            grade: 'A',
          },
        ],
      },
      certifications: {
        create: [
          {
            name: 'AWS Certified Solutions Architect',
            issuer: 'Amazon Web Services',
            issueDate: new Date('2024-12-10'),
            expirationDate: new Date('2027-12-10'),
            credentialId: 'AWS-123456',
          },
          {
            name: 'Professional Scrum Master',
            issuer: 'Scrum.org',
            issueDate: new Date('2024-08-15'),
            credentialId: 'PSM-987654',
          },
        ],
      },
    },
  });
  
  console.log('Created education record:', educationRecord.id);
  
  // Add health data
  const healthRecord = await prisma.healthRecord.upsert({
    where: { id: 'demo-health-record' },
    update: {},
    create: {
      id: 'demo-health-record',
      userId: demoUser.id,
      height: 180, // cm
      weight: 75, // kg
      bloodType: 'A+',
      vitalSigns: {
        create: [
          {
            type: 'blood_pressure',
            value: '120/80',
            unit: 'mmHg',
            recordedAt: new Date('2025-05-01'),
          },
          {
            type: 'heart_rate',
            value: '68',
            unit: 'bpm',
            recordedAt: new Date('2025-05-01'),
          },
          {
            type: 'weight',
            value: '75',
            unit: 'kg',
            recordedAt: new Date('2025-05-01'),
          },
        ],
      },
      appointments: {
        create: [
          {
            doctor: 'Dr. Smith',
            specialty: 'Primary Care',
            date: new Date('2025-06-15'),
            reason: 'Annual physical',
          },
          {
            doctor: 'Dr. Johnson',
            specialty: 'Dentist',
            date: new Date('2025-07-01'),
            reason: 'Teeth cleaning',
          },
        ],
      },
    },
  });
  
  console.log('Created health record:', healthRecord.id);
  
  // Add roadmap
  const roadmap = await prisma.roadmap.upsert({
    where: { id: 'demo-roadmap' },
    update: {},
    create: {
      id: 'demo-roadmap',
      userId: demoUser.id,
      title: 'Financial Independence Plan',
      description: 'Steps to achieve financial independence within 10 years',
      domain: 'financial',
      status: 'active',
      milestones: {
        create: [
          {
            title: 'Establish emergency fund',
            description: 'Save 6 months of expenses in a high-yield savings account',
            targetDate: new Date('2025-08-01'),
            status: 'in_progress',
            priority: 1,
          },
          {
            title: 'Max out retirement accounts',
            description: 'Contribute maximum allowed to 401(k) and IRA',
            targetDate: new Date('2025-12-31'),
            status: 'not_started',
            priority: 2,
          },
          {
            title: 'Pay off student loans',
            description: 'Eliminate all student loan debt',
            targetDate: new Date('2026-06-30'),
            status: 'not_started',
            priority: 3,
          },
        ],
      },
    },
  });
  
  console.log('Created roadmap:', roadmap.id);
  
  console.log('Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });